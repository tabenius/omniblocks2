"use client";
import React from "react";
import { useNode } from "@craftjs/core";
import {
  RemSliderField,
  ColorField,
  AlignField,
  FieldStack,
} from "@/components/editor/fields";

export type HeroProps = {
  padding?: string;
  gap?: string;
  background?: string;
  textAlign?: "left" | "center" | "right";
  children?: React.ReactNode;
};

export const Hero = ({
  padding = "var(--space-3xl) var(--space-xl)",
  gap = "var(--space-md)",
  background = "var(--color-muted)",
  textAlign = "center",
  children,
}: HeroProps) => {
  const {
    connectors: { connect, drag },
  } = useNode();

  return (
    <section
      ref={(ref: HTMLElement | null) => {
        if (ref) connect(drag(ref));
      }}
      style={{
        padding,
        background,
        textAlign,
        display: "flex",
        flexDirection: "column",
        gap,
        alignItems:
          textAlign === "center"
            ? "center"
            : textAlign === "right"
              ? "flex-end"
              : "flex-start",
      }}
      className=""
    >
      {children}
    </section>
  );
};

const HeroSettings = () => (
  <FieldStack>
    <RemSliderField label="Padding" propKey="padding" min={0} max={12} step={0.25} fallback={4} />
    <RemSliderField label="Gap" propKey="gap" min={0} max={6} step={0.25} fallback={1} />
    <ColorField label="Background" propKey="background" />
    <AlignField />
  </FieldStack>
);

Hero.craft = {
  displayName: "Hero",
  props: {
    padding: "var(--space-3xl) var(--space-xl)",
    gap: "var(--space-md)",
    background: "var(--color-muted)",
    textAlign: "center",
  },
  related: { settings: HeroSettings },
};
