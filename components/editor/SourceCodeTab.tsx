"use client";

import React from "react";
import { useEditor } from "@craftjs/core";
import { serializeToBlockLanguage } from "@/lib/blockSerializer";
import { highlightBlockLanguage, parseBlockLanguage } from "@/lib/blockLanguage";
import { STORAGE_KEY } from "@/lib/editorStorage";

export const SourceCodeTab = () => {
  const { query, actions, nodes } = useEditor((state) => ({ nodes: state.nodes }));
  const [source, setSource] = React.useState("");
  const [status, setStatus] = React.useState("");
  const [error, setError] = React.useState("");
  const highlighted = React.useMemo(() => highlightBlockLanguage(source), [source]);

  React.useEffect(() => {
    const exported = serializeToBlockLanguage(query.getSerializedNodes());
    setSource(exported);
    setStatus("Canvas exported to source.");
    setError("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes]);

  const exportCanvas = () => {
    const exported = serializeToBlockLanguage(query.getSerializedNodes());
    setSource(exported);
    setStatus("Canvas exported to source.");
    setError("");
  };

  const applySource = () => {
    try {
      const parsed = parseBlockLanguage(source);
      const serialized = JSON.stringify(parsed);
      actions.deserialize(serialized);
      localStorage.setItem(STORAGE_KEY, serialized);
      setStatus("Source applied to canvas.");
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to parse block source.");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button
          onClick={exportCanvas}
          className="px-2 py-1 text-xs border border-[var(--color-border)] rounded bg-[var(--color-secondary)] hover:bg-[var(--color-surface)] text-[var(--color-foreground)]"
        >
          Export Canvas
        </button>
        <button
          onClick={applySource}
          className="px-2 py-1 text-xs border border-[var(--color-border)] rounded bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:opacity-90"
        >
          Apply Source
        </button>
      </div>

      <textarea
        value={source}
        onChange={(e) => {
          setSource(e.target.value);
          setStatus("Source edited.");
          setError("");
        }}
        spellCheck={false}
        className="w-full h-44 resize-y rounded border border-[#334155] bg-[#1e293b] text-[#e2e8f0] font-mono text-xs leading-5 p-3 focus:outline-none focus:border-[#38bdf8]"
      />

      <div className="rounded border border-[#334155] bg-[#1e293b] p-3">
        <div className="text-[11px] uppercase tracking-wide text-[#93c5fd] mb-2">
          Syntax Highlight
        </div>
        <pre
          className="whitespace-pre-wrap break-words font-mono text-xs leading-5 text-[#e2e8f0]"
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      </div>

      <style jsx>{`
        .bl-name {
          color: #67e8f9;
        }
        .bl-param {
          color: #fca5a5;
        }
        .bl-value {
          color: #fde68a;
        }
      `}</style>

      {error ? (
        <div className="text-xs text-[#fca5a5]">{error}</div>
      ) : (
        <div className="text-xs text-[var(--color-muted-foreground)]">{status}</div>
      )}
    </div>
  );
};
