"use client";

import React from "react";
import { useEditor } from "@craftjs/core";
import { STORAGE_KEY } from "@/lib/editorStorage";
import type { StartupTemplate } from "@/lib/startupAssets";

function cloneTemplateNodes<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export const TemplatesTab = ({
  templates,
  loading = false,
}: {
  templates: StartupTemplate[];
  loading?: boolean;
}) => {
  const { actions } = useEditor();
  const [status, setStatus] = React.useState("");

  return (
    <div className="space-y-3">
      <div className="text-xs text-[var(--color-muted-foreground)]">
        Immutable templates: loading creates an editable copy in the canvas.
      </div>
      {loading ? (
        <div className="space-y-2">
          <div className="h-18 rounded border border-[var(--color-border)] bg-[var(--color-surface)] animate-pulse" />
          <div className="h-18 rounded border border-[var(--color-border)] bg-[var(--color-surface)] animate-pulse" />
          <div className="h-18 rounded border border-[var(--color-border)] bg-[var(--color-surface)] animate-pulse" />
        </div>
      ) : templates.length === 0 ? (
        <div className="text-xs text-[var(--color-muted-foreground)]">
          No startup templates were loaded yet.
        </div>
      ) : templates.map((template) => (
        <div
          key={template.id}
          className="rounded border border-[var(--color-border)] bg-[var(--color-surface)] p-3 space-y-2"
        >
          <div className="text-xs uppercase tracking-wide text-[var(--color-accent)]">
            {template.title}
          </div>
          <div className="text-xs text-[var(--color-muted-foreground)]">
            {template.description}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                const nodes = cloneTemplateNodes(template.nodes);
                const serialized = JSON.stringify(nodes);
                actions.deserialize(serialized);
                localStorage.setItem(STORAGE_KEY, serialized);
                setStatus(`Loaded ${template.title} as editable mockup.`);
              }}
              className="px-2 py-1 text-xs rounded border border-[var(--color-border)] bg-[var(--color-secondary)] hover:bg-[var(--color-surface)] text-[var(--color-foreground)]"
            >
              Use Template
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(template.blockSource).then(() => {
                  setStatus(`Copied ${template.title} block source.`);
                });
              }}
              className="px-2 py-1 text-xs rounded border border-[var(--color-border)] bg-[var(--color-secondary)] hover:bg-[var(--color-surface)] text-[var(--color-foreground)]"
            >
              Copy Source
            </button>
          </div>
        </div>
      ))}
      <div className="text-xs text-[var(--color-muted-foreground)]">{status}</div>
    </div>
  );
};
