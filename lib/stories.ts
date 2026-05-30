import { promises as fs } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import type {
  CreateStoryInput,
  DialogueLine,
  DuetConfig,
  Emotion,
  LanguageCode,
  Story,
  StoryMemoryDna,
  StoryMode,
  StoryTranslation,
  UpdateStoryInput,
} from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const STORIES_FILE = path.join(DATA_DIR, "stories.json");

function normalizeStory(raw: Story): Story {
  return {
    ...raw,
    inputType: raw.inputType ?? "text",
    detectedEmotion: raw.detectedEmotion ?? null,
    translations: raw.translations ?? [],
    photoUrl: raw.photoUrl ?? null,
    rawAudioUrl: raw.rawAudioUrl ?? null,
    memoryDna: raw.memoryDna ?? null,
    mode: raw.mode ?? "solo",
    dialogue: raw.dialogue ?? null,
    duet: raw.duet ?? null,
  };
}

async function ensureDataFile(): Promise<Story[]> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const raw = await fs.readFile(STORIES_FILE, "utf-8");
    const trimmed = raw.trim();
    if (!trimmed) return [];
    const parsed = JSON.parse(trimmed) as Story[];
    return Array.isArray(parsed) ? parsed.map(normalizeStory) : [];
  } catch (error) {
    console.error("stories.json read error:", error);
    return [];
  }
}

async function saveStories(stories: Story[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(STORIES_FILE, JSON.stringify(stories, null, 2), "utf-8");
}

export async function getAllStories(): Promise<Story[]> {
  const stories = await ensureDataFile();
  return stories.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getStoryById(id: string): Promise<Story | null> {
  const stories = await ensureDataFile();
  return stories.find((s) => s.id === id || s.shareSlug === id) ?? null;
}

export async function createStory(
  input: CreateStoryInput & {
    id?: string;
    title: string;
    enhancedStory: string;
    audioUrl: string | null;
    rawAudioUrl?: string | null;
    detectedEmotion?: Emotion | null;
    photoUrl?: string | null;
    memoryDna?: StoryMemoryDna | null;
    mode?: StoryMode;
    dialogue?: DialogueLine[] | null;
    duet?: DuetConfig | null;
  }
): Promise<Story> {
  const stories = await ensureDataFile();
  const id = input.id ?? uuidv4();
  const shareSlug = id.slice(0, 8);

  const story: Story = {
    id,
    shareSlug,
    title: input.title,
    originalText: input.originalText,
    enhancedStory: input.enhancedStory,
    audioUrl: input.audioUrl,
    rawAudioUrl: input.rawAudioUrl ?? null,
    language: input.language,
    emotion: input.emotion,
    storyStyle: input.storyStyle,
    narrator: input.narrator,
    inputType: input.inputType ?? "text",
    detectedEmotion: input.detectedEmotion ?? null,
    translations: [],
    createdAt: new Date().toISOString(),
    photoUrl: input.photoUrl ?? null,
    memoryDna: input.memoryDna ?? null,
    mode: input.mode ?? "solo",
    dialogue: input.dialogue ?? null,
    duet: input.duet ?? null,
  };

  stories.push(story);
  await saveStories(stories);
  return story;
}

export async function updateStory(
  id: string,
  updates: UpdateStoryInput
): Promise<Story | null> {
  const stories = await ensureDataFile();
  const index = stories.findIndex((s) => s.id === id);
  if (index === -1) return null;

  stories[index] = { ...stories[index], ...updates };
  await saveStories(stories);
  return stories[index];
}

export async function updateStoryAudio(
  id: string,
  audioUrl: string,
  language?: LanguageCode
): Promise<Story | null> {
  const stories = await ensureDataFile();
  const index = stories.findIndex((s) => s.id === id);
  if (index === -1) return null;

  if (language && language !== stories[index].language) {
    const translations = [...(stories[index].translations ?? [])];
    const tIdx = translations.findIndex((t) => t.language === language);
    const entry: StoryTranslation = {
      language,
      enhancedStory:
        translations[tIdx]?.enhancedStory ?? stories[index].enhancedStory,
      audioUrl,
      createdAt: new Date().toISOString(),
    };
    if (tIdx >= 0) translations[tIdx] = entry;
    else translations.push(entry);
    stories[index] = { ...stories[index], translations };
  } else {
    stories[index] = { ...stories[index], audioUrl };
  }

  await saveStories(stories);
  return stories[index];
}

export async function upsertTranslation(
  id: string,
  translation: StoryTranslation
): Promise<Story | null> {
  const stories = await ensureDataFile();
  const index = stories.findIndex((s) => s.id === id);
  if (index === -1) return null;

  const translations = [...(stories[index].translations ?? [])];
  const tIdx = translations.findIndex((t) => t.language === translation.language);
  if (tIdx >= 0) translations[tIdx] = translation;
  else translations.push(translation);

  stories[index] = { ...stories[index], translations };
  await saveStories(stories);
  return stories[index];
}

export async function deleteStory(id: string): Promise<boolean> {
  const stories = await ensureDataFile();
  const filtered = stories.filter((s) => s.id !== id && s.shareSlug !== id);
  if (filtered.length === stories.length) return false;
  await saveStories(filtered);
  return true;
}
