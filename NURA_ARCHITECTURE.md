# Nura — Complete Architecture & Build Plan

## What Is Nura

Nura is an autonomous clinical voice agent that processes doctor-patient conversation audio in real-time and independently extracts medical information, detects drug interactions, flags allergy conflicts, identifies referral needs, and generates structured clinical documentation — all without the doctor giving any commands.

The user presses ONE button. The system does everything else.

## What This App Is NOT

- NOT a landing page with marketing copy
- NOT a login/signup system
- NOT a full SaaS product
- NOT a copilot that waits for instructions

## What This App IS

A single, focused demo page that visually demonstrates an autonomous AI agent processing clinical audio in real-time. The entire value proposition is visible the moment you load the page and press play.

---

## The Problem (For Pitch Deck & Video)

- Physicians spend 49% of their workday on EHR documentation
- 62% of physicians report burnout — documentation is the #1 cause
- Physician burnout costs US healthcare $4.6 billion/year in turnover
- Current AI scribes (Nuance DAX, Abridge, Nabla) only generate notes — they don't detect issues, don't flag conflicts, don't route referrals
- No existing product combines voice understanding + clinical reasoning + autonomous action

## The Gap We Fill

```
EXISTING:  Voice → Notes only              (Scribes: Abridge, DAX, Nabla)
EXISTING:  Manual Input → Alerts only      (CDSS: Epic alerts, Lexicomp)
OURS:      Voice → Notes + Decisions + Actions  (Autonomous Agent)
```

---

## Hackathon Fit

### Challenge: "AI Agent Olympics — Autonomous agents that move beyond copilots into real decision-making systems that create measurable enterprise value"

| Requirement | How Nura Delivers |
|-------------|------------------------|
| Beyond copilots | Doctor doesn't give commands. Agent detects, decides, acts independently. |
| Real decision-making | Decides: Is there a drug conflict? Is this urgent? Where to refer? |
| Measurable enterprise value | Saves 2 hours/day per physician = $150K/year per doctor |
| Autonomous | User presses play. Everything else happens automatically. |

### Tracks Hit
- Intelligent Reasoning (clinical decision-making)
- Agentic Workflows (listen → extract → cross-reference → decide → act)
- Enterprise Utility (hospitals are enterprises, solves real friction)
- Multimodal Intelligence (audio → text → structured data → actions)
- Collaborative Systems (multiple AI sub-tasks working together)

### Prize Categories Targeted
- Speechmatics ($1,000 + $1,000 credits) — core voice technology
- Gemini ($5,000) — reasoning engine
- Vultr ($5,000 + $1,000 credits) — hosting
- Featherless (credits + Claw Pro) — open-source model usage

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Next.js 14.2 (App Router) | Full-stack: frontend + API routes |
| Speech-to-Text | Speechmatics Batch API | Transcription with speaker diarization |
| Primary LLM | Featherless AI (google/gemma-4-31B-it) | Clinical reasoning, entity extraction, SOAP generation |
| Database | SQLite (better-sqlite3) | Patient records, 3 demo patients seeded |
| Streaming | Server-Sent Events (SSE) | Real-time progress & results to frontend |
| Styling | Tailwind CSS 3.4 | Dark theme, responsive UI |

### Environment Variables (.env.local)

```env
# Speechmatics
SPEECHMATICS_API_KEY=your_key_here

# Featherless (Primary LLM — OpenAI-compatible)
FEATHERLESS_API_KEY=your_key_here
FEATHERLESS_MODEL_NAME=google/gemma-4-31B-it
FEATHERLESS_BASE_URL=https://api.featherless.ai/v1

# General
LLM_PROVIDER=Featherless
```

---

## Speechmatics Integration (Technical Details)

### SDK: `@speechmatics/real-time-client`

Install:
```bash
npm install @speechmatics/real-time-client @speechmatics/auth
```

### How Real-Time Transcription Works

1. Audio file is read as a stream on the server (API route)
2. Stream is sent to Speechmatics via WebSocket in chunks
3. Speechmatics returns transcript results (finals + partials) with speaker labels
4. Results are pushed to the frontend via Server-Sent Events (SSE) or WebSocket

