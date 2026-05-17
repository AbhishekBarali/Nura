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
  const [visibleTranscriptCount, setVisibleTranscriptCount] = useState(0);
  const [visibleActionCount, setVisibleActionCount] = useState(0);
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
    const transcriptInterval = setInterval(() => {
      setVisibleTranscriptCount((prev) => {
        if (prev >= allTranscriptLines.length) {
          clearInterval(transcriptInterval);
          return prev;
        }
        const line = allTranscriptLines[prev];
        setTranscriptLines((tl) => [...tl, line]);
        setCurrentTime(line.timestamp);
        return prev + 1;
      });
    }, 120); // 120ms per line = ~1.2s for 10 lines

    // Animate action cards in (start slightly after transcript)
    const actionTimeout = setTimeout(() => {
      let actionIdx = 0;
      const actionInterval = setInterval(() => {
        if (actionIdx >= allActions.length) {
          clearInterval(actionInterval);
          // Show complete state
          setTimeout(() => {
            setIsProcessing(false);
            setInstantComplete(true);
          }, 400);
          return;
        }
        setActions((prev) => [...prev, allActions[actionIdx]]);
        setVisibleActionCount((prev) => prev + 1);
        actionIdx++;
      }, 200); // 200ms per action card
    }, 600); // Start actions 600ms after transcript begins

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
    const increment = (duration / (totalAnimTime / stepMs));

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

    // Reset state
    setIsProcessing(true);
    setTranscriptLines([]);
    setActions([]);
    setSummary("");
    setReport(null);
    setShowReport(false);
    setCurrentTime(0);
    setVisibleTranscriptCount(0);
    setVisibleActionCount(0);
    setInstantComplete(false);
    setAllTranscriptLines([]);
    setAllActions([]);

    try {
      const response = await fetch("/api/instant-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: selectedPatient.id,
          demoId: selectedDemo,
        }),
      });

      if (!response.ok) throw new Error("Analysis failed");
      const data = await response.json();

      // Store all data for staggered animation
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
      // Stopping
      setIsLiveActive(false);
      setIsProcessing(false);
    } else {
      // Starting
      setIsLiveActive(true);
      setIsProcessing(true);
      setTranscriptLines([]);
      setActions([]);
      setSummary("");
      setReport(null);
      setShowReport(false);
      setCurrentTime(0);
      setDuration(300); // 5 min max for live
    }
  }, [isLiveActive]);

  // Reset when switching modes
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
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 space-y-6">
        {/* Mode Switcher */}
        <div className="flex items-center justify-center gap-1 p-1 bg-[#12121a] border border-[#1e1e2e] rounded-xl w-fit mx-auto">
          <button
            onClick={() => switchMode("instant")}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              mode === "instant"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Instant Demo
          </button>
          <button
            onClick={() => switchMode("live")}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              mode === "live"
                ? "bg-green-600 text-white shadow-lg shadow-green-500/20"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            Live Mic
          </button>
        </div>

        {/* Mode description */}
        <p className="text-center text-xs text-gray-500">
          {mode === "instant"
            ? "Pre-recorded scenarios analyzed instantly — see the full agent pipeline in seconds"
            : "Speak into your microphone — the agent analyzes your speech in real-time"}
        </p>

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

        {/* Audio Player (visual progress) */}
        {(isProcessing || transcriptLines.length > 0) && mode === "instant" && (
          <AudioPlayer
            isPlaying={isProcessing}
            duration={duration}
            currentTime={currentTime}
            transcriptLines={transcriptLines}
          />
        )}

        {/* Main Content: Transcript + Agent Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <LiveTranscript lines={transcriptLines} isProcessing={isProcessing || isLiveActive} />
          <AgentActions
            actions={actions}
            summary={summary}
            isProcessing={isProcessing || isLiveActive}
          />
        </div>

        {/* Complete Report Button */}
        {report && !isProcessing && (mode === "instant" ? instantComplete : !isLiveActive) && (
          <div className="flex justify-center">
            <button
              onClick={() => setShowReport(true)}
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 animate-fade-in"
            >
              📋 View Complete Clinical Report
            </button>
          </div>
        )}
      </main>

      {/* Report Modal */}
      {showReport && (
        <CompleteReport report={report} onClose={() => setShowReport(false)} />
      )}

      {/* Footer */}
      <footer className="border-t border-[#1e1e2e] py-4 text-center text-xs text-gray-600">
        <p>Nura — Autonomous Clinical Voice Agent • Built for AI Agent Olympics Hackathon</p>
      </footer>
    </div>
  );
}
