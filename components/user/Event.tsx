"use client";

import React from "react";
import { useNode } from "@craftjs/core";
import {
  TextAreaField,
  TextField,
  BooleanField,
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
  offerId?: string;
  price?: string;
  currency?: string;
  checkoutUrl?: string;
  ctaText?: string;
  showCta?: boolean;
  openInNewTab?: boolean;
  ctaBackground?: string;
  ctaColor?: string;
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
  offerId = "",
  price = "",
  currency = "$",
  checkoutUrl = "",
  ctaText = "Reserve Spot",
  showCta = true,
  openInNewTab = true,
  ctaBackground = "var(--color-primary)",
  ctaColor = "var(--color-primary-foreground)",
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
        <div
          style={{
            marginTop: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ minHeight: "18px" }}>
            {offerId.trim() ? (
              <code
                style={{
                  fontSize: "11px",
                  color: "var(--color-muted-foreground)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {offerId}
              </code>
            ) : null}
            {price.trim() ? (
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "var(--color-foreground)",
                  fontFamily: "var(--font-default)",
                }}
              >
                {currency}
                {price}
              </div>
            ) : null}
          </div>
          {showCta && checkoutUrl.trim() ? (
            <a
              href={checkoutUrl}
              target={openInNewTab ? "_blank" : undefined}
              rel={openInNewTab ? "noreferrer noopener" : undefined}
              style={{
                borderRadius: "9999px",
                border: `1px solid ${borderColor}`,
                background: ctaBackground,
                color: ctaColor,
                textDecoration: "none",
                padding: "7px 12px",
                fontSize: "12px",
                fontWeight: 600,
                fontFamily: "var(--font-default)",
                lineHeight: 1.2,
              }}
            >
              {(ctaText || "Reserve Spot").trim()}
            </a>
          ) : null}
        </div>
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
    <TextField label="Offer ID (optional)" propKey="offerId" />
    <TextField label="Price (optional)" propKey="price" />
    <TextField label="Currency" propKey="currency" />
    <TextField label="Checkout URL" propKey="checkoutUrl" />
    <TextField label="CTA text" propKey="ctaText" />
    <BooleanField label="Show CTA button" propKey="showCta" />
    <BooleanField label="Open CTA in new tab" propKey="openInNewTab" />
    <ColorField label="CTA background" propKey="ctaBackground" />
    <ColorField label="CTA text color" propKey="ctaColor" />
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
    offerId: "",
    price: "",
    currency: "$",
    checkoutUrl: "",
    ctaText: "Reserve Spot",
    showCta: true,
    openInNewTab: true,
    ctaBackground: "var(--color-primary)",
    ctaColor: "var(--color-primary-foreground)",
  },
  related: { settings: EventSettings },
};
