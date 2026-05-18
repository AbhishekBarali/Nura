"use client";

import { useState, useEffect, ReactNode } from "react";

interface ContextualTipProps {
  id: string;
  children: ReactNode;
  tip: string;
  position?: "top" | "bottom" | "left" | "right";
  delay?: number;
}

export default function ContextualTip({ id, children, tip, position = "top", delay = 500 }: ContextualTipProps) {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const key = `nura-tip-${id}`;
    const seen = localStorage.getItem(key);
    if (!seen) {
      const timer = setTimeout(() => {
        setDismissed(false);
        setShow(true);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [id, delay]);

  const handleDismiss = () => {
    localStorage.setItem(`nura-tip-${id}`, "true");
    setShow(false);
    setDismissed(true);
  };

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  const arrowClasses = {
    top: "top-full left-1/2 -translate-x-1/2 border-t-slate-800 border-x-transparent border-b-transparent",
    bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-slate-800 border-x-transparent border-t-transparent",
    left: "left-full top-1/2 -translate-y-1/2 border-l-slate-800 border-y-transparent border-r-transparent",
    right: "right-full top-1/2 -translate-y-1/2 border-r-slate-800 border-y-transparent border-l-transparent",
  };

  return (
    <div className="relative inline-block">
      {children}
      {show && !dismissed && (
        <div className={`absolute z-50 ${positionClasses[position]} animate-fade-in`}>
          <div className="relative bg-slate-800 text-white text-xs px-3 py-2 rounded-lg shadow-lg max-w-[200px] whitespace-normal">
            <p>{tip}</p>
            <button
              onClick={handleDismiss}
              className="mt-1.5 text-[10px] text-blue-300 hover:text-blue-200 font-medium"
            >
              Got it
            </button>
            <div className={`absolute w-0 h-0 border-4 ${arrowClasses[position]}`} />
          </div>
        </div>
      )}
    </div>
  );
}
