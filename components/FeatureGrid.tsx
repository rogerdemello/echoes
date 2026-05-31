"use client";

import { motion } from "framer-motion";
import {
  BookOpen,
  Dna,
  Globe,
  Heart,
  ImageIcon,
  Mic,
  Wand2,
} from "lucide-react";
import { ChapterHeading } from "./ChapterHeading";

const features = [
  { icon: Wand2, title: "Memories into documentaries", description: "AI rewrites rough notes into Netflix-style narration with sensory storytelling." },
  { icon: Mic, title: "Murf is the emotional engine", description: "Voice isn't a feature — it carries nostalgia, warmth, and cinematic weight." },
  { icon: Globe, title: "Stories in many languages", description: "Grandmother in Hindi. Family in Spanish. Same memory, native emotional voice." },
  { icon: Heart, title: "Preserve emotions forever", description: "Shareable links, storybook timelines, and voice-preserved digital legacies." },
  { icon: ImageIcon, title: "Photo-to-story mode", description: "Upload an old photograph — Ken Burns backdrop meets narrated reconstruction." },
  { icon: Dna, title: "Memory DNA insights", description: "AI reveals the emotional themes in your stories — resilience, hope, love." },
  { icon: BookOpen, title: "Storybook timeline", description: "Chapter-by-chapter playback synced to Murf narration — like flipping memory pages." },
];

export function FeatureGrid() {
  return (
    <section id="features" className="border-t border-cinema-accent/10 bg-cinema-surface/40 py-28">
      <div className="mx-auto max-w-6xl px-6">
        <ChapterHeading
          chapter="CH. 04"
          kicker="The Craft"
          title="Built for emotional impact"
          subtitle="Netflix documentary · Spotify Wrapped emotion · Apple Memories nostalgia — in one experience."
        />

        <div className="mt-16 grid gap-px overflow-hidden rounded-lg border border-cinema-accent/10 bg-cinema-accent/10 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.5 }}
              className="group relative bg-cinema-bg p-7 transition-colors hover:bg-cinema-surface"
            >
              <span className="absolute right-5 top-5 font-mono text-xs tracking-[0.2em] text-cinema-accent/30 transition-colors group-hover:text-cinema-accent/60">
                {String(i + 1).padStart(2, "0")}
              </span>
              <feature.icon
                className="h-7 w-7 text-cinema-accent transition-transform duration-300 group-hover:scale-110"
                strokeWidth={1.5}
              />
              <h3 className="mt-5 font-display text-xl font-medium leading-snug">
                {feature.title}
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-cinema-muted">
                {feature.description}
              </p>
            </motion.div>
          ))}
          {/* filler cell to complete the 8-cell grid on lg */}
          <div className="hidden bg-cinema-bg p-7 lg:flex lg:flex-col lg:justify-center">
            <p className="font-display text-lg italic text-cinema-accent-light/80">
              …and the moment a lost voice answers back.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
