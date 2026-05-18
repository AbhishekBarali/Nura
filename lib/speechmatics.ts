import { TranscriptLine } from "./types";

// Simulated Speechmatics processing for demo
// In production, this would use @speechmatics/real-time-client
// The demo scripts are pre-transcribed for reliable demonstration

export interface DemoTranscript {
  id: number;
  name: string;
  description: string;
  duration: number; // seconds
  audioFile: string; // path to audio file in public/
  patientId: number; // auto-detected patient
  lines: TranscriptLine[];
}

export const DEMO_TRANSCRIPTS: DemoTranscript[] = [
  {
    id: 1,
    name: "Drug Interaction Scenario",
    description: "Mrs. Chen reports taking ibuprofen alongside lisinopril",
    duration: 134,
    audioFile: "/audio/sample-1.mp3",
    patientId: 1,
    lines: [
      { speaker: "Doctor", text: "Good morning Mrs. Chen. How have you been since we started the lisinopril?", timestamp: 1.0 },
      { speaker: "Patient", text: "Not great, doctor. I've been getting really dizzy, especially when I stand up.", timestamp: 5.0 },
      { speaker: "Doctor", text: "I'm sorry to hear that. Can you tell me more about the dizziness? When did it start?", timestamp: 9.0 },
      { speaker: "Patient", text: "About two weeks ago. Sometimes I feel like the room is spinning, especially in the mornings.", timestamp: 13.0 },
      { speaker: "Patient", text: "And my ankles are swelling. They're quite puffy by the evening.", timestamp: 18.0 },
      { speaker: "Doctor", text: "That's important to note. Have you noticed any changes in your urination or any new symptoms?", timestamp: 22.0 },
      { speaker: "Patient", text: "Now that you mention it, I feel like I'm not going as often as usual.", timestamp: 27.0 },
      { speaker: "Doctor", text: "I see. Are you taking any other medications? Anything over the counter?", timestamp: 32.0 },
      { speaker: "Patient", text: "Just ibuprofen for my back pain. I take it most days, sometimes twice a day.", timestamp: 36.0 },
      { speaker: "Doctor", text: "How long have you been taking the ibuprofen?", timestamp: 41.0 },
      { speaker: "Patient", text: "Oh, about three weeks now. My neighbor recommended it for my lower back pain.", timestamp: 45.0 },
      { speaker: "Doctor", text: "Three weeks of daily ibuprofen. And you're also on metformin for your diabetes, correct?", timestamp: 50.0 },
      { speaker: "Patient", text: "Yes, 500mg twice a day. I've been on that for over a year now.", timestamp: 55.0 },
      { speaker: "Doctor", text: "Mrs. Chen, this is quite important. Ibuprofen can significantly interact with your lisinopril. It reduces the blood pressure lowering effect and can put strain on your kidneys.", timestamp: 60.0 },
      { speaker: "Patient", text: "Oh no, I had no idea. Nobody told me that.", timestamp: 68.0 },
      { speaker: "Doctor", text: "Combined with the metformin, there's an additional risk of kidney problems. The dizziness and swelling you're experiencing could be related to this combination.", timestamp: 72.0 },
      { speaker: "Patient", text: "What should I do? I really need something for the pain.", timestamp: 79.0 },
      { speaker: "Doctor", text: "We need to stop the ibuprofen right away. I'd recommend switching to acetaminophen — paracetamol — for the back pain. It's much safer with your current medications.", timestamp: 83.0 },
      { speaker: "Doctor", text: "And remind me, do you have any allergies to medications?", timestamp: 91.0 },
      { speaker: "Patient", text: "Yes, penicillin. I had a terrible rash and hives years ago.", timestamp: 95.0 },
      { speaker: "Doctor", text: "Good, that's noted. I'll also want to check your kidney function with a blood test today. We should do a basic metabolic panel.", timestamp: 100.0 },
      { speaker: "Patient", text: "Is my kidney going to be okay?", timestamp: 107.0 },
      { speaker: "Doctor", text: "We caught this early, which is good. Most of the time these effects are reversible once we stop the ibuprofen. I'd like to see you back in two weeks to recheck your blood pressure and kidney function.", timestamp: 111.0 },
      { speaker: "Patient", text: "Thank you doctor. I'll stop the ibuprofen today.", timestamp: 120.0 },
      { speaker: "Doctor", text: "Perfect. Let me also print some information for you about which over-the-counter medications are safe with your current prescriptions. And please, always check with us before starting anything new.", timestamp: 124.0 },
    ],
  },
  {
    id: 2,
    name: "Allergy Conflict Scenario",
    description: "Sulfa drug prescribed to allergic patient — near-miss caught",
    duration: 108,
    audioFile: "/audio/sample-2.mp3",
    patientId: 2,
    lines: [
      { speaker: "Doctor", text: "Mr. Wilson, thank you for coming in. I have your test results back.", timestamp: 1.0 },
      { speaker: "Patient", text: "Sure thing, doc. I've been feeling pretty uncomfortable, so I hope it's something treatable.", timestamp: 4.5 },
      { speaker: "Doctor", text: "It is. Your urine culture confirms a urinary tract infection. The good news is we can treat this with antibiotics.", timestamp: 9.0 },
      { speaker: "Patient", text: "Okay, that's a relief. What do you recommend?", timestamp: 14.0 },
      { speaker: "Doctor", text: "I'd like to prescribe Bactrim. It's our first-line treatment for uncomplicated UTIs. Very effective.", timestamp: 17.0 },
      { speaker: "Patient", text: "Okay doctor, whatever you think is best. How long do I take it for?", timestamp: 22.0 },
      { speaker: "Doctor", text: "It's a seven-day course, twice daily. You should start feeling better within 48 hours.", timestamp: 26.0 },
      { speaker: "Patient", text: "Wait — hold on. Is Bactrim a sulfa drug? I think I'm allergic to sulfa medications.", timestamp: 30.0 },
      { speaker: "Doctor", text: "Let me check your records immediately.", timestamp: 35.0 },
      { speaker: "Doctor", text: "You're absolutely right, Mr. Wilson. You have a documented sulfa allergy and also an aspirin sensitivity. I apologize — I should have caught that before suggesting Bactrim.", timestamp: 38.0 },
      { speaker: "Patient", text: "No harm done. I just remembered my last doctor told me to always mention it.", timestamp: 45.0 },
      { speaker: "Doctor", text: "That was very good of you. Bactrim contains sulfamethoxazole, which could have caused a serious allergic reaction in your case.", timestamp: 49.0 },
      { speaker: "Doctor", text: "Let me prescribe nitrofurantoin instead. It's equally effective for UTIs and completely safe for you.", timestamp: 55.0 },
      { speaker: "Patient", text: "Great, I appreciate you being careful. And doctor, while I'm here, my back pain has been getting significantly worse lately.", timestamp: 60.0 },
      { speaker: "Doctor", text: "Tell me more about that. Where exactly is the pain and how would you rate it?", timestamp: 66.0 },
      { speaker: "Patient", text: "It's in my lower back, mostly on the right side. I'd say it's a 7 out of 10 some days. It's affecting my sleep.", timestamp: 70.0 },
      { speaker: "Doctor", text: "Has anything changed recently? New activities, lifting, or any injury?", timestamp: 77.0 },
      { speaker: "Patient", text: "I started a new warehouse job about a month ago. Lots of heavy lifting.", timestamp: 81.0 },
      { speaker: "Doctor", text: "That's likely contributing. Given your aspirin sensitivity, we need to be careful with pain management. I'd recommend acetaminophen and we can discuss physical therapy.", timestamp: 85.0 },
      { speaker: "Patient", text: "Sounds good. I just can't keep going like this.", timestamp: 92.0 },
      { speaker: "Doctor", text: "Absolutely. Let's also check your omeprazole is still working well for your GERD. I'd like to schedule a follow-up in one week for the UTI and two weeks for the back pain.", timestamp: 96.0 },
      { speaker: "Patient", text: "Perfect. Thank you for catching that allergy thing, doc.", timestamp: 104.0 },
    ],
  },
  {
    id: 3,
    name: "Urgent Finding Scenario",
    description: "Cardiac symptoms requiring immediate referral",
    duration: 120,
    audioFile: "/audio/sample-3.mp3",
    patientId: 3,
    lines: [
      { speaker: "Doctor", text: "Ms. Rodriguez, what brings you in today?", timestamp: 1.0 },
      { speaker: "Patient", text: "I've been having this tightness in my chest for the past few days. I wasn't sure if I should come in, but it's been getting worse.", timestamp: 4.0 },
      { speaker: "Doctor", text: "I'm glad you came in. Can you tell me exactly when this started?", timestamp: 10.0 },
      { speaker: "Patient", text: "About four days ago. At first it was just occasional, but now it happens every time I exert myself.", timestamp: 14.0 },
      { speaker: "Patient", text: "It definitely gets worse when I climb stairs or walk uphill.", timestamp: 19.0 },
      { speaker: "Doctor", text: "Can you describe the sensation more specifically? Is it sharp, dull, or pressure-like?", timestamp: 23.0 },
      { speaker: "Patient", text: "It feels like pressure, like someone is sitting on my chest. And I get really short of breath with it.", timestamp: 27.0 },
      { speaker: "Doctor", text: "On a scale of 1 to 10, how would you rate the discomfort at its worst?", timestamp: 33.0 },
      { speaker: "Patient", text: "Maybe a 6 or 7. Yesterday going up the stairs at home it was really bad.", timestamp: 37.0 },
      { speaker: "Doctor", text: "Any pain radiating to your arm, neck, or jaw?", timestamp: 42.0 },
      { speaker: "Patient", text: "Actually yes, my left arm has been tingling. I thought it was just from sleeping on it wrong, but it keeps coming back.", timestamp: 45.0 },
      { speaker: "Doctor", text: "How about nausea, sweating, or feeling lightheaded?", timestamp: 52.0 },
      { speaker: "Patient", text: "Some nausea in the mornings, yes. And I wake up with cold sweats sometimes. I thought it might be menopause.", timestamp: 56.0 },
      { speaker: "Doctor", text: "I want to review your history. You're currently on atorvastatin for high cholesterol, and you have a family history of heart disease — your father had a heart attack at 58, correct?", timestamp: 62.0 },
      { speaker: "Patient", text: "Yes, and my brother had a stent put in last year. He's only 55.", timestamp: 70.0 },
      { speaker: "Doctor", text: "Ms. Rodriguez, I want to be straightforward with you. The combination of chest pressure, left arm tingling, shortness of breath, nausea, and your family history — these are symptoms we take very seriously.", timestamp: 75.0 },
      { speaker: "Patient", text: "Are you saying it could be my heart? I'm only 52.", timestamp: 84.0 },
      { speaker: "Doctor", text: "Heart disease can present at any age, especially with your family history and cholesterol levels. I want to get you seen by cardiology today. This needs urgent evaluation.", timestamp: 88.0 },
      { speaker: "Doctor", text: "I'm going to order a stat ECG right now, and troponin blood levels. We're also going to give you an aspirin as a precaution.", timestamp: 96.0 },
      { speaker: "Patient", text: "Today? You mean right now?", timestamp: 103.0 },
      { speaker: "Doctor", text: "Yes. I don't want to alarm you, but with these symptoms we don't wait. If your symptoms get worse — heavier chest pain, difficulty breathing, or feeling faint — I need you to call 999 immediately. Do not drive yourself.", timestamp: 106.0 },
      { speaker: "Patient", text: "Okay, I understand. Thank you for taking this seriously, doctor.", timestamp: 114.0 },
      { speaker: "Doctor", text: "Absolutely. My team is calling cardiology right now. We'll get you the ECG within the next few minutes. You're in good hands.", timestamp: 117.0 },
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
