"use client";

interface AudioInputProps {
  onStart: () => void;
  isProcessing: boolean;
}

export default function AudioInput({
  onStart,
  isProcessing,
}: AudioInputProps) {
  return (
    <button
      onClick={onStart}
      disabled={isProcessing}
      className={`w-full py-4 px-6 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-3 shadow-sm ${
        isProcessing
          ? "bg-blue-50 text-blue-700 border-2 border-blue-200 shimmer"
          : "bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-800 hover:to-blue-900 text-white disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
      }`}
    >
      {isProcessing ? (
        <>
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-breathe" />
          Analyzing...
        </>
      ) : (
        <>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Run Instant Demo
        </>
      )}
    </button>
  );
}
