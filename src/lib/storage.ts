import "server-only";
import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

const MAX_BYTES = 3 * 1024 * 1024;

/** Detect image type from magic bytes (never trust the browser-provided MIME type). */
function sniff(buf: Buffer): { ext: string; mime: string } | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return { ext: "jpg", mime: "image/jpeg" };
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return { ext: "png", mime: "image/png" };
  if (buf.subarray(0, 4).toString("ascii") === "RIFF" && buf.subarray(8, 12).toString("ascii") === "WEBP") return { ext: "webp", mime: "image/webp" };
  if (buf.subarray(4, 12).toString("ascii").startsWith("ftypavi")) return { ext: "avif", mime: "image/avif" };
  return null;
}

export function storageMode() {
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) return "supabase" as const;
  if (process.env.NODE_ENV !== "production") return "local" as const;
  return "none" as const;
}

/**
 * Upload a product image.
 * - Supabase Storage (free tier, 1 GB) when SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are set
 * - public/uploads in local development
 */
export async function uploadProductImage(file: File): Promise<{ url: string } | { error: string }> {
  if (file.size === 0) return { error: "Empty file." };
  if (file.size > MAX_BYTES) return { error: "Image must be 3 MB or smaller. Compress it (e.g. squoosh.app) and try again." };
  const buf = Buffer.from(await file.arrayBuffer());
  const kind = sniff(buf);
  if (!kind) return { error: "Only JPEG, PNG, WebP or AVIF images are allowed." };
  const name = `${new Date().toISOString().slice(0, 7)}/${randomUUID()}.${kind.ext}`;

  const mode = storageMode();
  if (mode === "supabase") {
    const base = process.env.SUPABASE_URL!.replace(/\/$/, "");
    const bucket = process.env.SUPABASE_BUCKET || "product-images";
    const res = await fetch(`${base}/storage/v1/object/${bucket}/${name}`, {
      method: "POST",
      headers: {
        // Works with both legacy service_role JWTs and newer sb_secret_… keys
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": kind.mime,
        "Cache-Control": "31536000",
        "x-upsert": "false",
      },
      body: buf,
    });
    if (!res.ok) return { error: `Upload failed (${res.status}). Check the bucket "${bucket}" exists and is public.` };
    return { url: `${base}/storage/v1/object/public/${bucket}/${name}` };
  }
  if (mode === "local") {
    const dir = path.join(process.cwd(), "public", "uploads", path.dirname(name));
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(process.cwd(), "public", "uploads", name), buf);
    return { url: `/uploads/${name}` };
  }
  return { error: "Image storage isn't configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (see docs/DEPLOYMENT.md), or paste an image URL." };
}
