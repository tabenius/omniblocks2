"use client";

import React from "react";

type R2Item = {
  key: string;
  url: string;
  size: number;
  lastModified: string | null;
};

type R2ImageSourceFieldProps = {
  value: string;
  onChange: (next: string) => void;
};

type ApiPayload = {
  ok?: boolean;
  error?: string;
  items?: R2Item[];
  item?: { url?: string };
};

const OUTPUT_FORMATS = [
  { id: "raw", label: "PNG (raw)", mime: "image/png", ext: "png", quality: 1 },
  { id: "webp", label: "WebP", mime: "image/webp", ext: "webp", quality: 0.86 },
  { id: "avif", label: "AVIF", mime: "image/avif", ext: "avif", quality: 0.82 },
] as const;

function drawZoomedImage(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  width: number,
  height: number,
  zoom: number,
) {
  const baseScale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
  const drawW = image.naturalWidth * baseScale * zoom;
  const drawH = image.naturalHeight * baseScale * zoom;
  const x = (width - drawW) / 2;
  const y = (height - drawH) / 2;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(image, x, y, drawW, drawH);
}

function coerceApiPayload(value: unknown): ApiPayload {
  return value && typeof value === "object" ? (value as ApiPayload) : {};
}

function normalizeErrorSnippet(value: string): string {
  return value.trim().replace(/\s+/g, " ").slice(0, 180);
}

function pickErrorMessage(error: unknown, fallback: string): string {
  if (!(error instanceof Error)) return fallback;
  const msg = error.message.trim();
  if (!msg) return fallback;
  if (/Unexpected token .* is not valid JSON/i.test(msg)) return fallback;
  return msg;
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Could not create local image URL."));
    reader.readAsDataURL(blob);
  });
}

async function readApiPayload(response: Response, fallbackMessage: string): Promise<ApiPayload> {
  const raw = await response.text();
  const trimmed = raw.trim();
  if (!trimmed) {
    if (!response.ok) {
      throw new Error(`${fallbackMessage} (${response.status})`);
    }
    return {};
  }
  try {
    return coerceApiPayload(JSON.parse(trimmed));
  } catch {
    if (!response.ok) {
      const snippet = normalizeErrorSnippet(trimmed);
      const status = response.statusText || "Request failed";
      throw new Error(snippet ? `${status} (${response.status}): ${snippet}` : `${status} (${response.status})`);
    }
    throw new Error("Server returned invalid JSON.");
  }
}

