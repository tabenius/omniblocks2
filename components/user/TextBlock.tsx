"use client";
import React from "react";
import { useNode } from "@craftjs/core";
import { TextField, ColorField, FieldStack } from "@/components/editor/fields";

export type TextBlockProps = {
  padding?: string;
  gap?: string;
  background?: string;
  children?: React.ReactNode;
};

export const TextBlock = ({
  padding = "16px",
  gap = "12px",
  background = "transparent",
  children,
}: TextBlockProps) => {
  const {
    connectors: { connect, drag },
  } = useNode();

  return (
    <div
      ref={(ref: HTMLDivElement | null) => {
        if (ref) connect(drag(ref));
      }}
      style={{
        padding,
        background,
        display: "flex",
        flexDirection: "column",
        gap,
      }}
      className=""
    >
      {children}
    </div>
  );
};

const TextBlockSettings = () => (
  <FieldStack>
    <TextField label="Padding" propKey="padding" />
    <TextField label="Gap" propKey="gap" />
    <ColorField label="Background" propKey="background" />
  </FieldStack>
);

TextBlock.craft = {
  displayName: "Text",
  props: {
    padding: "16px",
    gap: "12px",
    background: "transparent",
  },
  rules: {
    canMoveIn: (incoming: { data: { name: string } }[]) =>
      incoming.every(
        (n) =>
          n.data.name === "Heading" ||
          n.data.name === "Paragraph" ||
          n.data.name === "AlterParagraph"
      ),
  },
  related: { settings: TextBlockSettings },
};
