"use client";

import { useCallback, useRef } from "react";
import type { Emotion } from "./types";

const EMOTION_FREQ: Record<Emotion, number> = {
  nostalgic: 196,
  calm: 174,
  hopeful: 220,
  dramatic: 165,
  joyful: 247,
};

/** Soft ambient pad via Web Audio — no network required */
export function useAmbientAudio(emotion: Emotion) {
  const ctxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<OscillatorNode[]>([]);
  const gainRef = useRef<GainNode | null>(null);

  const stop = useCallback(() => {
    nodesRef.current.forEach((osc) => {
      try {
        osc.stop();
      } catch {
        /* already stopped */
      }
    });
    nodesRef.current = [];
    if (ctxRef.current) {
      ctxRef.current.close().catch(() => {});
      ctxRef.current = null;
    }
    gainRef.current = null;
  }, []);

  const start = useCallback(() => {
    if (typeof window === "undefined") return;

    stop();

    const ctx = new AudioContext();
    ctxRef.current = ctx;

    const gain = ctx.createGain();
    gain.gain.value = 0.04;
    gain.connect(ctx.destination);
    gainRef.current = gain;

    const base = EMOTION_FREQ[emotion];
    [base, base * 1.25, base * 0.75].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = i === 0 ? "sine" : "triangle";
      osc.frequency.value = freq;
      const oscGain = ctx.createGain();
      oscGain.gain.value = 0.3 / (i + 1);
      osc.connect(oscGain);
      oscGain.connect(gain);
      osc.start();
      nodesRef.current.push(osc);
    });
  }, [emotion, stop]);

  return { start, stop };
}
