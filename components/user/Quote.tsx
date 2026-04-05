"use client";
import React from "react";
import { useNode } from "@craftjs/core";
import { RemSliderField, ColorField, BackgroundField, FieldStack } from "@/components/editor/fields";

export type QuoteProps = {
  padding?: string;
  gap?: string;
  background?: string;
  accentColor?: string;
  borderRadius?: string;
  children?: React.ReactNode;
};

export const Quote = ({
  padding = "var(--space-lg) var(--space-lg)",
  gap = "var(--space-sm)",
  background = "var(--color-muted)",
  accentColor = "var(--color-primary)",
  borderRadius = "var(--radius-md)",
  children,
}: QuoteProps) => {
  const {
    connectors: { connect, drag },
  } = useNode();

  return (
    <blockquote
      ref={(ref: HTMLQuoteElement | null) => {
        if (ref) connect(drag(ref));
      }}
      style={{
        padding,
        background,
        borderRadius,
        borderLeft: `4px solid ${accentColor}`,
        display: "flex",
        flexDirection: "column",
        gap,
        margin: 0,
      }}
    >
      {children}
    </blockquote>
  );
};

const QuoteSettings = () => (
  <FieldStack>
    <RemSliderField label="Padding" propKey="padding" min={0} max={12} step={0.25} fallback={1.5} />
    <RemSliderField label="Gap" propKey="gap" min={0} max={6} step={0.25} fallback={0.5} />
    <RemSliderField label="Border radius" propKey="borderRadius" min={0} max={3} step={0.125} fallback={0.5} />
    <BackgroundField />
    <ColorField label="Accent color" propKey="accentColor" />
  </FieldStack>
);

Quote.craft = {
  displayName: "Quote",
  props: {
    padding: "var(--space-lg) var(--space-lg)",
    gap: "var(--space-sm)",
    background: "var(--color-muted)",
    accentColor: "var(--color-primary)",
    borderRadius: "var(--radius-md)",
  },
  related: { settings: QuoteSettings },
  rules: {
    canMoveIn: (incoming: { data: { name: string } }[]) =>
      incoming.every(
        (n) => n.data.name === "Author" || n.data.name === "TextBlock"
      ),
  },
};
