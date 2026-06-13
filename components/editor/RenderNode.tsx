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
  ContactForm: "✉",
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
  const showDelete = showChrome && isSelected && !isDragging;

  // ── Border logic ──────────────────────────────────────────────────────────
  let chromeBorder: string | undefined;
  let background: string | undefined;
  let chromeLabelBackground = "rgba(15, 23, 42, 0.6)";
  let chromeLabelColor = "rgba(255,255,255,0.92)";

  if (showChrome) {
    chromeBorder = isCanvas ? "1px dashed rgba(15, 23, 42, 0.22)" : "1px solid rgba(15, 23, 42, 0.2)";
    if (isSelected) {
      chromeBorder = "2px solid #3b82f6";
      chromeLabelBackground = "#3b82f6";
      chromeLabelColor = "#ffffff";
    } else if (isHovered) {
      chromeBorder = "1.5px dashed #93c5fd";
      chromeLabelBackground = "rgba(59, 130, 246, 0.82)";
      chromeLabelColor = "#ffffff";
    }
    // When dragging over an empty canvas, add a faint blue wash
    if (isDragging && isCanvas && isEmpty) {
      chromeBorder = "2px dashed #3b82f6";
      background = "rgba(59,130,246,0.04)";
    }
  }

  return (
    <div
      style={{
        position: "relative",
        background,
        // Keep a roomy target only for empty canvases; otherwise let block
        // content define height so background fills the whole visible block.
        minHeight: showPlaceholder ? 80 : undefined,
        minWidth: showPlaceholder ? 28 : undefined,
        transition: "background 0.1s",
      }}
    >
      {showChrome && chromeBorder ? (
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            border: chromeBorder,
            boxSizing: "border-box",
            pointerEvents: "none",
            zIndex: 2,
            transition: "border 0.1s",
          }}
        />
      ) : null}

      {/* ── Persistent chrome label ───────────────────────────────────────── */}
      {showChrome && (
        <div
          onMouseDown={(event) => {
            event.preventDefault();
            event.stopPropagation();
            actions.selectNode(id);
          }}
          style={{
            position: "absolute",
            top: 2,
            left: 2,
            zIndex: 999,
            borderRadius: 4,
            fontSize: 9,
            letterSpacing: "0.04em",
            lineHeight: 1.2,
            padding: "2px 4px",
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            textTransform: "uppercase",
            background: chromeLabelBackground,
            color: chromeLabelColor,
            pointerEvents: "auto",
            cursor: "pointer",
            userSelect: "none",
            opacity: isSelected || isHovered ? 1 : 0.72,
          }}
          title={`Select ${displayName ?? "block"}`}
        >
          {displayName ?? "Block"}
        </div>
      )}

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
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onClick={(e) => {
            e.preventDefault();
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
