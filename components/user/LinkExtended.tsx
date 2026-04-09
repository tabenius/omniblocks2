"use client";

import React from "react";
import { useNode } from "@craftjs/core";
import {
  TextField,
  SelectField,
  BooleanField,
  RemSliderField,
  UnitlessSliderField,
  BackgroundField,
  ColorField,
  FieldStack,
} from "@/components/editor/fields";

export type LinkExtendedMode = "auto" | "link" | "video" | "audio";
export type LinkExtendedAlign = "left" | "center" | "right";
export type LinkExtendedOfferType =
  | "none"
  | "asset"
  | "course"
  | "workshop"
  | "event"
  | "file-download";

export type LinkExtendedProps = {
  text?: string;
  href?: string;
  title?: string;
  mode?: LinkExtendedMode;
  offerType?: LinkExtendedOfferType;
  offerTitle?: string;
  offerSubtitle?: string;
  offerMeta?: string;
  offerPrice?: string;
  offerCtaText?: string;
  showOfferWidget?: boolean;
  widgetDelayMs?: string;
  showEmbed?: boolean;
  openInNewTab?: boolean;
  align?: LinkExtendedAlign;
  controls?: boolean;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  background?: string;
  color?: string;
  borderColor?: string;
  borderRadius?: string;
  padding?: string;
};

const VIDEO_URL_RE =
  /(?:youtube\.com|youtu\.be|vimeo\.com|\.mp4(?:$|\?)|\.webm(?:$|\?)|\.mov(?:$|\?)|\.m4v(?:$|\?))/i;
const AUDIO_URL_RE =
  /(?:\.mp3(?:$|\?)|\.wav(?:$|\?)|\.ogg(?:$|\?)|\.m4a(?:$|\?)|\.aac(?:$|\?)|\.flac(?:$|\?))/i;
const offerWidgetDelayCache = new Map<string, Promise<void>>();

function toEmbeddableVideoUrl(raw: string): string {
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

function resolveMode(mode: LinkExtendedMode, href: string): Exclude<LinkExtendedMode, "auto"> {
  if (mode !== "auto") return mode;
  const input = href.trim();
  if (!input) return "link";
  if (VIDEO_URL_RE.test(input)) return "video";
  if (AUDIO_URL_RE.test(input)) return "audio";
  return "link";
}

function normalizeWidgetDelay(value: string | undefined): number {
  const parsed = Number(String(value ?? "").trim());
  if (!Number.isFinite(parsed)) return 650;
  return Math.max(0, Math.min(3000, Math.round(parsed)));
}

function readWidgetDelayGate(key: string, delayMs: number): void {
  if (typeof window === "undefined") return;
  if (delayMs <= 0) return;
  const existing = offerWidgetDelayCache.get(key);
  if (existing) throw existing;

  const promise = new Promise<void>((resolve) => {
    window.setTimeout(() => {
      offerWidgetDelayCache.delete(key);
      resolve();
    }, delayMs);
  });
  offerWidgetDelayCache.set(key, promise);
  if (offerWidgetDelayCache.size > 120) offerWidgetDelayCache.clear();
  throw promise;
}

function offerTypeLabel(type: LinkExtendedOfferType): string {
  switch (type) {
    case "asset":
      return "Asset";
    case "course":
      return "Course";
    case "workshop":
      return "Workshop";
    case "event":
      return "Event";
    case "file-download":
      return "File Download";
    default:
      return "Linked Item";
  }
}

function defaultOfferCta(type: LinkExtendedOfferType): string {
  return type === "file-download" ? "Download" : "Buy Now";
}

function offerIcon(type: LinkExtendedOfferType): string {
  switch (type) {
    case "course":
      return "▦";
    case "workshop":
      return "◆";
    case "event":
      return "◷";
    case "file-download":
      return "⇩";
    case "asset":
    default:
      return "◈";
  }
}

const skeletonBlock = (
  width: string,
  height: string,
  borderRadius = "6px",
): React.CSSProperties => ({
  width,
  height,
  borderRadius,
  background:
    "linear-gradient(90deg, rgba(148, 163, 184, 0.18) 0%, rgba(148, 163, 184, 0.3) 50%, rgba(148, 163, 184, 0.18) 100%)",
});

const OfferWidgetSkeleton = ({
  offerType,
  borderColor,
}: {
  offerType: LinkExtendedOfferType;
  borderColor: string;
}) => {
  if (offerType === "event") {
    return (
      <div
        style={{
          border: `1px solid ${borderColor}`,
          borderRadius: "10px",
          background: "var(--color-muted)",
          padding: "12px",
          display: "grid",
          gridTemplateColumns: "72px minmax(0, 1fr)",
          gap: "12px",
        }}
      >
        <div style={{ ...skeletonBlock("72px", "86px", "10px") }} />
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ ...skeletonBlock("45%", "11px") }} />
          <div style={{ ...skeletonBlock("92%", "16px") }} />
          <div style={{ ...skeletonBlock("75%", "12px") }} />
          <div style={{ ...skeletonBlock("120px", "30px", "9999px"), marginTop: "6px" }} />
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        border: `1px solid ${borderColor}`,
        borderRadius: "10px",
        background: "var(--color-muted)",
        padding: "12px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <div style={{ ...skeletonBlock("26px", "26px", "9999px") }} />
        <div style={{ ...skeletonBlock("80px", "11px", "9999px") }} />
      </div>
      <div style={{ ...skeletonBlock("72%", "16px") }} />
      <div style={{ ...skeletonBlock("92%", "12px") }} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "4px" }}>
        <div style={{ ...skeletonBlock("66px", "18px") }} />
        <div style={{ ...skeletonBlock("110px", "30px", "9999px") }} />
      </div>
    </div>
  );
};

