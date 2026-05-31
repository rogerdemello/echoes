"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Copy, Trash2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { StoryPlayer } from "@/components/StoryPlayer";
import { DuetPlayer } from "@/components/DuetPlayer";
import { VoiceControls } from "@/components/VoiceControls";
import { MultilingualPanel } from "@/components/MultilingualPanel";
import { BilingualPlayer } from "@/components/BilingualPlayer";
import { StorySkeleton } from "@/components/StorySkeleton";
import { StoryTimeline } from "@/components/StoryTimeline";
import { ExportPanel } from "@/components/ExportPanel";
import { MemoryDNA } from "@/components/MemoryDNA";
import { useToast } from "@/components/ToastProvider";
import { pageToSentenceStart, splitStoryPages } from "@/lib/story-pages";
import type { LanguageCode, Story } from "@/lib/types";
import { Button } from "@/components/ui/button";

export default function StoryPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const autoplay = searchParams.get("autoplay") === "1";

  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeAudio, setActiveAudio] = useState<string | null>(null);
  const [activeText, setActiveText] = useState<string | null>(null);
  const [currentLine, setCurrentLine] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [seekToken, setSeekToken] = useState(0);
  const [seekToLine, setSeekToLine] = useState(0);

  const fetchStory = useCallback(async () => {
    try {
      const res = await fetch(`/api/stories/${params.id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStory(data.story);
      setActiveAudio(data.story.audioUrl);
      setActiveText(data.story.enhancedStory);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchStory();
  }, [fetchStory]);

  const regenerateVoice = async () => {
    if (!story) return;
    setIsRegenerating(true);
    try {
      const res = await fetch("/api/generate-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storyId: story.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStory(data.story);
      setActiveAudio(data.story.audioUrl);
      setActiveText(data.story.enhancedStory);
      toast("Voice generated!", "success");
    } catch (err) {
      toast(
        err instanceof Error ? err.message : "Voice generation failed",
        "error"
      );
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleStoryUpdated = (updated: Story) => {
    setStory(updated);
    setActiveAudio(updated.audioUrl);
    setActiveText(updated.enhancedStory);
    toast("Story updated", "success");
  };

  const playTranslation = (audioUrl: string, language: LanguageCode) => {
    const translation = story?.translations?.find((t) => t.language === language);
    setActiveAudio(audioUrl);
    setActiveText(translation?.enhancedStory ?? story?.enhancedStory ?? null);
  };

  const deleteStory = async () => {
    if (!story || !confirm("Delete this Echo permanently?")) return;
    const res = await fetch(`/api/stories/${story.id}`, { method: "DELETE" });
    if (res.ok) router.push("/gallery");
    else toast("Failed to delete", "error");
  };

  const narration = activeText ?? story?.enhancedStory ?? "";
  const isDuet = story?.mode === "duet" && (story?.dialogue?.length ?? 0) > 0;

  const handleSeekToPage = (pageIndex: number) => {
    if (!story) return;
    const pages = splitStoryPages(narration);
    const line = pageToSentenceStart(pages, pageIndex);
    setSeekToLine(line);
    setSeekToken((t) => t + 1);
  };

  const copyShareLink = async () => {
    if (!story) return;
    const url = `${window.location.origin}/share/${story.shareSlug}`;
    try {
      await navigator.clipboard.writeText(url);
      toast("Share link copied!", "success");
    } catch {
      toast("Could not copy link", "error");
    }
  };

  if (loading) return <StorySkeleton />;

  if (error || !story) {
    return (
      <div className="mx-auto max-w-lg px-6 pt-28 text-center">
        <p className="text-red-800">{error || "Story not found"}</p>
        <Link
          href="/create"
          className="mt-4 inline-block text-cinema-accent-light hover:underline"
        >
          Create a new story
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 pb-24 pt-28">
      <div className="mb-8 flex items-center justify-between gap-4">
        <Link
          href="/create"
          className="inline-flex items-center gap-2 text-sm text-cinema-muted hover:text-cinema-text"
        >
          <ArrowLeft className="h-4 w-4" />
          Create another
        </Link>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={copyShareLink}
            className="gap-1 text-cinema-muted"
          >
            <Copy className="h-4 w-4" />
            Copy link
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={deleteStory}
            className="gap-1 text-red-800"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {isDuet ? (
        <DuetPlayer
          story={story}
          audioUrl={activeAudio}
          autoPlay={autoplay && Boolean(activeAudio)}
          onRegenerateVoice={!activeAudio ? regenerateVoice : undefined}
          isRegenerating={isRegenerating}
          onToast={toast}
        />
      ) : (
        <StoryPlayer
          story={story}
          audioUrl={activeAudio}
          displayText={activeText ?? undefined}
          autoPlay={autoplay && Boolean(activeAudio)}
          onRegenerateVoice={!activeAudio ? regenerateVoice : undefined}
          isRegenerating={isRegenerating}
          onToast={toast}
          onLineChange={setCurrentLine}
          onPlayingChange={setIsPlaying}
          seekToken={seekToken}
          seekToLine={seekToLine}
        />
      )}

      <div className="mt-6 grid gap-6">
        <MemoryDNA story={story} />
        {!isDuet && (
          <StoryTimeline
            narration={narration}
            currentSentenceIndex={currentLine}
            isPlaying={isPlaying}
            onSeekToPage={handleSeekToPage}
          />
        )}
        <ExportPanel
          story={story}
          activeText={activeText ?? undefined}
          audioUrl={activeAudio}
          onToast={toast}
        />
        {!isDuet && (
          <>
            <BilingualPlayer story={story} />
            <VoiceControls story={story} onUpdated={handleStoryUpdated} />
            <MultilingualPanel
              story={story}
              onUpdated={handleStoryUpdated}
              onPlayTranslation={playTranslation}
            />
          </>
        )}
      </div>

      <details className="mt-8 rounded-2xl glass p-6">
        <summary className="cursor-pointer text-sm font-medium text-cinema-muted">
          Original memory
        </summary>
        <p className="mt-4 text-sm leading-relaxed text-cinema-muted">
          {story.originalText}
        </p>
      </details>

      <details className="mt-4 rounded-2xl glass p-6">
        <summary className="cursor-pointer text-sm font-medium text-cinema-muted">
          Enhanced narration
        </summary>
        <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed">
          {story.enhancedStory}
        </p>
      </details>
    </div>
  );
}
