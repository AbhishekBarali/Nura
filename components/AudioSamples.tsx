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
  },
  {
    id: 2,
    name: "Chronic Back Pain — Treatment Planning",
    patient: "Mr. Jones — Recurring Work Injury",
    description: "Follow-up consultation for chronic lower back pain secondary to workplace injury, discussing treatment options and return-to-work planning.",
    tags: ["Musculoskeletal", "Pain Management"],
    audioFile: "/audio/sample-2.mp3",
    accent: "amber",
  },
  {
    id: 3,
    name: "Clinical Consultation Recording",
    patient: "Real Patient Encounter",
    description: "General practice consultation covering routine patient assessment and clinical documentation.",
    tags: ["General Practice"],
    audioFile: "/audio/sample-3.mp3",
    accent: "blue",
  },
];

export default function AudioSamples() {
  const [activeSample, setActiveSample] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const activeSampleData = SAMPLES.find((s) => s.id === activeSample);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  const loadSample = useCallback((id: number) => {
    const sample = SAMPLES.find((s) => s.id === id);
    if (!sample || !audioRef.current) return;

    if (activeSample === id && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    if (activeSample === id && !isPlaying) {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
      return;
    }

    // Load new sample
    setLoading(true);
    setActiveSample(id);
    setCurrentTime(0);
    setDuration(0);
    audioRef.current.src = sample.audioFile;
    audioRef.current.load();
  }, [activeSample, isPlaying]);

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      setLoading(false);
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !progressRef.current || duration === 0) return;
    const rect = progressRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, x / rect.width));
    const newTime = percent * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const togglePlayPause = () => {
    if (!audioRef.current || !activeSample) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const formatTime = (seconds: number) => {
    if (!seconds || !isFinite(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="elevated-card rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[var(--border-subtle)] bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-blue-100 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Real Audio Samples</h3>
            <p className="text-[10px] text-[var(--text-muted)]">Listen to actual clinical recordings</p>
          </div>
        </div>
      </div>

      {/* Hidden audio element — no src until user clicks play */}
      <audio
        ref={audioRef}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onError={() => setLoading(false)}
        preload="none"
      />

      {/* Sample list */}
      <div className="p-3 space-y-2">
        {SAMPLES.map((sample) => {
          const isActive = activeSample === sample.id;
          const isThisPlaying = isActive && isPlaying;

          const accentColors: Record<string, { bg: string; border: string; dot: string; tag: string }> = {
            rose: { bg: "bg-rose-50", border: "border-rose-200", dot: "bg-rose-500", tag: "bg-rose-100 text-rose-700" },
            amber: { bg: "bg-amber-50", border: "border-amber-200", dot: "bg-amber-500", tag: "bg-amber-100 text-amber-700" },
            blue: { bg: "bg-blue-50", border: "border-blue-200", dot: "bg-blue-500", tag: "bg-blue-100 text-blue-700" },
          };
          const colors = accentColors[sample.accent] || accentColors.blue;

          return (
            <div
              key={sample.id}
              className={`rounded-lg border p-3 transition-all duration-200 ${
                isActive
                  ? `${colors.bg} ${colors.border} shadow-sm`
                  : "border-[var(--border-subtle)] hover:border-slate-300 bg-white"
              }`}
            >
              {/* Sample info row */}
              <div className="flex items-start gap-3">
                {/* Play/pause button */}
                <button
                  onClick={() => loadSample(sample.id)}
                  className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                    isThisPlaying
                      ? `${colors.dot} text-white shadow-md`
                      : isActive
                      ? "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
                      : "bg-slate-100 border border-slate-200 text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  {loading && isActive ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : isThisPlaying ? (
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                    </svg>
                  ) : (
                    <svg className="w-3.5 h-3.5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold text-[var(--text-primary)] truncate">{sample.name}</span>
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)] mt-0.5 leading-relaxed">{sample.patient}</p>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {sample.tags.map((tag) => (
                      <span key={tag} className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${colors.tag}`}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Player controls — only show when active */}
              {isActive && (
                <div className="mt-3 pt-3 border-t border-dashed border-slate-200">
                  <p className="text-[10px] text-[var(--text-muted)] mb-2 leading-relaxed line-clamp-2">{sample.description}</p>

                  {/* Progress bar (clickable for seeking) */}
                  <div
                    ref={activeSample === sample.id ? progressRef : undefined}
                    onClick={handleSeek}
                    className="relative h-2 bg-slate-200 rounded-full overflow-hidden cursor-pointer group"
                  >
                    <div
                      className={`absolute inset-y-0 left-0 rounded-full transition-[width] duration-100 ${colors.dot}`}
                      style={{ width: `${progress}%` }}
                    />
                    {/* Seek handle */}
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-slate-400 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ left: `calc(${progress}% - 6px)` }}
                    />
                  </div>

                  {/* Time */}
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-[10px] text-[var(--text-muted)] font-mono">{formatTime(currentTime)}</span>
                    <span className="text-[10px] text-[var(--text-muted)] font-mono">{formatTime(duration)}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <div className="px-4 py-2.5 border-t border-[var(--border-subtle)] bg-slate-50">
        <p className="text-[10px] text-[var(--text-muted)] text-center">
          Real clinical recordings — tap play to listen, click progress bar to seek
        </p>
      </div>
    </div>
  );
}
