"use client";

import React from "react";
import { useNode } from "@craftjs/core";
import {
  TextField,
  TextAreaField,
  BooleanField,
  RemSliderField,
  ColorField,
  BackgroundField,
  FieldStack,
} from "@/components/editor/fields";

type SubmitState =
  | { kind: "idle"; message: "" }
  | { kind: "success"; message: string }
  | { kind: "error"; message: string };

export type ContactFormProps = {
  action?: string;
  triggerText?: string;
  title?: string;
  description?: string;
  nameLabel?: string;
  namePlaceholder?: string;
  emailLabel?: string;
  emailPlaceholder?: string;
  messageLabel?: string;
  messagePlaceholder?: string;
  submitText?: string;
  cancelText?: string;
  lockedEmailHint?: string;
  prefillEmailFromSession?: boolean;
  buttonBackground?: string;
  buttonColor?: string;
  buttonBorderColor?: string;
  buttonBorderRadius?: string;
  buttonPaddingX?: string;
  buttonPaddingY?: string;
  overlayBackground?: string;
  modalBackground?: string;
  modalBorderColor?: string;
  modalBorderRadius?: string;
  fieldBackground?: string;
  fieldColor?: string;
  fieldBorderColor?: string;
  fieldBorderRadius?: string;
  fieldPadding?: string;
};

function readEmailFromSessionPayload(payload: unknown): string {
  if (!payload || typeof payload !== "object") return "";
  const record = payload as Record<string, unknown>;
  const sessionRaw =
    record.session && typeof record.session === "object"
      ? (record.session as Record<string, unknown>)
      : null;
  if (!sessionRaw) return "";

  const nestedUser =
    sessionRaw.user && typeof sessionRaw.user === "object"
      ? (sessionRaw.user as Record<string, unknown>)
      : null;
  if (nestedUser && typeof nestedUser.email === "string") {
    return nestedUser.email.trim().toLowerCase();
  }
  if (typeof sessionRaw.email === "string") {
    return sessionRaw.email.trim().toLowerCase();
  }
  return "";
}

