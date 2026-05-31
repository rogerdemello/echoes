"use client";

import { motion } from "framer-motion";

export function VisionSection() {
  return (
    <section className="relative overflow-hidden border-t border-cinema-accent/10 py-28 md:py-36">
      <div className="absolute inset-0 bg-hero-glow opacity-40" />
      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <motion.span
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="film-label flex items-center justify-center gap-3"
        >
          <span className="text-cinema-accent">CH. 01</span>
          <span className="h-px w-8 bg-cinema-accent/40" />
          The Premise
        </motion.span>

        {/* oversized opening quote mark */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 0.12, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="pointer-events-none mx-auto -mb-10 font-display text-[10rem] leading-none text-cinema-accent md:text-[14rem]"
          aria-hidden
        >
          &ldquo;
        </motion.div>

        <motion.blockquote
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-3xl font-light leading-[1.25] tracking-tight md:text-[2.7rem]"
        >
          People keep photos, videos, and chats — but none of them preserve the{" "}
          <span className="italic text-cinema-accent-light">emotion</span>, the{" "}
          <span className="italic text-cinema-accent-light">atmosphere</span>, the
          warmth of being there.
        </motion.blockquote>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="dropcap mx-auto mt-10 max-w-xl text-left text-lg leading-relaxed text-cinema-muted"
        >
          Echoes turns ordinary memories into narrated cinematic experiences —
          multilingual, emotional, voice-preserved legacies.
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="film-label mt-12 justify-center"
        >
          Make your life sound like a documentary
        </motion.p>
      </div>
    </section>
  );
}
