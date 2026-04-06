import { requireAdmin } from "@/lib/adminRoute";
import { getR2Bucket } from "@/lib/r2Bindings";

type SavedPage = {
  name: string;
  slug: string;
  content: string;
  updatedAt: string;
};

const MAX_PAGE_BYTES = 2_500_000;

function jsonResponse(payload: unknown, init?: ResponseInit): Response {
  return Response.json(payload, init);
}

function getPagesPrefix(): string {
  const raw = String(process.env.R2_PAGES_PREFIX || "saved-pages/").trim();
  if (!raw) return "saved-pages/";
  return raw.endsWith("/") ? raw : `${raw}/`;
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function asIsoString(value: unknown): string {
  const raw = typeof value === "string" ? value : "";
  const date = new Date(raw);
  if (!raw || Number.isNaN(date.getTime())) return new Date().toISOString();
  return date.toISOString();
}

function coerceSavedPage(value: unknown): SavedPage | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const name = typeof record.name === "string" ? record.name.trim() : "";
  const slug = typeof record.slug === "string" ? slugify(record.slug) : "";
  const content = typeof record.content === "string" ? record.content : "";
  const updatedAt = asIsoString(record.updatedAt);
  if (!name || !slug || !content) return null;
  return { name, slug, content, updatedAt };
}

function fileKeyForSlug(prefix: string, slug: string): string {
  return `${prefix}${slug}.json`;
}

async function listSavedPages(prefix: string): Promise<SavedPage[]> {
  const bucket = await getR2Bucket();
  if (!bucket) throw new Error("R2 binding is not available.");
  const listed = await bucket.list({ prefix, limit: 200 });
  const keys = (listed.objects || [])
    .map((item) => item.key)
    .filter((key) => key.startsWith(prefix) && key.endsWith(".json"));

  const docs = (
    await Promise.all(
      keys.map(async (key) => {
        const object = await bucket.get(key);
        if (!object?.body) return null;
        try {
          const raw = await object.body.text();
          return coerceSavedPage(JSON.parse(raw));
        } catch {
          return null;
        }
      }),
    )
  ).filter((doc): doc is SavedPage => Boolean(doc));

  return docs.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;
  const prefix = getPagesPrefix();

  try {
    const bucket = await getR2Bucket();
    if (!bucket) {
      return jsonResponse(
        { ok: false, error: "R2 binding is not available." },
        { status: 500 },
      );
    }

    const url = new URL(request.url);
    const slug = slugify(url.searchParams.get("slug") || "");
    if (!slug) {
      const docs = await listSavedPages(prefix);
      return jsonResponse({ ok: true, docs });
    }

    const key = fileKeyForSlug(prefix, slug);
    const obj = await bucket.get(key);
    if (!obj?.body) {
      return jsonResponse({ ok: false, error: "Saved page not found." }, { status: 404 });
    }
    const raw = await obj.body.text();
    let parsed: SavedPage | null = null;
    try {
      parsed = coerceSavedPage(JSON.parse(raw));
    } catch {
      parsed = null;
    }
    if (!parsed) {
      return jsonResponse(
        { ok: false, error: "Saved page payload is invalid." },
        { status: 500 },
      );
    }
    return jsonResponse({ ok: true, doc: parsed });
  } catch (error) {
    return jsonResponse(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : "Failed to load saved pages from R2.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;
  const prefix = getPagesPrefix();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const record = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const name = typeof record.name === "string" ? record.name.trim() : "";
  const incomingSlug = typeof record.slug === "string" ? record.slug : "";
  const slug = slugify(incomingSlug || name);
  const content = typeof record.content === "string" ? record.content : "";
  if (!name) {
    return jsonResponse({ ok: false, error: "File name is required." }, { status: 400 });
  }
  if (!slug) {
    return jsonResponse(
      { ok: false, error: "File name must include letters or numbers." },
      { status: 400 },
    );
  }
  if (!content.trim()) {
    return jsonResponse({ ok: false, error: "Document content is empty." }, { status: 400 });
  }
  if (new Blob([content]).size > MAX_PAGE_BYTES) {
    return jsonResponse(
      { ok: false, error: "Document is too large to save." },
      { status: 400 },
    );
  }

  try {
    const bucket = await getR2Bucket();
    if (!bucket) {
      return jsonResponse(
        { ok: false, error: "R2 binding is not available." },
        { status: 500 },
      );
    }
    const doc: SavedPage = {
      name,
      slug,
      content,
      updatedAt: new Date().toISOString(),
    };
    const key = fileKeyForSlug(prefix, slug);
    await bucket.put(key, JSON.stringify(doc), {
      httpMetadata: {
        contentType: "application/json; charset=utf-8",
      },
    });
    return jsonResponse({ ok: true, doc });
  } catch (error) {
    return jsonResponse(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Failed to save page to R2.",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;
  const prefix = getPagesPrefix();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  const record = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const slug = slugify(typeof record.slug === "string" ? record.slug : "");
  if (!slug) {
    return jsonResponse({ ok: false, error: "Missing page slug." }, { status: 400 });
  }

  try {
    const bucket = await getR2Bucket();
    if (!bucket) {
      return jsonResponse(
        { ok: false, error: "R2 binding is not available." },
        { status: 500 },
      );
    }
    if (typeof bucket.delete !== "function") {
      return jsonResponse(
        { ok: false, error: "R2 delete operation is not supported." },
        { status: 500 },
      );
    }
    const key = fileKeyForSlug(prefix, slug);
    await bucket.delete(key);
    return jsonResponse({ ok: true, slug });
  } catch (error) {
    return jsonResponse(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Failed to delete page from R2.",
      },
      { status: 500 },
    );
  }
}
