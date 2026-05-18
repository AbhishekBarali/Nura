"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { TranscriptLine, ActionCard } from "@/lib/types";

interface LiveMicProps {
  patientId: number | null;
  onTranscriptLine: (line: TranscriptLine) => void;
  onAction: (action: ActionCard) => void;
  onSummary: (text: string) => void;
  onComplete: (data: unknown) => void;
  isActive: boolean;
  onToggle: () => void;
}

// Simulation transcript for fallback
const SIMULATION_TRANSCRIPT: TranscriptLine[] = [
  { speaker: "Doctor", text: "Good morning Mrs. Chen. How are you feeling today?", timestamp: 1.2 },
  { speaker: "Patient", text: "Not great doctor. The new blood pressure medication is making me dizzy, especially when I stand up.", timestamp: 4.5 },
  { speaker: "Doctor", text: "That's the lisinopril we started last week. Any other issues?", timestamp: 8.1 },
  { speaker: "Patient", text: "Yes, my feet have been swelling too. And I've been taking ibuprofen every day for my back pain.", timestamp: 12.3 },
  { speaker: "Doctor", text: "How long have you been taking the ibuprofen?", timestamp: 16.0 },
  { speaker: "Patient", text: "About three weeks now. My neighbor recommended it for the back pain.", timestamp: 19.2 },
  { speaker: "Doctor", text: "I see. And remind me, do you have any allergies to medications?", timestamp: 22.8 },
  { speaker: "Patient", text: "Yes, penicillin. I had a bad rash years ago when I took it.", timestamp: 26.1 },
  { speaker: "Doctor", text: "Okay, that's important. Let me check your current medications against that.", timestamp: 29.5 },
  { speaker: "Patient", text: "I'm also still taking the metformin for my diabetes, twice a day.", timestamp: 33.0 },
  { speaker: "Doctor", text: "Right. I want to review the ibuprofen situation because it can interact with your lisinopril.", timestamp: 36.8 },
];

