"use client";
import React from "react";
import { useEditor } from "@craftjs/core";

export const SettingsPanel = () => {
  const { selected } = useEditor((state) => {
    const currentNodeId = state.events.selected.values().next().value as
      | string
      | undefined;
    if (!currentNodeId) return { selected: null };
    const node = state.nodes[currentNodeId];
    return {
      selected: {
        id: currentNodeId,
        name: node.data.displayName || node.data.name,
        settings: node.related && node.related.settings,
      },
    };
  });

  if (!selected) {
    return (
      <div className="text-sm text-[var(--color-muted-foreground)]">
        Select a block to edit its settings.
      </div>
    );
  }

  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-[var(--color-muted-foreground)] mb-3">
        {selected.name}
      </div>
      {selected.settings ? (
        <selected.settings />
      ) : (
        <div className="text-sm text-[var(--color-muted-foreground)]">No settings.</div>
      )}
    </div>
  );
};
