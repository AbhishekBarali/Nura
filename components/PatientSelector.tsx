"use client";

import { useState } from "react";
import { Patient } from "@/lib/types";

interface PatientSelectorProps {
  patients: Patient[];
  selectedPatient: Patient | null;
  onSelect: (patient: Patient | null) => void;
  disabled: boolean;
}

const NEW_PATIENT: Patient = {
  id: 0,
  name: "New Patient",
  age: 0,
  gender: "Unknown",
  allergies: [],
  current_medications: [],
  conditions: [],
  history: [],
};

export default function PatientSelector({
  patients,
  selectedPatient,
  onSelect,
  disabled,
}: PatientSelectorProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="elevated-card rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-4 h-4 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
        <label htmlFor="patient-select" className="text-sm font-semibold text-[var(--text-primary)]">
          Patient Record
        </label>
        <span className="text-xs text-[var(--text-muted)] ml-auto">(Optional)</span>
      </div>

      <select
        id="patient-select"
        className="w-full bg-[var(--bg-surface)] border border-[var(--border-medium)] rounded-lg px-3 py-2.5 text-[var(--text-primary)] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 disabled:opacity-40 transition-all cursor-pointer appearance-none"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px' }}
        value={selectedPatient?.id ?? ""}
        onChange={(e) => {
          const val = e.target.value;
          if (val === "") {
            onSelect(null);
          } else if (val === "new") {
            onSelect(NEW_PATIENT);
          } else {
            const patient = patients.find((p) => p.id === parseInt(val));
            if (patient) onSelect(patient);
          }
        }}
        disabled={disabled}
      >
        <option value="">Auto-detect from audio...</option>
        <option value="new">+ New Patient (unknown)</option>
        {patients.map((patient) => (
          <option key={patient.id} value={patient.id}>
            {patient.name} — {patient.age}yo {patient.gender}
          </option>
        ))}
      </select>

      {selectedPatient && selectedPatient.id !== 0 && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="mt-3 w-full flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors text-left"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">
              {selectedPatient.allergies.length} allerg{selectedPatient.allergies.length === 1 ? "y" : "ies"}
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span className="text-xs font-semibold text-slate-600">
              {selectedPatient.current_medications.length} medication{selectedPatient.current_medications.length === 1 ? "" : "s"}
            </span>
          </div>
          <svg
            className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      )}

      {selectedPatient && selectedPatient.id !== 0 && expanded && (
        <div className="mt-2 grid grid-cols-1 gap-2 animate-fade-in">
          <div className="rounded-lg bg-red-50 border border-red-200 p-3">
            <span className="text-[10px] font-bold text-red-700 uppercase tracking-wide">Allergies</span>
            <p className="text-sm font-semibold text-red-800 mt-0.5">
              {selectedPatient.allergies.length > 0
                ? selectedPatient.allergies.join(", ")
                : "None known"}
            </p>
          </div>
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
            <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wide">Medications</span>
            <p className="text-sm font-semibold text-blue-800 mt-0.5">
              {selectedPatient.current_medications.map((m) => m.name).join(", ") || "None"}
            </p>
          </div>
        </div>
      )}

      {selectedPatient && selectedPatient.id === 0 && (
        <div className="mt-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
          <p className="text-xs text-emerald-700">
            New patient mode — the AI will extract patient details from the conversation automatically.
          </p>
        </div>
      )}
    </div>
  );
}
