"use client";

import { useRef, useState, useEffect, useCallback } from "react";

const SAMPLES = [
  {
    id: 1,
    name: "Acute Headache & Advance Care Planning",
    patient: "Kat, 39yo Female — Stage IV Breast Cancer",
    description: "Complex consultation covering acute headache management in the context of advanced cancer and end-of-life care planning.",
    tags: ["Neurology", "Oncology", "Palliative"],
    audioFile: "/audio/sample-1.mp3",
    accent: "rose",
    duration: 912,
  },
  {
    id: 2,
    name: "Chronic Back Pain — Treatment Planning",
    patient: "Mr. Jones — Recurring Work Injury",
    description: "Follow-up consultation for chronic lower back pain secondary to workplace injury, discussing treatment options and return-to-work planning.",
    tags: ["Musculoskeletal", "Pain Management"],
    audioFile: "/audio/sample-2.mp3",
    accent: "amber",
    duration: 548,
  },
  {
    id: 3,
    name: "Clinical Consultation Recording",
    patient: "Real Patient Encounter",
    description: "General practice consultation covering routine patient assessment and clinical documentation.",
    tags: ["General Practice"],
    audioFile: "/audio/sample-3.mp3",
    accent: "blue",
    duration: 300,
  },
];

interface AudioSourcePickerProps {
  selectedId: number | null;
  onSelect: (id: number) => void;
  onUpload: (file: File) => void;
  onRunDemo: () => void;
  isProcessing: boolean;
  uploadedFileName?: string;
  statusMessage?: string;
}

