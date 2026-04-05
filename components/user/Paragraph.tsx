"use client";
import React from "react";
import { useNode } from "@craftjs/core";
import {
  TextAreaField,
  TextField,
  ColorField,
  AlignField,
  FieldStack,
} from "@/components/editor/fields";

export type ParagraphProps = {
  text?: string;
  fontSize?: string;
  color?: string;
  textAlign?: "left" | "center" | "right";
};

export const Paragraph = ({
  text = "Paragraph text",
  fontSize = "var(--text-base)",
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
      style={{ fontSize, color, textAlign, margin: 0 }}
    >
      {text}
    </p>
  );
};

const ParagraphSettings = () => (
  <FieldStack>
    <TextAreaField label="Text" propKey="text" rows={4} />
    <TextField label="Font size" propKey="fontSize" />
    <ColorField label="Color" propKey="color" />
    <AlignField />
  </FieldStack>
);

Paragraph.craft = {
  displayName: "Paragraph",
  props: {
    text: "Paragraph text",
    fontSize: "var(--text-base)",
    color: "var(--color-muted-foreground)",
    textAlign: "left",
  },
  related: { settings: ParagraphSettings },
};
