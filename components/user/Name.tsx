"use client";
import React from "react";
import { useNode } from "@craftjs/core";
import {
  TextField,
  BooleanField,
  RemSliderField,
  ColorField,
  FieldStack,
} from "@/components/editor/fields";

export type NameProps = {
  label?: string;
  placeholder?: string;
  required?: boolean;
  background?: string;
  color?: string;
  borderColor?: string;
  borderRadius?: string;
  padding?: string;
};

export const Name = ({
  label = "Name",
  placeholder = "Your name",
  required = true,
  background = "var(--color-background)",
  color = "var(--color-foreground)",
  borderColor = "var(--color-border)",
  borderRadius = "var(--radius-sm)",
  padding = "var(--space-sm)",
}: NameProps) => {
  const {
    connectors: { connect, drag },
  } = useNode();

  return (
    <label
      ref={(ref: HTMLLabelElement | null) => {
        if (ref) connect(drag(ref));
      }}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        width: "100%",
        fontFamily: "var(--font-default)",
      }}
    >
      <span style={{ fontSize: "12px", color: "var(--color-muted-foreground)" }}>
        {label}{required ? " *" : ""}
      </span>
      <input
        type="text"
        name="name"
        placeholder={placeholder}
        readOnly
        required={required}
        style={{
          width: "100%",
          padding,
          border: `1px solid ${borderColor}`,
          borderRadius,
          background,
          color,
          fontFamily: "var(--font-default)",
          fontSize: "var(--text-sm)",
        }}
      />
    </label>
  );
};

const NameSettings = () => (
  <FieldStack>
    <TextField label="Label" propKey="label" />
    <TextField label="Placeholder" propKey="placeholder" />
    <BooleanField label="Required" propKey="required" />
    <RemSliderField label="Padding" propKey="padding" min={0} max={4} step={0.25} fallback={0.5} />
    <RemSliderField label="Border radius" propKey="borderRadius" min={0} max={2} step={0.125} fallback={0.25} />
    <ColorField label="Background" propKey="background" />
    <ColorField label="Text color" propKey="color" />
    <ColorField label="Border color" propKey="borderColor" />
  </FieldStack>
);

Name.craft = {
  displayName: "Name",
  props: {
    label: "Name",
    placeholder: "Your name",
    required: true,
    background: "var(--color-background)",
    color: "var(--color-foreground)",
    borderColor: "var(--color-border)",
    borderRadius: "var(--radius-sm)",
    padding: "var(--space-sm)",
  },
  rules: {
    canDrop: (targetNode: { data?: { name?: string } }) => targetNode.data?.name === "Form",
  },
  related: { settings: NameSettings },
};
