import { apiError, apiSuccess } from "@/lib/api-utils";
import { enhanceStory } from "@/lib/openai";
import type { Emotion, LanguageCode, StoryStyle } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      text?: string;
      storyStyle?: StoryStyle;
      emotion?: Emotion;
      language?: LanguageCode;
    };

    if (!body.text?.trim()) {
      return apiError("text is required");
    }

    const result = await enhanceStory(
      body.text.trim(),
      body.storyStyle ?? "documentary",
      body.emotion ?? "nostalgic",
      body.language ?? "en"
    );

    return apiSuccess({ ...result });
  } catch (error) {
    console.error("POST /api/enhance-story:", error);
    return apiError(
      error instanceof Error ? error.message : "Enhancement failed",
      500
    );
  }
}
