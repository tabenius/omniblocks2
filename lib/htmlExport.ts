import type { SerializedNode, SerializedNodes } from "@craftjs/core";
import { isRecord } from "./typeGuards";

type HtmlExportOptions = {
  title?: string;
  themeVariables?: Record<string, string>;
};

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
    case "Asset":
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
              justifyContent: "flex-end",
              fontSize: "16px",
              fontWeight: "700",
              color: "#111827",
            }),
          },
          `${escapeHtml(asString(props.currency, "$"))}${escapeHtml(asString(props.price, "49"))}`,
        )}`,
      );
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
</body>
</html>`;
}
