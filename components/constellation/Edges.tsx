"use client";

import { useMemo } from "react";
import { BufferGeometry, Float32BufferAttribute } from "three";
import type {
  ConstellationEdge,
  ConstellationNode,
} from "@/lib/constellation-layout";

interface EdgesProps {
  nodes: ConstellationNode[];
  edges: ConstellationEdge[];
  highlightId: string | null;
}

export function Edges({ nodes, edges, highlightId }: EdgesProps) {
  const positionMap = useMemo(() => {
    const m = new Map<string, [number, number, number]>();
    nodes.forEach((n) => m.set(n.id, n.position));
    return m;
  }, [nodes]);

  const { geometry, highlightGeometry } = useMemo(() => {
    const base: number[] = [];
    const highlight: number[] = [];
    for (const e of edges) {
      const a = positionMap.get(e.from);
      const b = positionMap.get(e.to);
      if (!a || !b) continue;
      const isHot =
        highlightId && (e.from === highlightId || e.to === highlightId);
      const target = isHot ? highlight : base;
      target.push(a[0], a[1], a[2], b[0], b[1], b[2]);
    }
    const g = new BufferGeometry();
    g.setAttribute("position", new Float32BufferAttribute(base, 3));
    const gh = new BufferGeometry();
    gh.setAttribute("position", new Float32BufferAttribute(highlight, 3));
    return { geometry: g, highlightGeometry: gh };
  }, [edges, positionMap, highlightId]);

  return (
    <>
      <lineSegments geometry={geometry}>
        <lineBasicMaterial
          color="#a78bfa"
          transparent
          opacity={0.18}
          depthWrite={false}
        />
      </lineSegments>
      <lineSegments geometry={highlightGeometry}>
        <lineBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.85}
          depthWrite={false}
        />
      </lineSegments>
    </>
  );
}
