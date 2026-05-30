import type { Emotion } from "./types";

export interface ConstellationNode {
  id: string;
  shareSlug: string;
  title: string;
  emotion: Emotion;
  themes: string[];
  wordCount: number;
  position: [number, number, number];
  /** Pixel-space "size" derived from wordCount (clamped) */
  size: number;
  /** Hex string of the emotion's glow color */
  color: string;
}

export interface ConstellationEdge {
  from: string;
  to: string;
  /** Shared theme that created the edge (for tooltip / hover) */
  theme: string;
}

/** Hex glow color per emotion (drawn from EMOTION_THEME but converted to #RRGGBB) */
export const EMOTION_HEX: Record<Emotion, string> = {
  nostalgic: "#fbbf24",
  calm: "#60a5fa",
  hopeful: "#34d399",
  dramatic: "#ef4444",
  joyful: "#a78bfa",
};

/** Anchor direction on the unit sphere per emotion — clusters same-emotion stars */
const EMOTION_ANCHOR: Record<Emotion, [number, number, number]> = {
  nostalgic: [0.8, 0.4, 0.4],
  calm: [-0.8, 0.4, 0.4],
  hopeful: [0.4, 0.8, -0.4],
  dramatic: [0.4, -0.8, 0.4],
  joyful: [-0.4, 0.4, -0.8],
};

/** Deterministic hash → [0, 1) — small + fast, not crypto */
function hash01(str: string, salt = 0): number {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  }
  // Map to [0, 1)
  return ((h >>> 0) / 0xffffffff);
}

function normalize3(v: [number, number, number]): [number, number, number] {
  const m = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / m, v[1] / m, v[2] / m];
}

/**
 * Map a story id + emotion to a stable 3D point inside a sphere of given radius.
 * Stories of the same emotion are pulled toward that emotion's anchor direction,
 * producing natural visual clusters while keeping per-story positions unique.
 */
export function hashToSpherePoint(
  id: string,
  emotion: Emotion,
  radius = 6
): [number, number, number] {
  const u = hash01(id, 1);
  const v = hash01(id, 2);
  const r = hash01(id, 3);

  // Uniform random direction on the unit sphere
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const rand: [number, number, number] = [
    Math.sin(phi) * Math.cos(theta),
    Math.sin(phi) * Math.sin(theta),
    Math.cos(phi),
  ];

  // Bias toward the emotion anchor (60% anchor, 40% random) so clusters form
  // without becoming too tight.
  const anchor = EMOTION_ANCHOR[emotion];
  const blended = normalize3([
    rand[0] * 0.4 + anchor[0] * 0.6,
    rand[1] * 0.4 + anchor[1] * 0.6,
    rand[2] * 0.4 + anchor[2] * 0.6,
  ]);

  // Distance from center: most stars in the shell, a few further in
  const dist = radius * (0.55 + r * 0.45);
  return [blended[0] * dist, blended[1] * dist, blended[2] * dist];
}

export function sizeFromWordCount(wordCount: number): number {
  // 80 → 0.16, 250 → 0.32 — clamped so very long stories don't dominate
  const clamped = Math.max(40, Math.min(400, wordCount));
  return 0.14 + (clamped - 40) * (0.20 / 360);
}

/** Lowercase + trim for theme matching */
function normTheme(t: string): string {
  return t.trim().toLowerCase();
}

/**
 * Build edges connecting nodes that share at least one theme. Caps each node
 * to `maxEdgesPerNode` connections (strongest match first — i.e. nodes with
 * more total themes in common get priority) so dense graphs stay readable.
 */
export function buildEdges(
  nodes: ConstellationNode[],
  maxEdgesPerNode = 3
): ConstellationEdge[] {
  const themeSets = new Map<string, Set<string>>();
  for (const n of nodes) {
    themeSets.set(n.id, new Set(n.themes.map(normTheme).filter(Boolean)));
  }

  type Candidate = {
    from: string;
    to: string;
    theme: string;
    shared: number;
  };
  const candidates: Candidate[] = [];
  for (let i = 0; i < nodes.length; i++) {
    const a = nodes[i];
    const aThemes = themeSets.get(a.id)!;
    for (let j = i + 1; j < nodes.length; j++) {
      const b = nodes[j];
      const bThemes = themeSets.get(b.id)!;
      let firstShared: string | null = null;
      let shared = 0;
      aThemes.forEach((t) => {
        if (bThemes.has(t)) {
          shared++;
          if (!firstShared) firstShared = t;
        }
      });
      if (firstShared && shared > 0) {
        candidates.push({
          from: a.id,
          to: b.id,
          theme: firstShared,
          shared,
        });
      }
    }
  }

  // Strongest first
  candidates.sort((a, b) => b.shared - a.shared);

  const perNodeCount = new Map<string, number>();
  const edges: ConstellationEdge[] = [];
  for (const c of candidates) {
    const fromCount = perNodeCount.get(c.from) ?? 0;
    const toCount = perNodeCount.get(c.to) ?? 0;
    if (fromCount >= maxEdgesPerNode || toCount >= maxEdgesPerNode) continue;
    edges.push({ from: c.from, to: c.to, theme: c.theme });
    perNodeCount.set(c.from, fromCount + 1);
    perNodeCount.set(c.to, toCount + 1);
  }
  return edges;
}
