import * as React from "react";
import { Heading as REHeading, Text as REText, Img, Link } from "@react-email/components";
import { encode } from "html-entities";
import type { HeadingProps, HeadingLevel } from "@/components/user/Heading";
import type { ParagraphProps } from "@/components/user/Paragraph";
import type { AlterParagraphProps } from "@/components/user/AlterParagraph";
import type { ImageBlockProps } from "@/components/user/ImageBlock";
import type { AuthorProps } from "@/components/user/Author";
import type { DiagramProps } from "@/components/user/Diagram";
import type { AudioProps } from "@/components/user/Audio";
import type { TemplateProps } from "@/components/user/Template";
import type { EventProps } from "@/components/user/Event";
import type { VideoProps } from "@/components/user/Video";
import type { NameProps } from "@/components/user/Name";
import type { EmailProps } from "@/components/user/Email";
import type { TextareaProps } from "@/components/user/Textarea";
import type { ButtonProps } from "@/components/user/Button";
import type { ContactFormProps } from "@/components/user/ContactForm";
import type { LinkExtendedProps, LinkExtendedOfferType } from "@/components/user/LinkExtended";

const emailSize: Record<HeadingLevel, string> = {
  1: "32px",
  2: "26px",
  3: "22px",
  4: "18px",
  5: "16px",
  6: "14px",
};

function eventDateParts(input?: string): {
  month: string;
  day: string;
  year: string;
  raw: string;
} {
  const raw = (input ?? "").trim();
  if (!raw) return { month: "DATE", day: "--", year: "", raw: "" };
  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) {
    return {
      month: parsed.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
      day: String(parsed.getDate()).padStart(2, "0"),
      year: String(parsed.getFullYear()),
      raw,
    };
  }
  return { month: "DATE", day: raw, year: "", raw };
}

export const HeadingEmail = (p: HeadingProps) => (
  <REHeading
    as={`h${p.level ?? 1}` as "h1"}
    style={{
      fontSize: emailSize[(p.level ?? 1) as HeadingLevel],
      fontWeight: 700,
      color: p.color ?? "#0f172a",
      textAlign: p.textAlign ?? "left",
      background: "transparent",
      margin: "0 0 12px 0",
      fontFamily: "Arial, Helvetica, sans-serif",
    }}
  >
    {encode(p.text ?? "")}
  </REHeading>
);

export const ParagraphEmail = (p: ParagraphProps) => (
  <REText
    style={{
      fontSize: p.fontSize ?? "16px",
      color: p.color ?? "#475569",
      textAlign: p.textAlign ?? "left",
      margin: "0 0 12px 0",
      lineHeight: "1.5",
      fontFamily: "Arial, Helvetica, sans-serif",
    }}
  >
    {encode(p.text ?? "")}
  </REText>
);

export const AlterParagraphEmail = (p: AlterParagraphProps) => (
  <REText
    style={{
      fontSize: p.fontSize ?? "16px",
      color: p.color ?? "#475569",
      textAlign: p.textAlign ?? "left",
      fontStyle: p.fontStyle ?? "italic",
      margin: "0 0 12px 0",
      lineHeight: "1.5",
      fontFamily: "Georgia, 'Times New Roman', serif",
    }}
  >
    {encode(p.text ?? "")}
  </REText>
);

export const NameEmail = (p: NameProps) => (
  <table
    role="presentation"
    cellPadding={0}
    cellSpacing={0}
    border={0}
    width="100%"
    style={{ borderCollapse: "collapse" }}
  >
    <tbody>
      <tr>
        <td
          style={{
            fontSize: "12px",
            color: "#64748b",
            paddingBottom: "6px",
            fontFamily: "Arial, Helvetica, sans-serif",
          }}
        >
          {encode((p.label ?? "Name") + (p.required ? " *" : ""))}
        </td>
      </tr>
      <tr>
        <td
          style={{
            border: "1px solid #cbd5e1",
            borderRadius: "6px",
            padding: "10px 12px",
            fontSize: "14px",
            color: "#94a3b8",
            fontFamily: "Arial, Helvetica, sans-serif",
          }}
        >
          {encode(p.placeholder ?? "Your name")}
        </td>
      </tr>
    </tbody>
  </table>
);

