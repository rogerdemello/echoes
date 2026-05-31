"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import {
  pageToSentenceStart,
  sentenceIndexToPage,
  splitStoryPages,
} from "@/lib/story-pages";

interface StoryTimelineProps {
  narration: string;
  currentSentenceIndex: number;
  isPlaying: boolean;
  onSeekToPage: (pageIndex: number) => void;
}

export function StoryTimeline({
  narration,
  currentSentenceIndex,
  isPlaying,
  onSeekToPage,
}: StoryTimelineProps) {
  const pages = useMemo(() => splitStoryPages(narration), [narration]);
  const activePage = sentenceIndexToPage(pages, currentSentenceIndex);

  if (pages.length <= 1) return null;

  const goPrev = () => onSeekToPage(Math.max(0, activePage - 1));
  const goNext = () => onSeekToPage(Math.min(pages.length - 1, activePage + 1));

  return (
    <section className="rounded-lg glass p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-cinema-accent" />
          <div>
            <h2 className="font-display text-xl font-medium">Storybook</h2>
            <p className="text-xs text-cinema-muted">
              {pages.length} chapters · tap to jump in narration
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={goPrev}
            disabled={activePage === 0}
            aria-label="Previous chapter"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={goNext}
            disabled={activePage >= pages.length - 1}
            aria-label="Next chapter"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mt-4 flex gap-1">
        {pages.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onSeekToPage(i)}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i === activePage
                ? "bg-cinema-accent"
                : i < activePage
                  ? "bg-cinema-accent/40"
                  : "bg-cinema-text/10"
            }`}
            aria-label={`Chapter ${i + 1}`}
          />
        ))}
      </div>

      <div className="mt-6 flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory">
        {pages.map((page, i) => {
          const isActive = i === activePage;
          return (
            <motion.button
              key={i}
              type="button"
              onClick={() => onSeekToPage(i)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`min-w-[260px] max-w-[300px] shrink-0 snap-center rounded-2xl border p-5 text-left transition-all ${
                isActive
                  ? "border-cinema-accent bg-cinema-accent/10 ring-1 ring-cinema-accent/40"
                  : "border-cinema-text/10 bg-cinema-text/[0.03] hover:border-cinema-accent/30"
              }`}
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-cinema-accent-light">
                Chapter {i + 1}
                {isActive && isPlaying && (
                  <span className="ml-2 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-cinema-accent-light" />
                )}
              </span>
              <p className="mt-3 line-clamp-5 text-sm leading-relaxed text-cinema-text">
                {page}
              </p>
            </motion.button>
          );
        })}
      </div>

      <p className="mt-4 text-center text-xs text-cinema-muted">
        Playing chapter {activePage + 1} of {pages.length}
      </p>
    </section>
  );
}

export { pageToSentenceStart };