### Configuration for Medical + Diarization

```javascript
const config = {
  transcription_config: {
    language: "en",
    diarization: "speaker",
    operating_point: "enhanced",
    max_delay: 1.0,
    speaker_diarization_config: {
      max_speakers: 2,  // doctor + patient
      prefer_current_speaker: true
    },
    additional_vocab: [
      { content: "lisinopril", sounds_like: ["lice in oh pril"] },
      { content: "ibuprofen", sounds_like: ["eye bew pro fen"] },
      { content: "metformin" },
      { content: "amoxicillin" },
      // Add more medical terms
    ]
  }
};
```

### Key Speechmatics Features Used

| Feature | Config | What It Does |
|---------|--------|-------------|
| Real-time transcription | WebSocket streaming | Converts audio to text as it plays |
| Speaker diarization | `diarization: "speaker"` | Labels each word as S1 (doctor) or S2 (patient) |
| Enhanced accuracy | `operating_point: "enhanced"` | Best accuracy model |
| Custom dictionary | `additional_vocab: [...]` | Boosts accuracy for drug names, conditions |
| Medical domain | Use medical-optimized language pack if available | Better clinical term recognition |

### Important Notes from Docs
- Speaker labels are S1, S2, etc. (sequential, S1 = first speaker detected)
- Each word object includes a `speaker` property
- `prefer_current_speaker: true` reduces false speaker switches
- Finals are definitive (never revised), Partials may change
- Max delay of 1.0s means finals arrive within ~1 second

---

## Featherless AI Integration

### How It Works
Featherless is OpenAI-compatible. Use the standard `openai` npm package with a custom base URL.

Install:
```bash
npm install openai
```

### Usage in API Route

```javascript
import OpenAI from 'openai';

const featherless = new OpenAI({
  baseURL: process.env.FEATHERLESS_BASE_URL,
  apiKey: process.env.FEATHERLESS_API_KEY,
});

const response = await featherless.chat.completions.create({
  model: process.env.FEATHERLESS_MODEL_NAME,
  messages: [
    { role: "system", content: "You are a clinical analysis agent..." },
    { role: "user", content: transcriptChunk }
  ],
});
```

### When to Use Featherless vs Gemini
- Use Gemini as primary (faster, better reasoning for clinical decisions)
- Use Featherless as fallback or for a specific sub-task (e.g., entity extraction)
- Both are configured in .env — switch by changing `LLM_PROVIDER`

---

## Vultr Deployment

### Setup Path
1. Create Vultr VM (Ubuntu 22.04, 2 vCPU, 4GB RAM minimum)
2. Install Node.js 20+
3. Clone repo, install dependencies
4. Build Next.js app (`npm run build`)
5. Run with PM2 (`pm2 start npm -- start`)
6. Configure Nginx as reverse proxy (port 80/443 → port 3000)
7. Point domain or use Vultr IP as demo URL

### Vultr Resources
- Docs: https://docs.vultr.com/how-to-deploy-a-nextjs-application-with-vultr-supabase-marketplace-app
- Alternative: Use Coolify on Vultr for one-click deploy
- Credits: $200 per participant (activate via setup guide)

---

## Application Architecture

### Page Structure

