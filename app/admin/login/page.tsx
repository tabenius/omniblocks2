"use client";

import React from "react";
import { useRouter } from "next/navigation";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sanitizeNextPath(input: string | null): string {
  if (!input) return "/";
  if (!input.startsWith("/")) return "/";
  if (input.startsWith("//")) return "/";
  return input;
}

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [nextPath, setNextPath] = React.useState("/");

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    setNextPath(sanitizeNextPath(params.get("next")));
  }, []);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!EMAIL_RE.test(normalizedEmail)) {
      setError("Enter a valid email.");
      return;
    }
    if (!password.trim()) {
      setError("Password is required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, password }),
      });
      const json = (await response.json()) as {
        ok?: boolean;
        error?: string;
      };
      if (!response.ok || !json?.ok) {
        setError(json?.error || "Sign-in failed.");
        return;
      }
      router.push(nextPath);
      router.refresh();
    } catch {
      setError("Sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--color-background)] p-6">
      <section className="w-full max-w-md rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6 space-y-5">
        <div>
          <h1 className="text-xl font-semibold text-[var(--color-foreground)]">Sign in</h1>
          <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
            Admin access unlocks contacts, saved pages, R2 image library, and email sending.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          <label className="block">
            <div className="mb-1 text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">
              Email
            </div>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded border border-[var(--color-border)] bg-[var(--color-muted)] px-3 py-2 text-sm"
              autoComplete="email"
              required
            />
          </label>

          <label className="block">
            <div className="mb-1 text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">
              Password
            </div>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded border border-[var(--color-border)] bg-[var(--color-muted)] px-3 py-2 text-sm"
              autoComplete="current-password"
              required
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-[var(--color-primary)] text-[var(--color-primary-foreground)] px-4 py-2 text-sm font-medium disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {error ? (
          <div className="text-sm text-[var(--color-danger)]">{error}</div>
        ) : null}
      </section>
    </main>
  );
}