const OfferWidgetBody = ({
  offerType,
  offerTitle,
  offerSubtitle,
  offerMeta,
  offerPrice,
  offerCtaText,
  href,
  openInNewTab,
  borderColor,
}: {
  offerType: LinkExtendedOfferType;
  offerTitle: string;
  offerSubtitle: string;
  offerMeta: string;
  offerPrice: string;
  offerCtaText: string;
  href: string;
  openInNewTab: boolean;
  borderColor: string;
}) => {
  if (offerType === "event") {
    return (
      <a
        href={href}
        target={openInNewTab ? "_blank" : undefined}
        rel={openInNewTab ? "noreferrer noopener" : undefined}
        style={{
          border: `1px solid ${borderColor}`,
          borderRadius: "10px",
          background: "var(--color-muted)",
          padding: "12px",
          textDecoration: "none",
          display: "grid",
          gridTemplateColumns: "72px minmax(0, 1fr)",
          gap: "12px",
          color: "inherit",
        }}
      >
        <div
          style={{
            borderRadius: "10px",
            border: `1px solid ${borderColor}`,
            background: "var(--color-surface)",
            color: "var(--color-foreground)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-default)",
          }}
        >
          <div style={{ fontSize: "10px", textTransform: "uppercase", opacity: 0.8 }}>Event</div>
          <div style={{ fontSize: "26px", fontWeight: 800 }}>15</div>
          <div style={{ fontSize: "11px", opacity: 0.8 }}>JUN</div>
        </div>
        <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-muted-foreground)" }}>
            {offerTypeLabel(offerType)}
          </div>
          <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--color-foreground)" }}>{offerTitle}</div>
          {offerSubtitle ? (
            <div style={{ fontSize: "13px", color: "var(--color-muted-foreground)" }}>{offerSubtitle}</div>
          ) : null}
          <div style={{ marginTop: "4px", display: "inline-flex", alignSelf: "flex-start", borderRadius: "9999px", border: `1px solid ${borderColor}`, background: "var(--color-primary)", color: "var(--color-primary-foreground)", padding: "6px 12px", fontSize: "12px", fontWeight: 600 }}>
            {offerCtaText}
          </div>
        </div>
      </a>
    );
  }

  return (
    <a
      href={href}
      target={openInNewTab ? "_blank" : undefined}
      rel={openInNewTab ? "noreferrer noopener" : undefined}
      style={{
        border: `1px solid ${borderColor}`,
        borderRadius: "10px",
        background: "var(--color-muted)",
        padding: "12px",
        textDecoration: "none",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        color: "inherit",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span
          style={{
            width: "26px",
            height: "26px",
            borderRadius: "9999px",
            border: `1px solid ${borderColor}`,
            background: "var(--color-surface)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "13px",
          }}
        >
          {offerIcon(offerType)}
        </span>
        <span
          style={{
            fontSize: "11px",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: "var(--color-muted-foreground)",
          }}
        >
          {offerTypeLabel(offerType)}
        </span>
      </div>
      <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--color-foreground)" }}>{offerTitle}</div>
      {offerSubtitle ? (
        <div style={{ fontSize: "13px", color: "var(--color-muted-foreground)" }}>{offerSubtitle}</div>
      ) : null}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
        <div style={{ minHeight: "18px", color: "var(--color-foreground)", fontSize: "14px", fontWeight: 600 }}>
          {offerPrice || offerMeta || "\u00A0"}
        </div>
        <div
          style={{
            borderRadius: "9999px",
            border: `1px solid ${borderColor}`,
            background: "var(--color-primary)",
            color: "var(--color-primary-foreground)",
            padding: "6px 12px",
            fontSize: "12px",
            fontWeight: 600,
            whiteSpace: "nowrap",
          }}
        >
          {offerCtaText}
        </div>
      </div>
    </a>
  );
};

