import type { Emotion } from "./types";

export const EMOTION_THEME: Record<
  Emotion,
  { glow: string; ring: string; gradient: string }
> = {
  nostalgic: {
    glow: "rgba(251, 191, 36, 0.2)",
    ring: "border-amber-500/30",
    gradient: "from-amber-900/20 via-cinema-bg to-cinema-bg",
  },
  calm: {
    glow: "rgba(96, 165, 250, 0.2)",
    ring: "border-blue-500/30",
    gradient: "from-blue-900/20 via-cinema-bg to-cinema-bg",
  },
  hopeful: {
    glow: "rgba(52, 211, 153, 0.2)",
    ring: "border-emerald-500/30",
    gradient: "from-emerald-900/20 via-cinema-bg to-cinema-bg",
  },
  dramatic: {
    glow: "rgba(239, 68, 68, 0.15)",
    ring: "border-red-500/30",
    gradient: "from-red-950/30 via-cinema-bg to-cinema-bg",
  },
  joyful: {
    glow: "rgba(167, 139, 250, 0.25)",
    ring: "border-violet-500/30",
    gradient: "from-violet-900/20 via-cinema-bg to-cinema-bg",
  },
};
