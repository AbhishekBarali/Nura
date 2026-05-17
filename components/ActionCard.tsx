"use client";

import { ActionCard as ActionCardType } from "@/lib/types";

interface ActionCardProps {
  action: ActionCardType;
}

const CARD_CONFIG: Record<string, { icon: string; label: string; glowClass: string; accentColor: string; bgColor: string; borderColor: string }> = {
  alert: {
    icon: "⚠️",
    label: "ALERT",
    glowClass: "alert-glow-red",
    accentColor: "text-rose-400",
    bgColor: "bg-rose-500/6",
    borderColor: "border-rose-500/20",
  },
  medication: {
    icon: "💊",
    label: "MEDICATION",
    glowClass: "alert-glow-cyan",
    accentColor: "text-cyan-400",
    bgColor: "bg-cyan-500/6",
    borderColor: "border-cyan-500/15",
  },
  symptom: {
    icon: "🩺",
    label: "SYMPTOM",
    glowClass: "alert-glow-amber",
    accentColor: "text-amber-400",
    bgColor: "bg-amber-500/6",
    borderColor: "border-amber-500/15",
  },
  condition: {
    icon: "📋",
    label: "CONDITION",
    glowClass: "alert-glow-purple",
    accentColor: "text-purple-400",
    bgColor: "bg-purple-500/6",
    borderColor: "border-purple-500/15",
  },
  referral: {
    icon: "🏥",
    label: "REFERRAL",
    glowClass: "alert-glow-green",
    accentColor: "text-emerald-400",
    bgColor: "bg-emerald-500/6",
    borderColor: "border-emerald-500/15",
  },
  record_update: {
    icon: "📝",
    label: "RECORD UPDATE",
    glowClass: "alert-glow-cyan",
    accentColor: "text-slate-400",
    bgColor: "bg-slate-500/6",
    borderColor: "border-slate-500/15",
  },
  summary: {
    icon: "📄",
    label: "SUMMARY",
    glowClass: "",
    accentColor: "text-slate-400",
    bgColor: "bg-slate-500/4",
    borderColor: "border-slate-500/10",
  },
};

export default function ActionCard({ action }: ActionCardProps) {
  const config = CARD_CONFIG[action.type] || CARD_CONFIG.summary;
  const content = action.content as Record<string, string>;

  return (
    <div className={`card-enter rounded-xl border p-4 ${config.bgColor} ${config.borderColor} ${config.glowClass}`}>
      {/* Header row */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-sm">{config.icon}</span>
          <span className={`text-[10px] font-bold uppercase tracking-[0.1em] ${config.accentColor}`}>
            {config.label}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {action.severity && (
            <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
              action.severity === "high"
                ? "bg-rose-500/20 text-rose-300 border border-rose-500/20"
                : action.severity === "medium"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/20"
                : "bg-slate-500/20 text-slate-300 border border-slate-500/20"
            }`}>
              {action.severity}
            </span>
          )}
          <span className="text-[10px] text-[var(--text-muted)] font-mono">
            {formatTimestamp(action.timestamp)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-1.5">
        {action.type === "alert" && (
          <>
            <p className="text-[13px] text-[var(--text-primary)] font-medium leading-snug">
              {content.description}
            </p>
            {content.action_taken && (
              <div className="flex items-start gap-2 mt-2 pt-2 border-t border-[var(--border-subtle)]">
                <span className="text-[10px] text-rose-400/70 font-bold uppercase tracking-wider flex-shrink-0 mt-0.5">Action:</span>
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">{content.action_taken}</p>
              </div>
            )}
          </>
        )}

        {action.type === "medication" && (
          <div>
            <p className="text-[13px] text-[var(--text-primary)] font-semibold">
              {content.name}
              {content.dosage && <span className="font-normal text-[var(--text-muted)]"> — {content.dosage}</span>}
            </p>
            {content.context && (
              <p className="text-[11px] text-[var(--text-muted)] mt-1">{content.context}</p>
            )}
          </div>
        )}

        {action.type === "symptom" && (
          <p className="text-[13px] text-[var(--text-primary)]">
            {content.description}
            {content.severity && (
              <span className="ml-2 text-[10px] text-amber-400/70 font-medium">({content.severity})</span>
            )}
          </p>
        )}

        {action.type === "condition" && (
          <div className="flex items-center gap-2">
            <p className="text-[13px] text-[var(--text-primary)] font-medium">{content.name}</p>
            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
              content.status === "new"
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                : content.status === "suspected"
                ? "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                : "bg-slate-500/15 text-slate-400 border border-slate-500/20"
            }`}>
              {content.status}
            </span>
          </div>
        )}

        {action.type === "referral" && (
          <>
            <p className="text-[13px] text-[var(--text-primary)] font-semibold">
              → {content.department}
            </p>
            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">{content.reason}</p>
            {content.urgency && (
              <span className={`inline-block mt-1.5 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                content.urgency === "urgent" || content.urgency === "critical"
                  ? "bg-rose-500/15 text-rose-300 border border-rose-500/20"
                  : "bg-slate-500/15 text-slate-300 border border-slate-500/20"
              }`}>
                {content.urgency}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
