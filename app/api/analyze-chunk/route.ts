import { NextRequest, NextResponse } from "next/server";
import { getPatientById } from "@/lib/db";
import { analyzeTranscriptChunk } from "@/lib/llm";
import { checkDrugInteractions, checkAllergyConflict } from "@/lib/drug-interactions";
import { ActionCard } from "@/lib/types";

let actionCounter = 0;

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { patientId, transcript, timestamp } = body;

  const patient = getPatientById(patientId);
  if (!patient) {
    return NextResponse.json({ error: "Patient not found" }, { status: 404 });
  }

  const actions: ActionCard[] = [];
  let summary = "";

  try {
    // Try LLM analysis first
    const analysis = await analyzeTranscriptChunk(patient, transcript);

    // Process medications
    for (const med of analysis.medications_detected) {
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

    // Process symptoms
    for (const symptom of analysis.symptoms) {
      actions.push({
        id: `live-${actionCounter++}`,
        type: "symptom",
        timestamp,
        content: { description: symptom.description, severity: symptom.severity, reported_by: symptom.reported_by },
      });
    }

    // Process alerts from LLM
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

    // Process referrals
    for (const referral of analysis.referrals) {
      actions.push({
        id: `live-${actionCounter++}`,
        type: "referral",
        timestamp,
        content: { department: referral.department, reason: referral.reason, urgency: referral.urgency },
      });
    }

    summary = analysis.summary_addition || "";
  } catch {
    // Fallback: local-only checks
    const text = transcript.toLowerCase();
    const commonDrugs = [
      "ibuprofen", "lisinopril", "metformin", "omeprazole", "atorvastatin",
      "bactrim", "amoxicillin", "aspirin", "warfarin",
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
              action_taken: "ALERT: Do not prescribe.",
            },
          });
        }
      }
    }
  }

  return NextResponse.json({ actions, summary });
}
