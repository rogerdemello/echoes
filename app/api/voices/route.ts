import { apiError, apiSuccess } from "@/lib/api-utils";
import { listVoices } from "@/lib/murf";

export async function GET() {
  try {
    const voices = await listVoices();
    return apiSuccess({ voices });
  } catch (error) {
    console.error("GET /api/voices:", error);
    return apiError(
      error instanceof Error ? error.message : "Failed to fetch voices",
      500
    );
  }
}