```
/ (single page — the entire app)
├── Header: "Nura — Autonomous Clinical Voice Agent"
├── LEFT PANEL (lg:col-span-4)
│   ├── Mode Tabs: Instant | Upload | Live
│   ├── Patient Selection (dropdown + auto-detect)
│   ├── Mode-specific Input (demo selector / file upload / live mic)
│   ├── Live Record Updates (auto-populated during agent execution)
│   │   └── Shows conditions, symptoms, medications being added to chart
│   ├── Agent Decision Log (AgentLog component)
│   │   ├── Updating Patient Record → done
│   │   ├── Sending SOAP Report → sent to primarycare@clinic.org
│   │   ├── Alerting Care Team → sent (if alerts detected)
│   │   ├── Dispatching Referral → sent to [Department]
│   │   └── Scheduling Follow-up → done (2-week reminder)
│   └── "View Complete Report" button
├── RIGHT PANEL (lg:col-span-8, split 5/7)
│   ├── LEFT: Live Transcript (color-coded by speaker)
│   └── RIGHT: Agent Actions Panel
│       ├── Alerts (drug interactions, conflicts) — red cards
│       ├── Conditions — purple cards
│       ├── Referrals — green cards
│       ├── Medications — blue cards
│       ├── Symptoms — amber cards
│       └── Summary — gray card
└── Complete Report Modal
    ├── Full SOAP Note (S/O/A/P sections)
    ├── All actions taken
    ├── Time saved metric
    └── "Manual charting → Nura: Automated in real-time"
```

### Autonomous Agent Pipeline (Post-Analysis)

After the clinical analysis SSE stream completes, the agent **autonomously executes** a sequence of enterprise actions without any user input:

```
Analysis Complete
    │
    ▼ (300ms)
[1] UPDATE PATIENT RECORD
    ├── Add detected conditions to chart
    ├── Add symptoms to active complaints
    └── Add medication changes
    │
    ▼ (1.5s)
[2] EMAIL SOAP REPORT
    └── Send encounter report to primarycare@clinic.org
    │
    ▼ (1.8s, if alerts exist)
[3] ALERT CARE TEAM
    └── Flag clinical alerts for attending physician
    │
    ▼ (3.2s, if referrals exist)
[4] DISPATCH REFERRAL
    └── Send referral request to specialist department
    │
    ▼ (4.8s)
[5] SCHEDULE FOLLOW-UP
    └── Set 2-week follow-up reminder
```

Each step shows in the Agent Decision Log with animated status indicators (spinning → checkmark) and status badges (queued → running → done/sent).

---

## Data Flow (How Everything Connects)

```
┌─────────────────────────────────────────────────────────────┐
│ FRONTEND (Next.js React)                                     │
│                                                              │
│  User selects patient → User selects/uploads audio → Play   │
│                                                              │
│  ┌─────────────┐     ┌──────────────────────────────┐      │
│  │ Audio Player │     │ Real-time Updates (SSE/WS)    │      │
│  │ (visual)    │     │ • Transcript lines             │      │
│  └──────┬──────┘     │ • Agent action cards           │      │
│         │            │ • Summary updates              │      │
│         │            └──────────────────────────────┘      │
└─────────┼──────────────────────────────────────────────────┘
          │ audio file
          ▼
┌─────────────────────────────────────────────────────────────┐
│ API ROUTE: /api/process-audio                                │
│                                                              │
│  1. Receive audio file + patient ID                          │
│  2. Load patient record from SQLite                          │
│  3. Stream audio to Speechmatics WebSocket                   │
│  4. Receive transcript chunks (with speaker labels)          │
│  5. For each meaningful chunk (every ~5-10 seconds):         │
│     → Send to LLM (Gemini/Featherless) with prompt:         │
│       "Given this patient's history: {record}                │
│        And this conversation segment: {transcript}           │
│        Extract: medications, symptoms, conditions,           │
│        Check for: drug interactions, allergy conflicts,      │
│        Decide: urgency level, referral needs"                │
│  6. LLM returns structured JSON                              │
│  7. Push results to frontend via SSE                         │
│  8. Update patient record in SQLite                          │
│  9. After audio ends: generate final SOAP note               │
└─────────────────────────────────────────────────────────────┘
```

### Processing Pipeline (Per Chunk)

