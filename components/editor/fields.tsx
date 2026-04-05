"use client";
import React from "react";
import { useNode } from "@craftjs/core";

const labelCls = "block space-y-1";
const spanCls = "text-xs text-gray-600";
const inputCls =
  "w-full border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:border-gray-400";

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
          className="w-8 h-8 border border-gray-200 rounded cursor-pointer"
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
    <label className="flex items-center gap-2 text-sm text-gray-700">
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
