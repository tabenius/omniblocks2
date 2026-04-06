import { getD1Database, type D1DatabaseLike } from "@/lib/d1Bindings";
import { requireAdmin } from "@/lib/adminRoute";

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
  user_id?: string | null;
  username?: string | null;
  source?: string | null;
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

type UserRecord = {
  id: string;
  email: string;
  name: string;
  username: string;
  created_at: string;
  updated_at: string;
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
    userId: asString(row.user_id),
    username: asString(row.username),
    source: asString(row.source),
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

function makeUserId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `user-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function buildUsernameFromEmail(email: string, seedId: string): string {
  const localPart = normalizeEmail(email).split("@")[0] || "user";
  const base = localPart
    .replace(/[^a-z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[._-]+|[._-]+$/g, "");
  const safeBase = base || "user";
  const suffix = seedId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8).toLowerCase();
  return `${safeBase}-${suffix || "acct"}`.slice(0, 42);
}

type TableExistsRow = { table_exists: number };

async function tableExists(db: D1DatabaseLike, tableName: string): Promise<boolean> {
  const row = await db
    .prepare(
       `SELECT CASE WHEN EXISTS (
         SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ? LIMIT 1
       ) THEN 1 ELSE 0 END AS table_exists`,
    )
    .bind(tableName)
    .first<TableExistsRow>();
  return Number(row?.table_exists || 0) === 1;
}

async function ensureContactsTable(db: D1DatabaseLike): Promise<void> {
  await db.prepare(
    `CREATE TABLE IF NOT EXISTS contacts (
       id TEXT PRIMARY KEY,
       email TEXT NOT NULL DEFAULT '' COLLATE NOCASE,
       phone TEXT NOT NULL DEFAULT '',
       name TEXT NOT NULL DEFAULT '',
       notes TEXT NOT NULL DEFAULT '',
       created_at TEXT NOT NULL,
       updated_at TEXT NOT NULL
     )`,
  ).run();

  await db
    .prepare("CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts (email)")
    .run();
  await db
    .prepare("CREATE INDEX IF NOT EXISTS idx_contacts_updated_at ON contacts (updated_at DESC)")
    .run();
}

async function findUserByEmail(
  db: D1DatabaseLike,
  email: string,
): Promise<UserRecord | null> {
  const normalized = normalizeEmail(email);
  if (!normalized) return null;
  return db
    .prepare(
      `SELECT id, email, name, username, created_at, updated_at
       FROM users
       WHERE LOWER(email) = LOWER(?)
       LIMIT 1`,
    )
    .bind(normalized)
    .first<UserRecord>();
}

async function findUserById(
  db: D1DatabaseLike,
  id: string,
): Promise<UserRecord | null> {
  if (!id.trim()) return null;
  return db
    .prepare(
      `SELECT id, email, name, username, created_at, updated_at
       FROM users
       WHERE id = ?
       LIMIT 1`,
    )
    .bind(id)
    .first<UserRecord>();
}

async function upsertLinkedUserByEmail(
  db: D1DatabaseLike,
  email: string,
  name: string,
  now: string,
  preferredId?: string,
): Promise<string> {
  const normalized = normalizeEmail(email);
  const existingByEmail = await findUserByEmail(db, normalized);
  if (existingByEmail) {
    await db
      .prepare(
        `UPDATE users
         SET name = CASE WHEN ? != '' THEN ? ELSE name END,
             updated_at = ?
         WHERE id = ?`,
      )
      .bind(name, name, now, existingByEmail.id)
      .run();
    return existingByEmail.id;
  }

  const existingByPreferredId = preferredId
    ? await findUserById(db, preferredId)
    : null;
  const userId = existingByPreferredId ? makeUserId() : preferredId || makeUserId();
  const username = buildUsernameFromEmail(normalized, userId);
  const safeName = name || username;

  await db
    .prepare(
      `INSERT INTO users (
         id,
         email,
         name,
         username,
         avatar_public,
         password_hash,
         oauth_accounts,
         created_at,
         updated_at
       ) VALUES (?, ?, ?, ?, 0, '', '[]', ?, ?)`,
    )
    .bind(userId, normalized, safeName, username, now, now)
    .run();

  return userId;
}

async function listContactsFromContactsTable(db: D1DatabaseLike) {
  const { results } = await db
    .prepare(
      `SELECT
         id,
         email,
         phone,
         name,
         notes,
         created_at,
         updated_at,
         '' AS user_id,
         '' AS username,
         'contacts' AS source
       FROM contacts
       ORDER BY updated_at DESC
       LIMIT 500`,
    )
    .all<ContactRecord>();
  return (results || [])
    .map((row) => normalizeContactRow(row))
    .filter((item) => item.id.length > 0);
}

async function listContactsFromUsers(db: D1DatabaseLike, hasContactsTable: boolean) {
  if (hasContactsTable) {
    const { results } = await db
      .prepare(
        `SELECT
           merged.id,
           merged.email,
           merged.phone,
           merged.name,
           merged.notes,
           merged.created_at,
           merged.updated_at,
           merged.user_id,
           merged.username,
           merged.source
         FROM (
           SELECT
             COALESCE(c.id, u.id) AS id,
             u.email AS email,
             COALESCE(c.phone, '') AS phone,
             COALESCE(NULLIF(c.name, ''), u.name, u.username, '') AS name,
             COALESCE(c.notes, '') AS notes,
             COALESCE(c.created_at, u.created_at, '') AS created_at,
             COALESCE(c.updated_at, u.updated_at, u.created_at) AS updated_at,
             u.id AS user_id,
             u.username AS username,
             'users+contacts' AS source
           FROM users u
           LEFT JOIN contacts c ON LOWER(c.email) = LOWER(u.email)

           UNION ALL

           SELECT
             c.id AS id,
             c.email AS email,
             c.phone AS phone,
             c.name AS name,
             c.notes AS notes,
             c.created_at AS created_at,
             c.updated_at AS updated_at,
             '' AS user_id,
             '' AS username,
             'contacts-only' AS source
           FROM contacts c
           WHERE NOT EXISTS (
             SELECT 1 FROM users u WHERE LOWER(u.email) = LOWER(c.email)
           )
         ) AS merged
         ORDER BY merged.updated_at DESC
         LIMIT 500`,
      )
      .all<ContactRecord>();
    return (results || [])
      .map((row) => normalizeContactRow(row))
      .filter((item) => item.id.length > 0 && item.email.length > 0);
  }

  const { results } = await db
    .prepare(
      `SELECT
         u.id AS id,
         u.email AS email,
         '' AS phone,
         COALESCE(u.name, u.username, '') AS name,
         '' AS notes,
         COALESCE(u.created_at, '') AS created_at,
         COALESCE(u.updated_at, '') AS updated_at,
         u.id AS user_id,
         u.username AS username,
         'users' AS source
       FROM users u
       ORDER BY COALESCE(u.updated_at, u.created_at) DESC
       LIMIT 500`,
    )
    .all<ContactRecord>();

  return (results || [])
    .map((row) => normalizeContactRow(row))
    .filter((item) => item.id.length > 0 && item.email.length > 0);
}

async function listContacts(db: D1DatabaseLike) {
  const [hasUsersTable, hasContactsTable] = await Promise.all([
    tableExists(db, "users"),
    tableExists(db, "contacts"),
  ]);

  if (hasUsersTable) {
    return listContactsFromUsers(db, hasContactsTable);
  }
  if (hasContactsTable) {
    return listContactsFromContactsTable(db);
  }
  return [];
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
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;
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
    const contacts = await listContacts(db);
    return jsonResponse({ contacts });
  } catch (error) {
    return jsonResponse(
      { error: "Failed to load contacts.", details: String(error) },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;
  const db = await requireDb();
  if (db instanceof Response) return db;
  await ensureContactsTable(db);
  const hasUsersTable = await tableExists(db, "users");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body." }, { status: 400 });
  }
  const payload = parsePayload(body);
  const id = asString(payload.id).trim() || makeContactId();
  const now = new Date().toISOString();
  const email = normalizeEmail(asString(payload.email));
  const phone = asString(payload.phone).trim();
  const name = asString(payload.name).trim();
  const notes = asString(payload.notes);

  if (!id) {
    return jsonResponse({ error: "Missing contact id." }, { status: 400 });
  }
  if (hasUsersTable && !email) {
    return jsonResponse(
      { error: "Email is required to keep contacts linked to users." },
      { status: 400 },
    );
  }

  try {
    const existingContact = await db
      .prepare(
        "SELECT id, email, phone, name, notes, created_at, updated_at FROM contacts WHERE id = ? LIMIT 1",
      )
      .bind(id)
      .first<ContactRecord>();

    if (hasUsersTable) {
      const userById = await findUserById(db, id);
      if (userById) {
        const lockedEmail = normalizeEmail(asString(userById.email));
        if (email !== lockedEmail) {
          return jsonResponse(
            { error: "Email is read-only for records linked to users." },
            { status: 400 },
          );
        }
      }

      if (existingContact?.email) {
        const linkedUser = await findUserByEmail(db, existingContact.email);
        if (linkedUser) {
          const lockedEmail = normalizeEmail(asString(existingContact.email));
          if (email !== lockedEmail) {
            return jsonResponse(
              { error: "Email is read-only for records linked to users." },
              { status: 400 },
            );
          }
        }
      }
    }

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

    if (hasUsersTable) {
      await upsertLinkedUserByEmail(db, email, name, now, id);
    }

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
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;
  const db = await requireDb();
  if (db instanceof Response) return db;
  await ensureContactsTable(db);

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
