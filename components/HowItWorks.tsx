"use client";

import { motion } from "framer-motion";

const steps = [
  {
    step: "01",
    title: "Input a memory",
    desc: "Text, voice note, journal entry, or childhood story.",
  },
  {
    step: "02",
    title: "AI story enhancement",
    desc: "Cinematic narration with sensory detail and emotional pacing.",
  },
  {
    step: "03",
    title: "Emotion intelligence",
    desc: "Nostalgia, joy, grief, hope — shapes voice, music, and visuals.",
  },
  {
    step: "04",
    title: "Murf voice generation",
    desc: "The heart of Echoes — expressive, multilingual cinematic voice.",
  },
  {
    step: "05",
    title: "Cinematic playback",
    desc: "Documentary reel with subtitles, ambient music, and shareable link.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-t border-white/5 bg-cinema-surface/50 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="font-display text-center text-3xl font-bold">
          The Echoes experience
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-cinema-muted">
          From ordinary memory to narrated cinematic experience in five steps.
        </p>
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {steps.map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="text-center lg:text-left"
            >
              <span className="font-display text-4xl font-bold text-cinema-accent/40">
                {item.step}
              </span>
              <h3 className="mt-2 font-display text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-cinema-muted">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
