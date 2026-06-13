-- D1 schema for contacts/customer records used by omniblocks2.
-- Mirrors the DB binding used in ../articulate-universe/storefront.

CREATE TABLE IF NOT EXISTS contacts (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL DEFAULT '' COLLATE NOCASE,
  phone TEXT NOT NULL DEFAULT '',
  name TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts (email);
CREATE INDEX IF NOT EXISTS idx_contacts_updated_at ON contacts (updated_at DESC);

CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  contact_id TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '' COLLATE NOCASE,
  phone TEXT NOT NULL DEFAULT '',
  name TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_customers_email ON customers (email);
CREATE INDEX IF NOT EXISTS idx_customers_contact_id ON customers (contact_id);
