"use client";
import React from "react";
import { useNode } from "@craftjs/core";
import {
  TextField,
  SelectField,
  BooleanField,
  RemSliderField,
  ColorField,
  BackgroundField,
  FieldStack,
} from "@/components/editor/fields";

export type AssetOfferType = "asset" | "course" | "workshop" | "event" | "file-download";

export type AssetProps = {
  offerType?: AssetOfferType;
  offerId?: string;
  price?: string;
  currency?: string;
  checkoutUrl?: string;
  ctaText?: string;
  showCta?: boolean;
  openInNewTab?: boolean;
  ctaBackground?: string;
  ctaColor?: string;
  padding?: string;
  background?: string;
  borderRadius?: string;
  gap?: string;
  children?: React.ReactNode;
};

function offerTypeLabel(type: AssetOfferType): string {
  switch (type) {
    case "course":
      return "Course";
    case "workshop":
      return "Workshop";
    case "event":
      return "Event";
    case "file-download":
      return "File Download";
    case "asset":
    default:
      return "Asset";
  }
}

function defaultCta(type: AssetOfferType): string {
  return type === "file-download" ? "Download" : "Buy Now";
}

export const Asset = ({
  offerType = "asset",
  offerId = "",
  price = "49",
  currency = "$",
  checkoutUrl = "",
  ctaText = "",
  showCta = true,
  openInNewTab = true,
  ctaBackground = "var(--color-primary)",
  ctaColor = "var(--color-primary-foreground)",
  padding = "var(--space-md)",
  background = "var(--color-surface)",
  borderRadius = "var(--radius-lg)",
  gap = "var(--space-sm)",
  children,
}: AssetProps) => {
  const {
    connectors: { connect, drag },
  } = useNode();

  return (
    <article
      ref={(ref: HTMLElement | null) => {
        if (ref) connect(drag(ref));
      }}
      style={{
        padding,
        background,
        borderRadius,
        border: "1px solid var(--color-border)",
        display: "flex",
        flexDirection: "column",
        gap,
      }}
    >
      {children}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: "11px",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "var(--color-muted-foreground)",
                fontFamily: "var(--font-default)",
              }}
            >
              {offerTypeLabel(offerType)}
            </div>
            {offerId.trim() ? (
              <div
                style={{
                  marginTop: "3px",
                  fontSize: "11px",
                  color: "var(--color-muted-foreground)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {offerId}
              </div>
            ) : null}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              fontSize: "16px",
              fontWeight: 700,
              color: "#111827",
            }}
          >
            {currency}
            {price}
          </div>
        </div>
        {showCta && checkoutUrl.trim() ? (
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <a
              href={checkoutUrl}
              target={openInNewTab ? "_blank" : undefined}
              rel={openInNewTab ? "noreferrer noopener" : undefined}
              style={{
                borderRadius: "9999px",
                border: "1px solid var(--color-border)",
                background: ctaBackground,
                color: ctaColor,
                textDecoration: "none",
                padding: "8px 14px",
                fontSize: "12px",
                fontWeight: 600,
                fontFamily: "var(--font-default)",
                lineHeight: 1.2,
              }}
            >
              {(ctaText || defaultCta(offerType)).trim()}
            </a>
          </div>
        ) : null}
      </div>
    </article>
  );
};

const AssetSettings = () => (
  <FieldStack>
    <SelectField
      label="Offer type"
      propKey="offerType"
      options={["asset", "course", "workshop", "event", "file-download"] as const}
      parse={(value) =>
        value === "course" ||
        value === "workshop" ||
        value === "event" ||
        value === "file-download"
          ? value
          : "asset"
      }
    />
    <TextField label="Offer ID (optional)" propKey="offerId" />
    <TextField label="Price" propKey="price" />
    <TextField label="Currency" propKey="currency" />
    <TextField label="Checkout URL" propKey="checkoutUrl" />
    <TextField label="CTA text" propKey="ctaText" />
    <BooleanField label="Show CTA button" propKey="showCta" />
    <BooleanField label="Open CTA in new tab" propKey="openInNewTab" />
    <ColorField label="CTA background" propKey="ctaBackground" />
    <ColorField label="CTA text color" propKey="ctaColor" />
    <RemSliderField label="Padding" propKey="padding" min={0} max={10} step={0.25} fallback={1} />
    <RemSliderField label="Gap" propKey="gap" min={0} max={6} step={0.25} fallback={0.5} />
    <RemSliderField label="Border radius" propKey="borderRadius" min={0} max={4} step={0.125} fallback={0.75} />
    <BackgroundField />
  </FieldStack>
);

Asset.craft = {
  displayName: "Asset",
  props: {
    offerType: "asset",
    offerId: "",
    price: "49",
    currency: "$",
    checkoutUrl: "",
    ctaText: "",
    showCta: true,
    openInNewTab: true,
    ctaBackground: "var(--color-primary)",
    ctaColor: "var(--color-primary-foreground)",
    padding: "var(--space-md)",
    background: "var(--color-surface)",
    borderRadius: "var(--radius-lg)",
    gap: "var(--space-sm)",
  },
  related: { settings: AssetSettings },
  rules: {
    canMoveIn: (incoming: { data: { name: string } }[]) =>
      incoming.every(
        (n) =>
          n.data.name === "ImageBlock" ||
          n.data.name === "Audio" ||
          n.data.name === "Author"
      ),
  },
};
