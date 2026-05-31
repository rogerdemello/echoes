"use client";

import { useState } from "react";
import { Download, FileJson, FileText, ClipboardList, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import type { Story } from "@/lib/types";
import {
  copyDemoScript,
  downloadAudioFile,
  downloadStoryJson,
  downloadStoryText,
  getShareUrl,
} from "@/lib/export-story";

interface ExportPanelProps {
  story: Story;
  activeText?: string;
  audioUrl?: string | null;
  onToast?: (message: string, type?: "success" | "error" | "info") => void;
}

export function ExportPanel({
  story,
  activeText,
  audioUrl,
  onToast,
}: ExportPanelProps) {
  const [downloadingAudio, setDownloadingAudio] = useState(false);
  const shareUrl = getShareUrl(story);
  const narration = activeText ?? story.enhancedStory;
  const audio = audioUrl ?? story.audioUrl;

  const notify = (msg: string, type?: "success" | "error" | "info") => {
    onToast?.(msg, type);
  };

  const handleAudio = async () => {
    if (!audio) {
      notify("No audio to download", "error");
      return;
    }
    setDownloadingAudio(true);
    try {
      await downloadAudioFile(story, audio);
      notify("Audio downloaded", "success");
    } catch (err) {
      notify(err instanceof Error ? err.message : "Download failed", "error");
    } finally {
      setDownloadingAudio(false);
    }
  };

  const handleCopyScript = async () => {
    try {
      await navigator.clipboard.writeText(copyDemoScript(story, shareUrl));
      notify("Demo script copied for judges", "success");
    } catch {
      notify("Could not copy script", "error");
    }
  };

  return (
    <section className="rounded-lg glass p-6">
      <h2 className="font-display text-xl font-medium">Judge export pack</h2>
      <p className="mt-1 text-sm text-cinema-muted">
        Download assets for offline demos and presentations.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="gap-2"
          onClick={() => {
            downloadStoryText(story, narration);
            notify("Story text downloaded", "success");
          }}
        >
          <FileText className="h-4 w-4" />
          Story (.txt)
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="gap-2"
          onClick={() => {
            downloadStoryJson(story, shareUrl);
            notify("JSON pack downloaded", "success");
          }}
        >
          <FileJson className="h-4 w-4" />
          Pack (.json)
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="gap-2"
          onClick={handleAudio}
          disabled={!audio || downloadingAudio}
        >
          {downloadingAudio ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Audio (.mp3)
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={handleCopyScript}
        >
          <ClipboardList className="h-4 w-4" />
          Copy demo script
        </Button>
      </div>
    </section>
  );
}
