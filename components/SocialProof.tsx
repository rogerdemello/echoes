"use client";

import { motion } from "framer-motion";
import { Volume2 } from "lucide-react";

const snippets = [
  {
    title: "Summer evenings",
    emotion: "Nostalgic",
    line: "The air smelled of dust and mango trees...",
    bars: [40, 65, 45, 80, 55, 70, 50],
  },
  {
    title: "The train ride home",
    emotion: "Tender",
    line: "His voice still echoes in the rhythm of the rails...",
    bars: [30, 50, 70, 45, 60, 40, 75],
  },
  {
    title: "Before sunrise",
    emotion: "Warm",
    line: "She was already awake when the house was still quiet...",
    bars: [55, 35, 60, 50, 65, 45, 55],
  },
];

export function SocialProof() {
  return (
    <section className="border-t border-white/5 bg-cinema-surface/30 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="font-display text-center text-3xl font-bold">
          Stories that feel alive
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-cinema-muted">
          Generated Echoes with Murf narration, ambient atmosphere, and cinematic
          pacing.
        </p>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {snippets.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl glass p-6"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{card.title}</span>
                <span className="text-xs text-cinema-accent-light">
                  {card.emotion}
                </span>
              </div>
              <p className="mt-3 line-clamp-2 text-sm italic text-cinema-muted">
                &ldquo;{card.line}&rdquo;
              </p>
              <div className="mt-4 flex h-10 items-end justify-center gap-0.5">
                {card.bars.map((h, j) => (
                  <div
                    key={j}
                    className="w-1 rounded-full bg-cinema-accent/50"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
              <p className="mt-3 flex items-center justify-center gap-1 text-xs text-cinema-muted">
                <Volume2 className="h-3 w-3" />
                Murf AI narration
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
