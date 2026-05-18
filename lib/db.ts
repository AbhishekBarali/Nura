import { Patient } from "./types";

const patients: Patient[] = [
  {
    id: 1,
    name: "Mrs. Sarah Chen",
    age: 67,
    gender: "Female",
    allergies: ["Penicillin"],
    current_medications: [
      { name: "Lisinopril", dosage: "10mg", frequency: "daily" },
      { name: "Metformin", dosage: "500mg", frequency: "twice daily" },
    ],
    conditions: ["Hypertension", "Type 2 Diabetes"],
    history: ["Annual checkup - 2023", "Diabetes management - 2022"],
  },
  {
    id: 2,
    name: "Mr. James Wilson",
    age: 45,
    gender: "Male",
    allergies: ["Sulfa drugs", "Aspirin"],
    current_medications: [
      { name: "Omeprazole", dosage: "20mg", frequency: "daily" },
    ],
    conditions: ["GERD", "Chronic back pain"],
    history: ["Back pain consultation - 2023", "GERD diagnosis - 2021"],
  },
  {
    id: 3,
    name: "Ms. Maria Rodriguez",
    age: 52,
    gender: "Female",
    allergies: [],
    current_medications: [
      { name: "Atorvastatin", dosage: "40mg", frequency: "daily" },
    ],
    conditions: ["High cholesterol", "Family history of heart disease"],
    history: ["Cholesterol check - 2023", "Cardiac risk assessment - 2022"],
  },
];

export function getAllPatients(): Patient[] {
  return patients;
}

export function getPatientById(id: number): Patient | null {
  return patients.find((p) => p.id === id) || null;
}

export function updatePatientRecord(id: number, updates: Partial<Patient>): void {
  const patient = patients.find((p) => p.id === id);
  if (!patient) return;
  if (updates.current_medications) patient.current_medications = updates.current_medications;
  if (updates.conditions) patient.conditions = updates.conditions;
  if (updates.allergies) patient.allergies = updates.allergies;
}
