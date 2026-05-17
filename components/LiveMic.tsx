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
  const lastAnalysisRef = useRef(0);

  // Keep callback refs fresh to avoid stale closures
  const onTranscriptLineRef = useRef(onTranscriptLine);
  const onActionRef = useRef(onAction);
  const onSummaryRef = useRef(onSummary);
  useEffect(() => { onTranscriptLineRef.current = onTranscriptLine; }, [onTranscriptLine]);
  useEffect(() => { onActionRef.current = onAction; }, [onAction]);
  useEffect(() => { onSummaryRef.current = onSummary; }, [onSummary]);

  useEffect(() => {
    return () => { stopListening(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const triggerAnalysis = useCallback(async (transcript: string, timestamp: number) => {
    if (!transcript.trim()) return;
    lastAnalysisRef.current = Date.now();
    try {
      const response = await fetch("/api/analyze-chunk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId: patientId || 0, transcript, timestamp }),
      });
      if (!response.ok) return;
      const data = await response.json();
      if (data.actions) { for (const action of data.actions) { onActionRef.current(action); } }
      if (data.summary) { onSummaryRef.current(data.summary); }
    } catch (err) { console.error("Analysis failed:", err); }
  }, [patientId]);

  const scheduleAnalysis = useCallback((timestamp: number) => {
    // Debounce: wait 1.5s after last speech before triggering analysis
    // This batches short phrases together for better LLM context
    if (analysisTimerRef.current) clearTimeout(analysisTimerRef.current);
    analysisTimerRef.current = setTimeout(() => {
      if (transcriptBufferRef.current.trim()) {
        triggerAnalysis(transcriptBufferRef.current, timestamp);
        transcriptBufferRef.current = "";
      }
    }, 1500);

    // Force send if buffer grows large (>3 lines accumulated) regardless of debounce
    const lines = transcriptBufferRef.current.split("\n").filter(Boolean);
    if (lines.length >= 3) {
      if (analysisTimerRef.current) clearTimeout(analysisTimerRef.current);
      triggerAnalysis(transcriptBufferRef.current, timestamp);
      transcriptBufferRef.current = "";
    }
  }, [triggerAnalysis]);

  const startListening = useCallback(async () => {
    setError(null);
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Speech recognition not supported. Use Chrome for best results.");
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
          lineCountRef.current++;

          // Detect speaker: simple heuristic — question-like phrases or medical terms = Doctor
          const isQuestion = text.endsWith("?");
          const doctorPhrases = ["prescribe", "recommend", "let me", "i'd like to", "your results", "let's", "i think we should", "i want to"];
          const looksLikeDoctor = isQuestion || doctorPhrases.some(p => text.toLowerCase().includes(p));
          const speaker = looksLikeDoctor ? "Doctor" : "Patient";

          onTranscriptLineRef.current({ speaker, text, timestamp });
          transcriptBufferRef.current += `${speaker}: ${text}\n`;

          // Schedule analysis with debounce
          scheduleAnalysis(timestamp);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        if (event.error === "no-speech") return;
        if (event.error === "aborted") return;
        console.error("Speech recognition error:", event.error);
        setError(`Recognition error: ${event.error}`);
      };

      recognition.onend = () => {
        // Use ref instead of state to avoid stale closure
        if (shouldListenRef.current) {
          try {
            recognitionRef.current?.start();
          } catch {
            // If start fails, retry after a short delay
            setTimeout(() => {
              if (shouldListenRef.current && recognitionRef.current) {
                try { recognitionRef.current.start(); } catch { /* give up */ }
              }
            }, 200);
          }
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
      setIsListening(true);
    } catch {
      setError("Could not access microphone. Please allow microphone permissions.");
    }
  }, [scheduleAnalysis]);

  const stopListening = useCallback(() => {
    shouldListenRef.current = false;
    if (recognitionRef.current) { recognitionRef.current.stop(); recognitionRef.current = null; }
    if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null; }
    if (audioContextRef.current) { audioContextRef.current.close(); audioContextRef.current = null; }
    if (animFrameRef.current) { cancelAnimationFrame(animFrameRef.current); }
    if (analysisTimerRef.current) { clearTimeout(analysisTimerRef.current); }
    analyzerRef.current = null;
    setIsListening(false);
    setMicLevel(0);

    // Flush remaining buffer
    if (transcriptBufferRef.current.trim()) {
      const timestamp = (Date.now() - startTimeRef.current) / 1000;
      triggerAnalysis(transcriptBufferRef.current, timestamp);
      transcriptBufferRef.current = "";
    }
  }, [triggerAnalysis]);

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
