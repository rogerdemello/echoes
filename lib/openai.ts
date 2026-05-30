import { getChatClient } from "./chat-client";
import {
  ECHOES_SAFETY_SYSTEM,
  isAzureContentFilterError,
  wrapUserMemory,
} from "./azure-safety";
import { LANGUAGE_INSTRUCTIONS } from "./translate";
import type {
  DialogueLine,
  DuetConfig,
  Emotion,
  LanguageCode,
  StoryStyle,
} from "./types";

const STYLE_PROMPTS: Record<StoryStyle, string> = {
  documentary: `Write in the style of a premium Netflix documentary narration.
Use vivid sensory details, emotional pacing, and reflective tone.
Structure: opening hook, rising emotional arc, poignant closing line.`,
  cinematic: `Write as an intimate cinematic monologue — poetic, visual, deeply human.
Use metaphor and rhythm. Feel like a film voiceover over golden-hour footage.`,
  bedtime: `Write as a gentle bedtime story for all ages — warm, magical, reassuring.
Soft pacing, comforting imagery, a peaceful ending.`,
  motivational: `Write as an inspiring motivational speech — bold, direct, empowering.
Build momentum. End with a call to believe in yourself.`,
  pixar: `Write with the warmth and wonder of a Pixar short — sensory innocence,
gentle metaphor, small details that bloom into meaning. Hopeful arc, child-like awe,
without ever feeling saccharine. End on a quiet beat of love.`,
  "future-self": `Narrate as the user reflecting on this moment 20 years later — tender,
knowing, slightly amused at the small detail that turned out to matter. Use a soft
"I remember…" voice and let hindsight color the imagery. Close on what the older
self would whisper back to the younger.`,
  "letter-younger-self": `Write as a second-person letter addressed to the user's younger
self at the time of the memory. Begin "Dear younger me," and use present tense.
Be compassionate, honest, gently protective. End with one line of permission
or reassurance only the future could give.`,
};

const EMOTION_HINTS: Record<Emotion, string> = {
  nostalgic: "Tone: nostalgic, tender, bittersweet warmth.",
  calm: "Tone: calm, peaceful, unhurried.",
  hopeful: "Tone: hopeful, uplifting, forward-looking.",
  dramatic: "Tone: dramatic, cinematic, emotionally intense.",
  joyful: "Tone: joyful, celebratory, alive with gratitude.",
};

type ChatBundle = NonNullable<ReturnType<typeof getChatClient>>;

