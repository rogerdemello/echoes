"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Loader2,
  Mic,
  Sparkles,
  Type,
  Wand2,
  Upload,
  ImageIcon,
  Users,
  X,
} from "lucide-react";
import { Button } from "./ui/button";
import {
  DUET_PRESETS,
  EMOTIONS,
  JUDGE_DEMO_DUET,
  LANGUAGES,
  MEMORY_PROMPTS,
  NARRATORS,
  STORY_STYLES,
} from "@/lib/constants";
import type {
  CreateStoryInput,
  Emotion,
  LanguageCode,
  NarratorPersona,
  StoryMode,
  StoryStyle,
} from "@/lib/types";
import { LanguageHint } from "./LanguageHint";
import { useToast } from "./ToastProvider";

const DEMO_MEMORY =
  "When I was 10, my father taught me how to ride a bicycle during summer evenings. The air smelled of dust and mango trees. Every evening he ran beside me as I struggled to balance, never letting go until I was ready.";

function getGeneratingSteps(language: LanguageCode): string[] {
  const langLabel =
    LANGUAGES.find((l) => l.id === language)?.label ?? language;
  const steps = [
    "Reading your memory...",
    "Crafting cinematic narration...",
    "Detecting emotional tone...",
  ];
  if (language !== "en") {
    steps.push(`Writing in ${langLabel}...`);
    steps.push(`Synthesizing native ${langLabel} voice...`);
  } else {
    steps.push("Synthesizing Murf voice...");
  }
  steps.push("Preparing your Echo...");
  return steps;
}

function getDuetSteps(speakerA: string, speakerB: string): string[] {
  return [
    "Writing the conversation across time...",
    `Voicing ${speakerA || "the first voice"}...`,
    `Voicing ${speakerB || "the second voice"}...`,
    "Stitching the voices together...",
    "Preparing your Echo...",
  ];
}

function withPhotoStep(steps: string[], hasPhoto: boolean): string[] {
  if (!hasPhoto) return steps;
  const copy = [...steps];
  copy.splice(copy.length - 1, 0, "Processing your memory photo...");
  return copy;
}

type InputMode = "text" | "voice";

