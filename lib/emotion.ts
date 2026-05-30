import { getChatClient } from "./chat-client";
import { ECHOES_SAFETY_SYSTEM, wrapUserMemory } from "./azure-safety";
import type { Emotion } from "./types";

const VALID: Emotion[] = [
  "nostalgic",
  "calm",
  "hopeful",
  "dramatic",
  "joyful",
];

export async function detectEmotion(text: string): Promise<{
  emotion: Emotion;
  confidence: number;
  reasoning: string;
}> {
  const chat = getChatClient();
  if (!chat) return heuristicEmotion(text);

  try {
    const completion = await chat.client.chat.completions.create({
      model: chat.model,
      messages: [
        {
          role: "system",
          content: `${ECHOES_SAFETY_SYSTEM}

Analyze the emotional tone of a wholesome family memory.
Return JSON only: { "emotion": "nostalgic"|"calm"|"hopeful"|"dramatic"|"joyful", "confidence": 0.0-1.0, "reasoning": "one sentence" }`,
        },
        { role: "user", content: wrapUserMemory(text) },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) return heuristicEmotion(text);

    const parsed = JSON.parse(content) as {
      emotion?: string;
      confidence?: number;
      reasoning?: string;
    };

    const emotion = VALID.includes(parsed.emotion as Emotion)
      ? (parsed.emotion as Emotion)
      : heuristicEmotion(text).emotion;

    return {
      emotion,
      confidence: Math.min(1, Math.max(0, parsed.confidence ?? 0.7)),
      reasoning: parsed.reasoning ?? "Detected from memory tone.",
    };
  } catch {
    return heuristicEmotion(text);
  }
}

function heuristicEmotion(text: string): {
  emotion: Emotion;
  confidence: number;
  reasoning: string;
} {
  const lower = text.toLowerCase();
  if (/loss|miss|remember|past|childhood|used to|gone/.test(lower)) {
    return { emotion: "nostalgic", confidence: 0.65, reasoning: "Reflective, memory-focused language." };
  }
  if (/excited|celebrate|joy|happy|won|achieved/.test(lower)) {
    return { emotion: "joyful", confidence: 0.65, reasoning: "Positive, celebratory language." };
  }
  if (/fear|struggle|fight|hard|pain|difficult/.test(lower)) {
    return { emotion: "dramatic", confidence: 0.6, reasoning: "Intense, challenging language." };
  }
  if (/hope|dream|future|believe|someday/.test(lower)) {
    return { emotion: "hopeful", confidence: 0.6, reasoning: "Forward-looking, aspirational language." };
  }
  return { emotion: "calm", confidence: 0.55, reasoning: "Neutral, peaceful tone." };
}
