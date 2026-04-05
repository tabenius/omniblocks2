"use client";
import React from "react";
import { useNode } from "@craftjs/core";
import {
  TextAreaField,
  RemSliderField,
  UnitlessSliderField,
  ColorField,
  AlignField,
  FieldStack,
} from "@/components/editor/fields";

export type ParagraphProps = {
  text?: string;
  fontSize?: string;
  lineHeight?: string;
  color?: string;
  textAlign?: "left" | "center" | "right";
};

export const Paragraph = ({
  text = "Paragraph text",
  fontSize = "var(--text-base)",
  lineHeight = "var(--line-height-base, 1.5)",
  color = "var(--color-muted-foreground)",
  textAlign = "left",
}: ParagraphProps) => {
  const {
    connectors: { connect, drag },
  } = useNode();

  return (
    <p
      ref={(ref: HTMLParagraphElement | null) => {
        if (ref) connect(drag(ref));
      }}
      style={{
        fontSize,
        lineHeight,
        color,
        textAlign,
        margin: 0,
        width: "100%",
        alignSelf: "stretch",
      }}
    >
      {text}
    </p>
  );
};

const ParagraphSettings = () => (
  <FieldStack>
    <TextAreaField label="Text" propKey="text" rows={4} />
    <RemSliderField label="Font size" propKey="fontSize" min={0.75} max={4} step={0.125} fallback={1} />
    <UnitlessSliderField label="Line height" propKey="lineHeight" min={1} max={2.4} step={0.05} fallback={1.5} />
    <ColorField label="Color" propKey="color" />
    <AlignField />
  </FieldStack>
);

Paragraph.craft = {
  displayName: "Paragraph",
  props: {
    text: "Paragraph text",
    fontSize: "var(--text-base)",
    lineHeight: "var(--line-height-base, 1.5)",
    color: "var(--color-muted-foreground)",
    textAlign: "left",
  },
  related: { settings: ParagraphSettings },
};
