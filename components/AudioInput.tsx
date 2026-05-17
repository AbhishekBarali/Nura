"use client";

interface Demo {
  id: number;
  name: string;
  description: string;
}

interface AudioInputProps {
  demos: Demo[];
  selectedDemo: number | null;
  onSelectDemo: (id: number) => void;
  onStart: () => void;
  isProcessing: boolean;
  disabled: boolean;
}

const DEMOS: Demo[] = [
  { id: 1, name: "Drug Interaction", description: "Lisinopril + Ibuprofen conflict" },
  { id: 2, name: "Allergy Conflict", description: "Sulfa drug prescribed to allergic patient" },
  { id: 3, name: "Urgent Finding", description: "Cardiac symptoms requiring referral" },
];

export default function AudioInput({
  selectedDemo,
  onSelectDemo,
  onStart,
  isProcessing,
  disabled,
}: AudioInputProps) {
  return (
    <div className="bg-[#12121a] border border-[#1e1e2e] rounded-xl p-4">
      <label className="block text-sm font-medium text-gray-300 mb-3">
        Select Demo Scenario
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        {DEMOS.map((demo) => (
          <button
            key={demo.id}
            onClick={() => onSelectDemo(demo.id)}
            disabled={disabled || isProcessing}
            className={`p-3 rounded-lg border text-left transition-all ${
              selectedDemo === demo.id
                ? "border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500/30"
                : "border-[#2e2e3e] bg-[#0a0a0f] hover:border-[#3e3e4e]"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">
                {demo.id === 1 ? "💊" : demo.id === 2 ? "⚠️" : "🚨"}
              </span>
              <span className="text-sm font-medium text-white">{demo.name}</span>
            </div>
            <p className="text-xs text-gray-400">{demo.description}</p>
          </button>
        ))}
      </div>

      <button
        onClick={onStart}
        disabled={!selectedDemo || isProcessing || disabled}
        className={`w-full py-3 px-6 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
          isProcessing
            ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
            : "bg-indigo-600 hover:bg-indigo-500 text-white disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed"
        }`}
      >
        {isProcessing ? (
          <>
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            Analyzing...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Analyze Instantly
          </>
        )}
      </button>
    </div>
  );
}