export default function AudioSourcePicker({
  selectedId,
  onSelect,
  onUpload,
  onRunDemo,
  isProcessing,
  uploadedFileName,
  statusMessage,
}: AudioSourcePickerProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioReady, setAudioReady] = useState(false);

  const activeSample = SAMPLES.find((s) => s.id === selectedId);

  // Draw waveform visualization
  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(dataArray);

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, width, 0);
    bgGrad.addColorStop(0, "rgba(59, 130, 246, 0.03)");
    bgGrad.addColorStop(0.5, "rgba(59, 130, 246, 0.06)");
    bgGrad.addColorStop(1, "rgba(59, 130, 246, 0.03)");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Center line
    ctx.strokeStyle = "rgba(148, 163, 184, 0.3)";
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    // Waveform
    ctx.lineWidth = 2;
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, "#3b82f6");
    gradient.addColorStop(0.5, "#6366f1");
    gradient.addColorStop(1, "#3b82f6");
    ctx.strokeStyle = gradient;
    ctx.beginPath();

    const sliceWidth = width / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0;
      const y = (v * height) / 2;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
      x += sliceWidth;
    }

    ctx.lineTo(width, height / 2);
    ctx.stroke();

    // Glow effect
    ctx.shadowColor = "#3b82f6";
    ctx.shadowBlur = 4;
    ctx.stroke();
    ctx.shadowBlur = 0;

    animFrameRef.current = requestAnimationFrame(drawWaveform);
  }, []);

  // Draw static waveform bars when not playing
  const drawStaticWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Background
    const bgGrad = ctx.createLinearGradient(0, 0, width, 0);
    bgGrad.addColorStop(0, "rgba(59, 130, 246, 0.02)");
    bgGrad.addColorStop(0.5, "rgba(59, 130, 246, 0.04)");
    bgGrad.addColorStop(1, "rgba(59, 130, 246, 0.02)");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Static bars
    const barCount = 60;
    const barWidth = width / barCount - 1;
    const progress = duration > 0 ? currentTime / duration : 0;

    for (let i = 0; i < barCount; i++) {
      const barProgress = i / barCount;
      // Generate pseudo-random heights that look like audio
      const seed = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
      const h = (Math.abs(seed - Math.floor(seed)) * 0.6 + 0.2) * height * 0.8;

      const x = i * (barWidth + 1);
      const y = (height - h) / 2;

      if (barProgress <= progress) {
        ctx.fillStyle = "rgba(59, 130, 246, 0.8)";
      } else {
        ctx.fillStyle = "rgba(148, 163, 184, 0.3)";
      }
      ctx.fillRect(x, y, barWidth, h);
    }
  }, [currentTime, duration]);

  // Setup audio context for visualization
  const setupAudioContext = useCallback(() => {
    if (!audioRef.current || audioCtxRef.current) return;

    const audioCtx = new AudioContext();
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;

    const source = audioCtx.createMediaElementSource(audioRef.current);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);

    audioCtxRef.current = audioCtx;
    analyserRef.current = analyser;
    sourceRef.current = source;
  }, []);

  // Handle play/pause
  const togglePlayback = useCallback(() => {
    if (!audioRef.current || !activeSample) return;

    if (!audioCtxRef.current) {
      setupAudioContext();
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      cancelAnimationFrame(animFrameRef.current);
    } else {
      if (audioCtxRef.current?.state === "suspended") {
        audioCtxRef.current.resume();
      }
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
      drawWaveform();
    }
  }, [isPlaying, activeSample, setupAudioContext, drawWaveform]);

  // Handle seek — works while playing, no need to pause
  const handleSeek = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!audioRef.current || !canvasRef.current || !duration) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const seekTime = (x / rect.width) * duration;
    audioRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
    // If not already playing, start playback from seek position
    if (!isPlaying) {
      if (!audioCtxRef.current) setupAudioContext();
      if (audioCtxRef.current?.state === "suspended") audioCtxRef.current.resume();
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
      drawWaveform();
    }
  };

  // Update time
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => {
      setDuration(audio.duration);
      setAudioReady(true);
    };
    const onEnded = () => {
      setIsPlaying(false);
      cancelAnimationFrame(animFrameRef.current);
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  // Load audio when selection changes
  useEffect(() => {
    if (!audioRef.current || !activeSample) return;
    const wasPlaying = isPlaying;
    if (wasPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      cancelAnimationFrame(animFrameRef.current);
    }
    audioRef.current.src = activeSample.audioFile;
    audioRef.current.load();
    setCurrentTime(0);
    setAudioReady(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  // Draw static waveform when not playing
  useEffect(() => {
    if (!isPlaying) {
      drawStaticWaveform();
    }
  }, [isPlaying, currentTime, duration, drawStaticWaveform]);

  // Cleanup
  useEffect(() => {
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const accentColors: Record<string, string> = {
    rose: "border-rose-400 bg-rose-50",
    amber: "border-amber-400 bg-amber-50",
    blue: "border-blue-400 bg-blue-50",
  };

  return (
    <div className="elevated-card rounded-xl p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Select Audio</h3>
          <p className="text-[10px] text-[var(--text-muted)]">Clinical recordings — transcribed & analyzed live</p>
        </div>
      </div>

      {/* Audio element (hidden) */}
      <audio ref={audioRef} preload="metadata" crossOrigin="anonymous" />

      {/* Sample Cards */}
      <div className="space-y-2">
        {SAMPLES.map((sample) => (
          <button
            key={sample.id}
            onClick={() => onSelect(sample.id)}
            disabled={isProcessing}
            className={`w-full text-left px-3 py-2.5 rounded-lg border-l-[3px] border transition-all text-sm group ${
              selectedId === sample.id
                ? `${accentColors[sample.accent]} ring-1 ring-blue-200 shadow-sm`
                : "border-l-transparent border-[var(--border-subtle)] hover:border-l-blue-300 hover:bg-slate-50"
            } ${isProcessing ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <span className="font-semibold text-[var(--text-primary)] text-[13px] leading-tight block">{sample.name}</span>
                <span className="text-[11px] text-[var(--text-muted)] mt-0.5 block truncate">{sample.patient}</span>
              </div>
              {selectedId === sample.id && (
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                </span>
              )}
            </div>
            {selectedId === sample.id && (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {sample.tags.map((tag) => (
                  <span key={tag} className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-white/80 text-slate-600 border border-slate-200">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Waveform Player — shows when a sample is selected */}
      {activeSample && (
        <div className="rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 p-3 space-y-2.5 shadow-lg">
          {/* Now Playing header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isPlaying && (
                <span className="flex gap-0.5 items-end h-3">
                  <span className="w-[2px] h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: "0ms" }} />
                  <span className="w-[2px] h-3 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: "150ms" }} />
                  <span className="w-[2px] h-1.5 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: "300ms" }} />
                  <span className="w-[2px] h-2.5 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: "100ms" }} />
                </span>
              )}
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.08em]">
                {isPlaying ? "Now Playing" : "Ready"}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">
              {formatTime(currentTime)} / {formatTime(duration || activeSample.duration)}
            </span>
          </div>

          {/* Waveform canvas */}
          <canvas
            ref={canvasRef}
            width={400}
            height={50}
            className="w-full h-[50px] rounded-lg cursor-pointer"
            onClick={handleSeek}
          />

          {/* Controls */}
          <div className="flex items-center justify-between">
            <button
              onClick={togglePlayback}
              disabled={!audioReady}
              className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-500 flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
            >
              {isPlaying ? (
                <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
            <p className="text-[11px] text-slate-400 truncate max-w-[200px]">{activeSample.name}</p>
          </div>
        </div>
      )}

      {/* Upload option */}
      <div className="pt-1 border-t border-[var(--border-subtle)]">
        <input
          ref={fileRef}
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onUpload(file);
          }}
        />
        <button
          onClick={() => fileRef.current?.click()}
          disabled={isProcessing}
          className="w-full text-left px-3 py-3 rounded-lg border border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
              <svg className="w-4 h-4 text-slate-500 group-hover:text-blue-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <div>
              <span className="font-semibold text-[var(--text-primary)] text-[13px] block">
                {uploadedFileName ? `📎 ${uploadedFileName}` : "Upload Your Own Recording"}
              </span>
              <span className="text-[11px] text-[var(--text-muted)]">
                MP3, WAV, M4A — transcribed via Speechmatics
              </span>
            </div>
          </div>
        </button>
      </div>

      {/* Run Analysis button */}
      <button
        onClick={onRunDemo}
        disabled={isProcessing || (!selectedId && !uploadedFileName)}
        className="w-full px-4 py-3 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
      >
        {isProcessing ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {statusMessage || "Transcribing…"}
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
            </svg>
            Run Analysis
          </>
        )}
      </button>
    </div>
  );
}