```
Audio chunk (5-10 sec)
    │
    ▼
Speechmatics (transcribe + diarize)
    │
    ▼
Transcript: "S1: The lisinopril is causing dizziness. S2: I'm also taking ibuprofen."
    │
    ▼
LLM Analysis (Gemini/Featherless)
    │
    ├── Medications: [lisinopril, ibuprofen]
    ├── Symptoms: [dizziness]
    ├── Drug Interaction: lisinopril + ibuprofen = kidney risk ⚠️
    ├── Referral: None needed yet
    └── Summary update: "Patient reports dizziness from lisinopril..."
    │
    ▼
Push to Frontend (SSE event)
    │
    ├── New transcript line appears
    ├── "Medication Detected: Lisinopril" card appears
    ├── "Medication Detected: Ibuprofen" card appears
    ├── "⚠️ DRUG INTERACTION" alert card appears (red, prominent)
    └── Summary text updates
```

---

## Mock Patient Database (SQLite)

### Schema

```sql
CREATE TABLE patients (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER,
  gender TEXT,
  allergies TEXT,          -- JSON array: ["penicillin", "sulfa"]
  current_medications TEXT, -- JSON array: [{name, dosage, frequency}]
  conditions TEXT,         -- JSON array: ["hypertension", "diabetes"]
  history TEXT             -- JSON array of past encounters
);
```

### Pre-loaded Demo Patients

**Patient 1: Mrs. Sarah Chen (Drug Interaction Demo)**
- Age: 67, Female
- Allergies: Penicillin
- Current Meds: Lisinopril 10mg daily, Metformin 500mg twice daily
- Conditions: Hypertension, Type 2 Diabetes
- *Demo audio: Doctor visit where patient mentions taking ibuprofen → triggers interaction alert*

**Patient 2: Mr. James Wilson (Allergy Conflict Demo)**
- Age: 45, Male
- Allergies: Sulfa drugs, Aspirin
- Current Meds: Omeprazole 20mg daily
- Conditions: GERD, Chronic back pain
- *Demo audio: Doctor discusses prescribing a sulfa-based antibiotic → triggers allergy alert*

**Patient 3: Ms. Maria Rodriguez (Urgent Finding Demo)**
- Age: 52, Female
- Allergies: None known
- Current Meds: Atorvastatin 40mg daily
- Conditions: High cholesterol, Family history of heart disease
- *Demo audio: Patient describes chest tightness and shortness of breath → triggers urgency alert + cardiology referral*

---

## Agent Action Categories (UI Cards)

| Category | Icon | Color | What Triggers It |
|----------|------|-------|-----------------|
| **Alerts** | ⚠️ | Red | Drug interactions, allergy conflicts, critical findings |
| **Medications Detected** | 💊 | Blue | Any drug name mentioned in conversation |
| **Symptoms & Complaints** | 🤒 | Yellow/Amber | Patient-reported symptoms |
| **Diagnoses & Conditions** | 🏥 | Purple | Doctor's assessments, identified conditions |
| **Referrals** | 📨 | Green | When agent decides specialist consultation needed |
| **Patient Record Updates** | 📋 | Teal | New info added to patient's file |
| **Summary** | 📝 | Gray | Running clinical summary (updates continuously) |

### Card Structure
Each card shows:
- Category icon + label
- Timestamp (when in the audio it was detected)
- Content (what was found)
- Action taken (what the agent did about it)
- Confidence indicator (high/medium)

---

## LLM Prompt Strategy

### System Prompt (for clinical analysis)

```
You are an autonomous clinical decision support agent. You analyze doctor-patient conversation transcripts in real-time and extract structured medical information.

Given a patient's existing medical record and a segment of conversation transcript, you must:

1. EXTRACT: Identify any medications, symptoms, conditions, allergies, or vital signs mentioned
2. CROSS-REFERENCE: Check extracted medications against the patient's known allergies and current medications for interactions
3. DECIDE: Determine if any finding requires:
   - An alert (drug interaction, allergy conflict, critical symptom)
   - A referral (which specialty and why)
   - A record update (new information not in patient's file)
4. CLASSIFY urgency: routine / moderate / urgent / critical

You must respond in valid JSON with this structure:
{
  "medications_detected": [{ "name": "", "dosage": "", "context": "" }],
  "symptoms": [{ "description": "", "severity": "", "reported_by": "patient|doctor" }],
  "conditions": [{ "name": "", "status": "new|existing|suspected" }],
  "alerts": [{ "type": "drug_interaction|allergy_conflict|critical_finding", "severity": "high|medium|low", "description": "", "action_taken": "" }],
  "referrals": [{ "department": "", "reason": "", "urgency": "" }],
  "record_updates": [{ "field": "", "value": "", "reason": "" }],
  "summary_addition": ""
}

If nothing clinically significant is found in a segment, return empty arrays.
Do NOT hallucinate findings. Only report what is explicitly mentioned or directly inferable.
```

