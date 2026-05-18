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
  isHero?: boolean;
  recordUpdates?: string[];
  reportReady?: boolean;
  onViewReport?: () => void;
}

export default function AgentLog({ entries, isActive, isHero = false, recordUpdates = [], reportReady = false, onViewReport }: AgentLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries]);

  // Hero mode: always visible with idle state
  if (!isHero && entries.length === 0 && !isActive) return null;

  if (isHero) {
    return (
      <div className="rounded-xl overflow-hidden border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 shadow-xl">
        <div className="px-5 py-3.5 border-b border-slate-700/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Agent Activity</h3>
              <p className="text-[10px] text-slate-400">Autonomous decisions & actions</p>
            </div>
          </div>
          {isActive ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-breathe" />
              <span className="text-[11px] font-bold text-indigo-300 tracking-wide">EXECUTING</span>
            </div>
          ) : entries.length > 0 ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-[11px] font-bold text-emerald-300 tracking-wide">COMPLETE</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-700/50 border border-slate-600/30">
              <span className="w-2 h-2 rounded-full bg-slate-500" />
              <span className="text-[11px] font-bold text-slate-400 tracking-wide">STANDBY</span>
            </div>
          )}
        </div>

        <div ref={scrollRef} className="max-h-[180px] overflow-y-auto px-5 py-3 space-y-2 scrollbar-dark" role="log" aria-live="polite" aria-relevant="additions">
          {entries.length === 0 ? (
            <div className="flex items-center justify-center py-4">
              <p className="text-xs text-slate-500 text-center">
                Agent actions will stream here as the AI processes the encounter...
              </p>
            </div>
          ) : (
            entries.map((entry) => (
              <div key={entry.id} className="flex items-start gap-3 py-2 animate-fade-in">
                <div className="flex-shrink-0 mt-0.5">
                  {entry.status === "running" ? (
                    <span className="w-5 h-5 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin block" />
                  ) : entry.status === "done" || entry.status === "sent" ? (
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </span>
                  ) : (
                    <span className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center">
                      <span className="w-2 h-2 rounded-full bg-slate-500" />
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{entry.icon}</span>
                    <span className="text-sm font-semibold text-white">{entry.action}</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-snug mt-0.5 truncate">{entry.detail}</p>
                </div>
                <span className={`flex-shrink-0 px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                  entry.status === "sent" ? "bg-emerald-500/20 text-emerald-300" :
                  entry.status === "done" ? "bg-blue-500/20 text-blue-300" :
                  entry.status === "running" ? "bg-indigo-500/20 text-indigo-300" :
                  "bg-slate-700 text-slate-500"
                }`}>
                  {entry.status === "sent" ? "sent" : entry.status === "done" ? "done" : entry.status === "running" ? "..." : "queued"}
                </span>
              </div>
            ))
          )}

          {/* Record Updates — inline within the scroll */}
          {recordUpdates.length > 0 && (
            <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 mt-1">
              <div className="flex items-center gap-1.5 mb-1">
                <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wide">Chart Updated</span>
              </div>
              <div className="space-y-0.5">
                {recordUpdates.map((update, i) => (
                  <p key={i} className="text-xs text-emerald-300/80 leading-snug">{update}</p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* View Report — persistent footer, always visible when ready */}
        {reportReady && onViewReport && (
          <div className="border-t border-slate-700/50 px-4 py-3 bg-slate-800/50">
            <button
              onClick={onViewReport}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 transition-all group shadow-lg shadow-blue-900/30"
            >
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <span className="text-sm font-semibold text-white">View Complete Report</span>
              <svg className="w-4 h-4 text-blue-200 ml-auto group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="elevated-card rounded-xl overflow-hidden">
      <div className="px-4 py-2.5 border-b border-[var(--border-subtle)] flex items-center justify-between bg-slate-50">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
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

      <div ref={scrollRef} className="max-h-[200px] overflow-y-auto px-4 py-2 space-y-1.5" role="log" aria-live="polite" aria-relevant="additions">
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
