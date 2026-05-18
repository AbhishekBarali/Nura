"use client";

import { useState, useEffect, useRef } from "react";

interface OnboardingProps {
  onComplete: () => void;
}

const STEPS = [
  {
    id: "welcome",
    title: "Welcome to Nura",
    subtitle: "Your autonomous clinical voice agent",
    description:
      "Nura listens to doctor-patient conversations and autonomously detects drug interactions, flags allergy conflicts, routes referrals, and generates SOAP notes — all in real-time.",
    icon: (
      <svg className="w-12 h-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
      </svg>
    ),
    hint: "~30 seconds to get started",
  },
  {
    id: "how-it-works",
    title: "How to Try It",
    subtitle: "Two ways to experience Nura",
    description: "We'll start with a pre-recorded clinical consultation so you can see Nura in action right away.",
    icon: (
      <svg className="w-12 h-12 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
      </svg>
    ),
    features: [
      { label: "Auto-Demo", desc: "Click 'Start Demo' and we'll run a real consultation through the full pipeline automatically", icon: "⚡", num: 1 },
      { label: "Pick a Recording", desc: "After the demo, choose from 3 clinical recordings or upload your own audio", icon: "🎧", num: 2 },
      { label: "Go Live", desc: "Switch to Live Mic mode and speak — Nura transcribes & analyzes in real-time", icon: "🎙️", num: 3 },
    ],
  },
  {
    id: "what-to-expect",
    title: "What You'll See",
    subtitle: "Nura acts autonomously on your behalf",
    description: "As the conversation plays, Nura will:",
    icon: (
      <svg className="w-12 h-12 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.348 14.651a3.75 3.75 0 010-5.303m5.304 0a3.75 3.75 0 010 5.303m-7.425 2.122a6.75 6.75 0 010-9.546m9.546 0a6.75 6.75 0 010 9.546M5.106 18.894c-3.808-3.808-3.808-9.98 0-13.789m13.788 0c3.808 3.808 3.808 9.981 0 13.79M12 12h.008v.007H12V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
      </svg>
    ),
    actions: [
      { label: "Transcribe", desc: "Live speaker-labeled transcript", color: "bg-emerald-50 border-emerald-200 text-emerald-700" },
      { label: "Detect", desc: "Drug interactions & allergy conflicts", color: "bg-red-50 border-red-200 text-red-700" },
      { label: "Act", desc: "Send referrals, update records, book appointments", color: "bg-blue-50 border-blue-200 text-blue-700" },
      { label: "Report", desc: "Generate complete SOAP note", color: "bg-violet-50 border-violet-200 text-violet-700" },
    ],
  },
];

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Always show onboarding for hackathon judges — no localStorage skip
  useEffect(() => {
    // Clear any previous session so guide always appears
    localStorage.removeItem("nura-onboarding-completed");
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleComplete();
        return;
      }
      if (e.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible]);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    setIsVisible(false);
    onComplete();
  };

  if (!isVisible) return null;

  const step = STEPS[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="onboarding-title" ref={dialogRef}>
      <div className="relative w-full max-w-lg mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Progress bar */}
        <div className="h-1 bg-slate-100">
          <div
            className="h-full bg-blue-600 transition-all duration-500 ease-out"
            style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        {/* Skip button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-100"
        >
          Skip
        </button>

        {/* Content */}
        <div className="px-10 pt-12 pb-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center">
              {step.icon}
            </div>
          </div>

          {/* Text */}
          <div className="text-center mb-8">
            <h2 id="onboarding-title" className="text-[1.75rem] font-display font-bold text-slate-900 mb-1.5 leading-tight">{step.title}</h2>
            <p className="text-base font-medium text-blue-600 mb-4">{step.subtitle}</p>
            <p className="text-[15px] text-slate-600 leading-relaxed max-w-sm mx-auto">{step.description}</p>
            {step.hint && (
              <span className="inline-block mt-3 text-sm text-slate-400 italic">{step.hint}</span>
            )}
          </div>

          {/* Step-specific content */}
          {step.features && (
            <div className="space-y-3 mb-8">
              {step.features.map((f) => (
                <div key={f.label} className="flex items-start gap-4 px-5 py-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center">
                    <span className="text-xs font-bold text-blue-700">{(f as { num?: number }).num}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-bold text-slate-800">{f.label}</p>
                    <p className="text-sm text-slate-500 leading-relaxed mt-0.5">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {step.actions && (
            <div className="grid grid-cols-2 gap-3 mb-8">
              {step.actions.map((a) => (
                <div key={a.label} className={`px-4 py-3.5 rounded-xl border ${a.color}`}>
                  <p className="text-sm font-bold">{a.label}</p>
                  <p className="text-xs opacity-75 mt-1 leading-relaxed">{a.desc}</p>
                </div>
              ))}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex gap-2">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    i === currentStep ? "bg-blue-600 w-7" : i < currentStep ? "bg-blue-300 w-2.5" : "bg-slate-200 w-2.5"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="px-7 py-3 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm flex items-center gap-2"
            >
              {currentStep === STEPS.length - 1 ? "Start Demo" : "Next"}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
