import type { SerializedNode, SerializedNodes } from "@craftjs/core";
import { isRecord } from "./typeGuards";

type HtmlExportOptions = {
  title?: string;
  themeVariables?: Record<string, string>;
};
type OfferType = "none" | "asset" | "course" | "workshop" | "event" | "file-download";

const HEADING_SIZES: Record<number, string> = {
  1: "36px",
  2: "30px",
  3: "24px",
  4: "20px",
  5: "18px",
  6: "16px",
};

const DEFAULT_THEME_VARIABLES: Record<string, string> = {
  "--font-default":
    'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
  "--font-alternate": 'Georgia, "Times New Roman", "Playfair Display", serif',
  "--font-mono": "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  "--space-xs": "4px",
  "--space-sm": "8px",
  "--space-md": "16px",
  "--space-lg": "24px",
  "--space-xl": "32px",
  "--space-2xl": "48px",
  "--space-3xl": "64px",
  "--space-4xl": "96px",
  "--radius-sm": "4px",
  "--radius-md": "8px",
  "--radius-lg": "12px",
  "--radius-xl": "16px",
  "--radius-2xl": "24px",
  "--radius-full": "9999px",
  "--text-xs": "12px",
  "--text-sm": "14px",
  "--text-base": "16px",
  "--text-lg": "18px",
  "--text-xl": "20px",
  "--text-2xl": "24px",
  "--text-3xl": "30px",
  "--text-4xl": "36px",
  "--text-5xl": "48px",
  "--color-background": "#fefdf7",
  "--color-foreground": "#2d1b69",
  "--color-surface": "#ffffff",
  "--color-surface-foreground": "#2d1b69",
  "--color-muted": "#f3f0ff",
  "--color-muted-foreground": "#6e4aad",
  "--color-border": "#ddd6fe",
  "--color-primary": "#7c3aed",
  "--color-primary-foreground": "#ffffff",
  "--color-secondary": "#fef9c3",
  "--color-secondary-foreground": "#713f12",
  "--color-accent": "#f59e0b",
  "--color-accent-foreground": "#1c1917",
  "--color-success": "#16a34a",
  "--color-warning": "#d97706",
  "--color-danger": "#dc2626",
};
const LINK_EXT_VIDEO_URL_RE =
  /(?:youtube\.com|youtu\.be|vimeo\.com|\.mp4(?:$|\?)|\.webm(?:$|\?)|\.mov(?:$|\?)|\.m4v(?:$|\?))/i;
const LINK_EXT_AUDIO_URL_RE =
  /(?:\.mp3(?:$|\?)|\.wav(?:$|\?)|\.ogg(?:$|\?)|\.m4a(?:$|\?)|\.aac(?:$|\?)|\.flac(?:$|\?))/i;

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asBoolean(value: unknown, fallback: boolean): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true") return true;
    if (normalized === "false") return false;
  }
  return fallback;
}

function clampInt(value: unknown, min: number, max: number, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  const rounded = Math.round(parsed);
  if (rounded < min) return min;
  if (rounded > max) return max;
  return rounded;
}

function normalizeName(input: string): string {
  if (input === "Image") return "ImageBlock";
  if (input === "Text") return "TextBlock";
  return input;
}

function getNodeName(node: SerializedNode): string {
  const displayName = typeof node.displayName === "string" ? node.displayName : "";
  const type = node.type;
  const resolvedName =
    typeof type === "string"
      ? type
      : isRecord(type) && typeof type.resolvedName === "string"
        ? type.resolvedName
        : "";
  return normalizeName(displayName || resolvedName);
}

function styleValue(style: Record<string, string>): string {
  return Object.entries(style)
    .filter(([, val]) => val.trim().length > 0)
    .map(([key, val]) => `${camelToKebab(key)}:${val}`)
    .join(";");
}

function camelToKebab(input: string): string {
  return input.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
}

