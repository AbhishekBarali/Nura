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
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number>(0);
  const transcriptBufferRef = useRef<string>("");
  const lineCountRef = useRef(0);
  const startTimeRef = useRef(0);
  const shouldListenRef = useRef(false);
  const analysisTimerRef = useRef<NodeJS.Timeout | null>(null);
  const processedResultsRef = useRef(0);

  // Keep callback refs fresh to avoid stale closures
  const onTranscriptLineRef = useRef(onTranscriptLine);
  const onActionRef = useRef(onAction);
  const onSummaryRef = useRef(onSummary);
  useEffect(() => { onTranscriptLineRef.current = onTranscriptLine; }, [onTranscriptLine]);
  useEffect(() => { onActionRef.current = onAction; }, [onAction]);
  useEffect(() => { onSummaryRef.current = onSummary; }, [onSummary]);

  useEffect(() => {
    return () => { cleanup(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const triggerAnalysis = useCallback(async (transcript: string, timestamp: number) => {
    if (!transcript.trim()) return;
    try {
      const response = await fetch("/api/analyze-chunk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId: patientId || 0, transcript, timestamp }),
      });
      if (!response.ok) {
        console.error("Analysis API error:", response.status);
        return;
      }
      const data = await response.json();
      if (data.actions && data.actions.length > 0) {
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
    }, 2000);

    // Force send if buffer has enough content
    const bufferLen = transcriptBufferRef.current.trim().length;
    if (bufferLen > 100) {
      if (analysisTimerRef.current) clearTimeout(analysisTimerRef.current);
      const buffer = transcriptBufferRef.current;
      transcriptBufferRef.current = "";
      triggerAnalysis(buffer, timestamp);
    }
  }, [triggerAnalysis]);

  const startListening = useCallback(async () => {
    setError(null);
    setInterimText("");
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Speech recognition not supported in this browser. Please use Google Chrome.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
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

      shouldListenRef.current = true;
      processedResultsRef.current = 0;

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      startTimeRef.current = Date.now();

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        // Process all results from where we left off
        for (let i = processedResultsRef.current; i < event.results.length; i++) {
          const result = event.results[i];
          const text = result[0].transcript.trim();
          if (!text) continue;

          if (result.isFinal) {
            // Final result — add to transcript and buffer
            processedResultsRef.current = i + 1;
            setInterimText("");

            const timestamp = (Date.now() - startTimeRef.current) / 1000;
            lineCountRef.current++;

            // Speaker detection: use content-based heuristics
            // Questions, directives, medical terms → Doctor
            // Complaints, "I feel", "I have" → Patient
            const lower = text.toLowerCase();
            const doctorSignals = ["?", "prescribe", "recommend", "let me", "i'd like", "your results", "let's", "we should", "i want to check", "how long", "any other", "tell me"];
            const patientSignals = ["i feel", "i have", "it hurts", "my ", "i've been", "i took", "i take", "i'm getting", "pain in", "for the past"];
            const doctorScore = doctorSignals.filter(s => lower.includes(s)).length;
            const patientScore = patientSignals.filter(s => lower.includes(s)).length;
            const speaker = doctorScore > patientScore ? "Doctor" : patientScore > doctorScore ? "Patient" : (lineCountRef.current % 2 === 1 ? "Doctor" : "Patient");

            onTranscriptLineRef.current({ speaker, text, timestamp });
            transcriptBufferRef.current += `${speaker}: ${text}\n`;
            scheduleAnalysis(timestamp);
          } else {
            // Interim result — show in real-time as the user speaks
            setInterimText(text);
          }
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        if (event.error === "no-speech" || event.error === "aborted") return;
        console.error("Speech recognition error:", event.error);
        if (event.error === "network") {
          setError("Network error. Check your internet connection.");
        } else if (event.error === "not-allowed") {
          setError("Microphone access denied. Please allow microphone permissions.");
        } else {
          setError(`Recognition error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        if (shouldListenRef.current) {
          // Chrome stops recognition after ~60s of silence or periodically
          // Restart immediately
          processedResultsRef.current = 0;
          setTimeout(() => {
            if (shouldListenRef.current && recognitionRef.current) {
              try {
                recognitionRef.current.start();
              } catch {
                // Create fresh instance if restart fails
                setTimeout(() => {
                  if (shouldListenRef.current) {
                    const fresh = new SpeechRecognition();
                    fresh.continuous = true;
                    fresh.interimResults = true;
                    fresh.lang = "en-US";
                    fresh.onresult = recognition.onresult;
                    fresh.onerror = recognition.onerror;
                    fresh.onend = recognition.onend;
                    recognitionRef.current = fresh;
                    try { fresh.start(); } catch { /* give up */ }
                  }
                }, 300);
              }
            }
          }, 100);
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
      setIsListening(true);
    } catch {
      setError("Could not access microphone. Please allow microphone permissions in your browser settings.");
    }
  }, [scheduleAnalysis]);

  const cleanup = useCallback(() => {
    shouldListenRef.current = false;
    if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch {} recognitionRef.current = null; }
    if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null; }
    if (audioContextRef.current) { try { audioContextRef.current.close(); } catch {} audioContextRef.current = null; }
    if (animFrameRef.current) { cancelAnimationFrame(animFrameRef.current); }
    if (analysisTimerRef.current) { clearTimeout(analysisTimerRef.current); }
    analyzerRef.current = null;
  }, []);

  const stopListening = useCallback(() => {
    cleanup();
    setIsListening(false);
    setMicLevel(0);
    setInterimText("");

    // Flush remaining buffer for final analysis
    if (transcriptBufferRef.current.trim()) {
      const timestamp = (Date.now() - startTimeRef.current) / 1000;
      const buffer = transcriptBufferRef.current;
      transcriptBufferRef.current = "";
      triggerAnalysis(buffer, timestamp);
    }
  }, [cleanup, triggerAnalysis]);

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
            <span className="text-[10px] font-bold text-red-700 uppercase tracking-wide">Recording</span>
          </div>
        )}
      </div>

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
          {error}
        </div>
      )}

      {/* Live interim text — shows what's being heard RIGHT NOW */}
      {isListening && interimText && (
        <div className="mb-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[10px] font-bold text-blue-600 uppercase">Hearing...</span>
          </div>
          <p className="text-sm text-blue-800 italic">{interimText}</p>
        </div>
      )}

      <button
        onClick={handleToggle}
        disabled={!patientId}
        className={`w-full py-3 px-6 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2.5 ${
          isListening
            ? "bg-red-600 hover:bg-red-700 text-white"
            : "bg-blue-700 hover:bg-blue-800 text-white disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
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

      {!patientId && (
        <p className="text-xs text-[var(--text-muted)] text-center mt-3">Select a patient first to enable live analysis</p>
      )}
    </div>
  );
}
