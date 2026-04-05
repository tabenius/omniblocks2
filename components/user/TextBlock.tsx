"use client";
import React from "react";
import { useNode } from "@craftjs/core";
import { RemSliderField, ColorField, FieldStack } from "@/components/editor/fields";

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
    <RemSliderField label="Padding" propKey="padding" min={0} max={12} step={0.25} fallback={1} />
    <RemSliderField label="Gap" propKey="gap" min={0} max={6} step={0.25} fallback={0.75} />
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
          n.data.name === "AlterParagraph" ||
          n.data.name === "Button"
      ),
  },
  related: { settings: TextBlockSettings },
};
