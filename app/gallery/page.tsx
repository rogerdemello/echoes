"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, Play, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EMOTIONS, STORY_STYLES } from "@/lib/constants";

interface StorySummary {
  id: string;
  shareSlug: string;
  title: string;
  emotion: string;
  storyStyle: string;
  language: string;
  audioUrl: string | null;
  createdAt: string;
  hasTranslations: boolean;
  photoUrl?: string | null;
}

export default function GalleryPage() {
  const [stories, setStories] = useState<StorySummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stories")
      .then((r) => r.json())
      .then((d) => setStories(d.stories ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-6 pb-24 pt-28">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Your Echoes</h1>
          <p className="mt-2 text-cinema-muted">
            Every memory you&apos;ve transformed into a cinematic story.
          </p>
        </div>
        <Link href="/create">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Echo
          </Button>
        </Link>
      </div>

      {loading ? (
        <p className="mt-16 text-center text-cinema-muted animate-pulse">
          Loading memories...
        </p>
      ) : stories.length === 0 ? (
        <div className="mt-16 rounded-3xl glass p-12 text-center">
          <p className="text-cinema-muted">No stories yet. Create your first Echo.</p>
          <Link href="/create">
            <Button className="mt-6">Create Your Story</Button>
          </Link>
        </div>
      ) : (
        <div className="mt-10 space-y-4">
          {stories.map((story, i) => {
            const emotion = EMOTIONS.find((e) => e.id === story.emotion)?.label;
            const style = STORY_STYLES.find((s) => s.id === story.storyStyle)?.label;
            return (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  href={`/story/${story.id}`}
                  className="block overflow-hidden rounded-2xl glass transition-colors hover:border-cinema-accent/30 hover:bg-white/5"
                >
                  {story.photoUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={story.photoUrl}
                      alt=""
                      className="h-32 w-full object-cover opacity-80"
                    />
                  )}
                  <div className="flex items-start justify-between gap-4 p-6">
                    <div>
                      <h2 className="font-display text-lg font-semibold">
                        {story.title}
                      </h2>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-cinema-muted">
                        <span>{style}</span>
                        <span>·</span>
                        <span>{emotion}</span>
                        {story.hasTranslations && (
                          <>
                            <span>·</span>
                            <span className="text-cinema-accent-light">Multilingual</span>
                          </>
                        )}
                      </div>
                      <p className="mt-2 flex items-center gap-1 text-xs text-cinema-muted">
                        <Clock className="h-3 w-3" />
                        {new Date(story.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    {story.audioUrl && (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cinema-accent/20">
                        <Play className="h-4 w-4 text-cinema-accent-light fill-current" />
                      </div>
                    )}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