export const EmailEmail = (p: EmailProps) => (
  <table
    role="presentation"
    cellPadding={0}
    cellSpacing={0}
    border={0}
    width="100%"
    style={{ borderCollapse: "collapse" }}
  >
    <tbody>
      <tr>
        <td
          style={{
            fontSize: "12px",
            color: "#64748b",
            paddingBottom: "6px",
            fontFamily: "Arial, Helvetica, sans-serif",
          }}
        >
          {encode((p.label ?? "Email") + (p.required ? " *" : ""))}
        </td>
      </tr>
      <tr>
        <td
          style={{
            border: "1px solid #cbd5e1",
            borderRadius: "6px",
            padding: "10px 12px",
            fontSize: "14px",
            color: "#94a3b8",
            fontFamily: "Arial, Helvetica, sans-serif",
          }}
        >
          {encode(p.placeholder ?? "you@example.com")}
        </td>
      </tr>
    </tbody>
  </table>
);

export const TextareaEmail = (p: TextareaProps) => (
  <table
    role="presentation"
    cellPadding={0}
    cellSpacing={0}
    border={0}
    width="100%"
    style={{ borderCollapse: "collapse" }}
  >
    <tbody>
      <tr>
        <td
          style={{
            fontSize: "12px",
            color: "#64748b",
            paddingBottom: "6px",
            fontFamily: "Arial, Helvetica, sans-serif",
          }}
        >
          {encode((p.label ?? "Message") + (p.required ? " *" : ""))}
        </td>
      </tr>
      <tr>
        <td
          style={{
            border: "1px solid #cbd5e1",
            borderRadius: "6px",
            padding: "10px 12px",
            fontSize: "14px",
            color: "#94a3b8",
            minHeight: `${Math.max(3, p.rows ?? 5) * 18}px`,
            fontFamily: "Arial, Helvetica, sans-serif",
          }}
        >
          {encode(p.placeholder ?? "Write your message")}
        </td>
      </tr>
    </tbody>
  </table>
);

export const ButtonEmail = (p: ButtonProps) => (
  <table
    role="presentation"
    cellPadding={0}
    cellSpacing={0}
    border={0}
    width="100%"
    style={{ borderCollapse: "collapse" }}
  >
    <tbody>
      <tr>
        <td align={p.align ?? "left"}>
          <span
            style={{
              display: "inline-block",
              background: p.background ?? "#2563eb",
              color: p.color ?? "#ffffff",
              border: `1px solid ${p.borderColor ?? "#2563eb"}`,
              borderRadius: p.borderRadius ?? "8px",
              padding: `${p.paddingY ?? "8px"} ${p.paddingX ?? "16px"}`,
              fontSize: "14px",
              fontWeight: 600,
              fontFamily: "Arial, Helvetica, sans-serif",
            }}
          >
            {encode(p.text ?? "Submit")}
          </span>
        </td>
      </tr>
    </tbody>
  </table>
);

