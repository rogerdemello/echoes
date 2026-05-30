import { getChatClient } from "@/lib/chat-client";
import { apiSuccess } from "@/lib/api-utils";

// Read env at request time (not build time) so deployed health reflects the
// running container's configured secrets, and serves as a live readiness probe.
export const dynamic = "force-dynamic";

export async function GET() {
  const chat = getChatClient();
  const hasMurf = Boolean(process.env.MURF_AI_API_KEY);
  const hasAzure = Boolean(
    process.env.AZURE_OPENAI_API_KEY &&
      process.env.AZURE_OPENAI_ENDPOINT &&
      process.env.AZURE_OPENAI_DEPLOYMENT_NAME
  );
  const hasWhisper = Boolean(
    process.env.AZURE_OPENAI_WHISPER_DEPLOYMENT_NAME ||
      process.env.AZURE_OPENAI_WHISPER_DEPLOYMENT
  );

  return apiSuccess({
    status: "ok",
    services: {
      murf: hasMurf,
      storyAI: Boolean(chat),
      azureOpenAI: hasAzure,
      azureWhisper: hasWhisper,
    },
  });
}
