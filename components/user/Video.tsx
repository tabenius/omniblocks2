"use client";

import React from "react";
import { useNode } from "@craftjs/core";
import { TextField, RemSliderField, FieldStack } from "@/components/editor/fields";

export type VideoProps = {
  src?: string;
  title?: string;
  controls?: boolean;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  background?: string;
  padding?: string;
  borderRadius?: string;
};

function toEmbeddableUrl(raw: string): string {
  const input = raw.trim();
  if (!input) return "";
  try {
    const url = new URL(input);
    if (url.hostname.includes("youtu.be")) {
      const id = url.pathname.replaceAll("/", "");
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    if (url.hostname.includes("youtube.com")) {
      const id = url.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    if (url.hostname.includes("vimeo.com")) {
      const id = url.pathname.split("/").filter(Boolean).pop() ?? "";
      if (id) return `https://player.vimeo.com/video/${id}`;
    }
    return input;
  } catch {
    return input;
  }
}

export const Video = ({
  src = "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  title = "Video",
  controls = true,
  autoPlay = false,
  loop = false,
  muted = false,
  background = "var(--color-muted)",
  padding = "var(--space-sm) var(--space-md)",
  borderRadius = "var(--radius-md)",
}: VideoProps) => {
  const {
    connectors: { connect, drag },
  } = useNode();

  const embedSrc = toEmbeddableUrl(src);
  const isEmbed = /youtube\.com\/embed|player\.vimeo\.com\/video/.test(embedSrc);

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
      <div
        style={{
          position: "relative",
          width: "100%",
          paddingTop: "56.25%",
          borderRadius: "10px",
          overflow: "hidden",
          background: "#000",
        }}
      >
        {isEmbed ? (
          <iframe
            title={title || "Video player"}
            src={embedSrc}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              border: "0",
            }}
          />
        ) : (
          <video
            src={embedSrc}
            controls={controls}
            autoPlay={autoPlay}
            loop={loop}
            muted={muted}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
            }}
          />
        )}
      </div>
    </div>
  );
};

const VideoSettings = () => (
  <FieldStack>
    <TextField label="Title" propKey="title" />
    <TextField label="Source URL" propKey="src" />
    <RemSliderField label="Padding" propKey="padding" min={0} max={8} step={0.25} fallback={1} />
    <RemSliderField label="Border radius" propKey="borderRadius" min={0} max={4} step={0.125} fallback={0.5} />
  </FieldStack>
);

Video.craft = {
  displayName: "Video",
  props: {
    src: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    title: "Video",
    controls: true,
    autoPlay: false,
    loop: false,
    muted: false,
    background: "var(--color-muted)",
    padding: "var(--space-sm) var(--space-md)",
    borderRadius: "var(--radius-md)",
  },
  related: { settings: VideoSettings },
};
