"use client";
import React from "react";
import { useNode } from "@craftjs/core";
import {
  TextField,
  SelectField,
  FieldStack,
} from "@/components/editor/fields";

export type ImageBlockProps = {
  src?: string;
  alt?: string;
  width?: string;
  maxWidth?: string;
  borderRadius?: string;
  align?: "left" | "center" | "right";
};

export const ImageBlock = ({
  src = "https://placehold.co/800x400",
  alt = "Image",
  width = "100%",
  maxWidth = "800px",
  borderRadius = "0px",
  align = "center",
}: ImageBlockProps) => {
  const {
    connectors: { connect, drag },
  } = useNode();

  const justify =
    align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start";

  return (
    <div
      ref={(ref: HTMLDivElement | null) => {
        if (ref) connect(drag(ref));
      }}
      style={{ display: "flex", justifyContent: justify, width: "100%" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        style={{
          width,
          maxWidth,
          height: "auto",
          borderRadius,
          display: "block",
        }}
      />
    </div>
  );
};

const ImageBlockSettings = () => (
  <FieldStack>
    <TextField label="Src" propKey="src" />
    <TextField label="Alt" propKey="alt" />
    <TextField label="Width" propKey="width" />
    <TextField label="Max width" propKey="maxWidth" />
    <TextField label="Border radius" propKey="borderRadius" />
    <SelectField
      label="Align"
      propKey="align"
      options={["left", "center", "right"] as const}
    />
  </FieldStack>
);

ImageBlock.craft = {
  displayName: "Image",
  props: {
    src: "https://placehold.co/800x400",
    alt: "Image",
    width: "100%",
    maxWidth: "800px",
    borderRadius: "0px",
    align: "center",
  },
  related: { settings: ImageBlockSettings },
  rules: {
    canDrop: (targetNode: { data: { name: string; custom?: { isRoot?: boolean } } }) => {
      // Allow drop into Hero, root Container, or root canvas. Craft.js enforces
      // canMoveIn on the parent too, so this mostly guides UX.
      const name = targetNode.data.name;
      return name === "Hero" || name === "Container" || name === "TextBlock" || name === "PrimaryBox";
    },
  },
};
