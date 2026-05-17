# Nura — Autonomous Clinical Voice Agent

An AI agent that listens to doctor-patient conversations and autonomously detects drug interactions, flags allergy conflicts, routes referrals, and generates clinical notes — in real-time.

## Quick Start

```bash
# Install dependencies
npm install

# Seed the database with demo patients
npm run seed

# Add your API keys to .env.local
# (see .env.example for required keys)

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Two Demo Modes

**⚡ Instant Demo** — Pre-recorded scenarios that show the full agent pipeline in 3-4 seconds. Cards cascade in with staggered animations. Perfect for the website demo where judges expect immediate results.

**🎙️ Live Mic** — Speak into your microphone and the agent analyzes your speech in real-time. Use this in the demo video to prove it actually works live, not pre-baked.

## How It Works

1. **Select a patient** from the dropdown (pre-loaded with 3 demo patients)
2. **Choose a demo scenario** (Drug Interaction, Allergy Conflict, or Urgent Finding)
3. **Press "Analyze Instantly"** — the agent does everything else autonomously

The agent will:
- Transcribe the conversation (simulated for instant mode, real-time via Web Speech API for live mode)
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
- **Real-time:** Server-Sent Events (SSE) + Web Speech API

## Environment Variables

Copy `.env.example` to `.env.local` and add your keys:

```env
GEMINI_API_KEY=your_key_here
GEMINI_MODEL_NAME=gemini-2.0-flash
FEATHERLESS_API_KEY=your_key_here
FEATHERLESS_MODEL_NAME=Qwen/Qwen2.5-7B-Instruct
FEATHERLESS_BASE_URL=https://api.featherless.ai/v1
LLM_PROVIDER=gemini
SPEECHMATICS_API_KEY=your_key_here
```

The app works without API keys — it falls back to local drug interaction and allergy checking. With LLM keys, you get full clinical reasoning.

## Architecture

```
User picks scenario / speaks into mic
    → Transcript captured (instant mode: pre-scripted; live mode: Web Speech API)
    → Transcript chunks sent to LLM (Gemini/Featherless)
    → LLM extracts medications, symptoms, conditions
    → Local engine cross-references drug interactions + allergy conflicts
    → Cards animate into UI in real-time
    → Final SOAP note generated when complete
```

## Project Structure

```
nura/
├── app/
│   ├── page.tsx                    # Main page (dual-mode app)
│   ├── layout.tsx
│   ├── globals.css
│   └── api/
│       ├── patients/route.ts        # Patient CRUD
│       ├── instant-analysis/route.ts # Instant mode (returns full result)
│       ├── analyze-chunk/route.ts    # Live mode chunk analysis
│       └── process-audio/route.ts    # SSE streaming endpoint
├── components/
│   ├── Header.tsx
│   ├── PatientSelector.tsx
│   ├── AudioInput.tsx               # Demo scenario picker
│   ├── LiveMic.tsx                  # Microphone capture + analysis
│   ├── AudioPlayer.tsx              # Visual playback (waveform + TTS)
│   ├── LiveTranscript.tsx
│   ├── AgentActions.tsx
│   ├── ActionCard.tsx
│   └── CompleteReport.tsx
├── lib/
│   ├── types.ts
│   ├── llm.ts                       # Gemini + Featherless clients
│   ├── prompts.ts                   # Clinical analysis prompts
│   ├── drug-interactions.ts         # Local interaction database
│   ├── speechmatics.ts              # Demo transcripts + config
│   └── db.ts                        # SQLite connection
└── data/
    ├── seed.js                      # Database seeder
    └── nura.db                      # SQLite database (generated, gitignored)
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
