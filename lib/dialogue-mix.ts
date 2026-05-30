import { promises as fs } from "fs";
import path from "path";
import {
  AUDIO_DIR,
  EMOTION_FREQ,
  downloadToFile,
  ensureAudioDir,
  runFfmpegCapture,
  spawnFfmpeg,
} from "./audio-mix";
import type { Emotion } from "./types";

/** Silence inserted between alternating speaker lines (seconds). */
const GAP = 0.4;
/** Fallback duration if a clip's length can't be parsed (seconds). */
const DEFAULT_DUR = 3.0;

export interface DialogueClip {
  /** Murf MP3 URL for one spoken line. */
  url: string;
}

export interface DialogueMixResult {
  /** Filename inside data/audio/ (e.g. "abc123.mp3") */
  filename: string;
  /** Public URL via the audio serving route */
  url: string;
  /** Per-line timing in stitched order — drives speaker-highlight sync. */
  timings: { startSec: number; durationSec: number }[];
}

/** Parse a `Duration: HH:MM:SS.xx` line from ffmpeg stderr → seconds. */
function parseDuration(stderr: string): number | null {
  const m = stderr.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/);
  if (!m) return null;
  return Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]);
}

/** Measure a single clip's spoken duration without ffprobe (ffmpeg-static has none). */
async function measureDuration(file: string): Promise<number> {
  try {
    const stderr = await runFfmpegCapture(["-i", file, "-f", "null", "-"]);
    const dur = parseDuration(stderr);
    return dur && dur > 0 ? dur : DEFAULT_DUR;
  } catch {
    return DEFAULT_DUR;
  }
}

/**
 * Build the filter graph for N voice clips + 3 ambient sine inputs.
 * Each clip is normalized and gets a trailing silence pad (GAP) so the
 * concatenated timeline exactly matches the computed startSec offsets.
 */
function buildDuetFilterGraph(n: number): string {
  const parts: string[] = [];
  for (let i = 0; i < n; i++) {
    parts.push(
      `[${i}:a]aformat=channel_layouts=stereo:sample_rates=44100,apad=pad_dur=${GAP}[c${i}]`
    );
  }
  const concatInputs = Array.from({ length: n }, (_, i) => `[c${i}]`).join("");
  parts.push(`${concatInputs}concat=n=${n}:v=0:a=1[joined]`);

  // Ambient sine inputs follow the n voice inputs at indices n, n+1, n+2.
  parts.push(`[${n}:a]volume=0.10[s1]`);
  parts.push(`[${n + 1}:a]volume=0.06[s2]`);
  parts.push(`[${n + 2}:a]volume=0.05[s3]`);
  parts.push(`[s1][s2][s3]amix=inputs=3:duration=longest:dropout_transition=0[pad]`);
  parts.push(
    `[pad]tremolo=f=0.25:d=0.30,aecho=0.6:0.5:80:0.3,lowpass=f=2000,volume=0.7[ambient]`
  );
  parts.push(`[joined]volume=1.0[voice]`);
  parts.push(
    `[voice][ambient]amix=inputs=2:duration=first:dropout_transition=2,aformat=channel_layouts=stereo:sample_rates=44100[out]`
  );
  return parts.join(";");
}

/**
 * Download each dialogue line's Murf clip, stitch them in order with short
 * silences between speakers, blend the emotion-tuned ambient pad underneath,
 * and write a permanent MP3 to data/audio/{storyId}.mp3.
 *
 * Returns per-line timings so the player can highlight the active speaker.
 * Throws on failure so the caller can fall back to the raw first-clip URL.
 */
export async function mixDialogueWithAmbient(
  clips: DialogueClip[],
  emotion: Emotion,
  storyId: string
): Promise<DialogueMixResult> {
  if (clips.length === 0) throw new Error("No dialogue clips to mix");

  await ensureAudioDir();

  const filename = `${storyId}.mp3`;
  const outputPath = path.join(AUDIO_DIR, filename);
  const lineFiles = clips.map((_, i) =>
    path.join(AUDIO_DIR, `${storyId}.line${i}.mp3`)
  );

  try {
    // 1. Download every clip.
    await Promise.all(
      clips.map((clip, i) => downloadToFile(clip.url, lineFiles[i]))
    );

    // 2. Measure durations → compute cumulative start offsets (incl. gaps).
    const durations = await Promise.all(lineFiles.map(measureDuration));
    const timings: { startSec: number; durationSec: number }[] = [];
    let cursor = 0;
    for (let i = 0; i < durations.length; i++) {
      timings.push({ startSec: cursor, durationSec: durations[i] });
      cursor += durations[i] + GAP;
    }

    // 3. Single ffmpeg pass: concat-with-gaps + ambient mix.
    const base = EMOTION_FREQ[emotion];
    const high = (base * 1.25).toFixed(2);
    const low = (base * 0.75).toFixed(2);

    const inputArgs: string[] = [];
    for (const f of lineFiles) inputArgs.push("-i", f);
    inputArgs.push("-f", "lavfi", "-i", `sine=frequency=${base}:sample_rate=44100`);
    inputArgs.push("-f", "lavfi", "-i", `sine=frequency=${high}:sample_rate=44100`);
    inputArgs.push("-f", "lavfi", "-i", `sine=frequency=${low}:sample_rate=44100`);

    const args = [
      "-y",
      ...inputArgs,
      "-filter_complex",
      buildDuetFilterGraph(clips.length),
      "-map",
      "[out]",
      "-c:a",
      "libmp3lame",
      "-b:a",
      "192k",
      outputPath,
    ];

    await spawnFfmpeg(args);

    return { filename, url: `/api/audio/${filename}`, timings };
  } finally {
    await Promise.all(
      lineFiles.map((f) => fs.unlink(f).catch(() => {}))
    );
  }
}
