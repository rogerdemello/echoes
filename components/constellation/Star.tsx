"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import type { Mesh } from "three";
import type { ConstellationNode } from "@/lib/constellation-layout";

interface StarProps {
  node: ConstellationNode;
  dimmed: boolean;
  hovered: boolean;
  onHover: (id: string | null) => void;
  onClick: (node: ConstellationNode) => void;
}

export function Star({ node, dimmed, hovered, onHover, onClick }: StarProps) {
  const meshRef = useRef<Mesh>(null);

  // Subtle per-star pulse so the field always feels alive
  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    const phase = (node.position[0] + node.position[1] + node.position[2]) * 0.5;
    const scale = 1 + Math.sin(t * 0.8 + phase) * 0.07;
    meshRef.current.scale.setScalar(scale);
  });

  const intensity = dimmed ? 0.15 : hovered ? 3.5 : 1.6;
  const opacity = dimmed ? 0.25 : 1;

  return (
    <group position={node.position}>
      <mesh
        ref={meshRef}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(node.id);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          onHover(null);
          document.body.style.cursor = "";
        }}
        onClick={(e) => {
          e.stopPropagation();
          onClick(node);
        }}
      >
        <sphereGeometry args={[node.size, 16, 16]} />
        <meshStandardMaterial
          color={node.color}
          emissive={node.color}
          emissiveIntensity={intensity}
          transparent
          opacity={opacity}
        />
      </mesh>
      {/* Outer glow halo */}
      <mesh>
        <sphereGeometry args={[node.size * 2.2, 12, 12]} />
        <meshBasicMaterial
          color={node.color}
          transparent
          opacity={dimmed ? 0.04 : hovered ? 0.22 : 0.08}
          depthWrite={false}
        />
      </mesh>
      {hovered && !dimmed && (
        <Html
          distanceFactor={10}
          position={[0, node.size * 3, 0]}
          style={{ pointerEvents: "none" }}
        >
          <div className="whitespace-nowrap rounded-md border border-white/20 bg-black/80 px-2 py-1 text-xs text-white backdrop-blur">
            <div className="font-medium">{node.title}</div>
            <div className="text-[10px] uppercase tracking-wider text-white/60">
              {node.emotion}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}
