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
    <section className="border-t border-white/5 bg-cinema-surface/30 py-16">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-end justify-between"
        >
          <div>
            <h2 className="font-display text-2xl font-bold">Recent Echoes</h2>
            <p className="mt-1 text-sm text-cinema-muted">
              Pick up where you left off
            </p>
          </div>
          <Link
            href="/gallery"
            className="flex items-center gap-1 text-sm text-cinema-accent-light hover:underline"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {stories.map((story, i) => {
            const emotion = EMOTIONS.find((e) => e.id === story.emotion)?.label;
            const style = STORY_STYLES.find((s) => s.id === story.storyStyle)?.label;
            return (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <Link
                  href={`/story/${story.id}`}
                  className="group block rounded-2xl glass p-5 transition-colors hover:border-cinema-accent/40"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-medium line-clamp-2 group-hover:text-cinema-accent-light">
                      {story.title}
                    </h3>
                    {story.audioUrl && (
                      <Play className="h-4 w-4 shrink-0 text-cinema-accent-light opacity-60 group-hover:opacity-100" />
                    )}
                  </div>
                  <p className="mt-2 text-xs text-cinema-muted">
                    {style} · {emotion}
                  </p>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