export const R2ImageSourceField = ({ value, onChange }: R2ImageSourceFieldProps) => {
  const [libraryOpen, setLibraryOpen] = React.useState(false);
  const [libraryLoading, setLibraryLoading] = React.useState(false);
  const [libraryItems, setLibraryItems] = React.useState<R2Item[]>([]);
  const [libraryError, setLibraryError] = React.useState("");

  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState("");
  const [zoom, setZoom] = React.useState(1);
  const [format, setFormat] = React.useState<(typeof OUTPUT_FORMATS)[number]["id"]>("webp");
  const [uploading, setUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState("");
  const [uploadNotice, setUploadNotice] = React.useState("");

  const previewCanvasRef = React.useRef<HTMLCanvasElement | null>(null);

  React.useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl("");
      setUploadNotice("");
      return;
    }
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  React.useEffect(() => {
    if (!previewUrl || !previewCanvasRef.current) return;
    const image = new Image();
    image.onload = () => {
      const canvas = previewCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      drawZoomedImage(ctx, image, canvas.width, canvas.height, zoom);
    };
    image.src = previewUrl;
  }, [previewUrl, zoom]);

  const loadLibrary = async () => {
    setLibraryOpen(true);
    setLibraryLoading(true);
    setLibraryError("");
    try {
      const response = await fetch("/api/r2/images?limit=80");
      const json = await readApiPayload(response, "Failed to load R2 images.");
      if (!response.ok || !json?.ok) {
        throw new Error(json?.error || "Failed to load R2 images.");
      }
      setLibraryItems(Array.isArray(json.items) ? json.items : []);
    } catch (error) {
      setLibraryError(error instanceof Error ? error.message : "Failed to load R2 images.");
    } finally {
      setLibraryLoading(false);
    }
  };

  const uploadPreparedImage = async () => {
    if (!previewUrl || !selectedFile) return;
    setUploading(true);
    setUploadError("");
    setUploadNotice("");
    let preparedBlob: Blob | null = null;
    try {
      const preset = OUTPUT_FORMATS.find((entry) => entry.id === format) || OUTPUT_FORMATS[0];
      const image = new Image();
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error("Could not read selected image."));
        image.src = previewUrl;
      });

      const outWidth = Math.min(2000, image.naturalWidth);
      const outHeight = Math.min(2000, image.naturalHeight);
      const canvas = document.createElement("canvas");
      canvas.width = outWidth;
      canvas.height = outHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context unavailable.");
      drawZoomedImage(ctx, image, outWidth, outHeight, zoom);

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, preset.mime, preset.quality),
      );
      if (!blob) throw new Error("Failed to encode image.");
      preparedBlob = blob;

      const file = new File(
        [blob],
        `${selectedFile.name.replace(/\.[^.]+$/, "")}.${preset.ext}`,
        { type: preset.mime },
      );

      const formData = new FormData();
      formData.set("file", file);

      const response = await fetch("/api/r2/images", {
        method: "POST",
        body: formData,
      });
      const json = await readApiPayload(response, "Upload failed.");
      if (!response.ok || !json?.ok || !json?.item?.url) {
        throw new Error(json?.error || "Upload failed.");
      }
      onChange(String(json.item.url));
      setUploadNotice("Uploaded to R2 and applied to block.");
    } catch (error) {
      try {
        if (preparedBlob) {
          const localUrl = await blobToDataUrl(preparedBlob);
          onChange(localUrl);
          setUploadNotice("R2 upload failed. Applied local image in canvas (not persisted to R2).");
          setUploadError("");
          return;
        }
      } catch {
        // Ignore fallback conversion failures and surface the original issue.
      }
      setUploadError(pickErrorMessage(error, "Upload failed. Please try another image."));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block space-y-1">
        <span className="text-xs text-[var(--color-muted-foreground)]">Image URL</span>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-[var(--color-border)] rounded px-2 py-1 text-sm bg-[var(--color-muted)] text-[var(--color-foreground)] focus:outline-none focus:border-[var(--color-primary)]"
        />
      </label>

      <div className="flex gap-2">
        <button
          onClick={loadLibrary}
          type="button"
          className="px-2 py-1 text-xs rounded border border-[var(--color-border)] bg-[var(--color-secondary)] hover:bg-[var(--color-surface)] text-[var(--color-foreground)]"
        >
          Choose From R2
        </button>
      </div>

      <div className="rounded border border-[var(--color-border)] p-2 space-y-2 bg-[var(--color-surface)]">
        <div className="text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">
          Upload To R2
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
          className="block w-full text-xs text-[var(--color-foreground)]"
        />
        <div className="flex gap-2 items-center">
          <label className="text-xs text-[var(--color-muted-foreground)]">Format</label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as (typeof OUTPUT_FORMATS)[number]["id"])}
            className="border border-[var(--color-border)] rounded px-2 py-1 text-xs bg-[var(--color-muted)] text-[var(--color-foreground)]"
          >
            {OUTPUT_FORMATS.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.label}
              </option>
            ))}
          </select>
        </div>
        <label className="block space-y-1">
          <span className="text-xs text-[var(--color-muted-foreground)]">Zoom</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full"
          />
        </label>
        <canvas
          ref={previewCanvasRef}
          width={320}
          height={180}
          className="w-full rounded border border-[var(--color-border)] bg-black"
        />
        <button
          onClick={uploadPreparedImage}
          disabled={!selectedFile || uploading}
          type="button"
          className="w-full px-2 py-1 text-xs rounded border border-[var(--color-border)] bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? "Uploading..." : "Upload Prepared Image"}
        </button>
        {uploadError ? (
          <div className="text-xs text-[var(--color-danger)]">{uploadError}</div>
        ) : null}
        {uploadNotice ? (
          <div className="text-xs text-[var(--color-muted-foreground)]">{uploadNotice}</div>
        ) : null}
      </div>

      {libraryOpen ? (
        <div className="rounded border border-[var(--color-border)] p-2 space-y-2 bg-[var(--color-surface)]">
          <div className="flex items-center justify-between">
            <div className="text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">
              R2 Library
            </div>
            <button
              type="button"
              onClick={() => setLibraryOpen(false)}
              className="px-2 py-1 text-xs rounded border border-[var(--color-border)] bg-[var(--color-secondary)] hover:bg-[var(--color-surface)] text-[var(--color-foreground)]"
            >
              Close
            </button>
          </div>
          {libraryLoading ? <div className="text-xs text-[var(--color-muted-foreground)]">Loading...</div> : null}
          {libraryError ? <div className="text-xs text-[var(--color-danger)]">{libraryError}</div> : null}
          <div className="max-h-56 overflow-y-auto grid grid-cols-2 gap-2">
            {libraryItems.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  onChange(item.url);
                  setLibraryOpen(false);
                }}
                className="text-left rounded border border-[var(--color-border)] overflow-hidden bg-[var(--color-muted)]"
                title={item.key}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.url} alt={item.key} className="w-full h-20 object-cover" />
                <div className="px-2 py-1 text-[10px] text-[var(--color-muted-foreground)] truncate">
                  {item.key}
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};
