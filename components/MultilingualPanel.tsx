"use client";

import { useState } from "react";
import { Globe, Loader2, Play } from "lucide-react";
import { Button } from "./ui/button";
import { LANGUAGES } from "@/lib/constants";
import type { LanguageCode, Story } from "@/lib/types";

interface MultilingualPanelProps {
  story: Story;
  onUpdated: (story: Story) => void;
  onPlayTranslation?: (audioUrl: string, language: LanguageCode) => void;
}

export function MultilingualPanel({
  story,
  onUpdated,
  onPlayTranslation,
}: MultilingualPanelProps) {
  const [loading, setLoading] = useState<LanguageCode | null>(null);
  const [error, setError] = useState<string | null>(null);

  const otherLanguages = LANGUAGES.filter((l) => l.id !== story.language);

  const generateTranslation = async (language: LanguageCode) => {
    setLoading(language);
    setError(null);
    try {
      const res = await fetch(`/api/stories/${story.id}/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.voiceError) {
        setError(`Translation ready but voice failed: ${data.voiceError}`);
      }
      if (data.story) onUpdated(data.story);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Translation failed");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="rounded-lg glass p-6">
      <div className="flex items-center gap-2">
        <Globe className="h-5 w-5 text-cinema-accent" />
        <h3 className="font-display text-xl font-medium">Multilingual family mode</h3>
      </div>
      <p className="mt-1 text-sm text-cinema-muted">
        Generate the same memory in other languages for grandparents, parents, and kids.
      </p>

      <div className="mt-4 space-y-2">
        {otherLanguages.map((lang) => {
          const existing = story.translations?.find((t) => t.language === lang.id);
          return (
            <div
              key={lang.id}
              className="flex items-center justify-between rounded-xl border border-cinema-text/10 px-4 py-3"
            >
              <span className="text-sm font-medium">{lang.label}</span>
              <div className="flex gap-2">
                {existing?.audioUrl && onPlayTranslation && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onPlayTranslation(existing.audioUrl!, lang.id)}
                    className="gap-1"
                  >
                    <Play className="h-3 w-3" />
                    Play
                  </Button>
                )}
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={loading !== null}
                  onClick={() => generateTranslation(lang.id)}
                >
                  {loading === lang.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : existing ? (
                    "Regenerate"
                  ) : (
                    "Generate"
                  )}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {error && <p className="mt-3 text-sm text-amber-700">{error}</p>}
    </div>
  );
}
