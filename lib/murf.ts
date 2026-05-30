import { EMOTION_TO_MURF_STYLE, NARRATORS } from "./constants";
import { resolveVoice, getMurfVoices, type MurfVoiceEntry } from "./voice-catalog";
import { pickMurfStyle } from "./voice-styles";
import type { Emotion, LanguageCode, NarratorPersona } from "./types";

const MURF_API_BASE = "https://api.murf.ai/v1";

export interface MurfGenerateOptions {
  text: string;
  language: LanguageCode;
  emotion: Emotion;
  narrator: NarratorPersona;
}

export interface MurfGenerateResult {
  audioUrl: string;
  voiceId: string;
}

export type MurfVoice = MurfVoiceEntry;

function getApiKey(): string {
  const apiKey = process.env.MURF_AI_API_KEY;
  if (!apiKey) throw new Error("MURF_AI_API_KEY is not configured");
  return apiKey;
}

export async function generateSpeech(
  options: MurfGenerateOptions
): Promise<MurfGenerateResult> {
  const persona =
    NARRATORS.find((n) => n.id === options.narrator) ?? NARRATORS[0];

  const { voiceId, locale, availableStyles } = await resolveVoice(
    options.language,
    options.narrator
  );

  const style = pickMurfStyle(
    options.emotion,
    availableStyles,
    options.language === "en"
      ? EMOTION_TO_MURF_STYLE[options.emotion] || persona.style
      : EMOTION_TO_MURF_STYLE[options.emotion]
  );

  const response = await fetch(`${MURF_API_BASE}/speech/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": getApiKey(),
    },
    body: JSON.stringify({
      text: options.text,
      voiceId,
      format: "MP3",
      style,
      locale,
      modelVersion: "GEN2",
      channelType: "STEREO",
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Murf API error (${response.status}): ${errorBody || response.statusText}`
    );
  }

  const data = (await response.json()) as {
    audioFile?: string;
    encodedAudio?: string;
  };

  const audioUrl = data.audioFile;
  if (!audioUrl) {
    throw new Error("Murf API did not return an audio URL");
  }

  return { audioUrl, voiceId };
}

export async function listVoices(): Promise<MurfVoiceEntry[]> {
  const voices = await getMurfVoices();
  return voices.length > 0 ? voices : [];
}
