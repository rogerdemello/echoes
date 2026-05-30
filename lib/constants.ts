import type {
  DuetConfig,
  Emotion,
  LanguageCode,
  NarratorPersona,
  StoryStyle,
} from "./types";

export const EMOTIONS: { id: Emotion; label: string; description: string }[] = [
  { id: "nostalgic", label: "Nostalgic", description: "Warm, reflective, tender" },
  { id: "calm", label: "Calm", description: "Peaceful, gentle, steady" },
  { id: "hopeful", label: "Hopeful", description: "Uplifting, bright, forward-looking" },
  { id: "dramatic", label: "Dramatic", description: "Cinematic, intense, powerful" },
  { id: "joyful", label: "Joyful", description: "Light, celebratory, alive" },
];

export const STORY_STYLES: {
  id: StoryStyle;
  label: string;
  hook: string;
}[] = [
  {
    id: "documentary",
    label: "Netflix Documentary",
    hook: "Make my life sound like a Netflix documentary",
  },
  { id: "cinematic", label: "Cinematic Monologue", hook: "Poetic, visual, intimate" },
  { id: "bedtime", label: "Bedtime Story", hook: "Soft, magical, comforting" },
  {
    id: "motivational",
    label: "Motivational Speech",
    hook: "Inspiring, bold, empowering",
  },
  { id: "pixar", label: "Pixar Memory", hook: "Warmth, wonder, sensory innocence" },
  {
    id: "future-self",
    label: "Future Self Reflection",
    hook: "You, 20 years from now, remembering this",
  },
  {
    id: "letter-younger-self",
    label: "Letter to Younger Self",
    hook: "A tender second-person letter back in time",
  },
];

export const MEMORY_PROMPTS: string[] = [
  "A moment I'll never forget…",
  "Someone who changed my life…",
  "A place that feels like home…",
  "A goodbye I still remember…",
  "The smell of childhood…",
  "When I realized I'd grown up…",
  "A small kindness that stayed with me…",
];

/** Murf voice IDs verified via GET /v1/speech/voices */
export const NARRATORS: {
  id: NarratorPersona;
  label: string;
  voiceId: string;
  style: string;
}[] = [
  {
    id: "documentary",
    label: "Documentary Narrator",
    voiceId: "en-US-natalie",
    style: "Narration",
  },
  {
    id: "trailer",
    label: "Movie Trailer Voice",
    voiceId: "en-US-ken",
    style: "Promo",
  },
  {
    id: "grandmother",
    label: "Grandmother's Voice",
    voiceId: "en-US-julia",
    style: "Conversational",
  },
  {
    id: "podcast",
    label: "Podcast Host",
    voiceId: "en-US-terrell",
    style: "Conversational",
  },
  {
    id: "bedtime",
    label: "Bedtime Storyteller",
    voiceId: "en-US-julia",
    style: "Calm",
  },
];

export const LANGUAGES: {
  id: LanguageCode;
  label: string;
  locale: string;
  voiceId: string;
  /** Murf styles this voice supports (from API) */
  availableStyles: string[];
}[] = [
  {
    id: "en",
    label: "English",
    locale: "en-US",
    voiceId: "en-US-natalie",
    availableStyles: [
      "Angry",
      "Calm",
      "Conversational",
      "Inspirational",
      "Narration",
      "Newscast",
      "Promo",
      "Sad",
    ],
  },
  {
    id: "hi",
    label: "Hindi",
    locale: "hi-IN",
    voiceId: "hi-IN-shweta",
    availableStyles: ["Calm", "Conversational", "Promo", "Sad"],
  },
  {
    id: "es",
    label: "Spanish",
    locale: "es-ES",
    voiceId: "es-ES-carla",
    availableStyles: ["Conversational"],
  },
  {
    id: "fr",
    label: "French",
    locale: "fr-FR",
    voiceId: "fr-FR-justine",
    availableStyles: ["Angry", "Calm", "Conversational", "Promo", "Sad"],
  },
  {
    id: "de",
    label: "German",
    locale: "de-DE",
    voiceId: "de-DE-lia",
    availableStyles: ["Conversational"],
  },
];

/** Perfect judge-demo memory — train ride with grandfather. */
export const JUDGE_DEMO_MEMORY =
  "The last conversation I had with my grandfather was during a train ride home. He pointed at the fields rushing past and told me stories about his own childhood. I didn't know it would be the last time I'd hear his voice so close.";

/**
 * Dual-Voice Legacy presets — "a conversation across time".
 * Each pairs two narrator personas with DISTINCT Murf voices.
 * (Distinct voices: documentary=natalie, trailer=ken, grandmother=julia,
 * podcast=terrell. Never pair grandmother+bedtime — both are julia.)
 */
export const DUET_PRESETS: {
  id: string;
  label: string;
  speakerAName: string;
  speakerBName: string;
  narratorA: NarratorPersona;
  narratorB: NarratorPersona;
}[] = [
  {
    id: "you-grandfather",
    label: "You & Grandfather",
    speakerAName: "Me",
    speakerBName: "Grandfather",
    narratorA: "documentary", // en-US-natalie
    narratorB: "podcast", // en-US-terrell (warm older voice)
  },
  {
    id: "younger-future",
    label: "Younger & Future Me",
    speakerAName: "Younger Me",
    speakerBName: "Future Me",
    narratorA: "grandmother", // en-US-julia
    narratorB: "documentary", // en-US-natalie
  },
  {
    id: "parent-child",
    label: "Parent & Child",
    speakerAName: "Parent",
    speakerBName: "Child",
    narratorA: "documentary", // en-US-natalie
    narratorB: "trailer", // en-US-ken
  },
];

/** One-click judge demo for the dual-voice headline feature. */
export const JUDGE_DEMO_DUET: {
  memory: string;
  duet: DuetConfig;
  emotion: Emotion;
  language: LanguageCode;
} = {
  memory: JUDGE_DEMO_MEMORY,
  duet: {
    speakerAName: "Me",
    speakerBName: "Grandfather",
    narratorA: "documentary",
    narratorB: "podcast",
    relationshipPreset: "you-grandfather",
  },
  emotion: "nostalgic",
  language: "en",
};

export const EMOTION_TO_MURF_STYLE: Record<Emotion, string> = {
  nostalgic: "Conversational",
  calm: "Calm",
  hopeful: "Inspirational",
  dramatic: "Promo",
  joyful: "Conversational",
};
