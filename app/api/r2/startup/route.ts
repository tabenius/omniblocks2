import { getR2Bucket } from "@/lib/r2Bindings";
import {
  DEFAULT_STARTUP_ASSETS_KEY,
  emptyStartupAssetsPayload,
  sanitizeStartupAssetsPayload,
} from "@/lib/startupAssets";

function jsonResponse(payload: unknown, init?: ResponseInit): Response {
  return Response.json(payload, init);
}

export async function GET() {
  const key = process.env.R2_STARTUP_ASSETS_KEY || DEFAULT_STARTUP_ASSETS_KEY;
  const fallback = emptyStartupAssetsPayload();

  try {
    const bucket = await getR2Bucket();
    if (!bucket) {
      return jsonResponse({
        ok: true,
        source: "fallback",
        key,
        assets: fallback,
      });
    }

    const obj = await bucket.get(key);
    if (!obj || !obj.body) {
      return jsonResponse({
        ok: true,
        source: "fallback",
        key,
        assets: fallback,
      });
    }

    const raw = await obj.body.text();
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = null;
    }
    const assets = sanitizeStartupAssetsPayload(parsed);

    return jsonResponse({
      ok: true,
      source: "r2",
      key,
      assets,
    });
  } catch (error) {
    return jsonResponse({
      ok: true,
      source: "fallback",
      key,
      assets: fallback,
      warning: error instanceof Error ? error.message : "R2 startup load failed.",
    });
  }
}
