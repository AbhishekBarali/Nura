const Database = require("better-sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "nura.db");
const db = new Database(dbPath);

db.pragma("journal_mode = WAL");

// Create table
db.exec(`
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

// Clear existing data
db.exec("DELETE FROM patients");

// Insert demo patients
const insert = db.prepare(
  "INSERT INTO patients (id, name, age, gender, allergies, current_medications, conditions, history) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
);

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

for (const p of patients) {
  insert.run(p.id, p.name, p.age, p.gender, p.allergies, p.current_medications, p.conditions, p.history);
}

console.log("✅ Database seeded with 3 demo patients");
db.close();
