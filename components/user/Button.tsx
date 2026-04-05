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

export type ButtonAlign = "left" | "center" | "right";
export type ButtonType = "button" | "submit" | "reset";

export type ButtonProps = {
  text?: string;
  buttonType?: ButtonType;
  align?: ButtonAlign;
  background?: string;
  color?: string;
  borderColor?: string;
  borderRadius?: string;
  paddingX?: string;
  paddingY?: string;
};

export const Button = ({
  text = "Submit",
  buttonType = "button",
  align = "left",
  background = "var(--color-primary)",
  color = "var(--color-primary-foreground)",
  borderColor = "var(--color-primary)",
  borderRadius = "var(--radius-md)",
  paddingX = "var(--space-md)",
  paddingY = "var(--space-sm)",
}: ButtonProps) => {
  const {
    connectors: { connect, drag },
  } = useNode();

  const justifyContent =
    align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start";

  return (
    <div
      ref={(ref: HTMLDivElement | null) => {
        if (ref) connect(drag(ref));
      }}
      style={{
        width: "100%",
        display: "flex",
        justifyContent,
      }}
    >
      <button
        type={buttonType}
        style={{
          background,
          color,
          border: `1px solid ${borderColor}`,
          borderRadius,
          padding: `${paddingY} ${paddingX}`,
          fontFamily: "var(--font-default)",
          fontSize: "var(--text-sm)",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        {text}
      </button>
    </div>
  );
};

const ButtonSettings = () => (
  <FieldStack>
    <TextField label="Text" propKey="text" />
    <SelectField
      label="Type"
      propKey="buttonType"
      options={["button", "submit", "reset"] as const}
      parse={(v) => (v === "submit" ? "submit" : v === "reset" ? "reset" : "button")}
    />
    <SelectField
      label="Align"
      propKey="align"
      options={["left", "center", "right"] as const}
      parse={(v) => (v === "center" ? "center" : v === "right" ? "right" : "left")}
    />
    <RemSliderField label="Horizontal padding" propKey="paddingX" min={0} max={6} step={0.25} fallback={1} />
    <RemSliderField label="Vertical padding" propKey="paddingY" min={0} max={3} step={0.25} fallback={0.5} />
    <RemSliderField label="Border radius" propKey="borderRadius" min={0} max={4} step={0.125} fallback={0.5} />
    <BackgroundField />
    <ColorField label="Text color" propKey="color" />
    <ColorField label="Border color" propKey="borderColor" />
  </FieldStack>
);

Button.craft = {
  displayName: "Button",
  props: {
    text: "Submit",
    buttonType: "button",
    align: "left",
    background: "var(--color-primary)",
    color: "var(--color-primary-foreground)",
    borderColor: "var(--color-primary)",
    borderRadius: "var(--radius-md)",
    paddingX: "var(--space-md)",
    paddingY: "var(--space-sm)",
  },
  related: { settings: ButtonSettings },
};
