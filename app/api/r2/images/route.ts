import { getR2Bucket, type R2ObjectLike } from "@/lib/r2Bindings";
import { requireAdmin } from "@/lib/adminRoute";

const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;
const IMAGE_EXT_RE = /\.(png|jpe?g|webp|gif|bmp|avif|svg)$/i;

function jsonResponse(payload: unknown, init?: ResponseInit): Response {
  return Response.json(payload, init);
}

function safeFileName(name: string): string {
  return (
    String(name || "upload")
      .trim()
      .replace(/[\\/]/g, "-")
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9._-]/g, "")
      .slice(0, 120) || "upload"
  );
}

function normalizePrefix(input: string): string {
  const cleaned = input.trim().replace(/^\/+/, "");
  return cleaned || "uploads/";
}

function toIso(value: unknown): string | null {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string" && value.trim()) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }
  return null;
}

function getPublicBaseUrl(): string {
  return (process.env.CF_R2_PUBLIC_URL || process.env.S3_PUBLIC_URL || "").replace(/\/+$/, "");
}

function toImageUrl(key: string, publicUrl: string): string {
  if (publicUrl) return `${publicUrl}/${key}`;
  return `/api/r2/object?key=${encodeURIComponent(key)}`;
}

function mapR2ObjectToItem(obj: R2ObjectLike, publicUrl: string) {
  return {
    key: obj.key,
    url: toImageUrl(obj.key, publicUrl),
    size: Number(obj.size || 0),
    lastModified: toIso(obj.uploaded),
  };
}

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;
  try {
    const bucket = await getR2Bucket();
    if (!bucket) {
      return jsonResponse(
        { ok: false, error: "R2 binding is not available." },
        { status: 500 },
      );
    }

    const url = new URL(request.url);
    const limitRaw = Number.parseInt(url.searchParams.get("limit") || "40", 10);
    const limit = Number.isFinite(limitRaw) ? Math.max(1, Math.min(100, limitRaw)) : 40;
    const prefix = normalizePrefix(url.searchParams.get("prefix") || "uploads/");
    const listed = await bucket.list({ prefix, limit });
    const publicUrl = getPublicBaseUrl();

    const items = (listed.objects || [])
      .filter((obj) => obj.key && IMAGE_EXT_RE.test(obj.key))
      .map((obj) => mapR2ObjectToItem(obj, publicUrl));

    return jsonResponse({ ok: true, items });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to list R2 images.";
    return jsonResponse({ ok: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;
  try {
    const bucket = await getR2Bucket();
    if (!bucket) {
      return jsonResponse(
        { ok: false, error: "R2 binding is not available." },
        { status: 500 },
      );
    }

    const formData = await request.formData();
    const incoming = formData.get("file");
    if (!(incoming instanceof File)) {
      return jsonResponse({ ok: false, error: "file is required." }, { status: 400 });
    }
    if (incoming.size > MAX_UPLOAD_BYTES) {
      return jsonResponse(
        { ok: false, error: `File too large (max ${MAX_UPLOAD_BYTES / (1024 * 1024)} MB).` },
        { status: 400 },
      );
    }

    const fileName = safeFileName(incoming.name);
    const key = `uploads/${Date.now()}-${fileName}`;
    const contentType = incoming.type || "application/octet-stream";
    const bytes = new Uint8Array(await incoming.arrayBuffer());

    await bucket.put(key, bytes, {
      httpMetadata: {
        contentType,
      },
    });

    const publicUrl = getPublicBaseUrl();

    return jsonResponse({
      ok: true,
      item: {
        key,
        url: toImageUrl(key, publicUrl),
        size: incoming.size,
        lastModified: new Date().toISOString(),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to upload image.";
    return jsonResponse({ ok: false, error: message }, { status: 500 });
  }
}
