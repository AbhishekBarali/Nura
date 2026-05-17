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
    <div className="bg-[#12121a] border border-[#1e1e2e] rounded-xl p-4">
      <label className="block text-sm font-medium text-gray-300 mb-2">
        Select Patient
      </label>
      <select
        className="w-full bg-[#0a0a0f] border border-[#2e2e3e] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50"
        value={selectedPatient?.id || ""}
        onChange={(e) => {
          const patient = patients.find((p) => p.id === parseInt(e.target.value));
          if (patient) onSelect(patient);
        }}
        disabled={disabled}
      >
        <option value="">Choose a patient...</option>
        {patients.map((patient) => (
          <option key={patient.id} value={patient.id}>
            {patient.name} — {patient.age}yo {patient.gender}
          </option>
        ))}
      </select>

      {selectedPatient && (
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <div className="bg-[#0a0a0f] rounded-lg p-2">
            <span className="text-gray-500">Allergies:</span>
            <p className="text-red-400 font-medium">
              {selectedPatient.allergies.length > 0
                ? selectedPatient.allergies.join(", ")
                : "None known"}
            </p>
          </div>
          <div className="bg-[#0a0a0f] rounded-lg p-2">
            <span className="text-gray-500">Medications:</span>
            <p className="text-blue-400 font-medium">
              {selectedPatient.current_medications
                .map((m) => m.name)
                .join(", ") || "None"}
            </p>
          </div>
          <div className="bg-[#0a0a0f] rounded-lg p-2">
            <span className="text-gray-500">Conditions:</span>
            <p className="text-purple-400 font-medium">
              {selectedPatient.conditions.join(", ") || "None"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
