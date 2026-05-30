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
      <footer className="border-t border-white/5 py-12 text-center text-sm text-cinema-muted">
        <p className="font-display text-xl text-cinema-text">
          Echoes
        </p>
        <p className="mt-2 text-cinema-accent-light">
          Preserve emotions, not just memories.
        </p>
        <p className="mt-4">
          Powered by Murf AI · Emotional storytelling · Cinematic voice experiences
        </p>
        <p className="mt-2 opacity-60">Built for Murf AI Buildathon</p>
      </footer>
    </>
  );
}
