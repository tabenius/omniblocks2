"use client";
import React from "react";
import { useNode } from "@craftjs/core";
import {
  TextAreaField,
  TextField,
  RemSliderField,
  UnitlessSliderField,
  ColorField,
  BackgroundField,
  AlignField,
  FieldStack,
} from "@/components/editor/fields";

export type AlterParagraphProps = {
  text?: string;
  fontSize?: string;
  lineHeight?: string;
  fontFamily?: string;
  color?: string;
  background?: string;
  textAlign?: "left" | "center" | "right";
  fontStyle?: "normal" | "italic";
};

export const AlterParagraph = ({
  text = "Alternate paragraph text",
  fontSize = "var(--text-base)",
  lineHeight = "var(--line-height-base, 1.5)",
  fontFamily = "var(--font-alternate)",
  color = "var(--color-foreground)",
  background = "transparent",
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
      style={{
        fontSize,
        lineHeight,
        fontFamily,
        color,
        background,
        textAlign,
        fontStyle,
        margin: 0,
        width: "100%",
        alignSelf: "stretch",
      }}
    >
      {text}
    </p>
  );
};

const AlterParagraphSettings = () => (
  <FieldStack>
    <TextAreaField label="Text" propKey="text" rows={4} />
    <TextField label="Font family" propKey="fontFamily" />
    <RemSliderField label="Font size" propKey="fontSize" min={0.75} max={4} step={0.125} fallback={1} />
    <UnitlessSliderField label="Line height" propKey="lineHeight" min={1} max={2.4} step={0.05} fallback={1.5} />
    <ColorField label="Color" propKey="color" />
    <BackgroundField />
    <AlignField />
    <TextField label="Font style" propKey="fontStyle" />
  </FieldStack>
);

AlterParagraph.craft = {
  displayName: "AlterParagraph",
  props: {
    text: "Alternate paragraph text",
    fontSize: "var(--text-base)",
    lineHeight: "var(--line-height-base, 1.5)",
    fontFamily: "var(--font-alternate)",
    color: "var(--color-foreground)",
    background: "transparent",
    textAlign: "left",
    fontStyle: "italic",
  },
  related: { settings: AlterParagraphSettings },
};
