"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Dna, Sparkles } from "lucide-react";
import type { Emotion, Story } from "@/lib/types";
import type { MemoryDNA as MemoryDNAResult } from "@/lib/memory-dna";

interface MemoryDNAProps {
  story: Story;
}

export function MemoryDNA({ story }: MemoryDNAProps) {
  const [dna, setDna] = useState<MemoryDNAResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/memory-dna", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        originalText: story.originalText,
        enhancedStory: story.enhancedStory,
        emotion: story.detectedEmotion ?? story.emotion,
      }),
    })
      .then((r) => r.json())
      .then((d) => setDna(d.dna ?? null))
      .catch(() => setDna(null))
      .finally(() => setLoading(false));
  }, [story.id, story.originalText, story.enhancedStory, story.emotion, story.detectedEmotion]);

  if (loading) {
    return (
      <section className="rounded-3xl glass p-6 animate-pulse">
        <div className="h-5 w-40 rounded bg-white/10" />
        <div className="mt-4 h-4 w-full rounded bg-white/10" />
        <div className="mt-2 h-4 w-2/3 rounded bg-white/10" />
      </section>
    );
  }

  if (!dna) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-cinema-accent/20 bg-gradient-to-br from-cinema-accent/10 to-transparent p-6"
    >
      <div className="flex items-center gap-2">
        <Dna className="h-5 w-5 text-cinema-accent-light" />
        <h2 className="font-display text-lg font-semibold">Memory DNA</h2>
        <Sparkles className="h-4 w-4 text-cinema-accent-light/60" />
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
