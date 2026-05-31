"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const Constellation = dynamic(
  () =>
    import("@/components/constellation/Constellation").then((m) => m.Constellation),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-screen items-center justify-center bg-cinema-night">
        <Loader2 className="h-8 w-8 animate-spin text-cinema-accent" />
      </div>
    ),
  }
);

export default function ConstellationPage() {
  return <Constellation />;
}
