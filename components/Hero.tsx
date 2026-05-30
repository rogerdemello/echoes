"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Play, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { ParticleField } from "./ParticleField";

export function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden pt-24">
      <ParticleField />
      <motion.div
        className="absolute inset-0 bg-hero-glow"
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 6, repeat: Infinity }}
      />
      <div className="relative mx-auto flex max-w-6xl flex-col items-center px-6 pb-24 pt-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm text-cinema-muted"
        >
          <Sparkles className="h-4 w-4 text-cinema-accent-light" />
          Digital memory preservation · Powered by Murf AI
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display text-5xl font-bold leading-tight tracking-tight md:text-7xl"
        >
          Your memories
          <br />
          <span className="text-gradient">deserve a voice.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 max-w-2xl text-lg text-cinema-muted md:text-xl"
        >
          Transform moments into cinematic narrated stories using emotionally
          expressive AI voices. Preserve emotions, not just memories.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <Link href="/create">
            <Button size="lg" className="gap-2">
              <Play className="h-4 w-4 fill-current" />
              Create Your Story
            </Button>
          </Link>
          <Link href="/demo">
            <Button variant="outline" size="lg">
              Live demo for judges
            </Button>
          </Link>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 max-w-2xl font-display text-lg text-cinema-accent-light/90"
        >
          &ldquo;Photos preserve how moments looked. Echoes preserves how they
          felt.&rdquo;
        </motion.p>

        <motion.blockquote
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.85 }}
          className="mt-8 max-w-xl rounded-2xl glass p-6 text-left text-sm italic text-cinema-muted"
        >
          &ldquo;The last conversation I had with my grandfather was during a train
          ride home...&rdquo;
          <footer className="mt-3 not-italic text-cinema-accent-light">
            → Cinematic Murf narration in seconds
          </footer>
        </motion.blockquote>
      </div>
    </section>
  );
}
