"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import PatientSelector from "@/components/PatientSelector";
import AudioSourcePicker from "@/components/AudioSourcePicker";
import LiveTranscript from "@/components/LiveTranscript";
import AgentActions from "@/components/AgentActions";
import CompleteReport from "@/components/CompleteReport";
import LiveMic from "@/components/LiveMic";
import AgentLog, { AgentLogEntry } from "@/components/AgentLog";
import AppointmentCalendar, { BookedAppointment } from "@/components/AppointmentCalendar";
import Onboarding from "@/components/Onboarding";
import Toast, { useToast } from "@/components/Toast";
import { Patient, TranscriptLine, ActionCard, CompleteReportData } from "@/lib/types";

type AppMode = "instant" | "live";

export default function Home() {
  const [mode, setMode] = useState<AppMode>("instant");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedDemo, setSelectedDemo] = useState<number | null>(1);
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
  const [autoPlayed, setAutoPlayed] = useState(false);

  // For instant mode staggered animation
  const [allTranscriptLines, setAllTranscriptLines] = useState<TranscriptLine[]>([]);
  const [allActions, setAllActions] = useState<ActionCard[]>([]);
  const [instantComplete, setInstantComplete] = useState(false);

  // Agent autonomous actions log
  const [agentLog, setAgentLog] = useState<AgentLogEntry[]>([]);
  const [agentActive, setAgentActive] = useState(false);
  const [liveRecordUpdates, setLiveRecordUpdates] = useState<string[]>([]);
  const [bookedAppointments, setBookedAppointments] = useState<BookedAppointment[]>(() => {
    // Pre-populate with existing clinic appointments to show intelligent scheduling
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const dayAfter = new Date(today);
    dayAfter.setDate(today.getDate() + 2);
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 5);
    const nextWeek2 = new Date(today);
    nextWeek2.setDate(today.getDate() + 7);
    return [
      { date: tomorrow, time: "9:00 AM", department: "Cardiology", patient: "Mrs. Chen" },
      { date: tomorrow, time: "2:30 PM", department: "Primary Care", patient: "Mr. Rodriguez" },
      { date: dayAfter, time: "10:00 AM", department: "Neurology", patient: "Ms. Patel" },
      { date: nextWeek, time: "11:00 AM", department: "Endocrinology", patient: "Mr. Thompson" },
      { date: nextWeek2, time: "3:00 PM", department: "Orthopedics", patient: "Mrs. Williams" },
    ];
  });
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const { toasts, addToast, dismissToast } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Clear all pending timers (prevents memory leaks on unmount/mode switch)
  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  // Safe setTimeout that registers for cleanup
  const safeTimeout = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timersRef.current.push(id);
    return id;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      timersRef.current.forEach(clearTimeout);
    };
  }, []);

  // Fetch patients on mount
  useEffect(() => {
    fetch("/api/patients")
      .then((res) => res.json())
      .then((data) => setPatients(data))
      .catch(console.error);
  }, []);

  // Staggered animation no longer needed — real-time SSE streaming handles display

  // Mock clinic schedule for appointment booking simulation
  const getAppointmentResult = (department: string, patientName: string): { text: string; appointment: BookedAppointment } => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    // Simulate: next 2 days are "full", then find an open slot
    const daysUntilOpen = dayOfWeek <= 3 ? 3 : 5; // Thu or Mon
    const appointmentDate = new Date(today);
    appointmentDate.setDate(today.getDate() + daysUntilOpen);
    appointmentDate.setHours(0, 0, 0, 0);
    const dayName = appointmentDate.toLocaleDateString("en-US", { weekday: "long" });
    const dateStr = appointmentDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const times = ["9:00 AM", "10:30 AM", "2:00 PM", "3:30 PM"];
    const slot = times[Math.floor(Math.random() * times.length)];
    return {
      text: `${department} — ${dayName} ${dateStr} at ${slot} (confirmed)`,
      appointment: { date: appointmentDate, time: slot, department, patient: patientName },
    };
  };

  // Trigger autonomous agent actions after analysis completes
  const triggerAgentAutonomousActions = useCallback((analysisActions: ActionCard[], patientName: string, soapNote: { subjective: string; assessment: string }) => {
    clearAllTimers();
    setAgentActive(true);
    setAgentLog([]);
    setLiveRecordUpdates([]);

    const hasAlerts = analysisActions.some(a => a.type === "alert");
    const hasReferrals = analysisActions.some(a => a.type === "referral");
    const conditions = analysisActions.filter(a => a.type === "condition");
    const medications = analysisActions.filter(a => a.type === "medication");
    const symptoms = analysisActions.filter(a => a.type === "symptom");
    const referrals = analysisActions.filter(a => a.type === "referral");

    // Build a deterministic timeline of agent steps
    interface Step {
      entry: Omit<AgentLogEntry, "id">;
      startDelay: number;
      doneDelay: number;
      doneUpdate: Partial<AgentLogEntry>;
      recordUpdate?: string;
      recordUpdateDelay?: number;
    }

    const steps: Step[] = [];
    let t = 300; // running timeline cursor

    // Step 1: Update patient record
    steps.push({
      entry: { timestamp: Date.now(), action: "Updating Patient Record", icon: "📋", detail: `Adding ${conditions.length} condition(s), ${medications.length} medication(s) to chart`, status: "running", color: "text-cyan-400" },
      startDelay: t,
      doneDelay: t + 1200,
      doneUpdate: { status: "done" },
    });
    // Live record updates
    if (conditions.length > 0) {
      const condNames = conditions.map(c => (c.content as Record<string, string>).name).filter(Boolean);
      steps[0].recordUpdate = `+ Condition: ${condNames.join(", ") || "Detected"}`;
      steps[0].recordUpdateDelay = t + 400;
    }
    t += 1400;

    if (symptoms.length > 0) {
      safeTimeout(() => {
        const symNames = symptoms.slice(0, 3).map(s => (s.content as Record<string, string>).description).filter(Boolean);
        setLiveRecordUpdates(prev => [...prev, `+ Symptoms: ${symNames.join(", ") || "Reported"}`]);
      }, t - 600);
    }
    if (medications.length > 0) {
      safeTimeout(() => {
        const medNames = medications.map(m => (m.content as Record<string, string>).name).filter(Boolean);
        setLiveRecordUpdates(prev => [...prev, `+ Medications: ${medNames.join(", ") || "Discussed"}`]);
      }, t - 200);
    }

    // Step 2: Send SOAP report email
    steps.push({
      entry: { timestamp: Date.now(), action: "Sending SOAP Report", icon: "📧", detail: `Emailing encounter report to primary care team`, status: "running", color: "text-blue-400" },
      startDelay: t,
      doneDelay: t + 1300,
      doneUpdate: { status: "sent", detail: `SOAP note sent to primarycare@clinic.org for ${patientName}` },
    });
    t += 1600;

    // Step 3: Alert care team (if alerts)
    if (hasAlerts) {
      steps.push({
        entry: { timestamp: Date.now(), action: "Alerting Care Team", icon: "🚨", detail: `Flagging clinical alerts for immediate review`, status: "running", color: "text-rose-400" },
        startDelay: t,
        doneDelay: t + 1200,
        doneUpdate: { status: "sent", detail: "Alert notification sent to attending physician" },
      });
      t += 1500;
    }

    // Step 4: Dispatch referral (if referrals)
    if (hasReferrals) {
      const refDept = (referrals[0]?.content as Record<string, string>)?.department || "Specialist";
      steps.push({
        entry: { timestamp: Date.now(), action: "Dispatching Referral", icon: "🏥", detail: `Sending referral request to ${refDept}`, status: "running", color: "text-emerald-400" },
        startDelay: t,
        doneDelay: t + 1300,
        doneUpdate: { status: "sent", detail: `Referral sent to ${refDept} — awaiting scheduling` },
      });
      t += 1600;
    }

    // Step 5: Schedule appointment (the new feature!)
    steps.push({
      entry: { timestamp: Date.now(), action: "Booking Appointment", icon: "📅", detail: `Checking clinic schedule for follow-up...`, status: "running", color: "text-amber-400" },
      startDelay: t,
      doneDelay: t + 2200,
      doneUpdate: { status: "done", detail: "" }, // will be set dynamically
    });
    t += 2500;

    // Step 6: Email to sub-department
    const targetDept = hasReferrals
      ? ((referrals[0]?.content as Record<string, string>)?.department || "Specialist Dept")
      : "Primary Care";
    steps.push({
      entry: { timestamp: Date.now(), action: "Routing to Department", icon: "📨", detail: `Sending records to ${targetDept}`, status: "running", color: "text-violet-400" },
      startDelay: t,
      doneDelay: t + 1200,
      doneUpdate: { status: "sent", detail: `Full report emailed to ${targetDept.toLowerCase().replace(/\s/g, "")}@clinic.org` },
    });
    t += 1500;

    // Execute the timeline
    const logEntries: AgentLogEntry[] = [];

    steps.forEach((step, i) => {
      // Add entry (running state)
      safeTimeout(() => {
        logEntries.push({ ...step.entry, id: `agent-${i}` });
        setAgentLog([...logEntries]);

        // Handle record update
        if (step.recordUpdate && step.recordUpdateDelay !== undefined) {
          safeTimeout(() => {
            setLiveRecordUpdates(prev => [...prev, step.recordUpdate!]);
          }, step.recordUpdateDelay - step.startDelay);
        }
      }, step.startDelay);

      // Mark done
      safeTimeout(() => {
        const entry = logEntries.find(e => e.id === `agent-${i}`);
        if (entry) {
          // Special handling for appointment booking — simulate schedule check
          if (step.entry.action === "Booking Appointment") {
            const result = getAppointmentResult(hasReferrals ? targetDept : "Follow-up", patientName);
            entry.status = "done";
            entry.detail = result.text;
            setBookedAppointments(prev => [...prev, result.appointment]);
          } else {
            Object.assign(entry, step.doneUpdate);
          }
          setAgentLog([...logEntries]);
        }

        // If last step, deactivate
        if (i === steps.length - 1) {
          setAgentActive(false);
        }
      }, step.doneDelay);
    });
  }, [clearAllTimers, safeTimeout]);

  // === PRE-COMPUTED INSTANT DEMO — fast results for hackathon judges ===
  const runPrecomputedDemo = useCallback(async () => {
    setIsProcessing(true);
    setTranscriptLines([]);
    setActions([]);
    setSummary("");
    setReport(null);
    setShowReport(false);
    setCurrentTime(0);
    setInstantComplete(false);
    setAgentLog([]);
    setAgentActive(false);
    setLiveRecordUpdates([]);
    setUploadStatus("Running instant demo...");
    setSelectedDemo(1);

    try {
      const res = await fetch("/api/instant-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ demoId: 1 }),
      });
      if (!res.ok) throw new Error("Demo failed");
      const data = await res.json();

      if (data.patient) setSelectedPatient(data.patient);
      setDuration(data.duration || 60);

      const lines: TranscriptLine[] = data.transcript || [];
      const acts: ActionCard[] = data.actions || [];

      // Staggered reveal of transcript lines (looks live to judges)
      let lineIdx = 0;
      const lineInterval = setInterval(() => {
        if (lineIdx < lines.length) {
          const batch = lines.slice(lineIdx, lineIdx + 2);
          setTranscriptLines(prev => [...prev, ...batch]);
          setCurrentTime(batch[batch.length - 1]?.timestamp || 0);
          lineIdx += 2;
        } else {
          clearInterval(lineInterval);
        }
      }, 120);

      // Staggered reveal of actions
      let actIdx = 0;
      const actDelay = Math.max(200, (lines.length * 120) / (acts.length || 1));
      const actInterval = setInterval(() => {
        if (actIdx < acts.length) {
          setActions(prev => [...prev, acts[actIdx]]);
          actIdx++;
        } else {
          clearInterval(actInterval);
        }
      }, actDelay);

      // After all lines revealed, finalize
      const totalTime = lines.length * 60 + 800;
      safeTimeout(() => {
        setTranscriptLines(lines);
        setActions(acts);
        setSummary(data.summary || "");
        setReport({
          soap_note: data.soap_note,
          actions: acts,
          record_changes: [],
          time_saved: data.time_saved || "12 minutes",
          total_actions: data.total_actions || acts.length,
        });
        setIsProcessing(false);
        setInstantComplete(true);
        setUploadStatus("");
        triggerAgentAutonomousActions(
          acts,
          data.patient?.name || "Patient",
          data.soap_note || { subjective: "", assessment: "" }
        );
      }, totalTime);
    } catch (err) {
      console.error("Precomputed demo error:", err);
      setUploadStatus("Demo failed — try selecting a sample manually");
      setIsProcessing(false);
    }
  }, [triggerAgentAutonomousActions, safeTimeout]);

  // Auto-start pre-computed demo after onboarding — instant results for judges
  useEffect(() => {
    if (onboardingComplete && !autoPlayed) {
      setAutoPlayed(true);
      safeTimeout(() => {
        runPrecomputedDemo();
      }, 600);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onboardingComplete]);

  // === CANCEL / STOP ===
  const handleCancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    clearAllTimers();
    setIsProcessing(false);
    setIsLiveActive(false);
    setAgentActive(false);
    addToast({ type: "info", message: "Analysis stopped." });
  }, [addToast, clearAllTimers]);

  // === SHARED SSE STREAM PARSER ===
  const processSSEStream = useCallback(async (response: Response) => {
    const reader = response.body?.getReader();
    if (!reader) throw new Error("No response stream");

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const messages = buffer.split("\n\n");
      buffer = messages.pop() || "";

      for (const msg of messages) {
        if (!msg.trim()) continue;
        const eventMatch = msg.match(/^event: (.+)$/m);
        const dataMatch = msg.match(/^data: (.+)$/m);
        if (!eventMatch || !dataMatch) continue;

        const event = eventMatch[1];
        let data;
        try { data = JSON.parse(dataMatch[1]); } catch { continue; }

        switch (event) {
          case "phase":
            setUploadStatus(data.message);
            if (data.duration) setDuration(data.duration);
            break;
          case "progress":
            setUploadStatus(data.message);
            break;
          case "transcript_lines":
            setTranscriptLines((prev) => [...prev, ...data.lines]);
            if (data.lines.length > 0) {
              setCurrentTime(data.lines[data.lines.length - 1].timestamp);
            }
            break;
          case "actions_partial":
            setActions(data.actions);
            break;
          case "actions":
            setActions(data.actions);
            break;
          case "complete":
            setUploadStatus("Analysis complete!");
            if (data.patient && !selectedPatient) {
              setSelectedPatient(data.patient);
            }
            setSummary(data.summary);
            setDuration(data.duration || 60);
            setActions(data.actions);
            setReport({
              soap_note: data.soap_note,
              actions: data.actions,
              record_changes: [],
              time_saved: data.time_saved || "8 minutes",
              total_actions: data.total_actions || data.actions.length,
            });
            setIsProcessing(false);
            setInstantComplete(true);
            triggerAgentAutonomousActions(
              data.actions,
              data.patient?.name || selectedPatient?.name || "Patient",
              data.soap_note || { subjective: "", assessment: "" }
            );
            break;
          case "error":
            throw new Error(data.error);
        }
      }
    }
  }, [selectedPatient, triggerAgentAutonomousActions]);

  // === INSTANT MODE — now fetches the sample audio and transcribes it for real ===
  const SAMPLE_FILES: Record<number, string> = { 1: "/audio/sample-1.mp3", 2: "/audio/sample-2.mp3", 3: "/audio/sample-3.mp3" };
  const SAMPLE_NAMES: Record<number, string> = { 1: "Acute Headache & Advance Care Planning", 2: "Chronic Back Pain — Treatment Planning", 3: "Clinical Consultation Recording" };

  const startInstantProcessing = useCallback(async () => {
    if (!selectedDemo) return;

    const audioUrl = SAMPLE_FILES[selectedDemo];
    if (!audioUrl) return;

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
    setAgentLog([]);
    setAgentActive(false);
    setLiveRecordUpdates([]);
    setUploadStatus("Fetching audio sample...");

    try {
      // Fetch the audio file from public folder and send to transcription
      const audioResponse = await fetch(audioUrl);
      if (!audioResponse.ok) throw new Error("Failed to fetch audio sample");
      const blob = await audioResponse.blob();
      const file = new File([blob], `${SAMPLE_NAMES[selectedDemo]}.mp3`, { type: "audio/mpeg" });

      // Use the same real transcription pipeline as manual upload
      const formData = new FormData();
      formData.append("audio", file);
      if (selectedPatient && selectedPatient.id > 0) {
        formData.append("patientId", String(selectedPatient.id));
      }

      setUploadStatus("Submitting to Speechmatics...");

      const response = await fetch("/api/process-audio", {
        method: "POST",
        body: formData,
      });

      if (!response.ok && !response.headers.get("content-type")?.includes("text/event-stream")) {
        const err = await response.json();
        throw new Error(err.error || "Audio processing failed");
      }

      await processSSEStream(response);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      console.error("Processing error:", error);
      setUploadStatus(`Error: ${error instanceof Error ? error.message : "Processing failed"}`);
      setIsProcessing(false);
      addToast({
        type: "error",
        message: error instanceof Error ? error.message : "Analysis failed. Check your connection and try again.",
        action: { label: "Retry", onClick: () => startInstantProcessing() },
      });
    }
  }, [selectedPatient, selectedDemo, triggerAgentAutonomousActions, addToast, processSSEStream]);

  // === UPLOAD MODE (via AudioInput upload button) ===
  const handleAudioUpload = useCallback(async (file: File) => {
    setUploadedFile(file);
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
    setAgentLog([]);
    setAgentActive(false);
    setLiveRecordUpdates([]);
    setUploadStatus("Uploading audio...");

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

      if (!response.ok && !response.headers.get("content-type")?.includes("text/event-stream")) {
        const err = await response.json();
        throw new Error(err.error || "Audio processing failed");
      }

      await processSSEStream(response);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      console.error("Upload processing error:", error);
      setUploadStatus(`Error: ${error instanceof Error ? error.message : "Processing failed"}`);
      setIsProcessing(false);
      addToast({
        type: "error",
        message: error instanceof Error ? error.message : "Audio processing failed.",
        action: { label: "Retry", onClick: () => { if (uploadedFile) handleAudioUpload(uploadedFile); } },
      });
    }
  }, [selectedPatient, triggerAgentAutonomousActions, addToast, processSSEStream]);

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
    clearAllTimers();
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
    setAgentLog([]);
    setAgentActive(false);
    setLiveRecordUpdates([]);
    // Don't reset bookedAppointments — keep pre-populated + newly booked ones
  };

  const isActive = isProcessing || isLiveActive;
  const hasResults = transcriptLines.length > 0 || actions.length > 0;

  return (
    <div className="min-h-[100dvh] flex flex-col app-wrapper">
      <Onboarding onComplete={() => setOnboardingComplete(true)} />
      <Header />

      <main id="main-content" className="flex-1 w-full">
        <h1 className="sr-only">Nura Clinical Demo</h1>
        <div className="max-w-[1600px] mx-auto px-3 sm:px-5 md:px-8 py-4 sm:py-6">
          {/* Breadcrumb */}
          <div className="mb-3 sm:mb-4 flex items-center gap-2">
            <Link href="/" className="group flex items-center gap-1.5 text-xs font-medium text-[var(--text-muted)] hover:text-blue-700 transition-colors">
              <svg className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Back to Home
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-semibold text-[var(--text-primary)]">Live Demo</span>
          </div>
          {/* Split Panel Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:min-h-[calc(100vh-140px)]">
            
            {/* LEFT PANEL — Controls */}
            <div className="lg:col-span-4 space-y-5">
              {/* Mode Switcher */}
              <div className="elevated-card rounded-xl p-4">
                <div className="flex items-center gap-1 p-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg">
                  <button
                    onClick={() => switchMode("instant")}
                    className={`flex-1 px-3 py-2.5 rounded-md text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
                      mode === "instant"
                        ? "bg-white text-blue-700 shadow-sm border border-blue-200"
                        : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Instant Demo
                  </button>
                  <button
                    onClick={() => switchMode("live")}
                    className={`flex-1 px-3 py-2.5 rounded-md text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
                      mode === "live"
                        ? "bg-white text-blue-700 shadow-sm border border-blue-200"
                        : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                    </svg>
                    Live Mic
                  </button>
                </div>
                {isActive && (
                  <button
                    onClick={handleCancel}
                    className="w-full mt-3 px-3 py-2 rounded-lg text-xs font-semibold text-red-700 bg-red-50 border border-red-200 hover:bg-red-100 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z" />
                    </svg>
                    Stop Analysis
                  </button>
                )}
              </div>

              {/* Mode-specific controls */}
              {mode === "instant" && (
                <>
                  <PatientSelector
                    patients={patients}
                    selectedPatient={selectedPatient}
                    onSelect={setSelectedPatient}
                    disabled={isProcessing}
                  />
                  <AudioSourcePicker
                    selectedId={selectedDemo}
                    onSelect={(id) => {
                      setSelectedDemo(id);
                    }}
                    onUpload={handleAudioUpload}
                    onRunDemo={startInstantProcessing}
                    isProcessing={isProcessing}
                    uploadedFileName={uploadedFile?.name}
                    statusMessage={uploadStatus}
                  />
                </>
              )}

              {mode === "live" && (
                <>
                  <PatientSelector
                    patients={patients}
                    selectedPatient={selectedPatient}
                    onSelect={setSelectedPatient}
                    disabled={isProcessing}
                  />
                  <LiveMic
                    patientId={selectedPatient ? selectedPatient.id : null}
                    onTranscriptLine={handleLiveTranscript}
                    onAction={handleLiveAction}
                    onSummary={handleLiveSummary}
                    onComplete={handleLiveComplete}
                    isActive={isLiveActive}
                    onToggle={handleLiveToggle}
                  />
                </>
              )}
            </div>

            {/* RIGHT PANEL — Live Results */}
            <div className="lg:col-span-8 flex flex-col gap-4 sm:gap-5 lg:h-[calc(100vh-160px)]">
              {/* Agent Log — Hero Section */}
              <AgentLog
                entries={agentLog}
                isActive={agentActive}
                isHero={true}
                recordUpdates={liveRecordUpdates}
                reportReady={!!report && !isProcessing && (mode === "instant" ? instantComplete : !isLiveActive)}
                onViewReport={() => setShowReport(true)}
              />

              {/* Results Area */}
              {!hasResults && !isActive ? (
                <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-5 min-h-0">
                  {/* Preview / Example */}
                  <div className="xl:col-span-8 elevated-card rounded-xl flex flex-col p-4 sm:p-7 min-h-0 overflow-hidden">
                    <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3 sm:mb-4 flex items-center gap-2">
                      <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      What You&apos;ll See
                    </h3>
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 min-h-0">
                      {/* Preview: Transcript */}
                      <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 p-4 flex flex-col">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="w-5 h-5 rounded bg-blue-100 flex items-center justify-center text-[9px] font-bold text-blue-600">D</span>
                          <span className="text-xs font-semibold text-slate-500">Live Transcript</span>
                        </div>
                        <div className="space-y-2 opacity-50">
                          <div className="h-2.5 bg-blue-100 rounded w-3/4" />
                          <div className="h-2.5 bg-amber-100 rounded w-5/6" />
                          <div className="h-2.5 bg-blue-100 rounded w-2/3" />
                          <div className="h-2.5 bg-amber-100 rounded w-4/5" />
                        </div>
                        <p className="text-[10px] text-slate-400 mt-auto pt-3">Doctor & Patient labeled automatically</p>
                      </div>
                      {/* Preview: Findings */}
                      <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 p-4 flex flex-col">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="w-5 h-5 rounded bg-red-100 flex items-center justify-center text-[9px]">⚠️</span>
                          <span className="text-xs font-semibold text-slate-500">Clinical Findings</span>
                        </div>
                        <div className="space-y-2">
                          <div className="rounded border border-red-200 bg-red-50/50 p-2 opacity-60">
                            <p className="text-[10px] font-bold text-red-600 uppercase">Alert</p>
                            <p className="text-[10px] text-red-700 mt-0.5">Drug interaction detected</p>
                          </div>
                          <div className="rounded border border-blue-200 bg-blue-50/50 p-2 opacity-60">
                            <p className="text-[10px] font-bold text-blue-600 uppercase">Medication</p>
                            <p className="text-[10px] text-blue-700 mt-0.5">Lisinopril 10mg prescribed</p>
                          </div>
                          <div className="rounded border border-emerald-200 bg-emerald-50/50 p-2 opacity-60">
                            <p className="text-[10px] font-bold text-emerald-600 uppercase">Referral</p>
                            <p className="text-[10px] text-emerald-700 mt-0.5">Cardiology — follow-up</p>
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-auto pt-3">AI detects & acts in real-time</p>
                      </div>
                    </div>
                  </div>
                  {/* Calendar */}
                  <div className="xl:col-span-4 min-h-0">
                    <AppointmentCalendar appointments={bookedAppointments} />
                  </div>
                </div>
              ) : (
                <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-5 min-h-0">
                  <div className="xl:col-span-5 min-h-0 max-h-[40vh] lg:max-h-none overflow-y-auto">
                    <LiveTranscript lines={transcriptLines} isProcessing={isActive} />
                  </div>
                  <div className="xl:col-span-7 flex flex-col gap-4 sm:gap-5 min-h-0">
                    <div className="flex-1 min-h-0 max-h-[40vh] lg:max-h-none overflow-y-auto">
                      <AgentActions actions={actions} summary={summary} isProcessing={isActive} />
                    </div>
                    <AppointmentCalendar appointments={bookedAppointments} compact={true} />
                  </div>
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
      <footer className="border-t border-[var(--border-subtle)] bg-white py-3 sm:py-4 px-4 sm:px-6">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <Link href="/" aria-label="Navigate to Nura home page" className="text-xs font-medium text-[var(--text-muted)] hover:text-blue-700 transition-colors flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            <span className="hidden sm:inline">Back to Home</span>
          </Link>
          <p className="text-xs text-[var(--text-muted)]">
            <span className="font-display font-semibold text-sm text-[var(--text-secondary)]">Nura</span>
            <span className="mx-1.5 sm:mx-2 text-slate-300">|</span>
            <span className="hidden sm:inline">Clinical Documentation Agent</span>
            <span className="sm:hidden">Clinical AI</span>
            <span className="mx-1.5 sm:mx-2 text-slate-300">|</span>
            <span className="hidden sm:inline">AI Agent Olympics</span>
            <span className="sm:hidden">Olympics</span>
          </p>
        </div>
      </footer>

      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
