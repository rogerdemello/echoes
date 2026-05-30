"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { StoryPlayer } from "@/components/StoryPlayer";
import { DuetPlayer } from "@/components/DuetPlayer";
import type { Story } from "@/lib/types";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SharePage({ params }: { params: { id: string } }) {
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/stories/${params.id}`)
      .then((r) => r.json())
      .then((d) => setStory(d.story))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-cinema-muted">Loading...</p>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-cinema-muted">This Echo could not be found.</p>
        <Link href="/create">
          <Button>Create your own Echo</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cinema-bg">
      <div className="mx-auto max-w-3xl px-6 pb-24 pt-16">
        <div className="mb-8 flex items-center justify-center gap-2 text-cinema-muted">
          <Sparkles className="h-4 w-4 text-cinema-accent-light" />
          <span className="text-sm">Someone shared a memory with you on Echoes</span>
        </div>
        {story.mode === "duet" && (story.dialogue?.length ?? 0) > 0 ? (
          <DuetPlayer story={story} />
        ) : (
          <StoryPlayer story={story} />
        )}
        <div className="mt-8 text-center">
          <Link href="/create">
            <Button variant="outline">Create your own cinematic memory</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
