"use client";

import { motion } from "framer-motion";
import { ChapterHeading } from "./ChapterHeading";

const steps = [
  { step: "01", title: "Input a memory", desc: "Text, voice note, journal entry, or childhood story." },
  { step: "02", title: "Story enhancement", desc: "Cinematic narration with sensory detail and emotional pacing." },
  { step: "03", title: "Emotion intelligence", desc: "Nostalgia, joy, grief, hope — shapes voice, music, and mood." },
  { step: "04", title: "Murf voice", desc: "The heart of Echoes — expressive, multilingual cinematic voice." },
  { step: "05", title: "Cinematic playback", desc: "A documentary reel with ambient score and a shareable link." },
];

// Sprocket-hole bar — the perforated edge of a film strip (warm ink, not pure black).
const sprocket =
  "repeating-linear-gradient(90deg, transparent 0 10px, rgba(42,36,28,0.9) 10px 18px, transparent 18px 28px)";

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-t border-cinema-accent/10 bg-cinema-surface/40 py-28">
      <div className="mx-auto max-w-6xl px-6">
        <ChapterHeading
          chapter="CH. 02"
          kicker="The Process"
          title="From a memory to a reel"
          subtitle="Five frames. One continuous take — ordinary moment to narrated cinematic experience."
        />

        <div className="mt-16 overflow-x-auto pb-2">
          <div className="min-w-[780px]">
            {/* top perforations */}
            <div className="h-4 rounded-t-md bg-cinema-text" style={{ backgroundImage: sprocket }} />

            <div className="grid grid-cols-5 divide-x divide-cinema-text/10 border-x border-cinema-text/10 bg-cinema-surface">
              {steps.map((item, i) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                  className="group relative px-5 py-8 transition-colors hover:bg-cinema-accent/[0.04]"
                >
                  <span className="font-mono text-xs tracking-[0.2em] text-cinema-accent/60">
                    FRAME {item.step}
                  </span>
                  <h3 className="mt-4 font-display text-lg font-medium leading-snug">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-cinema-muted">
                    {item.desc}
                  </p>
                  {/* gold scrub-line that fills on hover */}
                  <span className="absolute bottom-0 left-0 h-px w-0 bg-cinema-accent transition-all duration-500 group-hover:w-full" />
                </motion.div>
              ))}
            </div>

            {/* bottom perforations */}
            <div className="h-4 rounded-b-md bg-cinema-text" style={{ backgroundImage: sprocket }} />
          </div>
        </div>
      </div>
    </section>
  );
}
