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

export type AlterParagraphProps = {
  text?: string;
  fontSize?: string;
  fontFamily?: string;
  color?: string;
  textAlign?: "left" | "center" | "right";
  fontStyle?: "normal" | "italic";
};

export const AlterParagraph = ({
  text = "Alternate paragraph text",
  fontSize = "var(--text-base)",
  fontFamily = "var(--font-alternate)",
  color = "var(--color-foreground)",
  textAlign = "left",
  fontStyle = "italic",
}: AlterParagraphProps) => {
  const {
    connectors: { connect, drag },
  } = useNode();

  return (
    <p
      ref={(ref: HTMLParagraphElement | null) => {
        if (ref) connect(drag(ref));
      }}
      style={{ fontSize, fontFamily, color, textAlign, fontStyle, margin: 0 }}
    >
      {text}
    </p>
  );
};

const AlterParagraphSettings = () => (
  <FieldStack>
    <TextAreaField label="Text" propKey="text" rows={4} />
    <TextField label="Font family" propKey="fontFamily" />
    <TextField label="Font size" propKey="fontSize" />
    <ColorField label="Color" propKey="color" />
    <AlignField />
    <TextField label="Font style" propKey="fontStyle" />
  </FieldStack>
);

AlterParagraph.craft = {
  displayName: "AlterParagraph",
  props: {
    text: "Alternate paragraph text",
    fontSize: "var(--text-base)",
    fontFamily: "var(--font-alternate)",
    color: "var(--color-foreground)",
    textAlign: "left",
    fontStyle: "italic",
  },
  related: { settings: AlterParagraphSettings },
};
