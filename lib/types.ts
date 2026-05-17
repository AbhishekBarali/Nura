export interface Patient {
  id: number;
  name: string;
  age: number;
  gender: string;
  allergies: string[];
  current_medications: Medication[];
  conditions: string[];
  history: string[];
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
}

export interface TranscriptLine {
  speaker: string;
  text: string;
  timestamp: number;
}

export interface MedicationDetected {
  name: string;
  dosage: string;
  context: string;
}

export interface Symptom {
  description: string;
  severity: string;
  reported_by: "patient" | "doctor";
}

export interface Condition {
  name: string;
  status: "new" | "existing" | "suspected";
}

export interface Alert {
  type: "drug_interaction" | "allergy_conflict" | "critical_finding";
  severity: "high" | "medium" | "low";
  description: string;
  action_taken: string;
}

export interface Referral {
  department: string;
  reason: string;
  urgency: string;
}

export interface RecordUpdate {
  field: string;
  value: string;
  reason: string;
}

export interface LLMAnalysisResult {
  medications_detected: MedicationDetected[];
  symptoms: Symptom[];
  conditions: Condition[];
  alerts: Alert[];
  referrals: Referral[];
  record_updates: RecordUpdate[];
  summary_addition: string;
}

export interface ActionCard {
  id: string;
  type: "alert" | "medication" | "symptom" | "condition" | "referral" | "record_update" | "summary";
  timestamp: number;
  content: Record<string, unknown>;
  severity?: string;
}

export interface SOAPNote {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

export interface CompleteReportData {
  soap_note: SOAPNote;
  actions: ActionCard[];
  record_changes: RecordUpdate[];
  time_saved: string;
  total_actions: number;
}

export type SSEEventType = "transcript" | "action" | "alert" | "summary" | "complete" | "error";

export interface SSEEvent {
  type: SSEEventType;
  data: Record<string, unknown>;
}
