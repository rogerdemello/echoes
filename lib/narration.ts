import type { LanguageCode } from "./types";
import { translateStory } from "./translate";

/** Rough check: is text mostly Latin/English script? */
export function isMostlyLatinScript(text: string): boolean {
  const letters = text.replace(/[\s\d\W]/g, "");
  if (!letters.length) return true;
  const latin = (letters.match(/[A-Za-z]/g) ?? []).length;
  return latin / letters.length > 0.6;
}

/**
 * Ensures narration text matches the target language before Murf synthesis.
 * English text + Hindi locale = Indian-accent English (bug we fix here).
 */
export async function ensureNarrationLanguage(
  text: string,
  language: LanguageCode
): Promise<string> {
  if (language === "en") return text;

  if (!isMostlyLatinScript(text)) {
    return text;
  }

  return translateStory(text, language);
}
