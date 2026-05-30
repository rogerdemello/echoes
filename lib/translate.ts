import type { AzureOpenAI } from "openai";
import { getChatClient } from "./chat-client";
import { LANGUAGES } from "./constants";
import {
  ECHOES_SAFETY_SYSTEM,
  isAzureContentFilterError,
  wrapUserMemory,
} from "./azure-safety";
import type { LanguageCode } from "./types";

export const LANGUAGE_INSTRUCTIONS: Record<LanguageCode, string> = {
  en: "English",
  hi: `Hindi written entirely in Devanagari script (हिंदी).
Use natural, emotional Hindi as spoken in India — not English words unless unavoidable.
Do NOT output English or Romanized Hindi (Hinglish).`,
  es: `Spanish (español) as spoken in Spain or neutral Latin American Spanish.
Write only in Spanish — no English.`,
  fr: `French (français) — elegant, emotional, natural.
Write only in French — no English.`,
  de: `German (Deutsch) — clear, warm, literary.
Write only in German — no English.`,
};

type ChatBundle = { client: AzureOpenAI; model: string };

async function runTranslation(
  text: string,
  client: ChatBundle,
  systemContent: string,
  userContent: string
): Promise<string | null> {
  const completion = await client.client.chat.completions.create({
    model: client.model,
    messages: [
      { role: "system", content: systemContent },
      { role: "user", content: userContent },
    ],
    temperature: 0.4,
  });
  return completion.choices[0]?.message?.content?.trim() ?? null;
}

export async function translateStory(
  text: string,
  targetLanguage: LanguageCode
): Promise<string> {
  if (targetLanguage === "en") return text;

  const lang = LANGUAGES.find((l) => l.id === targetLanguage);
  const chat = getChatClient();

  if (!chat) {
    throw new Error(
      `${lang?.label ?? targetLanguage} requires Azure OpenAI (AZURE_OPENAI_* in .env)`
    );
  }

  const attempts: { system: string; user: string }[] = [
    {
      system: `${ECHOES_SAFETY_SYSTEM}

Translate the memory narration into ${LANGUAGE_INSTRUCTIONS[targetLanguage]}
Preserve warm, family-friendly tone. Output ONLY the translated narration.`,
      user: wrapUserMemory(text),
    },
    {
      system: `${ECHOES_SAFETY_SYSTEM}

Translate into ${LANGUAGE_INSTRUCTIONS[targetLanguage]}. Output only the translation.`,
      user: wrapUserMemory(text.slice(0, 1200)),
    },
    {
      system: `You translate family scrapbook text. Output only ${LANGUAGE_INSTRUCTIONS[targetLanguage]} translation.`,
      user: text.slice(0, 800),
    },
  ];

  for (const attempt of attempts) {
    try {
      const translated = await runTranslation(
        text,
        chat,
        attempt.system,
        attempt.user
      );
      if (translated) return translated;
    } catch (error) {
      if (!isAzureContentFilterError(error)) {
        console.error("Translation error:", error);
        throw error;
      }
      console.warn("Azure content filter on translate — retrying.");
    }
  }

  throw new Error(
    `Azure blocked translation to ${lang?.label ?? targetLanguage}. Try rephrasing the memory (avoid explicit loss/death wording) or ask your Azure admin to relax content filters for this deployment.`
  );
}
