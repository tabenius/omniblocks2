"use client";
import React from "react";
import { useNode } from "@craftjs/core";
import {
  TextField,
  SelectField,
  RemSliderField,
  ColorField,
  BackgroundField,
  FieldStack,
} from "@/components/editor/fields";

export type FormMethod = "GET" | "POST";

export type FormProps = {
  action?: string;
  method?: FormMethod;
  background?: string;
  padding?: string;
  gap?: string;
  borderRadius?: string;
  borderColor?: string;
  children?: React.ReactNode;
};

const FORM_ALLOWED_CHILDREN = new Set([
  "Heading",
  "Paragraph",
  "AlterParagraph",
  "Name",
  "Email",
  "Textarea",
  "Button",
]);

export const Form = ({
  action = "",
  method = "POST",
  background = "var(--color-surface)",
  padding = "var(--space-md)",
  gap = "var(--space-sm)",
  borderRadius = "var(--radius-md)",
  borderColor = "var(--color-border)",
  children,
}: FormProps) => {
  const {
    connectors: { connect, drag },
  } = useNode();

  return (
    <form
      ref={(ref: HTMLFormElement | null) => {
        if (ref) connect(drag(ref));
      }}
      action={action || undefined}
      method={(method || "POST").toLowerCase() as "get" | "post"}
      onSubmit={(e) => e.preventDefault()}
      style={{
        background,
        padding,
        borderRadius,
        border: `1px solid ${borderColor}`,
        display: "flex",
        flexDirection: "column",
        gap,
      }}
    >
      {children}
    </form>
  );
};

const FormSettings = () => (
  <FieldStack>
    <TextField label="Action URL" propKey="action" placeholder="/api/contact" />
    <SelectField
      label="Method"
      propKey="method"
      options={["POST", "GET"] as const}
      parse={(v) => (v === "GET" ? "GET" : "POST")}
    />
    <RemSliderField label="Padding" propKey="padding" min={0} max={10} step={0.25} fallback={1} />
    <RemSliderField label="Gap" propKey="gap" min={0} max={6} step={0.25} fallback={0.5} />
    <RemSliderField label="Border radius" propKey="borderRadius" min={0} max={4} step={0.125} fallback={0.5} />
    <BackgroundField />
    <ColorField label="Border color" propKey="borderColor" />
  </FieldStack>
);

Form.craft = {
  displayName: "Form",
  props: {
    action: "",
    method: "POST",
    background: "var(--color-surface)",
    padding: "var(--space-md)",
    gap: "var(--space-sm)",
    borderRadius: "var(--radius-md)",
    borderColor: "var(--color-border)",
  },
  rules: {
    canMoveIn: (incoming: Array<{ data: { name: string } }>) =>
      incoming.every((n) => FORM_ALLOWED_CHILDREN.has(n.data.name)),
  },
  related: { settings: FormSettings },
};
