import { getD1Database, type D1DatabaseLike } from "@/lib/d1Bindings";

export const runtime = "edge";

function jsonResponse(payload: unknown, init?: ResponseInit): Response {
  return Response.json(payload, init);
}

type ContactRecord = {
  id: string;
  email: string;
  phone: string;
  name: string;
  notes: string;
  created_at: string;
  updated_at: string;
};

type ContactPayload = {
  id?: string;
  email?: string;
  phone?: string;
  name?: string;
  notes?: string;
};

type ContactPurchaseRow = {
  product_id: string;
  granted_at: string;
  title: string | null;
  name: string | null;
  currency: string | null;
  price_cents: number | null;
};

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function normalizeContactRow(row: ContactRecord) {
  return {
    id: asString(row.id),
    email: asString(row.email),
    phone: asString(row.phone),
    name: asString(row.name),
    notes: asString(row.notes),
    createdAt: asString(row.created_at),
    updatedAt: asString(row.updated_at),
  };
}

function parsePayload(value: unknown): ContactPayload {
  if (!value || typeof value !== "object") return {};
  return value as ContactPayload;
}

function makeContactId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `contact-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

async function listPurchasesByEmail(db: D1DatabaseLike, email: string) {
  const safeEmail = normalizeEmail(email);
  if (!safeEmail) return [];
  const { results } = await db
    .prepare(
      `SELECT
         da.product_id,
         da.granted_at,
         p.title,
         p.name,
         p.currency,
         p.price_cents
       FROM digital_access da
       LEFT JOIN products p ON p.slug = da.product_id
       WHERE da.email = ?
       ORDER BY da.granted_at DESC
       LIMIT 200`,
    )
    .bind(safeEmail)
    .all<ContactPurchaseRow>();
  return (results || []).map((row) => ({
    productId: asString(row.product_id),
    title: asString(row.title || row.name || row.product_id),
    grantedAt: asString(row.granted_at),
    currency: asString(row.currency || ""),
    priceCents:
      typeof row.price_cents === "number" && Number.isFinite(row.price_cents)
        ? row.price_cents
        : null,
  }));
}

async function requireDb(): Promise<D1DatabaseLike | Response> {
  const db = await getD1Database();
  if (!db) {
    return jsonResponse(
      { error: "D1 binding DB is not available in this runtime." },
      { status: 500 },
    );
  }
  return db;
}

export async function GET(request: Request) {
  const db = await requireDb();
  if (db instanceof Response) return db;
  const { searchParams } = new URL(request.url);
  const email = normalizeEmail(searchParams.get("email") || "");

  if (email) {
    try {
      const purchases = await listPurchasesByEmail(db, email);
      return jsonResponse({ purchases });
    } catch (error) {
      return jsonResponse(
        { error: "Failed to load purchases.", details: String(error) },
        { status: 500 },
      );
    }
  }

  try {
    const { results } = await db
      .prepare(
        "SELECT id, email, phone, name, notes, created_at, updated_at FROM contacts ORDER BY updated_at DESC LIMIT 500",
      )
      .all<ContactRecord>();
    const contacts = (results || [])
      .map((row) => normalizeContactRow(row))
      .filter((item) => item.id.length > 0);
    return jsonResponse({ contacts });
  } catch (error) {
    return jsonResponse(
      { error: "Failed to load contacts.", details: String(error) },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const db = await requireDb();
  if (db instanceof Response) return db;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body." }, { status: 400 });
  }
  const payload = parsePayload(body);
  const id = asString(payload.id).trim() || makeContactId();
  const now = new Date().toISOString();
  const email = asString(payload.email).trim();
  const phone = asString(payload.phone).trim();
  const name = asString(payload.name).trim();
  const notes = asString(payload.notes);

  if (!id) {
    return jsonResponse({ error: "Missing contact id." }, { status: 400 });
  }

  try {
    await db
      .prepare(
        `INSERT INTO contacts (id, email, phone, name, notes, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           email = excluded.email,
           phone = excluded.phone,
           name = excluded.name,
           notes = excluded.notes,
           updated_at = excluded.updated_at`,
      )
      .bind(id, email, phone, name, notes, now, now)
      .run();

    const row = await db
      .prepare(
        "SELECT id, email, phone, name, notes, created_at, updated_at FROM contacts WHERE id = ? LIMIT 1",
      )
      .bind(id)
      .first<ContactRecord>();
    if (!row) {
      return jsonResponse(
        { error: "Contact save did not return a row." },
        { status: 500 },
      );
    }
    return jsonResponse({ contact: normalizeContactRow(row) });
  } catch (error) {
    return jsonResponse(
      { error: "Failed to save contact.", details: String(error) },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  const db = await requireDb();
  if (db instanceof Response) return db;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  const payload = parsePayload(body);
  const id = asString(payload.id).trim();
  if (!id) {
    return jsonResponse({ error: "Missing contact id." }, { status: 400 });
  }

  try {
    await db.prepare("DELETE FROM contacts WHERE id = ?").bind(id).run();
    return jsonResponse({ ok: true, id });
  } catch (error) {
    return jsonResponse(
      { error: "Failed to delete contact.", details: String(error) },
      { status: 500 },
    );
  }
}
