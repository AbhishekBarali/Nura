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
  onComplete,
  isActive,
  onToggle,
}: LiveMicProps) {
  const [isListening, setIsListening] = useState(false);
  const [micLevel, setMicLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number>(0);
  const transcriptBufferRef = useRef<string>("");
  const lineCountRef = useRef(0);
  const startTimeRef = useRef(0);
  const analyzeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startListening = useCallback(async () => {
    setError(null);

    // Check browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Speech recognition not supported in this browser. Use Chrome for best results.");
      return;
    }

    try {
      // Get microphone access for visualizer
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Set up audio analyzer for mic level visualization
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyzer = audioContext.createAnalyser();
      analyzer.fftSize = 256;
      source.connect(analyzer);
      analyzerRef.current = analyzer;

      // Animate mic level
      const updateLevel = () => {
        if (!analyzerRef.current) return;
        const data = new Uint8Array(analyzerRef.current.frequencyBinCount);
        analyzerRef.current.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        setMicLevel(avg / 255);
        animFrameRef.current = requestAnimationFrame(updateLevel);
      };
      updateLevel();

      // Set up speech recognition
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      startTimeRef.current = Date.now();

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const result = event.results[event.results.length - 1];
        if (result.isFinal) {
          const text = result[0].transcript.trim();
          if (!text) return;

          const timestamp = (Date.now() - startTimeRef.current) / 1000;
          // Simple heuristic: odd lines are doctor, even are patient
          // In production, Speechmatics diarization handles this
          const speaker = lineCountRef.current % 2 === 0 ? "Doctor" : "Patient";
          lineCountRef.current++;

          const line: TranscriptLine = { speaker, text, timestamp };
          onTranscriptLine(line);

          // Buffer transcript for analysis
          transcriptBufferRef.current += `${speaker}: ${text}\n`;

          // Analyze every 2 lines
          if (lineCountRef.current % 2 === 0) {
            triggerAnalysis(transcriptBufferRef.current, timestamp);
            transcriptBufferRef.current = "";
          }
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        if (event.error !== "no-speech") {
          setError(`Recognition error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        // Auto-restart if still supposed to be listening
        if (isListening && recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch {
            // Already started
          }
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
      setIsListening(true);
    } catch (err) {
      setError("Could not access microphone. Please allow microphone permissions.");
      console.error(err);
    }
  }, [isListening, onTranscriptLine]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    if (analyzeTimeoutRef.current) {
      clearTimeout(analyzeTimeoutRef.current);
    }
    analyzerRef.current = null;
    setIsListening(false);
    setMicLevel(0);

    // Send remaining buffer for analysis
    if (transcriptBufferRef.current && patientId) {
      const timestamp = (Date.now() - startTimeRef.current) / 1000;
      triggerAnalysis(transcriptBufferRef.current, timestamp);
      transcriptBufferRef.current = "";
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId]);

  const triggerAnalysis = useCallback(
    async (transcript: string, timestamp: number) => {
      if (!patientId || !transcript.trim()) return;

      try {
        const response = await fetch("/api/analyze-chunk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ patientId, transcript, timestamp }),
        });

        if (!response.ok) return;
        const data = await response.json();

        // Push actions to parent
        if (data.actions) {
          for (const action of data.actions) {
            if (action.type === "alert") {
              onAction(action);
            } else {
              onAction(action);
            }
          }
        }
        if (data.summary) {
          onSummary(data.summary);
        }
      } catch (err) {
        console.error("Analysis failed:", err);
      }
    },
    [patientId, onAction, onSummary]
  );

  const handleToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
    onToggle();
  };

  return (
    <div className="bg-[#12121a] border border-[#1e1e2e] rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-medium text-gray-300">Live Microphone</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Speak or play audio near your mic — agent analyzes in real-time
          </p>
        </div>
        {isListening && (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 recording-pulse" />
            <span className="text-xs text-red-400 font-medium">LIVE</span>
          </div>
        )}
      </div>

      {/* Mic level visualizer */}
      {isListening && (
        <div className="mb-4 flex items-center gap-2">
          <div className="flex-1 h-8 bg-[#0a0a0f] rounded-lg overflow-hidden flex items-center px-2 gap-[2px]">
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 rounded-full bg-green-500 transition-all duration-75"
                style={{
                  height: `${Math.max(8, micLevel * 100 * (0.5 + Math.random() * 0.5))}%`,
                  opacity: i / 30 < micLevel ? 1 : 0.2,
                }}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 w-12 text-right">
            {Math.round(micLevel * 100)}%
          </span>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mb-3 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
          {error}
        </div>
      )}

      {/* Start/Stop button */}
      <button
        onClick={handleToggle}
        disabled={!patientId}
        className={`w-full py-3 px-6 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
          isListening
            ? "bg-red-600 hover:bg-red-500 text-white"
            : "bg-green-600 hover:bg-green-500 text-white disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed"
        }`}
      >
        {isListening ? (
          <>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="1" />
            </svg>
            Stop Listening
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            Start Listening
          </>
        )}
      </button>

      {!patientId && (
        <p className="text-xs text-gray-500 text-center mt-2">
          Select a patient first to enable live analysis
        </p>
      )}
    </div>
  );
}
