"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Editor, Frame, Element, useEditor } from "@craftjs/core";
import { resolver } from "@/lib/resolver";
import { Container } from "@/components/user/Container";
import { Heading } from "@/components/user/Heading";
import { Paragraph } from "@/components/user/Paragraph";
import { Toolbox } from "./Toolbox";
import { BlockTreeTab } from "./BlockTreeTab";
import { SettingsPanel } from "./SettingsPanel";
import { type ViewportMode } from "./PreviewEmail";
import { RenderNode } from "./RenderNode";
import { serializeToBlockLanguage } from "@/lib/blockSerializer";
import { SourceCodeTab } from "./SourceCodeTab";
import { TemplatesTab } from "./TemplatesTab";
import { DocumentsPanel } from "./DocumentsPanel";
import { ExportHtmlPanel } from "./ExportHtmlPanel";
import { ContactsTab } from "./ContactsTab";
import { ContentThemeVarsProvider } from "./fields";
import { CONTENT_THEME_STORAGE_KEY, STYLE_STORAGE_KEY, STORAGE_KEY } from "@/lib/editorStorage";
import { readSavedDocuments } from "@/lib/documentStore";
import { safeJsonResponse } from "@/lib/safeJson";
import {
  STARTUP_ASSETS_CACHE_KEY,
  STARTUP_GOOGLE_FONTS_CACHE_KEY,
  STARTUP_IMAGES_CACHE_KEY,
  sanitizeStartupAssetsPayload,
  type StartupAssetsPayload,
  type StartupTemplate,
} from "@/lib/startupAssets";

type ContentTheme = "content-light" | "content-dark";
export type ToolbarTab = "settings" | "send" | "export-source" | "save-load" | "style";
type PrimaryPanelTab = Exclude<ToolbarTab, "style">;
type LeftPanelTab = "blocks" | "tree";
const VIEWPORT_STORAGE_KEY = "omnieditor-viewport-mode";
type EditorShellMode = "full" | "style-only";
type AutoSaveNotice = {
  level: "warning" | "error";
  message: string;
};
type AdminSession = {
  role: "admin";
  email: string;
};
type AdminSessionPayload = {
  authenticated?: boolean;
  session?: AdminSession | null;
};
const AUTOSAVE_WARNING_BYTES = 3_500_000;
const PROJECT_DOCS_URL =
  process.env.NEXT_PUBLIC_OMNILAND_DOCS_URL || "https://ragbaz.xyz/docs/en/omniland-editor";

type ThemeStyleTokens = {
  background: string;
  foreground: string;
  surface: string;
  surfaceForeground: string;
  muted: string;
  mutedForeground: string;
  border: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  accent: string;
  accentForeground: string;
  success: string;
  warning: string;
  danger: string;
};

type FontFamilyKey = "default" | "alternate" | "mono";

type FontTokens = {
  default: string;
  alternate: string;
  mono: string;
  defaultWeight: string;
  alternateWeight: string;
  monoWeight: string;
  lineHeightBase: string;
  letterSpacingBase: string;
};
type FontLoadStatus = "system" | "loading" | "loaded" | "failed" | "unsupported";
type FontLoadEntry = {
  family: string | null;
  status: FontLoadStatus;
  message: string;
};
type FontLoadState = Record<FontFamilyKey, FontLoadEntry>;
type FontTemplateKey = "elegant" | "formal" | "creative" | "relaxed" | "modern";
type ThemePreset = {
  key: FontTemplateKey;
  label: string;
  fonts: FontTokens;
  colors: Record<ContentTheme, ThemeStyleTokens>;
};

const STYLE_FIELDS: Array<{
  key: keyof ThemeStyleTokens;
  label: string;
  cssVar: string;
}> = [
  { key: "background", label: "Background", cssVar: "--color-background" },
  { key: "foreground", label: "Foreground", cssVar: "--color-foreground" },
  { key: "surface", label: "Surface", cssVar: "--color-surface" },
  { key: "surfaceForeground", label: "Surface Text", cssVar: "--color-surface-foreground" },
  { key: "muted", label: "Muted", cssVar: "--color-muted" },
  { key: "mutedForeground", label: "Muted Text", cssVar: "--color-muted-foreground" },
  { key: "border", label: "Border", cssVar: "--color-border" },
  { key: "primary", label: "Primary", cssVar: "--color-primary" },
  { key: "primaryForeground", label: "Primary Text", cssVar: "--color-primary-foreground" },
  { key: "secondary", label: "Secondary", cssVar: "--color-secondary" },
  { key: "secondaryForeground", label: "Secondary Text", cssVar: "--color-secondary-foreground" },
  { key: "accent", label: "Accent", cssVar: "--color-accent" },
  { key: "accentForeground", label: "Accent Text", cssVar: "--color-accent-foreground" },
  { key: "success", label: "Success", cssVar: "--color-success" },
  { key: "warning", label: "Warning", cssVar: "--color-warning" },
  { key: "danger", label: "Danger", cssVar: "--color-danger" },
];

const FONT_FAMILY_FIELDS: Array<{
  key: FontFamilyKey;
  label: string;
  cssVar: string;
}> = [
  { key: "default", label: "Default Font", cssVar: "--font-default" },
  { key: "alternate", label: "Alternate Font", cssVar: "--font-alternate" },
  { key: "mono", label: "Mono Font", cssVar: "--font-mono" },
];

const FONT_KNOB_FIELDS: Array<{
  key: keyof Pick<
    FontTokens,
    "defaultWeight" | "alternateWeight" | "monoWeight" | "lineHeightBase" | "letterSpacingBase"
  >;
  label: string;
  cssVar: string;
  min: number;
  max: number;
  step: number;
  unit?: string;
}> = [
  {
    key: "defaultWeight",
    label: "Default Weight",
    cssVar: "--font-weight-default",
    min: 100,
    max: 900,
    step: 1,
  },
  {
    key: "alternateWeight",
    label: "Alternate Weight",
    cssVar: "--font-weight-alternate",
    min: 100,
    max: 900,
    step: 1,
  },
  {
    key: "monoWeight",
    label: "Mono Weight",
    cssVar: "--font-weight-mono",
    min: 100,
    max: 900,
    step: 1,
  },
  {
    key: "lineHeightBase",
    label: "Base Line Height",
    cssVar: "--line-height-base",
    min: 1,
    max: 2.4,
    step: 0.01,
  },
  {
    key: "letterSpacingBase",
    label: "Base Letter Spacing",
    cssVar: "--letter-spacing-base",
    min: -0.05,
    max: 0.2,
    step: 0.005,
    unit: "em",
  },
];

const FONT_FIELDS: Array<{
  key: keyof FontTokens;
  cssVar: string;
}> = [...FONT_FAMILY_FIELDS, ...FONT_KNOB_FIELDS].map(({ key, cssVar }) => ({
  key,
  cssVar,
}));

const HEX_COLOR_RE = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

const DEFAULT_STYLE_TOKENS: Record<ContentTheme, ThemeStyleTokens> = {
  "content-light": {
    background: "#fefdf7",
    foreground: "#2d1b69",
    surface: "#ffffff",
    surfaceForeground: "#2d1b69",
    muted: "#f3f0ff",
    mutedForeground: "#6e4aad",
    border: "#ddd6fe",
    primary: "#7c3aed",
    primaryForeground: "#ffffff",
    secondary: "#fef9c3",
    secondaryForeground: "#713f12",
    accent: "#f59e0b",
    accentForeground: "#1c1917",
    success: "#16a34a",
    warning: "#d97706",
    danger: "#dc2626",
  },
  "content-dark": {
    background: "#0f0a1e",
    foreground: "#ede9fe",
    surface: "#1a1030",
    surfaceForeground: "#ede9fe",
    muted: "#1e1240",
    mutedForeground: "#a07ed6",
    border: "#2d1f5e",
    primary: "#c084fc",
    primaryForeground: "#0f0a1e",
    secondary: "#241658",
    secondaryForeground: "#ede9fe",
    accent: "#fbbf24",
    accentForeground: "#0f0a1e",
    success: "#4ade80",
    warning: "#fcd34d",
    danger: "#f87171",
  },
};

