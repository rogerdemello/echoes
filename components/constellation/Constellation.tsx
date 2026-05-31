"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import {
  EffectComposer,
  Bloom,
  Vignette,
} from "@react-three/postprocessing";
import { motion } from "framer-motion";
import { Sparkles as SparklesIcon, Loader2 } from "lucide-react";
import { Star } from "./Star";
import { Edges } from "./Edges";
import { StoryPanel } from "./StoryPanel";
import { EMOTIONS } from "@/lib/constants";
import {
  buildEdges,
  EMOTION_HEX,
  hashToSpherePoint,
  sizeFromWordCount,
  type ConstellationNode,
} from "@/lib/constellation-layout";
import type { Emotion } from "@/lib/types";

interface StorySummary {
  id: string;
  shareSlug: string;
  title: string;
  emotion: Emotion;
  storyStyle: string;
  language: string;
  audioUrl: string | null;
  createdAt: string;
  themes?: string[];
  wordCount?: number;
}

export function Constellation() {
  const [stories, setStories] = useState<StorySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [emotionFilter, setEmotionFilter] = useState<Emotion | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/stories")
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        setStories(d.stories ?? []);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message || "Failed to load");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const nodes = useMemo<ConstellationNode[]>(() => {
    return stories.map((s) => ({
      id: s.id,
      shareSlug: s.shareSlug,
      title: s.title,
      emotion: s.emotion,
      themes: s.themes ?? [],
      wordCount: s.wordCount ?? 120,
      position: hashToSpherePoint(s.id, s.emotion),
      size: sizeFromWordCount(s.wordCount ?? 120),
      color: EMOTION_HEX[s.emotion] ?? "#C8A45A",
    }));
  }, [stories]);

  const edges = useMemo(() => buildEdges(nodes, 3), [nodes]);

  const isDimmed = (n: ConstellationNode) =>
    Boolean(emotionFilter && n.emotion !== emotionFilter);

  return (
    <div className="fixed inset-0 overflow-hidden bg-cinema-night">
      {/* Background gradient — warm gold bloom against the night */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(201,168,106,0.14),transparent_60%)]"
      />

      {/* HUD top-left */}
      <div className="pointer-events-none absolute left-0 right-0 top-20 z-10 flex flex-col items-start gap-3 px-6 sm:px-10">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="pointer-events-auto"
        >
          <h1 className="font-display text-3xl font-semibold tracking-tight text-white">
            Memory Constellation
          </h1>
          <p className="mt-1 max-w-md text-sm text-stone-300">
            Every Echo lives here as a star. Connected lines mean shared
            emotional themes.
          </p>
          <p className="mt-2 text-xs text-stone-300/70">
            {nodes.length} {nodes.length === 1 ? "memory" : "memories"}
            {" · "}
            {edges.length} {edges.length === 1 ? "connection" : "connections"}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="pointer-events-auto flex flex-wrap gap-2"
        >
          <button
            type="button"
            onClick={() => setEmotionFilter(null)}
            className={`rounded-full border px-3 py-1 text-xs transition-colors ${
              emotionFilter === null
                ? "border-cinema-accent bg-cinema-accent/20 text-white"
                : "border-white/10 bg-white/5 text-stone-300 hover:border-white/20"
            }`}
          >
            All
          </button>
          {EMOTIONS.map((e) => (
            <button
              key={e.id}
              type="button"
              onClick={() =>
                setEmotionFilter((curr) => (curr === e.id ? null : e.id))
              }
              className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                emotionFilter === e.id
                  ? "text-white"
                  : "border-white/10 bg-white/5 text-stone-300 hover:border-white/20"
              }`}
              style={
                emotionFilter === e.id
                  ? {
                      borderColor: EMOTION_HEX[e.id],
                      backgroundColor: `${EMOTION_HEX[e.id]}22`,
                    }
                  : undefined
              }
            >
              {e.label}
            </button>
          ))}
        </motion.div>
      </div>

      {/* Loading / empty state */}
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-cinema-accent-light" />
        </div>
      )}
      {!loading && !error && nodes.length === 0 && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 px-6 text-center">
          <SparklesIcon className="h-8 w-8 text-cinema-accent-light" />
          <p className="text-stone-300">
            Your constellation is empty. Create your first Echo.
          </p>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 z-10 flex items-center justify-center text-red-300">
          {error}
        </div>
      )}

      {/* The 3D canvas */}
      {!loading && nodes.length > 0 && (
        <Canvas
          camera={{ position: [0, 0, 14], fov: 55 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true }}
        >
          <ambientLight intensity={0.4} />
          <pointLight position={[10, 10, 10]} intensity={0.8} />

          <Suspense fallback={null}>
            <Edges
              nodes={nodes}
              edges={edges}
              highlightId={hoveredId ?? selectedId}
            />
            {nodes.map((node) => (
              <Star
                key={node.id}
                node={node}
                dimmed={isDimmed(node)}
                hovered={hoveredId === node.id}
                onHover={setHoveredId}
                onClick={(n) => setSelectedId(n.id)}
              />
            ))}
            <EffectComposer>
              <Bloom
                intensity={1.2}
                luminanceThreshold={0.15}
                luminanceSmoothing={0.6}
                mipmapBlur
              />
              <Vignette eskil={false} offset={0.3} darkness={0.85} />
            </EffectComposer>
          </Suspense>

          <OrbitControls
            enablePan={false}
            enableZoom
            autoRotate
            autoRotateSpeed={0.35}
            minDistance={6}
            maxDistance={28}
          />
        </Canvas>
      )}

      <StoryPanel storyId={selectedId} onClose={() => setSelectedId(null)} />
    </div>
  );
}
