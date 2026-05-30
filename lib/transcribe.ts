import { getWhisperClient, getWhisperModel } from "./chat-client";

export async function transcribeAudio(
  file: File
): Promise<{ text: string }> {
  const client = getWhisperClient();
  if (!client) {
    throw new Error(
      "Transcription not configured. Set AZURE_OPENAI_WHISPER_DEPLOYMENT_NAME in .env."
    );
  }

  const transcription = await client.audio.transcriptions.create({
    file,
    model: getWhisperModel(),
    language: "en",
  });

  const text = transcription.text?.trim();
  if (!text) {
    throw new Error("Could not transcribe audio. Please try again or type your memory.");
  }

  return { text };
}
