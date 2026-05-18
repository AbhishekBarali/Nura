"use client";

import { useEffect, useRef } from "react";
import { TranscriptLine } from "@/lib/types";

interface LiveTranscriptProps {
  lines: TranscriptLine[];
  isProcessing: boolean;
}

export default function LiveTranscript({ lines, isProcessing }: LiveTranscriptProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  return (
    <div className="elevated-card rounded-xl flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[var(--border-subtle)] flex items-center justify-between bg-slate-50">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
          </svg>
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Transcript</h3>
          {lines.length > 0 && (
            <span className="text-xs text-[var(--text-muted)] ml-1">{lines.length} lines</span>
          )}
        </div>
        {isProcessing && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-breathe" />
            <span className="text-[10px] font-semibold text-emerald-700">Live</span>
          </div>
        )}
      </div>

      {/* Transcript body */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-3 space-y-1 scrollbar-thin"
        role="log"
        aria-live="polite"
        aria-relevant="additions"
      >
        {lines.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8 px-4">
            <svg className="w-10 h-10 text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
            </svg>
            <p className="text-sm font-medium text-slate-600 mb-1">Live transcript will appear here</p>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed max-w-[240px]">
              Doctor and patient speech will be transcribed in real-time with speaker labels and timestamps.
            </p>
          </div>
        ) : (
          lines.map((line, index) => (
            <div key={index} className="animate-fade-in py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors">
              <div className="flex items-start gap-3">
                <span
                  className={`flex-shrink-0 mt-0.5 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    line.speaker === "Doctor"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {line.speaker === "Doctor" ? "D" : "P"}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className={`text-xs font-semibold ${
                      line.speaker === "Doctor" ? "text-blue-700" : "text-amber-700"
                    }`}>
                      {line.speaker}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)] font-mono">
                      {formatTimestamp(line.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed mt-0.5">
                    {line.text}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}

        {isProcessing && lines.length > 0 && (
          <div className="flex items-center gap-1.5 pl-9 py-2">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        )}
      </div>
    </div>
  );
}

function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
