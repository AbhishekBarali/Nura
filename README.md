# WardScribe — Autonomous Clinical Voice Agent

An AI agent that listens to doctor-patient conversations and autonomously detects drug interactions, flags allergy conflicts, routes referrals, and generates clinical notes — in real-time.

## Quick Start

```bash
# Install dependencies
npm install

# Seed the database with demo patients
npm run seed

# Add your API keys to .env.local
# (see .env.local for required keys)

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How It Works

1. **Select a patient** from the dropdown (pre-loaded with 3 demo patients)
2. **Choose a demo scenario** (Drug Interaction, Allergy Conflict, or Urgent Finding)
3. **Press "Start Processing"** — the agent does everything else autonomously

The agent will:
- Transcribe the conversation in real-time (simulated with pre-scripted demos)
- Detect medications, symptoms, and conditions mentioned
- Cross-reference against patient records for drug interactions
- Flag allergy conflicts
- Identify urgent findings requiring referral
- Generate a complete SOAP note

## Demo Scenarios

| # | Scenario | What Happens |
|---|----------|-------------|
| 1 | Drug Interaction | Patient on Lisinopril mentions taking Ibuprofen → kidney risk alert |
| 2 | Allergy Conflict | Doctor prescribes Bactrim (sulfa drug) to sulfa-allergic patient → allergy alert |
| 3 | Urgent Finding | Patient describes chest tightness + arm tingling → cardiology referral |

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **LLM:** Google Gemini (primary) / Featherless AI (backup)
- **Database:** SQLite via better-sqlite3
- **Styling:** Tailwind CSS
- **Real-time:** Server-Sent Events (SSE)

## Environment Variables

```env
GEMINI_API_KEY=your_key_here
GEMINI_MODEL_NAME=gemini-2.0-flash
FEATHERLESS_API_KEY=your_key_here
FEATHERLESS_MODEL_NAME=Qwen/Qwen2.5-7B-Instruct
FEATHERLESS_BASE_URL=https://api.featherless.ai/v1
LLM_PROVIDER=gemini
SPEECHMATICS_API_KEY=your_key_here
```

## Architecture

```
User presses Play
    → Audio streamed to Speechmatics (transcription + diarization)
    → Transcript chunks sent to LLM (Gemini/Featherless)
    → LLM extracts medications, symptoms, conditions
    → Local engine checks drug interactions + allergy conflicts
    → Results pushed to frontend via SSE
    → Cards appear in real-time as audio plays
    → Final SOAP note generated when complete
```

## Project Structure

```
wardscribe/
├── app/
│   ├── page.tsx              # Main page (single-page app)
│   ├── layout.tsx            # Root layout
│   ├── globals.css           # Tailwind + animations
│   └── api/
│       ├── patients/route.ts # Patient CRUD
│       └── process-audio/route.ts # Main SSE processing endpoint
├── components/
│   ├── Header.tsx
│   ├── PatientSelector.tsx
│   ├── AudioInput.tsx
│   ├── AudioPlayer.tsx
│   ├── LiveTranscript.tsx
│   ├── AgentActions.tsx
│   ├── ActionCard.tsx
│   └── CompleteReport.tsx
├── lib/
│   ├── types.ts              # TypeScript interfaces
│   ├── llm.ts                # Gemini + Featherless clients
│   ├── prompts.ts            # Clinical analysis prompts
│   ├── drug-interactions.ts  # Interaction database
│   ├── speechmatics.ts       # Demo transcripts + config
│   └── db.ts                 # SQLite connection
└── data/
    ├── seed.js               # Database seeder
    └── wardscribe.db         # SQLite database (generated)
```

## Deployment (Vultr)

```bash
# On Vultr VM (Ubuntu 22.04)
npm install
npm run seed
npm run build
pm2 start npm -- start
# Configure Nginx reverse proxy (port 80 → 3000)
```

## Built For

AI Agent Olympics Hackathon — "Autonomous agents that move beyond copilots into real decision-making systems that create measurable enterprise value"
