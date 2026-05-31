"use client";

import { motion } from "framer-motion";
import { X, Check } from "lucide-react";
import { ChapterHeading } from "./ChapterHeading";

const notList = ["AI assistant", "Text-to-speech app", "Voice wrapper"];

const isList = [
  "Memory storytelling platform",
  "Emotional AI product",
  "Consumer media experience",
  "Voice-native storytelling engine",
];

export function Positioning() {
  return (
    <section className="border-t border-cinema-accent/10 py-28">
      <div className="mx-auto max-w-6xl px-6">
        <ChapterHeading
          chapter="CH. 05"
          kicker="The Position"
          title="Not another AI tool"
          subtitle="Echoes makes voice the emotional engine — not a feature bolted onto productivity software."
        />

        <div className="mt-16 grid gap-6 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="rounded-lg border border-cinema-text/12 bg-cinema-text/[0.02] p-8"
          >
            <p className="film-label text-cinema-muted">Not</p>
            <ul className="mt-7 space-y-4">
              {notList.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 text-cinema-muted-dark line-through decoration-cinema-muted/40"
                >
                  <X className="h-4 w-4 shrink-0 text-cinema-muted-dark" strokeWidth={1.5} />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="rounded-lg border border-cinema-accent/30 bg-cinema-accent/[0.05] p-8 glow-ring"
          >
            <p className="film-label">Instead</p>
            <ul className="mt-7 space-y-4">
              {isList.map((item) => (
                <li key={item} className="flex items-center gap-3 font-medium">
                  <Check className="h-4 w-4 shrink-0 text-cinema-accent" strokeWidth={1.5} />
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
