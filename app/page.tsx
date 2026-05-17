"use client";

import { useState, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import PatientSelector from "@/components/PatientSelector";
import AudioInput from "@/components/AudioInput";
import AudioPlayer from "@/components/AudioPlayer";
import LiveTranscript from "@/components/LiveTranscript";
import AgentActions from "@/components/AgentActions";
import CompleteReport from "@/components/CompleteReport";
import LiveMic from "@/components/LiveMic";
import { Patient, TranscriptLine, ActionCard, CompleteReportData } from "@/lib/types";

type AppMode = "instant" | "live";

export default function Home() {
  const [mode, setMode] = useState<AppMode>("instant");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedDemo, setSelectedDemo] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcriptLines, setTranscriptLines] = useState<TranscriptLine[]>([]);
  const [actions, setActions] = useState<ActionCard[]>([]);
  const [summary, setSummary] = useState("");
  const [report, setReport] = useState<CompleteReportData | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLiveActive, setIsLiveActive] = useState(false);

  // For instant mode staggered animation
  const [allTranscriptLines, setAllTranscriptLines] = useState<TranscriptLine[]>([]);
  const [allActions, setAllActions] = useState<ActionCard[]>([]);
  const [instantComplete, setInstantComplete] = useState(false);

  // Fetch patients on mount
  useEffect(() => {
    fetch("/api/patients")
      .then((res) => res.json())
      .then((data) => setPatients(data))
      .catch(console.error);
  }, []);

  // Auto-select matching patient when demo is selected
  useEffect(() => {
    if (selectedDemo && patients.length > 0) {
      const patient = patients.find((p) => p.id === selectedDemo);
      if (patient) setSelectedPatient(patient);
    }
  }, [selectedDemo, patients]);

  // Staggered animation for instant mode
  useEffect(() => {
    if (!isProcessing || mode !== "instant") return;

    // Animate transcript lines in
    let transcriptIdx = 0;
    const transcriptInterval = setInterval(() => {
      if (transcriptIdx >= allTranscriptLines.length) {
        clearInterval(transcriptInterval);
        return;
      }
      const line = allTranscriptLines[transcriptIdx];
      setTranscriptLines((tl) => [...tl, line]);
      setCurrentTime(line.timestamp);
      transcriptIdx++;
    }, 120);

    // Animate action cards in (start slightly after transcript)
    const actionTimeout = setTimeout(() => {
      let actionIdx = 0;
      const actionInterval = setInterval(() => {
        if (actionIdx >= allActions.length) {
          clearInterval(actionInterval);
          setTimeout(() => {
            setIsProcessing(false);
            setInstantComplete(true);
          }, 400);
          return;
        }
        setActions((prev) => [...prev, allActions[actionIdx]]);
        actionIdx++;
      }, 200);
    }, 600);

    return () => {
      clearInterval(transcriptInterval);
      clearTimeout(actionTimeout);
    };
  }, [isProcessing, mode, allTranscriptLines, allActions]);

  // Simulate progress bar for instant mode
  useEffect(() => {
    if (!isProcessing || mode !== "instant" || duration === 0) return;

    const totalAnimTime = Math.max(
      allTranscriptLines.length * 120,
      allActions.length * 200 + 600
    );
    const stepMs = 50;
    const increment = duration / (totalAnimTime / stepMs);

    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        if (prev >= duration) {
          clearInterval(interval);
          return duration;
        }
        return prev + increment;
      });
    }, stepMs);

    return () => clearInterval(interval);
  }, [isProcessing, mode, duration, allTranscriptLines.length, allActions.length]);

  // === INSTANT MODE ===
  const startInstantProcessing = useCallback(async () => {
    if (!selectedPatient || !selectedDemo) return;

    setIsProcessing(true);
    setTranscriptLines([]);
    setActions([]);
    setSummary("");
    setReport(null);
    setShowReport(false);
    setCurrentTime(0);
    setInstantComplete(false);
    setAllTranscriptLines([]);
    setAllActions([]);

    try {
      const response = await fetch("/api/instant-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId: selectedPatient.id, demoId: selectedDemo }),
      });

      if (!response.ok) throw new Error("Analysis failed");
      const data = await response.json();

      setAllTranscriptLines(data.transcript);
      setAllActions(data.actions);
      setSummary(data.summary);
      setDuration(data.duration);
      setReport({
        soap_note: data.soap_note,
        actions: data.actions,
        record_changes: [],
        time_saved: data.time_saved,
        total_actions: data.total_actions,
      });
    } catch (error) {
      console.error("Instant processing error:", error);
      setIsProcessing(false);
    }
  }, [selectedPatient, selectedDemo]);

  // === LIVE MODE handlers ===
  const handleLiveTranscript = useCallback((line: TranscriptLine) => {
    setTranscriptLines((prev) => [...prev, line]);
    setCurrentTime(line.timestamp);
  }, []);

  const handleLiveAction = useCallback((action: ActionCard) => {
    setActions((prev) => [...prev, action]);
  }, []);

  const handleLiveSummary = useCallback((text: string) => {
    setSummary((prev) => (prev ? `${prev} ${text}` : text));
  }, []);

  const handleLiveComplete = useCallback((data: unknown) => {
    setReport(data as CompleteReportData);
  }, []);

  const handleLiveToggle = useCallback(() => {
    if (isLiveActive) {
      setIsLiveActive(false);
      setIsProcessing(false);
    } else {
      setIsLiveActive(true);
      setIsProcessing(true);
      setTranscriptLines([]);
      setActions([]);
      setSummary("");
      setReport(null);
      setShowReport(false);
      setCurrentTime(0);
      setDuration(300);
    }
  }, [isLiveActive]);

  const switchMode = (newMode: AppMode) => {
    setMode(newMode);
    setIsProcessing(false);
    setIsLiveActive(false);
    setTranscriptLines([]);
    setActions([]);
    setSummary("");
    setReport(null);
    setShowReport(false);
    setCurrentTime(0);
    setDuration(0);
    setInstantComplete(false);
    setAllTranscriptLines([]);
    setAllActions([]);
  };

  return (
    <div className="min-h-screen flex flex-col app-wrapper">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 space-y-6">
        {/* Mode Switcher */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-1 p-1 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl">
            <button
              onClick={() => switchMode("instant")}
              className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                mode === "instant"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Instant Demo
            </button>
            <button
              onClick={() => switchMode("live")}
              className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                mode === "live"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
              </svg>
              Live Mic
            </button>
          </div>
          <p className="text-[11px] text-[var(--text-muted)]">
            {mode === "instant"
              ? "Pre-recorded scenarios — full agent pipeline in seconds"
              : "Real-time microphone analysis — speak and watch the agent respond"}
          </p>
        </div>

        {/* Patient Selection */}
        <PatientSelector
          patients={patients}
          selectedPatient={selectedPatient}
          onSelect={setSelectedPatient}
          disabled={isProcessing}
        />

        {/* Mode-specific input */}
        {mode === "instant" ? (
          <AudioInput
            demos={[]}
            selectedDemo={selectedDemo}
            onSelectDemo={setSelectedDemo}
            onStart={startInstantProcessing}
            isProcessing={isProcessing}
            disabled={!selectedPatient}
          />
        ) : (
          <LiveMic
            patientId={selectedPatient?.id || null}
            onTranscriptLine={handleLiveTranscript}
            onAction={handleLiveAction}
            onSummary={handleLiveSummary}
            onComplete={handleLiveComplete}
            isActive={isLiveActive}
            onToggle={handleLiveToggle}
          />
        )}

        {/* Audio Player */}
        {(isProcessing || transcriptLines.length > 0) && mode === "instant" && (
          <AudioPlayer
            isPlaying={isProcessing}
            duration={duration}
            currentTime={currentTime}
            transcriptLines={transcriptLines}
          />
        )}

        {/* Main Content: Transcript + Agent Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <LiveTranscript lines={transcriptLines} isProcessing={isProcessing || isLiveActive} />
          <AgentActions actions={actions} summary={summary} isProcessing={isProcessing || isLiveActive} />
        </div>

        {/* Complete Report Button */}
        {report && !isProcessing && (mode === "instant" ? instantComplete : !isLiveActive) && (
          <div className="flex justify-center pt-2">
            <button
              onClick={() => setShowReport(true)}
              className="group px-8 py-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 hover:from-cyan-500/20 hover:to-blue-500/20 border border-cyan-500/20 hover:border-cyan-500/40 text-white font-semibold rounded-2xl transition-all duration-300 shadow-lg shadow-cyan-500/5 hover:shadow-cyan-500/15 animate-fade-in flex items-center gap-3"
            >
              <span className="w-8 h-8 rounded-xl bg-cyan-500/15 flex items-center justify-center group-hover:bg-cyan-500/25 transition-colors">
                📋
              </span>
              <span>
                <span className="block text-sm">View Complete Report</span>
                <span className="block text-[10px] text-[var(--text-muted)] font-normal">SOAP note, actions, time saved</span>
              </span>
              <svg className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>
          </div>
        )}
      </main>

      {/* Report Modal */}
      {showReport && (
        <CompleteReport report={report} onClose={() => setShowReport(false)} />
      )}

      {/* Footer */}
      <footer className="border-t border-[var(--border-subtle)] py-5 text-center">
        <p className="text-[11px] text-[var(--text-muted)] tracking-wide">
          <span className="font-display text-sm text-[var(--text-secondary)]">Nura</span>
          <span className="mx-2 text-[var(--border-medium)]">·</span>
          Autonomous Clinical Voice Agent
          <span className="mx-2 text-[var(--border-medium)]">·</span>
          AI Agent Olympics
        </p>
      </footer>
    </div>
  );
}
