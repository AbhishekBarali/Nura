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
    accent: "red",
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
                {isSelected && (
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                )}
              </div>
            </button>
          );
        })}
      </div>

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

      <p className="text-[10px] text-[var(--text-muted)] text-center mt-2">
        No patient selection required — AI auto-detects from conversation
      </p>
    </div>
  );
}
