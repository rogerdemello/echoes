import { promises as fs } from "fs";
import { spawn } from "child_process";
import path from "path";
import ffmpegPath from "ffmpeg-static";
import type { Emotion } from "./types";

export const AUDIO_DIR = path.join(process.cwd(), "data", "audio");

// Mirrors lib/use-ambient-audio.ts — same emotional frequency mapping so the
// exported cinematic mix matches the live in-browser ambient pad.
export const EMOTION_FREQ: Record<Emotion, number> = {
  nostalgic: 196,
  calm: 174,
  hopeful: 220,
  dramatic: 165,
  joyful: 247,
};

export async function ensureAudioDir(): Promise<void> {
  await fs.mkdir(AUDIO_DIR, { recursive: true });
}

export async function downloadToFile(url: string, dest: string): Promise<void> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch narration: ${res.status} ${res.statusText}`);
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  await fs.writeFile(dest, buffer);
}

function buildFilterGraph(): string {
  // [0:a] = Murf narration. [1:a]..[3:a] = three detuned sine ambient layers
  // generated from lavfi sources. We mix the sines with low gain + tremolo +
  // echo + lowpass for a warm pad, then blend under the narration.
  return [
    `[1:a]volume=0.10[s1]`,
    `[2:a]volume=0.06[s2]`,
    `[3:a]volume=0.05[s3]`,
    `[s1][s2][s3]amix=inputs=3:duration=longest:dropout_transition=0[pad]`,
    `[pad]tremolo=f=0.25:d=0.30,aecho=0.6:0.5:80:0.3,lowpass=f=2000,volume=0.7[ambient]`,
    `[0:a]volume=1.0[voice]`,
    `[voice][ambient]amix=inputs=2:duration=first:dropout_transition=2,aformat=channel_layouts=stereo:sample_rates=44100[out]`,
  ].join(";");
}

export function spawnFfmpeg(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!ffmpegPath) {
      reject(new Error("ffmpeg binary not available"));
      return;
    }
    const proc = spawn(ffmpegPath, args, { windowsHide: true });
    let stderr = "";
    proc.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    proc.on("error", reject);
    proc.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg exited ${code}: ${stderr.slice(-500)}`));
    });
  });
}

/**
 * Run ffmpeg and resolve with its full stderr (ffmpeg writes Duration/progress
 * info to stderr). Used to read clip durations without a separate ffprobe binary
 * (ffmpeg-static ships ffmpeg only). Resolves even on non-zero exit for analysis
 * commands like `-f null -` so callers can still parse the header.
 */
export function runFfmpegCapture(args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!ffmpegPath) {
      reject(new Error("ffmpeg binary not available"));
      return;
    }
    const proc = spawn(ffmpegPath, args, { windowsHide: true });
    let stderr = "";
    proc.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    proc.on("error", reject);
    proc.on("close", () => resolve(stderr));
  });
}

export interface MixResult {
  /** Filename inside data/audio/ (e.g. "abc123.mp3") */
  filename: string;
  /** Public URL via the audio serving route */
  url: string;
}

/**
 * Download the Murf narration, generate a procedural emotion-tuned ambient pad
 * with ffmpeg lavfi sources, mix them, and write a permanent MP3.
 *
 * Returns a URL served by /api/audio/[name]. Throws on failure so callers can
 * fall back to the raw Murf URL.
 */
export async function mixNarrationWithAmbient(
  narrationUrl: string,
  emotion: Emotion,
  storyId: string
): Promise<MixResult> {
  await ensureAudioDir();

  const filename = `${storyId}.mp3`;
  const outputPath = path.join(AUDIO_DIR, filename);
  const tempNarration = path.join(AUDIO_DIR, `${storyId}.narration.mp3`);

  try {
    await downloadToFile(narrationUrl, tempNarration);

    const base = EMOTION_FREQ[emotion];
    const high = (base * 1.25).toFixed(2);
    const low = (base * 0.75).toFixed(2);

    const args = [
      "-y",
      "-i", tempNarration,
      "-f", "lavfi", "-i", `sine=frequency=${base}:sample_rate=44100`,
      "-f", "lavfi", "-i", `sine=frequency=${high}:sample_rate=44100`,
      "-f", "lavfi", "-i", `sine=frequency=${low}:sample_rate=44100`,
      "-filter_complex", buildFilterGraph(),
      "-map", "[out]",
      "-c:a", "libmp3lame",
      "-b:a", "192k",
      outputPath,
    ];

    await spawnFfmpeg(args);

    return {
      filename,
      url: `/api/audio/${filename}`,
    };
  } finally {
    await fs.unlink(tempNarration).catch(() => {});
  }
}