const OfferWidget = ({
  suspenseKey,
  widgetDelayMs,
  offerType,
  offerTitle,
  offerSubtitle,
  offerMeta,
  offerPrice,
  offerCtaText,
  href,
  openInNewTab,
  borderColor,
}: {
  suspenseKey: string;
  widgetDelayMs: string;
  offerType: LinkExtendedOfferType;
  offerTitle: string;
  offerSubtitle: string;
  offerMeta: string;
  offerPrice: string;
  offerCtaText: string;
  href: string;
  openInNewTab: boolean;
  borderColor: string;
}) => {
  readWidgetDelayGate(suspenseKey, normalizeWidgetDelay(widgetDelayMs));
  return (
    <OfferWidgetBody
      offerType={offerType}
      offerTitle={offerTitle}
      offerSubtitle={offerSubtitle}
      offerMeta={offerMeta}
      offerPrice={offerPrice}
      offerCtaText={offerCtaText}
      href={href}
      openInNewTab={openInNewTab}
      borderColor={borderColor}
    />
  );
};

export const LinkExtended = ({
  text = "Open link",
  href = "https://example.com",
  title = "Embedded media",
  mode = "auto",
  offerType = "none",
  offerTitle = "Linked offer",
  offerSubtitle = "Describe what the buyer gets.",
  offerMeta = "",
  offerPrice = "$49",
  offerCtaText = "",
  showOfferWidget = false,
  widgetDelayMs = "650",
  showEmbed = true,
  openInNewTab = true,
  align = "left",
  controls = true,
  autoPlay = false,
  loop = false,
  muted = false,
  background = "var(--color-surface)",
  color = "var(--color-primary)",
  borderColor = "var(--color-border)",
  borderRadius = "var(--radius-md)",
  padding = "var(--space-md)",
}: LinkExtendedProps) => {
  const {
    connectors: { connect, drag },
  } = useNode();

  const hrefValue = href.trim();
  const resolvedMode = resolveMode(mode, hrefValue);
  const justifyContent =
    align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start";
  const embedSrc = resolvedMode === "video" ? toEmbeddableVideoUrl(hrefValue) : "";
  const isVideoIframe =
    resolvedMode === "video" &&
    /youtube\.com\/embed|player\.vimeo\.com\/video/.test(embedSrc);
  const anchorLabel = resolvedMode === "video" ? "Play video" : resolvedMode === "audio" ? "Play audio" : text;
  const showOffer = showOfferWidget && offerType !== "none" && resolvedMode === "link" && Boolean(hrefValue);
  const offerCtaLabel = offerCtaText.trim() || defaultOfferCta(offerType);
  const suspenseKey = [
    hrefValue,
    offerType,
    offerTitle,
    offerSubtitle,
    offerMeta,
    offerPrice,
    offerCtaLabel,
    widgetDelayMs,
  ].join("|");

  return (
    <div
      ref={(ref: HTMLDivElement | null) => {
        if (ref) connect(drag(ref));
      }}
      style={{
        background,
        border: `1px solid ${borderColor}`,
        borderRadius,
        padding,
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      <div style={{ display: "flex", justifyContent }}>
        {hrefValue ? (
          <a
            href={hrefValue}
            target={openInNewTab ? "_blank" : undefined}
            rel={openInNewTab ? "noreferrer noopener" : undefined}
            style={{
              color,
              textDecoration: "none",
              fontWeight: 600,
              fontSize: "14px",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "24px",
                height: "24px",
                borderRadius: "9999px",
                border: `1px solid ${borderColor}`,
                background: "var(--color-muted)",
              }}
            >
              {resolvedMode === "video" ? "▶" : resolvedMode === "audio" ? "♪" : "↗"}
            </span>
            <span>{anchorLabel}</span>
          </a>
        ) : (
          <span style={{ color: "var(--color-muted-foreground)", fontSize: "13px" }}>
            Add a URL in LinkExtended settings.
          </span>
        )}
      </div>

      {showEmbed && hrefValue && resolvedMode === "video" ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          {title ? (
            <div
              style={{
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "var(--color-muted-foreground)",
                fontFamily: "var(--font-default)",
              }}
            >
              {title}
            </div>
          ) : null}
          <div
            style={{
              position: "relative",
              width: "100%",
              paddingTop: "56.25%",
              borderRadius: "10px",
              overflow: "hidden",
              border: `1px solid ${borderColor}`,
              background: "#000",
            }}
          >
            {isVideoIframe ? (
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
                  border: 0,
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
      ) : null}

      {showEmbed && hrefValue && resolvedMode === "audio" ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            background: "var(--color-muted)",
            border: `1px solid ${borderColor}`,
            borderRadius: "10px",
            padding: "12px",
          }}
        >
          {title ? (
            <div
              style={{
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "var(--color-muted-foreground)",
                fontFamily: "var(--font-default)",
              }}
            >
              {title}
            </div>
          ) : null}
          <audio
            src={hrefValue}
            controls={controls}
            autoPlay={autoPlay}
            loop={loop}
            style={{ width: "100%" }}
          />
        </div>
      ) : null}

      {showOffer ? (
        <React.Suspense
          fallback={<OfferWidgetSkeleton offerType={offerType} borderColor={borderColor} />}
        >
          <OfferWidget
            suspenseKey={suspenseKey}
            widgetDelayMs={widgetDelayMs}
            offerType={offerType}
            offerTitle={offerTitle}
            offerSubtitle={offerSubtitle}
            offerMeta={offerMeta}
            offerPrice={offerPrice}
            offerCtaText={offerCtaLabel}
            href={hrefValue}
            openInNewTab={openInNewTab}
            borderColor={borderColor}
          />
        </React.Suspense>
      ) : null}
    </div>
  );
};

