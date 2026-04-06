"use client";

import React from "react";
import { useEditor } from "@craftjs/core";
import {
  removeSavedDocument,
  slugifyDocumentName,
  upsertSavedDocument,
  writeSavedDocuments,
} from "@/lib/documentStore";
import { STORAGE_KEY, type SavedDocument } from "@/lib/editorStorage";
import { jsonErrorMessage, safeJsonResponse } from "@/lib/safeJson";

type DocumentsPanelProps = {
  initialName?: string;
  canSave?: boolean;
  saveDisabledReason?: string;
};

type SavedPagesPayload = {
  ok?: boolean;
  error?: string;
  docs?: SavedDocument[];
  doc?: SavedDocument;
};

function normalizeDoc(value: unknown): SavedDocument | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Record<string, unknown>;
  const name = typeof item.name === "string" ? item.name.trim() : "";
  const slug = typeof item.slug === "string" ? slugifyDocumentName(item.slug) : "";
  const content = typeof item.content === "string" ? item.content : "";
  const updatedAt = typeof item.updatedAt === "string" ? item.updatedAt : "";
  if (!name || !slug || !content || !updatedAt) return null;
  return { name, slug, content, updatedAt };
}

function normalizeDocs(value: unknown): SavedDocument[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => normalizeDoc(entry))
    .filter((entry): entry is SavedDocument => Boolean(entry));
}

