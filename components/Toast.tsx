"use client";

import { useState, useEffect, useCallback } from "react";

export interface ToastMessage {
  id: string;
  type: "error" | "success" | "info";
  message: string;
  action?: { label: string; onClick: () => void };
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((toast: Omit<ToastMessage, "id">) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    // Auto-dismiss after 8s unless it has an action
    if (!toast.action) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 8000);
    }
    return id;
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, addToast, dismissToast };
}

const TOAST_STYLES = {
  error: {
    bg: "bg-red-50 border-red-200",
    icon: "text-red-600",
    text: "text-red-800",
    action: "text-red-700 hover:text-red-900 bg-red-100 hover:bg-red-200",
  },
  success: {
    bg: "bg-emerald-50 border-emerald-200",
    icon: "text-emerald-600",
    text: "text-emerald-800",
    action: "text-emerald-700 hover:text-emerald-900 bg-emerald-100 hover:bg-emerald-200",
  },
  info: {
    bg: "bg-blue-50 border-blue-200",
    icon: "text-blue-600",
    text: "text-blue-800",
    action: "text-blue-700 hover:text-blue-900 bg-blue-100 hover:bg-blue-200",
  },
};

const ICONS = {
  error: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
    </svg>
  ),
  success: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  info: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
    </svg>
  ),
};

export default function Toast({ toasts, onDismiss }: ToastProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => {
        const style = TOAST_STYLES[toast.type];
        return (
          <div
            key={toast.id}
            className={`flex items-start gap-3 px-4 py-3 rounded-lg border shadow-lg animate-fade-in ${style.bg}`}
          >
            <span className={`flex-shrink-0 mt-0.5 ${style.icon}`}>{ICONS[toast.type]}</span>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${style.text}`}>{toast.message}</p>
              {toast.action && (
                <button
                  onClick={() => {
                    toast.action!.onClick();
                    onDismiss(toast.id);
                  }}
                  className={`mt-2 text-xs font-semibold px-2.5 py-1 rounded-md transition-colors ${style.action}`}
                >
                  {toast.action.label}
                </button>
              )}
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}
