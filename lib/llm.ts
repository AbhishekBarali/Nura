import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import { LLMAnalysisResult, Patient, SOAPNote } from "./types";
import { getClinicalAnalysisPrompt, getSOAPNotePrompt } from "./prompts";

function getFeatherlessClient() {
  const apiKey = process.env.FEATHERLESS_API_KEY;
  if (!apiKey || apiKey === "your_key_here") {
    return null;
  }
  return new OpenAI({
    baseURL: process.env.FEATHERLESS_BASE_URL || "https://api.featherless.ai/v1",
    apiKey,
  });
}

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "your_key_here") {
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
}

export async function analyzeTranscriptChunk(
  patient: Patient,
  transcript: string
): Promise<LLMAnalysisResult> {
  const prompt = getClinicalAnalysisPrompt(patient, transcript);

  // Primary: Featherless (google/gemma-4-31B-it)
  try {
    return await analyzeWithFeatherless(prompt);
  } catch (error) {
    console.error("Featherless failed:", error);
  }

  // Fallback: Gemini 3.1 Flash Lite via Google AI Studio
  try {
    return await analyzeWithGeminiFlashLite(prompt);
  } catch (fallbackError) {
    console.error("Gemini 3.1 Flash Lite fallback failed:", fallbackError);
  }

  return getEmptyResult();
}

export async function generateSOAPNote(
  patient: Patient,
  fullTranscript: string,
  actionsDescription: string
): Promise<SOAPNote> {
  const prompt = getSOAPNotePrompt(patient, fullTranscript, actionsDescription);

  // Primary: Featherless
  try {
    const responseText = await callFeatherless(prompt);
    return JSON.parse(cleanJsonResponse(responseText));
  } catch (error) {
    console.error("SOAP generation failed with Featherless:", error);
  }

  // Fallback: Gemini 3.1 Flash Lite
  try {
    const responseText = await callGeminiFlashLite(prompt);
    return JSON.parse(cleanJsonResponse(responseText));
  } catch (fallbackError) {
    console.error("SOAP fallback (Gemini Flash Lite) failed:", fallbackError);
  }

  return {
    subjective: "Patient presented with concerns discussed during encounter.",
    objective: "See transcript for clinical details discussed.",
    assessment: "Clinical analysis completed by Nura agent.",
    plan: "Follow up as discussed. Review flagged interactions.",
  };
}

async function analyzeWithFeatherless(prompt: string): Promise<LLMAnalysisResult> {
  const responseText = await callFeatherless(prompt);
  return JSON.parse(cleanJsonResponse(responseText));
}

async function analyzeWithGeminiFlashLite(prompt: string): Promise<LLMAnalysisResult> {
  const responseText = await callGeminiFlashLite(prompt);
  return JSON.parse(cleanJsonResponse(responseText));
}

async function callFeatherless(prompt: string): Promise<string> {
  const client = getFeatherlessClient();
  if (!client) {
    throw new Error("Featherless API key not configured");
  }

  const response = await client.chat.completions.create({
    model: process.env.FEATHERLESS_MODEL_NAME || "google/gemma-4-31B-it",
    messages: [
      { role: "user", content: prompt },
    ],
    temperature: 0.1,
    max_tokens: 2000,
  });

  return response.choices[0]?.message?.content || "{}";
}

async function callGeminiFlashLite(prompt: string): Promise<string> {
  const client = getGeminiClient();
  if (!client) {
    throw new Error("Gemini API key not configured for Flash Lite fallback");
  }

  const model = client.getGenerativeModel({
    model: "gemini-3.1-flash-lite",
  });

  const result = await model.generateContent(prompt);
  const response = result.response;
  return response.text();
}

function cleanJsonResponse(text: string): string {
  // Remove markdown code blocks if present
  let cleaned = text.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.slice(0, -3);
  }
  return cleaned.trim();
}

function getEmptyResult(): LLMAnalysisResult {
  return {
    medications_detected: [],
    symptoms: [],
    conditions: [],
    alerts: [],
    referrals: [],
    record_updates: [],
    summary_addition: "",
  };
}
