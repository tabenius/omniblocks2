"use client";
import React from "react";
import { useNode } from "@craftjs/core";
import {
  TextField,
  SelectField,
  FieldStack,
} from "@/components/editor/fields";

export type MasonryProps = {
  columns?: 2 | 3 | 4;
  gap?: string;
  padding?: string;
  children?: React.ReactNode;
};

export const Masonry = ({
  columns = 3,
  gap = "12px",
  padding = "0px",
  children,
}: MasonryProps) => {
  const {
    connectors: { connect, drag },
  } = useNode();

  return (
    <div
      ref={(ref: HTMLDivElement | null) => {
        if (ref) connect(drag(ref));
      }}
      style={{
        columnCount: columns,
        columnGap: gap,
        padding,
      }}
      className="border border-dashed border-pink-300 [&>*]:mb-[var(--masonry-gap)] [&>*]:break-inside-avoid"
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
      options={[2, 3, 4]}
      parse={(v) => Number(v) as 2 | 3 | 4}
    />
    <TextField label="Gap" propKey="gap" />
    <TextField label="Padding" propKey="padding" />
  </FieldStack>
);

Masonry.craft = {
  displayName: "Masonry",
  props: {
    columns: 3,
    gap: "12px",
    padding: "0px",
  },
  related: { settings: MasonrySettings },
  rules: {
    canMoveIn: (incoming: { data: { name: string } }[]) =>
      incoming.every((n) => n.data.name === "ImageBlock"),
  },
};