const DEFAULT_FONT_TOKENS: FontTokens = {
  default: '"Inter Variable", "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
  alternate: '"Source Serif 4", "Fraunces", serif',
  mono: '"Recursive", "Roboto Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  defaultWeight: "450",
  alternateWeight: "450",
  monoWeight: "420",
  lineHeightBase: "1.55",
  letterSpacingBase: "0em",
};

const FONT_TEMPLATES: Array<{
  key: FontTemplateKey;
  label: string;
  tokens: FontTokens;
}> = [
  {
    key: "elegant",
    label: "Elegant",
    tokens: {
      ...DEFAULT_FONT_TOKENS,
      default: '"Fraunces", "Source Serif 4", serif',
      alternate: '"Source Serif 4", "Fraunces", serif',
      mono: '"Recursive", "Roboto Mono", ui-monospace, monospace',
      defaultWeight: "420",
      alternateWeight: "430",
    },
  },
  {
    key: "formal",
    label: "Formal",
    tokens: {
      ...DEFAULT_FONT_TOKENS,
      default: '"Source Serif 4", "Fraunces", serif',
      alternate: '"Source Sans 3", "Inter", sans-serif',
      mono: '"Recursive", "Roboto Mono", ui-monospace, monospace',
      defaultWeight: "470",
      alternateWeight: "500",
    },
  },
  {
    key: "creative",
    label: "Creative",
    tokens: {
      ...DEFAULT_FONT_TOKENS,
      default: '"Roboto Flex", "Inter", sans-serif',
      alternate: '"Nunito Sans", "Manrope", sans-serif',
      mono: '"Recursive", "Roboto Mono", ui-monospace, monospace',
      defaultWeight: "480",
      alternateWeight: "520",
    },
  },
  {
    key: "relaxed",
    label: "Relaxed",
    tokens: {
      ...DEFAULT_FONT_TOKENS,
      default: '"Nunito Sans", "Inter", sans-serif',
      alternate: '"Manrope", "Source Sans 3", sans-serif',
      mono: '"Recursive", "Roboto Mono", ui-monospace, monospace',
      defaultWeight: "430",
      alternateWeight: "450",
    },
  },
  {
    key: "modern",
    label: "Modern",
    tokens: {
      ...DEFAULT_FONT_TOKENS,
      default: '"Inter Variable", "Inter", sans-serif',
      alternate: '"Manrope", "Source Sans 3", sans-serif',
      mono: '"Recursive", "Roboto Mono", ui-monospace, monospace',
      defaultWeight: "460",
      alternateWeight: "460",
    },
  },
];

const FONT_LINK_ID = "omni-editor-google-fonts-link";
const GENERIC_FONT_FAMILIES = new Set([
  "serif",
  "sans-serif",
  "monospace",
  "cursive",
  "fantasy",
  "system-ui",
  "ui-sans-serif",
  "ui-serif",
  "ui-monospace",
  "-apple-system",
  "roboto",
  "arial",
  "georgia",
  "times new roman",
  "helvetica neue",
  "segoe ui",
  "tahoma",
  "menlo",
  "monaco",
  "consolas",
  "sfmono-regular",
  "courier new",
  "trebuchet ms",
  "avenir next",
]);

