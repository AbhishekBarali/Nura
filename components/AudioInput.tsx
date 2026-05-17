"use client";

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
  return (
    <div className="elevated-card rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center">
          <svg className="w-3.5 h-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
          </svg>
        </div>
        <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
          Clinical Scenario
        </label>
      </div>

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