---

## Pre-Recorded Demo Audio Sources

### Where to Get Demo Audio

1. **Record yourselves (RECOMMENDED for best control)**
   - One person plays doctor, one plays patient
   - Script it to include: drug names, allergy mentions, symptoms
   - 60-90 seconds per scenario
   - Record with any phone/laptop mic (Speechmatics handles noise well)

2. **YouTube OSCE/Standardized Patient Videos**
   - Search: "standardized patient encounter" or "OSCE history taking"
   - Example: https://www.youtube.com/watch?v=wtzIFUZ4TLs (eSOAP Sample Encounter)
   - Download audio track, trim to relevant section

3. **Kaggle Dataset**
   - https://www.kaggle.com/datasets/azmayensabil/doctor-patient-conversation-large
   - Text transcripts (would need to be converted to audio via TTS for demo, or use as reference for scripting your own)

### Recommended: Script Your Own 3 Demos

**Demo 1 Script (Drug Interaction — 60 sec):**
```
Doctor: "Good morning Mrs. Chen. How have you been since we started the lisinopril?"
Patient: "Not great, doctor. I've been getting really dizzy, especially when I stand up. And my ankles are swelling."
Doctor: "I see. Are you taking any other medications? Anything over the counter?"
Patient: "Just ibuprofen for my back pain. I take it most days."
Doctor: "How long have you been taking the ibuprofen?"
Patient: "Oh, about three weeks now. My neighbor recommended it."
Doctor: "And remind me, do you have any allergies to medications?"
Patient: "Yes, penicillin. I had a terrible rash years ago."
```

**Demo 2 Script (Allergy Conflict — 60 sec):**
```
Doctor: "Mr. Wilson, your test results show a urinary tract infection. I'd like to prescribe Bactrim to clear it up."
Patient: "Okay doctor, whatever you think is best."
Doctor: "It's a common antibiotic, very effective for UTIs. You'd take it twice daily for seven days."
Patient: "Wait, is that a sulfa drug? I think I'm allergic to sulfa medications."
Doctor: "Let me check your records... You're right, you have a documented sulfa allergy. Good catch. Let me prescribe something else."
```

**Demo 3 Script (Urgent Finding — 60 sec):**
```
Doctor: "Ms. Rodriguez, what brings you in today?"
Patient: "I've been having this tightness in my chest for the past few days. It gets worse when I climb stairs."
Doctor: "Can you describe the sensation?"
Patient: "It feels like pressure, like someone sitting on my chest. And I get short of breath."
Doctor: "Any pain radiating to your arm or jaw?"
Patient: "Actually yes, my left arm has been tingling."
Doctor: "Given your family history of heart disease and these symptoms, I want to get you seen by cardiology today."
```

---

## Real-Time Processing Strategy

### How "Real-Time" Works with File Upload

Since we're processing uploaded/pre-recorded files (not live mic), we simulate real-time by:

1. Frontend starts playing audio visually (waveform/progress bar)
2. Simultaneously, backend streams the audio file to Speechmatics in chunks
3. Speechmatics returns transcript results as they're processed
4. Each transcript chunk triggers LLM analysis
5. Results are pushed to frontend via Server-Sent Events (SSE)
6. Cards appear on screen as audio plays — synced to the conversation

### Timing Sync
- Audio plays at 1x speed on frontend
- Speechmatics processes at ~1x speed (real-time API)
- LLM analysis adds 1-3 seconds delay per chunk
- Net result: cards appear 2-5 seconds after the relevant audio plays

