import { NextRequest, NextResponse } from "next/server";
import { getPatientById } from "@/lib/db";
import { getDemoTranscript } from "@/lib/speechmatics";
import { checkDrugInteractions, checkAllergyConflict } from "@/lib/drug-interactions";
import { ActionCard, TranscriptLine } from "@/lib/types";

// Instant mode: returns ALL results at once (no streaming, no waiting)
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { patientId, demoId } = body;

  // Auto-match patient from demoId if not provided or invalid
  const resolvedPatientId = patientId || demoId;
  const patient = getPatientById(resolvedPatientId);
  if (!patient) {
    return NextResponse.json({ error: "Patient not found" }, { status: 404 });
  }

  const demo = getDemoTranscript(demoId);
  if (!demo) {
    return NextResponse.json({ error: "Demo not found" }, { status: 404 });
  }

  // Process everything instantly
  const allActions: ActionCard[] = [];
  let actionCounter = 0;
  let fullTranscript = "";

  for (const line of demo.lines) {
    fullTranscript += `${line.speaker}: ${line.text}\n`;
  }

  // Run local analysis on all lines
  const chunkSize = 3;
  for (let i = 0; i < demo.lines.length; i += chunkSize) {
    const chunk = demo.lines.slice(i, i + chunkSize);
    const timestamp = chunk[chunk.length - 1].timestamp;
    const localActions = runLocalChecks(chunk, patient, timestamp, actionCounter);
    actionCounter += localActions.length;
    allActions.push(...localActions);
  }

  // Generate pre-computed SOAP notes per demo
  const soapNotes: Record<number, { subjective: string; objective: string; assessment: string; plan: string }> = {
    1: {
      subjective: "Patient reports dizziness (especially positional) and ankle swelling since starting lisinopril. Has been self-medicating with ibuprofen daily for 3 weeks for back pain, recommended by neighbor. Confirms penicillin allergy (rash).",
      objective: "Current medications: Lisinopril 10mg daily, Metformin 500mg twice daily. Patient adding OTC ibuprofen daily. Known penicillin allergy documented.",
      assessment: "Significant drug interaction identified: Ibuprofen + Lisinopril increases risk of renal impairment and reduces antihypertensive efficacy. Dizziness and edema may be exacerbated by this combination. Ibuprofen + Metformin also poses renal risk.",
      plan: "1. Discontinue ibuprofen immediately. 2. Consider alternative analgesic (acetaminophen). 3. Monitor renal function (BMP). 4. Reassess blood pressure control at follow-up. 5. Patient education on OTC drug interactions.",
    },
    2: {
      subjective: "Patient presents with UTI symptoms. Initially agreeable to Bactrim prescription. Patient self-identified sulfa allergy before medication was dispensed. Also reports worsening chronic back pain.",
      objective: "Documented allergies: Sulfa drugs, Aspirin. Current medication: Omeprazole 20mg daily. UTI confirmed by lab results.",
      assessment: "Near-miss prescribing error: Bactrim (sulfamethoxazole/trimethoprim) nearly prescribed to patient with documented sulfa allergy. Allergy conflict caught before dispensing. Alternative antibiotic selected.",
      plan: "1. Prescribe Nitrofurantoin 100mg twice daily x 7 days for UTI. 2. Avoid all sulfa-containing medications. 3. Address back pain at follow-up visit. 4. Allergy alert reinforced in patient record.",
    },
    3: {
      subjective: "Patient reports chest tightness for several days, worse with exertion (climbing stairs). Describes pressure sensation. Confirms left arm tingling and morning nausea. Symptoms progressive.",
      objective: "Current medication: Atorvastatin 40mg daily. Known conditions: High cholesterol, family history of heart disease. Presenting symptoms: chest pressure, exertional dyspnea, left arm paresthesia, nausea.",
      assessment: "High suspicion for acute coronary syndrome given symptom constellation (chest pressure + arm radiation + dyspnea + nausea) combined with significant cardiac risk factors (family history, hyperlipidemia). Requires urgent cardiac evaluation.",
      plan: "1. URGENT: Same-day cardiology referral. 2. Stat ECG and troponin levels. 3. Consider aspirin 325mg if no contraindications. 4. Patient advised to call 911 if symptoms worsen. 5. NPO pending cardiac workup.",
    },
  };

  return NextResponse.json({
    transcript: demo.lines,
    actions: allActions,
    summary: generateSummary(demoId),
    soap_note: soapNotes[demoId] || soapNotes[1],
    total_actions: allActions.length,
    time_saved: "12 minutes",
    duration: demo.duration,
    patient: patient,
  });
}

