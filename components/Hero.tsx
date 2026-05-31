"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { Button } from "./ui/button";

const rise = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: 0.08 * i, ease: [0.22, 1, 0.36, 1] },
  }),
};

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-hero-glow" />

      <div className="relative mx-auto flex min-h-[92vh] max-w-4xl flex-col items-center justify-center px-6 py-32 text-center">
        <motion.p
          custom={0}
          variants={rise}
          initial="hidden"
          animate="show"
          className="film-label justify-center"
        >
          Echoes · An Archive of Feeling · Vol. I
        </motion.p>

        <motion.h1
          custom={1}
          variants={rise}
          initial="hidden"
          animate="show"
          className="mt-8 font-display text-5xl font-medium leading-[1.06] tracking-[-0.01em] md:text-7xl"
        >
          Your memories
          <br />
          deserve <span className="italic text-cinema-accent-light">a voice.</span>
        </motion.h1>

        <motion.p
          custom={2}
          variants={rise}
          initial="hidden"
          animate="show"
          className="mt-8 max-w-xl text-lg leading-relaxed text-cinema-muted md:text-xl"
        >
          Echoes turns an ordinary memory into a narrated, cinematic story in an
          emotionally expressive voice. We preserve not just how a moment looked —
          but how it felt.
        </motion.p>

        <motion.div
          custom={3}
          variants={rise}
          initial="hidden"
          animate="show"
          className="mt-11 flex flex-wrap items-center justify-center gap-4"
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

        {/* polaroid quote — a photo resting in the album */}
        <motion.figure
          initial={{ opacity: 0, y: 20, rotate: -3 }}
          animate={{ opacity: 1, y: 0, rotate: -1.6 }}
          transition={{ delay: 0.5, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="polaroid tilt-l mt-20 max-w-sm"
        >
          <div className="flex aspect-[4/3] items-center justify-center bg-cinema-surface-2 px-6 text-center">
            <p className="font-display text-lg italic leading-relaxed text-cinema-text/80">
              &ldquo;The last conversation I had with my grandfather was during a
              train ride home…&rdquo;
            </p>
          </div>
          <figcaption className="mt-4 text-center font-mono text-[0.65rem] uppercase tracking-[0.18em] text-cinema-muted">
            → Narrated in seconds
          </figcaption>
        </motion.figure>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.85, duration: 0.6 }}
          className="mt-16 max-w-md font-display text-base italic text-cinema-muted"
        >
          &ldquo;Photos preserve how moments looked. Echoes preserves how they
          felt.&rdquo;
        </motion.p>
      </div>
    </section>
  );
}
