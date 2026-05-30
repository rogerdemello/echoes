import { apiError, apiSuccess } from "@/lib/api-utils";
import { mixNarrationWithAmbient } from "@/lib/audio-mix";
import { generateSpeech } from "@/lib/murf";
import { ensureNarrationLanguage, isMostlyLatinScript } from "@/lib/narration";
import { getStoryById, updateStory, updateStoryAudio } from "@/lib/stories";
import type { Emotion, LanguageCode, NarratorPersona } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      storyId: string;
      language?: LanguageCode;
      emotion?: Emotion;
      narrator?: NarratorPersona;
      text?: string;
    };

    if (!body.storyId) {
      return apiError("storyId is required");
    }

    const story = await getStoryById(body.storyId);
    if (!story) return apiError("Story not found", 404);

    const language = body.language ?? story.language;
    const emotion = body.emotion ?? story.emotion;
    const narrator = body.narrator ?? story.narrator;

    let text =
      body.text ??
      (language === story.language
        ? story.enhancedStory
        : story.translations?.find((t) => t.language === language)
            ?.enhancedStory) ??
      story.enhancedStory;

    let translationWarning: string | null = null;
    try {
      text = await ensureNarrationLanguage(text, language);
      if (language !== "en" && isMostlyLatinScript(text)) {
        translationWarning =
          "Azure could not translate this memory for native voice. Try rephrasing (softer wording) or regenerate in English.";
        return apiSuccess({
          story,
          voiceError: translationWarning,
          translationSkipped: true,
        });
      }
    } catch (err) {
      translationWarning =
        err instanceof Error ? err.message : "Translation unavailable";
      return apiSuccess({
        story,
        voiceError: translationWarning,
        translationSkipped: true,
      });
    }

    if (language === story.language && text !== story.enhancedStory) {
      await updateStory(story.id, { enhancedStory: text });
    }

    await updateStory(story.id, { emotion, language, narrator });

    const murf = await generateSpeech({
      text,
      language,
      emotion,
      narrator,
    });

    let finalAudioUrl = murf.audioUrl;
    let mixError: string | null = null;
    try {
      // Per-language mixed file so re-generating Hindi doesn't clobber English
      const mixedId =
        language === story.language ? story.id : `${story.id}.${language}`;
      const mixed = await mixNarrationWithAmbient(murf.audioUrl, emotion, mixedId);
      finalAudioUrl = mixed.url;
    } catch (err) {
      mixError = err instanceof Error ? err.message : "Ambient mix failed";
      console.warn("Ambient mix failed in regenerate, using raw Murf URL:", err);
    }

    const updated = await updateStoryAudio(story.id, finalAudioUrl, language);

    return apiSuccess({
      story: updated,
      audioUrl: finalAudioUrl,
      voiceId: murf.voiceId,
      translationWarning,
      mixError,
    });
  } catch (error) {
    console.error("POST /api/generate-voice:", error);
    return apiError(
      error instanceof Error ? error.message : "Voice generation failed",
      500
    );
  }
}