function escapeHtml(input: string): string {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function toDomIdFragment(input: string): string {
  const cleaned = input.replace(/[^a-zA-Z0-9_-]/g, "");
  return cleaned.length > 0 ? cleaned : "contact";
}

function sanitizeThemeVariables(input?: Record<string, string>): Record<string, string> {
  if (!input) return { ...DEFAULT_THEME_VARIABLES };
  const merged = { ...DEFAULT_THEME_VARIABLES };
  for (const [key, value] of Object.entries(input)) {
    if (/^--[a-z0-9-]+$/.test(key) && typeof value === "string" && value.trim().length > 0) {
      merged[key] = value.trim();
    }
  }
  return merged;
}

function getChildrenIds(node: SerializedNode): string[] {
  const linked = isRecord(node.linkedNodes) ? Object.values(node.linkedNodes) : [];
  const children = Array.isArray(node.nodes) ? node.nodes : [];
  return [...linked, ...children].filter((item): item is string => {
    return typeof item === "string" && item.trim().length > 0;
  });
}

function renderAttributes(attributes: Record<string, string | undefined>): string {
  const parts = Object.entries(attributes).flatMap(([key, value]) => {
    if (typeof value !== "string" || value.length === 0) return [];
    return [` ${key}="${escapeHtml(value)}"`];
  });
  return parts.join("");
}

function wrap(tag: string, attributes: Record<string, string | undefined>, children: string): string {
  return `<${tag}${renderAttributes(attributes)}>${children}</${tag}>`;
}

function renderAudio(
  src: string,
  controls: boolean,
  autoPlay: boolean,
  loop: boolean,
): string {
  const attrs = [
    `src="${escapeHtml(src)}"`,
    `style="${escapeHtml("width:100%")}"`,
    controls ? "controls" : "",
    autoPlay ? "autoplay" : "",
    loop ? "loop" : "",
  ]
    .filter(Boolean)
    .join(" ");
  return `<audio ${attrs}></audio>`;
}

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

function resolveLinkExtendedMode(
  mode: "auto" | "link" | "video" | "audio",
  href: string,
): "link" | "video" | "audio" {
  if (mode !== "auto") return mode;
  const input = href.trim();
  if (!input) return "link";
  if (LINK_EXT_VIDEO_URL_RE.test(input)) return "video";
  if (LINK_EXT_AUDIO_URL_RE.test(input)) return "audio";
  return "link";
}

function asOfferType(value: unknown): OfferType {
  const candidate = asString(value, "none");
  if (
    candidate === "asset" ||
    candidate === "course" ||
    candidate === "workshop" ||
    candidate === "event" ||
    candidate === "file-download"
  ) {
    return candidate;
  }
  return "none";
}

function defaultOfferCta(type: OfferType): string {
  return type === "file-download" ? "Download" : "Buy Now";
}

function offerTypeLabel(type: OfferType): string {
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

function offerIcon(type: OfferType): string {
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

function renderLinkExtendedWidget(
  href: string,
  openInNewTab: boolean,
  borderColor: string,
  offerType: OfferType,
  offerTitle: string,
  offerSubtitle: string,
  offerMeta: string,
  offerPrice: string,
  offerCtaText: string,
): string {
  const actionLabel = offerCtaText.trim() || defaultOfferCta(offerType);
  if (offerType === "event") {
    return wrap(
      "a",
      {
        href,
        target: openInNewTab ? "_blank" : undefined,
        rel: openInNewTab ? "noreferrer noopener" : undefined,
        style: styleValue({
          border: `1px solid ${borderColor}`,
          borderRadius: "10px",
          background: "var(--color-muted)",
          padding: "12px",
          textDecoration: "none",
          display: "grid",
          gridTemplateColumns: "72px minmax(0, 1fr)",
          gap: "12px",
          color: "inherit",
        }),
      },
      `${wrap(
        "div",
        {
          style: styleValue({
            borderRadius: "10px",
            border: `1px solid ${borderColor}`,
            background: "var(--color-surface)",
            color: "var(--color-foreground)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-default)",
          }),
        },
        `${wrap(
          "div",
          {
            style: styleValue({
              fontSize: "10px",
              textTransform: "uppercase",
              opacity: "0.8",
            }),
          },
          "Event",
        )}${wrap("div", { style: styleValue({ fontSize: "26px", fontWeight: "800" }) }, "15")}${wrap(
          "div",
          { style: styleValue({ fontSize: "11px", opacity: "0.8" }) },
          "JUN",
        )}`,
      )}${wrap(
        "div",
        {
          style: styleValue({
            minWidth: "0",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          }),
        },
        `${wrap(
          "div",
          {
            style: styleValue({
              fontSize: "11px",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "var(--color-muted-foreground)",
            }),
          },
          offerTypeLabel(offerType),
        )}${wrap(
          "div",
          { style: styleValue({ fontSize: "16px", fontWeight: "700", color: "var(--color-foreground)" }) },
          escapeHtml(offerTitle),
        )}${
          offerSubtitle.trim()
            ? wrap(
                "div",
                { style: styleValue({ fontSize: "13px", color: "var(--color-muted-foreground)" }) },
                escapeHtml(offerSubtitle),
              )
            : ""
        }${wrap(
          "div",
          {
            style: styleValue({
              marginTop: "4px",
              display: "inline-flex",
              alignSelf: "flex-start",
              borderRadius: "9999px",
              border: `1px solid ${borderColor}`,
              background: "var(--color-primary)",
              color: "var(--color-primary-foreground)",
              padding: "6px 12px",
              fontSize: "12px",
              fontWeight: "600",
            }),
          },
          escapeHtml(actionLabel),
        )}`,
      )}`,
    );
  }

  return wrap(
    "a",
    {
      href,
      target: openInNewTab ? "_blank" : undefined,
      rel: openInNewTab ? "noreferrer noopener" : undefined,
      style: styleValue({
        border: `1px solid ${borderColor}`,
        borderRadius: "10px",
        background: "var(--color-muted)",
        padding: "12px",
        textDecoration: "none",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        color: "inherit",
      }),
    },
    `${wrap(
      "div",
      { style: styleValue({ display: "flex", alignItems: "center", gap: "8px" }) },
      `${wrap(
        "span",
        {
          style: styleValue({
            width: "26px",
            height: "26px",
            borderRadius: "9999px",
            border: `1px solid ${borderColor}`,
            background: "var(--color-surface)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "13px",
          }),
        },
        offerIcon(offerType),
      )}${wrap(
        "span",
        {
          style: styleValue({
            fontSize: "11px",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: "var(--color-muted-foreground)",
          }),
        },
        offerTypeLabel(offerType),
      )}`,
    )}${wrap(
      "div",
      { style: styleValue({ fontSize: "16px", fontWeight: "700", color: "var(--color-foreground)" }) },
      escapeHtml(offerTitle),
    )}${
      offerSubtitle.trim()
        ? wrap(
            "div",
            { style: styleValue({ fontSize: "13px", color: "var(--color-muted-foreground)" }) },
            escapeHtml(offerSubtitle),
          )
        : ""
    }${wrap(
      "div",
      {
        style: styleValue({
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "10px",
        }),
      },
      `${wrap(
        "div",
        {
          style: styleValue({
            minHeight: "18px",
            color: "var(--color-foreground)",
            fontSize: "14px",
            fontWeight: "600",
          }),
        },
        escapeHtml(offerPrice || offerMeta || "\u00A0"),
      )}${wrap(
        "div",
        {
          style: styleValue({
            borderRadius: "9999px",
            border: `1px solid ${borderColor}`,
            background: "var(--color-primary)",
            color: "var(--color-primary-foreground)",
            padding: "6px 12px",
            fontSize: "12px",
            fontWeight: "600",
            whiteSpace: "nowrap",
          }),
        },
        escapeHtml(actionLabel),
      )}`,
    )}`,
  );
}

function renderNode(
  nodes: SerializedNodes,
  id: string,
  visited: Set<string>,
): string {
  const node = nodes[id];
  if (!node) return "";
  if (visited.has(id)) return "";
  visited.add(id);

  const name = getNodeName(node);
  const props = isRecord(node.props) ? node.props : {};
  const childrenIds = getChildrenIds(node);
  const children = childrenIds.map((childId) => renderNode(nodes, childId, visited));
  const joinedChildren = children.join("");

  switch (name) {
    case "ROOT":
      return joinedChildren;
    case "Container":
      return wrap(
        "section",
        {
          style: styleValue({
            background: asString(props.background, "transparent"),
            padding: asString(props.padding, "16px"),
            minHeight: "40px",
          }),
        },
        joinedChildren,
      );
    case "Heading": {
      const level = clampInt(props.level, 1, 6, 1);
      const tag = `h${level}`;
      return wrap(
        tag,
        {
          style: styleValue({
            fontSize: HEADING_SIZES[level],
            fontWeight: "700",
            color: asString(props.color, "var(--color-foreground)"),
            textAlign: asString(props.textAlign, "left"),
            background: "transparent",
            margin: "0",
          }),
        },
        escapeHtml(asString(props.text, "Heading")),
      );
    }
    case "Paragraph":
      return wrap(
        "p",
        {
          style: styleValue({
            fontSize: asString(props.fontSize, "var(--text-base)"),
            color: asString(props.color, "var(--color-muted-foreground)"),
            textAlign: asString(props.textAlign, "left"),
            margin: "0",
          }),
        },
        escapeHtml(asString(props.text, "Paragraph")),
      );
    case "AlterParagraph":
      return wrap(
        "p",
        {
          style: styleValue({
            fontSize: asString(props.fontSize, "var(--text-base)"),
            fontFamily: asString(props.fontFamily, "var(--font-alternate)"),
            color: asString(props.color, "var(--color-foreground)"),
            textAlign: asString(props.textAlign, "left"),
            fontStyle: asString(props.fontStyle, "italic"),
            margin: "0",
          }),
        },
        escapeHtml(asString(props.text, "Paragraph")),
      );
    case "Form":
      return wrap(
        "form",
        {
          action: asString(props.action, "").trim() || undefined,
          method: asString(props.method, "POST").toLowerCase(),
          style: styleValue({
            background: asString(props.background, "var(--color-surface)"),
            padding: asString(props.padding, "var(--space-md)"),
            borderRadius: asString(props.borderRadius, "var(--radius-md)"),
            border: `1px solid ${asString(props.borderColor, "var(--color-border)")}`,
            display: "flex",
            flexDirection: "column",
            gap: asString(props.gap, "var(--space-sm)"),
          }),
        },
        joinedChildren,
      );
    case "ContactForm": {
      const modalId = `contact-modal-${toDomIdFragment(id)}`;
      const titleId = `${modalId}-title`;
      const descriptionId = `${modalId}-description`;
      const action = asString(props.action, "/api/contact").trim() || "/api/contact";
      const triggerText = asString(props.triggerText, "Contact");
      const title = asString(props.title, "Get in touch");
      const description = asString(
        props.description,
        "Send a short note and we will get back to you.",
      );
      const submitText = asString(props.submitText, "Send");
      const cancelText = asString(props.cancelText, "Cancel");
      const nameLabel = asString(props.nameLabel, "Name");
      const namePlaceholder = asString(props.namePlaceholder, "Your name");
      const emailLabel = asString(props.emailLabel, "Email");
      const emailPlaceholder = asString(props.emailPlaceholder, "you@example.com");
      const lockedEmailHint = asString(
        props.lockedEmailHint,
        "Email is locked to your logged-in account.",
      );
      const messageLabel = asString(props.messageLabel, "Notes");
      const messagePlaceholder = asString(
        props.messagePlaceholder,
        "Tell us what you need help with",
      );
      const buttonBorderRadius = asString(props.buttonBorderRadius, "var(--radius-md)");
      const buttonBorderColor = asString(props.buttonBorderColor, "var(--color-primary)");
      const buttonBackground = asString(props.buttonBackground, "var(--color-primary)");
      const buttonColor = asString(props.buttonColor, "var(--color-primary-foreground)");
      const buttonPaddingX = asString(props.buttonPaddingX, "var(--space-md)");
      const buttonPaddingY = asString(props.buttonPaddingY, "var(--space-sm)");
      const overlayBackground = asString(props.overlayBackground, "rgba(2, 6, 23, 0.56)");
      const modalBackground = asString(props.modalBackground, "var(--color-surface)");
      const modalBorderColor = asString(props.modalBorderColor, "var(--color-border)");
      const modalBorderRadius = asString(props.modalBorderRadius, "var(--radius-lg)");
      const fieldBackground = asString(props.fieldBackground, "var(--color-background)");
      const fieldColor = asString(props.fieldColor, "var(--color-foreground)");
      const fieldBorderColor = asString(props.fieldBorderColor, "var(--color-border)");
      const fieldBorderRadius = asString(props.fieldBorderRadius, "var(--radius-sm)");
      const fieldPadding = asString(props.fieldPadding, "var(--space-sm)");

      const fieldBaseStyle = styleValue({
        width: "100%",
        padding: fieldPadding,
        border: `1px solid ${fieldBorderColor}`,
        borderRadius: fieldBorderRadius,
        background: fieldBackground,
        color: fieldColor,
        fontFamily: "var(--font-default)",
        fontSize: "var(--text-sm)",
      });

      return wrap(
        "div",
        {
          style: styleValue({
            display: "inline-flex",
            flexDirection: "column",
            gap: "8px",
          }),
        },
        `${wrap(
          "button",
          {
            type: "button",
            "data-contact-open": modalId,
            style: styleValue({
              border: `1px solid ${buttonBorderColor}`,
              borderRadius: buttonBorderRadius,
              background: buttonBackground,
              color: buttonColor,
              padding: `${buttonPaddingY} ${buttonPaddingX}`,
              fontFamily: "var(--font-default)",
              fontSize: "var(--text-sm)",
              fontWeight: "600",
              cursor: "pointer",
            }),
          },
          escapeHtml(triggerText),
        )}<div${renderAttributes({
          id: modalId,
          hidden: "hidden",
          "data-contact-modal": "true",
          style: styleValue({
            position: "fixed",
            inset: "0",
            zIndex: "1200",
            background: overlayBackground,
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }),
        })}><div${renderAttributes({
          role: "dialog",
          "aria-modal": "true",
          "aria-labelledby": titleId,
          "aria-describedby": descriptionId,
          style: styleValue({
            width: "min(100%, 540px)",
            maxHeight: "min(90vh, 760px)",
            overflowY: "auto",
            border: `1px solid ${modalBorderColor}`,
            borderRadius: modalBorderRadius,
            background: modalBackground,
            padding: "20px",
            boxShadow: "0 24px 48px -26px rgba(15, 23, 42, 0.65)",
            fontFamily: "var(--font-default)",
          }),
        })}>${wrap(
          "div",
          {
            style: styleValue({
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "12px",
            }),
          },
          `${wrap(
            "div",
            { style: styleValue({ minWidth: "0" }) },
            `${wrap(
              "h2",
              {
                id: titleId,
                style: styleValue({
                  margin: "0",
                  fontSize: "var(--text-xl)",
                  fontWeight: "700",
                  color: "var(--color-foreground)",
                  lineHeight: "1.2",
                }),
              },
              escapeHtml(title),
            )}${wrap(
              "p",
              {
                id: descriptionId,
                style: styleValue({
                  margin: "8px 0 0 0",
                  color: "var(--color-muted-foreground)",
                  fontSize: "var(--text-sm)",
                  lineHeight: "1.5",
                }),
              },
              escapeHtml(description),
            )}`,
          )}${wrap(
            "button",
            {
              type: "button",
              "data-contact-close": modalId,
              "aria-label": "Close contact form",
              style: styleValue({
                border: `1px solid ${modalBorderColor}`,
                borderRadius: "9999px",
                width: "28px",
                height: "28px",
                background: "var(--color-surface)",
                color: "var(--color-muted-foreground)",
                cursor: "pointer",
                fontSize: "16px",
                lineHeight: "1",
              }),
            },
            "×",
          )}`,
        )}${wrap(
          "form",
          {
            action,
            method: "post",
            "data-contact-form": "true",
            style: styleValue({
              marginTop: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }),
          },
          `${wrap(
            "label",
            {
              style: styleValue({
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }),
            },
            `${wrap(
              "span",
              {
                style: styleValue({
                  fontSize: "12px",
                  color: "var(--color-muted-foreground)",
                }),
              },
              escapeHtml(nameLabel),
            )}<input${renderAttributes({
              type: "text",
              name: "name",
              placeholder: namePlaceholder,
              required: "required",
              style: fieldBaseStyle,
            })}>`,
          )}${wrap(
            "label",
            {
              style: styleValue({
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }),
            },
            `${wrap(
              "span",
              {
                style: styleValue({
                  fontSize: "12px",
                  color: "var(--color-muted-foreground)",
                }),
              },
              escapeHtml(emailLabel),
            )}<input${renderAttributes({
              type: "email",
              name: "email",
              placeholder: emailPlaceholder,
              required: "required",
              "data-contact-email-input": "true",
              style: fieldBaseStyle,
            })}>${wrap(
              "span",
              {
                hidden: "hidden",
                "data-contact-email-lock-note": "true",
                style: styleValue({
                  fontSize: "11px",
                  color: "var(--color-muted-foreground)",
                }),
              },
              escapeHtml(lockedEmailHint),
            )}`,
          )}${wrap(
            "label",
            {
              style: styleValue({
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }),
            },
            `${wrap(
              "span",
              {
                style: styleValue({
                  fontSize: "12px",
                  color: "var(--color-muted-foreground)",
                }),
              },
              escapeHtml(messageLabel),
            )}${wrap(
              "textarea",
              {
                name: "message",
                rows: "6",
                placeholder: messagePlaceholder,
                required: "required",
                style: styleValue({
                  ...Object.fromEntries(
                    fieldBaseStyle
                      .split(";")
                      .filter((entry) => entry.includes(":"))
                      .map((entry) => {
                        const [key, ...rest] = entry.split(":");
                        return [key.trim(), rest.join(":").trim()];
                      }),
                  ),
                  resize: "vertical",
                }),
              },
              "",
            )}`,
          )}${wrap(
            "div",
            {
              hidden: "hidden",
              "data-contact-status": "true",
              style: styleValue({
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-sm)",
                padding: "8px 10px",
                fontSize: "12px",
                lineHeight: "1.4",
              }),
            },
            "",
          )}${wrap(
            "div",
            {
              style: styleValue({
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
              }),
            },
            `${wrap(
              "button",
              {
                type: "button",
                "data-contact-close": modalId,
                style: styleValue({
                  border: `1px solid ${modalBorderColor}`,
                  borderRadius: "var(--radius-sm)",
                  background: "var(--color-surface)",
                  color: "var(--color-foreground)",
                  padding: "8px 12px",
                  fontFamily: "var(--font-default)",
                  fontSize: "var(--text-sm)",
                  cursor: "pointer",
                }),
              },
              escapeHtml(cancelText),
            )}${wrap(
              "button",
              {
                type: "submit",
                "data-contact-submit": "true",
                "data-submit-text": submitText,
                "data-sending-text": "Sending...",
                style: styleValue({
                  border: `1px solid ${buttonBorderColor}`,
                  borderRadius: "var(--radius-sm)",
                  background: buttonBackground,
                  color: buttonColor,
                  padding: "8px 12px",
                  fontFamily: "var(--font-default)",
                  fontSize: "var(--text-sm)",
                  fontWeight: "600",
                  cursor: "pointer",
                }),
              },
              escapeHtml(submitText),
            )}`,
          )}`,
        )}</div></div>`,
      );
    }
    case "Name":
      return wrap(
        "label",
        {
          style: styleValue({
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            width: "100%",
            fontFamily: "var(--font-default)",
          }),
        },
        `${wrap(
          "span",
          { style: styleValue({ fontSize: "12px", color: "var(--color-muted-foreground)" }) },
          escapeHtml(
            `${asString(props.label, "Name")}${asBoolean(props.required, true) ? " *" : ""}`,
          ),
        )}<input${renderAttributes({
          type: "text",
          name: "name",
          placeholder: asString(props.placeholder, "Your name"),
          required: asBoolean(props.required, true) ? "required" : undefined,
          style: styleValue({
            width: "100%",
            padding: asString(props.padding, "var(--space-sm)"),
            border: `1px solid ${asString(props.borderColor, "var(--color-border)")}`,
            borderRadius: asString(props.borderRadius, "var(--radius-sm)"),
            background: asString(props.background, "var(--color-background)"),
            color: asString(props.color, "var(--color-foreground)"),
            fontFamily: "var(--font-default)",
            fontSize: "var(--text-sm)",
          }),
        })}>`,
      );
    case "Email":
      return wrap(
        "label",
        {
          style: styleValue({
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            width: "100%",
            fontFamily: "var(--font-default)",
          }),
        },
        `${wrap(
          "span",
          { style: styleValue({ fontSize: "12px", color: "var(--color-muted-foreground)" }) },
          escapeHtml(
            `${asString(props.label, "Email")}${asBoolean(props.required, true) ? " *" : ""}`,
          ),
        )}<input${renderAttributes({
          type: "email",
          name: "email",
          placeholder: asString(props.placeholder, "you@example.com"),
          required: asBoolean(props.required, true) ? "required" : undefined,
          style: styleValue({
            width: "100%",
            padding: asString(props.padding, "var(--space-sm)"),
            border: `1px solid ${asString(props.borderColor, "var(--color-border)")}`,
            borderRadius: asString(props.borderRadius, "var(--radius-sm)"),
            background: asString(props.background, "var(--color-background)"),
            color: asString(props.color, "var(--color-foreground)"),
            fontFamily: "var(--font-default)",
            fontSize: "var(--text-sm)",
          }),
        })}>`,
      );
    case "Textarea":
      return wrap(
        "label",
        {
          style: styleValue({
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            width: "100%",
            fontFamily: "var(--font-default)",
          }),
        },
        `${wrap(
          "span",
          { style: styleValue({ fontSize: "12px", color: "var(--color-muted-foreground)" }) },
          escapeHtml(
            `${asString(props.label, "Message")}${asBoolean(props.required, false) ? " *" : ""}`,
          ),
        )}${wrap(
          "textarea",
          {
            name: "message",
            rows: String(clampInt(props.rows, 2, 20, 5)),
            placeholder: asString(props.placeholder, "Write your message"),
            required: asBoolean(props.required, false) ? "required" : undefined,
            style: styleValue({
              width: "100%",
              padding: asString(props.padding, "var(--space-sm)"),
              border: `1px solid ${asString(props.borderColor, "var(--color-border)")}`,
              borderRadius: asString(props.borderRadius, "var(--radius-sm)"),
              background: asString(props.background, "var(--color-background)"),
              color: asString(props.color, "var(--color-foreground)"),
              fontFamily: "var(--font-default)",
              fontSize: "var(--text-sm)",
              resize: "vertical",
            }),
          },
          "",
        )}`,
      );
    case "Button": {
      const align = asString(props.align, "left");
      const justifyContent =
        align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start";
      return wrap(
        "div",
        {
          style: styleValue({
            width: "100%",
            display: "flex",
            justifyContent,
          }),
        },
        wrap(
          "button",
          {
            type: asString(props.buttonType, "button"),
            style: styleValue({
              background: asString(props.background, "var(--color-primary)"),
              color: asString(props.color, "var(--color-primary-foreground)"),
              border: `1px solid ${asString(props.borderColor, "var(--color-primary)")}`,
              borderRadius: asString(props.borderRadius, "var(--radius-md)"),
              padding:
                `${asString(props.paddingY, "var(--space-sm)")} ${asString(props.paddingX, "var(--space-md)")}`,
              fontFamily: "var(--font-default)",
              fontSize: "var(--text-sm)",
              fontWeight: "600",
              cursor: "pointer",
            }),
          },
          escapeHtml(asString(props.text, "Submit")),
        ),
      );
    }
    case "LinkExtended": {
      const href = asString(props.href, "https://example.com").trim();
      const resolvedMode = resolveLinkExtendedMode(
        asString(props.mode, "auto") as "auto" | "link" | "video" | "audio",
        href,
      );
      const align = asString(props.align, "left");
      const justifyContent =
        align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start";
      const borderColor = asString(props.borderColor, "var(--color-border)");
      const showOfferWidget = asBoolean(props.showOfferWidget, false);
      const offerType = asOfferType(props.offerType);
      const offerTitle = asString(props.offerTitle, "Linked offer");
      const offerSubtitle = asString(props.offerSubtitle, "Describe what the buyer gets.");
      const offerMeta = asString(props.offerMeta, "");
      const offerPrice = asString(props.offerPrice, "$49");
      const offerCtaText = asString(props.offerCtaText, "");
      const showEmbed = asBoolean(props.showEmbed, true);
      const openInNewTab = asBoolean(props.openInNewTab, true);

      const anchorLabel =
        resolvedMode === "video"
          ? "Play video"
          : resolvedMode === "audio"
            ? "Play audio"
            : asString(props.text, "Open link");
      const embedSrc = resolvedMode === "video" ? toEmbeddableVideoUrl(href) : "";
      const isEmbed = /youtube\.com\/embed|player\.vimeo\.com\/video/.test(embedSrc);

      const linkRow = wrap(
        "div",
        {
          style: styleValue({
            display: "flex",
            justifyContent,
          }),
        },
        href
          ? wrap(
              "a",
              {
                href,
                target: openInNewTab ? "_blank" : undefined,
                rel: openInNewTab ? "noreferrer noopener" : undefined,
                style: styleValue({
                  color: asString(props.color, "var(--color-primary)"),
                  textDecoration: "none",
                  fontWeight: "600",
                  fontSize: "14px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                }),
              },
              `${wrap(
                "span",
                {
                  style: styleValue({
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "24px",
                    height: "24px",
                    borderRadius: "9999px",
                    border: `1px solid ${borderColor}`,
                    background: "var(--color-muted)",
                  }),
                },
                resolvedMode === "video" ? "▶" : resolvedMode === "audio" ? "♪" : "↗",
              )}${wrap("span", {}, escapeHtml(anchorLabel))}`,
            )
          : wrap(
              "span",
              { style: styleValue({ color: "var(--color-muted-foreground)", fontSize: "13px" }) },
              "Add a URL in LinkExtended settings.",
            ),
      );

      const videoEmbed =
        showEmbed && href && resolvedMode === "video"
          ? wrap(
              "div",
              { style: styleValue({ display: "flex", flexDirection: "column", gap: "8px" }) },
              `${asString(props.title, "").trim()
                ? wrap(
                    "div",
                    {
                      style: styleValue({
                        fontSize: "12px",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        color: "var(--color-muted-foreground)",
                        fontFamily: "var(--font-default)",
                      }),
                    },
                    escapeHtml(asString(props.title, "Embedded media")),
                  )
                : ""}${wrap(
                "div",
                {
                  style: styleValue({
                    position: "relative",
                    width: "100%",
                    paddingTop: "56.25%",
                    borderRadius: "10px",
                    overflow: "hidden",
                    border: `1px solid ${borderColor}`,
                    background: "#000",
                  }),
                },
                isEmbed
                  ? `<iframe${renderAttributes({
                      src: embedSrc,
                      title: asString(props.title, "Video player"),
                      allow:
                        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
                      allowfullscreen: "true",
                      style: styleValue({
                        position: "absolute",
                        inset: "0",
                        width: "100%",
                        height: "100%",
                        border: "0",
                      }),
                    })}></iframe>`
                  : `<video${renderAttributes({
                      src: embedSrc,
                      controls: asBoolean(props.controls, true) ? "true" : undefined,
                      autoplay: asBoolean(props.autoPlay, false) ? "true" : undefined,
                      loop: asBoolean(props.loop, false) ? "true" : undefined,
                      muted: asBoolean(props.muted, false) ? "true" : undefined,
                      style: styleValue({
                        position: "absolute",
                        inset: "0",
                        width: "100%",
                        height: "100%",
                      }),
                    })}></video>`,
              )}`,
            )
          : "";

      const audioEmbed =
        showEmbed && href && resolvedMode === "audio"
          ? wrap(
              "div",
              {
                style: styleValue({
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  background: "var(--color-muted)",
                  border: `1px solid ${borderColor}`,
                  borderRadius: "10px",
                  padding: "12px",
                }),
              },
              `${asString(props.title, "").trim()
                ? wrap(
                    "div",
                    {
                      style: styleValue({
                        fontSize: "12px",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        color: "var(--color-muted-foreground)",
                        fontFamily: "var(--font-default)",
                      }),
                    },
                    escapeHtml(asString(props.title, "Embedded media")),
                  )
                : ""}${renderAudio(
                href,
                asBoolean(props.controls, true),
                asBoolean(props.autoPlay, false),
                asBoolean(props.loop, false),
              )}`,
            )
          : "";

      const offerWidget =
        showOfferWidget && offerType !== "none" && resolvedMode === "link" && href
          ? renderLinkExtendedWidget(
              href,
              openInNewTab,
              borderColor,
              offerType,
              offerTitle,
              offerSubtitle,
              offerMeta,
              offerPrice,
              offerCtaText,
            )
          : "";

      return wrap(
        "div",
        {
          style: styleValue({
            background: asString(props.background, "var(--color-surface)"),
            border: `1px solid ${borderColor}`,
            borderRadius: asString(props.borderRadius, "var(--radius-md)"),
            padding: asString(props.padding, "var(--space-md)"),
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }),
        },
        `${linkRow}${videoEmbed}${audioEmbed}${offerWidget}`,
      );
    }
    case "TextBlock":
      return wrap(
        "div",
        {
          style: styleValue({
            padding: asString(props.padding, "16px"),
            background: asString(props.background, "transparent"),
            display: "flex",
            flexDirection: "column",
            gap: asString(props.gap, "12px"),
          }),
        },
        joinedChildren,
      );
    case "Hero": {
      const textAlign = asString(props.textAlign, "center");
      const alignItems =
        textAlign === "center" ? "center" : textAlign === "right" ? "flex-end" : "flex-start";
      return wrap(
        "section",
        {
          style: styleValue({
            padding: asString(props.padding, "var(--space-3xl) var(--space-xl)"),
            background: asString(props.background, "var(--color-muted)"),
            textAlign,
            display: "flex",
            flexDirection: "column",
            gap: asString(props.gap, "var(--space-md)"),
            alignItems,
          }),
        },
        joinedChildren,
      );
    }
    case "PrimaryBox":
      return wrap(
        "div",
        {
          style: styleValue({
            padding: asString(props.padding, "var(--space-lg)"),
            background: asString(props.background, "var(--color-primary)"),
            color: asString(props.color, "var(--color-primary-foreground)"),
            display: "flex",
            flexDirection: "column",
            gap: asString(props.gap, "var(--space-sm)"),
            borderRadius: "var(--radius-md)",
          }),
        },
        joinedChildren,
      );
    case "LayoutBlock": {
      const columns = clampInt(props.columns, 1, 4, 2);
      return wrap(
        "section",
        {
          style: styleValue({
            display: "grid",
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            gap: asString(props.gap, "16px"),
            padding: asString(props.padding, "16px"),
            background: asString(props.background, "transparent"),
          }),
        },
        joinedChildren,
      );
    }
    case "ImageBlock": {
      const align = asString(props.align, "center");
      const justify =
        align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start";
      return wrap(
        "div",
        {
          style: styleValue({
            display: "flex",
            justifyContent: justify,
            width: "100%",
          }),
        },
        `<img${renderAttributes({
          src: asString(props.src, "https://placehold.co/800x400"),
          alt: asString(props.alt, "Image"),
          style: styleValue({
            width: asString(props.width, "100%"),
            maxWidth: asString(props.maxWidth, "800px"),
            height: "auto",
            borderRadius: asString(props.borderRadius, "0px"),
            display: "block",
          }),
        })}>`,
      );
    }
    case "Masonry": {
      const columns = clampInt(props.columns, 2, 4, 3);
      const gap = asString(props.gap, "12px");
      const items = children
        .map((childHtml) =>
          wrap(
            "div",
            { style: styleValue({ marginBottom: gap, breakInside: "avoid" }) },
            childHtml,
          ),
        )
        .join("");
      return wrap(
        "section",
        {
          style: styleValue({
            columnCount: String(columns),
            columnGap: gap,
            padding: asString(props.padding, "0px"),
          }),
        },
        items,
      );
    }
    case "Asset": {
      const offerType = asOfferType(props.offerType);
      const offerId = asString(props.offerId, "");
      const checkoutUrl = asString(props.checkoutUrl, "").trim();
      const showCta = asBoolean(props.showCta, true);
      const openInNewTab = asBoolean(props.openInNewTab, true);
      const ctaText = asString(props.ctaText, "").trim() || defaultOfferCta(offerType);
      return wrap(
        "article",
        {
          style: styleValue({
            padding: asString(props.padding, "var(--space-md)"),
            background: asString(props.background, "var(--color-surface)"),
            borderRadius: asString(props.borderRadius, "var(--radius-lg)"),
            border: "1px solid var(--color-border)",
            display: "flex",
            flexDirection: "column",
            gap: asString(props.gap, "var(--space-sm)"),
          }),
        },
        `${joinedChildren}${wrap(
          "div",
          {
            style: styleValue({
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }),
          },
          `${wrap(
            "div",
            {
              style: styleValue({
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-between",
                gap: "12px",
                flexWrap: "wrap",
              }),
            },
            `${wrap(
              "div",
              { style: styleValue({ minWidth: "0" }) },
              `${wrap(
                "div",
                {
                  style: styleValue({
                    fontSize: "11px",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: "var(--color-muted-foreground)",
                    fontFamily: "var(--font-default)",
                  }),
                },
                offerTypeLabel(offerType),
              )}${
                offerId
                  ? wrap(
                      "div",
                      {
                        style: styleValue({
                          marginTop: "3px",
                          fontSize: "11px",
                          color: "var(--color-muted-foreground)",
                          fontFamily: "var(--font-mono)",
                        }),
                      },
                      escapeHtml(offerId),
                    )
                  : ""
              }`,
            )}${wrap(
              "div",
              {
                style: styleValue({
                  display: "flex",
                  justifyContent: "flex-end",
                  fontSize: "16px",
                  fontWeight: "700",
                  color: "#111827",
                }),
              },
              `${escapeHtml(asString(props.currency, "$"))}${escapeHtml(asString(props.price, "49"))}`,
            )}`,
          )}${
            showCta && checkoutUrl
              ? wrap(
                  "div",
                  { style: styleValue({ display: "flex", justifyContent: "flex-end" }) },
                  wrap(
                    "a",
                    {
                      href: checkoutUrl,
                      target: openInNewTab ? "_blank" : undefined,
                      rel: openInNewTab ? "noreferrer noopener" : undefined,
                      style: styleValue({
                        borderRadius: "9999px",
                        border: "1px solid var(--color-border)",
                        background: asString(props.ctaBackground, "var(--color-primary)"),
                        color: asString(props.ctaColor, "var(--color-primary-foreground)"),
                        textDecoration: "none",
                        padding: "8px 14px",
                        fontSize: "12px",
                        fontWeight: "600",
                        fontFamily: "var(--font-default)",
                        lineHeight: "1.2",
                      }),
                    },
                    escapeHtml(ctaText),
                  ),
                )
              : ""
          }`,
        )}`,
      );
    }
    case "Author": {
      const name = asString(props.name, "Jane Doe");
      const email = asString(props.email, "jane@example.com");
      const showEmail = asBoolean(props.showEmail, true);
      return wrap(
        "div",
        {
          style: styleValue({
            display: "flex",
            alignItems: "center",
            gap: "8px",
            minWidth: "0",
          }),
        },
        `${wrap(
          "img",
          {
            src: asString(props.avatar, "https://placehold.co/64x64"),
            alt: name,
            style: styleValue({
              width: asString(props.avatarSize, "32px"),
              height: asString(props.avatarSize, "32px"),
              borderRadius: "9999px",
              objectFit: "cover",
              flexShrink: "0",
            }),
          },
          "",
        )}${wrap(
          "div",
          { style: styleValue({ minWidth: "0" }) },
          `${wrap(
            "div",
            {
              style: styleValue({
                fontSize: "14px",
                fontWeight: "600",
                color: "var(--color-foreground)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }),
            },
            escapeHtml(name),
          )}${
            showEmail
              ? wrap(
                  "a",
                  {
                    href: `mailto:${email}`,
                    style: styleValue({
                      fontSize: "12px",
                      color: "var(--color-muted-foreground)",
                      textDecoration: "none",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      display: "block",
                    }),
                  },
                  escapeHtml(email),
                )
              : ""
          }`,
        )}`,
      );
    }
    case "Quote":
      return wrap(
        "blockquote",
        {
          style: styleValue({
            padding: asString(props.padding, "var(--space-lg) var(--space-lg)"),
            background: asString(props.background, "var(--color-muted)"),
            borderRadius: asString(props.borderRadius, "var(--radius-md)"),
            borderLeft: `4px solid ${asString(props.accentColor, "var(--color-primary)")}`,
            display: "flex",
            flexDirection: "column",
            gap: asString(props.gap, "var(--space-sm)"),
            margin: "0",
          }),
        },
        joinedChildren,
      );
    case "Diagram": {
      const source = asString(props.source, "");
      const view = asString(props.view, "rendered");
      return wrap(
        "div",
        {
          style: styleValue({
            background: asString(props.background, "var(--color-surface)"),
            padding: asString(props.padding, "var(--space-md)"),
            borderRadius: asString(props.borderRadius, "var(--radius-md)"),
            border: "1px solid var(--color-border)",
            overflow: "auto",
          }),
        },
        wrap(
          "pre",
          {
            style: styleValue({
              margin: "0",
              fontFamily: "var(--font-mono)",
              fontSize: "13px",
              color: "var(--color-foreground)",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }),
          },
          escapeHtml(
            view === "rendered"
              ? `Mermaid source (render omitted in static export):\n${source}`
              : source,
          ),
        ),
      );
    }
    case "Audio":
      return wrap(
        "div",
        {
          style: styleValue({
            background: asString(props.background, "var(--color-muted)"),
            padding: asString(props.padding, "var(--space-sm) var(--space-md)"),
            borderRadius: asString(props.borderRadius, "var(--radius-md)"),
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            border: "1px solid var(--color-border)",
          }),
        },
        `${asString(props.title, "").trim().length > 0
          ? wrap(
              "div",
              {
                style: styleValue({
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "var(--color-foreground)",
                  fontFamily: "var(--font-default)",
                }),
              },
              escapeHtml(asString(props.title, "Audio")),
            )
          : ""}${renderAudio(
          asString(props.src, "https://www.w3schools.com/html/horse.mp3"),
          asBoolean(props.controls, true),
          asBoolean(props.autoPlay, false),
          asBoolean(props.loop, false),
        )}`,
      );
    case "Video": {
      const src = asString(props.src, "https://www.youtube.com/watch?v=dQw4w9WgXcQ");
      const embedSrc = toEmbeddableVideoUrl(src);
      const isEmbed = /youtube\.com\/embed|player\.vimeo\.com\/video/.test(embedSrc);
      const media = isEmbed
        ? `<iframe${renderAttributes({
            src: embedSrc,
            title: asString(props.title, "Video"),
            allow:
              "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
            allowfullscreen: "true",
            style: styleValue({
              position: "absolute",
              inset: "0",
              width: "100%",
              height: "100%",
              border: "0",
            }),
          })}></iframe>`
        : `<video${renderAttributes({
            src: embedSrc,
            controls: asBoolean(props.controls, true) ? "true" : undefined,
            autoplay: asBoolean(props.autoPlay, false) ? "true" : undefined,
            loop: asBoolean(props.loop, false) ? "true" : undefined,
            muted: asBoolean(props.muted, false) ? "true" : undefined,
            style: styleValue({
              position: "absolute",
              inset: "0",
              width: "100%",
              height: "100%",
            }),
          })}></video>`;
      return wrap(
        "div",
        {
          style: styleValue({
            background: asString(props.background, "var(--color-muted)"),
            padding: asString(props.padding, "var(--space-sm) var(--space-md)"),
            borderRadius: asString(props.borderRadius, "var(--radius-md)"),
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            border: "1px solid var(--color-border)",
          }),
        },
        `${asString(props.title, "").trim().length > 0
          ? wrap(
              "div",
              {
                style: styleValue({
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "var(--color-foreground)",
                  fontFamily: "var(--font-default)",
                }),
              },
              escapeHtml(asString(props.title, "Video")),
            )
          : ""}${wrap(
          "div",
          {
            style: styleValue({
              position: "relative",
              width: "100%",
              paddingTop: "56.25%",
              borderRadius: "10px",
              overflow: "hidden",
              background: "#000",
            }),
          },
          media,
        )}`,
      );
    }
    case "Event":
      return wrap(
        "article",
        {
          style: styleValue({
            display: "grid",
            gridTemplateColumns: "140px minmax(0, 1fr)",
            gap: "12px",
            padding: "14px",
            border: `1px solid ${asString(props.borderColor, "var(--color-border)")}`,
            borderRadius: "12px",
            background: asString(props.background, "var(--color-surface)"),
          }),
        },
        `${wrap(
          "div",
          {
            style: styleValue({
              borderRadius: "10px",
              background: asString(props.dateBackground, "var(--color-muted)"),
              color: asString(props.dateColor, "var(--color-foreground)"),
              padding: "10px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
            }),
          },
          `${wrap(
            "div",
            { style: styleValue({ fontSize: "12px", lineHeight: "1.2" }) },
            escapeHtml(asString(props.from, "2026-06-14")),
          )}${
            asString(props.to, "").trim().length > 0
              ? wrap(
                  "div",
                  { style: styleValue({ marginTop: "8px", fontSize: "11px", opacity: "0.9" }) },
                  `to ${escapeHtml(asString(props.to, ""))}`,
                )
              : ""
          }`,
        )}${wrap(
          "div",
          { style: styleValue({ minWidth: "0" }) },
          `${wrap(
            "h3",
            {
              style: styleValue({
                margin: "0",
                fontSize: "20px",
                lineHeight: "1.2",
                color: "var(--color-foreground)",
                fontFamily: "var(--font-default)",
              }),
            },
            escapeHtml(asString(props.title, "Event title")),
          )}${wrap(
            "p",
            {
              style: styleValue({
                margin: "8px 0 0",
                fontSize: "15px",
                lineHeight: "1.45",
                color: "var(--color-muted-foreground)",
                fontFamily: "var(--font-default)",
              }),
            },
            escapeHtml(asString(props.text, "Event description paragraph")),
          )}${wrap(
            "div",
            {
              style: styleValue({
                marginTop: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "10px",
                flexWrap: "wrap",
              }),
            },
            `${wrap(
              "div",
              { style: styleValue({ minHeight: "18px" }) },
              `${asString(props.offerId, "").trim()
                ? wrap(
                    "code",
                    {
                      style: styleValue({
                        fontSize: "11px",
                        color: "var(--color-muted-foreground)",
                        fontFamily: "var(--font-mono)",
                      }),
                    },
                    escapeHtml(asString(props.offerId, "")),
                  )
                : ""}${
                asString(props.price, "").trim()
                  ? wrap(
                      "div",
                      {
                        style: styleValue({
                          fontSize: "14px",
                          fontWeight: "700",
                          color: "var(--color-foreground)",
                          fontFamily: "var(--font-default)",
                        }),
                      },
                      `${escapeHtml(asString(props.currency, "$"))}${escapeHtml(asString(props.price, ""))}`,
                    )
                  : ""
              }`,
            )}${
              asBoolean(props.showCta, true) && asString(props.checkoutUrl, "").trim()
                ? wrap(
                    "a",
                    {
                      href: asString(props.checkoutUrl, ""),
                      target: asBoolean(props.openInNewTab, true) ? "_blank" : undefined,
                      rel: asBoolean(props.openInNewTab, true) ? "noreferrer noopener" : undefined,
                      style: styleValue({
                        borderRadius: "9999px",
                        border: `1px solid ${asString(props.borderColor, "var(--color-border)")}`,
                        background: asString(props.ctaBackground, "var(--color-primary)"),
                        color: asString(props.ctaColor, "var(--color-primary-foreground)"),
                        textDecoration: "none",
                        padding: "7px 12px",
                        fontSize: "12px",
                        fontWeight: "600",
                        fontFamily: "var(--font-default)",
                        lineHeight: "1.2",
                        display: "inline-flex",
                        alignItems: "center",
                      }),
                    },
                    escapeHtml(asString(props.ctaText, "Reserve Spot")),
                  )
                : ""
            }`,
          )}`,
        )}`,
      );
    case "Template": {
      const template = asString(props.template, "");
      const view = asString(props.view, "source");
      return wrap(
        "div",
        {
          style: styleValue({
            background: asString(props.background, "var(--color-surface)"),
            padding: asString(props.padding, "var(--space-md)"),
            borderRadius: asString(props.borderRadius, "var(--radius-md)"),
            border: "1px solid var(--color-border)",
            overflow: "auto",
          }),
        },
        view === "rendered"
          ? template
          : wrap(
              "pre",
              {
                style: styleValue({
                  margin: "0",
                  fontFamily: "var(--font-mono)",
                  fontSize: "13px",
                  color: "var(--color-foreground)",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }),
              },
              escapeHtml(template),
            ),
      );
    }
    default:
      return joinedChildren;
  }
}

const CONTACT_MODAL_SCRIPT = `<script>
(() => {
  const modalNodes = Array.from(document.querySelectorAll('[data-contact-modal="true"]'));
  if (modalNodes.length === 0) return;

  function setBodyLock() {
    const hasOpen = Boolean(document.querySelector('[data-contact-modal="true"][data-open="true"]'));
    document.body.style.overflow = hasOpen ? 'hidden' : '';
  }

  function parseSessionEmail(payload) {
    if (!payload || typeof payload !== 'object') return '';
    const session = payload.session && typeof payload.session === 'object' ? payload.session : null;
    if (!session) return '';
    const nestedUser = session.user && typeof session.user === 'object' ? session.user : null;
    if (nestedUser && typeof nestedUser.email === 'string') return nestedUser.email.trim().toLowerCase();
    if (typeof session.email === 'string') return session.email.trim().toLowerCase();
    return '';
  }

  async function prefillEmail(form) {
    if (!(form instanceof HTMLFormElement)) return;
    if (form.dataset.prefillChecked === '1') return;
    form.dataset.prefillChecked = '1';

    try {
      const response = await fetch('/api/auth/session', {
        cache: 'no-store',
        credentials: 'same-origin',
      });
      if (!response.ok) return;
      const payload = await response.json().catch(() => null);
      const email = parseSessionEmail(payload);
      if (!email) return;

      const emailInput = form.querySelector('[data-contact-email-input="true"]');
      if (!(emailInput instanceof HTMLInputElement)) return;
      emailInput.value = email;
      emailInput.readOnly = true;
      emailInput.dataset.lockedEmail = email;
      emailInput.style.background = 'var(--color-muted)';
      emailInput.style.color = 'var(--color-muted-foreground)';
      emailInput.style.cursor = 'not-allowed';

      const lockNote = form.querySelector('[data-contact-email-lock-note="true"]');
      if (lockNote instanceof HTMLElement) lockNote.hidden = false;
    } catch {
      // Session prefill is optional.
    }
  }

  function getModal(modalId) {
    if (!modalId) return null;
    const modal = document.getElementById(modalId);
    if (!modal) return null;
    if (modal.getAttribute('data-contact-modal') !== 'true') return null;
    return modal;
  }

  function openModal(modalId) {
    const modal = getModal(modalId);
    if (!modal) return;
    modal.hidden = false;
    modal.style.display = 'flex';
    modal.setAttribute('data-open', 'true');
    setBodyLock();
    const form = modal.querySelector('form[data-contact-form="true"]');
    if (form) void prefillEmail(form);
  }

  function closeModal(modalId) {
    const modal = getModal(modalId);
    if (!modal) return;
    modal.hidden = true;
    modal.style.display = 'none';
    modal.removeAttribute('data-open');
    setBodyLock();
  }

  function setStatus(statusEl, kind, message) {
    if (!(statusEl instanceof HTMLElement)) return;
    statusEl.hidden = false;
    statusEl.textContent = message;
    if (kind === 'success') {
      statusEl.style.borderColor = 'var(--color-success)';
      statusEl.style.color = 'var(--color-success)';
      statusEl.style.background = 'rgba(22, 163, 74, 0.10)';
    } else {
      statusEl.style.borderColor = 'var(--color-danger)';
      statusEl.style.color = 'var(--color-danger)';
      statusEl.style.background = 'rgba(220, 38, 38, 0.10)';
    }
  }

  for (const modal of modalNodes) {
    if (!(modal instanceof HTMLElement)) continue;
    modal.hidden = true;
    modal.style.display = 'none';
  }

  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const openButton = target.closest('[data-contact-open]');
    if (openButton instanceof HTMLElement) {
      const modalId = openButton.getAttribute('data-contact-open') || '';
      openModal(modalId);
      return;
    }

    const closeButton = target.closest('[data-contact-close]');
    if (closeButton instanceof HTMLElement) {
      const modalId = closeButton.getAttribute('data-contact-close') || '';
      closeModal(modalId);
      return;
    }

    const modalOverlay = target.closest('[data-contact-modal="true"]');
    if (modalOverlay instanceof HTMLElement && target === modalOverlay) {
      closeModal(modalOverlay.id);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    const openModalNode = document.querySelector('[data-contact-modal="true"][data-open="true"]');
    if (!(openModalNode instanceof HTMLElement)) return;
    closeModal(openModalNode.id);
  });

  document.addEventListener('submit', async (event) => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;
    if (form.getAttribute('data-contact-form') !== 'true') return;
    event.preventDefault();

    const statusEl = form.querySelector('[data-contact-status="true"]');
    if (statusEl instanceof HTMLElement) {
      statusEl.hidden = true;
      statusEl.textContent = '';
    }

    const submitBtn = form.querySelector('[data-contact-submit="true"]');
    const idleSubmitText =
      submitBtn instanceof HTMLButtonElement
        ? submitBtn.getAttribute('data-submit-text') || submitBtn.textContent || 'Send'
        : 'Send';
    const sendingText =
      submitBtn instanceof HTMLButtonElement
        ? submitBtn.getAttribute('data-sending-text') || 'Sending...'
        : 'Sending...';

    if (submitBtn instanceof HTMLButtonElement) {
      submitBtn.disabled = true;
      submitBtn.textContent = sendingText;
    }

    const action = form.getAttribute('action') || '/api/contact';
    try {
      const response = await fetch(action, {
        method: 'POST',
        body: new FormData(form),
      });

      const payload = await response.json().catch(() => null);
      const responseMessage =
        payload && typeof payload === 'object'
          ? typeof payload.message === 'string'
            ? payload.message
            : typeof payload.error === 'string'
              ? payload.error
              : ''
          : '';

      if (response.ok && payload && typeof payload === 'object' && payload.ok === true) {
        form.reset();
        const emailInput = form.querySelector('[data-contact-email-input="true"]');
        if (emailInput instanceof HTMLInputElement && emailInput.dataset.lockedEmail) {
          emailInput.value = emailInput.dataset.lockedEmail;
        }
        setStatus(
          statusEl,
          'success',
          responseMessage || 'Message sent. We will get back to you shortly.',
        );
      } else {
        setStatus(
          statusEl,
          'error',
          responseMessage || 'Could not send your message right now.',
        );
      }
    } catch {
      setStatus(statusEl, 'error', 'Network error while sending message.');
    } finally {
      if (submitBtn instanceof HTMLButtonElement) {
        submitBtn.disabled = false;
        submitBtn.textContent = idleSubmitText;
      }
    }
  });
})();
</script>`;

export function buildStaticHtmlDocument(
  nodes: SerializedNodes,
  options: HtmlExportOptions = {},
): string {
  const safeNodes = isRecord(nodes) ? nodes : {};
  const body = renderNode(safeNodes as SerializedNodes, "ROOT", new Set());
  const title = escapeHtml(options.title?.trim() || "OmniBlocks Export");
  const vars = sanitizeThemeVariables(options.themeVariables);
  const cssVariables = Object.entries(vars)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join("\n");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <style>
:root {
${cssVariables}
}
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body {
  background: var(--color-background);
  color: var(--color-foreground);
  font-family: var(--font-default);
}
main {
  max-width: 960px;
  margin: 0 auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
img {
  max-width: 100%;
  height: auto;
}
  </style>
</head>
<body>
  <main>
${body}
  </main>
  ${CONTACT_MODAL_SCRIPT}
</body>
</html>`;
}
