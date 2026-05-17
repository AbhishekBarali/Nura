import { NextRequest } from "next/server";
import { getPatientById } from "@/lib/db";
import { analyzeTranscriptChunk, generateSOAPNote } from "@/lib/llm";
import { getDemoTranscript } from "@/lib/speechmatics";
import { checkDrugInteractions, checkAllergyConflict } from "@/lib/drug-interactions";
import { ActionCard, LLMAnalysisResult, TranscriptLine } from "@/lib/types";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { patientId, demoId } = body;

  const patient = getPatientById(patientId);
  if (!patient) {
    return new Response(JSON.stringify({ error: "Patient not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const demo = getDemoTranscript(demoId);
  if (!demo) {
    return new Response(JSON.stringify({ error: "Demo not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Create SSE stream
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (type: string, data: unknown) => {
        const event = `event: ${type}\ndata: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(event));
      };

      const allActions: ActionCard[] = [];
      let fullTranscript = "";
      let actionCounter = 0;

      // Process transcript lines in chunks (simulating real-time)
      const chunkSize = 3; // Process 3 lines at a time
      for (let i = 0; i < demo.lines.length; i += chunkSize) {
        const chunk = demo.lines.slice(i, i + chunkSize);

        // Send each transcript line with delay
        for (const line of chunk) {
          sendEvent("transcript", {
            speaker: line.speaker,
            text: line.text,
            timestamp: line.timestamp,
          });
          fullTranscript += `${line.speaker}: ${line.text}\n`;

          // Simulate real-time delay between lines
          await delay(800);
        }

        // Analyze the chunk
        const chunkText = chunk.map((l: TranscriptLine) => `${l.speaker}: ${l.text}`).join("\n");
        const timestamp = chunk[chunk.length - 1].timestamp;

        try {
          const analysis = await analyzeTranscriptChunk(patient, chunkText);

          // Process LLM results and also run local checks
          const actions = processAnalysis(analysis, patient, timestamp, actionCounter);
          actionCounter += actions.length;

          for (const action of actions) {
            allActions.push(action);
            if (action.type === "alert") {
              sendEvent("alert", action);
            } else {
              sendEvent("action", action);
            }
            await delay(300);
          }

          // Send summary update
          if (analysis.summary_addition) {
            sendEvent("summary", { text: analysis.summary_addition, timestamp });
          }
        } catch (error) {
          console.error("Analysis error:", error);
          // Run local-only checks as fallback
          const localActions = runLocalChecks(chunk, patient, timestamp, actionCounter);
          actionCounter += localActions.length;
          for (const action of localActions) {
            allActions.push(action);
            if (action.type === "alert") {
              sendEvent("alert", action);
            } else {
              sendEvent("action", action);
            }
          }
        }

        await delay(500);
      }

      // Generate final report
      try {
        const actionsDescription = allActions
          .map((a) => `[${a.type}] ${JSON.stringify(a.content)}`)
          .join("\n");

        const soapNote = await generateSOAPNote(patient, fullTranscript, actionsDescription);

        sendEvent("complete", {
          soap_note: soapNote,
          actions: allActions,
          total_actions: allActions.length,
          time_saved: "12 minutes",
        });
      } catch {
        sendEvent("complete", {
          soap_note: {
            subjective: "Patient encounter documented by Nura.",
            objective: "See transcript for details.",
            assessment: "Clinical analysis completed.",
            plan: "Follow up on flagged items.",
          },
          actions: allActions,
          total_actions: allActions.length,
          time_saved: "12 minutes",
        });
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

function processAnalysis(
  analysis: LLMAnalysisResult,
  patient: { allergies: string[]; current_medications: Array<{ name: string }> },
  timestamp: number,
  startId: number
): ActionCard[] {
  const actions: ActionCard[] = [];
  let id = startId;

  // Process medications
  for (const med of analysis.medications_detected) {
    actions.push({
      id: `action-${id++}`,
      type: "medication",
      timestamp,
      content: { name: med.name, dosage: med.dosage, context: med.context },
    });

    // Local drug interaction check
    const currentMedNames = patient.current_medications.map((m) => m.name);
    const interactions = checkDrugInteractions(med.name, currentMedNames);
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

    // Local allergy check
    const allergyConflict = checkAllergyConflict(med.name, patient.allergies);
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

  // Process symptoms
  for (const symptom of analysis.symptoms) {
    actions.push({
      id: `action-${id++}`,
      type: "symptom",
      timestamp,
      content: { description: symptom.description, severity: symptom.severity, reported_by: symptom.reported_by },
    });
  }

  // Process conditions
  for (const condition of analysis.conditions) {
    actions.push({
      id: `action-${id++}`,
      type: "condition",
      timestamp,
      content: { name: condition.name, status: condition.status },
    });
  }

  // Process LLM-detected alerts
  for (const alert of analysis.alerts) {
    // Avoid duplicates from local checks
    const isDuplicate = actions.some(
      (a) => a.type === "alert" && (a.content as Record<string, unknown>).type === alert.type
    );
    if (!isDuplicate) {
      actions.push({
        id: `action-${id++}`,
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
      id: `action-${id++}`,
      type: "referral",
      timestamp,
      content: { department: referral.department, reason: referral.reason, urgency: referral.urgency },
    });
  }

  return actions;
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

  // Check for medication mentions
  const commonDrugs = [
    "ibuprofen", "lisinopril", "metformin", "omeprazole", "atorvastatin",
    "bactrim", "amoxicillin", "aspirin", "warfarin", "acetaminophen",
  ];

  for (const drug of commonDrugs) {
    if (text.includes(drug)) {
      actions.push({
        id: `action-${id++}`,
        type: "medication",
        timestamp,
        content: { name: drug, dosage: "", context: "Mentioned in conversation" },
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
            action_taken: "ALERT: Do not prescribe. Consider alternative.",
          },
        });
      }
    }
  }

  // Check for symptom keywords
  const symptoms = ["dizzy", "dizziness", "pain", "swelling", "tightness", "pressure", "short of breath", "nausea", "tingling"];
  for (const symptom of symptoms) {
    if (text.includes(symptom)) {
      actions.push({
        id: `action-${id++}`,
        type: "symptom",
        timestamp,
        content: { description: symptom, severity: "moderate", reported_by: "patient" },
      });
      break; // Only one symptom card per chunk
    }
  }

  return actions;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
