"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Sparkles, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { JUDGE_DEMO_DUET, JUDGE_DEMO_MEMORY } from "@/lib/constants";

const DEMO_PAYLOAD = {
  originalText: JUDGE_DEMO_MEMORY,
  storyStyle: "documentary" as const,
  emotion: "nostalgic" as const,
  language: "en" as const,
  narrator: "documentary" as const,
  autoDetectEmotion: true,
};

const DUET_PAYLOAD = {
  originalText: JUDGE_DEMO_DUET.memory,
  storyStyle: "documentary" as const,
  emotion: JUDGE_DEMO_DUET.emotion,
  language: JUDGE_DEMO_DUET.language,
  narrator: "documentary" as const,
  autoDetectEmotion: true,
  mode: "duet" as const,
  duet: JUDGE_DEMO_DUET.duet,
};

const STEPS = [
  "Reading the memory...",
  "Enhancing with cinematic AI...",
  "Detecting emotional tone...",
  "Mapping voice style to nostalgia...",
  "Synthesizing Murf documentary voice...",
  "Opening cinematic playback...",
];

const DUET_STEPS = [
  "Reading the memory...",
  "Writing the conversation across time...",
  "Voicing you with Murf...",
  "Voicing your grandfather with Murf...",
  "Stitching the two voices together...",
  "Opening cinematic playback...",
];

export default function DemoPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState<null | "solo" | "duet">(null);
  const isDuet = started === "duet";
  const steps = isDuet ? DUET_STEPS : STEPS;

  useEffect(() => {
    if (!started) return;

    const interval = setInterval(() => {
      setStep((s) => Math.min(s + 1, steps.length - 1));
    }, 2200);

    fetch("/api/stories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(isDuet ? DUET_PAYLOAD : DEMO_PAYLOAD),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Demo failed");
        router.push(`/story/${data.story.id}?autoplay=1`);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Demo failed");
        clearInterval(interval);
      });

    return () => clearInterval(interval);
  }, [started, isDuet, steps.length, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 pt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg text-center"
      >
        <Sparkles className="mx-auto h-12 w-12 text-cinema-accent-light" />

        <p className="mt-8 font-display text-lg italic text-cinema-accent-light">
          &ldquo;Photos preserve how moments looked. Echoes preserves how they
          felt.&rdquo;
        </p>

        <h1 className="mt-8 font-display text-3xl font-bold">Judge demo</h1>
        <p className="mt-3 text-cinema-muted">
          One click runs the full pipeline. Let the narration breathe — the
          silence after playback is your strongest moment.
        </p>

        <blockquote className="mt-6 rounded-xl glass p-4 text-left text-sm italic text-cinema-muted">
          &ldquo;{JUDGE_DEMO_MEMORY}&rdquo;
        </blockquote>

        {!started && !error && (
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button
              size="lg"
              className="gap-2"
              onClick={() => setStarted("solo")}
            >
              <Sparkles className="h-5 w-5" />
              Run live demo
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="gap-2"
              onClick={() => setStarted("duet")}
            >
              <Users className="h-5 w-5" />
              Run dual-voice demo
            </Button>
          </div>
        )}

        {!started && !error && (
          <p className="mt-4 text-xs text-cinema-muted">
            Dual-voice turns this memory into a conversation — you and your
            grandfather, in two distinct Murf voices.
          </p>
        )}

        {started && !error && (
          <div className="mt-10 rounded-2xl glass p-8">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-cinema-accent-light" />
            <p className="mt-4 font-medium">{steps[step]}</p>
          </div>
        )}

        {error && (
          <div className="mt-8 rounded-xl border border-red-800/20 bg-red-800/[0.06] p-4 text-sm text-red-800">
            {error}
            <Link href="/create" className="mt-4 block text-cinema-accent-light">
              Try manual create instead
            </Link>
          </div>
        )}

        <Link
          href="/"
          className="mt-8 inline-block text-sm text-cinema-muted hover:text-cinema-text"
        >
          ← Back to home
        </Link>
      </motion.div>
    </div>
  );
}
