"use client";

import { ActionCard as ActionCardType } from "@/lib/types";

interface ActionCardProps {
  action: ActionCardType;
}

const CARD_CONFIG: Record<string, { icon: string; label: string; accent: string; bg: string; border: string; dot: string }> = {
  alert: {
    icon: "⚠️", label: "ALERT", accent: "text-rose-400", bg: "bg-rose-500/[0.04]",
    border: "border-rose-500/15 hover:border-rose-500/30", dot: "bg-rose-400",
  },
  medication: {
    icon: "💊", label: "MEDICATION", accent: "text-cyan-400", bg: "bg-cyan-500/[0.04]",
    border: "border-cyan-500/15 hover:border-cyan-500/30", dot: "bg-cyan-400",
  },
  symptom: {
    icon: "🩺", label: "SYMPTOM", accent: "text-amber-400", bg: "bg-amber-500/[0.04]",
    border: "border-amber-500/15 hover:border-amber-500/30", dot: "bg-amber-400",
  },
  condition: {
    icon: "📋", label: "DIAGNOSIS", accent: "text-purple-400", bg: "bg-purple-500/[0.04]",
    border: "border-purple-500/15 hover:border-purple-500/30", dot: "bg-purple-400",
  },
  referral: {
    icon: "🏥", label: "REFERRAL", accent: "text-emerald-400", bg: "bg-emerald-500/[0.04]",
    border: "border-emerald-500/15 hover:border-emerald-500/30", dot: "bg-emerald-400",
  },
  record_update: {
    icon: "📝", label: "TREATMENT", accent: "text-blue-400", bg: "bg-blue-500/[0.04]",
    border: "border-blue-500/15 hover:border-blue-500/30", dot: "bg-blue-400",
  },
  summary: {
    icon: "📄", label: "NOTE", accent: "text-slate-400", bg: "bg-slate-500/[0.03]",
    border: "border-slate-500/10 hover:border-slate-500/20", dot: "bg-slate-400",
  },
};

export default function ActionCard({ action }: ActionCardProps) {
  const config = CARD_CONFIG[action.type] || CARD_CONFIG.summary;
  const content = action.content as Record<string, string>;

  // Filter out empty/placeholder values like "not stated", "unspecified"
  const dosage = content.dosage && !content.dosage.match(/not stated|unspecified|unknown|n\/a/i) ? content.dosage : "";
  const context = content.context && !content.context.match(/not stated|unspecified|unknown|n\/a/i) ? content.context : "";
  const details = content.details && !content.details.match(/not stated|unspecified|unknown|n\/a/i) ? content.details : "";

  return (
    <div className={`card-enter rounded-lg border p-3 ${config.bg} ${config.border} transition-colors`}>
      {/* Compact header */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
          <span className={`text-[9px] font-bold uppercase tracking-[0.12em] ${config.accent}`}>
            {config.label}
          </span>
          {action.severity && action.severity !== "low" && (
            <span className={`px-1.5 py-px rounded text-[8px] font-bold uppercase ${
              action.severity === "high"
                ? "bg-rose-500/20 text-rose-300"
                : "bg-amber-500/20 text-amber-300"
            }`}>
              {action.severity}
            </span>
          )}
        </div>
        <span className="text-[9px] text-[var(--text-muted)]/50 font-mono">
          {formatTimestamp(action.timestamp)}
        </span>
      </div>

      {/* Content — compact, no wasted space */}
      {action.type === "alert" && (
        <div>
          <p className="text-[12px] text-[var(--text-primary)] font-medium leading-snug">
            {content.description}
          </p>
          {content.action_taken && (
            <p className="text-[10px] text-rose-400/60 mt-1.5 leading-snug">
              <span className="font-bold uppercase tracking-wider mr-1">Rec:</span>
              {content.action_taken}
            </p>
          )}
        </div>
      )}

      {action.type === "medication" && (
        <div>
          <p className="text-[12px] text-[var(--text-primary)] font-semibold">
            {content.name}
            {dosage && <span className="font-normal text-[var(--text-muted)] ml-1">· {dosage}</span>}
          </p>
          {(context || content.action) && (
            <div className="flex items-center gap-2 mt-1">
              {content.action && (
                <span className={`px-1.5 py-px rounded text-[8px] font-bold uppercase ${
                  content.action === "new" ? "bg-emerald-500/15 text-emerald-400" :
                  content.action === "discontinued" ? "bg-rose-500/15 text-rose-400" :
                  content.action === "adjusted" ? "bg-amber-500/15 text-amber-400" :
                  "bg-slate-500/15 text-slate-400"
                }`}>{content.action}</span>
              )}
              {context && <p className="text-[10px] text-[var(--text-muted)] leading-snug truncate">{context}</p>}
            </div>
          )}
        </div>
      )}

      {action.type === "symptom" && (
        <div>
          <p className="text-[12px] text-[var(--text-primary)] font-medium">
            {content.description}
            {content.severity && (
              <span className={`ml-1.5 text-[9px] font-bold uppercase ${
                content.severity === "severe" ? "text-rose-400" :
                content.severity === "moderate" ? "text-amber-400" :
                "text-slate-400"
              }`}>· {content.severity}</span>
            )}
          </p>
          {details && (
            <p className="text-[10px] text-[var(--text-muted)] mt-0.5 leading-snug">{details}</p>
          )}
        </div>
      )}

      {action.type === "condition" && (
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-[12px] text-[var(--text-primary)] font-semibold">{content.name}</p>
          {content.status && (
            <span className={`px-1.5 py-px rounded text-[8px] font-bold uppercase ${
              content.status === "new" ? "bg-emerald-500/15 text-emerald-400" :
              content.status === "worsening" ? "bg-rose-500/15 text-rose-400" :
              content.status === "improving" ? "bg-cyan-500/15 text-cyan-400" :
              "bg-slate-500/15 text-slate-400"
            }`}>{content.status}</span>
          )}
          {details && <p className="text-[10px] text-[var(--text-muted)] w-full leading-snug">{details}</p>}
        </div>
      )}

      {action.type === "referral" && (
        <div>
          <p className="text-[12px] text-[var(--text-primary)] font-semibold">{content.department}</p>
          {content.reason && <p className="text-[10px] text-[var(--text-muted)] mt-0.5 leading-snug">{content.reason}</p>}
          {content.urgency && (
            <span className={`inline-block mt-1 px-1.5 py-px rounded text-[8px] font-bold uppercase ${
              content.urgency === "urgent" || content.urgency === "immediate"
                ? "bg-rose-500/15 text-rose-300"
                : "bg-slate-500/15 text-slate-300"
            }`}>{content.urgency}</span>
          )}
        </div>
      )}

      {action.type === "record_update" && (
        <div>
          <p className="text-[12px] text-[var(--text-primary)] font-semibold">{content.field || "Plan Update"}</p>
          {content.new_value && <p className="text-[10px] text-[var(--text-secondary)] mt-0.5 leading-snug">{content.new_value}</p>}
        </div>
      )}

      {action.type === "summary" && (
        <p className="text-[11px] text-[var(--text-secondary)] leading-snug">{content.description}</p>
      )}
    </div>
  );
}

function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
