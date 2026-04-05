import * as React from "react";
import type { LayoutBlockProps } from "@/components/user/LayoutBlock";
import type { MasonryProps } from "@/components/user/Masonry";

/**
 * Craft's LayoutBlock uses LinkedNodes — the Walker provides one child per
 * linked column slot (column-0 … column-N). We arrange them as table cells.
 */
export const LayoutBlockEmail = ({
  columns = 2,
  gap = "16px",
  padding = "16px",
  background = "transparent",
  children,
}: LayoutBlockProps & { children?: React.ReactNode }) => {
  const kids = React.Children.toArray(children);
  return (
    <table
      role="presentation"
      cellPadding={0}
      cellSpacing={0}
      border={0}
      width="100%"
      style={{ borderCollapse: "collapse", background }}
    >
      <tbody>
        <tr>
          {kids.map((child, i) => (
            <td
              key={i}
              valign="top"
              style={{
                width: `${100 / columns}%`,
                padding,
                paddingLeft: i === 0 ? padding : `calc(${gap} / 2)`,
                paddingRight:
                  i === kids.length - 1 ? padding : `calc(${gap} / 2)`,
              }}
            >
              {child}
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  );
};

/**
 * Email clients don't support CSS columns. We stack rows of N columns.
 */
export const MasonryEmail = ({
  columns = 3,
  gap = "12px",
  children,
}: MasonryProps & { children?: React.ReactNode }) => {
  const kids = React.Children.toArray(children);
  const rows: React.ReactNode[][] = [];
  for (let i = 0; i < kids.length; i += columns) {
    rows.push(kids.slice(i, i + columns));
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
        {rows.map((row, r) => (
          <tr key={r}>
            {row.map((child, c) => (
              <td
                key={c}
                valign="top"
                style={{
                  width: `${100 / columns}%`,
                  padding: `0 ${gap} ${gap} 0`,
                }}
              >
                {child}
              </td>
            ))}
            {Array.from({ length: columns - row.length }).map((_, k) => (
              <td key={`e${k}`} style={{ width: `${100 / columns}%` }} />
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
