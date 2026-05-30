import { promises as fs } from "fs";
import path from "path";
import { apiError } from "@/lib/api-utils";

const UPLOADS_DIR = path.join(process.cwd(), "data", "uploads");

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

export async function GET(
  _request: Request,
  { params }: { params: { name: string } }
) {
  try {
    const safe = path.basename(params.name);
    if (!safe || safe !== params.name) {
      return apiError("Invalid filename", 400);
    }

    const ext = path.extname(safe).toLowerCase();
    if (!CONTENT_TYPES[ext]) {
      return apiError("Not found", 404);
    }

    const filePath = path.join(UPLOADS_DIR, safe);
    const buffer = await fs.readFile(filePath);

    return new Response(buffer, {
      headers: {
        "Content-Type": CONTENT_TYPES[ext],
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return apiError("Not found", 404);
  }
}
