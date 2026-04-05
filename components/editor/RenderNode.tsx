"use client";
import React from "react";
import { useNode, useEditor } from "@craftjs/core";

const BLOCK_ICONS: Record<string, string> = {
  Container: "□",
  Hero: "▭",
  Text: "¶",
  TextBlock: "¶",
  PrimaryBox: "◧",
  Quote: "❝",
  Asset: "◈",
  Masonry: "⊟",
  LayoutBlock: "⊞",
  Author: "◉",
};

export const RenderNode = ({ render }: { render: React.ReactElement }) => {
  const { id, isCanvas, isEmpty, displayName } = useNode((node) => ({
    isCanvas: node.data.isCanvas,
    isEmpty: node.data.isCanvas && node.data.nodes.length === 0,
    displayName: node.data.displayName ?? node.data.name,
  }));

  const { actions, isEnabled, isSelected, isHovered, isDragging } = useEditor(
    (state) => ({
      isEnabled: state.options.enabled !== false,
      isSelected: state.events.selected.has(id),
      isHovered: state.events.hovered.has(id),
      isDragging: state.events.dragged.size > 0,
    })
  );

  const isRoot = id === "ROOT";
  const showChrome = isEnabled && !isRoot;
  const showPlaceholder = showChrome && isCanvas && isEmpty;
  const showDelete = showChrome && (isSelected || isHovered);

  // ── Border logic ──────────────────────────────────────────────────────────
  let outline = "none";
  let background: string | undefined;

  if (showChrome) {
    if (isSelected) {
      outline = "2px solid #3b82f6";
    } else if (isHovered) {
      outline = "1.5px dashed #93c5fd";
    } else if (isCanvas) {
      // Canvas blocks always show a structural guide in the editor
      outline = isDragging && isEmpty
        ? "2px dashed #3b82f6"       // active drop target
        : "1px dashed rgba(0,0,0,0.18)";
    }
    // When dragging over an empty canvas, add a faint blue wash
    if (isDragging && isCanvas && isEmpty) {
      background = "rgba(59,130,246,0.04)";
    }
  }

  return (
    <div
      style={{
        position: "relative",
        outline,
        outlineOffset: 1,
        background,
        // Give empty canvases enough room to show the placeholder
        minHeight: showPlaceholder ? 80 : undefined,
        transition: "outline 0.1s, background 0.1s",
      }}
    >
      {/* ── Empty-canvas placeholder ──────────────────────────────────── */}
      {showPlaceholder && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            pointerEvents: "none",
            color: isDragging ? "#3b82f6" : "rgba(0,0,0,0.3)",
            transition: "color 0.15s",
            userSelect: "none",
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              border: "1.5px dashed currentColor",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 17,
              opacity: isDragging ? 0.9 : 0.55,
            }}
          >
            {BLOCK_ICONS[displayName] ?? displayName?.[0] ?? "·"}
          </div>
          <span
            style={{
              fontSize: 10,
              fontFamily: "monospace",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              opacity: isDragging ? 0.85 : 0.5,
            }}
          >
            {isDragging ? "Drop here" : displayName ?? "Empty"}
          </span>
        </div>
      )}

      {render}

      {/* ── Delete button ────────────────────────────────────────────── */}
      {showDelete && (
        <button
          onMouseDown={(e) => {
            e.stopPropagation();
            actions.delete(id);
          }}
          title={`Delete ${displayName}`}
          style={{
            position: "absolute",
            top: 4,
            right: 4,
            zIndex: 1000,
            background: "#ef4444",
            color: "white",
            border: "none",
            borderRadius: 4,
            width: 22,
            height: 22,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontSize: 12,
            lineHeight: 1,
            padding: 0,
          }}
        >
          🗑
        </button>
      )}
    </div>
  );
};
