"use client";
import React from "react";
import { useNode } from "@craftjs/core";
import { TextField, ColorField, FieldStack } from "@/components/editor/fields";

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
      className="min-h-[40px] border border-dashed border-gray-300"
    >
      {children}
    </div>
  );
};

const ContainerSettings = () => (
  <FieldStack>
    <ColorField label="Background" propKey="background" />
    <TextField label="Padding" propKey="padding" />
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
