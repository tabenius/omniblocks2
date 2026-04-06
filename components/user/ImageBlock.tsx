"use client";
import React from "react";
import { useNode } from "@craftjs/core";
import {
  TextField,
  PercentSliderField,
  PxSliderField,
  RemSliderField,
  SelectField,
  BackgroundField,
  FieldStack,
} from "@/components/editor/fields";
import { R2ImageSourceField } from "@/components/editor/R2ImageSourceField";

export type ImageBlockProps = {
  src?: string;
  alt?: string;
  width?: string;
  maxWidth?: string;
  borderRadius?: string;
  background?: string;
  align?: "left" | "center" | "right";
};

export const ImageBlock = ({
  src = "https://placehold.co/800x400",
  alt = "Image",
  width = "100%",
  maxWidth = "800px",
  borderRadius = "0px",
  background = "transparent",
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
      style={{ display: "flex", justifyContent: justify, width: "100%", background }}
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

const ImageBlockSettings = () => {
  const {
    src,
    actions: { setProp },
  } = useNode((node) => ({
    src: String((node.data.props as ImageBlockProps).src || ""),
  }));

  return (
    <FieldStack>
      <R2ImageSourceField
        value={src}
        onChange={(next) =>
          setProp((props: ImageBlockProps) => {
            props.src = next;
          })
        }
      />
      <TextField label="Alt" propKey="alt" />
      <PercentSliderField label="Width" propKey="width" min={10} max={100} step={1} fallback={100} />
      <PxSliderField label="Max width" propKey="maxWidth" min={120} max={1920} step={10} fallback={800} />
      <RemSliderField label="Border radius" propKey="borderRadius" min={0} max={4} step={0.125} fallback={0} />
      <BackgroundField />
      <SelectField
        label="Align"
        propKey="align"
        options={["left", "center", "right"] as const}
      />
    </FieldStack>
  );
};

ImageBlock.craft = {
  displayName: "Image",
  props: {
    src: "https://placehold.co/800x400",
    alt: "Image",
    width: "100%",
    maxWidth: "800px",
    borderRadius: "0px",
    background: "transparent",
    align: "center",
  },
  related: { settings: ImageBlockSettings },
  rules: {
    canDrop: (targetNode: { data: { name: string; custom?: { isRoot?: boolean } } }) => {
      // Allow drop into Hero, root Container, or root canvas. Craft.js enforces
      // canMoveIn on the parent too, so this mostly guides UX.
      const name = targetNode.data.name;
      return (
        name === "Hero" ||
        name === "Container" ||
        name === "TextBlock" ||
        name === "PrimaryBox" ||
        name === "Masonry"
      );
    },
  },
};
