"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Pause,
  Play,
  Volume2,
  Share2,
  Download,
  Music,
  MessageCircle,
  Clock,
} from "lucide-react";
import { Button } from "./ui/button";
import type { DialogueLine, Story } from "@/lib/types";
import { EMOTIONS, LANGUAGES } from "@/lib/constants";
import { EMOTION_THEME } from "@/lib/emotion-theme";
import { useAmbientAudio } from "@/lib/use-ambient-audio";

interface DuetPlayerProps {
  story: Story;
  audioUrl?: string | null;
  autoPlay?: boolean;
  onRegenerateVoice?: () => void;
  isRegenerating?: boolean;
  onToast?: (message: string, type?: "success" | "error" | "info") => void;
}

export function DuetPlayer({
  story,
  audioUrl: audioOverride,
  autoPlay = false,
  onRegenerateVoice,
  isRegenerating,
  onToast,
}: DuetPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeLine, setActiveLine] = useState(-1);
  const [ambientOn, setAmbientOn] = useState(true);
  const [showTitle, setShowTitle] = useState(true);

  const activeAudio = audioOverride ?? story.audioUrl;
  const theme = EMOTION_THEME[story.emotion];
  const { start: startAmbient, stop: stopAmbient } = useAmbientAudio(story.emotion);

  const dialogue: DialogueLine[] = useMemo(
    () => story.dialogue ?? [],
    [story.dialogue]
  );
  const hasTimings = dialogue.some((l) => typeof l.startSec === "number");

  useEffect(() => {
    const t = setTimeout(() => setShowTitle(false), 2600);
    return () => clearTimeout(t);
  }, []);

  // Sync the active speaker line to playback position.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      if (!audio.duration) return;
      setProgress((audio.currentTime / audio.duration) * 100);

      let idx: number;
      if (hasTimings) {
        idx = 0;
        for (let i = 0; i < dialogue.length; i++) {
          const s = dialogue[i].startSec;
          if (typeof s === "number" && audio.currentTime >= s) idx = i;
        }
      } else {
        // Fallback: uniform split across the track.
        idx = Math.min(
          Math.floor((audio.currentTime / audio.duration) * dialogue.length),
          dialogue.length - 1
        );
      }
      setActiveLine(idx);
    };
    const onEnded = () => {
      setIsPlaying(false);
      stopAmbient();
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
    };
  }, [dialogue, hasTimings, activeAudio, stopAmbient]);

  // Auto-scroll the active bubble into view.
  useEffect(() => {
    if (activeLine < 0) return;
    lineRefs.current[activeLine]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [activeLine]);

  useEffect(() => {
    setIsPlaying(false);
    setProgress(0);
    setActiveLine(-1);
    stopAmbient();
  }, [activeAudio, stopAmbient]);

  useEffect(() => () => stopAmbient(), [stopAmbient]);

  useEffect(() => {
    if (!autoPlay || !activeAudio) return;
    const audio = audioRef.current;
    if (!audio) return;
    const timer = setTimeout(async () => {
      try {
        await audio.play();
        setIsPlaying(true);
        if (ambientOn) startAmbient();
      } catch {
        /* browser may block autoplay until a user gesture */
      }
    }, 2700);
    return () => clearTimeout(timer);
  }, [autoPlay, activeAudio, ambientOn, startAmbient]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio || !activeAudio) return;
    if (isPlaying) {
      audio.pause();
      stopAmbient();
      setIsPlaying(false);
    } else {
      try {
        await audio.play();
        if (ambientOn) startAmbient();
        setIsPlaying(true);
      } catch {
        // src missing/expired or codec unsupported — don't crash the page
        setIsPlaying(false);
        stopAmbient();
        notify("This conversation's audio is no longer available.", "error");
      }
    }
  };

  const seekToLine = (i: number) => {
    const audio = audioRef.current;
    const s = dialogue[i]?.startSec;
    if (audio && typeof s === "number") {
      audio.currentTime = s + 0.01;
      setActiveLine(i);
    }
  };

  const emotionLabel = EMOTIONS.find((e) => e.id === story.emotion)?.label;
  const langLabel = LANGUAGES.find((l) => l.id === story.language)?.label;

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/share/${story.shareSlug}`
      : `/share/${story.shareSlug}`;

  const notify = (msg: string, type?: "success" | "error" | "info") => {
    if (onToast) onToast(msg, type);
    else if (type !== "error") alert(msg);
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: story.title,
          text: "Listen to this conversation across time on Echoes",
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        notify("Share link copied!", "success");
      }
    } catch {
      /* user cancelled */
    }
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      `Listen to "${story.title}" on Echoes — a conversation across time.\n${shareUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  return (
    <div
      className={`relative overflow-hidden rounded-lg border bg-gradient-to-b ${theme.gradient} ${theme.ring} glow-ring`}
    >
      <div
        className="absolute inset-0 ken-burns opacity-30"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${theme.glow}, transparent 70%)`,
        }}
      />

      <AnimatePresence>
        {showTitle && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="absolute inset-0 z-10 flex items-center justify-center bg-cinema-bg/80 backdrop-blur-sm"
          >
            <div className="text-center px-8">
              <p className="text-xs uppercase tracking-widest text-cinema-accent-light mb-2">
                A Conversation Across Time
              </p>
              <h2 className="font-display text-3xl font-bold md:text-4xl">
                {story.title}
              </h2>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative p-6 md:p-10">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1 rounded-full glass px-3 py-1">
            <Clock className="h-3 w-3" />
            Dual voice
          </span>
          <span className="rounded-full glass px-3 py-1">{emotionLabel}</span>
          <span className="rounded-full glass px-3 py-1">{langLabel}</span>
        </div>

        <h1 className="mt-5 font-display text-2xl font-bold md:text-3xl">
          {story.title}
        </h1>

        <div className="mt-3 h-1 overflow-hidden rounded-full bg-cinema-text/10">
          <div
            className="h-full bg-cinema-accent transition-all duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Conversation bubbles */}
        <div className="mt-6 max-h-[420px] space-y-3 overflow-y-auto pr-1">
          {dialogue.map((line, i) => {
            const isA = line.speaker === "a";
            const active = i === activeLine;
            return (
              <div
                key={i}
                ref={(el) => {
                  lineRefs.current[i] = el;
                }}
                className={`flex ${isA ? "justify-start" : "justify-end"}`}
              >
                <button
                  type="button"
                  onClick={() => seekToLine(i)}
                  className={`max-w-[82%] rounded-2xl border px-4 py-3 text-left transition-all ${
                    isA ? "rounded-tl-sm" : "rounded-tr-sm"
                  } ${
                    active
                      ? "border-cinema-accent bg-cinema-accent/10 shadow-sm"
                      : "border-cinema-text/10 bg-cinema-text/[0.03] opacity-70 hover:opacity-100"
                  }`}
                >
                  <span
                    className={`block font-mono text-[10px] uppercase tracking-[0.15em] ${
                      isA ? "text-cinema-accent-light" : "text-emerald-800"
                    }`}
                  >
                    {line.speakerName}
                  </span>
                  <motion.span
                    animate={{ scale: active ? 1 : 0.99 }}
                    className="mt-1 block text-sm leading-relaxed text-cinema-text/90 md:text-base"
                  >
                    {line.text}
                  </motion.span>
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          {activeAudio ? (
            <>
              <audio
                ref={audioRef}
                key={activeAudio}
                src={activeAudio}
                preload="metadata"
              />
              <Button
                size="lg"
                onClick={togglePlay}
                className="h-14 w-14 rounded-full p-0"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <Pause className="h-6 w-6" />
                ) : (
                  <Play className="h-6 w-6 fill-current" />
                )}
              </Button>
              <Button
                variant={ambientOn ? "secondary" : "outline"}
                size="sm"
                onClick={() => {
                  setAmbientOn(!ambientOn);
                  if (!ambientOn && isPlaying) startAmbient();
                  else stopAmbient();
                }}
                className="gap-2"
                title="Toggle ambient music"
              >
                <Music className="h-4 w-4" />
                Ambient
              </Button>
              <Button variant="secondary" size="sm" onClick={handleShare} className="gap-2">
                <Share2 className="h-4 w-4" />
                Share
              </Button>
              <Button variant="secondary" size="sm" onClick={handleWhatsApp} className="gap-2">
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </Button>
              <a href={activeAudio} download={`echoes-${story.shareSlug}.mp3`}>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </a>
            </>
          ) : (
            <div className="text-center">
              <p className="text-cinema-muted mb-4">Voice narration not available yet.</p>
              {onRegenerateVoice && (
                <Button onClick={onRegenerateVoice} disabled={isRegenerating}>
                  {isRegenerating ? "Generating..." : "Generate Voice"}
                </Button>
              )}
            </div>
          )}
        </div>

        <p className="mt-6 flex items-center justify-center gap-2 text-xs text-cinema-muted">
          <Volume2 className="h-3 w-3" />
          Two voices narrated with Murf AI
        </p>
      </div>
    </div>
  );
}
