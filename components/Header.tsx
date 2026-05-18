"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-[var(--border-subtle)] bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          {/* Medical cross logo */}
          <div className="w-10 h-10 rounded-lg bg-blue-700 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-1 10h-4v4h-4v-4H6v-4h4V5h4v4h4v4z" opacity="0" />
              <path d="M10 3v4H6v4h4v4h4v-4h4V7h-4V3h-4z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-display font-bold text-[var(--text-primary)] tracking-tight">Nura</h1>
            <p className="text-[11px] font-medium text-[var(--text-muted)] tracking-wide">
              Clinical Documentation Agent
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-breathe" aria-hidden="true" />
            <span className="text-[11px] font-semibold text-emerald-700 tracking-wide">Active</span>
          </div>
        </div>
      </div>
    </header>
  );
}
