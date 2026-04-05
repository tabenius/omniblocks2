const SIMPLE_EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

export function isLikelyEmail(value: string): boolean {
  return SIMPLE_EMAIL_RE.test(value.trim());
}

export function splitEmailList(input: string): string[] {
  if (!input.trim()) return [];
  const unique = new Set<string>();
  for (const raw of input.split(",")) {
    const next = raw.trim();
    if (next.length === 0) continue;
    if (!isLikelyEmail(next)) continue;
    unique.add(next.toLowerCase());
  }
  return Array.from(unique);
}

export function splitFromAddresses(input: string): string[] {
  if (!input.trim()) return [];
  const unique = new Set<string>();
  for (const raw of input.split(",")) {
    const next = raw.trim();
    if (!next) continue;
    unique.add(next);
  }
  return Array.from(unique);
}

export function sanitizeExportName(input: string, fallback = "document"): string {
  const slug = input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || fallback;
}
