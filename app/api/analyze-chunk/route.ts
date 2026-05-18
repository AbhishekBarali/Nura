import { NextRequest, NextResponse } from "next/server";
import { getPatientById } from "@/lib/db";
import { analyzeTranscriptChunk } from "@/lib/llm";
import { checkDrugInteractions, checkAllergyConflict } from "@/lib/drug-interactions";
import { ActionCard, Patient } from "@/lib/types";

let actionCounter = 0;

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { patientId, transcript, timestamp } = body;

  // Allow operation without a patient (use empty defaults)
  let patient: Patient;
  if (patientId && patientId > 0) {
    const dbPatient = getPatientById(patientId);
    if (!dbPatient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }
    patient = dbPatient;
  } else {
    patient = {
      id: 0,
      name: "Unknown Patient",
      age: 0,
      gender: "Unknown",
      allergies: [],
      current_medications: [],
      conditions: [],
      history: [],
    };
  }

  const actions: ActionCard[] = [];
  let summary = "";

  // Always run local checks first (works without any API keys)
  const localActions = runLocalChecks(transcript, patient, timestamp);
  actions.push(...localActions);

  // Try LLM analysis for additional insights (non-blocking)
  try {
    const analysis = await analyzeTranscriptChunk(patient, transcript);

    // Only process LLM results if we actually got something back
    const hasLLMResults = analysis.medications_detected.length > 0 ||
      analysis.symptoms.length > 0 || analysis.alerts.length > 0 || analysis.referrals.length > 0;

    if (hasLLMResults) {
      // Process medications from LLM (avoid duplicates with local checks)
      const existingMedNames = new Set(actions.filter(a => a.type === "medication").map(a => ((a.content as Record<string, string>).name || "").toLowerCase()));
      
      for (const med of analysis.medications_detected) {
        if (existingMedNames.has(med.name.toLowerCase())) continue;
        actions.push({
          id: `live-${actionCounter++}`,
          type: "medication",
          timestamp,
          content: { name: med.name, dosage: med.dosage, context: med.context },
        });

        // Drug interaction check
        const currentMedNames = patient.current_medications.map((m) => m.name);
        const interactions = checkDrugInteractions(med.name, currentMedNames);
        for (const interaction of interactions) {
          actions.push({
            id: `live-${actionCounter++}`,
            type: "alert",
            timestamp,
            severity: interaction.severity,
            content: {
              type: "drug_interaction",
              description: interaction.description,
              action_taken: interaction.recommendation,
              drugs: [interaction.drug1, interaction.drug2],
            },
          });
        }

        // Allergy check
        const allergyConflict = checkAllergyConflict(med.name, patient.allergies);
        if (allergyConflict) {
          actions.push({
            id: `live-${actionCounter++}`,
            type: "alert",
            timestamp,
            severity: "high",
            content: {
              type: "allergy_conflict",
              description: allergyConflict.description,
              action_taken: "ALERT: Do not prescribe. Consider alternative medication.",
              allergen: allergyConflict.allergen,
          },
        });
      }
    }

      // Process symptoms from LLM (avoid duplicates)
      const existingSymptoms = new Set(actions.filter(a => a.type === "symptom").map(a => ((a.content as Record<string, string>).description || "").toLowerCase()));
      for (const symptom of analysis.symptoms) {
        if (existingSymptoms.has(symptom.description.toLowerCase())) continue;
        actions.push({
          id: `live-${actionCounter++}`,
          type: "symptom",
          timestamp,
          content: { description: symptom.description, severity: symptom.severity, reported_by: symptom.reported_by },
        });
      }

      // Process alerts from LLM (avoid duplicates)
      for (const alert of analysis.alerts) {
        const isDuplicate = actions.some(
          (a) => a.type === "alert" && (a.content as Record<string, unknown>).type === alert.type
        );
        if (!isDuplicate) {
          actions.push({
            id: `live-${actionCounter++}`,
            type: "alert",
            timestamp,
            severity: alert.severity,
            content: {
              type: alert.type,
              description: alert.description,
              action_taken: alert.action_taken,
            },
          });
        }
      }

      // Process referrals from LLM (avoid duplicates)
      const existingReferrals = new Set(actions.filter(a => a.type === "referral").map(a => ((a.content as Record<string, string>).department || "").toLowerCase()));
      for (const referral of analysis.referrals) {
        if (existingReferrals.has(referral.department.toLowerCase())) continue;
        actions.push({
          id: `live-${actionCounter++}`,
          type: "referral",
          timestamp,
          content: { department: referral.department, reason: referral.reason, urgency: referral.urgency },
        });
      }

      summary = analysis.summary_addition || "";
    }
  } catch (err) {
    console.error("LLM analysis failed, using local checks only:", err);
  }

  return NextResponse.json({ actions, summary });
}

