import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import { LLMAnalysisResult, Patient, SOAPNote } from "./types";
import { getClinicalAnalysisPrompt, getSOAPNotePrompt } from "./prompts";

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "your_key_here") {
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
}

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

export async function analyzeTranscriptChunk(
  patient: Patient,
  transcript: string
): Promise<LLMAnalysisResult> {
  const provider = process.env.LLM_PROVIDER || "gemini";
  const prompt = getClinicalAnalysisPrompt(patient, transcript);

  try {
    if (provider === "gemini") {
      return await analyzeWithGemini(prompt);
    } else {
      return await analyzeWithFeatherless(prompt);
    }
  } catch (error) {
    console.error(`LLM analysis failed with ${provider}:`, error);
    // Try fallback
    try {
      if (provider === "gemini") {
        return await analyzeWithFeatherless(prompt);
      } else {
        return await analyzeWithGemini(prompt);
      }
    } catch (fallbackError) {
      console.error("Fallback LLM also failed:", fallbackError);
      return getEmptyResult();
    }
  }
}

export async function generateSOAPNote(
  patient: Patient,
  fullTranscript: string,
  actionsDescription: string
): Promise<SOAPNote> {
  const provider = process.env.LLM_PROVIDER || "gemini";
  const prompt = getSOAPNotePrompt(patient, fullTranscript, actionsDescription);

  try {
    let responseText: string;
    if (provider === "gemini") {
      responseText = await callGemini(prompt);
    } else {
      responseText = await callFeatherless(prompt);
    }
    return JSON.parse(cleanJsonResponse(responseText));
  } catch {
    return {
      subjective: "Patient presented with concerns discussed during encounter.",
      objective: "See transcript for clinical details discussed.",
      assessment: "Clinical analysis completed by Nura agent.",
      plan: "Follow up as discussed. Review flagged interactions.",
    };
  }
}

async function analyzeWithGemini(prompt: string): Promise<LLMAnalysisResult> {
  const responseText = await callGemini(prompt);
  return JSON.parse(cleanJsonResponse(responseText));
}

async function analyzeWithFeatherless(prompt: string): Promise<LLMAnalysisResult> {
  const responseText = await callFeatherless(prompt);
  return JSON.parse(cleanJsonResponse(responseText));
}

async function callGemini(prompt: string): Promise<string> {
  const client = getGeminiClient();
  if (!client) {
    throw new Error("Gemini API key not configured");
  }

  const model = client.getGenerativeModel({
    model: process.env.GEMINI_MODEL_NAME || "gemini-2.0-flash",
  });

  const result = await model.generateContent(prompt);
  const response = result.response;
  return response.text();
}

async function callFeatherless(prompt: string): Promise<string> {
  const client = getFeatherlessClient();
  if (!client) {
    throw new Error("Featherless API key not configured");
  }

  const response = await client.chat.completions.create({
    model: process.env.FEATHERLESS_MODEL_NAME || "Qwen/Qwen2.5-7B-Instruct",
    messages: [
      { role: "user", content: prompt },
    ],
    temperature: 0.1,
    max_tokens: 2000,
  });

  return response.choices[0]?.message?.content || "{}";
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
