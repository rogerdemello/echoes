import { mixNarrationWithAmbient } from "./audio-mix";
import { mixDialogueWithAmbient, type DialogueClip } from "./dialogue-mix";
import { analyzeMemoryDNA } from "./memory-dna";
import { generateSpeech } from "./murf";
import { ensureNarrationLanguage } from "./narration";
import { enhanceDialogue, enhanceStory } from "./openai";
import type { createStory } from "./stories";
import type {
  CreateStoryInput,
  DialogueLine,
  Emotion,
  LanguageCode,
  StoryMemoryDna,
} from "./types";

/** Argument bag accepted by createStory(). */
type CreateStoryArgs = Parameters<typeof createStory>[0];

export interface PipelineContext {
  storyId: string;
  language: LanguageCode;
  emotion: Emotion;
  detectedEmotion: Emotion | null;
}

export interface BuiltStory {
  args: CreateStoryArgs;
  voiceError: string | null;
  mixError: string | null;
}

function flatten(dialogue: DialogueLine[]): string {
  return dialogue.map((l) => `${l.speakerName}: ${l.text}`).join("\n\n");
}

/**
 * Solo pipeline — single narrator. Behaviourally identical to the original
 * inline POST handler so existing stories are unaffected.
 */
export async function buildSoloStory(
  body: CreateStoryInput,
  ctx: PipelineContext
): Promise<BuiltStory> {
  const { storyId, language, emotion, detectedEmotion } = ctx;

  let { enhancedStory, title } = await enhanceStory(
    body.originalText.trim(),
    body.storyStyle ?? "documentary",
    emotion,
    language
  );

  enhancedStory = await ensureNarrationLanguage(enhancedStory, language);

  let rawAudioUrl: string | null = null;
  let audioUrl: string | null = null;
  let voiceError: string | null = null;
  let mixError: string | null = null;

  try {
    const murf = await generateSpeech({
      text: enhancedStory,
      language,
      emotion,
      narrator: body.narrator ?? "documentary",
    });
    rawAudioUrl = murf.audioUrl;
    audioUrl = murf.audioUrl;
  } catch (murfError) {
    voiceError =
      murfError instanceof Error ? murfError.message : "Voice generation failed";
    console.error("Murf generation failed:", murfError);
  }

  if (rawAudioUrl) {
    try {
      const mixed = await mixNarrationWithAmbient(rawAudioUrl, emotion, storyId);
      audioUrl = mixed.url;
    } catch (mixErr) {
      mixError = mixErr instanceof Error ? mixErr.message : "Ambient mix failed";
      console.warn("Ambient mix failed, keeping raw Murf URL:", mixErr);
    }
  }

  const memoryDna = await safeMemoryDna(body.originalText.trim(), enhancedStory, emotion);

  return {
    args: {
      ...body,
      id: storyId,
      originalText: body.originalText.trim(),
      language,
      emotion,
      title,
      enhancedStory,
      audioUrl,
      rawAudioUrl,
      detectedEmotion,
      inputType: body.inputType ?? "text",
      photoUrl: body.photoUrl ?? null,
      memoryDna,
      mode: "solo",
    },
    voiceError,
    mixError,
  };
}

/**
 * Duet pipeline — dual-voice "conversation across time". Writes an alternating
 * dialogue, voices each line with its speaker's persona (distinct Murf voices),
 * stitches them with the ambient pad, and records per-line timings for sync.
 */
export async function buildDuetStory(
  body: CreateStoryInput,
  ctx: PipelineContext
): Promise<BuiltStory> {
  const { storyId, language, emotion, detectedEmotion } = ctx;
  const duet = body.duet!; // guaranteed by caller

  const enhanced = await enhanceDialogue(
    body.originalText.trim(),
    duet,
    emotion,
    language
  );
  const { title } = enhanced;
  let dialogue: DialogueLine[] = enhanced.dialogue;

  // Non-English duets: ensure each line is in the target language before TTS.
  if (language !== "en") {
    dialogue = await Promise.all(
      dialogue.map(async (l) => ({
        ...l,
        text: await ensureNarrationLanguage(l.text, language),
      }))
    );
  }

  let voiceError: string | null = null;
  let mixError: string | null = null;

  // Voice every line with its speaker's persona, preserving order.
  const results = await Promise.allSettled(
    dialogue.map((line) =>
      generateSpeech({
        text: line.text,
        language,
        emotion,
        narrator: line.speaker === "a" ? duet.narratorA : duet.narratorB,
      })
    )
  );

  // Keep only lines whose voice generation succeeded (indices stay aligned).
  const survivingLines: DialogueLine[] = [];
  const clips: DialogueClip[] = [];
  let firstRawUrl: string | null = null;
  results.forEach((res, i) => {
    if (res.status === "fulfilled") {
      survivingLines.push({ ...dialogue[i] });
      clips.push({ url: res.value.audioUrl });
      if (!firstRawUrl) firstRawUrl = res.value.audioUrl;
    } else {
      console.error(`Duet line ${i} voice failed:`, res.reason);
    }
  });

  let finalDialogue = survivingLines.length > 0 ? survivingLines : dialogue;
  let audioUrl: string | null = null;
  let rawAudioUrl: string | null = firstRawUrl;

  if (clips.length === 0) {
    voiceError = "Voice generation failed for all dialogue lines";
  } else {
    try {
      const mixed = await mixDialogueWithAmbient(clips, emotion, storyId);
      audioUrl = mixed.url;
      // Write per-line timings back onto the surviving lines for player sync.
      finalDialogue = survivingLines.map((l, i) => ({
        ...l,
        startSec: mixed.timings[i]?.startSec,
        durationSec: mixed.timings[i]?.durationSec,
      }));
    } catch (mixErr) {
      mixError = mixErr instanceof Error ? mixErr.message : "Dialogue mix failed";
      console.warn("Dialogue mix failed, keeping raw first-clip URL:", mixErr);
      audioUrl = firstRawUrl; // expiring fallback; mixed local file is preferred
    }
  }

  const enhancedStory = flatten(finalDialogue);
  const memoryDna = await safeMemoryDna(body.originalText.trim(), enhancedStory, emotion);

  return {
    args: {
      ...body,
      id: storyId,
      originalText: body.originalText.trim(),
      language,
      emotion,
      title,
      enhancedStory,
      audioUrl,
      rawAudioUrl,
      detectedEmotion,
      inputType: body.inputType ?? "text",
      photoUrl: body.photoUrl ?? null,
      memoryDna,
      mode: "duet",
      dialogue: finalDialogue,
      duet,
    },
    voiceError,
    mixError,
  };
}

async function safeMemoryDna(
  original: string,
  enhanced: string,
  emotion: Emotion
): Promise<StoryMemoryDna | null> {
  try {
    return await analyzeMemoryDNA(original, enhanced, emotion);
  } catch (dnaErr) {
    console.warn("Memory DNA analysis failed:", dnaErr);
    return null;
  }
}
