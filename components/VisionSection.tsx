"use client";

import { motion } from "framer-motion";

export function VisionSection() {
  return (
    <section className="relative overflow-hidden py-20">
      <div className="absolute inset-0 bg-gradient-to-r from-cinema-accent/5 via-transparent to-cinema-accent/5" />
      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-sm font-medium uppercase tracking-[0.2em] text-cinema-accent-light"
        >
          The big idea
        </motion.p>
        <motion.blockquote
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mt-6 font-display text-2xl font-semibold leading-relaxed md:text-3xl"
        >
          People store photos, videos, and chats — but they do not preserve
          emotions, atmosphere, or human warmth.
        </motion.blockquote>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-6 text-lg text-cinema-muted"
        >
          Echoes converts ordinary memories into narrated cinematic experiences,
          multilingual emotional stories, and voice-preserved digital legacies.
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-10 font-display text-xl italic text-cinema-accent-light"
        >
          &ldquo;Make your life sound like a Netflix documentary.&rdquo;
        </motion.p>
      </div>
    </section>
  );
}
