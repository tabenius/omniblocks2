"use client";

import React from "react";
import { useNode } from "@craftjs/core";
import {
  TextAreaField,
  TextField,
  ColorField,
  BackgroundField,
  FieldStack,
} from "@/components/editor/fields";

export type EventProps = {
  from?: string;
  to?: string;
  title?: string;
  text?: string;
  background?: string;
  borderColor?: string;
  dateBackground?: string;
  dateColor?: string;
};

type DateParts = {
  month: string;
  day: string;
  year: string;
  raw: string;
};

function parseDateParts(input: string): DateParts {
  const trimmed = input.trim();
  if (!trimmed) {
    return { month: "DATE", day: "--", year: "", raw: "" };
  }
  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    return {
      month: parsed.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
      day: String(parsed.getDate()).padStart(2, "0"),
      year: String(parsed.getFullYear()),
      raw: trimmed,
    };
  }
  return { month: "DATE", day: trimmed, year: "", raw: trimmed };
}

export const Event = ({
  from = "2026-06-14",
  to = "",
  title = "Event title",
  text = "Event description paragraph",
  background = "var(--color-surface)",
  borderColor = "var(--color-border)",
  dateBackground = "var(--color-muted)",
  dateColor = "var(--color-foreground)",
}: EventProps) => {
  const {
    connectors: { connect, drag },
  } = useNode();

  const fromParts = parseDateParts(from);
  const toParts = parseDateParts(to);
  const hasTo = to.trim().length > 0;

  return (
    <article
      ref={(ref: HTMLElement | null) => {
        if (ref) connect(drag(ref));
      }}
      style={{
        display: "grid",
        gridTemplateColumns: "140px minmax(0, 1fr)",
        gap: "12px",
        padding: "14px",
        border: `1px solid ${borderColor}`,
        borderRadius: "12px",
        background,
      }}
    >
      <div
        style={{
          borderRadius: "10px",
          background: dateBackground,
          color: dateColor,
          padding: "10px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          lineHeight: 1.1,
        }}
      >
        <div style={{ fontSize: "10px", letterSpacing: "0.08em", opacity: 0.85 }}>{fromParts.month}</div>
        <div style={{ fontSize: "42px", fontWeight: 800 }}>{fromParts.day}</div>
        <div style={{ fontSize: "11px", opacity: 0.85 }}>{fromParts.year}</div>
        {hasTo ? (
          <div style={{ marginTop: "8px", fontSize: "10px", opacity: 0.9 }}>
            to {toParts.raw || to}
          </div>
        ) : null}
      </div>
      <div style={{ minWidth: 0 }}>
        <h3
          style={{
            margin: 0,
            fontSize: "20px",
            lineHeight: 1.2,
            color: "var(--color-foreground)",
            fontFamily: "var(--font-default)",
          }}
        >
          {title}
        </h3>
        <p
          style={{
            margin: "8px 0 0",
            fontSize: "15px",
            lineHeight: 1.45,
            color: "var(--color-muted-foreground)",
            fontFamily: "var(--font-default)",
          }}
        >
          {text}
        </p>
      </div>
    </article>
  );
};

const EventSettings = () => (
  <FieldStack>
    <TextField label="From (date text)" propKey="from" placeholder="2026-06-14" />
    <TextField label="To (optional)" propKey="to" placeholder="2026-06-16" />
    <TextField label="Title" propKey="title" />
    <TextAreaField label="Paragraph" propKey="text" rows={4} />
    <BackgroundField />
    <ColorField label="Border color" propKey="borderColor" />
    <ColorField label="Date panel background" propKey="dateBackground" />
    <ColorField label="Date panel color" propKey="dateColor" />
  </FieldStack>
);

Event.craft = {
  displayName: "Event",
  props: {
    from: "2026-06-14",
    to: "",
    title: "Event title",
    text: "Event description paragraph",
    background: "var(--color-surface)",
    borderColor: "var(--color-border)",
    dateBackground: "var(--color-muted)",
    dateColor: "var(--color-foreground)",
  },
  related: { settings: EventSettings },
};

