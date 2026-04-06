import { getR2Bucket } from "@/lib/r2Bindings";
import { requireAdmin } from "@/lib/adminRoute";

function jsonResponse(payload: unknown, init?: ResponseInit): Response {
  return Response.json(payload, init);
}

function guessContentType(key: string): string {
  const lower = key.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".gif")) return "image/gif";
  if (lower.endsWith(".bmp")) return "image/bmp";
  if (lower.endsWith(".avif")) return "image/avif";
  if (lower.endsWith(".svg")) return "image/svg+xml";
  return "application/octet-stream";
}

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;
  try {
    const url = new URL(request.url);
    const key = url.searchParams.get("key") || "";
    if (!key.trim()) {
      return jsonResponse({ ok: false, error: "key is required." }, { status: 400 });
    }

    const bucket = await getR2Bucket();
    if (!bucket) {
      return jsonResponse({ ok: false, error: "R2 binding is not available." }, { status: 500 });
    }

    const obj = await bucket.get(key);
    if (!obj || !obj.body) {
      return jsonResponse({ ok: false, error: "Image not found." }, { status: 404 });
    }

    const bytes = await obj.body.arrayBuffer();
    const contentType = obj.httpMetadata?.contentType || guessContentType(key);
    return new Response(bytes, {
      status: 200,
      headers: {
        "content-type": contentType,
        "cache-control": "public, max-age=3600",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to read image.";
    return jsonResponse({ ok: false, error: message }, { status: 500 });
  }
}