export const ContactFormEmail = (p: ContactFormProps) => (
  <table
    role="presentation"
    cellPadding={0}
    cellSpacing={0}
    border={0}
    width="100%"
    style={{ borderCollapse: "collapse" }}
  >
    <tbody>
      <tr>
        <td
          style={{
            border: `1px solid ${p.modalBorderColor ?? "#cbd5e1"}`,
            borderRadius: p.modalBorderRadius ?? "12px",
            background: p.modalBackground ?? "#ffffff",
            padding: "16px",
            fontFamily: "Arial, Helvetica, sans-serif",
          }}
        >
          <div
            style={{
              fontSize: "18px",
              fontWeight: 700,
              color: "#0f172a",
              marginBottom: "8px",
            }}
          >
            {encode(p.title ?? "Get in touch")}
          </div>
          <div
            style={{
              fontSize: "13px",
              color: "#64748b",
              marginBottom: "14px",
              lineHeight: "1.5",
            }}
          >
            {encode(p.description ?? "Send a short note and we will get back to you.")}
          </div>

          <table
            role="presentation"
            cellPadding={0}
            cellSpacing={0}
            border={0}
            width="100%"
            style={{ borderCollapse: "collapse" }}
          >
            <tbody>
              <tr>
                <td
                  style={{
                    fontSize: "12px",
                    color: "#64748b",
                    paddingBottom: "6px",
                    fontFamily: "Arial, Helvetica, sans-serif",
                  }}
                >
                  {encode(p.nameLabel ?? "Name")}
                </td>
              </tr>
              <tr>
                <td
                  style={{
                    border: `1px solid ${p.fieldBorderColor ?? "#cbd5e1"}`,
                    borderRadius: p.fieldBorderRadius ?? "6px",
                    background: p.fieldBackground ?? "#ffffff",
                    padding: "10px 12px",
                    fontSize: "14px",
                    color: "#94a3b8",
                  }}
                >
                  {encode(p.namePlaceholder ?? "Your name")}
                </td>
              </tr>
            </tbody>
          </table>

          <div style={{ height: "10px", lineHeight: "10px" }}>&nbsp;</div>

          <table
            role="presentation"
            cellPadding={0}
            cellSpacing={0}
            border={0}
            width="100%"
            style={{ borderCollapse: "collapse" }}
          >
            <tbody>
              <tr>
                <td
                  style={{
                    fontSize: "12px",
                    color: "#64748b",
                    paddingBottom: "6px",
                    fontFamily: "Arial, Helvetica, sans-serif",
                  }}
                >
                  {encode(p.emailLabel ?? "Email")}
                </td>
              </tr>
              <tr>
                <td
                  style={{
                    border: `1px solid ${p.fieldBorderColor ?? "#cbd5e1"}`,
                    borderRadius: p.fieldBorderRadius ?? "6px",
                    background: "var(--color-muted, #f1f5f9)",
                    padding: "10px 12px",
                    fontSize: "14px",
                    color: "var(--color-muted-foreground, #64748b)",
                  }}
                >
                  {encode(p.emailPlaceholder ?? "you@example.com")}
                </td>
              </tr>
            </tbody>
          </table>

          <div style={{ height: "10px", lineHeight: "10px" }}>&nbsp;</div>

          <table
            role="presentation"
            cellPadding={0}
            cellSpacing={0}
            border={0}
            width="100%"
            style={{ borderCollapse: "collapse" }}
          >
            <tbody>
              <tr>
                <td
                  style={{
                    fontSize: "12px",
                    color: "#64748b",
                    paddingBottom: "6px",
                    fontFamily: "Arial, Helvetica, sans-serif",
                  }}
                >
                  {encode(p.messageLabel ?? "Notes")}
                </td>
              </tr>
              <tr>
                <td
                  style={{
                    border: `1px solid ${p.fieldBorderColor ?? "#cbd5e1"}`,
                    borderRadius: p.fieldBorderRadius ?? "6px",
                    background: p.fieldBackground ?? "#ffffff",
                    padding: "10px 12px",
                    fontSize: "14px",
                    color: "#94a3b8",
                    minHeight: "108px",
                  }}
                >
                  {encode(p.messagePlaceholder ?? "Tell us what you need help with")}
                </td>
              </tr>
            </tbody>
          </table>

          <div style={{ height: "14px", lineHeight: "14px" }}>&nbsp;</div>
          <span
            style={{
              display: "inline-block",
              background: p.buttonBackground ?? "#2563eb",
              color: p.buttonColor ?? "#ffffff",
              border: `1px solid ${p.buttonBorderColor ?? "#2563eb"}`,
              borderRadius: "8px",
              padding: "8px 14px",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            {encode(p.submitText ?? "Send")}
          </span>
        </td>
      </tr>
    </tbody>
  </table>
);

function asOfferType(value: unknown): LinkExtendedOfferType {
  if (
    value === "asset" ||
    value === "course" ||
    value === "workshop" ||
    value === "event" ||
    value === "file-download"
  ) {
    return value;
  }
  return "none";
}

function offerTypeLabel(value: LinkExtendedOfferType): string {
  switch (value) {
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

export const LinkExtendedEmail = (p: LinkExtendedProps) => {
  const href = (p.href ?? "").trim();
  const offerType = asOfferType(p.offerType);
  const showOfferWidget = Boolean(p.showOfferWidget) && offerType !== "none";
  const ctaText = (p.offerCtaText || "").trim() || defaultOfferCta(offerType);

  if (!href) {
    return (
      <REText
        style={{
          margin: "0 0 10px 0",
          fontSize: "12px",
          color: "#64748b",
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        Add a URL in LinkExtended settings.
      </REText>
    );
  }

  return (
    <table
      role="presentation"
      cellPadding={0}
      cellSpacing={0}
      border={0}
      width="100%"
      style={{ borderCollapse: "collapse" }}
    >
      <tbody>
        <tr>
          <td>
            <Link
              href={href}
              style={{
                color: p.color ?? "#2563eb",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: 600,
                fontFamily: "Arial, Helvetica, sans-serif",
              }}
            >
              {encode(p.text ?? "Open link")}
            </Link>
          </td>
        </tr>
        {showOfferWidget ? (
          <tr>
            <td style={{ paddingTop: "10px" }}>
              <table
                role="presentation"
                cellPadding={0}
                cellSpacing={0}
                border={0}
                width="100%"
                style={{
                  borderCollapse: "collapse",
                  border: `1px solid ${p.borderColor ?? "#cbd5e1"}`,
                  borderRadius: "10px",
                  background: "#f8fafc",
                }}
              >
                <tbody>
                  <tr>
                    <td style={{ padding: "12px" }}>
                      <div
                        style={{
                          fontSize: "11px",
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          color: "#64748b",
                          fontFamily: "Arial, Helvetica, sans-serif",
                        }}
                      >
                        {encode(offerTypeLabel(offerType))}
                      </div>
                      <div
                        style={{
                          marginTop: "6px",
                          fontSize: "16px",
                          fontWeight: 700,
                          color: "#0f172a",
                          fontFamily: "Arial, Helvetica, sans-serif",
                        }}
                      >
                        {encode(p.offerTitle || "Linked offer")}
                      </div>
                      {p.offerSubtitle ? (
                        <div
                          style={{
                            marginTop: "6px",
                            fontSize: "13px",
                            color: "#475569",
                            fontFamily: "Arial, Helvetica, sans-serif",
                          }}
                        >
                          {encode(p.offerSubtitle)}
                        </div>
                      ) : null}
                      <div style={{ marginTop: "10px" }}>
                        <Link
                          href={href}
                          style={{
                            display: "inline-block",
                            border: `1px solid ${p.borderColor ?? "#2563eb"}`,
                            borderRadius: "9999px",
                            background: p.color ?? "#2563eb",
                            color: "#ffffff",
                            textDecoration: "none",
                            fontSize: "12px",
                            fontWeight: 700,
                            fontFamily: "Arial, Helvetica, sans-serif",
                            padding: "7px 12px",
                          }}
                        >
                          {encode(ctaText)}
                        </Link>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        ) : null}
      </tbody>
    </table>
  );
};

export const ImageEmail = (p: ImageBlockProps) => {
  const align = p.align ?? "center";
  return (
    <table
      role="presentation"
      cellPadding={0}
      cellSpacing={0}
      border={0}
      width="100%"
      style={{ borderCollapse: "collapse" }}
    >
      <tbody>
        <tr>
          <td align={align}>
            <Img
              src={p.src ?? ""}
              alt={p.alt ?? ""}
              width={p.maxWidth?.replace("px", "") ?? "800"}
              style={{
                display: "block",
                maxWidth: p.maxWidth ?? "800px",
                width: "100%",
                height: "auto",
                borderRadius: p.borderRadius ?? "0px",
              }}
            />
          </td>
        </tr>
      </tbody>
    </table>
  );
};

export const DiagramEmail = (p: DiagramProps) => (
  <table
    role="presentation"
    cellPadding={0}
    cellSpacing={0}
    border={0}
    width="100%"
    style={{ borderCollapse: "collapse" }}
  >
    <tbody>
      <tr>
        <td
          style={{
            background: "#f8fafc",
            padding: "16px",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
          }}
        >
          <pre
            style={{
              margin: 0,
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: "12px",
              color: "#0f172a",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {encode(p.source ?? "")}
          </pre>
        </td>
      </tr>
    </tbody>
  </table>
);

export const TemplateEmail = (p: TemplateProps) => (
  <table
    role="presentation"
    cellPadding={0}
    cellSpacing={0}
    border={0}
    width="100%"
    style={{ borderCollapse: "collapse" }}
  >
    <tbody>
      <tr>
        <td
          style={{
            background: "#f8fafc",
            padding: "12px 16px",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "#64748b",
              marginBottom: "6px",
              fontFamily: "Arial, Helvetica, sans-serif",
            }}
          >
            Interactive (htmx)
          </div>
          <pre
            style={{
              margin: 0,
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: "11px",
              color: "#0f172a",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {encode(p.template ?? "")}
          </pre>
        </td>
      </tr>
    </tbody>
  </table>
);

export const AudioEmail = (p: AudioProps) => (
  <table
    role="presentation"
    cellPadding={0}
    cellSpacing={0}
    border={0}
    width="100%"
    style={{ borderCollapse: "collapse" }}
  >
    <tbody>
      <tr>
        <td
          style={{
            background: "#f1f5f9",
            padding: "12px 16px",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
          }}
        >
          <div
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "#0f172a",
              marginBottom: "4px",
              fontFamily: "Arial, Helvetica, sans-serif",
            }}
          >
            {encode(p.title ?? "Audio")}
          </div>
          <Link
            href={p.src ?? "#"}
            style={{
              fontSize: "13px",
              color: "#2563eb",
              textDecoration: "underline",
              fontFamily: "Arial, Helvetica, sans-serif",
            }}
          >
            ▶ Listen
          </Link>
        </td>
      </tr>
    </tbody>
  </table>
);

export const VideoEmail = (p: VideoProps) => (
  <table
    role="presentation"
    cellPadding={0}
    cellSpacing={0}
    border={0}
    width="100%"
    style={{ borderCollapse: "collapse" }}
  >
    <tbody>
      <tr>
        <td
          style={{
            background: "#f1f5f9",
            padding: "12px 16px",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
          }}
        >
          <div
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "#0f172a",
              marginBottom: "4px",
              fontFamily: "Arial, Helvetica, sans-serif",
            }}
          >
            {encode(p.title ?? "Video")}
          </div>
          <Link
            href={p.src ?? "#"}
            style={{
              fontSize: "13px",
              color: "#2563eb",
              textDecoration: "underline",
              fontFamily: "Arial, Helvetica, sans-serif",
            }}
          >
            ▶ Open Video
          </Link>
        </td>
      </tr>
    </tbody>
  </table>
);

export const EventEmail = (p: EventProps) => {
  const from = eventDateParts(p.from);
  const to = eventDateParts(p.to);
  const hasTo = (p.to ?? "").trim().length > 0;
  return (
    <table
      role="presentation"
      cellPadding={0}
      cellSpacing={0}
      border={0}
      width="100%"
      style={{ borderCollapse: "collapse" }}
    >
      <tbody>
        <tr>
          <td
            valign="top"
            style={{
              width: "34%",
              background: p.dateBackground ?? "#f1f5f9",
              color: p.dateColor ?? "#0f172a",
              borderRadius: "8px",
              padding: "10px",
              textAlign: "center",
              border: "1px solid #e2e8f0",
            }}
          >
            <div style={{ fontSize: "10px", letterSpacing: "0.08em", fontFamily: "Arial, Helvetica, sans-serif" }}>
              {encode(from.month)}
            </div>
            <div style={{ fontSize: "38px", lineHeight: "1", fontWeight: 700, fontFamily: "Arial, Helvetica, sans-serif" }}>
              {encode(from.day)}
            </div>
            <div style={{ fontSize: "11px", fontFamily: "Arial, Helvetica, sans-serif" }}>{encode(from.year)}</div>
            {hasTo ? (
              <div style={{ marginTop: "6px", fontSize: "10px", fontFamily: "Arial, Helvetica, sans-serif" }}>
                {encode(`to ${to.raw || p.to || ""}`)}
              </div>
            ) : null}
          </td>
          <td style={{ width: "66%", paddingLeft: "12px", verticalAlign: "top" }}>
            <div style={{ fontSize: "18px", fontWeight: 700, color: "#0f172a", marginBottom: "6px", fontFamily: "Arial, Helvetica, sans-serif" }}>
              {encode(p.title ?? "Event title")}
            </div>
            <div style={{ fontSize: "14px", lineHeight: "1.45", color: "#475569", fontFamily: "Arial, Helvetica, sans-serif" }}>
              {encode(p.text ?? "Event description paragraph")}
            </div>
            {(p.offerId || p.price || (p.showCta !== false && p.checkoutUrl)) ? (
              <div style={{ marginTop: "10px" }}>
                {p.offerId ? (
                  <div
                    style={{
                      marginBottom: "6px",
                      fontSize: "11px",
                      color: "#64748b",
                      fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                    }}
                  >
                    {encode(p.offerId)}
                  </div>
                ) : null}
                {p.price ? (
                  <div
                    style={{
                      marginBottom: "8px",
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "#0f172a",
                      fontFamily: "Arial, Helvetica, sans-serif",
                    }}
                  >
                    {encode(`${p.currency ?? "$"}${p.price}`)}
                  </div>
                ) : null}
                {p.showCta !== false && p.checkoutUrl ? (
                  <Link
                    href={p.checkoutUrl}
                    style={{
                      display: "inline-block",
                      borderRadius: "9999px",
                      border: "1px solid #cbd5e1",
                      background: p.ctaBackground ?? "#2563eb",
                      color: p.ctaColor ?? "#ffffff",
                      textDecoration: "none",
                      fontSize: "12px",
                      fontWeight: 700,
                      fontFamily: "Arial, Helvetica, sans-serif",
                      padding: "8px 12px",
                    }}
                  >
                    {encode((p.ctaText || "Reserve Spot").trim())}
                  </Link>
                ) : null}
              </div>
            ) : null}
          </td>
        </tr>
      </tbody>
    </table>
  );
};

export const AuthorEmail = (p: AuthorProps) => (
  <table
    role="presentation"
    cellPadding={0}
    cellSpacing={0}
    border={0}
    style={{ borderCollapse: "collapse" }}
  >
    <tbody>
      <tr>
        <td style={{ paddingRight: "8px", verticalAlign: "middle" }}>
          <Img
            src={p.avatar ?? ""}
            alt={encode(p.name ?? "")}
            width={(p.avatarSize ?? "32px").replace("px", "")}
            height={(p.avatarSize ?? "32px").replace("px", "")}
            style={{
              borderRadius: "9999px",
              display: "block",
            }}
          />
        </td>
        <td style={{ verticalAlign: "middle" }}>
          <div
            style={{
              fontSize: "14px",
              fontWeight: 600,
              color: "#0f172a",
              fontFamily: "Arial, Helvetica, sans-serif",
            }}
          >
            {encode(p.name ?? "")}
          </div>
          {p.showEmail !== false && p.email && (
            <Link
              href={`mailto:${p.email}`}
              style={{
                fontSize: "12px",
                color: "#64748b",
                textDecoration: "none",
                fontFamily: "Arial, Helvetica, sans-serif",
              }}
            >
              {encode(p.email)}
            </Link>
          )}
        </td>
      </tr>
    </tbody>
  </table>
);
