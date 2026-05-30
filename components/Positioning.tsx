"use client";

import { motion } from "framer-motion";
import { X, Check } from "lucide-react";

const notList = [
  "AI assistant",
  "Text-to-speech app",
  "Voice wrapper",
];

const isList = [
  "Memory storytelling platform",
  "Emotional AI product",
  "Consumer media experience",
  "Voice-native storytelling engine",
];

export function Positioning() {
  return (
    <section className="border-t border-white/5 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="font-display text-center text-3xl font-bold md:text-4xl">
          Not another AI tool
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-cinema-muted">
          Echoes makes voice the emotional engine — not a feature bolted onto
          productivity software.
        </p>
        <div className="mt-14 grid gap-8 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8"
          >
            <p className="text-sm font-medium uppercase tracking-wider text-red-400/80">
              Not
            </p>
            <ul className="mt-6 space-y-4">
              {notList.map((item) => (
                <li key={item} className="flex items-center gap-3 text-cinema-muted">
                  <X className="h-4 w-4 shrink-0 text-red-400/70" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-8"
          >
            <p className="text-sm font-medium uppercase tracking-wider text-emerald-400/80">
              Instead
            </p>
            <ul className="mt-6 space-y-4">
              {isList.map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <Check className="h-4 w-4 shrink-0 text-emerald-400" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
