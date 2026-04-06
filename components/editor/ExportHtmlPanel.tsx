"use client";
import React from "react";
import { useEditor } from "@craftjs/core";
import { serializeToBlockLanguage } from "@/lib/blockSerializer";
import { buildStaticHtmlDocument } from "@/lib/htmlExport";
import { sanitizeExportName } from "@/lib/emailAddress";
import { walkEmail } from "@/lib/emailWalker";
import { EmailDocument } from "@/components/renderers/email/EmailDocument";
import { jsonErrorMessage, safeJsonResponse } from "@/lib/safeJson";

type SendMode = "attach-web-html" | "attach-sources" | "inline-email-html";

type ExportHtmlPanelProps = {
  filenameBase?: string;
  themeVariables?: Record<string, string>;
  showExportsSection?: boolean;
  showSendSection?: boolean;
};

function downloadText(filename: string, text: string, mimeType = "text/plain;charset=utf-8") {
  const blob = new Blob([text], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export const ExportHtmlPanel = ({
  filenameBase = "document",
  themeVariables = {},
  showExportsSection = true,
  showSendSection = true,
}: ExportHtmlPanelProps) => {
  const { query } = useEditor();
  const [status, setStatus] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [fromAddresses, setFromAddresses] = React.useState<string[]>([]);
  const [from, setFrom] = React.useState("");
  const [to, setTo] = React.useState("");
  const [cc, setCc] = React.useState("");
  const [bcc, setBcc] = React.useState("");
  const [subject, setSubject] = React.useState("OmniBlocks export");
  const [mode, setMode] = React.useState<SendMode>("attach-web-html");
  const [textBody, setTextBody] = React.useState("");

  const safeBaseName = React.useMemo(
    () => sanitizeExportName(filenameBase, "document"),
    [filenameBase],
  );

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch("/api/email/send", { cache: "no-store" });
        if (!response.ok) return;
        const json = await safeJsonResponse<{ fromAddresses?: string[] }>(response);
        const nextFrom = Array.isArray(json?.fromAddresses) ? json.fromAddresses : [];
        if (cancelled) return;
        setFromAddresses(nextFrom);
        if (nextFrom.length > 0) setFrom(nextFrom[0]);
      } catch {
        if (!cancelled) setStatus("Email sender config could not be loaded.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const buildWebHtml = React.useCallback(() => {
    return buildStaticHtmlDocument(query.getSerializedNodes(), {
      title: safeBaseName,
      themeVariables,
    });
  }, [query, safeBaseName, themeVariables]);

  const buildEmailHtml = React.useCallback(async () => {
    const serialized = query.getSerializedNodes();
    const tree = walkEmail(serialized, "ROOT", themeVariables);
    const { render } = await import("@react-email/render");
    return render(<EmailDocument preview={subject}>{tree}</EmailDocument>);
  }, [query, subject, themeVariables]);

  const copyStaticHtml = async () => {
    try {
      await navigator.clipboard.writeText(buildWebHtml());
      setStatus("Static HTML copied.");
    } catch {
      setStatus("Copy failed.");
    }
  };

  const downloadStaticHtml = () => {
    downloadText(`${safeBaseName}.html`, buildWebHtml(), "text/html;charset=utf-8");
    setStatus("Static HTML downloaded.");
  };

  const copyEmailHtml = async () => {
    try {
      const html = await buildEmailHtml();
      await navigator.clipboard.writeText(html);
      setStatus("Email HTML copied.");
    } catch {
      setStatus("Email HTML copy failed.");
    }
  };

  const downloadEmailHtml = async () => {
    try {
      const html = await buildEmailHtml();
      downloadText(`${safeBaseName}.email.html`, html, "text/html;charset=utf-8");
      setStatus("Email HTML downloaded.");
    } catch {
      setStatus("Email HTML download failed.");
    }
  };

  const send = async () => {
    setBusy(true);
    setStatus("Sending...");
    try {
      const nodes = query.getSerializedNodes();
      const webHtml = buildWebHtml();
      const emailHtml = await buildEmailHtml();
      const craftJson = JSON.stringify(nodes, null, 2);
      const blockSource = serializeToBlockLanguage(nodes);

      const response = await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from,
          to,
          cc,
          bcc,
          subject,
          mode,
          textBody,
          filenameBase: safeBaseName,
          webHtml,
          emailHtml,
          craftJson,
          blockSource,
        }),
      });

      const data = await safeJsonResponse<{ error?: string }>(response);
      if (!response.ok) {
        setStatus(jsonErrorMessage(data, `Send failed (${response.status}).`));
        return;
      }
      setStatus("Email queued via Resend.");
    } catch {
      setStatus("Send failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      {showExportsSection ? (
        <>
          <h3 className="text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">
            Exports
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={copyStaticHtml}
              className="px-2 py-2 text-xs rounded border border-[var(--color-border)] bg-[var(--color-secondary)] hover:bg-[var(--color-surface)]"
            >
              Copy Static HTML
            </button>
            <button
              onClick={downloadStaticHtml}
              className="px-2 py-2 text-xs rounded border border-[var(--color-border)] bg-[var(--color-secondary)] hover:bg-[var(--color-surface)]"
            >
              Download Static
            </button>
            <button
              onClick={copyEmailHtml}
              className="px-2 py-2 text-xs rounded border border-[var(--color-border)] bg-[var(--color-secondary)] hover:bg-[var(--color-surface)]"
            >
              Copy Email HTML
            </button>
            <button
              onClick={downloadEmailHtml}
              className="px-2 py-2 text-xs rounded border border-[var(--color-border)] bg-[var(--color-secondary)] hover:bg-[var(--color-surface)]"
            >
              Download Email
            </button>
          </div>
        </>
      ) : null}

      {showSendSection ? (
        <>
          <h3 className="text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">
            Send Email
          </h3>
          <div className="space-y-2 text-xs">
            <label className="block">
              <div className="mb-1 text-[var(--color-muted-foreground)]">From</div>
              <select
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1.5"
              >
                {fromAddresses.length === 0 ? (
                  <option value="">No from-address configured</option>
                ) : (
                  fromAddresses.map((address) => (
                    <option key={address} value={address}>
                      {address}
                    </option>
                  ))
                )}
              </select>
            </label>
            <label className="block">
              <div className="mb-1 text-[var(--color-muted-foreground)]">To (comma-separated)</div>
              <input
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1.5"
                placeholder="to@example.com, second@example.com"
              />
            </label>
            <label className="block">
              <div className="mb-1 text-[var(--color-muted-foreground)]">CC</div>
              <input
                value={cc}
                onChange={(e) => setCc(e.target.value)}
                className="w-full rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1.5"
              />
            </label>
            <label className="block">
              <div className="mb-1 text-[var(--color-muted-foreground)]">BCC</div>
              <input
                value={bcc}
                onChange={(e) => setBcc(e.target.value)}
                className="w-full rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1.5"
              />
            </label>
            <label className="block">
              <div className="mb-1 text-[var(--color-muted-foreground)]">Subject</div>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1.5"
              />
            </label>
            <label className="block">
              <div className="mb-1 text-[var(--color-muted-foreground)]">Mode</div>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as SendMode)}
                className="w-full rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1.5"
              >
                <option value="attach-web-html">A1: Attach static web HTML</option>
                <option value="attach-sources">A2: Attach block source + Craft JSON (plain text)</option>
                <option value="inline-email-html">B: Send inline email HTML</option>
              </select>
            </label>
            <label className="block">
              <div className="mb-1 text-[var(--color-muted-foreground)]">Text Body (optional)</div>
              <textarea
                value={textBody}
                onChange={(e) => setTextBody(e.target.value)}
                rows={4}
                className="w-full rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1.5"
                placeholder="Plain-text body for attachment modes"
              />
            </label>
            <button
              onClick={send}
              disabled={busy || !from || fromAddresses.length === 0}
              className="w-full px-3 py-2 text-sm rounded bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:opacity-90 disabled:opacity-60"
            >
              {busy ? "Sending..." : "Send via Resend"}
            </button>
          </div>
        </>
      ) : null}

      <div className="text-[11px] text-[var(--color-muted-foreground)]">{status}</div>
    </div>
  );
};
