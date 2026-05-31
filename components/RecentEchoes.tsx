"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { EMOTIONS, STORY_STYLES } from "@/lib/constants";

interface StorySummary {
  id: string;
  title: string;
  emotion: string;
  storyStyle: string;
  audioUrl: string | null;
}

export function RecentEchoes() {
  const [stories, setStories] = useState<StorySummary[]>([]);

  useEffect(() => {
    fetch("/api/stories")
      .then((r) => r.json())
      .then((d) => setStories((d.stories ?? []).slice(0, 3)))
      .catch(() => setStories([]));
  }, []);

  if (stories.length === 0) return null;

  return (
    <section className="border-t border-cinema-accent/10 bg-cinema-surface/40 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-end justify-between"
        >
          <div>
            <span className="film-label flex items-center gap-3">
              <span className="text-cinema-accent">●</span> From the Archive
            </span>
            <h2 className="mt-4 font-display text-3xl font-light">Recent Echoes</h2>
          </div>
          <Link
            href="/gallery"
            className="group flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.15em] text-cinema-accent-light hover:text-cinema-accent"
          >
            View all
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>

        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {stories.map((story, i) => {
            const emotion = EMOTIONS.find((e) => e.id === story.emotion)?.label;
            const style = STORY_STYLES.find((s) => s.id === story.storyStyle)?.label;
            return (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
              >
                <Link
                  href={`/story/${story.id}`}
                  className="group block overflow-hidden rounded-lg glass-warm transition-colors hover:border-cinema-accent/40"
                >
                  <div className="flex items-center justify-between border-b border-cinema-text/10 bg-cinema-surface-2 px-5 py-2">
                    <span className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-cinema-accent-light">
                      Reel {String(i + 1).padStart(2, "0")}
                    </span>
                    {story.audioUrl && (
                      <Play className="h-3.5 w-3.5 text-cinema-accent-light opacity-60 group-hover:opacity-100" />
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="line-clamp-2 font-display text-lg leading-snug group-hover:text-cinema-accent-light">
                      {story.title}
                    </h3>
                    <p className="mt-3 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-cinema-muted">
                      {style} · {emotion}
                    </p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
