"use client";

import { useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";
import { EMOTIONS, LANGUAGES, NARRATORS } from "@/lib/constants";
import type { Emotion, LanguageCode, NarratorPersona, Story } from "@/lib/types";

interface VoiceControlsProps {
  story: Story;
  onUpdated: (story: Story) => void;
}

export function VoiceControls({ story, onUpdated }: VoiceControlsProps) {
  const [emotion, setEmotion] = useState<Emotion>(story.emotion);
  const [language, setLanguage] = useState<LanguageCode>(story.language);
  const [narrator, setNarrator] = useState<NarratorPersona>(story.narrator);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applyVoice = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storyId: story.id, emotion, language, narrator }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onUpdated(data.story);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to regenerate voice");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl glass p-6">
      <h3 className="font-display text-lg font-semibold">Live voice switching</h3>
      <p className="mt-1 text-sm text-cinema-muted">
        Change emotion, language, or narrator — then regenerate with Murf.
      </p>

      <div className="mt-4 space-y-4">
        <div>
          <p className="mb-2 text-xs font-medium text-cinema-muted">Emotion</p>
          <div className="flex flex-wrap gap-2">
            {EMOTIONS.map((em) => (
              <button
                key={em.id}
                type="button"
                onClick={() => setEmotion(em.id)}
                className={`rounded-full px-3 py-1.5 text-xs transition-all ${
                  emotion === em.id
                    ? "bg-cinema-accent text-white"
                    : "glass hover:bg-white/10"
                }`}
              >
                {em.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium text-cinema-muted">Language</p>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.id}
                type="button"
                onClick={() => setLanguage(lang.id)}
                className={`rounded-full px-3 py-1.5 text-xs transition-all ${
                  language === lang.id
                    ? "bg-cinema-accent text-white"
                    : "glass hover:bg-white/10"
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium text-cinema-muted">Narrator</p>
          <select
            value={narrator}
            onChange={(e) => setNarrator(e.target.value as NarratorPersona)}
            className="w-full rounded-xl border border-white/10 bg-cinema-surface px-3 py-2 text-sm focus:border-cinema-accent focus:outline-none"
          >
            {NARRATORS.map((n) => (
              <option key={n.id} value={n.id}>
                {n.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      <Button className="mt-4 w-full gap-2" onClick={applyVoice} disabled={loading}>
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCw className="h-4 w-4" />
        )}
        Regenerate voice
      </Button>
    </div>
  );
}