export const DocumentsPanel = ({
  initialName = "",
  canSave = true,
  saveDisabledReason = "Login required",
}: DocumentsPanelProps) => {
  const { query, actions } = useEditor();
  const [name, setName] = React.useState(initialName);
  const [docs, setDocs] = React.useState<SavedDocument[]>([]);
  const [status, setStatus] = React.useState("");
  const [loadingDocs, setLoadingDocs] = React.useState(false);
  const [mutating, setMutating] = React.useState(false);
  const slug = slugifyDocumentName(name);
  const sortedDocs = React.useMemo(
    () => docs.slice().sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1)),
    [docs],
  );

  const loadDocsFromR2 = React.useCallback(async () => {
    if (!canSave) {
      setDocs([]);
      return;
    }
    setLoadingDocs(true);
    try {
      const response = await fetch("/api/r2/pages", { cache: "no-store" });
      const json = await safeJsonResponse<SavedPagesPayload>(response);
      if (!response.ok || !json?.ok) {
        setStatus(jsonErrorMessage(json, `Failed to load saved pages (${response.status}).`));
        setDocs([]);
        return;
      }
      const nextDocs = normalizeDocs(json.docs);
      setDocs(nextDocs);
      writeSavedDocuments(nextDocs);
    } catch {
      setStatus("Failed to load saved pages.");
      setDocs([]);
    } finally {
      setLoadingDocs(false);
    }
  }, [canSave]);

  React.useEffect(() => {
    void loadDocsFromR2();
  }, [loadDocsFromR2]);

  const saveNamed = async () => {
    if (!canSave) {
      setStatus(saveDisabledReason);
      return;
    }
    const trimmedName = name.trim();
    if (!trimmedName) {
      setStatus("File name is required.");
      return;
    }
    if (!slug) {
      setStatus("File name must include letters or numbers.");
      return;
    }

    const content = JSON.stringify(query.getSerializedNodes());
    setMutating(true);
    try {
      const response = await fetch("/api/r2/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          slug,
          content,
        }),
      });
      const json = await safeJsonResponse<SavedPagesPayload>(response);
      if (!response.ok || !json?.ok) {
        setStatus(jsonErrorMessage(json, `Failed to save page (${response.status}).`));
        return;
      }
      const doc = normalizeDoc(json.doc);
      if (!doc) {
        setStatus("Saved page response is invalid.");
        return;
      }
      setDocs((current) => {
        const next = current.filter((item) => item.slug !== doc.slug);
        next.push(doc);
        const sorted = next.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
        writeSavedDocuments(sorted);
        return sorted;
      });
      localStorage.setItem(STORAGE_KEY, content);
      upsertSavedDocument(doc);
      setStatus(`Saved '${trimmedName}' to R2 (${slug}).`);
    } catch {
      setStatus("Failed to save page.");
    } finally {
      setMutating(false);
    }
  };

  const loadDoc = async (doc: SavedDocument) => {
    actions.deserialize(doc.content);
    localStorage.setItem(STORAGE_KEY, doc.content);
    upsertSavedDocument(doc);
    setName(doc.name);
    setStatus(`Loaded '${doc.name}'.`);
  };

  const deleteDoc = async (doc: SavedDocument) => {
    if (!canSave) {
      setStatus(saveDisabledReason);
      return;
    }
    setMutating(true);
    try {
      const response = await fetch("/api/r2/pages", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: doc.slug }),
      });
      const json = await safeJsonResponse<SavedPagesPayload>(response);
      if (!response.ok || !json?.ok) {
        setStatus(jsonErrorMessage(json, `Failed to delete page (${response.status}).`));
        return;
      }
      setDocs((current) => current.filter((item) => item.slug !== doc.slug));
      removeSavedDocument(doc.slug);
      setStatus(`Deleted '${doc.name}'.`);
    } catch {
      setStatus("Failed to delete page.");
    } finally {
      setMutating(false);
    }
  };

  return (
    <section className="rounded border border-[var(--color-border)] bg-[var(--color-muted)] p-3 space-y-3">
      <div className="text-xs uppercase tracking-wide text-[var(--color-accent)]">
        Documents (R2)
      </div>

      <div className="space-y-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name your document"
          className="w-full rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-sm text-[var(--color-foreground)] focus:outline-none focus:border-[var(--color-primary)]"
        />
        <div className="text-[11px] text-[var(--color-muted-foreground)]">
          File name slug: <code>{slug || "(required)"}</code>
        </div>
        <button
          onClick={saveNamed}
          disabled={!name.trim() || !canSave || mutating}
          title={!canSave ? saveDisabledReason : undefined}
          className={`w-full px-3 py-2 text-sm rounded border border-[var(--color-border)] ${
            canSave
              ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:opacity-90"
              : "bg-[var(--color-muted)] text-[var(--color-muted-foreground)] cursor-not-allowed opacity-70"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {mutating ? "Saving..." : "Save Named Document"}
        </button>
      </div>

      <div className="space-y-2">
        <div className="text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">
          Saved
        </div>
        {!canSave ? (
          <div className="text-xs text-[var(--color-muted-foreground)]">
            Login required to access saved pages.
          </div>
        ) : sortedDocs.length === 0 ? (
          <div className="text-xs text-[var(--color-muted-foreground)]">
            {loadingDocs ? "Loading saved pages..." : "No saved pages in R2 yet."}
          </div>
        ) : (
          sortedDocs.map((doc) => (
            <div
              key={doc.slug}
              className="rounded border border-[var(--color-border)] bg-[var(--color-surface)] p-2 space-y-1"
            >
              <div className="text-xs text-[var(--color-foreground)]">{doc.name}</div>
              <div className="text-[11px] text-[var(--color-muted-foreground)]">
                /slug/{doc.slug}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => void loadDoc(doc)}
                  className="px-2 py-1 text-xs rounded border border-[var(--color-border)] bg-[var(--color-secondary)] hover:bg-[var(--color-surface)] text-[var(--color-foreground)]"
                >
                  Load
                </button>
                <button
                  onClick={() => void deleteDoc(doc)}
                  disabled={mutating}
                  className="px-2 py-1 text-xs rounded border border-[var(--color-border)] bg-[var(--color-secondary)] hover:bg-[var(--color-surface)] text-[var(--color-foreground)] disabled:opacity-60"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="text-xs text-[var(--color-muted-foreground)]">{status}</div>
    </section>
  );
};
