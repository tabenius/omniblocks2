"use client";
import React from "react";
import {
  RemSliderField,
  SelectField,
  ColorField,
  FieldStack,
} from "@/components/editor/fields";

export const LayoutSettings = () => (
  <FieldStack>
    <SelectField
      label="Columns"
      propKey="columns"
      options={[1, 2, 3, 4]}
      parse={(v) => Number(v) as 1 | 2 | 3 | 4}
    />
    <RemSliderField label="Gap" propKey="gap" min={0} max={6} step={0.25} fallback={1} />
    <RemSliderField label="Padding" propKey="padding" min={0} max={10} step={0.25} fallback={1} />
    <ColorField label="Background" propKey="background" />
  </FieldStack>
);
