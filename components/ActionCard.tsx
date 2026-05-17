"use client";

import { ActionCard as ActionCardType } from "@/lib/types";

interface ActionCardProps {
  action: ActionCardType;
}

const CARD_CONFIG = {
  alert: {
    icon: "⚠️",
    label: "Alert",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
    textColor: "text-red-400",
    badgeColor: "bg-red-500/20 text-red-300",
  },
  medication: {
    icon: "💊",
    label: "Medication Detected",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    textColor: "text-blue-400",
    badgeColor: "bg-blue-500/20 text-blue-300",
  },
  symptom: {
    icon: "🤒",
    label: "Symptom",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    textColor: "text-amber-400",
    badgeColor: "bg-amber-500/20 text-amber-300",
  },
  condition: {
    icon: "🏥",
    label: "Condition",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
    textColor: "text-purple-400",
    badgeColor: "bg-purple-500/20 text-purple-300",
  },
  referral: {
    icon: "📨",
    label: "Referral",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/30",
    textColor: "text-green-400",
    badgeColor: "bg-green-500/20 text-green-300",
  },
  record_update: {
    icon: "📋",
    label: "Record Update",
    bgColor: "bg-teal-500/10",
    borderColor: "border-teal-500/30",
    textColor: "text-teal-400",
    badgeColor: "bg-teal-500/20 text-teal-300",
  },
  summary: {
    icon: "📝",
    label: "Summary",
    bgColor: "bg-gray-500/10",
    borderColor: "border-gray-500/30",
    textColor: "text-gray-400",
    badgeColor: "bg-gray-500/20 text-gray-300",
  },
};

export default function ActionCard({ action }: ActionCardProps) {
  const config = CARD_CONFIG[action.type] || CARD_CONFIG.summary;
  const content = action.content as Record<string, string>;

  return (
    <div
      className={`card-enter rounded-lg border p-3 ${config.bgColor} ${config.borderColor}`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-base">{config.icon}</span>
          <span className={`text-xs font-semibold ${config.textColor}`}>
            {config.label}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {action.severity && (
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                action.severity === "high"
                  ? "bg-red-500/30 text-red-300"
                  : action.severity === "medium"
                  ? "bg-yellow-500/30 text-yellow-300"
                  : "bg-gray-500/30 text-gray-300"
              }`}
            >
              {action.severity}
            </span>
          )}
          <span className="text-[10px] text-gray-500">
            {formatTimestamp(action.timestamp)}
          </span>
        </div>
      </div>

      <div className="space-y-1">
        {action.type === "alert" && (
          <>
            <p className="text-sm text-gray-200 font-medium">
              {content.description}
            </p>
            {content.action_taken && (
              <p className="text-xs text-gray-400 mt-1">
                <span className="font-medium text-gray-300">Action: </span>
                {content.action_taken}
              </p>
            )}
          </>
        )}

        {action.type === "medication" && (
          <p className="text-sm text-gray-200">
            <span className="font-medium">{content.name}</span>
            {content.dosage && (
              <span className="text-gray-400"> — {content.dosage}</span>
            )}
            {content.context && (
              <span className="text-gray-500 text-xs block mt-0.5">
                {content.context}
              </span>
            )}
          </p>
        )}

        {action.type === "symptom" && (
          <p className="text-sm text-gray-200">
            {content.description}
            {content.severity && (
              <span className="text-xs text-gray-400 ml-2">
                ({content.severity})
              </span>
            )}
          </p>
        )}

        {action.type === "condition" && (
          <p className="text-sm text-gray-200">
            {content.name}
            <span
              className={`ml-2 text-xs px-1.5 py-0.5 rounded ${
                content.status === "new"
                  ? "bg-green-500/20 text-green-300"
                  : content.status === "suspected"
                  ? "bg-yellow-500/20 text-yellow-300"
                  : "bg-gray-500/20 text-gray-300"
              }`}
            >
              {content.status}
            </span>
          </p>
        )}

        {action.type === "referral" && (
          <>
            <p className="text-sm text-gray-200 font-medium">
              → {content.department}
            </p>
            <p className="text-xs text-gray-400">{content.reason}</p>
            {content.urgency && (
              <span
                className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded font-medium ${
                  content.urgency === "urgent" || content.urgency === "critical"
                    ? "bg-red-500/20 text-red-300"
                    : "bg-gray-500/20 text-gray-300"
                }`}
              >
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
