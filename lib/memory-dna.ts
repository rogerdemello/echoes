import { getChatClient } from "./chat-client";
import {
  ECHOES_SAFETY_SYSTEM,
  isAzureContentFilterError,
  wrapUserMemory,
} from "./azure-safety";
import type { Emotion, StoryMemoryDna } from "./types";

export type MemoryDNA = StoryMemoryDna;

const FALLBACK: Record<Emotion, MemoryDNA> = {
  nostalgic: {
    insight:
      "Your stories are filled with tenderness and the quiet beauty of moments that time cannot erase.",
    themes: ["family", "time", "love"],
    emotionalSignature: "Warm nostalgia with reflective depth",
  },
  calm: {
    insight:
      "Your memories breathe peace — stories that slow the world down and let you feel safe.",
    themes: ["stillness", "presence", "comfort"],
    emotionalSignature: "Gentle calm and grounded warmth",
  },
  hopeful: {
    insight:
      "Your stories radiate resilience and hope — proof that light finds its way forward.",
    themes: ["growth", "possibility", "courage"],
    emotionalSignature: "Uplifting hope with quiet strength",
  },
  dramatic: {
    insight:
      "Your memories carry cinematic weight — stories where every moment feels unforgettable.",
    themes: ["transformation", "intensity", "legacy"],
    emotionalSignature: "Bold drama with emotional truth",
  },
  joyful: {
    insight:
      "Your stories sparkle with gratitude and joy — celebrations of being fully alive.",
    themes: ["celebration", "connection", "gratitude"],
    emotionalSignature: "Radiant joy with heartfelt warmth",
  },
};

async function fetchDNA(
  chat: NonNullable<ReturnType<typeof getChatClient>>,
  userContent: string,
  emotion: Emotion
): Promise<MemoryDNA | null> {
  const completion = await chat.client.chat.completions.create({
    model: chat.model,
    messages: [
      {
        role: "system",
        content: `${ECHOES_SAFETY_SYSTEM}

Analyze wholesome family memories for Echoes. Return JSON only:
{
  "insight": "One warm second-person sentence about their storytelling themes.",
  "themes": ["3 short theme words"],
  "emotionalSignature": "One phrase for their emotional style"
}
Be poetic and uplifting. No markdown.`,
      },
      { role: "user", content: userContent },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) return null;

  const parsed = JSON.parse(content) as Partial<MemoryDNA>;
  return {
    insight: parsed.insight?.trim() || FALLBACK[emotion].insight,
    themes: Array.isArray(parsed.themes)
      ? parsed.themes.slice(0, 4)
      : FALLBACK[emotion].themes,
    emotionalSignature:
      parsed.emotionalSignature?.trim() ||
      FALLBACK[emotion].emotionalSignature,
  };
}

export async function analyzeMemoryDNA(
  originalText: string,
  enhancedStory: string,
  emotion: Emotion
): Promise<MemoryDNA> {
  const chat = getChatClient();
  if (!chat) return FALLBACK[emotion];

  const attempts = [
    wrapUserMemory(
      `Emotion: ${emotion}\n\nOriginal:\n${originalText.slice(0, 400)}\n\nNarration:\n${enhancedStory.slice(0, 600)}`
    ),
    `Emotion: ${emotion}\nNarration excerpt:\n${enhancedStory.slice(0, 400)}`,
  ];

  for (const userContent of attempts) {
    try {
      const result = await fetchDNA(chat, userContent, emotion);
      if (result) return result;
    } catch (error) {
      if (!isAzureContentFilterError(error)) {
        console.error("Memory DNA analysis failed:", error);
        break;
      }
      console.warn("Azure content filter on Memory DNA — retrying.");
    }
  }

  return FALLBACK[emotion];
}
