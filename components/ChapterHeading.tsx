"use client";

import { motion } from "framer-motion";

/**
 * Cinematic section header — a film-credit mono kicker ("CH. 02 — THE PROCESS")
 * over an expressive serif title. Shared across landing sections for cohesion.
 */
export function ChapterHeading({
  chapter,
  kicker,
  title,
  subtitle,
  align = "center",
}: {
  chapter: string;
  kicker: string;
  title: React.ReactNode;
  subtitle?: string;
  align?: "center" | "left";
}) {
  const alignCls = align === "center" ? "items-center text-center" : "items-start text-left";
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`flex flex-col ${alignCls}`}
    >
      <span className="film-label flex items-center gap-3">
        <span className="text-cinema-accent">{chapter}</span>
        <span className="h-px w-8 bg-cinema-accent/40" />
        {kicker}
      </span>
      <h2 className="mt-5 font-display text-4xl font-light leading-[1.1] tracking-tight md:text-5xl">
        {title}
      </h2>
      {subtitle && (
        <p
          className={`mt-5 max-w-2xl text-base leading-relaxed text-cinema-muted md:text-lg ${
            align === "center" ? "mx-auto" : ""
          }`}
        >
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
