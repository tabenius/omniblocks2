export type SavedPage = {
  name: string;
  slug: string;
  content: string;
  updatedAt: string;
};

export function getPagesPrefix(): string {
  const raw = String(process.env.R2_PAGES_PREFIX || "saved-pages/").trim();
  if (!raw) return "saved-pages/";
  return raw.endsWith("/") ? raw : `${raw}/`;
}

export function slugifySavedPage(value: string): string {
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

export function coerceSavedPage(value: unknown): SavedPage | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const name = typeof record.name === "string" ? record.name.trim() : "";
  const slug = typeof record.slug === "string" ? slugifySavedPage(record.slug) : "";
  const content = typeof record.content === "string" ? record.content : "";
  const updatedAt = asIsoString(record.updatedAt);
  if (!name || !slug || !content) return null;
  return { name, slug, content, updatedAt };
}

export function fileKeyForSavedPageSlug(prefix: string, slug: string): string {
  return `${prefix}${slug}.json`;
}
