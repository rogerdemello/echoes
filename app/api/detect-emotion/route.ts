import { apiError, apiSuccess } from "@/lib/api-utils";
import { detectEmotion } from "@/lib/emotion";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { text?: string };

    if (!body.text?.trim()) {
      return apiError("text is required");
    }

    const result = await detectEmotion(body.text.trim());
    return apiSuccess(result);
  } catch (error) {
    console.error("POST /api/detect-emotion:", error);
    return apiError(
      error instanceof Error ? error.message : "Detection failed",
      500
    );
  }
}
