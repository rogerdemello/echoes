import type { Emotion } from "./types";

const EMOTION_STYLE_PRIORITY: Record<Emotion, string[]> = {
  nostalgic: ["Conversational", "Calm", "Narration", "Sad"],
  calm: ["Calm", "Conversational", "Narration"],
  hopeful: ["Inspirational", "Conversational", "Promo"],
  dramatic: ["Promo", "Narration", "Angry", "Conversational"],
  joyful: ["Conversational", "Promo", "Inspirational"],
};

/** Pick the best Murf style supported by this voice for the given emotion */
export function pickMurfStyle(
  emotion: Emotion,
  availableStyles?: string[],
  fallback = "Conversational"
): string {
  const priorities = EMOTION_STYLE_PRIORITY[emotion];
  if (!availableStyles?.length) {
    return priorities.find((s) => s === fallback) ?? fallback;
  }
  for (const style of priorities) {
    if (availableStyles.includes(style)) return style;
  }
  return availableStyles[0] ?? fallback;
}
