"use client";

import { useEffect, useRef } from "react";

export interface AgentLogEntry {
  id: string;
  timestamp: number;
  action: string;
  detail: string;
  status: "pending" | "running" | "done" | "sent";
  icon: string;
  color: string;
}

interface AgentLogProps {
  entries: AgentLogEntry[];
  isActive: boolean;
}

export default function AgentLog({ entries, isActive }: AgentLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries]);

  if (entries.length === 0 && !isActive) return null;

  return (
    <div className="elevated-card rounded-xl overflow-hidden">
      <div className="px-4 py-2.5 border-b border-[var(--border-subtle)] flex items-center justify-between bg-slate-50">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
          </svg>
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Agent Decisions</h3>
        </div>
        {isActive && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-breathe" />
            <span className="text-[10px] font-semibold text-indigo-700">Executing</span>
          </div>
        )}
      </div>

      <div ref={scrollRef} className="max-h-[200px] overflow-y-auto px-4 py-2 space-y-1.5">
        {entries.map((entry) => (
          <div key={entry.id} className="flex items-start gap-3 py-2 animate-fade-in">
            {/* Status indicator */}
            <div className="flex-shrink-0 mt-0.5">
              {entry.status === "running" ? (
                <span className="w-5 h-5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin block" />
              ) : entry.status === "done" || entry.status === "sent" ? (
                <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                  <svg className="w-3 h-3 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </span>
              ) : (
                <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                </span>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm">{entry.icon}</span>
                <span className="text-sm font-semibold text-[var(--text-primary)]">{entry.action}</span>
              </div>
              <p className="text-xs text-[var(--text-muted)] leading-snug mt-0.5 truncate">{entry.detail}</p>
            </div>

            {/* Status badge */}
            <span className={`flex-shrink-0 px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
              entry.status === "sent" ? "bg-emerald-100 text-emerald-700" :
              entry.status === "done" ? "bg-blue-100 text-blue-700" :
              entry.status === "running" ? "bg-slate-100 text-slate-600" :
              "bg-slate-100 text-slate-500"
            }`}>
              {entry.status === "sent" ? "sent" : entry.status === "done" ? "done" : entry.status === "running" ? "..." : "queued"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
