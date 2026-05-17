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
    <div className="elevated-card rounded-2xl overflow-hidden">
      <div className="px-4 py-2.5 border-b border-[var(--border-subtle)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-violet-500/10 flex items-center justify-center">
            <svg className="w-3 h-3 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          </div>
          <h3 className="text-[10px] font-bold text-[var(--text-primary)] uppercase tracking-wider">Agent Decisions</h3>
        </div>
        {isActive && (
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-breathe" />
            <span className="text-[9px] font-bold text-violet-400 uppercase">Executing</span>
          </div>
        )}
      </div>

      <div ref={scrollRef} className="max-h-[180px] overflow-y-auto px-3 py-2 space-y-1">
        {entries.map((entry) => (
          <div key={entry.id} className="flex items-start gap-2 py-1.5 animate-fade-in">
            {/* Status indicator */}
            <div className="flex-shrink-0 mt-0.5">
              {entry.status === "running" ? (
                <span className="w-4 h-4 rounded-full border-2 border-violet-400 border-t-transparent animate-spin block" />
              ) : entry.status === "done" || entry.status === "sent" ? (
                <span className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </span>
              ) : (
                <span className="w-4 h-4 rounded-full bg-slate-500/20 flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                </span>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs">{entry.icon}</span>
                <span className={`text-[11px] font-semibold ${entry.color}`}>{entry.action}</span>
              </div>
              <p className="text-[10px] text-[var(--text-muted)] leading-snug mt-0.5 truncate">{entry.detail}</p>
            </div>

            {/* Status badge */}
            <span className={`flex-shrink-0 px-1.5 py-px rounded text-[8px] font-bold uppercase ${
              entry.status === "sent" ? "bg-emerald-500/15 text-emerald-400" :
              entry.status === "done" ? "bg-cyan-500/15 text-cyan-400" :
              entry.status === "running" ? "bg-violet-500/15 text-violet-400" :
              "bg-slate-500/15 text-slate-400"
            }`}>
              {entry.status === "sent" ? "sent" : entry.status === "done" ? "done" : entry.status === "running" ? "..." : "queued"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
