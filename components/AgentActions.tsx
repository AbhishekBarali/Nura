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
    <div className="bg-[#12121a] border border-[#1e1e2e] rounded-xl flex flex-col h-full">
      <div className="px-4 py-3 border-b border-[#1e1e2e] flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-300">Agent Actions</h3>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          {isProcessing && (
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-indigo-400">Analyzing</span>
            </div>
          )}
          <span>{actions.length} actions</span>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin min-h-[300px] max-h-[500px]"
      >
        {actions.length === 0 && !isProcessing ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 text-sm gap-2">
            <svg className="w-12 h-12 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <p>Agent will detect and act on clinical findings...</p>
          </div>
        ) : (
          <>
            {/* Alerts first (most important) */}
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

            {/* Summary */}
            {summary && (
              <div className="rounded-lg border p-3 bg-gray-500/5 border-gray-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <span>📝</span>
                  <span className="text-xs font-semibold text-gray-400">Running Summary</span>
                </div>
                <p className="text-sm text-gray-300">{summary}</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Stats bar */}
      {actions.length > 0 && (
        <div className="px-4 py-2 border-t border-[#1e1e2e] flex items-center gap-4 text-[10px] text-gray-500">
          {alerts.length > 0 && (
            <span className="text-red-400">⚠️ {alerts.length} alerts</span>
          )}
          {medications.length > 0 && (
            <span className="text-blue-400">💊 {medications.length} meds</span>
          )}
          {referrals.length > 0 && (
            <span className="text-green-400">📨 {referrals.length} referrals</span>
          )}
        </div>
      )}
    </div>
  );
}
