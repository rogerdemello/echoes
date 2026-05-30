import { promises as fs } from "fs";
import path from "path";
import { apiError } from "@/lib/api-utils";

const AUDIO_DIR = path.join(process.cwd(), "data", "audio");

export async function GET(
  _request: Request,
  { params }: { params: { name: string } }
) {
  try {
    const safe = path.basename(params.name);
    if (!safe || safe !== params.name) {
      return apiError("Invalid filename", 400);
    }
    if (path.extname(safe).toLowerCase() !== ".mp3") {
      return apiError("Not found", 404);
    }

    const filePath = path.join(AUDIO_DIR, safe);
    const buffer = await fs.readFile(filePath);

    return new Response(buffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return apiError("Not found", 404);
  }
}