const LinkExtendedSettings = () => (
  <FieldStack>
    <TextField label="Link text" propKey="text" />
    <TextField label="URL" propKey="href" />
    <TextField label="Embed title" propKey="title" />
    <SelectField
      label="Mode"
      propKey="mode"
      options={["auto", "link", "video", "audio"] as const}
      parse={(value) =>
        value === "video" || value === "audio" || value === "link" ? value : "auto"
      }
    />
    <SelectField
      label="Align"
      propKey="align"
      options={["left", "center", "right"] as const}
      parse={(value) => (value === "center" ? "center" : value === "right" ? "right" : "left")}
    />
    <SelectField
      label="Linked item type"
      propKey="offerType"
      options={["none", "asset", "course", "workshop", "event", "file-download"] as const}
      parse={(value) =>
        value === "asset" ||
        value === "course" ||
        value === "workshop" ||
        value === "event" ||
        value === "file-download"
          ? value
          : "none"
      }
    />
    <BooleanField label="Render offer widget" propKey="showOfferWidget" />
    <TextField label="Offer title" propKey="offerTitle" />
    <TextField label="Offer subtitle" propKey="offerSubtitle" />
    <TextField label="Offer meta (optional)" propKey="offerMeta" />
    <TextField label="Offer price" propKey="offerPrice" />
    <TextField label="CTA text" propKey="offerCtaText" />
    <UnitlessSliderField
      label="Widget suspense delay (ms)"
      propKey="widgetDelayMs"
      min={0}
      max={3000}
      step={50}
      fallback={650}
    />
    <BooleanField label="Show embed preview" propKey="showEmbed" />
    <BooleanField label="Open in new tab" propKey="openInNewTab" />
    <BooleanField label="Media controls" propKey="controls" />
    <BooleanField label="Autoplay media" propKey="autoPlay" />
    <BooleanField label="Loop media" propKey="loop" />
    <BooleanField label="Mute video" propKey="muted" />
    <RemSliderField label="Padding" propKey="padding" min={0} max={8} step={0.25} fallback={1} />
    <RemSliderField
      label="Border radius"
      propKey="borderRadius"
      min={0}
      max={4}
      step={0.125}
      fallback={0.5}
    />
    <BackgroundField />
    <ColorField label="Link color" propKey="color" />
    <ColorField label="Border color" propKey="borderColor" />
  </FieldStack>
);

LinkExtended.craft = {
  displayName: "LinkExtended",
  props: {
    text: "Open link",
    href: "https://example.com",
    title: "Embedded media",
    mode: "auto",
    offerType: "none",
    offerTitle: "Linked offer",
    offerSubtitle: "Describe what the buyer gets.",
    offerMeta: "",
    offerPrice: "$49",
    offerCtaText: "",
    showOfferWidget: false,
    widgetDelayMs: "650",
    showEmbed: true,
    openInNewTab: true,
    align: "left",
    controls: true,
    autoPlay: false,
    loop: false,
    muted: false,
    background: "var(--color-surface)",
    color: "var(--color-primary)",
    borderColor: "var(--color-border)",
    borderRadius: "var(--radius-md)",
    padding: "var(--space-md)",
  },
  related: { settings: LinkExtendedSettings },
};
