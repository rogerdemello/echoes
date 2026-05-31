"use client";

import { motion } from "framer-motion";
import { Volume2 } from "lucide-react";
import { ChapterHeading } from "./ChapterHeading";

const snippets = [
  {
    title: "Summer evenings",
    emotion: "Nostalgic",
    timecode: "00:42",
    line: "The air smelled of dust and mango trees...",
    bars: [40, 65, 45, 80, 55, 70, 50, 62, 38, 72],
  },
  {
    title: "The train ride home",
    emotion: "Tender",
    timecode: "01:08",
    line: "His voice still echoes in the rhythm of the rails...",
    bars: [30, 50, 70, 45, 60, 40, 75, 52, 66, 44],
  },
  {
    title: "Before sunrise",
    emotion: "Warm",
    timecode: "00:57",
    line: "She was already awake when the house was still quiet...",
    bars: [55, 35, 60, 50, 65, 45, 55, 70, 40, 58],
  },
];

export function SocialProof() {
  return (
    <section className="border-t border-cinema-accent/10 py-28">
      <div className="mx-auto max-w-6xl px-6">
        <ChapterHeading
          chapter="CH. 03"
          kicker="Selected Scenes"
          title="Stories that feel alive"
          subtitle="Generated Echoes with Murf narration, ambient atmosphere, and cinematic pacing."
        />

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {snippets.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.5 }}
              className="group overflow-hidden rounded-lg glass-warm transition-colors hover:border-cinema-accent/40"
            >
              {/* archival header strip */}
              <div className="flex items-center justify-between border-b border-cinema-text/10 bg-cinema-surface-2 px-5 py-2.5">
                <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-cinema-accent-light">
                  Scene {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-mono text-[0.65rem] tracking-widest text-cinema-muted">
                  {card.timecode}
                </span>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between">
                  <span className="font-display text-lg">{card.title}</span>
                  <span className="rounded-full border border-cinema-accent/20 px-2.5 py-0.5 text-[0.65rem] uppercase tracking-wider text-cinema-accent-light">
                    {card.emotion}
                  </span>
                </div>
                <p className="mt-4 line-clamp-2 font-display text-sm italic leading-relaxed text-cinema-muted">
                  &ldquo;{card.line}&rdquo;
                </p>

                {/* waveform */}
                <div className="mt-6 flex h-12 items-end justify-center gap-[3px]">
                  {card.bars.map((h, j) => (
                    <div
                      key={j}
                      className="w-1 rounded-full bg-gradient-to-t from-cinema-accent/30 to-cinema-accent/70 transition-all duration-300 group-hover:from-cinema-accent/50 group-hover:to-cinema-accent-light"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
                <p className="mt-4 flex items-center justify-center gap-1.5 font-mono text-[0.65rem] uppercase tracking-[0.15em] text-cinema-muted">
                  <Volume2 className="h-3 w-3" />
                  Murf AI narration
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
