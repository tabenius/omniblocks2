"use client";
import React from "react";
import { useNode } from "@craftjs/core";
import { RemSliderField, ColorField, BackgroundField, FieldStack } from "@/components/editor/fields";

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
    <RemSliderField label="Padding" propKey="padding" min={0} max={10} step={0.25} fallback={1.5} />
    <RemSliderField label="Gap" propKey="gap" min={0} max={6} step={0.25} fallback={0.5} />
    <BackgroundField />
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
