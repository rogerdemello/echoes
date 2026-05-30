import { apiError, apiSuccess } from "@/lib/api-utils";
import { analyzeMemoryDNA } from "@/lib/memory-dna";
import type { Emotion } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { originalText, enhancedStory, emotion } = body;

    if (!originalText?.trim() || !enhancedStory?.trim()) {
      return apiError("originalText and enhancedStory are required");
    }

    const dna = await analyzeMemoryDNA(
      originalText.trim(),
      enhancedStory.trim(),
      (emotion as Emotion) ?? "nostalgic"
    );

    return apiSuccess({ dna });
  } catch (error) {
    console.error("POST /api/memory-dna:", error);
    return apiError(
      error instanceof Error ? error.message : "Memory DNA analysis failed",
      500
    );
  }
}
