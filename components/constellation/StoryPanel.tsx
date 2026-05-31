"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import { StoryPlayer } from "../StoryPlayer";
import type { Story } from "@/lib/types";

interface StoryPanelProps {
  storyId: string | null;
  onClose: () => void;
}

export function StoryPanel({ storyId, onClose }: StoryPanelProps) {
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!storyId) {
      setStory(null);
      setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`/api/stories/${storyId}`)
      .then(async (r) => {
        if (!r.ok) throw new Error(`Failed: ${r.status}`);
        return r.json();
      })
      .then((d) => {
        if (cancelled) return;
        setStory(d.story ?? d);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message || "Failed to load story");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [storyId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <AnimatePresence>
      {storyId && (
        <motion.aside
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 220 }}
          className="fixed right-0 top-0 z-40 flex h-full w-full max-w-md flex-col border-l border-cinema-text/10 bg-cinema-bg/97 shadow-2xl backdrop-blur-xl"
        >
          <header className="flex items-center justify-between border-b border-cinema-text/10 px-6 py-4">
            <h2 className="film-label">Memory</h2>
            <div className="flex items-center gap-1">
              {story && (
                <Link href={`/story/${story.id}`} aria-label="Open full story">
                  <Button variant="ghost" size="sm" className="gap-1 text-xs">
                    <ExternalLink className="h-3 w-3" />
                    Open
                  </Button>
                </Link>
              )}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close panel"
                className="rounded-full p-2 text-cinema-muted hover:bg-cinema-text/10 hover:text-cinema-text"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </header>
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {loading && (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-cinema-accent-light" />
              </div>
            )}
            {error && (
              <p className="text-sm text-red-800">{error}</p>
            )}
            {story && !loading && (
              <StoryPlayer story={story} autoPlay={false} />
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
