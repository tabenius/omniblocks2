"use client";
import React from "react";
import { useNode } from "@craftjs/core";
import { TextField, ColorField, FieldStack } from "@/components/editor/fields";

export type PrimaryBoxProps = {
  padding?: string;
  gap?: string;
  background?: string;
  color?: string;
  children?: React.ReactNode;
};

export const PrimaryBox = ({
  padding = "var(--space-lg)",
  gap = "var(--space-sm)",
  background = "var(--color-primary)",
  color = "var(--color-primary-foreground)",
  children,
}: PrimaryBoxProps) => {
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
        color,
        display: "flex",
        flexDirection: "column",
        gap,
        borderRadius: "var(--radius-md)",
      }}
    >
      {children}
    </div>
  );
};

const PrimaryBoxSettings = () => (
  <FieldStack>
    <TextField label="Padding" propKey="padding" />
    <TextField label="Gap" propKey="gap" />
    <ColorField label="Background" propKey="background" />
    <ColorField label="Text color" propKey="color" />
  </FieldStack>
);

PrimaryBox.craft = {
  displayName: "PrimaryBox",
  props: {
    padding: "var(--space-lg)",
    gap: "var(--space-sm)",
    background: "var(--color-primary)",
    color: "var(--color-primary-foreground)",
  },
  related: { settings: PrimaryBoxSettings },
};
