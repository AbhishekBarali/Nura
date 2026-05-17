import { Patient } from "./types";

export function getClinicalAnalysisPrompt(patient: Patient, transcript: string): string {
  return `You are an autonomous clinical decision support agent. You analyze doctor-patient conversation transcripts in real-time and extract structured medical information.

PATIENT RECORD:
- Name: ${patient.name}
- Age: ${patient.age}, ${patient.gender}
- Known Allergies: ${patient.allergies.join(", ") || "None"}
- Current Medications: ${patient.current_medications.map(m => `${m.name} ${m.dosage} ${m.frequency}`).join(", ") || "None"}
- Existing Conditions: ${patient.conditions.join(", ") || "None"}

CONVERSATION SEGMENT:
${transcript}

Given this patient's existing medical record and the conversation segment above, you must:

1. EXTRACT: Identify any medications, symptoms, conditions, allergies, or vital signs mentioned
2. CROSS-REFERENCE: Check extracted medications against the patient's known allergies and current medications for interactions
3. DECIDE: Determine if any finding requires:
   - An alert (drug interaction, allergy conflict, critical symptom)
   - A referral (which specialty and why)
   - A record update (new information not in patient's file)
4. CLASSIFY urgency: routine / moderate / urgent / critical

You must respond in valid JSON with this exact structure:
{
  "medications_detected": [{ "name": "", "dosage": "", "context": "" }],
  "symptoms": [{ "description": "", "severity": "", "reported_by": "patient" }],
  "conditions": [{ "name": "", "status": "new" }],
  "alerts": [{ "type": "drug_interaction", "severity": "high", "description": "", "action_taken": "" }],
  "referrals": [{ "department": "", "reason": "", "urgency": "" }],
  "record_updates": [{ "field": "", "value": "", "reason": "" }],
  "summary_addition": ""
}

If nothing clinically significant is found in a segment, return empty arrays and an empty summary_addition.
Do NOT hallucinate findings. Only report what is explicitly mentioned or directly inferable.
Respond ONLY with valid JSON. No markdown, no explanation.`;
}

export function getSOAPNotePrompt(patient: Patient, fullTranscript: string, actions: string): string {
  return `You are a clinical documentation agent. Generate a complete SOAP note based on the following doctor-patient encounter.

PATIENT: ${patient.name}, ${patient.age}yo ${patient.gender}
ALLERGIES: ${patient.allergies.join(", ") || "None"}
MEDICATIONS: ${patient.current_medications.map(m => `${m.name} ${m.dosage}`).join(", ") || "None"}
CONDITIONS: ${patient.conditions.join(", ") || "None"}

FULL TRANSCRIPT:
${fullTranscript}

ACTIONS TAKEN DURING ENCOUNTER:
${actions}

Generate a SOAP note in this JSON format:
{
  "subjective": "What the patient reported (symptoms, concerns, history)",
  "objective": "Clinical observations discussed (vitals, exam findings mentioned)",
  "assessment": "Clinical analysis and identified issues",
  "plan": "Recommended next steps, medication changes, referrals, follow-up"
}

Be concise but thorough. Respond ONLY with valid JSON.`;
}
