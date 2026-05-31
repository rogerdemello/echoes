"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

interface HealthServices {
  murf: boolean;
  storyAI: boolean;
  gemini?: boolean;
  transcription?: boolean;
  /** @deprecated legacy Azure health payload */
  azureOpenAI?: boolean;
  /** @deprecated legacy Azure health payload */
  azureWhisper?: boolean;
}

export function ServiceHealth() {
  const [services, setServices] = useState<HealthServices | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then((d) => setServices(d.services))
      .catch(() => setServices(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-full glass px-4 py-2 text-xs text-cinema-muted">
        <Loader2 className="h-3 w-3 animate-spin" />
        Checking services...
      </div>
    );
  }

  if (!services) return null;

  const items = [
    { label: "Murf Voice", ok: services.murf },
    { label: "Gemini AI", ok: services.gemini ?? services.storyAI },
    { label: "Voice Transcription", ok: services.transcription ?? services.gemini ?? false },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item.label}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs ${
            item.ok
              ? "bg-emerald-700/[0.08] text-emerald-800 border border-emerald-800/20"
              : "bg-amber-700/[0.08] text-amber-800 border border-amber-800/20"
          }`}
        >
          {item.ok ? (
            <CheckCircle2 className="h-3 w-3" />
          ) : (
            <XCircle className="h-3 w-3" />
          )}
          {item.label}
        </span>
      ))}
    </div>
  );
}
