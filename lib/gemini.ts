/**
 * Gemini provider — Google Generative Language REST API over fetch (no SDK dep).
 * Powers all text + audio AI in Echoes (story, dialogue, emotion, Memory DNA,
 * translation, transcription). Murf still does the voices.
 */

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta";

export interface GeminiConfig {
  apiKey: string;
  model: string;
}

export function getGeminiConfig(): GeminiConfig | null {
  const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY;
  if (!apiKey) return null;
  const model = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
  return { apiKey, model };
}

export function hasGemini(): boolean {
  return Boolean(process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY);
}

// Creative, wholesome use-case — relax safety so grief/farewell memories don't
// false-trigger blocks. We still surface genuine blocks as content_filter so the
// existing retry/fallback logic engages.
const SAFETY_SETTINGS = [
  { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
  { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
  { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
  { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" },
];

export type GeminiPart = { text: string } | { inlineData: { mimeType: string; data: string } };

export interface GeminiGenerateOptions {
  parts: GeminiPart[];
  system?: string;
  json?: boolean;
  temperature?: number;
  model?: string;
}

/** Throwable that the content-filter detector recognizes (code: content_filter). */
function contentFilterError(reason: string): Error {
  const err = new Error(`content_filter: Gemini blocked (${reason})`) as Error & {
    code?: string;
  };
  err.code = "content_filter";
  return err;
}

/**
 * Single-turn Gemini generateContent. Returns the text output. Throws a
 * content_filter-coded error on a safety block, or a status-bearing error on
 * an HTTP failure, so callers' existing retry/fallback paths still work.
 */
export async function geminiGenerate(opts: GeminiGenerateOptions): Promise<string> {
  const cfg = getGeminiConfig();
  if (!cfg) throw new Error("GEMINI_API_KEY is not configured");
  const model = opts.model ?? cfg.model;

  const body: Record<string, unknown> = {
    contents: [{ role: "user", parts: opts.parts }],
    safetySettings: SAFETY_SETTINGS,
    generationConfig: {
      temperature: opts.temperature ?? 0.7,
      ...(opts.json ? { responseMimeType: "application/json" } : {}),
    },
  };
  if (opts.system) {
    body.systemInstruction = { parts: [{ text: opts.system }] };
  }

  const res = await fetch(
    `${GEMINI_BASE}/models/${model}:generateContent?key=${cfg.apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    const err = new Error(
      `Gemini API error (${res.status}): ${errText || res.statusText}`
    ) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }

  const data = (await res.json()) as {
    promptFeedback?: { blockReason?: string };
    candidates?: {
      finishReason?: string;
      content?: { parts?: { text?: string }[] };
    }[];
  };

  if (data.promptFeedback?.blockReason) {
    throw contentFilterError(data.promptFeedback.blockReason);
  }
  const candidate = data.candidates?.[0];
  if (candidate?.finishReason === "SAFETY") {
    throw contentFilterError("SAFETY");
  }

  const text =
    candidate?.content?.parts?.map((p) => p.text ?? "").join("").trim() ?? "";
  // responseMimeType keeps JSON clean, but strip stray fences defensively.
  return stripCodeFence(text);
}

function stripCodeFence(text: string): string {
  const fenced = text.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  return fenced ? fenced[1].trim() : text;
}
