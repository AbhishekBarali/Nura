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

// Generate unique deterministic waveform bars per sample
function generateWaveformBars(sampleId: number, barCount: number): number[] {
  const bars: number[] = [];
  for (let i = 0; i < barCount; i++) {
    // Use sample id + index to create unique patterns per sample
    const seed = Math.sin((i + 1) * 12.9898 + sampleId * 78.233) * 43758.5453;
    const val = Math.abs(seed - Math.floor(seed));
    // Create more natural audio-looking pattern with varying heights
    const envelope = Math.sin((i / barCount) * Math.PI) * 0.3 + 0.7;
    const noise = val * 0.6 + 0.25;
    bars.push(noise * envelope);
  }
  return bars;
}

// Pre-generate waveforms for each sample so they look different
const SAMPLE_WAVEFORMS: Record<number, number[]> = {
  1: generateWaveformBars(1, 50),
  2: generateWaveformBars(2, 50),
  3: generateWaveformBars(3, 50),
};

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
  const blobUrlRef = useRef<string | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioReady, setAudioReady] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);

  const activeSample = SAMPLES.find((s) => s.id === selectedId);

  // Load audio via fetch + blob to bypass IDM interception
  const loadAudioBlob = useCallback(async (url: string) => {
    setLoadingAudio(true);
    setAudioReady(false);

    // Revoke previous blob URL
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }

    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      blobUrlRef.current = blobUrl;

      if (audioRef.current) {
        audioRef.current.src = blobUrl;
        audioRef.current.load();
      }
    } catch {
      setLoadingAudio(false);
    }
  }, []);

  // Handle play/pause
  const togglePlayback = useCallback(() => {
    if (!audioRef.current || !audioReady) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  }, [isPlaying, audioReady]);

  // Handle seek on waveform bar click
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const seekTime = (x / rect.width) * duration;
    audioRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
    if (!isPlaying) {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  // Audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => {
      setDuration(audio.duration);
      setAudioReady(true);
      setLoadingAudio(false);
    };
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    const onError = () => setLoadingAudio(false);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
    };
  }, []);

  // Load audio when selection changes
  useEffect(() => {
    if (!activeSample) return;
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    setCurrentTime(0);
    setAudioReady(false);
    loadAudioBlob(activeSample.audioFile);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }
    };
  }, []);

  const formatTime = (s: number) => {
    if (!s || !isFinite(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const progress = duration > 0 ? currentTime / duration : 0;

  // Unified blue accent for selection state
  const selectedStyle = "border-blue-200 bg-blue-50/60 ring-1 ring-blue-200 shadow-sm";

  return (
    <div className="elevated-card rounded-xl p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
          <svg className="w-3.5 h-3.5 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Clinical Audio Samples</h3>
          <p className="text-[10px] text-[var(--text-muted)]">Real consultation recordings — transcribed & analyzed live</p>
        </div>
      </div>

      {/* Hidden audio element — blob src set programmatically */}
      <audio ref={audioRef} preload="auto" />

      {/* Sample Cards */}
      <div className="space-y-2">
        {SAMPLES.map((sample) => {
          const isActive = selectedId === sample.id;
          const bars = SAMPLE_WAVEFORMS[sample.id];

          return (
            <button
              key={sample.id}
              onClick={() => onSelect(sample.id)}
              disabled={isProcessing}
              className={`w-full text-left px-3 py-2.5 rounded-lg border transition-all text-sm group ${
                isActive
                  ? selectedStyle
                  : "border-[var(--border-subtle)] hover:border-blue-200 hover:bg-slate-50"
              } ${isProcessing ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-[var(--text-primary)] text-[13px] leading-tight block">{sample.name}</span>
                  <span className="text-[11px] text-[var(--text-muted)] mt-0.5 block truncate">{sample.patient}</span>
                </div>
                {isActive && (
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                  </span>
                )}
              </div>

              {/* Mini waveform preview — unique per sample */}
              <div className="mt-2 flex items-end gap-[1px] h-5 opacity-60">
                {bars.map((h, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-sm transition-colors ${
                      isActive ? "bg-blue-500/70" : "bg-slate-300"
                    }`}
                    style={{ height: `${h * 100}%` }}
                  />
                ))}
              </div>

              {isActive && (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {sample.tags.map((tag) => (
                    <span key={tag} className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-white/80 text-slate-600 border border-slate-200">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Waveform Player — shows when a sample is selected */}
      {activeSample && (
        <div className="rounded-xl bg-slate-50 border border-[var(--border-subtle)] p-3 space-y-2.5">
          {/* Now Playing header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isPlaying && (
                <span className="flex gap-0.5 items-end h-3">
                  <span className="w-[2px] h-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: "0ms" }} />
                  <span className="w-[2px] h-3 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: "150ms" }} />
                  <span className="w-[2px] h-1.5 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: "300ms" }} />
                  <span className="w-[2px] h-2.5 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: "100ms" }} />
                </span>
              )}
              <span className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-[0.08em]">
                {loadingAudio ? "Loading…" : isPlaying ? "Now Playing" : "Ready"}
              </span>
            </div>
            <span className="text-[10px] text-[var(--text-muted)] font-mono">
              {formatTime(currentTime)} / {formatTime(duration || activeSample.duration)}
            </span>
          </div>

          {/* Waveform bars — interactive, unique per sample */}
          <div
            className="relative h-[50px] flex items-end gap-[1px] cursor-pointer rounded-lg overflow-hidden px-1"
            onClick={handleSeek}
          >
            {SAMPLE_WAVEFORMS[activeSample.id].map((h, i) => {
              const barProgress = i / SAMPLE_WAVEFORMS[activeSample.id].length;
              const isPast = barProgress <= progress;

              return (
                <div
                  key={i}
                  className="flex-1 rounded-sm transition-all duration-75"
                  style={{
                    height: `${h * 100}%`,
                    backgroundColor: isPast ? "oklch(44% 0.19 260)" : "oklch(85% 0.01 250 / 0.5)",
                  }}
                />
              );
            })}

            {/* Progress indicator line */}
            <div
              className="absolute top-0 bottom-0 w-[2px] bg-blue-700 rounded-full transition-all duration-100"
              style={{ left: `${progress * 100}%` }}
            />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <button
              onClick={togglePlayback}
              disabled={!audioReady && !loadingAudio}
              className="w-8 h-8 rounded-full bg-blue-700 hover:bg-blue-600 flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            >
              {loadingAudio ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isPlaying ? (
                <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
            <p className="text-[11px] text-[var(--text-muted)] truncate max-w-[200px]">{activeSample.name}</p>
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
                {uploadedFileName ? uploadedFileName : "Upload Your Own Recording"}
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
        className="w-full px-4 py-3 bg-blue-700 hover:bg-blue-600 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
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
