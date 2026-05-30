import { apiError, apiSuccess } from "@/lib/api-utils";
import { detectEmotion } from "@/lib/emotion";
import { buildDuetStory, buildSoloStory } from "@/lib/story-pipeline";
import { createStory, getAllStories } from "@/lib/stories";
import type { CreateStoryInput, Emotion, LanguageCode } from "@/lib/types";
import { randomUUID } from "crypto";

export async function GET() {
  try {
    const stories = await getAllStories();
    return apiSuccess({
      stories: stories.map((s) => ({
        id: s.id,
        shareSlug: s.shareSlug,
        title: s.title,
        emotion: s.emotion,
        storyStyle: s.storyStyle,
        language: s.language,
        audioUrl: s.audioUrl,
        photoUrl: s.photoUrl ?? null,
        createdAt: s.createdAt,
        hasTranslations: (s.translations?.length ?? 0) > 0,
        themes: s.memoryDna?.themes ?? [],
        wordCount: s.enhancedStory?.trim().split(/\s+/).length ?? 0,
      })),
    });
  } catch (error) {
    console.error("GET /api/stories:", error);
    return apiError("Failed to load stories", 500);
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateStoryInput;

    if (!body.originalText?.trim()) {
      return apiError("originalText is required");
    }

    const language: LanguageCode = body.language ?? "en";
    let emotion: Emotion = body.emotion ?? "nostalgic";
    let detectedEmotion: Emotion | null = null;

    if (body.autoDetectEmotion) {
      const detected = await detectEmotion(body.originalText.trim());
      detectedEmotion = detected.emotion;
      emotion = detected.emotion;
    }

    // Stable storyId up front so the mixed MP3 filename matches the Story.id.
    const storyId = randomUUID();
    const ctx = { storyId, language, emotion, detectedEmotion };

    const built =
      body.mode === "duet" && body.duet
        ? await buildDuetStory(body, ctx)
        : await buildSoloStory(body, ctx);

    const story = await createStory(built.args);

    return apiSuccess({
      story,
      voiceError: built.voiceError,
      mixError: built.mixError,
    });
  } catch (error) {
    console.error("POST /api/stories:", error);
    return apiError(
      error instanceof Error ? error.message : "Failed to create story",
      500
    );
  }
}
