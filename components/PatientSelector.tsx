"use client";

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
  return (
    <div className="elevated-card rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-lg bg-cyan-500/10 flex items-center justify-center">
          <svg className="w-3.5 h-3.5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
        </div>
        <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
          Patient Record
        </label>
        <span className="text-[10px] text-[var(--text-muted)] ml-auto">(Optional)</span>
      </div>

      <select
        className="w-full bg-[var(--bg-primary)] border border-[var(--border-medium)] rounded-xl px-4 py-2.5 text-[var(--text-primary)] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/40 disabled:opacity-40 transition-all cursor-pointer appearance-none"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '18px' }}
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
        <option value="new">➕ New Patient (unknown)</option>
        {patients.map((patient) => (
          <option key={patient.id} value={patient.id}>
            {patient.name} — {patient.age}yo {patient.gender}
          </option>
        ))}
      </select>

      {selectedPatient && selectedPatient.id !== 0 && (
        <div className="mt-3 grid grid-cols-1 gap-2">
          <div className="rounded-xl bg-[var(--alert-red-glow)] border border-rose-500/10 p-2.5">
            <span className="text-[9px] font-bold text-rose-400/70 uppercase tracking-wider">Allergies</span>
            <p className="text-xs font-semibold text-rose-300 mt-0.5">
              {selectedPatient.allergies.length > 0
                ? selectedPatient.allergies.join(", ")
                : "None known"}
            </p>
          </div>
          <div className="rounded-xl bg-cyan-500/5 border border-cyan-500/10 p-2.5">
            <span className="text-[9px] font-bold text-cyan-400/70 uppercase tracking-wider">Medications</span>
            <p className="text-xs font-semibold text-cyan-300 mt-0.5">
              {selectedPatient.current_medications.map((m) => m.name).join(", ") || "None"}
            </p>
          </div>
        </div>
      )}

      {selectedPatient && selectedPatient.id === 0 && (
        <div className="mt-3 p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
          <p className="text-[10px] text-emerald-400">
            New patient mode — the AI will extract patient details from the conversation automatically.
          </p>
        </div>
      )}
    </div>
  );
}
