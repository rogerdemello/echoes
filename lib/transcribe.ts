import { geminiGenerate, hasGemini } from "./gemini";

const MAX_INLINE_BYTES = 18 * 1024 * 1024; // Gemini inline-data ceiling (~20MB)

export async function transcribeAudio(
  file: File
): Promise<{ text: string }> {
  if (!hasGemini()) {
    throw new Error(
      "Voice transcription isn't available on this server — set GEMINI_API_KEY. Please type your memory instead."
    );
  }

  const bytes = await file.arrayBuffer();
  if (bytes.byteLength > MAX_INLINE_BYTES) {
    throw new Error("Audio file is too large to transcribe. Please use a shorter clip.");
  }

  const base64 = Buffer.from(bytes).toString("base64");
  const mimeType = file.type || "audio/mpeg";

  let text: string;
  try {
    text = await geminiGenerate({
      temperature: 0,
      parts: [
        {
          text: "Transcribe this audio recording verbatim into plain text. Output only the spoken words — no timestamps, speaker labels, or commentary.",
        },
        { inlineData: { mimeType, data: base64 } },
      ],
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Gemini transcription failed:", message);
    throw new Error("Could not transcribe audio. Please try again or type your memory.");
  }

  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error("Could not transcribe audio. Please try again or type your memory.");
  }

  return { text: trimmed };
}