function runLocalChecks(
  lines: TranscriptLine[],
  patient: { allergies: string[]; current_medications: Array<{ name: string }> },
  timestamp: number,
  startId: number
): ActionCard[] {
  const actions: ActionCard[] = [];
  let id = startId;
  const text = lines.map((l) => l.text).join(" ").toLowerCase();

  const commonDrugs = [
    "ibuprofen", "lisinopril", "metformin", "omeprazole", "atorvastatin",
    "bactrim", "amoxicillin", "aspirin", "warfarin", "acetaminophen",
    "nitrofurantoin",
  ];

  for (const drug of commonDrugs) {
    if (text.includes(drug)) {
      actions.push({
        id: `action-${id++}`,
        type: "medication",
        timestamp,
        content: { name: drug.charAt(0).toUpperCase() + drug.slice(1), dosage: "", context: "Mentioned in conversation" },
      });

      const currentMedNames = patient.current_medications.map((m) => m.name);
      const interactions = checkDrugInteractions(drug, currentMedNames);
      for (const interaction of interactions) {
        actions.push({
          id: `action-${id++}`,
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
          id: `action-${id++}`,
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
    "tightness": "Chest tightness",
    "pressure": "Chest pressure",
    "short of breath": "Shortness of breath",
    "nausea": "Nausea",
    "tingling": "Left arm tingling",
    "pain": "Pain",
  };

  for (const [keyword, label] of Object.entries(symptomMap)) {
    if (text.includes(keyword)) {
      actions.push({
        id: `action-${id++}`,
        type: "symptom",
        timestamp,
        content: { description: label, severity: "moderate", reported_by: "patient" },
      });
    }
  }

  // Referral detection
  if (text.includes("cardiology") || text.includes("urgent evaluation")) {
    actions.push({
      id: `action-${id++}`,
      type: "referral",
      timestamp,
      severity: "high",
      content: {
        department: "Cardiology",
        reason: "Suspected acute coronary syndrome — chest pressure, arm radiation, dyspnea with cardiac risk factors",
        urgency: "urgent",
      },
    });
  }

  return actions;
}

function generateSummary(demoId: number): string {
  const summaries: Record<number, string> = {
    1: "Patient Mrs. Chen (67F) reports dizziness and ankle swelling since starting lisinopril. Self-medicating with daily ibuprofen for back pain (3 weeks). Critical drug interaction identified: Ibuprofen + Lisinopril poses significant renal risk and reduces BP control. Penicillin allergy confirmed. Immediate intervention required.",
    2: "Patient Mr. Wilson (45M) presents with UTI. Near-miss prescribing error: Bactrim (sulfa-based) nearly prescribed despite documented sulfa allergy. Allergy conflict caught by system. Alternative antibiotic (nitrofurantoin) selected. Patient also reports worsening back pain requiring follow-up.",
    3: "Patient Ms. Rodriguez (52F) presents with progressive chest tightness, exertional dyspnea, left arm tingling, and nausea. Given family history of heart disease and symptom constellation, high suspicion for acute coronary syndrome. Urgent cardiology referral initiated. Same-day evaluation required.",
  };
  return summaries[demoId] || "";
}
