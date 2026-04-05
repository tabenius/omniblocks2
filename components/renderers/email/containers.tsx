import * as React from "react";
import { Section } from "@react-email/components";
import { encode } from "html-entities";
import type { ContainerProps } from "@/components/user/Container";
import type { TextBlockProps } from "@/components/user/TextBlock";
import type { HeroProps } from "@/components/user/Hero";
import type { PrimaryBoxProps } from "@/components/user/PrimaryBox";
import type { AssetProps } from "@/components/user/Asset";
import type { QuoteProps } from "@/components/user/Quote";
import type { FormProps } from "@/components/user/Form";

/**
 * Generic single-cell table wrapper. Outlook-safe fallback for div.
 */
const TableBox: React.FC<{
  background?: string;
  padding?: string;
  borderRadius?: string;
  color?: string;
  align?: "left" | "center" | "right";
  border?: string;
  children?: React.ReactNode;
}> = ({
  background = "transparent",
  padding = "0",
  borderRadius,
  color,
  align,
  border,
  children,
}) => (
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
          align={align}
          style={{
            background,
            padding,
            borderRadius,
            color,
            border,
          }}
        >
          {children}
        </td>
      </tr>
    </tbody>
  </table>
);

export const ContainerEmail = ({
  background,
  padding,
  children,
}: ContainerProps & { children?: React.ReactNode }) => (
  <TableBox background={background} padding={padding}>
    {children}
  </TableBox>
);

export const TextBlockEmail = ({
  background,
  padding,
  children,
}: TextBlockProps & { children?: React.ReactNode }) => (
  <TableBox background={background} padding={padding}>
    {children}
  </TableBox>
);

export const FormEmail = ({
  background,
  padding,
  borderRadius,
  borderColor,
  children,
}: FormProps & { children?: React.ReactNode }) => (
  <TableBox
    background={background}
    padding={padding}
    borderRadius={borderRadius}
    border={`1px solid ${borderColor ?? "var(--color-border)"}`}
  >
    {children}
  </TableBox>
);

export const HeroEmail = ({
  background,
  padding,
  textAlign,
  children,
}: HeroProps & { children?: React.ReactNode }) => (
  <TableBox background={background} padding={padding} align={textAlign}>
    {children}
  </TableBox>
);

export const PrimaryBoxEmail = ({
  background,
  padding,
  color,
  children,
}: PrimaryBoxProps & { children?: React.ReactNode }) => (
  <TableBox
    background={background}
    padding={padding}
    color={color}
    borderRadius="8px"
  >
    {children}
  </TableBox>
);

export const QuoteEmail = ({
  background,
  padding,
  accentColor,
  children,
}: QuoteProps & { children?: React.ReactNode }) => (
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
            width: "4px",
            background: accentColor ?? "#2563eb",
          }}
        />
        <td
          style={{
            background: background ?? "#f1f5f9",
            padding: padding ?? "20px 24px",
          }}
        >
          {children}
        </td>
      </tr>
    </tbody>
  </table>
);

export const AssetEmail = ({
  background,
  padding,
  borderRadius,
  price,
  currency,
  children,
}: AssetProps & { children?: React.ReactNode }) => (
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
            background: background ?? "#ffffff",
            padding: padding ?? "16px",
            borderRadius: borderRadius ?? "12px",
            border: "1px solid #e2e8f0",
          }}
        >
          {children}
          <Section style={{ paddingTop: "12px" }}>
            <div
              style={{
                textAlign: "right",
                fontSize: "16px",
                fontWeight: 700,
                color: "#0f172a",
                fontFamily: "Arial, Helvetica, sans-serif",
              }}
            >
              {encode((currency ?? "$") + (price ?? ""))}
            </div>
          </Section>
        </td>
      </tr>
    </tbody>
  </table>
);