export function CreateStoryForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const memoryTextareaRef = useRef<HTMLTextAreaElement>(null);

  const applyPrompt = (prompt: string) => {
    setOriginalText((current) => {
      if (!current.trim()) return prompt + " ";
      const separator = current.endsWith("\n") ? "" : "\n\n";
      toast("Prompt added — appended to your memory", "info");
      return current + separator + prompt + " ";
    });
    requestAnimationFrame(() => {
      const el = memoryTextareaRef.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
    });
  };

  const [inputMode, setInputMode] = useState<InputMode>("text");
  const [mode, setMode] = useState<StoryMode>("solo");
  const [duetPreset, setDuetPreset] = useState<string>("you-grandfather");
  const [speakerAName, setSpeakerAName] = useState("Me");
  const [speakerBName, setSpeakerBName] = useState("Grandfather");
  const [narratorA, setNarratorA] = useState<NarratorPersona>("documentary");
  const [narratorB, setNarratorB] = useState<NarratorPersona>("podcast");
  const [originalText, setOriginalText] = useState("");
  const [storyStyle, setStoryStyle] = useState<StoryStyle>("documentary");
  const [emotion, setEmotion] = useState<Emotion>("nostalgic");
  const [language, setLanguage] = useState<LanguageCode>("en");
  const [narrator, setNarrator] = useState<NarratorPersona>("documentary");
  const [autoDetect, setAutoDetect] = useState(true);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [voiceNoteName, setVoiceNoteName] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const generatingSteps = useMemo(
    () =>
      mode === "duet"
        ? getDuetSteps(speakerAName, speakerBName)
        : withPhotoStep(getGeneratingSteps(language), Boolean(photoFile)),
    [mode, speakerAName, speakerBName, language, photoFile]
  );

  const applyDuetPreset = (presetId: string) => {
    const preset = DUET_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setDuetPreset(preset.id);
    setSpeakerAName(preset.speakerAName);
    setSpeakerBName(preset.speakerBName);
    setNarratorA(preset.narratorA);
    setNarratorB(preset.narratorB);
  };

  useEffect(() => {
    if (searchParams.get("demo") === "1") {
      setOriginalText(DEMO_MEMORY);
    }
    if (searchParams.get("duet") === "1") {
      setMode("duet");
      applyDuetPreset("you-grandfather");
      setOriginalText((cur) => cur || JUDGE_DEMO_DUET.memory);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!isLoading) return;
    setStepIndex(0);
    const interval = setInterval(() => {
      setStepIndex((i) => (i + 1) % generatingSteps.length);
    }, 2200);
    return () => clearInterval(interval);
  }, [isLoading, generatingSteps.length]);

  const detectEmotion = async () => {
    if (!originalText.trim()) return;
    setIsDetecting(true);
    setError(null);
    try {
      const res = await fetch("/api/detect-emotion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: originalText.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setEmotion(data.emotion);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Emotion detection failed");
    } finally {
      setIsDetecting(false);
    }
  };

  const previewEnhancement = async () => {
    if (!originalText.trim()) return;
    setIsPreviewing(true);
    setError(null);
    try {
      const res = await fetch("/api/enhance-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: originalText.trim(), storyStyle, emotion }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPreview(data.enhancedStory);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Preview failed");
    } finally {
      setIsPreviewing(false);
    }
  };

  const handlePhotoSelect = (file: File) => {
    setPhotoFile(file);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const clearPhoto = () => {
    setPhotoFile(null);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
    if (photoInputRef.current) photoInputRef.current.value = "";
  };

  const handleVoiceUpload = async (file: File) => {
    setIsTranscribing(true);
    setError(null);
    setVoiceNoteName(file.name);
    try {
      const formData = new FormData();
      formData.append("audio", file);
      const res = await fetch("/api/transcribe", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setOriginalText(data.text);
      setInputMode("text");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transcription failed");
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!originalText.trim()) {
      setError("Please share a memory to transform.");
      return;
    }

    setIsLoading(true);
    setError(null);

    const payload: CreateStoryInput = {
      originalText: originalText.trim(),
      storyStyle,
      emotion,
      language,
      narrator,
      inputType: inputMode === "voice" ? "voice" : "text",
      autoDetectEmotion: autoDetect,
      mode,
    };

    if (mode === "duet") {
      payload.duet = {
        speakerAName: speakerAName.trim() || "Voice A",
        speakerBName: speakerBName.trim() || "Voice B",
        narratorA,
        narratorB,
        relationshipPreset: duetPreset,
      };
    }

    try {
      if (photoFile) {
        const photoForm = new FormData();
        photoForm.append("photo", photoFile);
        const up = await fetch("/api/upload-photo", {
          method: "POST",
          body: photoForm,
        });
        const upData = await up.json();
        if (!up.ok) throw new Error(upData.error || "Photo upload failed");
        payload.photoUrl = upData.photoUrl;
      }

      const res = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create story");

      if (data.voiceError) {
        toast(data.voiceError, "info");
      }

      router.push(`/story/${data.story.id}?autoplay=1`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl glass p-12 text-center"
      >
        <Loader2 className="h-12 w-12 animate-spin text-cinema-accent-light" />
        <p className="mt-6 font-display text-xl font-semibold">
          {generatingSteps[stepIndex]}
        </p>
        <p className="mt-2 text-sm text-cinema-muted">
          This is the magic moment — your memory is becoming a story
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Solo / Duet mode toggle */}
      <div className="flex gap-2 rounded-xl glass p-1">
        <button
          type="button"
          onClick={() => setMode("solo")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm transition-all ${
            mode === "solo" ? "bg-cinema-accent text-white" : "text-cinema-muted"
          }`}
        >
          Single narrator
        </button>
        <button
          type="button"
          onClick={() => setMode("duet")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm transition-all ${
            mode === "duet" ? "bg-cinema-accent text-white" : "text-cinema-muted"
          }`}
        >
          <Users className="h-4 w-4" />
          Dual voice
        </button>
      </div>

      {mode === "duet" && (
        <div className="rounded-2xl border border-cinema-accent/30 bg-cinema-accent/5 p-5">
          <p className="text-sm font-medium text-cinema-accent-light">
            A conversation across time
          </p>
          <p className="mt-1 text-xs text-cinema-muted">
            Two distinct Murf voices answer each other — turn a memory into a
            dialogue between the people in it.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {DUET_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => applyDuetPreset(p.id)}
                className={`rounded-full px-3 py-1.5 text-xs transition-all ${
                  duetPreset === p.id
                    ? "bg-cinema-accent text-white"
                    : "glass hover:bg-white/10"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {([
              {
                label: "First voice",
                name: speakerAName,
                setName: setSpeakerAName,
                value: narratorA,
                setValue: setNarratorA,
              },
              {
                label: "Second voice",
                name: speakerBName,
                setName: setSpeakerBName,
                value: narratorB,
                setValue: setNarratorB,
              },
            ] as const).map((col) => (
              <div key={col.label}>
                <label className="block text-xs font-medium text-cinema-muted">
                  {col.label}
                </label>
                <input
                  type="text"
                  value={col.name}
                  onChange={(e) => col.setName(e.target.value)}
                  placeholder="Name (e.g. Grandfather)"
                  className="mt-2 w-full rounded-lg border border-white/10 bg-cinema-surface px-3 py-2 text-sm text-cinema-text placeholder:text-cinema-muted/50 focus:border-cinema-accent focus:outline-none"
                />
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {NARRATORS.map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => col.setValue(n.id)}
                      className={`rounded-lg border px-2 py-1.5 text-left text-xs transition-all ${
                        col.value === n.id
                          ? "border-cinema-accent bg-cinema-accent/10"
                          : "border-white/10 hover:border-white/20"
                      }`}
                    >
                      {n.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {narratorA === narratorB && (
            <p className="mt-3 text-xs text-amber-400">
              Tip: pick two different voices so the speakers sound distinct.
            </p>
          )}
        </div>
      )}

      {/* Input mode tabs */}
      <div className="flex gap-2 rounded-xl glass p-1">
        <button
          type="button"
          onClick={() => setInputMode("text")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm transition-all ${
            inputMode === "text" ? "bg-cinema-accent text-white" : "text-cinema-muted"
          }`}
        >
          <Type className="h-4 w-4" />
          Write memory
        </button>
        <button
          type="button"
          onClick={() => setInputMode("voice")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm transition-all ${
            inputMode === "voice" ? "bg-cinema-accent text-white" : "text-cinema-muted"
          }`}
        >
          <Mic className="h-4 w-4" />
          Voice note
        </button>
      </div>

      {inputMode === "voice" ? (
        <div className="rounded-2xl border border-dashed border-white/20 p-8 text-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*,video/webm"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleVoiceUpload(file);
            }}
          />
          {isTranscribing ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-cinema-accent-light" />
              <p className="text-sm text-cinema-muted">Transcribing your voice note...</p>
            </div>
          ) : (
            <>
              <Upload className="mx-auto h-10 w-10 text-cinema-muted" />
              <p className="mt-3 text-sm text-cinema-muted">
                Upload a voice note (mp3, wav, m4a, webm)
              </p>
              {voiceNoteName && (
                <p className="mt-2 text-xs text-cinema-accent-light">{voiceNoteName}</p>
              )}
              <Button
                type="button"
                variant="secondary"
                className="mt-4"
                onClick={() => fileInputRef.current?.click()}
              >
                Choose audio file
              </Button>
            </>
          )}
        </div>
      ) : null}

      <div>
        <label className="block text-sm font-medium text-cinema-muted">
          Photo (optional)
        </label>
        <p className="mt-1 text-xs text-cinema-muted">
          Ken Burns cinematic backdrop during playback.
        </p>
        <input
          ref={photoInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handlePhotoSelect(f);
          }}
        />
        {photoPreview ? (
          <div className="relative mt-3 overflow-hidden rounded-2xl border border-white/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photoPreview}
              alt="Memory preview"
              className="max-h-48 w-full object-cover"
            />
            <button
              type="button"
              onClick={clearPhoto}
              className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80"
              aria-label="Remove photo"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            className="mt-3 gap-2"
            onClick={() => photoInputRef.current?.click()}
          >
            <ImageIcon className="h-4 w-4" />
            Add a memory photo
          </Button>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-cinema-muted">
            Your memory
          </label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={detectEmotion}
              disabled={isDetecting || !originalText.trim()}
              className="gap-1 text-xs"
            >
              {isDetecting ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Sparkles className="h-3 w-3" />
              )}
              Detect emotion
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={previewEnhancement}
              disabled={isPreviewing || !originalText.trim()}
              className="gap-1 text-xs"
            >
              {isPreviewing ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Wand2 className="h-3 w-3" />
              )}
              Preview story
            </Button>
          </div>
        </div>
        <div className="mt-3 -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-thin scrollbar-thumb-white/10">
          {MEMORY_PROMPTS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => applyPrompt(p)}
              className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-cinema-muted transition-colors hover:border-cinema-accent/40 hover:bg-cinema-accent/10 hover:text-cinema-text"
            >
              {p}
            </button>
          ))}
        </div>
        <textarea
          ref={memoryTextareaRef}
          value={originalText}
          onChange={(e) => setOriginalText(e.target.value)}
          placeholder="My grandfather taught me cycling when I was 7..."
          rows={6}
          className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-cinema-surface px-4 py-3 text-cinema-text placeholder:text-cinema-muted/50 focus:border-cinema-accent focus:outline-none focus:ring-1 focus:ring-cinema-accent"
        />
        {preview && (
          <div className="mt-3 rounded-xl border border-cinema-accent/30 bg-cinema-accent/5 p-4">
            <p className="text-xs font-medium text-cinema-accent-light mb-2">
              Enhanced preview
            </p>
            <p className="text-sm leading-relaxed text-cinema-muted whitespace-pre-wrap">
              {preview}
            </p>
          </div>
        )}
      </div>

      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={autoDetect}
          onChange={(e) => setAutoDetect(e.target.checked)}
          className="h-4 w-4 rounded accent-cinema-accent"
        />
        <span className="text-sm text-cinema-muted">
          Auto-detect emotion from memory (AI)
        </span>
      </label>

      <div>
        <label className="block text-sm font-medium text-cinema-muted">Story style</label>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {STORY_STYLES.map((style) => (
            <button
              key={style.id}
              type="button"
              onClick={() => setStoryStyle(style.id)}
              className={`rounded-xl border p-4 text-left transition-all ${
                storyStyle === style.id
                  ? "border-cinema-accent bg-cinema-accent/10"
                  : "border-white/10 hover:border-white/20"
              }`}
            >
              <span className="font-medium">{style.label}</span>
              <p className="mt-1 text-xs text-cinema-muted">{style.hook}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-cinema-muted">Emotion</label>
        <div className="mt-3 flex flex-wrap gap-2">
          {EMOTIONS.map((em) => (
            <button
              key={em.id}
              type="button"
              onClick={() => setEmotion(em.id)}
              className={`rounded-full px-4 py-2 text-sm transition-all ${
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
        <label className="block text-sm font-medium text-cinema-muted">Language</label>
        <LanguageHint language={language} />
        <div className="mt-3 flex flex-wrap gap-2">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.id}
              type="button"
              onClick={() => setLanguage(lang.id)}
              className={`rounded-full px-4 py-2 text-sm transition-all ${
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

      {mode === "solo" && (
        <div>
          <label className="block text-sm font-medium text-cinema-muted">Narrator persona</label>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {NARRATORS.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => setNarrator(n.id)}
                className={`rounded-xl border px-4 py-3 text-left text-sm transition-all ${
                  narrator === n.id
                    ? "border-cinema-accent bg-cinema-accent/10"
                    : "border-white/10 hover:border-white/20"
                }`}
              >
                {n.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <p className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</p>
      )}

      <Button type="submit" size="lg" className="w-full gap-2">
        <Wand2 className="h-5 w-5" />
        {mode === "duet"
          ? "Create the conversation across time"
          : "Transform into cinematic story"}
      </Button>
    </form>
  );
}
