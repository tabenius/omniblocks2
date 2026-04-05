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
    connectors: { connect, drag },
  } = useNode();

  return (
    <div
      ref={(ref) => {
        if (ref) connect(drag(ref));
      }}
      style={{ background, padding }}
      className="min-h-[40px]"
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
