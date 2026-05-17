import { NextRequest } from "next/server";
import { getPatientById, getAllPatients } from "@/lib/db";
import { checkDrugInteractions, checkAllergyConflict } from "@/lib/drug-interactions";
import { ActionCard, TranscriptLine, Patient } from "@/lib/types";
import OpenAI from "openai";

export const dynamic = "force-dynamic";

function getLLMClient() {
  const apiKey = process.env.FEATHERLESS_API_KEY;
  if (!apiKey || apiKey === "your_key_here") return null;
  return new OpenAI({
    baseURL: process.env.FEATHERLESS_BASE_URL || "https://api.featherless.ai/v1",
    apiKey,
  });
}

async function callLLM(prompt: string): Promise<string> {
  const client = getLLMClient();
  if (!client) throw new Error("LLM API key not configured");
  const response = await client.chat.completions.create({
    model: process.env.FEATHERLESS_MODEL_NAME || "google/gemma-4-31B-it",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.1,
    max_tokens: 3000,
  });
  return response.choices[0]?.message?.content || "{}";
}

function parseSpeechmaticsResult(data: Record<string, unknown>): {
  transcript: TranscriptLine[];
  duration: number;
} {
  const results = (data.results || []) as Array<{
    type: string;
    start_time: number;
    end_time: number;
    alternatives?: Array<{ content: string; speaker?: string }>;
  }>;

  const lines: TranscriptLine[] = [];
  let currentSpeaker = "";
  let currentText = "";
  let currentTimestamp = 0;
  let lastEndTime = 0;

  for (const result of results) {
    if (result.type !== "word") continue;
    const alt = result.alternatives?.[0];
    if (!alt) continue;

    const speaker = alt.speaker || "S1";
    const word = alt.content;
    const startTime = result.start_time;

    if (speaker !== currentSpeaker || (startTime - lastEndTime > 1.5 && currentText)) {
      if (currentText.trim()) {
        lines.push({
          speaker: mapSpeaker(currentSpeaker),
          text: currentText.trim(),
          timestamp: currentTimestamp,
        });
      }
      currentSpeaker = speaker;
      currentText = word;
      currentTimestamp = startTime;
    } else {
      currentText += " " + word;
    }
    lastEndTime = result.end_time;
  }

  if (currentText.trim()) {
    lines.push({
      speaker: mapSpeaker(currentSpeaker),
      text: currentText.trim(),
      timestamp: currentTimestamp,
    });
  }

  return { transcript: lines, duration: lastEndTime || 60 };
}

function mapSpeaker(speaker: string): string {
  if (speaker === "S1" || speaker === "speaker_0") return "Doctor";
  return "Patient";
}

// Find approximate timestamp in transcript for a keyword/phrase
function findTimestamp(transcript: TranscriptLine[], hint: string): number {
  if (!hint) return 0;
  const lower = hint.toLowerCase();
  // Try to find a line that contains any word from the hint
  const words = lower.split(/\s+/).filter((w) => w.length > 3);
  for (const line of transcript) {
    const lineLower = line.text.toLowerCase();
    if (words.some((w) => lineLower.includes(w))) {
      return line.timestamp;
    }
  }
  return 0;
}