This is acceptable and actually looks natural — like the agent is "thinking" for a moment before acting.

### SSE (Server-Sent Events) for Real-Time Updates

API route streams events to frontend:
```javascript
// API route sends events like:
event: transcript
data: {"speaker": "S1", "text": "Good morning Mrs. Chen", "timestamp": 1.2}

event: action
data: {"type": "medication_detected", "content": {"name": "lisinopril"}, "timestamp": 5.4}

event: alert
data: {"type": "drug_interaction", "severity": "high", "description": "...", "timestamp": 12.1}

event: summary
data: {"text": "Patient reports dizziness since starting lisinopril..."}

event: complete
data: {"soap_note": "...", "total_actions": 5, "time_saved": "12 minutes"}
```

---

## Complete Report (After Processing)

When audio finishes, a "View Complete Report" button appears. Clicking it shows:

1. **SOAP Note** (structured clinical note)
   - Subjective: What patient reported
   - Objective: Observations (from what was discussed)
   - Assessment: Agent's clinical analysis
   - Plan: Recommended next steps

2. **Actions Summary**
   - List of all autonomous actions taken
   - Each with timestamp, category, and description

3. **Patient Record Changes**
   - What was added/updated in the patient's file
   - Before/after comparison

4. **Impact Metric**
   - "Traditional documentation time: ~12 minutes"
   - "Nura processing time: Real-time (0 additional minutes)"
   - "Time saved: 12 minutes per encounter"

---

## Project Structure

```
nura/
├── app/
│   ├── page.tsx                 # Main (only) page
│   ├── layout.tsx               # Root layout
│   ├── globals.css              # Tailwind + global styles
│   └── api/
│       ├── process-audio/
│       │   └── route.ts         # Main processing endpoint (SSE)
│       ├── patients/
│       │   └── route.ts         # CRUD for mock patients
│       └── analyze-chunk/
│           └── route.ts         # LLM analysis endpoint
├── components/
│   ├── PatientSelector.tsx      # Patient dropdown + auto-detect + live record display
│   ├── AudioInput.tsx           # Demo selector + upload + player
│   ├── AudioPlayer.tsx          # Visual audio playback (waveform)
│   ├── LiveTranscript.tsx       # Real-time transcript display (compact, scrollable)
│   ├── AgentActions.tsx         # Right panel with action cards (priority ordered)
│   ├── ActionCard.tsx           # Individual action card component (color-coded)
│   ├── AgentLog.tsx             # Autonomous agent decision log (post-analysis)
│   ├── CompleteReport.tsx       # Final report view (SOAP + metrics)
│   ├── LiveMic.tsx              # Live microphone recording mode
│   └── Header.tsx               # App header
├── lib/
│   ├── speechmatics.ts         # Speechmatics client wrapper
│   ├── llm.ts                   # LLM client (Gemini + Featherless)
│   ├── prompts.ts               # System prompts for clinical analysis
│   ├── drug-interactions.ts     # Known drug interaction database
│   ├── db.ts                    # SQLite connection + queries
│   └── types.ts                 # TypeScript interfaces
├── data/
│   ├── seed.sql                 # Mock patient data
│   └── demo-audios/             # Pre-recorded demo files
│       ├── demo-1-drug-interaction.wav
│       ├── demo-2-allergy-conflict.wav
│       └── demo-3-urgent-finding.wav
├── public/
│   └── (static assets)
├── .env.local                   # Environment variables
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── next.config.js
└── README.md                    # Setup docs for judges
```

---

## 2-Day Build Plan

### Day 1 (Core Functionality)

**You (Backend — 10-12 hours):**
- Hour 1-2: Set up Next.js project, install dependencies, configure .env
- Hour 2-4: Implement Speechmatics real-time client in API route (stream audio, get transcript with diarization)
- Hour 4-6: Implement LLM analysis (Gemini + Featherless clients, clinical prompt, JSON parsing)
- Hour 6-8: Implement SSE streaming from API route to frontend
- Hour 8-10: Set up SQLite with mock patient data, implement cross-referencing logic
- Hour 10-12: Connect everything end-to-end, test with a sample audio

