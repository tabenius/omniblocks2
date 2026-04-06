"use client";
import React from "react";
import { useNode } from "@craftjs/core";
import {
  TextField,
  SelectField,
  ColorField,
  BackgroundField,
  AlignField,
  FieldStack,
} from "@/components/editor/fields";

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export type HeadingProps = {
  text?: string;
  level?: HeadingLevel;
  color?: string;
  background?: string;
  textAlign?: "left" | "center" | "right";
};

const defaultSizes: Record<HeadingLevel, string> = {
  1: "36px",
  2: "30px",
  3: "24px",
  4: "20px",
  5: "18px",
  6: "16px",
};

export const Heading = ({
  text = "Heading",
  level = 1,
  color = "var(--color-foreground)",
  background = "transparent",
  textAlign = "left",
}: HeadingProps) => {
  const {
    connectors: { connect, drag },
  } = useNode();

  const Tag = `h${level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

  return (
    <Tag
      ref={(ref: HTMLHeadingElement | null) => {
        if (ref) connect(drag(ref));
      }}
      style={{
        fontSize: defaultSizes[level],
        fontWeight: 700,
        color,
        textAlign,
        background,
        margin: 0,
      }}
    >
      {text}
    </Tag>
  );
};

const HeadingSettings = () => (
  <FieldStack>
    <TextField label="Text" propKey="text" />
    <SelectField
      label="Level"
      propKey="level"
      options={[1, 2, 3, 4, 5, 6]}
      parse={(v) => Number(v) as HeadingLevel}
    />
    <ColorField label="Color" propKey="color" />
    <BackgroundField />
    <AlignField />
  </FieldStack>
);

Heading.craft = {
  displayName: "Heading",
  props: {
    text: "Heading",
    level: 1,
    color: "var(--color-foreground)",
    background: "transparent",
    textAlign: "left",
  },
  related: { settings: HeadingSettings },
};
