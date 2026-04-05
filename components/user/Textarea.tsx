"use client";
import React from "react";
import { useNode } from "@craftjs/core";
import {
  TextField,
  SelectField,
  BooleanField,
  RemSliderField,
  ColorField,
  FieldStack,
} from "@/components/editor/fields";

export type TextareaProps = {
  label?: string;
  placeholder?: string;
  required?: boolean;
  rows?: number;
  background?: string;
  color?: string;
  borderColor?: string;
  borderRadius?: string;
  padding?: string;
};

export const Textarea = ({
  label = "Message",
  placeholder = "Write your message",
  required = false,
  rows = 5,
  background = "var(--color-background)",
  color = "var(--color-foreground)",
  borderColor = "var(--color-border)",
  borderRadius = "var(--radius-sm)",
  padding = "var(--space-sm)",
}: TextareaProps) => {
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
      <textarea
        name="message"
        placeholder={placeholder}
        rows={rows}
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
          resize: "vertical",
        }}
      />
    </label>
  );
};

const TextareaSettings = () => (
  <FieldStack>
    <TextField label="Label" propKey="label" />
    <TextField label="Placeholder" propKey="placeholder" />
    <BooleanField label="Required" propKey="required" />
    <SelectField
      label="Rows"
      propKey="rows"
      options={[3, 4, 5, 6, 8]}
      parse={(v) => {
        const parsed = Number(v);
        return Number.isFinite(parsed) ? parsed : 5;
      }}
    />
    <RemSliderField label="Padding" propKey="padding" min={0} max={4} step={0.25} fallback={0.5} />
    <RemSliderField label="Border radius" propKey="borderRadius" min={0} max={2} step={0.125} fallback={0.25} />
    <ColorField label="Background" propKey="background" />
    <ColorField label="Text color" propKey="color" />
    <ColorField label="Border color" propKey="borderColor" />
  </FieldStack>
);

Textarea.craft = {
  displayName: "Textarea",
  props: {
    label: "Message",
    placeholder: "Write your message",
    required: false,
    rows: 5,
    background: "var(--color-background)",
    color: "var(--color-foreground)",
    borderColor: "var(--color-border)",
    borderRadius: "var(--radius-sm)",
    padding: "var(--space-sm)",
  },
  rules: {
    canDrop: (targetNode: { data?: { name?: string } }) => targetNode.data?.name === "Form",
  },
  related: { settings: TextareaSettings },
};
