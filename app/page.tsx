"use client";

import { useState, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import PatientSelector from "@/components/PatientSelector";
import AudioInput from "@/components/AudioInput";
import LiveTranscript from "@/components/LiveTranscript";
import AgentActions from "@/components/AgentActions";
import CompleteReport from "@/components/CompleteReport";
import LiveMic from "@/components/LiveMic";
import { Patient, TranscriptLine, ActionCard, CompleteReportData } from "@/lib/types";

type AppMode = "instant" | "live" | "upload";

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
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>("");

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

  // Staggered animation for instant/upload mode
  useEffect(() => {
    if (!isProcessing || (mode !== "instant" && mode !== "upload")) return;
    if (allTranscriptLines.length === 0 && allActions.length === 0) return;

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

  // === INSTANT MODE ===
  const startInstantProcessing = useCallback(async () => {
    if (!selectedDemo) return;

    // Auto-select matching patient if not selected
    const patientId = selectedPatient?.id || selectedDemo;

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
        body: JSON.stringify({ patientId, demoId: selectedDemo }),
      });

      if (!response.ok) throw new Error("Analysis failed");
      const data = await response.json();

      // Auto-set patient from response if we used auto-match
      if (!selectedPatient && data.patient) {
        setSelectedPatient(data.patient);
      }

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

  // === UPLOAD MODE ===
  const handleAudioUpload = useCallback(async (file: File) => {
    setUploadedFile(file);
    setMode("upload");
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
    setUploadStatus("Transcribing audio...");

    try {
      const formData = new FormData();
      formData.append("audio", file);
      if (selectedPatient) {
        formData.append("patientId", String(selectedPatient.id));
      }

      const response = await fetch("/api/process-audio", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Audio processing failed");
      }

      const data = await response.json();
      setUploadStatus("Analysis complete!");

      // Set patient if returned
      if (data.patient && !selectedPatient) {
        setSelectedPatient(data.patient);
      }

      setAllTranscriptLines(data.transcript);
      setAllActions(data.actions);
      setSummary(data.summary);
      setDuration(data.duration || 60);
      setReport({
        soap_note: data.soap_note,
        actions: data.actions,
        record_changes: [],
        time_saved: data.time_saved || "8 minutes",
        total_actions: data.total_actions || data.actions.length,
      });
    } catch (error) {
      console.error("Upload processing error:", error);
      setUploadStatus(`Error: ${error instanceof Error ? error.message : "Processing failed"}`);
      setIsProcessing(false);
    }
  }, [selectedPatient]);

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
    setUploadedFile(null);
    setUploadStatus("");
  };

  const isActive = isProcessing || isLiveActive;
  const hasResults = transcriptLines.length > 0 || actions.length > 0;

  return (
    <div className="min-h-screen flex flex-col app-wrapper">
      <Header />

      <main className="flex-1 w-full">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6">
          {/* Split Panel Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[calc(100vh-140px)]">
            
            {/* LEFT PANEL — Controls */}
            <div className="lg:col-span-4 space-y-4">
              {/* Mode Switcher */}
              <div className="elevated-card rounded-2xl p-4">
                <div className="flex items-center gap-1 p-1 bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-xl">
                  <button
                    onClick={() => switchMode("instant")}
                    className={`flex-1 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-300 flex items-center justify-center gap-1.5 ${
                      mode === "instant"
                        ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20"
                        : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Instant Demo
                  </button>
                  <button
                    onClick={() => switchMode("upload")}
                    className={`flex-1 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-300 flex items-center justify-center gap-1.5 ${
                      mode === "upload"
                        ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/20"
                        : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    Upload
                  </button>
                  <button
                    onClick={() => switchMode("live")}
                    className={`flex-1 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-300 flex items-center justify-center gap-1.5 ${
                      mode === "live"
                        ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20"
                        : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                    </svg>
                    Live Mic
                  </button>
                </div>
                <p className="text-[10px] text-[var(--text-muted)] text-center mt-2">
                  {mode === "instant" && "Pre-recorded scenarios — full agent pipeline in seconds"}
                  {mode === "upload" && "Upload any audio file — AI identifies speakers & analyzes"}
                  {mode === "live" && "Real-time mic — speak and watch the agent respond"}
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
              {mode === "instant" && (
                <AudioInput
                  demos={[]}
                  selectedDemo={selectedDemo}
                  onSelectDemo={setSelectedDemo}
                  onStart={startInstantProcessing}
                  onFileUpload={handleAudioUpload}
                  isProcessing={isProcessing}
                  disabled={false}
                />
              )}

              {mode === "upload" && (
                <div className="elevated-card rounded-2xl p-5">
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-6 h-6 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <svg className="w-3.5 h-3.5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                      </svg>
                    </div>
                    <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                      Upload Audio
                    </label>
                  </div>

                  {uploadedFile ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-purple-500/8 border border-purple-500/15">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/15 flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-semibold text-purple-300 truncate">{uploadedFile.name}</p>
                          <p className="text-[10px] text-[var(--text-muted)]">
                            {(uploadedFile.size / 1024 / 1024).toFixed(1)} MB
                          </p>
                        </div>
                      </div>
                      {uploadStatus && (
                        <div className={`text-[11px] font-medium px-3 py-2 rounded-lg ${
                          uploadStatus.startsWith("Error") 
                            ? "text-rose-400 bg-rose-500/8" 
                            : "text-cyan-400 bg-cyan-500/8"
                        }`}>
                          {isProcessing && <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 animate-breathe mr-2" />}
                          {uploadStatus}
                        </div>
                      )}
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-[var(--border-medium)] rounded-xl cursor-pointer hover:border-purple-500/40 hover:bg-purple-500/5 transition-all">
                      <svg className="w-8 h-8 text-[var(--text-muted)] mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                      </svg>
                      <p className="text-xs text-[var(--text-muted)]">Drop audio file or click to browse</p>
                      <p className="text-[10px] text-[var(--text-muted)]/60 mt-1">WAV, MP3, M4A, OGG, WebM</p>
                      <input
                        type="file"
                        accept="audio/*,.wav,.mp3,.m4a,.ogg,.webm"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleAudioUpload(file);
                        }}
                      />
                    </label>
                  )}

                  <div className="mt-4 p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-subtle)]">
                    <p className="text-[10px] text-[var(--text-muted)] leading-relaxed">
                      <span className="text-cyan-400 font-semibold">AI-powered:</span> Automatically identifies Doctor vs Patient speakers, 
                      detects clinical scenarios, drug interactions, and generates SOAP notes — no manual setup needed.
                    </p>
                  </div>
                </div>
              )}

              {mode === "live" && (
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

              {/* Report Button */}
              {report && !isProcessing && (mode === "instant" || mode === "upload" ? instantComplete : !isLiveActive) && (
                <button
                  onClick={() => setShowReport(true)}
                  className="w-full group px-5 py-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 hover:from-cyan-500/20 hover:to-blue-500/20 border border-cyan-500/20 hover:border-cyan-500/40 text-white font-semibold rounded-2xl transition-all duration-300 shadow-lg shadow-cyan-500/5 hover:shadow-cyan-500/15 animate-fade-in flex items-center gap-3"
                >
                  <span className="w-8 h-8 rounded-xl bg-cyan-500/15 flex items-center justify-center group-hover:bg-cyan-500/25 transition-colors">
                    📋
                  </span>
                  <span className="text-left flex-1">
                    <span className="block text-sm">View Complete Report</span>
                    <span className="block text-[10px] text-[var(--text-muted)] font-normal">SOAP note, actions, time saved</span>
                  </span>
                </button>
              )}
            </div>

            {/* RIGHT PANEL — Live Results */}
            <div className="lg:col-span-8 space-y-4">
              {!hasResults && !isActive ? (
                <div className="elevated-card rounded-2xl h-full flex flex-col items-center justify-center p-12 text-center min-h-[500px]">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/10 flex items-center justify-center mb-6">
                    <svg className="w-9 h-9 text-cyan-400/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Ready to Analyze</h3>
                  <p className="text-sm text-[var(--text-muted)] max-w-md leading-relaxed">
                    {mode === "instant" && "Select a clinical scenario on the left and click Analyze to see the agent pipeline in action."}
                    {mode === "upload" && "Upload an audio recording of a clinical encounter. The AI will transcribe, identify speakers, and analyze automatically."}
                    {mode === "live" && "Click the microphone to start recording. Speak or play audio near your mic — the agent analyzes in real-time."}
                  </p>
                  <div className="flex items-center gap-4 mt-6 text-[10px] text-[var(--text-muted)]">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-cyan-400/40" />
                      Speaker ID
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-400/40" />
                      Drug Alerts
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400/40" />
                      SOAP Notes
                    </span>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 h-full">
                  <LiveTranscript lines={transcriptLines} isProcessing={isActive} />
                  <AgentActions actions={actions} summary={summary} isProcessing={isActive} />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Report Modal */}
      {showReport && (
        <CompleteReport report={report} onClose={() => setShowReport(false)} />
      )}

      {/* Footer */}
      <footer className="border-t border-[var(--border-subtle)] py-4 text-center">
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
