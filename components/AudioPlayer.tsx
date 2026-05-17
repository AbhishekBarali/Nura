"use client";

import { useState } from "react";
import { TranscriptLine } from "@/lib/types";

interface AudioPlayerProps {
  isPlaying: boolean;
  duration: number;
  currentTime: number;
  transcriptLines: TranscriptLine[];
}

export default function AudioPlayer({ isPlaying, duration, currentTime }: AudioPlayerProps) {
  const [waveformBars] = useState(() =>
    Array.from({ length: 80 }, () => Math.random() * 0.7 + 0.3)
  );

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="elevated-card rounded-2xl p-4">
      <div className="flex items-center gap-4">
        {/* Play indicator */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
          isPlaying
            ? "bg-cyan-500/15 border border-cyan-500/30"
            : "bg-[var(--bg-surface)] border border-[var(--border-subtle)]"
        }`}>
          {isPlaying ? (
            <div className="flex items-center gap-[3px]">
              <span className="w-[3px] h-4 rounded-full bg-cyan-400 animate-bounce" style={{ animationDuration: "0.6s" }} />
              <span className="w-[3px] h-3 rounded-full bg-cyan-400 animate-bounce" style={{ animationDuration: "0.6s", animationDelay: "0.15s" }} />
              <span className="w-[3px] h-5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDuration: "0.6s", animationDelay: "0.3s" }} />
            </div>
          ) : (
            <svg className="w-4 h-4 text-[var(--text-muted)]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </div>

        {/* Waveform + progress */}
        <div className="flex-1">
          <div className="flex items-end gap-[1.5px] h-8 mb-2">
            {waveformBars.map((height, i) => {
              const barProgress = (i / waveformBars.length) * 100;
              const isPast = barProgress < progress;
              const isCurrent = Math.abs(barProgress - progress) < 1.5;

              return (
                <div
                  key={i}
                  className={`flex-1 rounded-full transition-all duration-100 ${
                    isCurrent
                      ? "bg-cyan-300"
                      : isPast
                      ? "bg-cyan-500/50"
                      : "bg-[var(--bg-surface)]"
                  }`}
                  style={{
                    height: `${height * 100}%`,
                    transform: isPlaying && isCurrent ? "scaleY(1.3)" : "scaleY(1)",
                  }}
                />
              );
            })}
          </div>

          {/* Progress bar */}
          <div className="relative h-[3px] bg-[var(--bg-surface)] rounded-full overflow-hidden">
            <div
              className={`absolute left-0 top-0 h-full rounded-full transition-all duration-200 ${
                isPlaying ? "bg-cyan-400 progress-glow" : "bg-cyan-500/60"
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Time */}
        <span className="flex-shrink-0 text-[11px] font-mono text-[var(--text-muted)] tabular-nums">
          {formatTime(currentTime)}<span className="text-[var(--text-muted)]/40"> / </span>{formatTime(duration)}
        </span>
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