**Teammate (Frontend — 10-12 hours):**
- Hour 1-2: Set up Tailwind, create page layout (responsive grid)
- Hour 2-4: Build PatientSelector component + AudioInput (demo selector + upload)
- Hour 4-6: Build LiveTranscript component (SSE listener, real-time text appearance)
- Hour 6-8: Build AgentActions panel + ActionCard components (different colors/icons per type)
- Hour 8-10: Build AudioPlayer with visual progress indicator
- Hour 10-12: Wire up SSE events to UI updates, test visual flow

**3rd Person (Content — 6-8 hours):**
- Hour 1-3: Record 3 demo audio scripts (use phone, clear audio, two speakers)
- Hour 3-5: Research drug interactions for demo scenarios (verify medical accuracy)
- Hour 5-7: Start slide deck (problem, solution, demo screenshots, TAM, business model)
- Hour 7-8: Write project description (short + long) for submission

### Day 2 (Polish + Deploy + Submit)

**You (Backend — 8-10 hours):**
- Hour 1-2: Fix bugs from Day 1 testing
- Hour 2-4: Implement Complete Report generation (SOAP note, actions summary)
- Hour 4-5: Add drug interaction reference data (common interactions for demo)
- Hour 5-7: Deploy to Vultr (VM setup, PM2, Nginx, test live URL)
- Hour 7-8: Final end-to-end testing on live deployment

**Teammate (Frontend — 8-10 hours):**
- Hour 1-2: Build CompleteReport modal/section
- Hour 2-4: Polish UI — animations for cards appearing, smooth transitions
- Hour 4-5: Mobile responsiveness pass
- Hour 5-6: Add "time saved" metric display
- Hour 6-8: Final visual polish, test on different screen sizes

**3rd Person (Content — 8-10 hours):**
- Hour 1-3: Record demo video (screen recording + human voiceover)
- Hour 3-4: Edit video (trim, add intro/outro, keep under 5 min)
- Hour 4-5: Finalize slide deck (PDF)
- Hour 5-6: Write GitHub README with setup instructions
- Hour 6-7: Create cover image (16:9, visually appealing)
- Hour 7-8: Submit everything on lablab.ai platform

---

## Submission Checklist

- [ ] Project Title: "Nura — Autonomous Clinical Voice Agent"
- [ ] Short Description (255 chars): "An AI agent that listens to doctor-patient conversations and autonomously detects drug interactions, flags allergy conflicts, routes referrals, and generates clinical notes — in real-time."
- [ ] Long Description (100+ words): Full problem/solution/tech explanation
- [ ] Technology Tags: Speechmatics, Gemini, Vultr, Featherless, Next.js
- [ ] Category Tags: Healthcare, Enterprise, Autonomous Agent, Voice AI
- [ ] Cover Image (16:9, PNG/JPG)
- [ ] Video Presentation (max 5 min, MP4)
- [ ] Slide Presentation (PDF)
- [ ] Public GitHub Repository
- [ ] Live Demo URL (Vultr deployment)

---

## Key Decisions Summary

| Decision | Choice | Reason |
|----------|--------|--------|
| Framework | Next.js (full-stack) | One codebase, fast to build, API routes for backend |
| Python needed? | NO | JS SDK covers all Speechmatics needs |
| Voice SDK needed? | NO | Realtime JS client does transcription + diarization |
| TTS needed? | NO | Adds complexity without visual value for demo |
| Sentiment analysis? | NO | Batch-only, not visually impactful |
| Landing page? | NO | Single demo page, judges click and see value instantly |
| Auth/Login? | NO | Zero friction for judges |
| Real-time approach | Stream audio to Speechmatics, SSE results to frontend | Looks real-time, cards appear as audio plays |
| LLM strategy | Gemini primary, Featherless backup, model names in .env | Easy to switch, qualifies for both prizes |
| Demo audio | Self-recorded scripts (3 scenarios) | Full control over content, guaranteed to trigger agent actions |
