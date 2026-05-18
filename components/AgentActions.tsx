"use client";

import { useEffect, useRef, useMemo } from "react";
import { ActionCard as ActionCardType } from "@/lib/types";
import ActionCard from "./ActionCard";

interface AgentActionsProps {
  actions: ActionCardType[];
  summary: string;
  isProcessing: boolean;
}

export default function AgentActions({ actions = [], summary, isProcessing }: AgentActionsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const safeActions = actions || [];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [safeActions]);

  const alerts = useMemo(() => safeActions.filter((a) => a?.type === "alert"), [safeActions]);
  const medications = useMemo(() => safeActions.filter((a) => a?.type === "medication"), [safeActions]);
  const symptoms = useMemo(() => safeActions.filter((a) => a?.type === "symptom"), [safeActions]);
  const conditions = useMemo(() => safeActions.filter((a) => a?.type === "condition"), [safeActions]);
  const referrals = useMemo(() => safeActions.filter((a) => a?.type === "referral"), [safeActions]);
  const others = useMemo(() => safeActions.filter((a) => a?.type === "record_update" || a?.type === "summary"), [safeActions]);

  return (
    <div className="elevated-card rounded-xl flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[var(--border-subtle)] flex items-center justify-between bg-slate-50">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.348 14.651a3.75 3.75 0 010-5.303m5.304 0a3.75 3.75 0 010 5.303m-7.425 2.122a6.75 6.75 0 010-9.546m9.546 0a6.75 6.75 0 010 9.546M5.106 18.894c-3.808-3.808-3.808-9.98 0-13.789m13.788 0c3.808 3.808 3.808 9.981 0 13.79M12 12h.008v.007H12V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Clinical Findings</h3>
        </div>
        <div className="flex items-center gap-2">
          {isProcessing && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-breathe" />
              <span className="text-[10px] font-semibold text-blue-700">Analyzing</span>
            </div>
          )}
          {safeActions.length > 0 && (
            <span className="text-xs font-medium text-[var(--text-muted)] bg-slate-100 px-2 py-0.5 rounded-full">{safeActions.length}</span>
          )}
        </div>
      </div>

      {/* Actions body */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-3 py-3 space-y-1.5 scrollbar-thin"
        role="log"
        aria-live="polite"
        aria-relevant="additions"
      >
        {safeActions.length === 0 && !isProcessing ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8 px-4">
            <svg className="w-10 h-10 text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
            </svg>
            <p className="text-sm font-medium text-slate-600 mb-1">Clinical findings will appear here</p>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed max-w-[220px]">
              As Nura listens, it autonomously detects medications, allergies, conditions, and routes referrals.
            </p>
            <div className="flex flex-wrap gap-1.5 mt-3 justify-center">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-50 border border-red-200 text-red-600">Alerts</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-600">Meds</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600">Referrals</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-50 border border-violet-200 text-violet-600">SOAP</span>
            </div>
          </div>
        ) : (
          <>
            {alerts.map((action) => (
              <ActionCard key={action.id} action={action} />
            ))}
            {conditions.map((action) => (
              <ActionCard key={action.id} action={action} />
            ))}
            {referrals.map((action) => (
              <ActionCard key={action.id} action={action} />
            ))}
            {medications.map((action) => (
              <ActionCard key={action.id} action={action} />
            ))}
            {symptoms.map((action) => (
              <ActionCard key={action.id} action={action} />
            ))}
            {others.map((action) => (
              <ActionCard key={action.id} action={action} />
            ))}

            {summary && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 mt-1">
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">{summary}</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Stats footer */}
      {safeActions.length > 0 && (
        <div className="px-4 py-2.5 border-t border-[var(--border-subtle)] flex items-center gap-3 flex-wrap bg-slate-50">
          {alerts.length > 0 && (
            <span className="text-[10px] font-semibold text-red-700 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              {alerts.length} alert{alerts.length > 1 ? "s" : ""}
            </span>
          )}
          {conditions.length > 0 && (
            <span className="text-[10px] font-semibold text-slate-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
              {conditions.length} dx
            </span>
          )}
          {medications.length > 0 && (
            <span className="text-[10px] font-semibold text-blue-700 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              {medications.length} med{medications.length > 1 ? "s" : ""}
            </span>
          )}
          {symptoms.length > 0 && (
            <span className="text-[10px] font-semibold text-slate-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              {symptoms.length} sx
            </span>
          )}
          {referrals.length > 0 && (
            <span className="text-[10px] font-semibold text-slate-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
              {referrals.length} ref
            </span>
          )}
        </div>
      )}
    </div>
  );
}
