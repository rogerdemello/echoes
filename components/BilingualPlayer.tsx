"use client";

import { useRef, useState } from "react";
import { Pause, Play, Globe } from "lucide-react";
import { Button } from "./ui/button";
import { LANGUAGES } from "@/lib/constants";
import type { Story } from "@/lib/types";

interface BilingualPlayerProps {
  story: Story;
}

export function BilingualPlayer({ story }: BilingualPlayerProps) {
  const primaryRef = useRef<HTMLAudioElement>(null);
  const secondaryRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState<"primary" | "secondary" | null>(null);

  const translation = story.translations?.find((t) => t.audioUrl);
  if (!translation?.audioUrl) return null;

  const primaryLang = LANGUAGES.find((l) => l.id === story.language);
  const secondaryLang = LANGUAGES.find((l) => l.id === translation.language);

  const stopAll = () => {
    primaryRef.current?.pause();
    secondaryRef.current?.pause();
    setPlaying(null);
  };

  const toggle = async (side: "primary" | "secondary") => {
    const audio =
      side === "primary" ? primaryRef.current : secondaryRef.current;
    const other = side === "primary" ? secondaryRef.current : primaryRef.current;
    if (!audio) return;

    if (playing === side) {
      audio.pause();
      setPlaying(null);
      return;
    }

    other?.pause();
    await audio.play();
    setPlaying(side);
  };

  return (
    <div className="rounded-2xl glass p-6">
      <div className="flex items-center gap-2 mb-4">
        <Globe className="h-5 w-5 text-cinema-accent-light" />
        <h3 className="font-display text-lg font-semibold">Family mode — side by side</h3>
      </div>
      <p className="text-sm text-cinema-muted mb-6">
        Same memory, two languages. Perfect for sharing across generations.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-white/10 p-4">
          <p className="text-xs font-medium text-cinema-muted mb-2">
            {primaryLang?.label ?? story.language}
          </p>
          <p className="text-sm line-clamp-3 text-cinema-text/80 mb-4">
            {story.enhancedStory.slice(0, 120)}...
          </p>
          {story.audioUrl && (
            <>
              <audio ref={primaryRef} src={story.audioUrl} onEnded={stopAll} />
              <Button
                size="sm"
                onClick={() => toggle("primary")}
                className="gap-2 w-full"
              >
                {playing === "primary" ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4 fill-current" />
                )}
                {playing === "primary" ? "Pause" : "Play"}
              </Button>
            </>
          )}
        </div>

        <div className="rounded-xl border border-cinema-accent/20 bg-cinema-accent/5 p-4">
          <p className="text-xs font-medium text-cinema-accent-light mb-2">
            {secondaryLang?.label ?? translation.language}
          </p>
          <p className="text-sm line-clamp-3 text-cinema-text/80 mb-4">
            {translation.enhancedStory.slice(0, 120)}...
          </p>
          <audio ref={secondaryRef} src={translation.audioUrl} onEnded={stopAll} />
          <Button
            size="sm"
            variant="secondary"
            onClick={() => toggle("secondary")}
            className="gap-2 w-full"
          >
            {playing === "secondary" ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4 fill-current" />
            )}
            {playing === "secondary" ? "Pause" : "Play"}
          </Button>
        </div>
      </div>
    </div>
  );
}
