"use client";
import React from "react";
import { useNode } from "@craftjs/core";
import {
  TextField,
  BooleanField,
  PxSliderField,
  FieldStack,
} from "@/components/editor/fields";

export type AuthorProps = {
  name?: string;
  avatar?: string;
  email?: string;
  showEmail?: boolean;
  avatarSize?: string;
};

export const Author = ({
  name = "Jane Doe",
  avatar = "https://placehold.co/64x64",
  email = "jane@example.com",
  showEmail = true,
  avatarSize = "32px",
}: AuthorProps) => {
  const {
    connectors: { connect, drag },
  } = useNode();

  return (
    <div
      ref={(ref: HTMLDivElement | null) => {
        if (ref) connect(drag(ref));
      }}
      style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={avatar}
        alt={name}
        style={{
          width: avatarSize,
          height: avatarSize,
          borderRadius: "9999px",
          objectFit: "cover",
          flexShrink: 0,
        }}
      />
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: "14px",
            fontWeight: 600,
            color: "var(--color-foreground)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {name}
        </div>
        {showEmail && (
          <a
            href={`mailto:${email}`}
            style={{
              fontSize: "12px",
              color: "var(--color-muted-foreground)",
              textDecoration: "none",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              display: "block",
            }}
          >
            {email}
          </a>
        )}
      </div>
    </div>
  );
};

const AuthorSettings = () => (
  <FieldStack>
    <TextField label="Name" propKey="name" />
    <TextField label="Avatar URL" propKey="avatar" />
    <TextField label="Email" propKey="email" />
    <PxSliderField label="Avatar size" propKey="avatarSize" min={16} max={192} step={2} fallback={32} />
    <BooleanField label="Show email" propKey="showEmail" />
  </FieldStack>
);

Author.craft = {
  displayName: "Author",
  props: {
    name: "Jane Doe",
    avatar: "https://placehold.co/64x64",
    email: "jane@example.com",
    showEmail: true,
    avatarSize: "32px",
  },
  related: { settings: AuthorSettings },
};
