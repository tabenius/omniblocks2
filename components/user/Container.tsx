"use client";
import React from "react";
import { useNode } from "@craftjs/core";
import { RemSliderField, BackgroundField, FieldStack } from "@/components/editor/fields";

export type ContainerProps = {
  background?: string;
  padding?: string;
  children?: React.ReactNode;
};

export const Container = ({
  background = "transparent",
  padding = "16px",
  children,
}: ContainerProps) => {
  const {
    isEmptyCanvas,
    connectors: { connect, drag },
  } = useNode((node) => ({
    isEmptyCanvas: node.data.isCanvas && node.data.nodes.length === 0,
  }));

  return (
    <div
      ref={(ref) => {
        if (ref) connect(drag(ref));
      }}
      style={{
        background,
        padding,
        minHeight: isEmptyCanvas ? "80px" : "40px",
        height: "100%",
        boxSizing: "border-box",
      }}
    >
      {children}
    </div>
  );
};

const ContainerSettings = () => (
  <FieldStack>
    <BackgroundField />
    <RemSliderField label="Padding" propKey="padding" min={0} max={12} step={0.25} fallback={1} />
  </FieldStack>
);

Container.craft = {
  displayName: "Container",
  props: {
    background: "transparent",
    padding: "16px",
  },
  rules: {
    canDrag: () => true,
    canMoveIn: () => true,
  },
  related: { settings: ContainerSettings },
};
