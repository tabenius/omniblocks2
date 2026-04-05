"use client";
import React from "react";
import {
  TextField,
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
    <TextField label="Gap" propKey="gap" />
    <TextField label="Padding" propKey="padding" />
    <ColorField label="Background" propKey="background" />
  </FieldStack>
);
