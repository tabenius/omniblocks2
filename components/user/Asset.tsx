"use client";
import React from "react";
import { useNode } from "@craftjs/core";
import { TextField, RemSliderField, BackgroundField, FieldStack } from "@/components/editor/fields";

export type AssetProps = {
  price?: string;
  currency?: string;
  padding?: string;
  background?: string;
  borderRadius?: string;
  gap?: string;
  children?: React.ReactNode;
};

export const Asset = ({
  price = "49",
  currency = "$",
  padding = "var(--space-md)",
  background = "var(--color-surface)",
  borderRadius = "var(--radius-lg)",
  gap = "var(--space-sm)",
  children,
}: AssetProps) => {
  const {
    connectors: { connect, drag },
  } = useNode();

  return (
    <article
      ref={(ref: HTMLElement | null) => {
        if (ref) connect(drag(ref));
      }}
      style={{
        padding,
        background,
        borderRadius,
        border: "1px solid var(--color-border)",
        display: "flex",
        flexDirection: "column",
        gap,
      }}
    >
      {children}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          fontSize: "16px",
          fontWeight: 700,
          color: "#111827",
        }}
      >
        {currency}
        {price}
      </div>
    </article>
  );
};

const AssetSettings = () => (
  <FieldStack>
    <TextField label="Price" propKey="price" />
    <TextField label="Currency" propKey="currency" />
    <RemSliderField label="Padding" propKey="padding" min={0} max={10} step={0.25} fallback={1} />
    <RemSliderField label="Gap" propKey="gap" min={0} max={6} step={0.25} fallback={0.5} />
    <RemSliderField label="Border radius" propKey="borderRadius" min={0} max={4} step={0.125} fallback={0.75} />
    <BackgroundField />
  </FieldStack>
);

Asset.craft = {
  displayName: "Asset",
  props: {
    price: "49",
    currency: "$",
    padding: "var(--space-md)",
    background: "var(--color-surface)",
    borderRadius: "var(--radius-lg)",
    gap: "var(--space-sm)",
  },
  related: { settings: AssetSettings },
  rules: {
    canMoveIn: (incoming: { data: { name: string } }[]) =>
      incoming.every(
        (n) =>
          n.data.name === "ImageBlock" ||
          n.data.name === "Audio" ||
          n.data.name === "Author"
      ),
  },
};
