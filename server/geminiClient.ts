import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn('[Gemini Client] Warning: GEMINI_API_KEY is not defined in process.env. AI Studio automatically injects this at runtime.');
}

export const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export const MODEL_TEXT = 'gemini-3.8-flash';
export const MODEL_EMBEDDING = 'gemini-embedding-2-preview';

/**
 * Robust JSON extraction from Gemini response text
 */
export function extractJsonFromText<T>(text: string, fallback: T): T {
  try {
    const trimmed = text.trim();
    // Check if wrapped in markdown code fence
    const codeFenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    const candidate = codeFenceMatch ? codeFenceMatch[1].trim() : trimmed;
    return JSON.parse(candidate) as T;
  } catch (err) {
    // Try to find the first '{' and last '}'
    try {
      const firstBrace = text.indexOf('{');
      const lastBrace = text.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        const slice = text.substring(firstBrace, lastBrace + 1);
        return JSON.parse(slice) as T;
      }
    } catch (e2) {
      // ignore
    }

    // Try to find first '[' and last ']'
    try {
      const firstBracket = text.indexOf('[');
      const lastBracket = text.lastIndexOf(']');
      if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
        const slice = text.substring(firstBracket, lastBracket + 1);
        return JSON.parse(slice) as T;
      }
    } catch (e3) {
      // ignore
    }

    console.warn('[extractJsonFromText] Failed to parse JSON, returning fallback:', err);
    return fallback;
  }
}
