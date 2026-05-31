import type { Story } from "./types";

/**
 * Trigger a browser download for a Blob. The anchor must be in the DOM and the
 * object URL must NOT be revoked synchronously — revoking in the same tick as
 * click() cancels the download before the browser reads it, producing an empty
 * file (this is what broke the MP3 export).
 */
function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  // Defer cleanup so the download has time to start reading the blob.
  setTimeout(() => {
    URL.revokeObjectURL(url);
    a.remove();
  }, 4000);
}

function downloadBlob(filename: string, content: string, mime: string) {
  saveBlob(new Blob([content], { type: mime }), filename);
}

export function getShareUrl(story: Story): string {
  if (typeof window === "undefined") return `/share/${story.shareSlug}`;
  return `${window.location.origin}/share/${story.shareSlug}`;
}

export function downloadStoryText(story: Story, text?: string) {
  const body = text ?? story.enhancedStory;
  const content = `${story.title}\n${"=".repeat(story.title.length)}\n\n${body}\n\n---\nOriginal memory:\n${story.originalText}`;
  downloadBlob(
    `echoes-${story.shareSlug}.txt`,
    content,
    "text/plain;charset=utf-8"
  );
}

export function downloadStoryJson(story: Story, shareUrl: string) {
  const pack = {
    title: story.title,
    shareUrl,
    shareSlug: story.shareSlug,
    emotion: story.emotion,
    storyStyle: story.storyStyle,
    language: story.language,
    audioUrl: story.audioUrl,
    photoUrl: story.photoUrl ?? null,
    originalText: story.originalText,
    enhancedStory: story.enhancedStory,
    translations: story.translations,
    createdAt: story.createdAt,
  };
  downloadBlob(
    `echoes-${story.shareSlug}.json`,
    JSON.stringify(pack, null, 2),
    "application/json"
  );
}

export async function downloadAudioFile(
  story: Story,
  audioUrl: string | null
): Promise<void> {
  if (!audioUrl) throw new Error("No audio available");
  const res = await fetch(audioUrl);
  if (!res.ok) throw new Error("Could not fetch audio");
  const blob = await res.blob();
  if (!blob.size) throw new Error("Audio file is empty");
  saveBlob(blob, `echoes-${story.shareSlug}.mp3`);
}

export function getDemoScript(story: Story, shareUrl: string): string {
  return [
    "ECHOES — Judge demo script",
    "",
    `Title: ${story.title}`,
    `Share: ${shareUrl}`,
    "",
    "1. Play the cinematic narration (Murf AI voice + ambient music).",
    "2. Scroll to Storybook timeline — paragraph-by-paragraph memory journey.",
    story.photoUrl ? "3. Point out the photo Ken Burns backdrop — memory + image." : "",
    "4. Multilingual → Generate Hindi (or another language) for dubbing demo.",
    "",
    'Closing line: "Photos preserve how moments looked. Echoes preserves how they felt."',
  ]
    .filter(Boolean)
    .join("\n");
}

export function copyDemoScript(story: Story, shareUrl: string): string {
  return getDemoScript(story, shareUrl);
}
