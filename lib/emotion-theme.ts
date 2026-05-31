import type { Emotion } from "./types";

// Paper-tint themes — each emotion is a faint warm wash on bone, not a dark
// gradient. glow = soft radial backdrop; ring = hairline border; gradient =
// light top-down wash fading into the page surface.
export const EMOTION_THEME: Record<
  Emotion,
  { glow: string; ring: string; gradient: string }
> = {
  nostalgic: {
    glow: "rgba(176, 120, 44, 0.16)",
    ring: "border-amber-800/20",
    gradient: "from-amber-100/60 via-cinema-surface to-cinema-surface",
  },
  calm: {
    glow: "rgba(70, 110, 150, 0.14)",
    ring: "border-sky-900/15",
    gradient: "from-sky-100/60 via-cinema-surface to-cinema-surface",
  },
  hopeful: {
    glow: "rgba(60, 130, 90, 0.14)",
    ring: "border-emerald-900/15",
    gradient: "from-emerald-100/60 via-cinema-surface to-cinema-surface",
  },
  dramatic: {
    glow: "rgba(110, 43, 43, 0.18)",
    ring: "border-cinema-accent/30",
    gradient: "from-red-100/60 via-cinema-surface to-cinema-surface",
  },
  joyful: {
    glow: "rgba(180, 90, 50, 0.16)",
    ring: "border-orange-800/20",
    gradient: "from-orange-100/60 via-cinema-surface to-cinema-surface",
  },
};
