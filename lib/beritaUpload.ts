import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

type UploadedFile = {
  filename: string;
};

type SaveOptions = {
  resizeWidth: number | null;
};

const uploadDir = path.join(process.cwd(), "public", "uploads", "berita");

async function ensureUploadDir() {
  try {
    await fs.mkdir(uploadDir, { recursive: true });
  } catch (err) {
    console.error(`[beritaUpload] gagal membuat folder upload: ${uploadDir}`, err);
    throw err;
  }
}

function parseResizeWidth(value: unknown): number | null {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;

  // Keep width in a sane range to avoid extreme memory usage.
  return Math.min(4000, Math.max(320, Math.round(parsed)));
}

async function saveFile(file: File, options: SaveOptions) {
  let buffer: Buffer;
  try {
    buffer = Buffer.from(await file.arrayBuffer()) as Buffer<ArrayBufferLike>;
  } catch (err) {
    console.error('[beritaUpload] gagal membaca file.arrayBuffer()', err, { name: file?.name, type: file?.type });
    throw err;
  }
  const extFromName = path.extname(file.name).toLowerCase();
  const extFromType = file.type === "image/jpeg"
    ? ".jpg"
    : file.type === "image/png"
      ? ".png"
      : file.type === "image/webp"
        ? ".webp"
        : "";
  const ext = extFromName || extFromType || ".bin";
  let output: Buffer<ArrayBufferLike> = buffer;

  if (file.type.startsWith("image/") && options.resizeWidth) {
    try {
      output = await sharp(buffer)
        .rotate()
        .resize({
          width: options.resizeWidth,
          withoutEnlargement: true,
        })
        .toBuffer();
    } catch {
      output = buffer;
    }
  }

  const filename = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;

  const targetPath = path.join(uploadDir, filename);
  try {
    await fs.writeFile(targetPath, output);
    console.log(`[beritaUpload] saved ${filename} (${(output.length||0)} bytes) to ${targetPath}`);
    return filename;
  } catch (err) {
    console.error(`[beritaUpload] gagal menyimpan file ke ${targetPath}`, err);
    throw err;
  }
}

export async function parseBeritaFormData(request: Request) {
  await ensureUploadDir();

  const formData = await request.formData();
  const body: Record<string, unknown> = {};
  const files: UploadedFile[] = [];
  const pendingFiles: File[] = [];

  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      if (key === "content_images") {
        pendingFiles.push(value);
      }
      continue;
    }

    if (Object.prototype.hasOwnProperty.call(body, key)) {
      const existing = body[key];
      body[key] = Array.isArray(existing) ? [...existing, value] : [existing, value];
      continue;
    }

    body[key] = value;
  }

  const resizeWidth = parseResizeWidth(body.resizeWidth);
  for (const file of pendingFiles) {
    files.push({ filename: await saveFile(file, { resizeWidth }) });
  }

  return { body, files };
}