"use client";
import React from "react";
import { useNode, Element } from "@craftjs/core";
import { Container } from "./Container";
import { LayoutSettings } from "./LayoutSettings";

export type LayoutBlockProps = {
  columns?: 1 | 2 | 3 | 4;
  gap?: string;
  padding?: string;
  background?: string;
};

export const LayoutBlock = ({
  columns = 2,
  gap = "16px",
  padding = "16px",
  background = "transparent",
}: LayoutBlockProps) => {
  const {
    connectors: { connect, drag },
  } = useNode();

  const columnKeys = Array.from({ length: columns }, (_, i) => `column-${i}`);

  return (
    <div
      ref={(ref) => {
        if (ref) connect(drag(ref));
      }}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        gap,
        padding,
        background,
      }}
      className="border border-dashed border-blue-300"
    >
      {columnKeys.map((key) => (
        <Element key={key} id={key} is={Container} canvas />
      ))}
    </div>
  );
};

LayoutBlock.craft = {
  displayName: "LayoutBlock",
  props: {
    columns: 2,
    gap: "16px",
    padding: "16px",
    background: "transparent",
  },
  related: {
    settings: LayoutSettings,
  },
};
