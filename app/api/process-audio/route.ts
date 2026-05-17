import { NextRequest, NextResponse } from "next/server";
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

// Transcribe audio using Speechmatics Batch API
async function transcribeWithSpeechmatics(audioBuffer: ArrayBuffer, mimeType: string): Promise<{
  transcript: TranscriptLine[];
  duration: number;
}> {
  const apiKey = process.env.SPEECHMATICS_API_KEY;
  if (!apiKey || apiKey === "your_key_here") {
    throw new Error("SPEECHMATICS_API_KEY not configured");
  }

  const config = JSON.stringify({
    type: "transcription",
    transcription_config: {
      language: "en",
      diarization: "speaker",
      operating_point: "enhanced",
      speaker_diarization_config: {
        max_speakers: 2,
      },
    },
  });

  // Submit batch job
  const formData = new FormData();
  const audioBlob = new Blob([audioBuffer], { type: mimeType });
  formData.append("data_file", audioBlob, "audio.wav");
  formData.append("config", config);

  const submitResponse = await fetch("https://asr.api.speechmatics.com/v2/jobs", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!submitResponse.ok) {
    const errText = await submitResponse.text();
    throw new Error(`Speechmatics submit failed: ${submitResponse.status} ${errText}`);
  }

  const { id: jobId } = await submitResponse.json();

  // Poll for completion (max 60 seconds)
  let attempts = 0;
  const maxAttempts = 30;
  while (attempts < maxAttempts) {
    await new Promise((r) => setTimeout(r, 2000));
    attempts++;

    const statusResponse = await fetch(`https://asr.api.speechmatics.com/v2/jobs/${jobId}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!statusResponse.ok) continue;
    const statusData = await statusResponse.json();

    if (statusData.job?.status === "done") {
      // Get transcript
      const transcriptResponse = await fetch(
        `https://asr.api.speechmatics.com/v2/jobs/${jobId}/transcript?format=json-v2`,
        { headers: { Authorization: `Bearer ${apiKey}` } }
      );

      if (!transcriptResponse.ok) {
        throw new Error("Failed to fetch transcript from Speechmatics");
      }

      const transcriptData = await transcriptResponse.json();
      return parseSpeechmaticsResult(transcriptData);
    } else if (statusData.job?.status === "rejected" || statusData.job?.status === "deleted") {
      throw new Error(`Speechmatics job ${statusData.job.status}: ${statusData.job.error || "unknown error"}`);
    }
  }

  throw new Error("Speechmatics transcription timed out");
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
    channel?: string;
  }>;

  // Group words into utterances by speaker changes and pauses
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

    // New utterance if speaker changes or pause > 1.5s
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

  // Push last utterance
  if (currentText.trim()) {
    lines.push({
      speaker: mapSpeaker(currentSpeaker),
      text: currentText.trim(),
      timestamp: currentTimestamp,
    });
  }

  const duration = lastEndTime || 60;
  return { transcript: lines, duration };
}

