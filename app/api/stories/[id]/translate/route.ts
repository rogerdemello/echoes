import { apiError, apiSuccess } from "@/lib/api-utils";
import { isAzureContentFilterError } from "@/lib/azure-safety";

export const dynamic = "force-dynamic";
import { generateSpeech } from "@/lib/murf";
import { getStoryById, upsertTranslation } from "@/lib/stories";
import { translateStory } from "@/lib/translate";
import type { LanguageCode } from "@/lib/types";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const story = await getStoryById(params.id);
    if (!story) return apiError("Story not found", 404);

    const body = (await request.json()) as { language?: LanguageCode };

    if (!body.language) {
      return apiError("language is required");
    }

    if (body.language === story.language) {
      return apiSuccess({
        story,
        translation: {
          language: body.language,
          enhancedStory: story.enhancedStory,
          audioUrl: story.audioUrl,
          createdAt: story.createdAt,
        },
      });
    }

    const existing = story.translations?.find(
      (t) => t.language === body.language
    );
    if (existing?.audioUrl) {
      return apiSuccess({ story, translation: existing });
    }

    let translatedText: string;
    try {
      translatedText = await translateStory(story.enhancedStory, body.language);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Translation failed";
      const hint = isAzureContentFilterError(err)
        ? " Azure content filter blocked this text — try rephrasing the memory with gentler wording."
        : "";
      return apiError(msg + hint, 400);
    }

    let audioUrl: string | null = null;
    let voiceError: string | null = null;

    try {
      const murf = await generateSpeech({
        text: translatedText,
        language: body.language,
        emotion: story.emotion,
        narrator: story.narrator,
      });
      audioUrl = murf.audioUrl;
    } catch (err) {
      voiceError = err instanceof Error ? err.message : "Voice generation failed";
    }

    const translation = {
      language: body.language,
      enhancedStory: translatedText,
      audioUrl,
      createdAt: new Date().toISOString(),
    };

    const updated = await upsertTranslation(story.id, translation);

    return apiSuccess({
      story: updated,
      translation,
      voiceError,
    });
  } catch (error) {
    console.error("POST /api/stories/[id]/translate:", error);
    return apiError(
      error instanceof Error ? error.message : "Translation failed",
      500
    );
  }
}
