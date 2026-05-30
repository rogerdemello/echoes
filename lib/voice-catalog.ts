import { LANGUAGES, NARRATORS } from "./constants";
import type { LanguageCode, NarratorPersona } from "./types";

export interface MurfVoiceEntry {
  voiceId: string;
  displayName?: string;
  locale?: string;
  availableStyles?: string[];
  supportedLocales?: Record<string, { availableStyles?: string[] }>;
}

let cachedVoices: MurfVoiceEntry[] | null = null;
let cacheTime = 0;
const CACHE_MS = 60 * 60 * 1000;

const PREFERRED_NATIVE: Record<LanguageCode, string[]> = {
  en: ["en-US-natalie", "en-US-wayne", "en-US-julia", "en-US-terrell", "en-US-ken"],
  hi: ["hi-IN-shweta", "hi-IN-rahul", "hi-IN-amit"],
  es: ["es-ES-carla", "es-ES-elvira", "es-ES-enrique"],
  fr: ["fr-FR-justine", "fr-FR-adélie", "fr-FR-maxime"],
  de: ["de-DE-lia", "de-DE-josephine", "de-DE-erna"],
};

async function fetchVoicesFromMurf(): Promise<MurfVoiceEntry[]> {
  const apiKey = process.env.MURF_AI_API_KEY;
  if (!apiKey) return [];

  const response = await fetch("https://api.murf.ai/v1/speech/voices", {
    headers: { "api-key": apiKey },
    cache: "no-store",
  });

  if (!response.ok) return [];

  const data = (await response.json()) as MurfVoiceEntry[] | { voices?: MurfVoiceEntry[] };
  return Array.isArray(data) ? data : (data.voices ?? []);
}

export async function getMurfVoices(): Promise<MurfVoiceEntry[]> {
  const now = Date.now();
  if (cachedVoices && now - cacheTime < CACHE_MS) {
    return cachedVoices;
  }

  const voices = await fetchVoicesFromMurf();
  if (voices.length > 0) {
    cachedVoices = voices;
    cacheTime = now;
  }
  return cachedVoices ?? [];
}

export async function resolveVoice(
  language: LanguageCode,
  narrator: NarratorPersona
): Promise<{ voiceId: string; locale: string; availableStyles?: string[] }> {
  const langConfig = LANGUAGES.find((l) => l.id === language) ?? LANGUAGES[0];
  const persona = NARRATORS.find((n) => n.id === narrator) ?? NARRATORS[0];

  const voices = await getMurfVoices();

  if (language === "en") {
    const preferred = [persona.voiceId, ...PREFERRED_NATIVE.en];
    for (const id of preferred) {
      const match = voices.find((v) => v.voiceId === id);
      if (match) {
        return {
          voiceId: match.voiceId,
          locale: match.locale ?? "en-US",
          availableStyles: match.availableStyles,
        };
      }
    }
    return {
      voiceId: persona.voiceId,
      locale: "en-US",
      availableStyles: langConfig.availableStyles,
    };
  }

  const locale = langConfig.locale;
  const preferred = PREFERRED_NATIVE[language] ?? [];

  for (const id of preferred) {
    const match = voices.find((v) => v.voiceId === id);
    if (match) {
      return {
        voiceId: match.voiceId,
        locale: match.locale ?? locale,
        availableStyles: match.availableStyles,
      };
    }
  }

  const native = voices.find(
    (v) => v.locale === locale || v.voiceId.startsWith(locale.split("-")[0] + "-")
  );
  if (native) {
    return {
      voiceId: native.voiceId,
      locale: native.locale ?? locale,
      availableStyles: native.availableStyles,
    };
  }

  // Do NOT use English voices + locale override — that produces English with an accent,
  // not true Hindi/Spanish/French/German. Native voice + translated text only.
  return {
    voiceId: langConfig.voiceId,
    locale,
    availableStyles: langConfig.availableStyles,
  };
}