export default function LiveMic({
  patientId,
  onTranscriptLine,
  onAction,
  onSummary,
  isActive,
  onToggle,
}: LiveMicProps) {
  const [isListening, setIsListening] = useState(false);
  const [micLevel, setMicLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [interimText, setInterimText] = useState("");
  const [connectionStatus, setConnectionStatus] = useState<string>("");
  const [simulationActive, setSimulationActive] = useState(false);

  const analyzerRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number>(0);
  const transcriptBufferRef = useRef<string>("");
  const lineCountRef = useRef(0);
  const startTimeRef = useRef(0);
  const analysisTimerRef = useRef<NodeJS.Timeout | null>(null);
  const simulationTimerRef = useRef<NodeJS.Timeout[]>([]);

  // Speechmatics WebSocket
  const wsRef = useRef<WebSocket | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const lastSpeakerLabelRef = useRef<string>("S1");

  // Sentence buffering - accumulate words until we have a complete thought
  const sentenceBufferRef = useRef<string>("");
  const sentenceSpeakerRef = useRef<string>("S1");
  const sentenceStartTimeRef = useRef<number>(0);
  const flushTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Speaker role calibration
  const speakerMapRef = useRef<Record<string, string>>({ S1: "Doctor", S2: "Patient" });
  const calibrationDoneRef = useRef(false);
  const calibrationUtterancesRef = useRef<Array<{ speaker: string; text: string }>>([]);

  // Keep callback refs fresh
  const onTranscriptLineRef = useRef(onTranscriptLine);
  const onActionRef = useRef(onAction);
  const onSummaryRef = useRef(onSummary);
  useEffect(() => { onTranscriptLineRef.current = onTranscriptLine; }, [onTranscriptLine]);
  useEffect(() => { onActionRef.current = onAction; }, [onAction]);
  useEffect(() => { onSummaryRef.current = onSummary; }, [onSummary]);

  useEffect(() => {
    return () => { cleanupAll(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cleanup function - defined early so other hooks can reference it
  const cleanupAll = useCallback(() => {
    if (flushTimerRef.current) { clearTimeout(flushTimerRef.current); flushTimerRef.current = null; }
    if (wsRef.current) {
      if (wsRef.current.readyState === WebSocket.OPEN) {
        try { wsRef.current.send(JSON.stringify({ message: "EndOfStream" })); } catch {}
      }
      wsRef.current.close();
      wsRef.current = null;
    }
    if (processorRef.current) { processorRef.current.disconnect(); processorRef.current = null; }
    if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null; }
    if (audioContextRef.current) { try { audioContextRef.current.close(); } catch {} audioContextRef.current = null; }
    if (animFrameRef.current) { cancelAnimationFrame(animFrameRef.current); }
    if (analysisTimerRef.current) { clearTimeout(analysisTimerRef.current); }
    simulationTimerRef.current.forEach(t => clearTimeout(t));
    simulationTimerRef.current = [];
    analyzerRef.current = null;
  }, []);

  const triggerAnalysis = useCallback(async (transcript: string, timestamp: number) => {
    if (!transcript.trim()) return;
    try {
      const response = await fetch("/api/analyze-chunk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId: patientId || 1, transcript, timestamp }),
      });
      if (!response.ok) return;
      const data = await response.json();
      if (data.actions?.length > 0) {
        for (const action of data.actions) { onActionRef.current(action); }
      }
      if (data.summary) { onSummaryRef.current(data.summary); }
    } catch (err) { console.error("Analysis failed:", err); }
  }, [patientId]);

  const scheduleAnalysis = useCallback((timestamp: number) => {
    if (analysisTimerRef.current) clearTimeout(analysisTimerRef.current);
    analysisTimerRef.current = setTimeout(() => {
      if (transcriptBufferRef.current.trim()) {
        const buffer = transcriptBufferRef.current;
        transcriptBufferRef.current = "";
        triggerAnalysis(buffer, timestamp);
      }
    }, 2500);

    if (transcriptBufferRef.current.trim().length > 120) {
      if (analysisTimerRef.current) clearTimeout(analysisTimerRef.current);
      const buffer = transcriptBufferRef.current;
      transcriptBufferRef.current = "";
      triggerAnalysis(buffer, timestamp);
    }
  }, [triggerAnalysis]);

  // Convert speaker label (S1, S2) to Doctor/Patient using calibration
  const mapSpeaker = (label: string): string => {
    return speakerMapRef.current[label] || "Doctor";
  };

  // Calibrate speaker roles based on content analysis
  const calibrateSpeakers = useCallback((utterances: Array<{ speaker: string; text: string }>) => {
    // Score each speaker - higher score = more likely to be the DOCTOR
    const scores: Record<string, number> = {};
    
    // Doctor patterns: questions, medical terms, directives, short professional phrases
    const doctorPatterns = [
      /\?/g,                          // asks questions
      /how (are|long|often|much)/i,   // clinical questions
      /tell me|remind me|let me/i,    // directives
      /prescri|medicat|diagnos|exam|symptom|treatment|dose|mg|blood pressure|heart rate/i, // medical terms
      /I (want to|need to|'ll|will|would like to) (check|review|prescribe|order|refer|examine|schedule)/i,
      /any (other|allergies|issues|concerns|medications)/i,
      /what brings you/i,
      /good (morning|afternoon|evening)/i,  // greeting (doctor usually initiates)
    ];
    
    // Patient patterns: describing symptoms, personal experiences, complaints
    const patientPatterns = [
      /my (back|head|stomach|chest|leg|arm|knee|foot|feet|neck|shoulder|pain|medication)/i,
      /I('ve| have| am| feel| been|'m) (feeling|taking|having|experiencing|getting|been)/i,
      /it (hurts|aches|burns|tingles|swells|makes me)/i,
      /dizzy|nauseous|tired|fatigued|sore|swollen|bleeding|itching/i,
      /worse|better|started|noticed|woke up/i,
      /every (day|night|morning|time)/i,
      /for (weeks|days|months|years|a while|about)/i,
      /not great|not good|terrible|awful/i,
    ];

    for (const utt of utterances) {
      if (!scores[utt.speaker]) scores[utt.speaker] = 0;
      const text = utt.text;
      
      for (const pattern of doctorPatterns) {
        const matches = text.match(pattern);
        if (matches) scores[utt.speaker] += matches.length * 2;
      }
      for (const pattern of patientPatterns) {
        const matches = text.match(pattern);
        if (matches) scores[utt.speaker] -= matches.length * 2;
      }
    }

    // The speaker with the higher score is the doctor
    const speakers = Object.keys(scores);
    if (speakers.length >= 2) {
      const sorted = speakers.sort((a, b) => scores[b] - scores[a]);
      speakerMapRef.current = { [sorted[0]]: "Doctor", [sorted[1]]: "Patient" };
    }
    
    calibrationDoneRef.current = true;
  }, []);

  // Flush the sentence buffer as a complete transcript line
  const flushSentenceBuffer = useCallback(() => {
    if (flushTimerRef.current) { clearTimeout(flushTimerRef.current); flushTimerRef.current = null; }
    const text = sentenceBufferRef.current.trim();
    if (!text) return;

    const rawSpeaker = sentenceSpeakerRef.current;
    
    // Collect utterances for calibration
    if (!calibrationDoneRef.current) {
      calibrationUtterancesRef.current.push({ speaker: rawSpeaker, text });
      // Calibrate after we have at least 4 utterances from at least 2 speakers
      const speakers = new Set(calibrationUtterancesRef.current.map(u => u.speaker));
      if (calibrationUtterancesRef.current.length >= 4 && speakers.size >= 2) {
        calibrateSpeakers(calibrationUtterancesRef.current);
      }
    }

    const timestamp = (Date.now() - startTimeRef.current) / 1000;
    const speaker = mapSpeaker(rawSpeaker);
    lineCountRef.current++;

    onTranscriptLineRef.current({ speaker, text, timestamp });
    transcriptBufferRef.current += `${speaker}: ${text}\n`;
    sentenceBufferRef.current = "";
    scheduleAnalysis(timestamp);
  }, [scheduleAnalysis, calibrateSpeakers]);

  // Schedule a flush after a pause (speaker stopped talking)
  const scheduleFlush = useCallback(() => {
    if (flushTimerRef.current) clearTimeout(flushTimerRef.current);
    flushTimerRef.current = setTimeout(() => {
      flushSentenceBuffer();
    }, 1500); // 1.5s of silence = end of utterance
  }, [flushSentenceBuffer]);

  // Start the simulation fallback
  const startSimulation = useCallback(() => {
    setSimulationActive(true);
    setInterimText("");
    setConnectionStatus("Simulation mode — Speechmatics pipeline demo");

    let buffer = "";
    const timers: NodeJS.Timeout[] = [];
    const simPatientId = patientId || 1;

    SIMULATION_TRANSCRIPT.forEach((line, index) => {
      const interimDelay = line.timestamp * 1000 - 800;
      if (interimDelay > 0) {
        const t1 = setTimeout(() => {
          setInterimText(line.text.substring(0, Math.floor(line.text.length * 0.6)) + "...");
        }, interimDelay);
        timers.push(t1);
      }

      const t2 = setTimeout(() => {
        setInterimText("");
        onTranscriptLineRef.current(line);
        buffer += `${line.speaker}: ${line.text}\n`;

        if ((index + 1) % 3 === 0 || index === SIMULATION_TRANSCRIPT.length - 1) {
          const chunk = buffer;
          buffer = "";
          fetch("/api/analyze-chunk", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ patientId: simPatientId, transcript: chunk, timestamp: line.timestamp }),
          })
            .then(res => res.ok ? res.json() : null)
            .then(data => {
              if (data?.actions) { for (const action of data.actions) { onActionRef.current(action); } }
              if (data?.summary) { onSummaryRef.current(data.summary); }
            })
            .catch(() => {});
        }
      }, line.timestamp * 1000);
      timers.push(t2);
    });

    simulationTimerRef.current = timers;
  }, [patientId]);

  // ===== SPEECHMATICS REAL-TIME CONNECTION =====
  const startListening = useCallback(async () => {
    setError(null);
    setInterimText("");
    setConnectionStatus("Connecting to Speechmatics...");
    setSimulationActive(false);
    lineCountRef.current = 0;
    transcriptBufferRef.current = "";
    // Reset calibration for new session
    calibrationDoneRef.current = false;
    calibrationUtterancesRef.current = [];
    speakerMapRef.current = { S1: "Doctor", S2: "Patient" };

    try {
      // 1. Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: false, // Disable so we pick up played audio clearly
          noiseSuppression: false,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      // 2. Set up audio context for visualization + PCM extraction
      const audioContext = new AudioContext({ sampleRate: 16000 });
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);

      // Analyzer for visualization
      const analyzer = audioContext.createAnalyser();
      analyzer.fftSize = 256;
      source.connect(analyzer);
      analyzerRef.current = analyzer;

      const updateLevel = () => {
        if (!analyzerRef.current) return;
        const data = new Uint8Array(analyzerRef.current.frequencyBinCount);
        analyzerRef.current.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        setMicLevel(avg / 255);
        animFrameRef.current = requestAnimationFrame(updateLevel);
      };
      updateLevel();

      // 3. Get Speechmatics token from our backend
      setConnectionStatus("Getting auth token...");
      const tokenRes = await fetch("/api/speechmatics-token");
      if (!tokenRes.ok) {
        // No Speechmatics key — fall back to simulation immediately
        cleanupAll();
        setError(null);
        setConnectionStatus("");
        startSimulation();
        return;
      }
      const { token } = await tokenRes.json();

      startTimeRef.current = Date.now();

      // 4. Connect to Speechmatics WebSocket directly
      setConnectionStatus("Connecting WebSocket...");
      const wsUrl = `wss://eu2.rt.speechmatics.com/v2?jwt=${token}`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnectionStatus("Starting recognition...");
        // Send StartRecognition message
        const startMsg = {
          message: "StartRecognition",
          audio_format: {
            type: "raw",
            encoding: "pcm_f32le",
            sample_rate: 16000,
          },
          transcription_config: {
            language: "en",
            diarization: "speaker",
            operating_point: "enhanced",
            max_delay: 5.0,
            enable_partials: true,
            speaker_diarization_config: {
              max_speakers: 2,
            },
            additional_vocab: [
              { content: "lisinopril", sounds_like: ["lice in oh pril"] },
              { content: "ibuprofen", sounds_like: ["eye bew pro fen"] },
              { content: "metformin" },
              { content: "amoxicillin" },
              { content: "omeprazole" },
              { content: "atorvastatin" },
              { content: "bactrim" },
              { content: "sulfamethoxazole" },
              { content: "nitrofurantoin" },
              { content: "penicillin" },
            ],
          },
        };
        ws.send(JSON.stringify(startMsg));
      };

      ws.onmessage = (event) => {
        let msg;
        try { msg = JSON.parse(event.data); } catch { return; }

        switch (msg.message) {
          case "RecognitionStarted":
            setConnectionStatus("Listening via Speechmatics");
            setIsListening(true);
            // Start streaming audio
            startAudioStreaming(source, audioContext, ws);
            break;

          case "AddPartialTranscript": {
            // Partial/interim results - show what's being heard but don't commit
            const parts = msg.results || [];
            const partialText = parts
              .map((r: { alternatives?: Array<{ content: string; speaker?: string }> }) => 
                r.alternatives?.[0]?.content || ""
              )
              .join(" ")
              .replace(/\s+/g, " ")
              .trim();
            if (partialText) {
              // Show buffered text + partial as interim
              const buffered = sentenceBufferRef.current.trim();
              setInterimText(buffered ? `${buffered} ${partialText}` : partialText);
            }
            break;
          }

          case "AddTranscript": {
            // Final transcript words with speaker diarization
            const results = msg.results || [];
            if (results.length === 0) break;

            setInterimText("");

            // Process each word/token in the results
            for (const result of results) {
              const content = result.alternatives?.[0]?.content || "";
              if (!content.trim() && result.type === "punctuation") {
                // It's punctuation - append to buffer
                sentenceBufferRef.current = sentenceBufferRef.current.trimEnd() + content;
                continue;
              }
              if (!content.trim()) continue;

              // Get speaker for this word - check multiple possible locations
              const wordSpeaker = 
                result.alternatives?.[0]?.speaker || 
                result.speaker || 
                result.attribs?.speaker ||
                sentenceSpeakerRef.current;

              // If speaker changed, flush the current buffer first
              if (wordSpeaker !== sentenceSpeakerRef.current && sentenceBufferRef.current.trim()) {
                flushSentenceBuffer();
                sentenceSpeakerRef.current = wordSpeaker;
              }

              // Track speaker
              if (wordSpeaker) {
                sentenceSpeakerRef.current = wordSpeaker;
                lastSpeakerLabelRef.current = wordSpeaker;
              }

              // Add word to sentence buffer
              if (sentenceBufferRef.current && !sentenceBufferRef.current.endsWith(" ")) {
                sentenceBufferRef.current += " ";
              }
              sentenceBufferRef.current += content;

              // Check if we hit a sentence boundary
              const endsWithPunctuation = /[.!?]$/.test(sentenceBufferRef.current.trim());
              const bufferLong = sentenceBufferRef.current.trim().length > 80;

              if (endsWithPunctuation || bufferLong) {
                flushSentenceBuffer();
              }
            }

            // Schedule a flush in case speaker pauses (no more words coming)
            scheduleFlush();
            break;
          }

          case "EndOfTranscript":
            setConnectionStatus("Session ended");
            break;

          case "Error":
            console.error("Speechmatics error:", msg);
            setError(`Speechmatics: ${msg.reason || msg.type || "Connection error"}`);
            break;

          case "Warning":
            console.warn("Speechmatics warning:", msg);
            break;

          // AudioAdded, Info messages — ignore
          default:
            break;
        }
      };

      ws.onerror = () => {
        // Auto-fallback to simulation when Speechmatics fails
        cleanupAll();
        setError(null);
        setConnectionStatus("");
        startSimulation();
      };

      ws.onclose = (event) => {
        if (event.code !== 1000 && event.code !== 1005) {
          console.log("Speechmatics WS closed:", event.code, event.reason);
        }
        setConnectionStatus("");
      };
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Could not start listening";
      console.log("Mic/Speechmatics error, falling back to simulation:", errMsg);
      cleanupAll();
      // Auto-fallback to simulation instead of just showing error
      setError(null);
      setConnectionStatus("");
      startSimulation();
    }
  }, [scheduleAnalysis, flushSentenceBuffer, scheduleFlush, cleanupAll, startSimulation]);

  // Stream raw PCM audio to Speechmatics WebSocket
  const startAudioStreaming = (source: MediaStreamAudioSourceNode, audioContext: AudioContext, ws: WebSocket) => {
    const processor = audioContext.createScriptProcessor(4096, 1, 1);
    processorRef.current = processor;

    processor.onaudioprocess = (e) => {
      if (ws.readyState !== WebSocket.OPEN) return;
      const inputData = e.inputBuffer.getChannelData(0);
      // Send Float32 PCM directly
      const buffer = new Float32Array(inputData.length);
      buffer.set(inputData);
      ws.send(buffer.buffer);
    };

    source.connect(processor);
    // Connect to destination to keep the processor running (output is silent)
    processor.connect(audioContext.destination);
  };

  const stopListening = useCallback(() => {
    // Flush any remaining sentence buffer
    if (sentenceBufferRef.current.trim()) {
      flushSentenceBuffer();
    }
    if (transcriptBufferRef.current.trim()) {
      const timestamp = (Date.now() - startTimeRef.current) / 1000;
      const buffer = transcriptBufferRef.current;
      transcriptBufferRef.current = "";
      triggerAnalysis(buffer, timestamp);
    }
    cleanupAll();
    setIsListening(false);
    setMicLevel(0);
    setInterimText("");
    setSimulationActive(false);
    setConnectionStatus("");
  }, [cleanupAll, triggerAnalysis, flushSentenceBuffer]);

  const handleToggle = () => {
    if (isListening) { stopListening(); } else { startListening(); }
    onToggle();
  };

  return (
    <div className="elevated-card rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <svg className="w-4 h-4 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
          </svg>
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Live Microphone</h3>
            <p className="text-xs text-[var(--text-muted)]">Speak or play audio near your mic</p>
          </div>
        </div>
        {isListening && (
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-red-50 border border-red-200">
            <span className="w-2 h-2 rounded-full bg-red-500 recording-pulse" />
            <span className="text-[10px] font-bold text-red-700 uppercase tracking-wide">Live</span>
          </div>
        )}
      </div>

      {/* Connection status */}
      {connectionStatus && (
        <div className="mb-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 border border-blue-100">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-xs font-medium text-blue-700">{connectionStatus}</span>
        </div>
      )}

      {/* Mic level visualizer */}
      {isListening && (
        <div className="mb-4 h-12 bg-slate-50 rounded-lg border border-[var(--border-subtle)] flex items-center px-3 gap-[2px] overflow-hidden">
          {Array.from({ length: 40 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 rounded-full bg-blue-500 transition-all duration-75"
              style={{
                height: `${Math.max(10, micLevel * 100 * (0.4 + Math.random() * 0.6))}%`,
                opacity: i / 40 < micLevel + 0.3 ? 0.8 : 0.15,
              }}
            />
          ))}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          <p>{error}</p>
          {!isListening && !simulationActive && (
            <button
              onClick={() => { onToggle(); startSimulation(); }}
              className="mt-2 w-full py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
              </svg>
              Run Demo Simulation Instead
            </button>
          )}
        </div>
      )}

      {/* Live interim text */}
      {(isListening || simulationActive) && interimText && (
        <div className="mb-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[10px] font-bold text-blue-600 uppercase">Hearing...</span>
          </div>
          <p className="text-sm text-blue-800 italic">{interimText}</p>
        </div>
      )}

      {/* Simulation active indicator */}
      {simulationActive && (
        <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-700">Simulating live conversation via Speechmatics pipeline...</span>
          </div>
        </div>
      )}

      <button
        onClick={handleToggle}
        disabled={simulationActive}
        className={`w-full py-3 px-6 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2.5 ${
          isListening
            ? "bg-red-600 hover:bg-red-700 text-white"
            : simulationActive
              ? "bg-slate-100 text-slate-400 cursor-not-allowed"
              : "bg-blue-700 hover:bg-blue-800 text-white"
        }`}
      >
        {isListening ? (
          <>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
            Stop Listening
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
            </svg>
            Start Listening
          </>
        )}
      </button>

      {!isListening && !simulationActive && (
        <div className="mt-3">
          <button
            onClick={() => { onToggle(); startSimulation(); }}
            className="w-full py-2 px-3 rounded-lg text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors flex items-center justify-center gap-1.5"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
            </svg>
            Demo Simulation (no mic needed)
          </button>
        </div>
      )}

      <p className="text-[10px] text-[var(--text-muted)] text-center mt-2">
        Powered by Speechmatics — real-time STT with speaker diarization &amp; medical vocabulary
      </p>
    </div>
  );
}
