"use client";

import {
  CONTENT_THEME_STORAGE_KEY,
  STORAGE_KEY,
  STYLE_STORAGE_KEY,
} from "@/lib/editorStorage";
import { readSavedDocuments } from "@/lib/documentStore";
import { isRecord, type JsonRecord } from "@/lib/typeGuards";

export { isRecord, type JsonRecord };

const PREVIEW_COLOR_FIELDS = [
  { key: "background", cssVar: "--color-background" },
  { key: "foreground", cssVar: "--color-foreground" },
  { key: "surface", cssVar: "--color-surface" },
  { key: "surfaceForeground", cssVar: "--color-surface-foreground" },
  { key: "muted", cssVar: "--color-muted" },
  { key: "mutedForeground", cssVar: "--color-muted-foreground" },
  { key: "border", cssVar: "--color-border" },
  { key: "primary", cssVar: "--color-primary" },
  { key: "primaryForeground", cssVar: "--color-primary-foreground" },
  { key: "secondary", cssVar: "--color-secondary" },
  { key: "secondaryForeground", cssVar: "--color-secondary-foreground" },
  { key: "accent", cssVar: "--color-accent" },
  { key: "accentForeground", cssVar: "--color-accent-foreground" },
  { key: "success", cssVar: "--color-success" },
  { key: "warning", cssVar: "--color-warning" },
  { key: "danger", cssVar: "--color-danger" },
] as const;

const PREVIEW_FONT_FIELDS = [
  { key: "default", cssVar: "--font-default" },
  { key: "alternate", cssVar: "--font-alternate" },
  { key: "mono", cssVar: "--font-mono" },
  { key: "defaultWeight", cssVar: "--font-weight-default" },
  { key: "alternateWeight", cssVar: "--font-weight-alternate" },
  { key: "monoWeight", cssVar: "--font-weight-mono" },
  { key: "lineHeightBase", cssVar: "--line-height-base" },
  { key: "letterSpacingBase", cssVar: "--letter-spacing-base" },
] as const;

type PreviewThemeMode = "content-light" | "content-dark";

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

export function readPreviewThemeMode(): PreviewThemeMode {
  const raw = localStorage.getItem(CONTENT_THEME_STORAGE_KEY);
  if (raw === "content-dark" || raw === "content-light") return raw;
  return "content-light";
}

function readStylePayload(): JsonRecord | null {
  const raw = localStorage.getItem(STYLE_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return isRecord(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function pickThemeColors(payload: JsonRecord, mode: PreviewThemeMode): JsonRecord | null {
  const colors = isRecord(payload.colors) ? payload.colors : payload;
  if (!isRecord(colors)) return null;
  const modeColors = colors[mode];
  if (isRecord(modeColors)) return modeColors;
  const legacyHasColorKeys = PREVIEW_COLOR_FIELDS.some(({ key }) => typeof colors[key] === "string");
  return legacyHasColorKeys ? colors : null;
}

function pickFonts(payload: JsonRecord): JsonRecord | null {
  if (isRecord(payload.fonts)) return payload.fonts;
  const legacyHasFontKeys = PREVIEW_FONT_FIELDS.some(({ key }) => typeof payload[key] === "string");
  return legacyHasFontKeys ? payload : null;
}

export function readPreviewThemeVariables(mode: PreviewThemeMode = "content-light"): Record<string, string> {
  const payload = readStylePayload();
  if (!payload) return {};

  const result: Record<string, string> = {};
  const colors = pickThemeColors(payload, mode);
  const fonts = pickFonts(payload);

  if (colors) {
    for (const { key, cssVar } of PREVIEW_COLOR_FIELDS) {
      const value = colors[key];
      if (typeof value === "string" && value.trim()) {
        result[cssVar] = value.trim();
      }
    }
  }

  if (fonts) {
    for (const { key, cssVar } of PREVIEW_FONT_FIELDS) {
      const value = fonts[key];
      if (typeof value === "string" && value.trim()) {
        result[cssVar] = value.trim();
      }
    }
  }

  return result;
}
