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
      subjective: "Mrs. Chen (67F) presents with 2-week history of positional dizziness and bilateral ankle edema since starting lisinopril. Reports daily OTC ibuprofen use for 3 weeks for lower back pain (neighbor-recommended). Also notes decreased urinary frequency. Confirms penicillin allergy (severe rash/hives). Currently on Metformin 500mg BID for T2DM.",
      objective: "Current medications: Lisinopril 10mg daily, Metformin 500mg twice daily. Self-medicating with OTC ibuprofen daily x3 weeks. Documented allergy: Penicillin (rash + hives). Symptoms temporal correlation with ibuprofen initiation noted.",
      assessment: "Critical drug interaction identified: NSAID (Ibuprofen) + ACE inhibitor (Lisinopril) significantly increases nephrotoxicity risk and reduces antihypertensive efficacy. Triple whammy risk present (NSAID + ACEi + diuretic-like effect). Ibuprofen + Metformin compounds renal impairment risk. Current symptoms (dizziness, edema, oliguria) consistent with early renal compromise secondary to drug interaction.",
      plan: "1. IMMEDIATE: Discontinue ibuprofen — counsel patient on risks. 2. Alternative analgesia: Acetaminophen 500mg PRN for back pain. 3. URGENT: Basic metabolic panel (BMP) + eGFR to assess renal function. 4. Reassess blood pressure in 1 week (expect improvement off NSAID). 5. Follow-up in 2 weeks for renal function recheck. 6. Patient education: OTC medication interactions handout provided. 7. Pharmacy alert: flag chart for NSAID contraindication.",
    },
    2: {
      subjective: "Mr. Wilson (45M) presents for UTI treatment. Lab-confirmed urinary tract infection. Patient identified own sulfa allergy when Bactrim was initially suggested — near-miss prescribing event. Also reports worsening lower back pain (7/10), right-sided, affecting sleep, temporally related to new warehouse job with heavy lifting (1 month). Has documented aspirin sensitivity and GERD managed with omeprazole.",
      objective: "Documented allergies: Sulfa drugs (documented), Aspirin (sensitivity). Current medication: Omeprazole 20mg daily. Conditions: GERD, chronic back pain. Urine culture: positive for UTI. Near-miss: Bactrim (sulfamethoxazole) initially considered — contraindicated.",
      assessment: "1. Uncomplicated UTI — requires non-sulfa antibiotic. Near-miss prescribing error caught by patient self-advocacy. 2. Acute exacerbation of chronic low back pain — mechanical etiology likely given new occupational demands. Pain management limited by aspirin sensitivity (NSAID class caution warranted). 3. GERD — stable on current omeprazole regimen.",
      plan: "1. UTI: Nitrofurantoin 100mg BID x 7 days (sulfa-safe alternative). 2. ALLERGY ALERT: Reinforce sulfa + aspirin allergies prominently in chart. 3. Back pain: Acetaminophen 650mg Q6H PRN + physiotherapy referral. 4. Ergonomic assessment recommended for workplace. 5. Follow-up: 1 week (UTI resolution), 2 weeks (back pain). 6. Verify omeprazole efficacy at next visit.",
    },
    3: {
      subjective: "Ms. Rodriguez (52F) presents with 4-day progressive chest tightness/pressure ('someone sitting on chest'), worse with exertion (stairs). Reports left arm tingling (recurrent), exertional dyspnea, morning nausea, and nocturnal diaphoresis. Rates pain 6-7/10 at worst. Significant family history: father MI at 58, brother coronary stent at 55. Initially attributed arm symptoms to positional and sweats to menopause.",
      objective: "Current medication: Atorvastatin 40mg daily. Known conditions: Hyperlipidemia, strong family history of premature CAD. Presenting constellation: substernal pressure + exertional component + left arm radiation + dyspnea + nausea + diaphoresis. Age 52, post-menopausal status unclear. Risk factors: family history (2 first-degree relatives with premature CAD), dyslipidemia.",
      assessment: "HIGH CLINICAL SUSPICION for acute coronary syndrome (ACS) / unstable angina. Symptom constellation (chest pressure + arm radiation + exertional dyspnea + nausea + diaphoresis) with multiple cardiac risk factors represents a medical urgency. Framingham risk score: HIGH. Requires same-day cardiac evaluation — cannot be managed outpatient pending workup.",
      plan: "1. URGENT: Same-day cardiology referral — team contacted. 2. STAT: 12-lead ECG within 10 minutes. 3. STAT: High-sensitivity troponin (serial at 0h and 3h). 4. Aspirin 325mg administered (no contraindications identified). 5. NPO pending cardiac workup. 6. PATIENT SAFETY COUNSELING: Call 999 immediately if symptoms worsen; do NOT drive. 7. Continue atorvastatin. 8. Anticipate: stress test or coronary angiography based on initial results.",
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
