import type { SerializedNodes } from "@craftjs/core";

export const STARTUP_ASSETS_CACHE_KEY = "omni-startup-assets-cache";
export const STARTUP_IMAGES_CACHE_KEY = "omni-startup-images-cache";
export const STARTUP_GOOGLE_FONTS_CACHE_KEY = "omni-startup-google-fonts-cache";
export const DEFAULT_STARTUP_ASSETS_KEY = "bootstrap/startup-assets.json";

export type StartupTemplate = {
  id: string;
  title: string;
  description: string;
  nodes: SerializedNodes;
  blockSource: string;
};

export type StartupImage = {
  id: string;
  key?: string;
  url: string;
  label?: string;
};

export type StartupAssetsPayload = {
  version: number;
  updatedAt: string;
  templates: StartupTemplate[];
  images: StartupImage[];
  googleFontData: unknown;
};

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function sanitizeTemplate(value: unknown): StartupTemplate | null {
  if (!isRecord(value)) return null;
  const id = asString(value.id).trim();
  const title = asString(value.title).trim();
  const description = asString(value.description).trim();
  const blockSource = asString(value.blockSource);
  if (!id || !title) return null;
  const nodes = value.nodes;
  if (!isRecord(nodes)) return null;
  return {
    id,
    title,
    description,
    blockSource,
    nodes: nodes as SerializedNodes,
  };
}

function sanitizeImage(value: unknown): StartupImage | null {
  if (!isRecord(value)) return null;
  const id = asString(value.id).trim();
  const key = asString(value.key).trim() || undefined;
  const url = asString(value.url).trim();
  const label = asString(value.label).trim() || undefined;
  if (!id || !url) return null;
  return { id, key, url, label };
}

export function emptyStartupAssetsPayload(): StartupAssetsPayload {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    templates: [],
    images: [
      { id: "local-image-woman1", url: "/image-woman1.jpg", label: "Local image-woman1.jpg" },
      { id: "local-mock-product-ui", url: "/mock-product-ui.svg", label: "Local mock-product-ui.svg" },
    ],
    googleFontData: null,
  };
}

export function sanitizeStartupAssetsPayload(value: unknown): StartupAssetsPayload {
  const fallback = emptyStartupAssetsPayload();
  if (!isRecord(value)) return fallback;

  const templatesRaw = Array.isArray(value.templates) ? value.templates : [];
  const imagesRaw = Array.isArray(value.images) ? value.images : [];
  const templates = templatesRaw
    .map((entry) => sanitizeTemplate(entry))
    .filter((entry): entry is StartupTemplate => entry !== null);
  const images = imagesRaw
    .map((entry) => sanitizeImage(entry))
    .filter((entry): entry is StartupImage => entry !== null);

  return {
    version:
      typeof value.version === "number" && Number.isFinite(value.version)
        ? Math.max(1, Math.trunc(value.version))
        : fallback.version,
    updatedAt: asString(value.updatedAt).trim() || fallback.updatedAt,
    templates,
    images: images.length > 0 ? images : fallback.images,
    googleFontData: value.googleFontData ?? null,
  };
}