async function callEnhance(
  chat: ChatBundle,
  memory: string,
  systemContent: string
): Promise<{ title: string; enhancedStory: string } | null> {
  const completion = await chat.client.chat.completions.create({
    model: chat.model,
    messages: [
      { role: "system", content: systemContent },
      { role: "user", content: wrapUserMemory(memory) },
    ],
    response_format: { type: "json_object" },
    temperature: 0.75,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) return null;

  const parsed = JSON.parse(content) as {
    title?: string;
    enhancedStory?: string;
  };
  if (!parsed.enhancedStory?.trim()) return null;
  return {
    title: parsed.title?.trim() || "Untitled Memory",
    enhancedStory: parsed.enhancedStory.trim(),
  };
}

export async function enhanceStory(
  memory: string,
  storyStyle: StoryStyle,
  emotion: Emotion,
  language: LanguageCode = "en"
): Promise<{ enhancedStory: string; title: string }> {
  const chat = getChatClient();
  if (!chat) return fallbackEnhance(memory, storyStyle, emotion);

  const languageRule =
    language === "en"
      ? "Write in English."
      : `OUTPUT LANGUAGE: ${LANGUAGE_INSTRUCTIONS[language]}`;

  const prompts = [
    `${ECHOES_SAFETY_SYSTEM}

You are a cinematic storyteller for Echoes.
${STYLE_PROMPTS[storyStyle]}
${EMOTION_HINTS[emotion]}
${languageRule}

Transform the memory into 150–250 words of warm, family-friendly narration-ready prose.
Preserve truth and emotional core. No markdown in body.
Suggest a short evocative title (3–6 words) in the same language as the story.
Respond in JSON: { "title": "...", "enhancedStory": "..." }`,

    `${ECHOES_SAFETY_SYSTEM}

Rewrite this wholesome family memory as gentle documentary narration (150–200 words).
${languageRule}
Respond in JSON: { "title": "...", "enhancedStory": "..." }`,
  ];

  for (const systemContent of prompts) {
    try {
      const result = await callEnhance(chat, memory, systemContent);
      if (result) return result;
    } catch (error) {
      if (isAzureContentFilterError(error)) {
        console.warn("Azure content filter on enhance — retrying with gentler prompt.");
        continue;
      }
      console.error("Story enhancement failed:", error);
      break;
    }
  }

  return fallbackEnhance(memory, storyStyle, emotion);
}

export function fallbackEnhance(
  memory: string,
  storyStyle: StoryStyle,
  emotion: Emotion
): { enhancedStory: string; title: string } {
  const openings: Record<StoryStyle, string> = {
    documentary: "Some memories don't fade — they echo.",
    cinematic: "In the quiet between heartbeats, this moment lives on.",
    bedtime: "Once upon a time, in a world not so different from ours...",
    motivational: "Every great story begins with a single brave moment.",
    pixar: "Once, in a world made of small magical things, this moment happened.",
    "future-self": "I remember this — twenty years on, and it still finds me.",
    "letter-younger-self": "Dear younger me, I want to tell you about this day.",
  };

  const title =
    memory.split(/[.!?]/)[0]?.slice(0, 40).trim() || "A Memory Worth Keeping";

  const enhancedStory = `${openings[storyStyle]}

${memory}

The ${emotion} weight of that moment still lingers — not as regret, but as proof that we were fully alive when it happened. Years may pass, but the feeling remains: warm, real, and unmistakably ours.

This is what Echoes preserves — not just what happened, but how it felt.`;

  return { enhancedStory, title };
}

// ---------------------------------------------------------------------------
// Dual-Voice Legacy Mode — "a conversation across time"
// ---------------------------------------------------------------------------

export interface DialogueResult {
  title: string;
  dialogue: DialogueLine[];
  /** Flattened "{speakerName}: {text}" narration — powers translate/DNA/export. */
  enhancedStory: string;
}

function flattenDialogue(lines: DialogueLine[]): string {
  return lines.map((l) => `${l.speakerName}: ${l.text}`).join("\n\n");
}

/** Coerce raw model output into a strictly alternating A/B/A/B DialogueLine[]. */
function normalizeDialogueLines(
  rawLines: { speaker?: unknown; text?: unknown }[],
  duet: DuetConfig
): DialogueLine[] {
  return rawLines
    .map((l) => (typeof l?.text === "string" ? l.text.trim() : ""))
    .filter((text) => text.length > 0)
    .slice(0, 12)
    .map((text, i): DialogueLine => {
      // Force alternation by index parity so the audio voices stay distinct.
      const speaker: "a" | "b" = i % 2 === 0 ? "a" : "b";
      return {
        speaker,
        speakerName: speaker === "a" ? duet.speakerAName : duet.speakerBName,
        text,
      };
    });
}

async function callDialogue(
  chat: ChatBundle,
  memory: string,
  systemContent: string,
  duet: DuetConfig
): Promise<DialogueResult | null> {
  const completion = await chat.client.chat.completions.create({
    model: chat.model,
    messages: [
      { role: "system", content: systemContent },
      { role: "user", content: wrapUserMemory(memory) },
    ],
    response_format: { type: "json_object" },
    temperature: 0.8,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) return null;

  const parsed = JSON.parse(content) as {
    title?: string;
    lines?: { speaker?: unknown; text?: unknown }[];
  };
  if (!Array.isArray(parsed.lines) || parsed.lines.length === 0) return null;

  const dialogue = normalizeDialogueLines(parsed.lines, duet);
  if (dialogue.length < 2) return null;

  return {
    title: parsed.title?.trim() || "A Conversation Across Time",
    dialogue,
    enhancedStory: flattenDialogue(dialogue),
  };
}

/**
 * Turn a single memory into a tender alternating conversation between two named
 * speakers (e.g. "Me" ↔ "Grandfather"). Mirrors enhanceStory's safety, retry,
 * and fallback discipline so the duet pipeline never throws.
 */
export async function enhanceDialogue(
  memory: string,
  duet: DuetConfig,
  emotion: Emotion,
  language: LanguageCode = "en"
): Promise<DialogueResult> {
  const chat = getChatClient();
  if (!chat) return fallbackDialogue(memory, duet, emotion);

  const languageRule =
    language === "en"
      ? "Write every line in English."
      : `OUTPUT LANGUAGE: ${LANGUAGE_INSTRUCTIONS[language]}`;

  const a = duet.speakerAName;
  const b = duet.speakerBName;

  const prompts = [
    `${ECHOES_SAFETY_SYSTEM}

You are writing a tender "conversation across time" for Echoes between two voices:
"${a}" (speaker a) and "${b}" (speaker b). Ground every line ONLY in the user's memory.
Produce 6 to 12 SHORT lines (1–2 sentences each), STRICTLY alternating a, b, a, b…,
starting with "${a}". Warm, family-friendly, emotionally true. ${EMOTION_HINTS[emotion]}
${languageRule}
Suggest a short evocative title (3–6 words) in the same language.
Respond in JSON: { "title": "...", "lines": [ { "speaker": "a", "text": "..." }, { "speaker": "b", "text": "..." } ] }`,

    `${ECHOES_SAFETY_SYSTEM}

Write a gentle, wholesome back-and-forth conversation (8 short alternating lines) between
"${a}" and "${b}" based on this family memory. Start with "${a}". ${languageRule}
Respond in JSON: { "title": "...", "lines": [ { "speaker": "a"|"b", "text": "..." } ] }`,
  ];

  for (const systemContent of prompts) {
    try {
      const result = await callDialogue(chat, memory, systemContent, duet);
      if (result) return result;
    } catch (error) {
      if (isAzureContentFilterError(error)) {
        console.warn("Azure content filter on dialogue — retrying gentler.");
        continue;
      }
      console.error("Dialogue enhancement failed:", error);
      break;
    }
  }

  return fallbackDialogue(memory, duet, emotion);
}

/** Deterministic duet fallback — guarantees an alternating conversation offline. */
export function fallbackDialogue(
  memory: string,
  duet: DuetConfig,
  emotion: Emotion
): DialogueResult {
  const opener: Record<Emotion, string> = {
    nostalgic: "I still carry that moment with me.",
    calm: "Sit with me a while — I want to remember this.",
    hopeful: "Looking back, I see how much it mattered.",
    dramatic: "Some moments never let you go.",
    joyful: "I smile every time I think of it.",
  };
  const closer: Record<Emotion, string> = {
    nostalgic: "Then keep it close. That's how I stay with you.",
    calm: "We were here, and that is enough.",
    hopeful: "Carry it forward — it was only ever the beginning.",
    dramatic: "Hold on to it. Some things are meant to echo.",
    joyful: "Good. Let it make you laugh for years to come.",
  };

  const sentences = memory
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 6);

  const middle = sentences.length > 0 ? sentences : [memory.trim()];
  const texts = [opener[emotion], ...middle, closer[emotion]];

  const dialogue: DialogueLine[] = texts.map((text, i): DialogueLine => {
    const speaker: "a" | "b" = i % 2 === 0 ? "a" : "b";
    return {
      speaker,
      speakerName: speaker === "a" ? duet.speakerAName : duet.speakerBName,
      text,
    };
  });

  const title =
    memory.split(/[.!?]/)[0]?.slice(0, 40).trim() || "A Conversation Across Time";

  return { title, dialogue, enhancedStory: flattenDialogue(dialogue) };
}