// Local checks that always work without any API keys
function runLocalChecks(transcript: string, patient: Patient, timestamp: number): ActionCard[] {
  const actions: ActionCard[] = [];
  const text = transcript.toLowerCase();
  
  const commonDrugs = [
    "ibuprofen", "lisinopril", "metformin", "omeprazole", "atorvastatin",
    "bactrim", "amoxicillin", "aspirin", "warfarin", "nitrofurantoin",
  ];

  for (const drug of commonDrugs) {
    if (text.includes(drug)) {
      actions.push({
        id: `live-${actionCounter++}`,
        type: "medication",
        timestamp,
        content: { name: drug.charAt(0).toUpperCase() + drug.slice(1), dosage: "", context: "Detected in speech" },
      });

      const currentMedNames = patient.current_medications.map((m) => m.name);
      const interactions = checkDrugInteractions(drug, currentMedNames);
      for (const interaction of interactions) {
        actions.push({
          id: `live-${actionCounter++}`,
          type: "alert",
          timestamp,
          severity: interaction.severity,
          content: {
            type: "drug_interaction",
            description: interaction.description,
            action_taken: interaction.recommendation,
            drugs: [interaction.drug1, interaction.drug2],
          },
        });
      }

      const allergyConflict = checkAllergyConflict(drug, patient.allergies);
      if (allergyConflict) {
        actions.push({
          id: `live-${actionCounter++}`,
          type: "alert",
          timestamp,
          severity: "high",
          content: {
            type: "allergy_conflict",
            description: allergyConflict.description,
            action_taken: "ALERT: Do not prescribe. Consider alternative medication.",
            allergen: allergyConflict.allergen,
          },
        });
      }
    }
  }

  // Symptom detection
  const symptomMap: Record<string, string> = {
    "dizzy": "Dizziness",
    "dizziness": "Dizziness",
    "swelling": "Ankle swelling",
    "swollen": "Swelling",
    "tightness": "Chest tightness",
    "pressure": "Chest pressure",
    "short of breath": "Shortness of breath",
    "nausea": "Nausea",
    "tingling": "Left arm tingling",
    "pain": "Pain",
    "rash": "Skin rash",
  };

  for (const [keyword, label] of Object.entries(symptomMap)) {
    if (text.includes(keyword)) {
      actions.push({
        id: `live-${actionCounter++}`,
        type: "symptom",
        timestamp,
        content: { description: label, severity: "moderate", reported_by: "patient" },
      });
    }
  }

  // Condition detection
  if (text.includes("allerg")) {
    const allergens = ["penicillin", "sulfa", "aspirin"];
    for (const allergen of allergens) {
      if (text.includes(allergen)) {
        actions.push({
          id: `live-${actionCounter++}`,
          type: "condition",
          timestamp,
          content: { name: `${allergen.charAt(0).toUpperCase() + allergen.slice(1)} allergy`, status: "confirmed" },
        });
      }
    }
  }

  // Referral detection
  if (text.includes("cardiology") || text.includes("urgent evaluation") || text.includes("urgent") && text.includes("heart")) {
    actions.push({
      id: `live-${actionCounter++}`,
      type: "referral",
      timestamp,
      severity: "high",
      content: {
        department: "Cardiology",
        reason: "Cardiac symptoms requiring specialist evaluation",
        urgency: "urgent",
      },
    });
  }

  return actions;
}
