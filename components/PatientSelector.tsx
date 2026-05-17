"use client";

import { Patient } from "@/lib/types";

interface PatientSelectorProps {
  patients: Patient[];
  selectedPatient: Patient | null;
  onSelect: (patient: Patient) => void;
  disabled: boolean;
}

export default function PatientSelector({
  patients,
  selectedPatient,
  onSelect,
  disabled,
}: PatientSelectorProps) {
  return (
    <div className="elevated-card rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-lg bg-cyan-500/10 flex items-center justify-center">
          <svg className="w-3.5 h-3.5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
        </div>
        <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
          Patient Record
        </label>
      </div>

      <select
        className="w-full bg-[var(--bg-primary)] border border-[var(--border-medium)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/40 disabled:opacity-40 transition-all cursor-pointer appearance-none"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '18px' }}
        value={selectedPatient?.id || ""}
        onChange={(e) => {
          const patient = patients.find((p) => p.id === parseInt(e.target.value));
          if (patient) onSelect(patient);
        }}
        disabled={disabled}
      >
        <option value="">Select patient...</option>
        {patients.map((patient) => (
          <option key={patient.id} value={patient.id}>
            {patient.name} — {patient.age}yo {patient.gender}
          </option>
        ))}
      </select>

      {selectedPatient && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-xl bg-[var(--alert-red-glow)] border border-rose-500/10 p-3">
            <span className="text-[10px] font-bold text-rose-400/70 uppercase tracking-wider">Allergies</span>
            <p className="text-sm font-semibold text-rose-300 mt-1">
              {selectedPatient.allergies.length > 0
                ? selectedPatient.allergies.join(", ")
                : "None known"}
            </p>
          </div>
          <div className="rounded-xl bg-cyan-500/5 border border-cyan-500/10 p-3">
            <span className="text-[10px] font-bold text-cyan-400/70 uppercase tracking-wider">Active Medications</span>
            <p className="text-sm font-semibold text-cyan-300 mt-1">
              {selectedPatient.current_medications.map((m) => m.name).join(", ") || "None"}
            </p>
          </div>
          <div className="rounded-xl bg-purple-500/5 border border-purple-500/10 p-3">
            <span className="text-[10px] font-bold text-purple-400/70 uppercase tracking-wider">Conditions</span>
            <p className="text-sm font-semibold text-purple-300 mt-1">
              {selectedPatient.conditions.join(", ") || "None"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
