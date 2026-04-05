"use client";
import React from "react";
import { useNode } from "@craftjs/core";

const labelCls = "block space-y-1";
const spanCls  = "text-xs text-[var(--color-muted-foreground)]";
const inputCls =
  "w-full border border-[var(--color-border)] rounded px-2 py-1 text-sm " +
  "bg-[var(--color-muted)] text-[var(--color-foreground)] " +
  "focus:outline-none focus:border-[var(--color-primary)]";
const rangeCls =
  "w-full accent-[var(--color-primary)]";

type Parse<T> = (raw: string) => T;

function useProp<T>(propKey: string) {
  const {
    value,
    actions: { setProp },
  } = useNode((node) => ({
    value: (node.data.props as Record<string, unknown>)[propKey] as T,
  }));
  const set = (next: T) =>
    setProp((p: Record<string, unknown>) => {
      p[propKey] = next;
    });
  return [value, set] as const;
}

export function TextField({
  label,
  propKey,
  placeholder,
}: {
  label: string;
  propKey: string;
  placeholder?: string;
}) {
  const [value, set] = useProp<string>(propKey);
  return (
    <label className={labelCls}>
      <span className={spanCls}>{label}</span>
      <input
        type="text"
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) => set(e.target.value)}
        className={inputCls}
      />
    </label>
  );
}

type ScalarSliderFieldProps = {
  label: string;
  propKey: string;
  min: number;
  max: number;
  step: number;
  fallback: number;
  unit?: "rem" | "px" | "%" | "";
};

function parseNumber(raw: unknown): number | null {
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw !== "string") return null;
  const match = raw.trim().match(/-?\d+(?:\.\d+)?/);
  if (!match) return null;
  const parsed = Number(match[0]);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseScalarForUnit(
  raw: unknown,
  unit: ScalarSliderFieldProps["unit"],
  fallback: number,
): number {
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw !== "string") return fallback;
  const input = raw.trim().toLowerCase();
  const parsed = parseNumber(input);
  if (parsed == null) return fallback;

  if (unit === "rem") {
    if (input.includes("px")) return parsed / 16;
    return parsed;
  }
  if (unit === "px") {
    if (input.includes("rem")) return parsed * 16;
    return parsed;
  }
  return parsed;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function formatNumber(value: number): string {
  const fixed = Number(value.toFixed(4));
  return Number.isInteger(fixed) ? String(fixed) : String(fixed);
}

function formatValue(value: number, unit: ScalarSliderFieldProps["unit"]): string {
  const n = formatNumber(value);
  return unit ? `${n}${unit}` : n;
}

export function ScalarSliderField({
  label,
  propKey,
  min,
  max,
  step,
  fallback,
  unit = "",
}: ScalarSliderFieldProps) {
  const [value, set] = useProp<string | number>(propKey);
  const numeric = clamp(parseScalarForUnit(value, unit, fallback), min, max);
  const onChange = (nextRaw: string) => {
    const parsed = Number(nextRaw);
    if (!Number.isFinite(parsed)) return;
    const next = clamp(parsed, min, max);
    set(formatValue(next, unit));
  };

  return (
    <label className={labelCls}>
      <span className={spanCls}>
        {label} <code className="text-[10px]">{formatValue(numeric, unit)}</code>
      </span>
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={numeric}
          onChange={(e) => onChange(e.target.value)}
          className={rangeCls}
        />
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={numeric}
          onChange={(e) => onChange(e.target.value)}
          className="w-20 border border-[var(--color-border)] rounded px-2 py-1 text-xs bg-[var(--color-muted)] text-[var(--color-foreground)]"
        />
      </div>
    </label>
  );
}

export function RemSliderField(
  props: Omit<ScalarSliderFieldProps, "unit">,
) {
  return <ScalarSliderField {...props} unit="rem" />;
}

export function PxSliderField(
  props: Omit<ScalarSliderFieldProps, "unit">,
) {
  return <ScalarSliderField {...props} unit="px" />;
}

export function PercentSliderField(
  props: Omit<ScalarSliderFieldProps, "unit">,
) {
  return <ScalarSliderField {...props} unit="%" />;
}

export function UnitlessSliderField(
  props: Omit<ScalarSliderFieldProps, "unit">,
) {
  return <ScalarSliderField {...props} unit="" />;
}

export function TextAreaField({
  label,
  propKey,
  rows = 3,
}: {
  label: string;
  propKey: string;
  rows?: number;
}) {
  const [value, set] = useProp<string>(propKey);
  return (
    <label className={labelCls}>
      <span className={spanCls}>{label}</span>
      <textarea
        value={value ?? ""}
        rows={rows}
        onChange={(e) => set(e.target.value)}
        className={inputCls}
      />
    </label>
  );
}

export function ColorField({
  label,
  propKey,
}: {
  label: string;
  propKey: string;
}) {
  const [value, set] = useProp<string>(propKey);
  return (
    <label className={labelCls}>
      <span className={spanCls}>{label}</span>
      <div className="flex gap-2 items-center">
        <input
          type="text"
          value={value ?? ""}
          onChange={(e) => set(e.target.value)}
          className={inputCls}
        />
        <input
          type="color"
          value={/^#([0-9a-f]{6}|[0-9a-f]{3})$/i.test(value ?? "") ? value : "#000000"}
          onChange={(e) => set(e.target.value)}
          className="w-8 h-8 border border-[var(--color-border)] rounded cursor-pointer"
        />
      </div>
    </label>
  );
}

export function BooleanField({
  label,
  propKey,
}: {
  label: string;
  propKey: string;
}) {
  const [value, set] = useProp<boolean>(propKey);
  return (
    <label className="flex items-center gap-2 text-sm text-[var(--color-foreground)]">
      <input
        type="checkbox"
        checked={!!value}
        onChange={(e) => set(e.target.checked)}
      />
      {label}
    </label>
  );
}

export function SelectField<T extends string | number>({
  label,
  propKey,
  options,
  parse,
}: {
  label: string;
  propKey: string;
  options: ReadonlyArray<{ label: string; value: T } | T>;
  parse?: Parse<T>;
}) {
  const [value, set] = useProp<T>(propKey);
  const opts = options.map((o) =>
    typeof o === "object" ? o : { label: String(o), value: o }
  );
  return (
    <label className={labelCls}>
      <span className={spanCls}>{label}</span>
      <select
        value={String(value ?? "")}
        onChange={(e) => set(parse ? parse(e.target.value) : (e.target.value as T))}
        className={inputCls}
      >
        {opts.map((o) => (
          <option key={String(o.value)} value={String(o.value)}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export const AlignField = ({ propKey = "textAlign", label = "Align" }) => (
  <SelectField
    label={label}
    propKey={propKey}
    options={["left", "center", "right"] as const}
  />
);

export const FieldStack = ({ children }: { children: React.ReactNode }) => (
  <div className="space-y-3">{children}</div>
);
