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

/** Maps icon identifiers to professional SVG icons */
function AgentIcon({ icon }: { icon: string }) {
  const cls = "w-4 h-4 text-slate-500";
  switch (icon) {
    case "clipboard":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.251 2.251 0 011.15.064M9 12h3.75" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 2.636A48.402 48.402 0 0012 2.25c-1.26 0-2.507.058-3.736.172-.896.083-1.514.984-1.514 1.88v.284" />
        </svg>
      );
    case "envelope":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
        </svg>
      );
    case "alert":
      return (
        <svg className={cls + " !text-red-500"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      );
    case "building":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
        </svg>
      );
    case "calendar":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
      );
    case "send":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
        </svg>
      );
    default:
      // Fallback: render a generic document icon if unknown
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      );
  }
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
      <div className="rounded-xl overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-elevated)] shadow-sm">
        <div className="px-5 py-3.5 border-b border-[var(--border-subtle)] flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)] tracking-tight">Agent Activity</h3>
              <p className="text-[10px] text-[var(--text-muted)]">Autonomous decisions & actions</p>
            </div>
          </div>
          {isActive ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-breathe" />
              <span className="text-[11px] font-bold text-blue-700 tracking-wide">EXECUTING</span>
            </div>
          ) : entries.length > 0 ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span className="text-[11px] font-bold text-emerald-700 tracking-wide">COMPLETE</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              <span className="text-[11px] font-bold text-slate-500 tracking-wide">STANDBY</span>
            </div>
          )}
        </div>

        <div ref={scrollRef} className="max-h-[180px] overflow-y-auto px-5 py-3 space-y-2 scrollbar-thin" role="log" aria-live="polite" aria-relevant="additions">
          {entries.length === 0 ? (
            <div className="flex items-center justify-center py-4">
              <p className="text-xs text-[var(--text-muted)] text-center">
                Agent actions will stream here as the AI processes the encounter...
              </p>
            </div>
          ) : (
            entries.map((entry) => (
              <div key={entry.id} className="flex items-start gap-3 py-2 animate-fade-in">
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
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <AgentIcon icon={entry.icon} />
                    <span className="text-sm font-semibold text-[var(--text-primary)]">{entry.action}</span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] leading-snug mt-0.5 truncate">{entry.detail}</p>
                </div>
                <span className={`flex-shrink-0 px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                  entry.status === "sent" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                  entry.status === "done" ? "bg-blue-50 text-blue-700 border border-blue-200" :
                  entry.status === "running" ? "bg-blue-50 text-blue-600 border border-blue-200" :
                  "bg-slate-100 text-slate-500"
                }`}>
                  {entry.status === "sent" ? "sent" : entry.status === "done" ? "done" : entry.status === "running" ? "..." : "queued"}
                </span>
              </div>
            ))
          )}

          {/* Record Updates — inline within the scroll */}
          {recordUpdates.length > 0 && (
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 mt-1">
              <div className="flex items-center gap-1.5 mb-1">
                <svg className="w-3 h-3 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide">Chart Updated</span>
              </div>
              <div className="space-y-0.5">
                {recordUpdates.map((update, i) => (
                  <p key={i} className="text-xs text-emerald-800 leading-snug">{update}</p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* View Report — persistent footer, always visible when ready */}
        {reportReady && onViewReport && (
          <div className="border-t border-[var(--border-subtle)] px-4 py-3 bg-slate-50">
            <button
              onClick={onViewReport}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-700 hover:bg-blue-600 transition-all group shadow-sm"
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
          <svg className="w-4 h-4 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
          </svg>
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Agent Decisions</h3>
        </div>
        {isActive && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-breathe" />
            <span className="text-[10px] font-semibold text-blue-700">Executing</span>
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
                <AgentIcon icon={entry.icon} />
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