export const ContactForm = ({
  action = "/api/contact",
  triggerText = "Contact",
  title = "Get in touch",
  description = "Send a short note and we will get back to you.",
  nameLabel = "Name",
  namePlaceholder = "Your name",
  emailLabel = "Email",
  emailPlaceholder = "you@example.com",
  messageLabel = "Notes",
  messagePlaceholder = "Tell us what you need help with",
  submitText = "Send",
  cancelText = "Cancel",
  lockedEmailHint = "Email is locked to your logged-in account.",
  prefillEmailFromSession = true,
  buttonBackground = "var(--color-primary)",
  buttonColor = "var(--color-primary-foreground)",
  buttonBorderColor = "var(--color-primary)",
  buttonBorderRadius = "var(--radius-md)",
  buttonPaddingX = "var(--space-md)",
  buttonPaddingY = "var(--space-sm)",
  overlayBackground = "rgba(2, 6, 23, 0.56)",
  modalBackground = "var(--color-surface)",
  modalBorderColor = "var(--color-border)",
  modalBorderRadius = "var(--radius-lg)",
  fieldBackground = "var(--color-background)",
  fieldColor = "var(--color-foreground)",
  fieldBorderColor = "var(--color-border)",
  fieldBorderRadius = "var(--radius-sm)",
  fieldPadding = "var(--space-sm)",
}: ContactFormProps) => {
  const {
    connectors: { connect, drag },
  } = useNode();

  const [open, setOpen] = React.useState(false);
  const [loadingSession, setLoadingSession] = React.useState(false);
  const [lockedEmail, setLockedEmail] = React.useState("");
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [submitState, setSubmitState] = React.useState<SubmitState>({
    kind: "idle",
    message: "",
  });

  const resolvedEmail = lockedEmail || email;
  const emailLocked = lockedEmail.length > 0;

  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  React.useEffect(() => {
    if (!open || !prefillEmailFromSession) return;
    if (lockedEmail) return;
    let cancelled = false;
    setLoadingSession(true);
    fetch("/api/auth/session", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return null;
        try {
          return await response.json();
        } catch {
          return null;
        }
      })
      .then((payload) => {
        if (cancelled || !payload) return;
        const nextEmail = readEmailFromSessionPayload(payload);
        if (!nextEmail) return;
        setLockedEmail(nextEmail);
        setEmail(nextEmail);
      })
      .catch(() => {
        // Session prefill is optional; ignore network/session errors.
      })
      .finally(() => {
        if (!cancelled) setLoadingSession(false);
      });
    return () => {
      cancelled = true;
    };
  }, [lockedEmail, open, prefillEmailFromSession]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const safeName = name.trim();
    const safeEmail = resolvedEmail.trim().toLowerCase();
    const safeMessage = message.trim();

    if (!safeName || !safeEmail || !safeMessage) {
      setSubmitState({
        kind: "error",
        message: "Name, email, and notes are required.",
      });
      return;
    }

    setSubmitting(true);
    setSubmitState({ kind: "idle", message: "" });

    const payload = new FormData();
    payload.set("name", safeName);
    payload.set("email", safeEmail);
    payload.set("message", safeMessage);

    try {
      const response = await fetch(action || "/api/contact", {
        method: "POST",
        body: payload,
      });

      let json: unknown = null;
      try {
        json = await response.json();
      } catch {
        json = null;
      }

      const body = json && typeof json === "object" ? (json as Record<string, unknown>) : {};
      const messageFromApi =
        typeof body.message === "string"
          ? body.message
          : typeof body.error === "string"
            ? body.error
            : "";

      if (response.ok && body.ok === true) {
        setSubmitState({
          kind: "success",
          message: messageFromApi || "Thanks, your message has been sent.",
        });
        setName("");
        setMessage("");
        if (!emailLocked) setEmail("");
      } else {
        setSubmitState({
          kind: "error",
          message: messageFromApi || "Could not send your message right now.",
        });
      }
    } catch {
      setSubmitState({
        kind: "error",
        message: "Network error while sending message.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      ref={(ref: HTMLDivElement | null) => {
        if (ref) connect(drag(ref));
      }}
      style={{ display: "inline-flex", flexDirection: "column", gap: "8px" }}
    >
      <button
        type="button"
        onClick={() => {
          setSubmitState({ kind: "idle", message: "" });
          setOpen(true);
        }}
        style={{
          border: `1px solid ${buttonBorderColor}`,
          borderRadius: buttonBorderRadius,
          background: buttonBackground,
          color: buttonColor,
          padding: `${buttonPaddingY} ${buttonPaddingX}`,
          fontFamily: "var(--font-default)",
          fontSize: "var(--text-sm)",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        {triggerText}
      </button>

      {open ? (
        <div
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1200,
            background: overlayBackground,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            style={{
              width: "min(100%, 540px)",
              maxHeight: "min(90vh, 760px)",
              overflowY: "auto",
              border: `1px solid ${modalBorderColor}`,
              borderRadius: modalBorderRadius,
              background: modalBackground,
              padding: "20px",
              boxShadow: "0 24px 48px -26px rgba(15, 23, 42, 0.65)",
              fontFamily: "var(--font-default)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "12px",
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: "var(--text-xl)",
                    fontWeight: 700,
                    color: "var(--color-foreground)",
                    lineHeight: 1.2,
                  }}
                >
                  {title}
                </div>
                <p
                  style={{
                    marginTop: "8px",
                    marginBottom: 0,
                    color: "var(--color-muted-foreground)",
                    fontSize: "var(--text-sm)",
                    lineHeight: 1.5,
                  }}
                >
                  {description}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close contact form"
                style={{
                  border: `1px solid ${modalBorderColor}`,
                  borderRadius: "9999px",
                  width: "28px",
                  height: "28px",
                  background: "var(--color-surface)",
                  color: "var(--color-muted-foreground)",
                  cursor: "pointer",
                  fontSize: "16px",
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>

            <form
              onSubmit={onSubmit}
              style={{
                marginTop: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ fontSize: "12px", color: "var(--color-muted-foreground)" }}>
                  {nameLabel}
                </span>
                <input
                  type="text"
                  name="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder={namePlaceholder}
                  required
                  style={{
                    width: "100%",
                    padding: fieldPadding,
                    border: `1px solid ${fieldBorderColor}`,
                    borderRadius: fieldBorderRadius,
                    background: fieldBackground,
                    color: fieldColor,
                    fontFamily: "var(--font-default)",
                    fontSize: "var(--text-sm)",
                  }}
                />
              </label>

              <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ fontSize: "12px", color: "var(--color-muted-foreground)" }}>
                  {emailLabel}
                </span>
                <input
                  type="email"
                  name="email"
                  value={resolvedEmail}
                  onChange={(event) => {
                    if (!emailLocked) setEmail(event.target.value);
                  }}
                  placeholder={emailPlaceholder}
                  readOnly={emailLocked}
                  required
                  style={{
                    width: "100%",
                    padding: fieldPadding,
                    border: `1px solid ${fieldBorderColor}`,
                    borderRadius: fieldBorderRadius,
                    background: emailLocked ? "var(--color-muted)" : fieldBackground,
                    color: emailLocked ? "var(--color-muted-foreground)" : fieldColor,
                    fontFamily: "var(--font-default)",
                    fontSize: "var(--text-sm)",
                    cursor: emailLocked ? "not-allowed" : "text",
                  }}
                />
                {emailLocked ? (
                  <span style={{ fontSize: "11px", color: "var(--color-muted-foreground)" }}>
                    {lockedEmailHint}
                  </span>
                ) : null}
                {!emailLocked && loadingSession ? (
                  <span style={{ fontSize: "11px", color: "var(--color-muted-foreground)" }}>
                    Checking session for email...
                  </span>
                ) : null}
              </label>

              <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ fontSize: "12px", color: "var(--color-muted-foreground)" }}>
                  {messageLabel}
                </span>
                <textarea
                  name="message"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder={messagePlaceholder}
                  required
                  rows={6}
                  style={{
                    width: "100%",
                    padding: fieldPadding,
                    border: `1px solid ${fieldBorderColor}`,
                    borderRadius: fieldBorderRadius,
                    background: fieldBackground,
                    color: fieldColor,
                    fontFamily: "var(--font-default)",
                    fontSize: "var(--text-sm)",
                    resize: "vertical",
                  }}
                />
              </label>

              {submitState.kind !== "idle" ? (
                <div
                  style={{
                    border: "1px solid",
                    borderColor:
                      submitState.kind === "success" ? "var(--color-success)" : "var(--color-danger)",
                    borderRadius: "var(--radius-sm)",
                    padding: "8px 10px",
                    fontSize: "12px",
                    background:
                      submitState.kind === "success"
                        ? "color-mix(in srgb, var(--color-success) 14%, transparent)"
                        : "color-mix(in srgb, var(--color-danger) 10%, transparent)",
                    color: submitState.kind === "success" ? "var(--color-success)" : "var(--color-danger)",
                  }}
                >
                  {submitState.message}
                </div>
              ) : null}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  style={{
                    border: `1px solid ${modalBorderColor}`,
                    borderRadius: "var(--radius-sm)",
                    background: "var(--color-surface)",
                    color: "var(--color-foreground)",
                    padding: "8px 12px",
                    fontFamily: "var(--font-default)",
                    fontSize: "var(--text-sm)",
                    cursor: "pointer",
                  }}
                >
                  {cancelText}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    border: `1px solid ${buttonBorderColor}`,
                    borderRadius: "var(--radius-sm)",
                    background: buttonBackground,
                    color: buttonColor,
                    padding: "8px 12px",
                    fontFamily: "var(--font-default)",
                    fontSize: "var(--text-sm)",
                    fontWeight: 600,
                    cursor: submitting ? "progress" : "pointer",
                    opacity: submitting ? 0.85 : 1,
                  }}
                >
                  {submitting ? "Sending..." : submitText}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
};

const ContactFormSettings = () => (
  <FieldStack>
    <TextField label="Action URL" propKey="action" placeholder="/api/contact" />
    <BooleanField label="Prefill email from session" propKey="prefillEmailFromSession" />
    <TextField label="Trigger button" propKey="triggerText" />
    <TextField label="Modal title" propKey="title" />
    <TextAreaField label="Modal description" propKey="description" rows={2} />
    <TextField label="Name label" propKey="nameLabel" />
    <TextField label="Name placeholder" propKey="namePlaceholder" />
    <TextField label="Email label" propKey="emailLabel" />
    <TextField label="Email placeholder" propKey="emailPlaceholder" />
    <TextField label="Locked email hint" propKey="lockedEmailHint" />
    <TextField label="Notes label" propKey="messageLabel" />
    <TextAreaField label="Notes placeholder" propKey="messagePlaceholder" rows={2} />
    <TextField label="Submit button text" propKey="submitText" />
    <TextField label="Cancel button text" propKey="cancelText" />
    <RemSliderField label="Button horizontal padding" propKey="buttonPaddingX" min={0} max={6} step={0.25} fallback={1} />
    <RemSliderField label="Button vertical padding" propKey="buttonPaddingY" min={0} max={3} step={0.25} fallback={0.5} />
    <RemSliderField label="Button radius" propKey="buttonBorderRadius" min={0} max={3} step={0.125} fallback={0.5} />
    <ColorField label="Button background" propKey="buttonBackground" />
    <ColorField label="Button text color" propKey="buttonColor" />
    <ColorField label="Button border color" propKey="buttonBorderColor" />
    <ColorField label="Overlay background" propKey="overlayBackground" />
    <BackgroundField label="Modal background" propKey="modalBackground" />
    <ColorField label="Modal border color" propKey="modalBorderColor" />
    <RemSliderField label="Modal radius" propKey="modalBorderRadius" min={0} max={4} step={0.125} fallback={0.75} />
    <BackgroundField label="Field background" propKey="fieldBackground" />
    <ColorField label="Field text color" propKey="fieldColor" />
    <ColorField label="Field border color" propKey="fieldBorderColor" />
    <RemSliderField label="Field radius" propKey="fieldBorderRadius" min={0} max={2} step={0.125} fallback={0.25} />
    <RemSliderField label="Field padding" propKey="fieldPadding" min={0} max={2} step={0.125} fallback={0.5} />
  </FieldStack>
);

ContactForm.craft = {
  displayName: "ContactForm",
  props: {
    action: "/api/contact",
    triggerText: "Contact",
    title: "Get in touch",
    description: "Send a short note and we will get back to you.",
    nameLabel: "Name",
    namePlaceholder: "Your name",
    emailLabel: "Email",
    emailPlaceholder: "you@example.com",
    messageLabel: "Notes",
    messagePlaceholder: "Tell us what you need help with",
    submitText: "Send",
    cancelText: "Cancel",
    lockedEmailHint: "Email is locked to your logged-in account.",
    prefillEmailFromSession: true,
    buttonBackground: "var(--color-primary)",
    buttonColor: "var(--color-primary-foreground)",
    buttonBorderColor: "var(--color-primary)",
    buttonBorderRadius: "var(--radius-md)",
    buttonPaddingX: "var(--space-md)",
    buttonPaddingY: "var(--space-sm)",
    overlayBackground: "rgba(2, 6, 23, 0.56)",
    modalBackground: "var(--color-surface)",
    modalBorderColor: "var(--color-border)",
    modalBorderRadius: "var(--radius-lg)",
    fieldBackground: "var(--color-background)",
    fieldColor: "var(--color-foreground)",
    fieldBorderColor: "var(--color-border)",
    fieldBorderRadius: "var(--radius-sm)",
    fieldPadding: "var(--space-sm)",
  },
  related: { settings: ContactFormSettings },
};
