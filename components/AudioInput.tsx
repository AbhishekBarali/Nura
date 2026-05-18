"use client";

import { useRef } from "react";

interface AudioInputProps {
  demos?: unknown[];
  selectedDemo: number | null;
  onSelectDemo: (id: number) => void;
  onStart: () => void;
  onFileUpload: (file: File) => void;
  isProcessing: boolean;
  disabled?: boolean;
}

const DEMOS = [
  {
    id: 1,
    name: "Drug Interaction",
    description: "Lisinopril + Ibuprofen — kidney risk detected",
    icon: "💊",
    accent: "blue",
    duration: "2:14",
  },
  {
    id: 2,
    name: "Allergy Conflict",
    description: "Sulfa drug prescribed to allergic patient",
    icon: "🛡️",
    accent: "amber",
    duration: "1:48",
  },
  {
    id: 3,
    name: "Urgent Finding",
    description: "Cardiac symptoms → immediate referral",
    icon: "🚨",
    accent: "red",
    duration: "3:02",
  },
];

export default function AudioInput({
  selectedDemo,
  onSelectDemo,
  onStart,
  onFileUpload,
  isProcessing,
}: AudioInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  };

  const selectedDemoData = DEMOS.find((d) => d.id === selectedDemo);

  return (
    <div className="elevated-card rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
          </svg>
          <label className="text-sm font-semibold text-[var(--text-primary)]">
            Clinical Scenario
          </label>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          Upload Audio
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*,.wav,.mp3,.m4a,.ogg,.webm"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {/* Demo scenario cards */}
      <div className="grid grid-cols-1 gap-2 mb-4">
        {DEMOS.map((demo) => {
          const isSelected = selectedDemo === demo.id;
          const accentMap: Record<string, string> = {
            blue: isSelected ? "border-blue-300 bg-blue-50 shadow-sm" : "border-[var(--border-subtle)] hover:border-blue-200 hover:bg-blue-50/50",
            amber: isSelected ? "border-amber-300 bg-amber-50 shadow-sm" : "border-[var(--border-subtle)] hover:border-amber-200 hover:bg-amber-50/50",
            red: isSelected ? "border-red-300 bg-red-50 shadow-sm" : "border-[var(--border-subtle)] hover:border-red-200 hover:bg-red-50/50",
          };

          return (
            <button
              key={demo.id}
              onClick={() => onSelectDemo(demo.id)}
              disabled={isProcessing}
              aria-pressed={isSelected}
              className={`relative p-3 rounded-lg border text-left transition-all duration-200 bg-white disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:ring-offset-1 ${accentMap[demo.accent]}`}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-lg">{demo.icon}</span>
                <div className="flex-1">
                  <span className="text-sm font-semibold text-[var(--text-primary)]">{demo.name}</span>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">{demo.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[var(--text-muted)] font-mono">{demo.duration}</span>
                  {isSelected && (
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Audio Player Visualization */}
      {selectedDemoData && (
        <div className="mb-4 rounded-lg bg-slate-900 border border-slate-700 p-3.5 overflow-hidden">
          <div className="flex items-center gap-3">
            {/* Play/Processing indicator */}
            <div className="flex-shrink-0">
              {isProcessing ? (
                <div className="w-9 h-9 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                  <div className="flex items-center gap-[3px]">
                    <span className="w-[3px] h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-[3px] h-4 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-[3px] h-2.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    <span className="w-[3px] h-3.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "100ms" }} />
                  </div>
                </div>
              ) : (
                <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center">
                  <svg className="w-4 h-4 text-slate-400 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Waveform visualization */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-semibold text-white truncate">{selectedDemoData.name}</span>
                {isProcessing && (
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider animate-pulse">Transcribing...</span>
                )}
              </div>
              {/* Waveform bars */}
              <div className="flex items-end gap-[2px] h-5">
                {Array.from({ length: 40 }).map((_, i) => {
                  const height = Math.random() * 100;
                  return (
                    <div
                      key={i}
                      className={`flex-1 rounded-full min-w-[2px] transition-all duration-300 ${
                        isProcessing
                          ? "bg-blue-400/70 animate-pulse"
                          : "bg-slate-600"
                      }`}
                      style={{
                        height: `${Math.max(15, height)}%`,
                        animationDelay: isProcessing ? `${i * 50}ms` : undefined,
                      }}
                    />
                  );
                })}
              </div>
              {/* Duration */}
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-[10px] text-slate-500 font-mono">
                  {isProcessing ? "0:00" : "0:00"}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">{selectedDemoData.duration}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analyze button */}
      <button
        onClick={onStart}
        disabled={!selectedDemo || isProcessing}
        className={`w-full py-3 px-6 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2.5 ${
          isProcessing
            ? "bg-blue-50 text-blue-700 border border-blue-200 shimmer"
            : "bg-blue-700 hover:bg-blue-800 text-white disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
        }`}
      >
        {isProcessing ? (
          <>
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-breathe" />
            Transcribing & Analyzing...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Analyze Encounter
          </>
        )}
      </button>

      <p className="text-[10px] text-[var(--text-muted)] text-center mt-2">
        AI transcribes audio, identifies speakers, and analyzes in real-time
      </p>
    </div>
  );
}
