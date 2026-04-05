"use client";

import { DOCS_STORAGE_KEY, type SavedDocument } from "@/lib/editorStorage";

export function slugifyDocumentName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function readSavedDocuments(): SavedDocument[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(DOCS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (doc): doc is SavedDocument =>
        doc &&
        typeof doc === "object" &&
        typeof doc.name === "string" &&
        typeof doc.slug === "string" &&
        typeof doc.content === "string" &&
        typeof doc.updatedAt === "string",
    );
  } catch {
    return [];
  }
}

export function writeSavedDocuments(docs: SavedDocument[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DOCS_STORAGE_KEY, JSON.stringify(docs));
}

export function upsertSavedDocument(doc: SavedDocument): SavedDocument[] {
  const current = readSavedDocuments();
  const index = current.findIndex((item) => item.slug === doc.slug);
  if (index >= 0) current[index] = doc;
  else current.push(doc);
  writeSavedDocuments(current);
  return current;
}

export function removeSavedDocument(slug: string): SavedDocument[] {
  const next = readSavedDocuments().filter((doc) => doc.slug !== slug);
  writeSavedDocuments(next);
  return next;
}
