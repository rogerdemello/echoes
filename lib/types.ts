export type Emotion = "nostalgic" | "calm" | "hopeful" | "dramatic" | "joyful";

export type StoryStyle =
  | "documentary"
  | "bedtime"
  | "motivational"
  | "cinematic"
  | "pixar"
  | "future-self"
  | "letter-younger-self";

export type NarratorPersona =
  | "documentary"
  | "trailer"
  | "grandmother"
  | "podcast"
  | "bedtime";

export type LanguageCode = "en" | "hi" | "es" | "fr" | "de";

export type InputType = "text" | "voice";

export type StoryMode = "solo" | "duet";

/** One line of a dual-voice "conversation across time". */
export interface DialogueLine {
  /** Which of the two speakers voices this line. */
  speaker: "a" | "b";
  /** Display label, e.g. "Me" or "Grandfather". */
  speakerName: string;
  text: string;
  /** Filled after audio render — start offset (seconds) in the stitched track. */
  startSec?: number;
  /** Filled after audio render — spoken duration (seconds) of this line. */
  durationSec?: number;
}

/** Configuration for a dual-voice Legacy duet. */
export interface DuetConfig {
  speakerAName: string;
  speakerBName: string;
  /** Reuse existing narrator personas — each maps to a distinct Murf voice. */
  narratorA: NarratorPersona;
  narratorB: NarratorPersona;
  /** Optional preset id (informational). */
  relationshipPreset?: string;
}

export interface StoryTranslation {
  language: LanguageCode;
  enhancedStory: string;
  audioUrl: string | null;
  createdAt: string;
}

export interface StoryMemoryDna {
  insight: string;
  themes: string[];
  emotionalSignature: string;
}

export interface Story {
  id: string;
  title: string;
  originalText: string;
  enhancedStory: string;
  audioUrl: string | null;
  /** Raw Murf MP3 URL before any cinematic ambient mixing — kept for fallback */
  rawAudioUrl?: string | null;
  language: LanguageCode;
  emotion: Emotion;
  storyStyle: StoryStyle;
  narrator: NarratorPersona;
  inputType: InputType;
  detectedEmotion: Emotion | null;
  translations: StoryTranslation[];
  createdAt: string;
  shareSlug: string;
  photoUrl?: string | null;
  memoryDna?: StoryMemoryDna | null;
  /** "solo" (default) or "duet" (dual-voice Legacy mode). */
  mode?: StoryMode;
  /** Present when mode === "duet": the alternating conversation lines. */
  dialogue?: DialogueLine[] | null;
  /** Present when mode === "duet": the two-speaker configuration. */
  duet?: DuetConfig | null;
}

export interface CreateStoryInput {
  originalText: string;
  language: LanguageCode;
  emotion: Emotion;
  storyStyle: StoryStyle;
  narrator: NarratorPersona;
  inputType?: InputType;
  autoDetectEmotion?: boolean;
  photoUrl?: string | null;
  mode?: StoryMode;
  duet?: DuetConfig | null;
}

export interface UpdateStoryInput {
  emotion?: Emotion;
  language?: LanguageCode;
  narrator?: NarratorPersona;
  storyStyle?: StoryStyle;
  enhancedStory?: string;
  title?: string;
}
