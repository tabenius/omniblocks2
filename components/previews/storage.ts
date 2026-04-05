"use client";

import { STORAGE_KEY } from "@/lib/editorStorage";
import { readSavedDocuments } from "@/lib/documentStore";
import { isRecord, type JsonRecord } from "@/lib/typeGuards";

export { isRecord, type JsonRecord };

export function parseSerializedNodes(raw: string | null): JsonRecord | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return isRecord(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function readSerializedContent(slugParam?: string): string | null {
  const fromDoc = slugParam
    ? readSavedDocuments().find((doc) => doc.slug === slugParam)?.content
    : null;
  return fromDoc ?? localStorage.getItem(STORAGE_KEY) ?? null;
}

