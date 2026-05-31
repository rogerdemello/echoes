import { Hero } from "@/components/Hero";
import { FeatureGrid } from "@/components/FeatureGrid";
import { HowItWorks } from "@/components/HowItWorks";
import { RecentEchoes } from "@/components/RecentEchoes";
import { VisionSection } from "@/components/VisionSection";
import { SocialProof } from "@/components/SocialProof";
import { Positioning } from "@/components/Positioning";

export default function HomePage() {
  return (
    <>
      <Hero />
      <VisionSection />
      <HowItWorks />
      <SocialProof />
      <FeatureGrid />
      <Positioning />
      <RecentEchoes />

      {/* last page of the album */}
      <footer className="border-t border-cinema-text/10 bg-cinema-surface-2 py-20 text-center">
        <p className="film-label justify-center">Fin</p>
        <p className="mt-6 font-display text-4xl font-medium tracking-tight">
          Echoes
        </p>
        <p className="mt-3 font-display text-lg italic text-cinema-accent-light">
          Preserve emotions, not just memories.
        </p>
        <div className="mx-auto mt-10 h-px w-16 bg-cinema-accent/40" />
        <p className="mt-8 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-cinema-muted">
          Powered by Murf AI · Emotional storytelling · Cinematic voice
        </p>
        <p className="mt-3 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-cinema-muted-dark">
          Built for the Murf AI Buildathon
        </p>
      </footer>
    </>
  );
}
