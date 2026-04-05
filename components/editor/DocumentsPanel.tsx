"use client";

import React from "react";
import { useEditor } from "@craftjs/core";
import {
  readSavedDocuments,
  removeSavedDocument,
  slugifyDocumentName,
  upsertSavedDocument,
} from "@/lib/documentStore";
import { STORAGE_KEY } from "@/lib/editorStorage";

type DocumentsPanelProps = {
  initialName?: string;
};

export const DocumentsPanel = ({ initialName = "" }: DocumentsPanelProps) => {
  const { query, actions } = useEditor();
  const [name, setName] = React.useState(initialName);
  const [docs, setDocs] = React.useState(() => readSavedDocuments());
  const [status, setStatus] = React.useState("");
  const slug = slugifyDocumentName(name);
  const sortedDocs = React.useMemo(
    () => docs.slice().sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1)),
    [docs],
  );

  React.useEffect(() => {
    setDocs(readSavedDocuments());
  }, []);

  const saveNamed = () => {
    if (!name.trim()) {
      setStatus("Document name is required.");
      return;
    }
    if (!slug) {
      setStatus("Document name must include letters or numbers.");
      return;
    }

    const content = JSON.stringify(query.getSerializedNodes());
    const updated = upsertSavedDocument({
      name: name.trim(),
      slug,
      content,
      updatedAt: new Date().toISOString(),
    });
    localStorage.setItem(STORAGE_KEY, content);
    setDocs(updated);
    setStatus(`Saved '${name.trim()}' (${slug}).`);
  };

  return (
    <section className="rounded border border-[var(--color-border)] bg-[var(--color-muted)] p-3 space-y-3">
      <div className="text-xs uppercase tracking-wide text-[var(--color-accent)]">
        Documents
      </div>

      <div className="space-y-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name your document"
          className="w-full rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-sm text-[var(--color-foreground)] focus:outline-none focus:border-[var(--color-primary)]"
        />
        <div className="text-[11px] text-[var(--color-muted-foreground)]">
          Slug: <code>{slug || "(required)"}</code>
        </div>
        <button
          onClick={saveNamed}
          disabled={!name.trim()}
          className="w-full px-3 py-2 text-sm rounded border border-[var(--color-border)] bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Save Named Document
        </button>
      </div>

      <div className="space-y-2">
        <div className="text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">
          Saved
        </div>
        {docs.length === 0 ? (
          <div className="text-xs text-[var(--color-muted-foreground)]">
            No named documents yet.
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
                    onClick={() => {
                      actions.deserialize(doc.content);
                      localStorage.setItem(STORAGE_KEY, doc.content);
                      setName(doc.name);
                      setStatus(`Loaded '${doc.name}'.`);
                    }}
                    className="px-2 py-1 text-xs rounded border border-[var(--color-border)] bg-[var(--color-secondary)] hover:bg-[var(--color-surface)] text-[var(--color-foreground)]"
                  >
                    Load
                  </button>
                  <button
                    onClick={() => {
                      const next = removeSavedDocument(doc.slug);
                      setDocs(next);
                      setStatus(`Deleted '${doc.name}'.`);
                    }}
                    className="px-2 py-1 text-xs rounded border border-[var(--color-border)] bg-[var(--color-secondary)] hover:bg-[var(--color-surface)] text-[var(--color-foreground)]"
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
