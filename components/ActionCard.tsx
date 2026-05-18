"use client";

import { ActionCard as ActionCardType } from "@/lib/types";

interface ActionCardProps {
  action: ActionCardType;
}

const CARD_CONFIG: Record<string, { icon: string; label: string; accent: string; bg: string; border: string; dot: string }> = {
  alert: {
    icon: "⚠️", label: "ALERT", accent: "text-red-700", bg: "bg-red-50",
    border: "border-red-200", dot: "bg-red-500",
  },
  medication: {
    icon: "💊", label: "MEDICATION", accent: "text-blue-700", bg: "bg-blue-50",
    border: "border-blue-200", dot: "bg-blue-500",
  },
  symptom: {
    icon: "🩺", label: "SYMPTOM", accent: "text-amber-700", bg: "bg-amber-50",
    border: "border-amber-200", dot: "bg-amber-500",
  },
  condition: {
    icon: "📋", label: "DIAGNOSIS", accent: "text-purple-700", bg: "bg-purple-50",
    border: "border-purple-200", dot: "bg-purple-500",
  },
  referral: {
    icon: "🏥", label: "REFERRAL", accent: "text-emerald-700", bg: "bg-emerald-50",
    border: "border-emerald-200", dot: "bg-emerald-500",
  },
  record_update: {
    icon: "📝", label: "TREATMENT", accent: "text-slate-700", bg: "bg-slate-50",
    border: "border-slate-200", dot: "bg-slate-500",
  },
  summary: {
    icon: "📄", label: "NOTE", accent: "text-slate-600", bg: "bg-slate-50",
    border: "border-slate-200", dot: "bg-slate-400",
  },
};

export default function ActionCard({ action }: ActionCardProps) {
  const config = CARD_CONFIG[action.type] || CARD_CONFIG.summary;
  const content = action.content as Record<string, string>;

  const dosage = content.dosage && !content.dosage.match(/not stated|unspecified|unknown|n\/a/i) ? content.dosage : "";
  const context = content.context && !content.context.match(/not stated|unspecified|unknown|n\/a/i) ? content.context : "";
  const details = content.details && !content.details.match(/not stated|unspecified|unknown|n\/a/i) ? content.details : "";

  return (
    <div className={`card-enter rounded-lg border p-3 ${config.bg} ${config.border} transition-colors`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${config.dot}`} aria-hidden="true" />
          <span className={`text-[10px] font-bold uppercase tracking-wide ${config.accent}`}>
            {config.label}
          </span>
          {action.severity && action.severity !== "low" && (
            <span className={`px-1.5 py-px rounded text-[9px] font-bold uppercase ${
              action.severity === "high"
                ? "bg-red-100 text-red-700 border border-red-200"
                : "bg-amber-100 text-amber-700 border border-amber-200"
            }`}>
              {action.severity}
            </span>
          )}
        </div>
        <span className="text-[10px] text-[var(--text-muted)] font-mono">
          {formatTimestamp(action.timestamp)}
        </span>
      </div>

      {/* Content */}
      {action.type === "alert" && (
        <div>
          <p className="text-[13px] text-[var(--text-primary)] font-medium leading-snug">
            {content.description}
          </p>
          {content.action_taken && (
            <p className="text-[11px] text-red-600 mt-1.5 leading-snug">
              <span className="font-bold uppercase tracking-wide mr-1">Rec:</span>
              {content.action_taken}
            </p>
          )}
        </div>
      )}

      {action.type === "medication" && (
        <div>
          <p className="text-[13px] text-[var(--text-primary)] font-semibold">
            {content.name}
            {dosage && <span className="font-normal text-[var(--text-muted)] ml-1.5">{dosage}</span>}
          </p>
          {(context || content.action) && (
            <div className="flex items-center gap-2 mt-1">
              {content.action && (
                <span className={`px-1.5 py-px rounded text-[9px] font-bold uppercase ${
                  content.action === "new" ? "bg-emerald-100 text-emerald-700" :
                  content.action === "discontinued" ? "bg-red-100 text-red-700" :
                  content.action === "adjusted" ? "bg-amber-100 text-amber-700" :
                  "bg-slate-100 text-slate-600"
                }`}>{content.action}</span>
              )}
              {context && <p className="text-[11px] text-[var(--text-muted)] leading-snug truncate">{context}</p>}
            </div>
          )}
        </div>
      )}

      {action.type === "symptom" && (
        <div>
          <p className="text-[13px] text-[var(--text-primary)] font-medium">
            {content.description}
            {content.severity && (
              <span className={`ml-1.5 text-[10px] font-bold uppercase ${
                content.severity === "severe" ? "text-red-600" :
                content.severity === "moderate" ? "text-amber-600" :
                "text-slate-500"
              }`}>· {content.severity}</span>
            )}
          </p>
          {details && (
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5 leading-snug">{details}</p>
          )}
        </div>
      )}

      {action.type === "condition" && (
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-[13px] text-[var(--text-primary)] font-semibold">{content.name}</p>
          {content.status && (
            <span className={`px-1.5 py-px rounded text-[9px] font-bold uppercase ${
              content.status === "new" ? "bg-emerald-100 text-emerald-700" :
              content.status === "worsening" ? "bg-red-100 text-red-700" :
              content.status === "improving" ? "bg-blue-100 text-blue-700" :
              "bg-slate-100 text-slate-600"
            }`}>{content.status}</span>
          )}
          {details && <p className="text-[11px] text-[var(--text-muted)] w-full leading-snug">{details}</p>}
        </div>
      )}

      {action.type === "referral" && (
        <div>
          <p className="text-[13px] text-[var(--text-primary)] font-semibold">{content.department}</p>
          {content.reason && <p className="text-[11px] text-[var(--text-muted)] mt-0.5 leading-snug">{content.reason}</p>}
          {content.urgency && (
            <span className={`inline-block mt-1 px-1.5 py-px rounded text-[9px] font-bold uppercase ${
              content.urgency === "urgent" || content.urgency === "immediate"
                ? "bg-red-100 text-red-700"
                : "bg-slate-100 text-slate-600"
            }`}>{content.urgency}</span>
          )}
        </div>
      )}

      {action.type === "record_update" && (
        <div>
          <p className="text-[13px] text-[var(--text-primary)] font-semibold">{content.field || "Plan Update"}</p>
          {content.new_value && <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 leading-snug">{content.new_value}</p>}
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
