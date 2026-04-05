"use client";
import React from "react";
import { useNode } from "@craftjs/core";
import {
  TextField,
  BooleanField,
  RemSliderField,
  FieldStack,
} from "@/components/editor/fields";

export type AudioProps = {
  src?: string;
  title?: string;
  controls?: boolean;
  autoPlay?: boolean;
  loop?: boolean;
  background?: string;
  padding?: string;
  borderRadius?: string;
};

export const Audio = ({
  src = "https://www.w3schools.com/html/horse.mp3",
  title = "Audio",
  controls = true,
  autoPlay = false,
  loop = false,
  background = "var(--color-muted)",
  padding = "var(--space-sm) var(--space-md)",
  borderRadius = "var(--radius-md)",
}: AudioProps) => {
  const {
    connectors: { connect, drag },
  } = useNode();

  return (
    <div
      ref={(ref: HTMLDivElement | null) => {
        if (ref) connect(drag(ref));
      }}
      style={{
        background,
        padding,
        borderRadius,
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        border: "1px solid var(--color-border)",
      }}
    >
      {title && (
        <div
          style={{
            fontSize: "13px",
            fontWeight: 600,
            color: "var(--color-foreground)",
            fontFamily: "var(--font-default)",
          }}
        >
          {title}
        </div>
      )}
      <audio
        src={src}
        controls={controls}
        autoPlay={autoPlay}
        loop={loop}
        style={{ width: "100%" }}
      />
    </div>
  );
};

const AudioSettings = () => (
  <FieldStack>
    <TextField label="Title" propKey="title" />
    <TextField label="Source URL" propKey="src" />
    <BooleanField label="Controls" propKey="controls" />
    <BooleanField label="Autoplay" propKey="autoPlay" />
    <BooleanField label="Loop" propKey="loop" />
    <RemSliderField label="Padding" propKey="padding" min={0} max={8} step={0.25} fallback={1} />
    <RemSliderField label="Border radius" propKey="borderRadius" min={0} max={4} step={0.125} fallback={0.5} />
  </FieldStack>
);

Audio.craft = {
  displayName: "Audio",
  props: {
    src: "https://www.w3schools.com/html/horse.mp3",
    title: "Audio",
    controls: true,
    autoPlay: false,
    loop: false,
    background: "var(--color-muted)",
    padding: "var(--space-sm) var(--space-md)",
    borderRadius: "var(--radius-md)",
  },
  related: { settings: AudioSettings },
};
