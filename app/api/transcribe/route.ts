import { apiError, apiSuccess } from "@/lib/api-utils";
import { transcribeAudio } from "@/lib/transcribe";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("audio");

    if (!file || !(file instanceof File)) {
      return apiError("audio file is required (field name: audio)");
    }

    const maxBytes = 25 * 1024 * 1024;
    if (file.size > maxBytes) {
      return apiError("Audio file must be under 25MB");
    }

    const allowedExt = [".mp3", ".wav", ".m4a", ".webm", ".ogg", ".mp4", ".mpeg"];
    const hasAllowedType =
      !file.type ||
      file.type.startsWith("audio/") ||
      file.type === "video/webm";
    const hasAllowedExt = allowedExt.some((ext) =>
      file.name.toLowerCase().endsWith(ext)
    );
    if (!hasAllowedType && !hasAllowedExt) {
      return apiError("Unsupported file type. Upload audio (mp3, wav, m4a, webm).");
    }

    const result = await transcribeAudio(file);
    return apiSuccess(result);
  } catch (error) {
    console.error("POST /api/transcribe:", error);
    return apiError(
      error instanceof Error ? error.message : "Transcription failed",
      500
    );
  }
}
