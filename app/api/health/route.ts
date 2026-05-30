import { apiSuccess } from "@/lib/api-utils";
import { hasGemini } from "@/lib/gemini";

// Read env at request time (not build time) so deployed health reflects the
// running container's configured secrets, and serves as a live readiness probe.
export const dynamic = "force-dynamic";

export async function GET() {
  const hasMurf = Boolean(process.env.MURF_AI_API_KEY);
  const gemini = hasGemini();

  return apiSuccess({
    status: "ok",
    services: {
      murf: hasMurf,
      // Gemini powers all text + audio AI (story, dialogue, emotion, DNA,
      // translation, transcription).
      storyAI: gemini,
      gemini,
      transcription: gemini,
    },
  });
}