function extractPrimaryFontFamily(value: string): string | null {
  const first = value.split(",")[0]?.trim();
  if (!first) return null;
  const family = first.replace(/^['"]|['"]$/g, "").trim();
  if (!family) return null;
  if (GENERIC_FONT_FAMILIES.has(family.toLowerCase())) return null;
  return family;
}

function buildGoogleFontsHref(families: string[]): string | null {
  if (families.length === 0) return null;
  const query = families
    .map((family) => `family=${encodeURIComponent(family).replace(/%20/g, "+")}:wght@400;500;600;700`)
    .join("&");
  return `https://fonts.googleapis.com/css2?${query}&display=swap`;
}

function getFamiliesByKey(fontTokens: FontTokens): Record<FontFamilyKey, string | null> {
  return {
    default: extractPrimaryFontFamily(fontTokens.default),
    alternate: extractPrimaryFontFamily(fontTokens.alternate),
    mono: extractPrimaryFontFamily(fontTokens.mono),
  };
}

function buildFontLoadState(
  familiesByKey: Record<FontFamilyKey, string | null>,
  statusForCustom: FontLoadStatus,
  customMessage: (family: string) => string,
): FontLoadState {
  return {
    default: familiesByKey.default
      ? {
          family: familiesByKey.default,
          status: statusForCustom,
          message: customMessage(familiesByKey.default),
        }
      : {
          family: null,
          status: "system",
          message: "Using system/local fallback stack.",
        },
    alternate: familiesByKey.alternate
      ? {
          family: familiesByKey.alternate,
          status: statusForCustom,
          message: customMessage(familiesByKey.alternate),
        }
      : {
          family: null,
          status: "system",
          message: "Using system/local fallback stack.",
        },
    mono: familiesByKey.mono
      ? {
          family: familiesByKey.mono,
          status: statusForCustom,
          message: customMessage(familiesByKey.mono),
        }
      : {
          family: null,
          status: "system",
          message: "Using system/local fallback stack.",
        },
  };
}

function getTemplateFonts(key: FontTemplateKey): FontTokens {
  const found = FONT_TEMPLATES.find((item) => item.key === key);
  return found ? found.tokens : DEFAULT_FONT_TOKENS;
}

function buildThemeColors(
  light: Partial<ThemeStyleTokens>,
  dark: Partial<ThemeStyleTokens>,
): Record<ContentTheme, ThemeStyleTokens> {
  return {
    "content-light": {
      ...DEFAULT_STYLE_TOKENS["content-light"],
      ...light,
    },
    "content-dark": {
      ...DEFAULT_STYLE_TOKENS["content-dark"],
      ...dark,
    },
  };
}

const THEME_PRESETS: ThemePreset[] = [
  {
    key: "elegant",
    label: "Elegant",
    fonts: getTemplateFonts("elegant"),
    colors: buildThemeColors(
      {
        background: "#f8f4eb",
        foreground: "#2a1f17",
        muted: "#efe7d8",
        mutedForeground: "#7b5f47",
        border: "#d9cbb4",
        primary: "#8b6b45",
        accent: "#c9a86a",
      },
      {
        background: "#14100d",
        foreground: "#f4ece1",
        muted: "#1d1713",
        mutedForeground: "#c2a98a",
        border: "#3d3025",
        primary: "#d8b683",
        accent: "#f2cf93",
      },
    ),
  },
  {
    key: "formal",
    label: "Formal",
    fonts: getTemplateFonts("formal"),
    colors: buildThemeColors(
      {
        background: "#f3f6fb",
        foreground: "#12243d",
        muted: "#e8eef7",
        mutedForeground: "#3f5a7a",
        border: "#c9d8eb",
        primary: "#1f4f8f",
        accent: "#2a6bbf",
      },
      {
        background: "#0b1626",
        foreground: "#dbe8f7",
        muted: "#11233a",
        mutedForeground: "#8bb0da",
        border: "#213a59",
        primary: "#6da7ea",
        accent: "#8ec2ff",
      },
    ),
  },
  {
    key: "creative",
    label: "Creative",
    fonts: getTemplateFonts("creative"),
    colors: buildThemeColors(
      {
        background: "#fff7ef",
        foreground: "#3a1f44",
        muted: "#fde8f6",
        mutedForeground: "#8b4f97",
        border: "#f7b7dd",
        primary: "#f97316",
        accent: "#14b8a6",
      },
      {
        background: "#1b1023",
        foreground: "#fde8ff",
        muted: "#281535",
        mutedForeground: "#d7a6e3",
        border: "#5d2e74",
        primary: "#fb923c",
        accent: "#5eead4",
      },
    ),
  },
  {
    key: "relaxed",
    label: "Relaxed",
    fonts: getTemplateFonts("relaxed"),
    colors: buildThemeColors(
      {
        background: "#f5faf6",
        foreground: "#1f3327",
        muted: "#e8f4ea",
        mutedForeground: "#547566",
        border: "#c9dfcf",
        primary: "#3f7a57",
        accent: "#79b08f",
      },
      {
        background: "#101b14",
        foreground: "#e4f2e8",
        muted: "#17261c",
        mutedForeground: "#98c0a6",
        border: "#2f4b3b",
        primary: "#6fb38a",
        accent: "#9dd4b1",
      },
    ),
  },
  {
    key: "modern",
    label: "Modern",
    fonts: getTemplateFonts("modern"),
    colors: buildThemeColors(
      {
        background: "#f7f9fc",
        foreground: "#111827",
        muted: "#edf2f7",
        mutedForeground: "#4b5563",
        border: "#d1d9e6",
        primary: "#2563eb",
        accent: "#0ea5e9",
      },
      {
        background: "#0b1220",
        foreground: "#e5ecf7",
        muted: "#141f35",
        mutedForeground: "#91a4c4",
        border: "#253553",
        primary: "#60a5fa",
        accent: "#67e8f9",
      },
    ),
  },
];

const CopyIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="14"
    height="14"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const UserIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

function cloneDefaultStyleTokens(): Record<ContentTheme, ThemeStyleTokens> {
  return {
    "content-light": { ...DEFAULT_STYLE_TOKENS["content-light"] },
    "content-dark": { ...DEFAULT_STYLE_TOKENS["content-dark"] },
  };
}

function cloneDefaultFontTokens(): FontTokens {
  return { ...DEFAULT_FONT_TOKENS };
}

function normalizeHex(value: unknown, fallback: string): string {
  const candidate = String(value ?? "").trim();
  return HEX_COLOR_RE.test(candidate) ? candidate.toLowerCase() : fallback;
}

function sanitizeFontValue(value: unknown, fallback: string): string {
  const candidate = String(value ?? "").trim();
  if (!candidate) return fallback;
  return candidate.slice(0, 220);
}

function sanitizeFontNumeric(
  value: unknown,
  fallback: string,
  min: number,
  max: number,
  step: number,
  unit = "",
): string {
  const raw = String(value ?? "").trim();
  const match = raw.match(/-?\d+(?:\.\d+)?/);
  const parsed = match ? Number(match[0]) : Number.NaN;
  if (!Number.isFinite(parsed)) return fallback;
  const clamped = Math.min(max, Math.max(min, parsed));
  const snapped = step > 0 ? Math.round(clamped / step) * step : clamped;
  const normalized = Number(snapped.toFixed(4));
  return `${normalized}${unit}`;
}

function sanitizeThemeTokens(input: unknown, fallback: ThemeStyleTokens): ThemeStyleTokens {
  const source =
    input && typeof input === "object"
      ? (input as Partial<Record<keyof ThemeStyleTokens, unknown>>)
      : {};
  const result = {} as ThemeStyleTokens;
  for (const field of STYLE_FIELDS) {
    result[field.key] = normalizeHex(source[field.key], fallback[field.key]);
  }
  return result;
}

function sanitizeStyleState(input: unknown): Record<ContentTheme, ThemeStyleTokens> {
  const defaults = cloneDefaultStyleTokens();
  const source =
    input && typeof input === "object"
      ? (input as Partial<Record<ContentTheme, unknown>>)
      : {};
  return {
    "content-light": sanitizeThemeTokens(
      source["content-light"],
      defaults["content-light"],
    ),
    "content-dark": sanitizeThemeTokens(
      source["content-dark"],
      defaults["content-dark"],
    ),
  };
}

function sanitizeFontTokens(input: unknown): FontTokens {
  const source =
    input && typeof input === "object"
      ? (input as Partial<Record<keyof FontTokens, unknown>>)
      : {};
  return {
    default: sanitizeFontValue(source.default, DEFAULT_FONT_TOKENS.default),
    alternate: sanitizeFontValue(source.alternate, DEFAULT_FONT_TOKENS.alternate),
    mono: sanitizeFontValue(source.mono, DEFAULT_FONT_TOKENS.mono),
    defaultWeight: sanitizeFontNumeric(
      source.defaultWeight,
      DEFAULT_FONT_TOKENS.defaultWeight,
      100,
      900,
      1,
    ),
    alternateWeight: sanitizeFontNumeric(
      source.alternateWeight,
      DEFAULT_FONT_TOKENS.alternateWeight,
      100,
      900,
      1,
    ),
    monoWeight: sanitizeFontNumeric(
      source.monoWeight,
      DEFAULT_FONT_TOKENS.monoWeight,
      100,
      900,
      1,
    ),
    lineHeightBase: sanitizeFontNumeric(
      source.lineHeightBase,
      DEFAULT_FONT_TOKENS.lineHeightBase,
      1,
      2.4,
      0.01,
    ),
    letterSpacingBase: sanitizeFontNumeric(
      source.letterSpacingBase,
      DEFAULT_FONT_TOKENS.letterSpacingBase,
      -0.05,
      0.2,
      0.005,
      "em",
    ),
  };
}

function sameFontTokens(a: FontTokens, b: FontTokens): boolean {
  return a.default.trim() === b.default.trim() &&
    a.alternate.trim() === b.alternate.trim() &&
    a.mono.trim() === b.mono.trim() &&
    a.defaultWeight.trim() === b.defaultWeight.trim() &&
    a.alternateWeight.trim() === b.alternateWeight.trim() &&
    a.monoWeight.trim() === b.monoWeight.trim() &&
    a.lineHeightBase.trim() === b.lineHeightBase.trim() &&
    a.letterSpacingBase.trim() === b.letterSpacingBase.trim();
}

function sameStyleTokens(
  a: Record<ContentTheme, ThemeStyleTokens>,
  b: Record<ContentTheme, ThemeStyleTokens>,
): boolean {
  for (const theme of ["content-light", "content-dark"] as const) {
    for (const field of STYLE_FIELDS) {
      if (a[theme][field.key] !== b[theme][field.key]) return false;
    }
  }
  return true;
}

function toCssVariableStyle(
  tokens: ThemeStyleTokens,
  fontTokens: FontTokens,
): React.CSSProperties {
  const style: Record<string, string> = {};
  for (const field of STYLE_FIELDS) {
    style[field.cssVar] = tokens[field.key];
  }
  for (const field of FONT_FIELDS) {
    style[field.cssVar] = fontTokens[field.key];
  }
  // Ensure block text inherits the currently selected default font token.
  style.fontFamily = "var(--font-default)";
  return style as React.CSSProperties;
}

function normalizePrimaryPanelTab(input?: ToolbarTab): PrimaryPanelTab {
  if (input === "send" || input === "export-source" || input === "save-load" || input === "settings") {
    return input;
  }
  return "settings";
}

// ── AutoSaveLoader ────────────────────────────────────────────────
// Must live inside <Editor> to access useEditor
const AutoSaveLoader = ({
  initialDocSlug,
  onNoticeChange,
}: {
  initialDocSlug?: string;
  onNoticeChange?: (notice: AutoSaveNotice | null) => void;
}) => {
  const { actions, query, nodes } = useEditor((state) => ({
    nodes: state.nodes,
  }));
  const [loaded, setLoaded] = React.useState(false);
  const lastSavedRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    const fromSlug =
      initialDocSlug &&
      readSavedDocuments().find((doc) => doc.slug === initialDocSlug)?.content;
    const saved = fromSlug ?? localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        actions.deserialize(saved);
        lastSavedRef.current = saved;
      } catch (e) {
        console.warn("Failed to restore editor state:", e);
      }
    }
    setLoaded(true);
  }, [initialDocSlug]); // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    if (!loaded) return;
    const timer = setTimeout(() => {
      try {
        const serialized = JSON.stringify(query.getSerializedNodes());
        const byteSize = new Blob([serialized]).size;
        if (byteSize >= AUTOSAVE_WARNING_BYTES) {
          onNoticeChange?.({
            level: "warning",
            message: `Autosave payload is ${Math.round(byteSize / 1024)} KB. Large local images can exceed browser storage limits.`,
          });
        } else {
          onNoticeChange?.(null);
        }
        if (serialized === lastSavedRef.current) return;
        lastSavedRef.current = serialized;
        localStorage.setItem(STORAGE_KEY, serialized);
      } catch {
        onNoticeChange?.({
          level: "error",
          message: "Autosave failed (browser storage limit). Save a named document and avoid local-only images.",
        });
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [loaded, nodes, onNoticeChange]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
};

// ── CopySourceButton ──────────────────────────────────────────────
const CopySourceButton = () => {
  const { query } = useEditor();
  const [copied, setCopied] = React.useState(false);

  const copy = () => {
    const src = serializeToBlockLanguage(query.getSerializedNodes());
    navigator.clipboard.writeText(src).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <button
      onClick={copy}
      className="w-full px-3 py-2 text-sm rounded border border-[var(--color-border)] bg-[var(--color-secondary)] hover:bg-[var(--color-surface)] text-[var(--color-foreground)] transition-colors"
    >
      {copied ? "Copied!" : "Copy Source"}
    </button>
  );
};

// ── ContentThemeToggle ────────────────────────────────────────────
const ContentThemeToggle = ({
  value,
  onChange,
}: {
  value: ContentTheme;
  onChange: (t: ContentTheme) => void;
}) => (
  <div
    className="flex rounded-md overflow-hidden border border-[var(--color-border)]"
    style={{ fontSize: 12 }}
  >
    {(["content-light", "content-dark"] as ContentTheme[]).map((t) => (
      <button
        key={t}
        onClick={() => onChange(t)}
        style={{
          flex: 1,
          padding: "5px 0",
          background: value === t ? "var(--color-primary)" : "var(--color-secondary)",
          color: value === t ? "var(--color-primary-foreground)" : "var(--color-muted-foreground)",
          border: "none",
          cursor: "pointer",
          fontFamily: "inherit",
          transition: "background 0.15s, color 0.15s",
        }}
      >
        {t === "content-light" ? "☀ Light" : "☾ Dark"}
      </button>
    ))}
  </div>
);

const ViewportModeToggle = ({
  value,
  onChange,
}: {
  value: ViewportMode;
  onChange: (mode: ViewportMode) => void;
}) => (
  <div
    className="flex rounded-md overflow-hidden border border-[var(--color-border)]"
    style={{ fontSize: 12 }}
  >
    {([
      { id: "mobile", label: "Mobile" },
      { id: "desktop", label: "Desktop" },
    ] as Array<{ id: ViewportMode; label: string }>).map((item) => (
      <button
        key={item.id}
        onClick={() => onChange(item.id)}
        style={{
          flex: 1,
          padding: "5px 0",
          background: value === item.id ? "var(--color-primary)" : "var(--color-secondary)",
          color: value === item.id ? "var(--color-primary-foreground)" : "var(--color-muted-foreground)",
          border: "none",
          cursor: "pointer",
          fontFamily: "inherit",
          transition: "background 0.15s, color 0.15s",
        }}
      >
        {item.label}
      </button>
    ))}
  </div>
);

const StyleEditor = ({
  contentTheme,
  styleTokens,
  setStyleTokens,
  fontTokens,
  setFontTokens,
  fontLoadState,
}: {
  contentTheme: ContentTheme;
  styleTokens: Record<ContentTheme, ThemeStyleTokens>;
  setStyleTokens: React.Dispatch<
    React.SetStateAction<Record<ContentTheme, ThemeStyleTokens>>
  >;
  fontTokens: FontTokens;
  setFontTokens: React.Dispatch<React.SetStateAction<FontTokens>>;
  fontLoadState: FontLoadState;
}) => {
  const [copyState, setCopyState] = React.useState<"idle" | "copied" | "failed">("idle");
  const activeTokens = styleTokens[contentTheme];
  const sourceJson = React.useMemo(
    () => JSON.stringify({ colors: styleTokens, fonts: fontTokens }, null, 2),
    [fontTokens, styleTokens],
  );
  const activeFontTemplate = React.useMemo(() => {
    const match = THEME_PRESETS.find(
      (template) =>
        sameFontTokens(template.fonts, fontTokens) &&
        sameStyleTokens(template.colors, styleTokens),
    );
    return match?.key ?? null;
  }, [fontTokens, styleTokens]);

  const setToken = (key: keyof ThemeStyleTokens, value: string) => {
    setStyleTokens((current) => ({
      ...current,
      [contentTheme]: {
        ...current[contentTheme],
        [key]: normalizeHex(value, current[contentTheme][key]),
      },
    }));
  };

  const setFontToken = (key: keyof FontTokens, value: string) => {
    setFontTokens((current) => {
      if (key === "default" || key === "alternate" || key === "mono") {
        return {
          ...current,
          [key]: sanitizeFontValue(value, current[key]),
        };
      }

      const knob = FONT_KNOB_FIELDS.find((field) => field.key === key);
      if (!knob) return current;
      return {
        ...current,
        [key]: sanitizeFontNumeric(
          value,
          current[key],
          knob.min,
          knob.max,
          knob.step,
          knob.unit ?? "",
        ),
      };
    });
  };

  const applyFontTemplate = (templateKey: FontTemplateKey) => {
    const template = THEME_PRESETS.find((item) => item.key === templateKey);
    if (!template) return;
    setFontTokens(sanitizeFontTokens(template.fonts));
    setStyleTokens(sanitizeStyleState(template.colors));
  };

  const copySource = async () => {
    try {
      await navigator.clipboard.writeText(sourceJson);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    } finally {
      setTimeout(() => setCopyState("idle"), 1500);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">
            Style Editor
          </h3>
          <p className="text-xs text-[var(--color-muted-foreground)] mt-1">
            Editing {contentTheme}
          </p>
        </div>
        <button
          onClick={copySource}
          title="Copy JSON source"
          aria-label="Copy style JSON source"
          className="h-8 w-8 inline-flex items-center justify-center rounded border border-[var(--color-border)] bg-[var(--color-secondary)] hover:bg-[var(--color-surface)] text-[var(--color-foreground)]"
        >
          <CopyIcon />
        </button>
      </div>

      <div className="space-y-2">
        <div className="text-[11px] uppercase tracking-wide text-[var(--color-muted-foreground)]">
          Fonts
        </div>
        <div className="flex flex-wrap gap-1">
          {THEME_PRESETS.map((template) => {
            const isActive = activeFontTemplate === template.key;
            return (
              <button
                key={template.key}
                type="button"
                onClick={() => applyFontTemplate(template.key)}
                className="px-2 py-1 rounded border text-[11px] transition-colors"
                style={{
                  borderColor: "var(--color-border)",
                  background: isActive ? "var(--color-primary)" : "var(--color-secondary)",
                  color: isActive
                    ? "var(--color-primary-foreground)"
                    : "var(--color-foreground)",
                }}
              >
                {template.label}
              </button>
            );
          })}
        </div>
        {FONT_FAMILY_FIELDS.map((field) => (
          <label key={field.key} className="block space-y-1 text-xs">
            <span className="text-[var(--color-muted-foreground)]">{field.label}</span>
            <input
              type="text"
              value={fontTokens[field.key]}
              onChange={(e) => setFontToken(field.key, e.target.value)}
              className="w-full rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-[11px] text-[var(--color-foreground)]"
            />
            <div
              className="text-[10px]"
              style={{
                color:
                  fontLoadState[field.key].status === "loaded"
                    ? "var(--color-success)"
                    : fontLoadState[field.key].status === "loading"
                      ? "var(--color-warning)"
                      : fontLoadState[field.key].status === "failed"
                        ? "var(--color-danger)"
                        : "var(--color-muted-foreground)",
              }}
            >
              {fontLoadState[field.key].message}
            </div>
          </label>
        ))}
        {FONT_KNOB_FIELDS.map((field) => (
          <label key={field.key} className="block space-y-1 text-xs">
            <span className="text-[var(--color-muted-foreground)]">
              {field.label}
              <code className="ml-2 text-[10px] text-[var(--color-muted-foreground)]">
                {fontTokens[field.key]}
              </code>
            </span>
            <input
              type="text"
              value={fontTokens[field.key]}
              onChange={(e) => setFontToken(field.key, e.target.value)}
              className="w-full rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-[11px] text-[var(--color-foreground)]"
            />
          </label>
        ))}
      </div>

      <div className="space-y-2">
        <div className="text-[11px] uppercase tracking-wide text-[var(--color-muted-foreground)]">
          Colors
        </div>
        {STYLE_FIELDS.map((field) => (
          <label
            key={field.key}
            className="flex items-center justify-between gap-3 text-xs"
          >
            <span className="text-[var(--color-muted-foreground)]">{field.label}</span>
            <div className="flex items-center gap-2">
              <code className="text-[10px] text-[var(--color-muted-foreground)]">
                {activeTokens[field.key]}
              </code>
              <input
                type="color"
                value={activeTokens[field.key]}
                onChange={(e) => setToken(field.key, e.target.value)}
                className="h-7 w-10 rounded border border-[var(--color-border)] bg-transparent cursor-pointer"
              />
            </div>
          </label>
        ))}
      </div>

      <div>
        <div className="text-[11px] uppercase tracking-wide text-[var(--color-muted-foreground)] mb-1">
          JSON Source
        </div>
        <pre className="max-h-40 overflow-auto rounded border border-[var(--color-border)] bg-[var(--color-surface)] p-2 text-[10px] leading-4 text-[var(--color-foreground)]">
          {sourceJson}
        </pre>
        <div className="text-[11px] mt-1 text-[var(--color-muted-foreground)]">
          {copyState === "copied"
            ? "Copied JSON."
            : copyState === "failed"
              ? "Copy failed."
              : "Copy style JSON source."}
        </div>
      </div>
    </div>
  );
};

// ── EditorShell ───────────────────────────────────────────────────
export default function EditorShell({
  initialDocSlug,
  initialToolbarTab,
  mode = "full",
}: {
  initialDocSlug?: string;
  initialToolbarTab?: ToolbarTab;
  mode?: EditorShellMode;
}) {
  const [contentTheme, setContentTheme] = React.useState<ContentTheme>("content-light");
  const [toolbarTab, setToolbarTab] = React.useState<PrimaryPanelTab>(
    normalizePrimaryPanelTab(initialToolbarTab),
  );
  const [styleTokens, setStyleTokens] = React.useState<
    Record<ContentTheme, ThemeStyleTokens>
  >(() => cloneDefaultStyleTokens());
  const [fontTokens, setFontTokens] = React.useState<FontTokens>(
    () => cloneDefaultFontTokens(),
  );
  const [fontLoadState, setFontLoadState] = React.useState<FontLoadState>(() =>
    buildFontLoadState(getFamiliesByKey(cloneDefaultFontTokens()), "system", () =>
      "Using system/local fallback stack.",
    ),
  );
  const [stylesLoaded, setStylesLoaded] = React.useState(false);
  const [viewportMode, setViewportMode] = React.useState<ViewportMode>("mobile");
  const [startupTemplates, setStartupTemplates] = React.useState<StartupTemplate[]>([]);
  const [startupLoading, setStartupLoading] = React.useState(true);
  const [leftPanelOpen, setLeftPanelOpen] = React.useState(false);
  const [rightPanelOpen, setRightPanelOpen] = React.useState(false);
  const [leftPanelTab, setLeftPanelTab] = React.useState<LeftPanelTab>("blocks");
  const [autoSaveNotice, setAutoSaveNotice] = React.useState<AutoSaveNotice | null>(null);
  const styleOnly = mode === "style-only";
  const pathname = usePathname();
  const authMenuRef = React.useRef<HTMLDivElement | null>(null);
  const [adminSession, setAdminSession] = React.useState<AdminSession | null>(null);
  const [authLoading, setAuthLoading] = React.useState(true);
  const [authMenuOpen, setAuthMenuOpen] = React.useState(false);
  const isAuthenticated = Boolean(adminSession);
  const canUseRestrictedFeatures = isAuthenticated;
  const loginHref = React.useMemo(() => {
    const fallback = pathname || "/";
    if (typeof window === "undefined") {
      return `/admin/login?next=${encodeURIComponent(fallback)}`;
    }
    const current = `${window.location.pathname}${window.location.search}` || fallback;
    return `/admin/login?next=${encodeURIComponent(current)}`;
  }, [pathname]);

  const handleAutoSaveNotice = React.useCallback((next: AutoSaveNotice | null) => {
    setAutoSaveNotice((prev) => {
      if (prev?.level === next?.level && prev?.message === next?.message) return prev;
      return next;
    });
  }, []);

  const refreshAdminSession = React.useCallback(async () => {
    setAuthLoading(true);
    try {
      const response = await fetch("/api/admin/session", { cache: "no-store" });
      const payload = await safeJsonResponse<AdminSessionPayload>(response);
      const session =
        response.ok && payload?.authenticated && payload.session?.role === "admin"
          ? payload.session
          : null;
      setAdminSession(session);
    } catch {
      setAdminSession(null);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const signOutAdmin = React.useCallback(async () => {
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
      });
    } catch {
      // Ignore sign-out request failures and clear local session state.
    } finally {
      setAdminSession(null);
      setAuthMenuOpen(false);
    }
  }, []);

  const toggleLeftPanel = () => {
    setLeftPanelOpen((current) => {
      const next = !current;
      if (next) setRightPanelOpen(false);
      return next;
    });
  };

  const toggleRightPanel = () => {
    setRightPanelOpen((current) => {
      const next = !current;
      if (next) setLeftPanelOpen(false);
      return next;
    });
  };

  React.useEffect(() => {
    void refreshAdminSession();
  }, [refreshAdminSession]);

  React.useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!authMenuRef.current) return;
      if (authMenuRef.current.contains(event.target as Node)) return;
      setAuthMenuOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  React.useEffect(() => {
    if (canUseRestrictedFeatures) return;
    if (toolbarTab === "send") {
      setToolbarTab("settings");
    }
  }, [canUseRestrictedFeatures, toolbarTab]);

  React.useEffect(() => {
    const saved = localStorage.getItem(STYLE_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as unknown;
        if (parsed && typeof parsed === "object" && ("colors" in (parsed as Record<string, unknown>) || "fonts" in (parsed as Record<string, unknown>))) {
          const payload = parsed as {
            colors?: unknown;
            fonts?: unknown;
          };
          setStyleTokens(sanitizeStyleState(payload.colors));
          setFontTokens(sanitizeFontTokens(payload.fonts));
        } else {
          setStyleTokens(sanitizeStyleState(parsed));
          setFontTokens(cloneDefaultFontTokens());
        }
      } catch (e) {
        console.warn("Failed to restore style tokens:", e);
      }
    }
    setStylesLoaded(true);
  }, []);

  React.useEffect(() => {
    if (!stylesLoaded) return;
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(
          STYLE_STORAGE_KEY,
          JSON.stringify({
            colors: styleTokens,
            fonts: fontTokens,
          }),
        );
      } catch {
        // ignore storage quota errors
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [fontTokens, stylesLoaded, styleTokens]);

  React.useEffect(() => {
    if (!initialToolbarTab) return;
    setToolbarTab(normalizePrimaryPanelTab(initialToolbarTab));
  }, [initialToolbarTab]);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(VIEWPORT_STORAGE_KEY);
      if (raw === "desktop" || raw === "mobile" || raw === "mobile-first") {
        setViewportMode(raw === "mobile-first" ? "mobile" : raw);
      }
    } catch {
      // ignore localStorage read errors
    }
  }, []);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(CONTENT_THEME_STORAGE_KEY);
      if (raw === "content-light" || raw === "content-dark") {
        setContentTheme(raw);
      }
    } catch {
      // ignore localStorage read errors
    }
  }, []);

  React.useEffect(() => {
    try {
      localStorage.setItem(VIEWPORT_STORAGE_KEY, viewportMode);
    } catch {
      // ignore localStorage write errors
    }
  }, [viewportMode]);

  React.useEffect(() => {
    try {
      localStorage.setItem(CONTENT_THEME_STORAGE_KEY, contentTheme);
    } catch {
      // ignore localStorage write errors
    }
  }, [contentTheme]);

  React.useEffect(() => {
    let cancelled = false;
    const familiesByKey = getFamiliesByKey(fontTokens);
    const customFamilies = Array.from(
      new Set(Object.values(familiesByKey).filter((family): family is string => Boolean(family))),
    );

    if (customFamilies.length === 0) {
      const existing = document.getElementById(FONT_LINK_ID);
      if (existing) existing.remove();
      setFontLoadState(
        buildFontLoadState(familiesByKey, "system", () => "Using system/local fallback stack."),
      );
      return () => {
        cancelled = true;
      };
    }

    setFontLoadState(
      buildFontLoadState(familiesByKey, "loading", (family) => `Loading "${family}"...`),
    );

    const href = buildGoogleFontsHref(customFamilies);
    const existing = document.getElementById(FONT_LINK_ID);
    const link =
      existing instanceof HTMLLinkElement ? existing : document.createElement("link");
    if (!existing) {
      link.id = FONT_LINK_ID;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }

    const loadStylesheet = async (nextHref: string): Promise<boolean> => {
      if (!nextHref) return false;
      if (link.href === nextHref && link.sheet) return true;
      return new Promise((resolve) => {
        let onLoad: () => void = () => {};
        let onError: () => void = () => {};
        const cleanup = () => {
          link.removeEventListener("load", onLoad);
          link.removeEventListener("error", onError);
        };
        onLoad = () => {
          cleanup();
          resolve(true);
        };
        onError = () => {
          cleanup();
          resolve(false);
        };
        link.addEventListener("load", onLoad, { once: true });
        link.addEventListener("error", onError, { once: true });
        link.href = nextHref;
      });
    };

    const verifyFonts = async () => {
      if (!href) return;
      let stylesheetOk = await loadStylesheet(href);
      if (!stylesheetOk) {
        stylesheetOk = await loadStylesheet(`${href}&retry=${Date.now()}`);
      }
      if (cancelled) return;
      if (!stylesheetOk) {
        if ("fonts" in document && document.fonts) {
          const localFontApi = (document as Document & { fonts: FontFaceSet }).fonts;
          const localState = buildFontLoadState(
            familiesByKey,
            "failed",
            (family) => `Could not fetch "${family}". Using fallback.`,
          );
          let recovered = false;
          for (const key of Object.keys(familiesByKey) as Array<FontFamilyKey>) {
            const family = familiesByKey[key];
            if (!family) continue;
            if (localFontApi.check(`16px "${family}"`)) {
              recovered = true;
              localState[key] = {
                family,
                status: "loaded",
                message: `Using local "${family}" (remote fetch failed).`,
              };
            }
          }
          if (recovered) {
            setFontLoadState(localState);
            return;
          }
        }
        setFontLoadState(
          buildFontLoadState(
            familiesByKey,
            "failed",
            (family) => `Failed to load "${family}". Using fallback.`,
          ),
        );
        return;
      }

      if (!("fonts" in document) || !document.fonts) {
        setFontLoadState(
          buildFontLoadState(
            familiesByKey,
            "unsupported",
            (family) => `Loaded stylesheet for "${family}", but browser cannot verify font status.`,
          ),
        );
        return;
      }

      const fontApi = (document as Document & { fonts: FontFaceSet }).fonts;
      const nextState = buildFontLoadState(
        familiesByKey,
        "loaded",
        (family) => `Loaded "${family}".`,
      );

      await Promise.all(
        (Object.keys(familiesByKey) as Array<FontFamilyKey>).map(async (key) => {
          const family = familiesByKey[key];
          if (!family) return;
          try {
            await Promise.race([
              fontApi.load(`16px "${family}"`),
              new Promise((_, reject) =>
                setTimeout(() => reject(new Error("font load timeout")), 4500),
              ),
            ]);
            const ok = fontApi.check(`16px "${family}"`);
            nextState[key] = ok
              ? {
                  family,
                  status: "loaded",
                  message: `Loaded "${family}".`,
                }
              : {
                  family,
                  status: "failed",
                  message: `Could not verify "${family}". Using fallback.`,
                };
          } catch {
            nextState[key] = {
              family,
              status: "failed",
              message: `Failed to load "${family}". Using fallback.`,
            };
          }
        }),
      );

      if (!cancelled) setFontLoadState(nextState);
    };

    void verifyFonts();
    return () => {
      cancelled = true;
    };
  }, [fontTokens]);

  React.useEffect(() => {
    let cancelled = false;

    const applyAssets = (normalized: StartupAssetsPayload, persist: boolean) => {
      if (cancelled) return;
      setStartupTemplates(normalized.templates);
      if (persist) {
        try {
          localStorage.setItem(STARTUP_ASSETS_CACHE_KEY, JSON.stringify(normalized));
          localStorage.setItem(STARTUP_IMAGES_CACHE_KEY, JSON.stringify(normalized.images));
          localStorage.setItem(
            STARTUP_GOOGLE_FONTS_CACHE_KEY,
            JSON.stringify(normalized.googleFontData ?? null),
          );
        } catch {
          // ignore localStorage errors
        }
      }
      setStartupLoading(false);
    };

    const toTimestamp = (value: string): number => {
      const parsed = Date.parse(value);
      return Number.isFinite(parsed) ? parsed : 0;
    };

    const shouldReplaceCachedAssets = (
      cached: StartupAssetsPayload | null,
      remote: StartupAssetsPayload,
      source: string | undefined,
    ): boolean => {
      if (!cached) return true;
      // Treat fallback response as non-authoritative when we already have cached assets.
      if (source !== "r2") return false;
      if (remote.version !== cached.version) return remote.version > cached.version;
      return toTimestamp(remote.updatedAt) > toTimestamp(cached.updatedAt);
    };

    const load = async () => {
      try {
        let cachedAssets: StartupAssetsPayload | null = null;
        const cachedRaw = localStorage.getItem(STARTUP_ASSETS_CACHE_KEY);
        if (cachedRaw) {
          try {
            cachedAssets = sanitizeStartupAssetsPayload(JSON.parse(cachedRaw));
            applyAssets(cachedAssets, false);
          } catch {
            // ignore bad cache
          }
        }

        const response = await fetch("/api/r2/startup", { cache: "no-store" });
        const json = await safeJsonResponse<{
          ok?: boolean;
          source?: string;
          assets?: unknown;
        }>(response);
        if (!response.ok || !json?.ok) {
          if (!cancelled) setStartupLoading(false);
          return;
        }
        const remoteAssets = sanitizeStartupAssetsPayload(json.assets);
        if (shouldReplaceCachedAssets(cachedAssets, remoteAssets, json.source)) {
          applyAssets(remoteAssets, true);
          return;
        }
        if (!cachedAssets) applyAssets(remoteAssets, true);
        else if (!cancelled) setStartupLoading(false);
      } catch {
        if (!cancelled) setStartupLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const canvasStyle = React.useMemo(
    () => toCssVariableStyle(styleTokens[contentTheme], fontTokens),
    [contentTheme, fontTokens, styleTokens],
  );
  const exportThemeVariables = React.useMemo(() => {
    const activeTokens = styleTokens[contentTheme];
    const result: Record<string, string> = {};
    for (const field of STYLE_FIELDS) {
      result[field.cssVar] = activeTokens[field.key];
    }
    for (const field of FONT_FIELDS) {
      result[field.cssVar] = fontTokens[field.key];
    }
    return result;
  }, [contentTheme, fontTokens, styleTokens]);
  const isMobile = viewportMode === "mobile";
  const canvasViewportStyle: React.CSSProperties = React.useMemo(
    () => ({
      width: isMobile ? 390 : "min(100%, 1280px)",
      minHeight: "100%",
      margin: "0 auto",
      border: "1px solid var(--color-border)",
      borderRadius: 12,
      overflow: "hidden",
      background: "var(--color-background)",
      boxShadow: isMobile ? "0 10px 30px rgba(2, 8, 23, 0.2)" : "none",
    }),
    [isMobile],
  );

  return (
    <div
      className="relative flex min-h-screen flex-col lg:h-screen lg:flex-row"
      style={{ fontFamily: "var(--font-default)" }}
    >
      <div ref={authMenuRef} className="fixed right-3 top-3 z-[60]">
        <button
          type="button"
          onClick={() => setAuthMenuOpen((current) => !current)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] shadow"
          aria-label="Open account menu"
          aria-expanded={authMenuOpen}
        >
          <UserIcon />
        </button>
        {authMenuOpen ? (
          <div className="absolute right-0 top-full mt-2 w-64 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-2 shadow-xl">
            {authLoading ? (
              <div className="px-2 py-1 text-xs text-[var(--color-muted-foreground)]">
                Checking session...
              </div>
            ) : isAuthenticated && adminSession ? (
              <div className="space-y-2">
                <div className="rounded border border-[var(--color-border)] bg-[var(--color-muted)] px-2 py-1.5 text-xs">
                  Signed in as <span className="font-medium">{adminSession.email}</span>
                </div>
                <button
                  type="button"
                  onClick={signOutAdmin}
                  className="w-full rounded border border-[var(--color-border)] bg-[var(--color-secondary)] px-2 py-1.5 text-xs text-[var(--color-foreground)] hover:bg-[var(--color-muted)]"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="px-2 py-1 text-xs text-[var(--color-muted-foreground)]">
                  Sign in to unlock contacts, R2 images, save/load, and email sending.
                </div>
                <Link
                  href={loginHref}
                  onClick={() => setAuthMenuOpen(false)}
                  className="block w-full rounded border border-[var(--color-border)] bg-[var(--color-primary)] px-2 py-1.5 text-center text-xs text-[var(--color-primary-foreground)] hover:opacity-90"
                >
                  Sign in
                </Link>
              </div>
            )}
            <div className="mt-2 border-t border-[var(--color-border)] pt-2">
              <a
                href={PROJECT_DOCS_URL}
                target="_blank"
                rel="noreferrer"
                className="block w-full rounded border border-[var(--color-border)] bg-[var(--color-secondary)] px-2 py-1.5 text-center text-xs text-[var(--color-foreground)] hover:bg-[var(--color-muted)]"
              >
                Project Docs
              </a>
            </div>
          </div>
        ) : null}
      </div>
      {!styleOnly ? (
        <button
          type="button"
          onClick={toggleLeftPanel}
          className="lg:hidden fixed left-2 top-1/2 -translate-y-1/2 z-40 rounded-md border border-[var(--color-border)] bg-[var(--color-secondary)] px-2 py-3 text-[11px] uppercase tracking-wide text-[var(--color-foreground)]"
          style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
        >
          {leftPanelOpen ? "Close" : "Blocks"}
        </button>
      ) : null}
      <button
        type="button"
        onClick={toggleRightPanel}
        className="lg:hidden fixed right-2 top-1/2 -translate-y-1/2 z-40 rounded-md border border-[var(--color-border)] bg-[var(--color-secondary)] px-2 py-3 text-[11px] uppercase tracking-wide text-[var(--color-foreground)]"
        style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
      >
        {rightPanelOpen ? "Close" : "Panels"}
      </button>

      <ContentThemeVarsProvider value={exportThemeVariables}>
      <Editor resolver={resolver} onRender={RenderNode}>
        <AutoSaveLoader initialDocSlug={initialDocSlug} onNoticeChange={handleAutoSaveNotice} />

        {/* Left sidebar — editor chrome */}
        {!styleOnly ? (
          <aside
            data-theme="editor"
            className={`${leftPanelOpen ? "fixed left-0 top-0 bottom-0 z-50 flex w-[50vw] shadow-2xl" : "hidden"} lg:static lg:inset-auto lg:z-auto lg:flex w-[50vw] lg:w-64 border-b lg:border-b-0 lg:border-r border-[var(--color-border)] p-4 overflow-y-auto flex-col gap-4`}
          >
            <div className="lg:hidden flex items-center justify-between mb-1">
              <div className="text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">
                Blocks
              </div>
              <button
                type="button"
                onClick={() => setLeftPanelOpen(false)}
                className="rounded border border-[var(--color-border)] bg-[var(--color-secondary)] px-2 py-1 text-xs"
              >
                Close
              </button>
            </div>
            <h2
              className="font-bold text-sm tracking-wide uppercase"
              style={{ color: "var(--color-accent)", letterSpacing: "0.1em" }}
            >
              Blocks
            </h2>
            <div className="grid grid-cols-2 rounded-md overflow-hidden border border-[var(--color-border)]">
              {([
                { id: "blocks", label: "Blocks" },
                { id: "tree", label: "Tree" },
              ] as Array<{ id: LeftPanelTab; label: string }>).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setLeftPanelTab(tab.id)}
                  className="px-2 py-1.5 text-[11px] uppercase tracking-wide transition-colors"
                  style={{
                    background:
                      leftPanelTab === tab.id
                        ? "var(--color-primary)"
                        : "var(--color-secondary)",
                    color:
                      leftPanelTab === tab.id
                        ? "var(--color-primary-foreground)"
                        : "var(--color-muted-foreground)",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            {leftPanelTab === "blocks" ? <Toolbox /> : <BlockTreeTab />}
          </aside>
        ) : null}

        {/* Canvas — content theme */}
        <main
          data-theme={contentTheme}
          className="flex-1 p-4 lg:p-8 overflow-y-auto"
          style={canvasStyle}
        >
          <div style={canvasViewportStyle}>
            <Frame>
              <Element is={Container} canvas padding="24px" background="var(--color-background)">
                <Heading text="Welcome to the editor" level={1} />
                <Paragraph text="Start building by dragging blocks from the left." />
              </Element>
            </Frame>
          </div>
        </main>

        {/* Right sidebar — editor chrome */}
        <aside
          data-theme="editor"
          className={`${rightPanelOpen ? "fixed inset-0 z-50 flex w-screen shadow-2xl" : "hidden"} lg:static lg:inset-auto lg:z-auto lg:flex w-screen ${styleOnly ? "lg:w-96" : "lg:w-72"} border-t lg:border-t-0 lg:border-l border-[var(--color-border)] p-4 flex-col gap-4 min-h-0`}
        >
          <div className="lg:hidden flex items-center justify-between mb-1">
            <div className="text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">
              Panels
            </div>
            <button
              type="button"
              onClick={() => setRightPanelOpen(false)}
              className="rounded border border-[var(--color-border)] bg-[var(--color-secondary)] px-2 py-1 text-xs"
            >
              Close
            </button>
          </div>
          {!styleOnly ? (
            <section className="border border-[var(--color-border)] rounded-md p-2 bg-[var(--color-muted)]">
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/"
                  className="px-2 py-1.5 text-[11px] text-center rounded border border-[var(--color-border)] bg-[var(--color-secondary)] hover:bg-[var(--color-surface)]"
                >
                  Editor
                </Link>
                <Link
                  href="/style-editor"
                  className="px-2 py-1.5 text-[11px] text-center rounded border border-[var(--color-border)] bg-[var(--color-secondary)] hover:bg-[var(--color-surface)]"
                >
                  Style Editor
                </Link>
                <Link
                  href={initialDocSlug ? `/preview/${initialDocSlug}` : "/preview"}
                  className="px-2 py-1.5 text-[11px] text-center rounded border border-[var(--color-border)] bg-[var(--color-secondary)] hover:bg-[var(--color-surface)]"
                >
                  Preview Page
                </Link>
                <Link
                  href={initialDocSlug ? `/preview-email/${initialDocSlug}` : "/preview-email"}
                  className="px-2 py-1.5 text-[11px] text-center rounded border border-[var(--color-border)] bg-[var(--color-secondary)] hover:bg-[var(--color-surface)]"
                >
                  Preview Email
                </Link>
              </div>
            </section>
          ) : (
            <section className="border border-[var(--color-border)] rounded-md p-2 bg-[var(--color-muted)]">
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/"
                  className="px-3 py-1.5 text-xs rounded border border-[var(--color-border)] bg-[var(--color-secondary)] hover:bg-[var(--color-surface)]"
                >
                  Back to Editor
                </Link>
                <Link
                  href={initialDocSlug ? `/preview/${initialDocSlug}` : "/preview"}
                  className="px-3 py-1.5 text-xs rounded border border-[var(--color-border)] bg-[var(--color-secondary)] hover:bg-[var(--color-surface)]"
                >
                  Preview Page
                </Link>
                <Link
                  href={initialDocSlug ? `/preview-email/${initialDocSlug}` : "/preview-email"}
                  className="px-3 py-1.5 text-xs rounded border border-[var(--color-border)] bg-[var(--color-secondary)] hover:bg-[var(--color-surface)]"
                >
                  Preview Email
                </Link>
              </div>
            </section>
          )}
          {autoSaveNotice ? (
            <section
              className="rounded-md border p-2 text-xs"
              style={{
                borderColor:
                  autoSaveNotice.level === "error"
                    ? "var(--color-danger)"
                    : "var(--color-warning)",
                background: "var(--color-muted)",
                color: "var(--color-foreground)",
              }}
            >
              <div className="uppercase tracking-wide mb-1">
                {autoSaveNotice.level === "error" ? "Autosave Error" : "Autosave Warning"}
              </div>
              <div className="text-[11px] leading-4">{autoSaveNotice.message}</div>
            </section>
          ) : null}
          {!styleOnly ? (
            <>
              <ViewportModeToggle value={viewportMode} onChange={setViewportMode} />
              <ContentThemeToggle value={contentTheme} onChange={setContentTheme} />
              <section className="border border-[var(--color-border)] rounded-md overflow-hidden flex-1 min-h-0 flex flex-col">
                <div className="grid grid-cols-2">
                  {([
                    { id: "settings", label: "Block Settings" },
                    {
                      id: "send",
                      label: "Send Email",
                      disabled: !canUseRestrictedFeatures,
                      tooltip: "Login required",
                    },
                    { id: "export-source", label: "Export + Source" },
                    { id: "save-load", label: "Save + Load" },
                  ] as Array<{
                    id: PrimaryPanelTab;
                    label: string;
                    disabled?: boolean;
                    tooltip?: string;
                  }>).map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        if (tab.disabled) return;
                        setToolbarTab(tab.id);
                      }}
                      disabled={tab.disabled}
                      title={tab.disabled ? tab.tooltip || "Login required" : undefined}
                      className="px-2 py-2 text-[10px] sm:text-xs uppercase tracking-wide transition-colors border-b border-[var(--color-border)]"
                      style={{
                        background:
                          tab.disabled
                            ? "var(--color-muted)"
                            : toolbarTab === tab.id
                              ? "var(--color-primary)"
                              : "var(--color-secondary)",
                        color:
                          tab.disabled
                            ? "var(--color-muted-foreground)"
                            : toolbarTab === tab.id
                              ? "var(--color-primary-foreground)"
                              : "var(--color-muted-foreground)",
                        opacity: tab.disabled ? 0.6 : 1,
                        cursor: tab.disabled ? "not-allowed" : "pointer",
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                <div className="p-3 bg-[var(--color-muted)] flex-1 min-h-0">
                  <div className="h-full overflow-y-auto pr-1">
                    {toolbarTab === "settings" ? (
                      <div className="space-y-2">
                        <div className="text-[11px] uppercase tracking-wide text-[var(--color-muted-foreground)]">
                          Selected Block
                        </div>
                        <SettingsPanel />
                      </div>
                    ) : toolbarTab === "send" ? (
                      canUseRestrictedFeatures ? (
                        <div className="space-y-3">
                          <ExportHtmlPanel
                            filenameBase={initialDocSlug || "document"}
                            themeVariables={exportThemeVariables}
                            showExportsSection={false}
                            showSendSection
                          />
                          <ContactsTab />
                        </div>
                      ) : (
                        <section className="rounded border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-xs text-[var(--color-muted-foreground)]">
                          Login required to access email sending and contacts.
                        </section>
                      )
                    ) : toolbarTab === "export-source" ? (
                      <div className="space-y-3">
                        <ExportHtmlPanel
                          filenameBase={initialDocSlug || "document"}
                          themeVariables={exportThemeVariables}
                          showExportsSection
                          showSendSection={false}
                        />
                        <CopySourceButton />
                        <SourceCodeTab />
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <DocumentsPanel
                          initialName={initialDocSlug ? initialDocSlug.replaceAll("-", " ") : ""}
                          canSave={canUseRestrictedFeatures}
                          saveDisabledReason="Login required"
                        />
                        <section className="rounded border border-[var(--color-border)] bg-[var(--color-muted)] p-3 space-y-3">
                          <div className="text-xs uppercase tracking-wide text-[var(--color-accent)]">
                            Examples
                          </div>
                          <TemplatesTab templates={startupTemplates} loading={startupLoading} />
                        </section>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            </>
          ) : (
            <>
              <section className="border border-[var(--color-border)] rounded-md p-3 bg-[var(--color-muted)] space-y-3">
                <div className="space-y-1">
                  <div className="text-[11px] uppercase tracking-wide text-[var(--color-muted-foreground)]">
                    Viewport
                  </div>
                  <ViewportModeToggle value={viewportMode} onChange={setViewportMode} />
                </div>
                <div className="space-y-1">
                  <div className="text-[11px] uppercase tracking-wide text-[var(--color-muted-foreground)]">
                    Theme
                  </div>
                  <ContentThemeToggle value={contentTheme} onChange={setContentTheme} />
                </div>
              </section>
              <section className="border border-[var(--color-border)] rounded-md overflow-hidden">
                <div className="px-3 py-2 text-xs uppercase tracking-wide border-b border-[var(--color-border)] bg-[var(--color-secondary)] text-[var(--color-primary-foreground)]">
                  Style Editor
                </div>
                <div className="p-3 bg-[var(--color-muted)]">
                  <div className="max-h-[70vh] overflow-y-auto pr-1">
                    <StyleEditor
                      contentTheme={contentTheme}
                      styleTokens={styleTokens}
                      setStyleTokens={setStyleTokens}
                      fontTokens={fontTokens}
                      setFontTokens={setFontTokens}
                      fontLoadState={fontLoadState}
                    />
                  </div>
                </div>
              </section>
            </>
          )}
        </aside>
      </Editor>
      </ContentThemeVarsProvider>
    </div>
  );
}
