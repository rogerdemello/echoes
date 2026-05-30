import { promises as fs } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { apiError, apiSuccess } from "@/lib/api-utils";

const UPLOADS_DIR = path.join(process.cwd(), "data", "uploads");

const MIME_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("photo");

    if (!file || !(file instanceof File)) {
      return apiError("photo file is required (field name: photo)");
    }

    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      return apiError("Image must be under 5MB");
    }

    const allowed =
      file.type.startsWith("image/") ||
      /\.(jpe?g|png|webp|gif)$/i.test(file.name);
    if (!allowed) {
      return apiError("Upload a JPEG, PNG, WebP, or GIF image.");
    }

    let ext = MIME_EXT[file.type];
    if (!ext) {
      const match = file.name.match(/\.(jpe?g|png|webp|gif)$/i);
      ext = match ? `.${match[1].toLowerCase().replace("jpeg", "jpg")}` : ".jpg";
    }
    if (ext === ".jpeg") ext = ".jpg";

    await fs.mkdir(UPLOADS_DIR, { recursive: true });
    const id = uuidv4();
    const filename = `${id}${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(path.join(UPLOADS_DIR, filename), buffer);

    return apiSuccess({ photoUrl: `/api/photos/${filename}` });
  } catch (error) {
    console.error("POST /api/upload-photo:", error);
    return apiError(
      error instanceof Error ? error.message : "Photo upload failed",
      500
    );
  }
}
