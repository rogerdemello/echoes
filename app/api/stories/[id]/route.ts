import { apiError, apiSuccess } from "@/lib/api-utils";

export const dynamic = "force-dynamic";
import { generateSpeech } from "@/lib/murf";
import { ensureNarrationLanguage } from "@/lib/narration";
import { enhanceStory } from "@/lib/openai";
import {
  deleteStory,
  getStoryById,
  updateStory,
  updateStoryAudio,
} from "@/lib/stories";
import type { UpdateStoryInput } from "@/lib/types";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const story = await getStoryById(params.id);
    if (!story) return apiError("Story not found", 404);
    return apiSuccess({ story });
  } catch (error) {
    console.error("GET /api/stories/[id]:", error);
    return apiError("Failed to load story", 500);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const story = await getStoryById(params.id);
    if (!story) return apiError("Story not found", 404);

    const body = (await request.json()) as UpdateStoryInput & {
      regenerateVoice?: boolean;
      regenerateStory?: boolean;
    };

    let enhancedStory = story.enhancedStory;
    let title = story.title;

    const targetLanguage = body.language ?? story.language;

    if (body.regenerateStory) {
      const enhanced = await enhanceStory(
        story.originalText,
        body.storyStyle ?? story.storyStyle,
        body.emotion ?? story.emotion,
        targetLanguage
      );
      enhancedStory = await ensureNarrationLanguage(
        enhanced.enhancedStory,
        targetLanguage
      );
      title = enhanced.title;
    }

    let updated = await updateStory(story.id, {
      emotion: body.emotion,
      language: body.language,
      narrator: body.narrator,
      storyStyle: body.storyStyle,
      enhancedStory: body.regenerateStory ? enhancedStory : body.enhancedStory,
      title: body.regenerateStory ? title : body.title,
    });

    if (!updated) return apiError("Story not found", 404);

    if (body.regenerateVoice) {
      const lang = body.language ?? updated.language;
      const narrationText = await ensureNarrationLanguage(
        updated.enhancedStory,
        lang
      );
      if (narrationText !== updated.enhancedStory) {
        updated =
          (await updateStory(updated.id, { enhancedStory: narrationText })) ??
          updated;
      }
      const murf = await generateSpeech({
        text: narrationText,
        language: lang,
        emotion: body.emotion ?? updated.emotion,
        narrator: body.narrator ?? updated.narrator,
      });
      updated =
        (await updateStoryAudio(
          updated.id,
          murf.audioUrl,
          body.language ?? updated.language
        )) ?? updated;
    }

    return apiSuccess({ story: updated });
  } catch (error) {
    console.error("PATCH /api/stories/[id]:", error);
    return apiError(
      error instanceof Error ? error.message : "Failed to update story",
      500
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const deleted = await deleteStory(params.id);
    if (!deleted) return apiError("Story not found", 404);
    return apiSuccess({ deleted: true });
  } catch (error) {
    console.error("DELETE /api/stories/[id]:", error);
    return apiError("Failed to delete story", 500);
  }
}
