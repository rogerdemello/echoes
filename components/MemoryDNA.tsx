"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Dna, Sparkles } from "lucide-react";
import type { Story } from "@/lib/types";
import type { MemoryDNA as MemoryDNAResult } from "@/lib/memory-dna";

interface MemoryDNAProps {
  story: Story;
}

// Session caches so the fallback Gemini call runs at most once per story —
// survives StrictMode double-mounts and re-navigation.
const dnaCache = new Map<string, MemoryDNAResult | null>();
const dnaInflight = new Map<string, Promise<MemoryDNAResult | null>>();

export function MemoryDNA({ story }: MemoryDNAProps) {
  // Most stories already carry DNA computed at creation — use it instantly.
  const cached = story.memoryDna ?? dnaCache.get(story.id) ?? null;
  const [dna, setDna] = useState<MemoryDNAResult | null>(cached);
  const [loading, setLoading] = useState(!cached);

  useEffect(() => {
    // Already have it (persisted on the story, or cached this session).
    if (story.memoryDna) {
      setDna(story.memoryDna);
      setLoading(false);
      return;
    }
    if (dnaCache.has(story.id)) {
      setDna(dnaCache.get(story.id) ?? null);
      setLoading(false);
      return;
    }

    // Legacy story without DNA — compute once, dedupe concurrent callers.
    let cancelled = false;
    setLoading(true);
    let request = dnaInflight.get(story.id);
    if (!request) {
      request = fetch("/api/memory-dna", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalText: story.originalText,
          enhancedStory: story.enhancedStory,
          emotion: story.detectedEmotion ?? story.emotion,
        }),
      })
        .then((r) => r.json())
        .then((d) => (d.dna ?? null) as MemoryDNAResult | null)
        .catch(() => null);
      dnaInflight.set(story.id, request);
    }

    request.then((result) => {
      dnaCache.set(story.id, result);
      dnaInflight.delete(story.id);
      if (!cancelled) {
        setDna(result);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [story.id, story.memoryDna, story.originalText, story.enhancedStory, story.emotion, story.detectedEmotion]);

  if (loading) {
    return (
      <section className="rounded-lg glass p-6 animate-pulse">
        <div className="h-5 w-40 rounded bg-cinema-text/10" />
        <div className="mt-4 h-4 w-full rounded bg-cinema-text/10" />
        <div className="mt-2 h-4 w-2/3 rounded bg-cinema-text/10" />
      </section>
    );
  }

  if (!dna) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-cinema-accent/20 bg-gradient-to-br from-cinema-accent/[0.06] to-transparent p-6"
    >
      <div className="flex items-center gap-2">
        <Dna className="h-5 w-5 text-cinema-accent" />
        <h2 className="font-display text-xl font-medium">Memory DNA</h2>
        <Sparkles className="h-4 w-4 text-cinema-accent/60" />
      </div>
      <p className="mt-4 text-lg font-medium leading-relaxed text-cinema-text">
        {dna.insight}
      </p>
      <p className="mt-2 text-sm text-cinema-muted">{dna.emotionalSignature}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {dna.themes.map((theme) => (
          <span
            key={theme}
            className="rounded-full glass px-3 py-1 text-xs capitalize text-cinema-accent-light"
          >
            {theme}
          </span>
        ))}
      </div>
    </motion.section>
  );
}
