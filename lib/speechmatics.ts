import { TranscriptLine } from "./types";

// Simulated Speechmatics processing for demo
// In production, this would use @speechmatics/real-time-client
// The demo scripts are pre-transcribed for reliable demonstration

export interface DemoTranscript {
  id: number;
  name: string;
  description: string;
  duration: number; // seconds
  lines: TranscriptLine[];
}

export const DEMO_TRANSCRIPTS: DemoTranscript[] = [
  {
    id: 1,
    name: "Drug Interaction Scenario",
    description: "Mrs. Chen reports taking ibuprofen alongside lisinopril",
    duration: 45,
    lines: [
      { speaker: "Doctor", text: "Good morning Mrs. Chen. How have you been since we started the lisinopril?", timestamp: 1.0 },
      { speaker: "Patient", text: "Not great, doctor. I've been getting really dizzy, especially when I stand up.", timestamp: 5.0 },
      { speaker: "Patient", text: "And my ankles are swelling.", timestamp: 9.0 },
      { speaker: "Doctor", text: "I see. Are you taking any other medications? Anything over the counter?", timestamp: 12.0 },
      { speaker: "Patient", text: "Just ibuprofen for my back pain. I take it most days.", timestamp: 16.0 },
      { speaker: "Doctor", text: "How long have you been taking the ibuprofen?", timestamp: 21.0 },
      { speaker: "Patient", text: "Oh, about three weeks now. My neighbor recommended it.", timestamp: 24.0 },
      { speaker: "Doctor", text: "And remind me, do you have any allergies to medications?", timestamp: 29.0 },
      { speaker: "Patient", text: "Yes, penicillin. I had a terrible rash years ago.", timestamp: 33.0 },
      { speaker: "Doctor", text: "Thank you for reminding me. I want to discuss the ibuprofen with you because it can interact with your lisinopril.", timestamp: 37.0 },
    ],
  },
  {
    id: 2,
    name: "Allergy Conflict Scenario",
    description: "Doctor nearly prescribes sulfa drug to allergic patient",
    duration: 40,
    lines: [
      { speaker: "Doctor", text: "Mr. Wilson, your test results show a urinary tract infection.", timestamp: 1.0 },
      { speaker: "Doctor", text: "I'd like to prescribe Bactrim to clear it up.", timestamp: 4.5 },
      { speaker: "Patient", text: "Okay doctor, whatever you think is best.", timestamp: 8.0 },
      { speaker: "Doctor", text: "It's a common antibiotic, very effective for UTIs. You'd take it twice daily for seven days.", timestamp: 11.0 },
      { speaker: "Patient", text: "Wait, is that a sulfa drug? I think I'm allergic to sulfa medications.", timestamp: 16.0 },
      { speaker: "Doctor", text: "Let me check your records.", timestamp: 21.0 },
      { speaker: "Doctor", text: "You're right, you have a documented sulfa allergy. Good catch.", timestamp: 24.0 },
      { speaker: "Doctor", text: "Let me prescribe something else. We'll use nitrofurantoin instead.", timestamp: 28.0 },
      { speaker: "Patient", text: "Thank you doctor. I also wanted to mention my back pain has been getting worse.", timestamp: 32.0 },
      { speaker: "Doctor", text: "We can discuss that as well. Tell me more about the pain.", timestamp: 37.0 },
    ],
  },
  {
    id: 3,
    name: "Urgent Finding Scenario",
    description: "Patient describes cardiac symptoms requiring immediate referral",
    duration: 42,
    lines: [
      { speaker: "Doctor", text: "Ms. Rodriguez, what brings you in today?", timestamp: 1.0 },
      { speaker: "Patient", text: "I've been having this tightness in my chest for the past few days.", timestamp: 4.0 },
      { speaker: "Patient", text: "It gets worse when I climb stairs.", timestamp: 8.0 },
      { speaker: "Doctor", text: "Can you describe the sensation?", timestamp: 11.0 },
      { speaker: "Patient", text: "It feels like pressure, like someone sitting on my chest. And I get short of breath.", timestamp: 14.0 },
      { speaker: "Doctor", text: "Any pain radiating to your arm or jaw?", timestamp: 19.0 },
      { speaker: "Patient", text: "Actually yes, my left arm has been tingling.", timestamp: 22.0 },
      { speaker: "Doctor", text: "How about nausea or sweating?", timestamp: 26.0 },
      { speaker: "Patient", text: "Some nausea in the mornings, yes.", timestamp: 29.0 },
      { speaker: "Doctor", text: "Given your family history of heart disease and these symptoms, I want to get you seen by cardiology today. This needs urgent evaluation.", timestamp: 33.0 },
    ],
  },
];

export function getDemoTranscript(demoId: number): DemoTranscript | undefined {
  return DEMO_TRANSCRIPTS.find((d) => d.id === demoId);
}

// Speechmatics configuration (for when real API keys are available)
export function getSpeechmaticsConfig() {
  return {
    transcription_config: {
      language: "en",
      diarization: "speaker",
      operating_point: "enhanced",
      max_delay: 1.0,
      speaker_diarization_config: {
        max_speakers: 2,
        prefer_current_speaker: true,
      },
      additional_vocab: [
        { content: "lisinopril", sounds_like: ["lice in oh pril"] },
        { content: "ibuprofen", sounds_like: ["eye bew pro fen"] },
        { content: "metformin" },
        { content: "amoxicillin" },
        { content: "omeprazole" },
        { content: "atorvastatin" },
        { content: "bactrim" },
        { content: "sulfamethoxazole" },
        { content: "nitrofurantoin" },
      ],
    },
  };
}
