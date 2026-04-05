"use client";

import { STORAGE_KEY } from "@/lib/editorStorage";
import { readSavedDocuments } from "@/lib/documentStore";

export type JsonRecord = Record<string, unknown>;

export function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null;
}

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