function mapSpeaker(speaker: string): string {
  // Map speaker labels to Doctor/Patient
  // Heuristic: first speaker is usually the Doctor
  if (speaker === "S1" || speaker === "speaker_0") return "Doctor";
  return "Patient";
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File | null;
    const patientIdStr = formData.get("patientId") as string | null;

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    // Get patient context if provided
    let patient: Patient | null = null;
    if (patientIdStr && parseInt(patientIdStr) > 0) {
      patient = getPatientById(parseInt(patientIdStr));
    }

    const arrayBuffer = await audioFile.arrayBuffer();
    const mimeType = audioFile.type || "audio/wav";

    // Step 1: Transcribe with Speechmatics (speaker diarization)
    let transcript: TranscriptLine[];
    let audioDuration: number;

    try {
      const result = await transcribeWithSpeechmatics(arrayBuffer, mimeType);
      transcript = result.transcript;
      audioDuration = result.duration;
    } catch (speechError) {
      console.error("Speechmatics transcription failed:", speechError);
      return NextResponse.json(
        { error: `Transcription failed: ${speechError instanceof Error ? speechError.message : "Unknown error"}` },
        { status: 500 }
      );
    }

    if (transcript.length === 0) {
      return NextResponse.json(
        { error: "No speech detected in audio. Please upload a clearer recording." },
        { status: 422 }
      );
    }

    // Step 2: Use LLM to identify speakers and extract clinical info
    const fullTranscriptText = transcript.map((l) => `${l.speaker}: ${l.text}`).join("\n");
    let detectedInfo: { name?: string; symptoms?: string[]; medications_mentioned?: string[]; allergies_mentioned?: string[] } = {};

    try {
      const analysisPrompt = `You are a clinical NLP system. Analyze this doctor-patient conversation transcript.

TRANSCRIPT:
${fullTranscriptText}

Tasks:
1. Determine which speaker is the Doctor and which is the Patient based on context (who asks questions vs who reports symptoms)
2. Extract clinical information

Respond in this exact JSON format:
{
  "speaker_mapping": { "Doctor": "Doctor", "Patient": "Patient" },
  "detected_patient_info": {
    "name": "patient name if mentioned or null",
    "symptoms": ["list of symptoms mentioned"],
    "medications_mentioned": ["any drugs/medications mentioned"],
    "allergies_mentioned": ["any allergies mentioned"]
  },
  "corrected_transcript": [
    { "speaker": "Doctor", "text": "first utterance", "timestamp": 0.0 }
  ]
}

If speakers are already correctly labeled, return the transcript as-is in corrected_transcript.
Respond ONLY with valid JSON.`;

      const analysisText = await callLLM(analysisPrompt);
      const cleaned = analysisText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const analysisResult = JSON.parse(cleaned);

      if (analysisResult.corrected_transcript?.length > 0) {
        transcript = analysisResult.corrected_transcript;
      }
      detectedInfo = analysisResult.detected_patient_info || {};
    } catch (e) {
      console.error("LLM speaker analysis failed (continuing with raw transcript):", e);
    }

    // Step 3: Match or create patient context
    if (!patient) {
      const allPatients = getAllPatients();
      if (detectedInfo.name) {
        patient = allPatients.find(
          (p) => p.name.toLowerCase().includes(detectedInfo.name!.toLowerCase())
        ) || null;
      }
      if (!patient && detectedInfo.medications_mentioned?.length) {
        patient = allPatients.find((p) =>
          p.current_medications.some((m) =>
            (detectedInfo.medications_mentioned || []).some(
              (dm: string) => dm.toLowerCase().includes(m.name.toLowerCase())
            )
          )
        ) || null;
      }
      if (!patient) {
        patient = {
          id: 0,
          name: detectedInfo.name || "Unknown Patient",
          age: 0,
          gender: "Unknown",
          allergies: detectedInfo.allergies_mentioned || [],
          current_medications: (detectedInfo.medications_mentioned || []).map((m: string) => ({
            name: m, dosage: "", frequency: "",
          })),
          conditions: [],
          history: [],
        };
      }
    }

    // Step 4: Run clinical analysis
    const allActions: ActionCard[] = [];
    let actionCounter = 0;
    const textLower = fullTranscriptText.toLowerCase();
    const detectedDrugs: string[] = [];

    const commonDrugs = [
      "ibuprofen", "lisinopril", "metformin", "omeprazole", "atorvastatin",
      "bactrim", "amoxicillin", "aspirin", "warfarin", "acetaminophen",
      "nitrofurantoin", "sulfamethoxazole", "penicillin",
    ];

    for (const drug of commonDrugs) {
      if (textLower.includes(drug)) {
        detectedDrugs.push(drug);
        const timestamp = transcript.find(
          (l) => l.text.toLowerCase().includes(drug)
        )?.timestamp || 0;

        allActions.push({
          id: `action-${actionCounter++}`,
          type: "medication",
          timestamp,
          content: { name: drug.charAt(0).toUpperCase() + drug.slice(1), dosage: "", context: "Mentioned in conversation" },
        });

        const currentMedNames = patient.current_medications.map((m) => m.name);
        const interactions = checkDrugInteractions(drug, currentMedNames);
        for (const interaction of interactions) {
          allActions.push({
            id: `action-${actionCounter++}`,
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
          allActions.push({
            id: `action-${actionCounter++}`,
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

    // Detect symptoms
    const symptomMap: Record<string, string> = {
      "dizzy": "Dizziness", "dizziness": "Dizziness", "swelling": "Swelling",
      "tightness": "Chest tightness", "pressure": "Chest pressure",
      "short of breath": "Shortness of breath", "nausea": "Nausea",
      "tingling": "Tingling", "pain": "Pain", "headache": "Headache",
      "fever": "Fever", "cough": "Cough",
    };

    for (const [keyword, label] of Object.entries(symptomMap)) {
      if (textLower.includes(keyword)) {
        const timestamp = transcript.find(
          (l) => l.text.toLowerCase().includes(keyword)
        )?.timestamp || 0;
        allActions.push({
          id: `action-${actionCounter++}`,
          type: "symptom",
          timestamp,
          content: { description: label, severity: "moderate", reported_by: "patient" },
        });
      }
    }

    // Detect urgency
    const urgentKeywords = ["chest pain", "chest tightness", "can't breathe", "cardiac", "heart attack", "stroke", "emergency"];
    const isUrgent = urgentKeywords.some((k) => textLower.includes(k));
    if (isUrgent) {
      allActions.push({
        id: `action-${actionCounter++}`,
        type: "referral",
        timestamp: transcript[transcript.length - 1]?.timestamp || 0,
        content: { department: "Cardiology/Emergency", reason: "Urgent symptoms detected", urgency: "immediate" },
      });
    }

    // Step 5: Generate SOAP note with LLM
    let soapNote = {
      subjective: "Patient encounter transcribed from audio.",
      objective: "See transcript for clinical details.",
      assessment: "Clinical analysis completed.",
      plan: "Review flagged items and follow up.",
    };

    try {
      const soapPrompt = `Generate a SOAP note for this clinical encounter. Be concise and clinical.

PATIENT: ${patient.name}${patient.age ? `, ${patient.age}yo ${patient.gender}` : ""}
ALLERGIES: ${patient.allergies.join(", ") || "None known"}
MEDICATIONS: ${patient.current_medications.map(m => m.name).join(", ") || "None known"}

TRANSCRIPT:
${fullTranscriptText}

DETECTED ACTIONS: ${allActions.map(a => `[${a.type}] ${JSON.stringify(a.content)}`).join("; ")}

Respond in this exact JSON format:
{
  "subjective": "What the patient reported",
  "objective": "Clinical observations",
  "assessment": "Clinical analysis",
  "plan": "Recommended next steps"
}

Respond ONLY with valid JSON. No markdown.`;

      const soapText = await callLLM(soapPrompt);
      const cleanedSoap = soapText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      soapNote = JSON.parse(cleanedSoap);
    } catch (e) {
      console.error("SOAP generation failed:", e);
    }

    const summary = allActions.length > 0
      ? `Analyzed ${transcript.length} utterances. Found ${detectedDrugs.length} medication(s), ${allActions.filter(a => a.type === "alert").length} alert(s).${isUrgent ? " URGENT findings." : ""}`
      : `Transcribed ${transcript.length} utterances. No significant clinical findings detected.`;

    return NextResponse.json({
      transcript,
      actions: allActions,
      summary,
      soap_note: soapNote,
      total_actions: allActions.length,
      time_saved: `${Math.max(5, Math.round(audioDuration / 4))} minutes`,
      duration: audioDuration,
      patient: patient.id > 0 ? patient : null,
      detected_info: detectedInfo,
    });
  } catch (error) {
    console.error("Process audio error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Audio processing failed" },
      { status: 500 }
    );
  }
}
