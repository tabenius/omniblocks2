"use client";
import React from "react";
import { useNode } from "@craftjs/core";
import {
  RemSliderField,
  SelectField,
  BackgroundField,
  FieldStack,
} from "@/components/editor/fields";

export type MasonryProps = {
  columns?: number;
  gap?: string;
  padding?: string;
  background?: string;
  children?: React.ReactNode;
};

export const Masonry = ({
  columns = 3,
  gap = "12px",
  padding = "8px",
  background = "transparent",
  children,
}: MasonryProps) => {
  const {
    selected,
    hovered,
    connectors: { connect, drag },
  } = useNode((node) => ({
    selected: node.events.selected,
    hovered: node.events.hovered,
  }));

  const safeColumns = Number.isFinite(columns) ? Math.max(1, Math.min(6, Math.round(columns))) : 3;

  return (
    <div
      ref={(ref: HTMLDivElement | null) => {
        if (ref) connect(drag(ref));
      }}
      style={{
        columnCount: safeColumns,
        columnGap: gap,
        padding,
        background,
        minHeight: 80,
        borderRadius: 8,
        outline: selected
          ? "2px solid #3b82f6"
          : hovered
            ? "1.5px dashed #93c5fd"
            : "1px dashed rgba(15, 23, 42, 0.22)",
        outlineOffset: 1,
      }}
      className="[&>*]:break-inside-avoid"
    >
      <style>{`[style*="column-count"] > * { margin-bottom: ${gap}; break-inside: avoid; }`}</style>
      {children}
    </div>
  );
};

const MasonrySettings = () => (
  <FieldStack>
    <SelectField
      label="Columns"
      propKey="columns"
      options={[1, 2, 3, 4, 5, 6]}
      parse={(v) => Math.max(1, Math.min(6, Math.round(Number(v))))}
    />
    <RemSliderField label="Gap" propKey="gap" min={0} max={4} step={0.25} fallback={0.75} />
    <RemSliderField label="Padding" propKey="padding" min={0} max={8} step={0.25} fallback={0.5} />
    <BackgroundField />
  </FieldStack>
);

Masonry.craft = {
  displayName: "Masonry",
  props: {
    columns: 3,
    gap: "12px",
    padding: "8px",
    background: "transparent",
  },
  related: { settings: MasonrySettings },
  rules: {
    canMoveIn: (incoming: { data: { name: string } }[]) =>
      incoming.every((n) => n.data.name === "ImageBlock"),
  },
};
