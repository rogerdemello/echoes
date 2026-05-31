"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Pause,
  Play,
  Volume2,
  Share2,
  Download,
  Music,
  MessageCircle,
} from "lucide-react";
import { Button } from "./ui/button";
import type { Story } from "@/lib/types";
import { EMOTIONS, LANGUAGES, STORY_STYLES } from "@/lib/constants";
import { EMOTION_THEME } from "@/lib/emotion-theme";
import { useAmbientAudio } from "@/lib/use-ambient-audio";

interface StoryPlayerProps {
  story: Story;
  audioUrl?: string | null;
  displayText?: string;
  autoPlay?: boolean;
  onRegenerateVoice?: () => void;
  isRegenerating?: boolean;
  onToast?: (message: string, type?: "success" | "error" | "info") => void;
  onLineChange?: (lineIndex: number) => void;
  onPlayingChange?: (playing: boolean) => void;
  seekToken?: number;
  seekToLine?: number;
}

export function StoryPlayer({
  story,
  audioUrl: audioOverride,
  displayText,
  autoPlay = false,
  onRegenerateVoice,
  isRegenerating,
  onToast,
  onLineChange,
  onPlayingChange,
  seekToken,
  seekToLine,
}: StoryPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentLine, setCurrentLine] = useState(0);
  const [ambientOn, setAmbientOn] = useState(true);
  const [showTitle, setShowTitle] = useState(true);
  const [audioError, setAudioError] = useState(false);

  const activeAudio = audioOverride ?? story.audioUrl;
  const narration = displayText ?? story.enhancedStory;
  const photoUrl = story.photoUrl;
  const theme = EMOTION_THEME[story.emotion];
  const { start: startAmbient, stop: stopAmbient } = useAmbientAudio(story.emotion);

  const sentences = narration.split(/(?<=[.!?])\s+/).filter(Boolean);

  useEffect(() => {
    const t = setTimeout(() => setShowTitle(false), 2800);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
        const idx = Math.floor(
          (audio.currentTime / audio.duration) * sentences.length
        );
        const line = Math.min(idx, sentences.length - 1);
        setCurrentLine(line);
        onLineChange?.(line);
      }
    };
    const onEnded = () => {
      setIsPlaying(false);
      onPlayingChange?.(false);
      stopAmbient();
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
    };
  }, [sentences.length, activeAudio, stopAmbient, onLineChange, onPlayingChange]);

  useEffect(() => {
    if (seekToken === undefined || seekToLine === undefined) return;
    const audio = audioRef.current;
    if (!audio || !activeAudio) return;
    const line = Math.min(Math.max(0, seekToLine), sentences.length - 1);
    const seek = () => {
      if (audio.duration) {
        audio.currentTime =
          (line / Math.max(sentences.length, 1)) * audio.duration;
      }
      setCurrentLine(line);
      onLineChange?.(line);
    };
    if (audio.duration) seek();
    else audio.addEventListener("loadedmetadata", seek, { once: true });
  }, [seekToken, seekToLine, activeAudio, sentences.length, onLineChange]);

  useEffect(() => {
    setIsPlaying(false);
    onPlayingChange?.(false);
    setProgress(0);
    setCurrentLine(0);
    setAudioError(false);
    stopAmbient();
  }, [activeAudio, narration, stopAmbient, onPlayingChange]);

  useEffect(() => () => stopAmbient(), [stopAmbient]);

  useEffect(() => {
    if (!autoPlay || !activeAudio) return;
    const audio = audioRef.current;
    if (!audio) return;

    const timer = setTimeout(async () => {
      try {
        await audio.play();
        setIsPlaying(true);
        onPlayingChange?.(true);
        if (ambientOn) startAmbient();
      } catch {
        /* browser may block autoplay until user gesture */
      }
    }, 2900);

    return () => clearTimeout(timer);
  }, [autoPlay, activeAudio, ambientOn, startAmbient, onPlayingChange]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio || !activeAudio) return;
    if (isPlaying) {
      audio.pause();
      stopAmbient();
      setIsPlaying(false);
      onPlayingChange?.(false);
    } else {
      try {
        await audio.play();
        if (ambientOn) startAmbient();
        setIsPlaying(true);
        onPlayingChange?.(true);
      } catch {
        // src missing/expired or codec unsupported — fail to the regenerate UI
        setAudioError(true);
        setIsPlaying(false);
        onPlayingChange?.(false);
        stopAmbient();
        notify("This memory's audio is no longer available — regenerate it.", "error");
      }
    }
  };

  const emotionLabel = EMOTIONS.find((e) => e.id === story.emotion)?.label;
  const langLabel = LANGUAGES.find((l) => l.id === story.language)?.label;
  const styleLabel = STORY_STYLES.find((s) => s.id === story.storyStyle)?.label;

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
          text: "Listen to this memory on Echoes",
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
      `Listen to "${story.title}" on Echoes — a cinematic memory story.\n${shareUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border bg-gradient-to-b ${theme.gradient} ${theme.ring} glow-ring`}
    >
      {/* Ken Burns background — photo or gradient */}
      {photoUrl ? (
        <div className="absolute inset-0 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photoUrl}
            alt=""
            className="ken-burns h-full w-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-cinema-bg via-cinema-bg/60 to-transparent" />
        </div>
      ) : (
        <div
          className="absolute inset-0 ken-burns opacity-40"
          style={{
            background: `radial-gradient(ellipse at 30% 20%, ${theme.glow}, transparent 70%)`,
          }}
        />
      )}

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
                An Echo
              </p>
              <h2 className="font-display text-3xl font-bold md:text-4xl">
                {story.title}
              </h2>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative p-8 md:p-12">
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-full glass px-3 py-1">{styleLabel}</span>
          <span className="rounded-full glass px-3 py-1">{emotionLabel}</span>
          <span className="rounded-full glass px-3 py-1">{langLabel}</span>
        </div>

        <h1 className="mt-6 font-display text-3xl font-bold md:text-4xl">
          {story.title}
        </h1>

        <div className="mt-8 flex h-16 items-end justify-center gap-1">
          {Array.from({ length: 48 }).map((_, i) => (
            <motion.div
              key={i}
              className="w-1 rounded-full bg-cinema-accent/60"
              animate={{
                height: isPlaying
                  ? `${20 + Math.sin(i * 0.5) * 25 + (i % 7) * 5}%`
                  : `${15 + (i % 5) * 8}%`,
              }}
              transition={{ duration: 0.2 }}
            />
          ))}
        </div>

        <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full bg-cinema-accent transition-all duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-8 min-h-[120px]">
          <AnimatePresence mode="wait">
            <motion.p
              key={currentLine}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="text-center text-lg leading-relaxed text-cinema-text/90 md:text-xl"
            >
              {sentences[currentLine] ?? sentences[0]}
            </motion.p>
          </AnimatePresence>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {activeAudio && !audioError ? (
            <>
              <audio
                ref={audioRef}
                key={activeAudio}
                src={activeAudio}
                preload="metadata"
                onError={() => setAudioError(true)}
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
              <p className="text-cinema-muted mb-4">
                {audioError
                  ? "This memory's audio is no longer available."
                  : "Voice narration not available yet."}
              </p>
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
          Narrated with Murf AI
        </p>
      </div>
    </div>
  );
}
