"use client";

import { useEffect, useRef } from "react";
import { ActionCard as ActionCardType } from "@/lib/types";
import ActionCard from "./ActionCard";

interface AgentActionsProps {
  actions: ActionCardType[];
  summary: string;
  isProcessing: boolean;
}

export default function AgentActions({ actions, summary, isProcessing }: AgentActionsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [actions]);

  const alerts = actions.filter((a) => a.type === "alert");
  const medications = actions.filter((a) => a.type === "medication");
  const symptoms = actions.filter((a) => a.type === "symptom");
  const conditions = actions.filter((a) => a.type === "condition");
  const referrals = actions.filter((a) => a.type === "referral");

  return (
    <div className="elevated-card rounded-2xl flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-rose-500/10 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.348 14.651a3.75 3.75 0 010-5.303m5.304 0a3.75 3.75 0 010 5.303m-7.425 2.122a6.75 6.75 0 010-9.546m9.546 0a6.75 6.75 0 010 9.546M5.106 18.894c-3.808-3.808-3.808-9.98 0-13.789m13.788 0c3.808 3.808 3.808 9.981 0 13.79M12 12h.008v.007H12V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Agent Actions</h3>
        </div>
        <div className="flex items-center gap-3">
          {isProcessing && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/15">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-breathe" />
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">Analyzing</span>
            </div>
          )}
          {actions.length > 0 && (
            <span className="text-[11px] font-mono text-[var(--text-muted)]">{actions.length}</span>
          )}
        </div>
      </div>

      {/* Actions body */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin min-h-[320px] max-h-[520px]"
      >
        {actions.length === 0 && !isProcessing ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-[var(--bg-surface)] flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
              </svg>
            </div>
            <p className="text-sm text-[var(--text-muted)]">Agent findings will appear here</p>
            <p className="text-xs text-[var(--text-muted)]/60 mt-1">Drug interactions, alerts, and referrals detected autonomously</p>
          </div>
        ) : (
          <>
            {/* Alerts first — most critical */}
            {alerts.map((action) => (
              <ActionCard key={action.id} action={action} />
            ))}
            {/* Referrals */}
            {referrals.map((action) => (
              <ActionCard key={action.id} action={action} />
            ))}
            {/* Medications */}
            {medications.map((action) => (
              <ActionCard key={action.id} action={action} />
            ))}
            {/* Symptoms */}
            {symptoms.map((action) => (
              <ActionCard key={action.id} action={action} />
            ))}
            {/* Conditions */}
            {conditions.map((action) => (
              <ActionCard key={action.id} action={action} />
            ))}

            {/* Running summary */}
            {summary && (
              <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]/50 p-4 mt-2">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs">📝</span>
                  <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Clinical Summary</span>
                </div>
                <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">{summary}</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Stats footer */}
      {actions.length > 0 && (
        <div className="px-5 py-3 border-t border-[var(--border-subtle)] flex items-center gap-4">
          {alerts.length > 0 && (
            <span className="text-[10px] font-bold text-rose-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              {alerts.length} alert{alerts.length > 1 ? "s" : ""}
            </span>
          )}
          {medications.length > 0 && (
            <span className="text-[10px] font-bold text-cyan-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              {medications.length} med{medications.length > 1 ? "s" : ""}
            </span>
          )}
          {referrals.length > 0 && (
            <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {referrals.length} referral{referrals.length > 1 ? "s" : ""}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
