import Database from "better-sqlite3";
import path from "path";
import { Patient } from "./types";

let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!db) {
    const dbPath = path.join(process.cwd(), "data", "wardscribe.db");
    db = new Database(dbPath);
    db.pragma("journal_mode = WAL");
    initializeDb(db);
  }
  return db;
}

function initializeDb(database: Database.Database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS patients (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      age INTEGER,
      gender TEXT,
      allergies TEXT DEFAULT '[]',
      current_medications TEXT DEFAULT '[]',
      conditions TEXT DEFAULT '[]',
      history TEXT DEFAULT '[]'
    );
  `);

  // Seed data if empty
  const count = database.prepare("SELECT COUNT(*) as count FROM patients").get() as { count: number };
  if (count.count === 0) {
    seedPatients(database);
  }
}

function seedPatients(database: Database.Database) {
  const patients = [
    {
      id: 1,
      name: "Mrs. Sarah Chen",
      age: 67,
      gender: "Female",
      allergies: JSON.stringify(["Penicillin"]),
      current_medications: JSON.stringify([
        { name: "Lisinopril", dosage: "10mg", frequency: "daily" },
        { name: "Metformin", dosage: "500mg", frequency: "twice daily" },
      ]),
      conditions: JSON.stringify(["Hypertension", "Type 2 Diabetes"]),
      history: JSON.stringify(["Annual checkup - 2023", "Diabetes management - 2022"]),
    },
    {
      id: 2,
      name: "Mr. James Wilson",
      age: 45,
      gender: "Male",
      allergies: JSON.stringify(["Sulfa drugs", "Aspirin"]),
      current_medications: JSON.stringify([
        { name: "Omeprazole", dosage: "20mg", frequency: "daily" },
      ]),
      conditions: JSON.stringify(["GERD", "Chronic back pain"]),
      history: JSON.stringify(["Back pain consultation - 2023", "GERD diagnosis - 2021"]),
    },
    {
      id: 3,
      name: "Ms. Maria Rodriguez",
      age: 52,
      gender: "Female",
      allergies: JSON.stringify([]),
      current_medications: JSON.stringify([
        { name: "Atorvastatin", dosage: "40mg", frequency: "daily" },
      ]),
      conditions: JSON.stringify(["High cholesterol", "Family history of heart disease"]),
      history: JSON.stringify(["Cholesterol check - 2023", "Cardiac risk assessment - 2022"]),
    },
  ];

  const insert = database.prepare(
    "INSERT INTO patients (id, name, age, gender, allergies, current_medications, conditions, history) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  );

  for (const p of patients) {
    insert.run(p.id, p.name, p.age, p.gender, p.allergies, p.current_medications, p.conditions, p.history);
  }
}

export function getAllPatients(): Patient[] {
  const rows = getDb().prepare("SELECT * FROM patients").all() as Array<Record<string, unknown>>;
  return rows.map(parsePatientRow);
}

export function getPatientById(id: number): Patient | null {
  const row = getDb().prepare("SELECT * FROM patients WHERE id = ?").get(id) as Record<string, unknown> | undefined;
  if (!row) return null;
  return parsePatientRow(row);
}

export function updatePatientRecord(id: number, updates: Partial<Patient>): void {
  const db = getDb();
  if (updates.current_medications) {
    db.prepare("UPDATE patients SET current_medications = ? WHERE id = ?").run(
      JSON.stringify(updates.current_medications),
      id
    );
  }
  if (updates.conditions) {
    db.prepare("UPDATE patients SET conditions = ? WHERE id = ?").run(
      JSON.stringify(updates.conditions),
      id
    );
  }
  if (updates.allergies) {
    db.prepare("UPDATE patients SET allergies = ? WHERE id = ?").run(
      JSON.stringify(updates.allergies),
      id
    );
  }
}

function parsePatientRow(row: Record<string, unknown>): Patient {
  return {
    id: row.id as number,
    name: row.name as string,
    age: row.age as number,
    gender: row.gender as string,
    allergies: JSON.parse((row.allergies as string) || "[]"),
    current_medications: JSON.parse((row.current_medications as string) || "[]"),
    conditions: JSON.parse((row.conditions as string) || "[]"),
    history: JSON.parse((row.history as string) || "[]"),
  };
}