// SSE helper
function sendEvent(controller: ReadableStreamDefaultController, event: string, data: unknown) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  controller.enqueue(new TextEncoder().encode(payload));
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const audioFile = formData.get("audio") as File | null;
  const patientIdStr = formData.get("patientId") as string | null;

  if (!audioFile) {
    return new Response(JSON.stringify({ error: "No audio file provided" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  let patient: Patient | null = null;
  if (patientIdStr && parseInt(patientIdStr) > 0) {
    patient = getPatientById(parseInt(patientIdStr));
  }

  const arrayBuffer = await audioFile.arrayBuffer();
  const mimeType = audioFile.type || "audio/wav";

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Phase 1: Submit to Speechmatics
        sendEvent(controller, "phase", { phase: "submitting", message: "Submitting audio to transcription service..." });

        const apiKey = process.env.SPEECHMATICS_API_KEY;
        if (!apiKey || apiKey === "your_key_here") {
          sendEvent(controller, "error", { error: "SPEECHMATICS_API_KEY not configured" });
          controller.close();
          return;
        }

        const config = JSON.stringify({
          type: "transcription",
          transcription_config: {
            language: "en",
            diarization: "speaker",
            operating_point: "enhanced",
          },
        });

        const smFormData = new FormData();
        const audioBlob = new Blob([arrayBuffer], { type: mimeType });
        smFormData.append("data_file", audioBlob, "audio.wav");
        smFormData.append("config", config);

        const submitResponse = await fetch("https://asr.api.speechmatics.com/v2/jobs", {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}` },
          body: smFormData,
        });

        if (!submitResponse.ok) {
          const errText = await submitResponse.text();
          sendEvent(controller, "error", { error: `Speechmatics submit failed: ${submitResponse.status} ${errText}` });
          controller.close();
          return;
        }

        const { id: jobId } = await submitResponse.json();
        sendEvent(controller, "phase", { phase: "transcribing", message: "Transcribing audio with speaker diarization...", jobId });

        // Phase 2: Poll for completion - send progress updates
        let attempts = 0;
        const maxAttempts = 60;
        let transcriptData: Record<string, unknown> | null = null;

        while (attempts < maxAttempts) {
          await new Promise((r) => setTimeout(r, 1000));
          attempts++;

          // Send progress every 2 seconds
          if (attempts % 2 === 0) {
            sendEvent(controller, "progress", {
              phase: "transcribing",
              seconds: attempts,
              message: `Transcribing... ${attempts}s elapsed`,
            });
          }

          const statusResponse = await fetch(`https://asr.api.speechmatics.com/v2/jobs/${jobId}`, {
            headers: { Authorization: `Bearer ${apiKey}` },
          });

          if (!statusResponse.ok) continue;
          const statusData = await statusResponse.json();
          const jobStatus = statusData.job?.status;

          if (jobStatus === "running") {
            sendEvent(controller, "progress", { phase: "transcribing", seconds: attempts, message: "Processing audio..." });
          } else if (jobStatus === "done") {
            sendEvent(controller, "phase", { phase: "fetching_transcript", message: "Transcription complete! Fetching results..." });

            const transcriptResponse = await fetch(
              `https://asr.api.speechmatics.com/v2/jobs/${jobId}/transcript?format=json-v2`,
              { headers: { Authorization: `Bearer ${apiKey}` } }
            );

            if (!transcriptResponse.ok) {
              sendEvent(controller, "error", { error: "Failed to fetch transcript" });
              controller.close();
              return;
            }

            transcriptData = await transcriptResponse.json();
            break;
          } else if (jobStatus === "rejected" || jobStatus === "deleted") {
            sendEvent(controller, "error", { error: `Job ${jobStatus}: ${statusData.job?.error || "unknown"}` });
            controller.close();
            return;
          }
        }

        if (!transcriptData) {
          sendEvent(controller, "error", { error: "Transcription timed out after 60s" });
          controller.close();
          return;
        }

        // Phase 3: Parse and stream transcript lines
        const { transcript, duration: audioDuration } = parseSpeechmaticsResult(transcriptData);

        if (transcript.length === 0) {
          sendEvent(controller, "error", { error: "No speech detected in audio." });
          controller.close();
          return;
        }

        sendEvent(controller, "phase", { phase: "transcript_ready", message: `Transcribed ${transcript.length} utterances`, duration: audioDuration });

        // Stream transcript lines in batches for smooth UX
        const batchSize = 3;
        for (let i = 0; i < transcript.length; i += batchSize) {
          const batch = transcript.slice(i, i + batchSize);
          sendEvent(controller, "transcript_lines", { lines: batch, progress: Math.min(100, Math.round(((i + batch.length) / transcript.length) * 100)) });
          // Small delay between batches for visual effect
          if (i + batchSize < transcript.length) {
            await new Promise((r) => setTimeout(r, 80));
          }
        }

        // Phase 4: LLM-powered clinical analysis
        sendEvent(controller, "phase", { phase: "analyzing", message: "AI analyzing clinical content..." });

        const fullTranscriptText = transcript.map((l) => `${l.speaker}: ${l.text}`).join("\n");
        const allActions: ActionCard[] = [];
        let actionCounter = 0;

        // Build patient context if needed
        if (!patient) {
          const allPatients = getAllPatients();
          patient = allPatients[0] || {
            id: 0, name: "Unknown Patient", age: 0, gender: "Unknown",
            allergies: [], current_medications: [], conditions: [], history: [],
          };
        }

        // Use LLM for comprehensive clinical extraction
        let detectedInfo: { name?: string; symptoms?: string[]; medications_mentioned?: string[]; allergies_mentioned?: string[] } = {};

        try {
          const clinicalPrompt = `You are an expert clinical AI assistant analyzing a doctor-patient conversation. Extract ALL clinically relevant information.

TRANSCRIPT:
${fullTranscriptText}

PATIENT RECORD (if available):
Name: ${patient.name}
Allergies: ${patient.allergies.join(", ") || "None known"}
Current Medications: ${patient.current_medications.map((m) => m.name).join(", ") || "None known"}
Conditions: ${patient.conditions.join(", ") || "None known"}

Analyze thoroughly and extract:
1. All symptoms/complaints (with severity: mild/moderate/severe)
2. All medications mentioned or discussed (name, dosage if stated, context)
3. Any diagnoses or conditions identified/discussed
4. Any referrals, follow-ups, or specialist mentions
5. Any drug interactions or allergy risks
6. Treatment plans discussed
7. Patient concerns or risk factors
8. Urgency level of the encounter

Respond in this exact JSON format:
{
  "patient_info": {
    "name": "name if mentioned or null",
    "chief_complaint": "main reason for visit in one line"
  },
  "symptoms": [
    { "description": "symptom name", "severity": "mild|moderate|severe", "details": "context from conversation", "timestamp_hint": "quote from transcript where mentioned" }
  ],
  "medications": [
    { "name": "drug name", "dosage": "if mentioned", "context": "why prescribed/discussed", "action": "new|continued|discontinued|adjusted" }
  ],
  "conditions": [
    { "name": "condition/diagnosis", "status": "new|existing|worsening|improving", "details": "relevant context" }
  ],
  "referrals": [
    { "department": "specialty or service", "reason": "why referred", "urgency": "routine|urgent|immediate" }
  ],
  "alerts": [
    { "type": "drug_interaction|allergy_risk|adherence_concern|safety_concern", "severity": "low|medium|high", "description": "what the alert is", "recommendation": "what to do" }
  ],
  "treatment_plan": {
    "discussed": ["list of treatment approaches discussed"],
    "recommendations": ["what was recommended"]
  },
  "encounter_summary": "2-3 sentence clinical summary of the encounter"
}

Be thorough. Extract EVERYTHING clinically relevant. If something is implied but not explicitly stated, still include it with appropriate context. Respond ONLY with valid JSON.`;

          const analysisText = await callLLM(clinicalPrompt);
          const cleaned = analysisText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
          const analysis = JSON.parse(cleaned);

          // Stream actions progressively
          sendEvent(controller, "phase", { phase: "building_actions", message: "Building clinical action cards..." });

          // Patient info
          if (analysis.patient_info) {
            detectedInfo.name = analysis.patient_info.name;
            if (analysis.patient_info.chief_complaint) {
              allActions.push({
                id: `action-${actionCounter++}`,
                type: "summary",
                timestamp: 0,
                content: { description: `Chief Complaint: ${analysis.patient_info.chief_complaint}`, type: "chief_complaint" },
              });
            }
          }

          // Symptoms
          if (analysis.symptoms?.length > 0) {
            for (const symptom of analysis.symptoms) {
              const ts = findTimestamp(transcript, symptom.timestamp_hint || symptom.description);
              allActions.push({
                id: `action-${actionCounter++}`,
                type: "symptom",
                timestamp: ts,
                severity: symptom.severity === "severe" ? "high" : symptom.severity === "moderate" ? "medium" : "low",
                content: {
                  description: symptom.description,
                  severity: symptom.severity,
                  details: symptom.details,
                  reported_by: "patient",
                },
              });
            }
            sendEvent(controller, "actions_partial", { actions: [...allActions] });
            await new Promise((r) => setTimeout(r, 100));
          }

          // Medications
          if (analysis.medications?.length > 0) {
            for (const med of analysis.medications) {
              const ts = findTimestamp(transcript, med.name);
              allActions.push({
                id: `action-${actionCounter++}`,
                type: "medication",
                timestamp: ts,
                content: {
                  name: med.name,
                  dosage: med.dosage || "",
                  context: med.context || "",
                  action: med.action || "mentioned",
                },
              });

              // Run local drug interaction checks
              const currentMedNames = patient.current_medications.map((m) => m.name);
              const interactions = checkDrugInteractions(med.name.toLowerCase(), currentMedNames);
              for (const interaction of interactions) {
                allActions.push({
                  id: `action-${actionCounter++}`,
                  type: "alert",
                  timestamp: ts,
                  severity: interaction.severity,
                  content: {
                    type: "drug_interaction",
                    description: interaction.description,
                    action_taken: interaction.recommendation,
                    drugs: [interaction.drug1, interaction.drug2],
                  },
                });
              }

              const allergyConflict = checkAllergyConflict(med.name.toLowerCase(), patient.allergies);
              if (allergyConflict) {
                allActions.push({
                  id: `action-${actionCounter++}`,
                  type: "alert",
                  timestamp: ts,
                  severity: "high",
                  content: {
                    type: "allergy_conflict",
                    description: allergyConflict.description,
                    action_taken: "ALERT: Do not prescribe. Consider alternative.",
                    allergen: allergyConflict.allergen,
                  },
                });
              }
            }
            sendEvent(controller, "actions_partial", { actions: [...allActions] });
            await new Promise((r) => setTimeout(r, 100));
          }

          // Conditions/Diagnoses
          if (analysis.conditions?.length > 0) {
            for (const condition of analysis.conditions) {
              const ts = findTimestamp(transcript, condition.name);
              allActions.push({
                id: `action-${actionCounter++}`,
                type: "condition",
                timestamp: ts,
                content: {
                  name: condition.name,
                  status: condition.status,
                  details: condition.details,
                },
              });
            }
            sendEvent(controller, "actions_partial", { actions: [...allActions] });
            await new Promise((r) => setTimeout(r, 100));
          }

          // Alerts from LLM
          if (analysis.alerts?.length > 0) {
            for (const alert of analysis.alerts) {
              allActions.push({
                id: `action-${actionCounter++}`,
                type: "alert",
                timestamp: transcript[Math.floor(transcript.length / 2)]?.timestamp || 0,
                severity: alert.severity,
                content: {
                  type: alert.type,
                  description: alert.description,
                  action_taken: alert.recommendation,
                },
              });
            }
            sendEvent(controller, "actions_partial", { actions: [...allActions] });
            await new Promise((r) => setTimeout(r, 100));
          }

          // Referrals
          if (analysis.referrals?.length > 0) {
            for (const ref of analysis.referrals) {
              allActions.push({
                id: `action-${actionCounter++}`,
                type: "referral",
                timestamp: transcript[transcript.length - 1]?.timestamp || 0,
                content: {
                  department: ref.department,
                  reason: ref.reason,
                  urgency: ref.urgency,
                },
              });
            }
          }

          // Treatment plan as a record_update
          if (analysis.treatment_plan?.recommendations?.length > 0) {
            allActions.push({
              id: `action-${actionCounter++}`,
              type: "record_update",
              timestamp: transcript[transcript.length - 1]?.timestamp || 0,
              content: {
                field: "Treatment Plan",
                new_value: analysis.treatment_plan.recommendations.join("; "),
                discussed: (analysis.treatment_plan.discussed || []).join("; "),
              },
            });
          }

          // Update patient info from LLM
          if (analysis.patient_info?.name) {
            const dbMatch = getAllPatients().find((p) => p.name.toLowerCase().includes(analysis.patient_info.name.toLowerCase()));
            if (dbMatch) patient = dbMatch;
          }

          detectedInfo = {
            name: analysis.patient_info?.name,
            symptoms: analysis.symptoms?.map((s: { description: string }) => s.description) || [],
            medications_mentioned: analysis.medications?.map((m: { name: string }) => m.name) || [],
            allergies_mentioned: [],
          };

        } catch (e) {
          console.error("LLM clinical analysis failed:", e);
          // Fallback: at least show basic transcript info
          allActions.push({
            id: `action-${actionCounter++}`,
            type: "summary",
            timestamp: 0,
            content: { description: `Transcribed ${transcript.length} utterances. LLM analysis unavailable.` },
          });
        }

        // Stream final actions
        sendEvent(controller, "actions", { actions: allActions });

        // Phase 5: Generate SOAP note
        sendEvent(controller, "phase", { phase: "generating_soap", message: "Generating SOAP note..." });

        let soapNote = {
          subjective: "Patient encounter transcribed.",
          objective: "See transcript for details.",
          assessment: "Analysis completed.",
          plan: "Review flagged items.",
        };

        try {
          const soapPrompt = `Generate a brief SOAP note for this clinical encounter.

PATIENT: ${patient.name}${patient.age ? `, ${patient.age}yo ${patient.gender}` : ""}
ALLERGIES: ${patient.allergies.join(", ") || "None known"}
MEDICATIONS: ${patient.current_medications.map((m) => m.name).join(", ") || "None known"}

TRANSCRIPT:
${fullTranscriptText}

Respond in this exact JSON format:
{"subjective":"...","objective":"...","assessment":"...","plan":"..."}
Respond ONLY with valid JSON.`;

          const soapText = await callLLM(soapPrompt);
          const cleanedSoap = soapText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
          soapNote = JSON.parse(cleanedSoap);
        } catch (e) {
          console.error("SOAP generation failed:", e);
        }

        // Phase 6: Send complete result
        const medCount = allActions.filter((a) => a.type === "medication").length;
        const alertCount = allActions.filter((a) => a.type === "alert").length;
        const symptomCount = allActions.filter((a) => a.type === "symptom").length;
        const conditionCount = allActions.filter((a) => a.type === "condition").length;

        const parts = [];
        if (medCount > 0) parts.push(`${medCount} medication(s)`);
        if (alertCount > 0) parts.push(`${alertCount} alert(s)`);
        if (symptomCount > 0) parts.push(`${symptomCount} symptom(s)`);
        if (conditionCount > 0) parts.push(`${conditionCount} condition(s)`);

        const summary = parts.length > 0
          ? `Analyzed ${transcript.length} utterances across ${Math.round(audioDuration)}s of audio. Detected ${parts.join(", ")}.`
          : `Transcribed ${transcript.length} utterances. Review transcript for clinical details.`;

        // Realistic time saved: ~2-3 min per minute of audio for manual documentation
        const manualDocMinutes = Math.round(audioDuration / 60 * 2.5);
        const timeSaved = `${Math.max(3, manualDocMinutes)} minutes`;

        sendEvent(controller, "complete", {
          transcript,
          actions: allActions,
          summary,
          soap_note: soapNote,
          total_actions: allActions.length,
          time_saved: timeSaved,
          duration: audioDuration,
          patient: patient.id > 0 ? patient : null,
          detected_info: detectedInfo,
        });

        controller.close();
      } catch (error) {
        console.error("Stream error:", error);
        sendEvent(controller, "error", { error: error instanceof Error ? error.message : "Processing failed" });
        controller.close();
      }
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
