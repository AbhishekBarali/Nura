"use client";

import { useRef, useState } from "react";

interface AudioInputProps {
  demos: unknown[];
  selectedDemo: number | null;
  onSelectDemo: (id: number) => void;
  onStart: () => void;
  isProcessing: boolean;
  disabled: boolean;
}

const DEMOS = [
  {
    id: 1,
    name: "Drug Interaction",
    description: "Lisinopril + Ibuprofen — kidney risk detected",
    icon: "💊",
    accent: "cyan",
  },
  {
    id: 2,
    name: "Allergy Conflict",
    description: "Sulfa drug prescribed to allergic patient",
    icon: "🛡️",
    accent: "amber",
  },
  {
    id: 3,
    name: "Urgent Finding",
    description: "Cardiac symptoms → immediate referral",
    icon: "🚨",
    accent: "rose",
  },
];

export default function AudioInput({
  selectedDemo,
  onSelectDemo,
  onStart,
  isProcessing,
  disabled,
}: AudioInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      // For now, selecting a file auto-selects demo 1 as the analysis scenario
      // In production, this would send the actual audio to Speechmatics
      if (!selectedDemo) onSelectDemo(1);
    }
  };

  return (
    <div className="elevated-card rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
            </svg>
          </div>
          <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
            Clinical Scenario
          </label>
        </div>

        {/* Upload audio button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isProcessing}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] bg-[var(--bg-primary)] border border-[var(--border-subtle)] hover:border-[var(--border-medium)] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
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

      {/* Uploaded file indicator */}
      {uploadedFile && (
        <div className="mb-4 flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/8 border border-emerald-500/15">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold text-emerald-300 truncate">{uploadedFile.name}</p>
            <p className="text-[10px] text-[var(--text-muted)]">
              {(uploadedFile.size / 1024 / 1024).toFixed(1)} MB • Ready for analysis
            </p>
          </div>
          <button
            onClick={() => { setUploadedFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
            className="text-[var(--text-muted)] hover:text-rose-400 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Demo scenario cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        {DEMOS.map((demo) => {
          const isSelected = selectedDemo === demo.id;
          const accentMap: Record<string, string> = {
            cyan: isSelected ? "border-cyan-400/50 bg-cyan-500/8 shadow-lg shadow-cyan-500/5" : "border-[var(--border-subtle)] hover:border-cyan-500/30",
            amber: isSelected ? "border-amber-400/50 bg-amber-500/8 shadow-lg shadow-amber-500/5" : "border-[var(--border-subtle)] hover:border-amber-500/30",
            rose: isSelected ? "border-rose-400/50 bg-rose-500/8 shadow-lg shadow-rose-500/5" : "border-[var(--border-subtle)] hover:border-rose-500/30",
          };

          return (
            <button
              key={demo.id}
              onClick={() => onSelectDemo(demo.id)}
              disabled={disabled || isProcessing}
              className={`relative p-4 rounded-xl border text-left transition-all duration-300 bg-[var(--bg-primary)] disabled:opacity-40 disabled:cursor-not-allowed group ${accentMap[demo.accent]}`}
            >
              <div className="flex items-center gap-2.5 mb-2">
                <span className="text-xl">{demo.icon}</span>
                <span className="text-sm font-semibold text-[var(--text-primary)]">{demo.name}</span>
              </div>
              <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">{demo.description}</p>
              {isSelected && (
                <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-cyan-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* Divider with "or" */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 h-px bg-[var(--border-subtle)]" />
        <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
          {uploadedFile ? "File ready" : "Select scenario or upload audio"}
        </span>
        <div className="flex-1 h-px bg-[var(--border-subtle)]" />
      </div>

      {/* Analyze button */}
      <button
        onClick={onStart}
        disabled={!selectedDemo || isProcessing || disabled}
        className={`w-full py-3.5 px-6 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2.5 ${
          isProcessing
            ? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 shimmer"
            : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed"
        }`}
      >
        {isProcessing ? (
          <>
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-breathe" />
            Analyzing Encounter...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Analyze Instantly
          </>
        )}
      </button>
    </div>
  );
}
