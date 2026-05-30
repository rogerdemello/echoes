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

const features = [
  {
    icon: Wand2,
    title: "Turn memories into documentaries",
    description:
      "AI rewrites rough notes into Netflix-style narration with sensory storytelling.",
  },
  {
    icon: Mic,
    title: "Murf is the emotional engine",
    description:
      "Voice is not a feature — it carries nostalgia, warmth, and cinematic weight.",
  },
  {
    icon: Globe,
    title: "Hear stories in many languages",
    description:
      "Grandmother in Hindi. Family in Spanish. Same memory, native emotional voice.",
  },
  {
    icon: Heart,
    title: "Preserve emotions forever",
    description:
      "Shareable links, storybook timelines, and voice-preserved digital legacies.",
  },
  {
    icon: ImageIcon,
    title: "Photo-to-story mode",
    description:
      "Upload an old photograph — Ken Burns backdrop meets narrated reconstruction.",
  },
  {
    icon: Dna,
    title: "Memory DNA insights",
    description:
      "AI reveals the emotional themes in your stories — resilience, hope, love.",
  },
  {
    icon: BookOpen,
    title: "Storybook timeline",
    description:
      "Chapter-by-chapter playback synced to Murf narration — like flipping memory pages.",
  },
];

export function FeatureGrid() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-6 py-24">
      <h2 className="font-display text-center text-3xl font-bold md:text-4xl">
        Built for emotional impact
      </h2>
      <p className="mx-auto mt-4 max-w-xl text-center text-cinema-muted">
        Netflix documentary · Spotify Wrapped emotions · Apple Memories nostalgia
        — in one experience.
      </p>
      <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            className="rounded-2xl glass p-6 transition-colors hover:border-cinema-accent/30"
          >
            <feature.icon className="h-8 w-8 text-cinema-accent-light" />
            <h3 className="mt-4 font-display text-lg font-semibold">{feature.title}</h3>
            <p className="mt-2 text-sm text-cinema-muted">{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
