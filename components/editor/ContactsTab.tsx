"use client";
import React from "react";

type Contact = {
  id: string;
  email: string;
  phone: string;
  name: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

type PurchasedProduct = {
  productId: string;
  title: string;
  grantedAt: string;
  currency: string;
  priceCents: number | null;
};

type DraftContact = {
  id: string;
  email: string;
  phone: string;
  name: string;
  notes: string;
};

const EMPTY_DRAFT: DraftContact = {
  id: "",
  email: "",
  phone: "",
  name: "",
  notes: "",
};

const CopyIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="14"
    height="14"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

function makeContactId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `contact-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function toDraft(contact: Contact): DraftContact {
  return {
    id: contact.id,
    email: contact.email,
    phone: contact.phone,
    name: contact.name,
    notes: contact.notes,
  };
}

function draftEqual(a: DraftContact, b: DraftContact): boolean {
  return (
    a.id === b.id &&
    a.email === b.email &&
    a.phone === b.phone &&
    a.name === b.name &&
    a.notes === b.notes
  );
}

type CopyInputProps = {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  onCopy: () => void;
};

const CopyInput = ({
  label,
  value,
  placeholder = "",
  onChange,
  onCopy,
}: CopyInputProps) => (
  <label className="block">
    <div className="mb-1 text-[11px] uppercase tracking-wide text-[var(--color-muted-foreground)]">
      {label}
    </div>
    <div className="relative">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1.5 pr-9 text-xs"
      />
      <button
        type="button"
        onClick={onCopy}
        className="absolute inset-y-0 right-0 w-8 inline-flex items-center justify-center text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
        title={`Copy ${label}`}
        aria-label={`Copy ${label}`}
      >
        <CopyIcon />
      </button>
    </div>
  </label>
);

export const ContactsTab = () => {
  const [contacts, setContacts] = React.useState<Contact[]>([]);
  const [status, setStatus] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<DraftContact>(EMPTY_DRAFT);
  const [original, setOriginal] = React.useState<DraftContact>(EMPTY_DRAFT);
  const [search, setSearch] = React.useState("");
  const [purchases, setPurchases] = React.useState<PurchasedProduct[]>([]);
  const [purchasesLoading, setPurchasesLoading] = React.useState(false);

  const loadContacts = React.useCallback(async () => {
    try {
      const response = await fetch("/api/contacts", { cache: "no-store" });
      const json = (await response.json()) as {
        contacts?: Contact[];
        error?: string;
      };
      if (!response.ok) {
        setStatus(json.error || "Failed to load contacts.");
        return;
      }
      setContacts(Array.isArray(json.contacts) ? json.contacts : []);
    } catch {
      setStatus("Failed to load contacts.");
    }
  }, []);

  React.useEffect(() => {
    void loadContacts();
  }, [loadContacts]);

  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        setStatus("Edit cancelled.");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const loadPurchases = React.useCallback(async (email: string) => {
    const safeEmail = email.trim().toLowerCase();
    if (!safeEmail) {
      setPurchases([]);
      return;
    }
    setPurchasesLoading(true);
    try {
      const response = await fetch(
        `/api/contacts?email=${encodeURIComponent(safeEmail)}`,
        { cache: "no-store" },
      );
      const json = (await response.json()) as {
        purchases?: PurchasedProduct[];
        error?: string;
      };
      if (!response.ok) {
        setStatus(json.error || "Failed to load purchased products.");
        setPurchases([]);
        return;
      }
      setPurchases(Array.isArray(json.purchases) ? json.purchases : []);
    } catch {
      setStatus("Failed to load purchased products.");
      setPurchases([]);
    } finally {
      setPurchasesLoading(false);
    }
  }, []);

  const openNew = () => {
    const newDraft = { ...EMPTY_DRAFT, id: makeContactId() };
    setDraft(newDraft);
    setOriginal(newDraft);
    setPurchases([]);
    setPurchasesLoading(false);
    setOpen(true);
    setStatus("");
  };

  const openExisting = (contact: Contact) => {
    const next = toDraft(contact);
    setDraft(next);
    setOriginal(next);
    void loadPurchases(contact.email);
    setOpen(true);
    setStatus("");
  };

  const onCopy = async (value: string, label: string) => {
    if (!value) {
      setStatus(`No ${label.toLowerCase()} to copy.`);
      return;
    }
    try {
      await navigator.clipboard.writeText(value);
      setStatus(`${label} copied.`);
    } catch {
      setStatus(`Copy ${label.toLowerCase()} failed.`);
    }
  };

  const save = async () => {
    setBusy(true);
    try {
      const response = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const json = (await response.json()) as { error?: string };
      if (!response.ok) {
        setStatus(json.error || "Failed to save contact.");
        return;
      }
      await loadContacts();
      setOpen(false);
      setStatus("Contact saved.");
    } catch {
      setStatus("Failed to save contact.");
    } finally {
      setBusy(false);
    }
  };

  const revert = () => {
    setDraft(original);
    setStatus("Reverted.");
  };

  const filteredContacts = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter((contact) => {
      return (
        contact.name.toLowerCase().includes(q) ||
        contact.email.toLowerCase().includes(q) ||
        contact.phone.toLowerCase().includes(q) ||
        contact.notes.toLowerCase().includes(q)
      );
    });
  }, [contacts, search]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">
          Contacts
        </h3>
        <button
          type="button"
          onClick={openNew}
          className="px-2 py-1.5 text-xs rounded border border-[var(--color-border)] bg-[var(--color-secondary)] hover:bg-[var(--color-surface)]"
        >
          New Contact
        </button>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search contacts (name, email, phone, notes)"
        className="w-full rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1.5 text-xs"
      />

      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
        {filteredContacts.length === 0 ? (
          <div className="text-xs text-[var(--color-muted-foreground)]">
            {contacts.length === 0 ? "No contacts found." : "No matching contacts."}
          </div>
        ) : (
          filteredContacts.map((contact) => (
            <button
              key={contact.id}
              type="button"
              onClick={() => openExisting(contact)}
              className="w-full text-left rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-2 hover:bg-[var(--color-secondary)]"
            >
              <div className="text-xs font-semibold text-[var(--color-foreground)]">
                {contact.name || "(no name)"}
              </div>
              <div className="text-[11px] text-[var(--color-muted-foreground)] truncate">
                {contact.email || "(no email)"}
              </div>
              <div className="text-[11px] text-[var(--color-muted-foreground)] truncate">
                {contact.phone || "(no phone)"}
              </div>
            </button>
          ))
        )}
      </div>

      <div className="text-[11px] text-[var(--color-muted-foreground)]">{status}</div>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-6"
          onClick={() => {
            setOpen(false);
            setStatus("Edit cancelled.");
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-xl rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)] p-4 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="text-sm font-semibold text-[var(--color-foreground)]">
              Contact
            </h4>

            <CopyInput
              label="Email"
              value={draft.email}
              placeholder="name@example.com"
              onChange={(value) => setDraft((prev) => ({ ...prev, email: value }))}
              onCopy={() => {
                void onCopy(draft.email, "Email");
              }}
            />
            <CopyInput
              label="Phone"
              value={draft.phone}
              placeholder="+1 555 123 1234"
              onChange={(value) => setDraft((prev) => ({ ...prev, phone: value }))}
              onCopy={() => {
                void onCopy(draft.phone, "Phone");
              }}
            />
            <CopyInput
              label="Name"
              value={draft.name}
              placeholder="Full name"
              onChange={(value) => setDraft((prev) => ({ ...prev, name: value }))}
              onCopy={() => {
                void onCopy(draft.name, "Name");
              }}
            />

            <label className="block">
              <div className="mb-1 text-[11px] uppercase tracking-wide text-[var(--color-muted-foreground)]">
                Notes
              </div>
              <textarea
                value={draft.notes}
                onChange={(e) => setDraft((prev) => ({ ...prev, notes: e.target.value }))}
                rows={5}
                className="w-full rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1.5 text-xs"
              />
            </label>

            <div className="rounded border border-[var(--color-border)] bg-[var(--color-surface)] p-2">
              <div className="mb-2 text-[11px] uppercase tracking-wide text-[var(--color-muted-foreground)]">
                Purchased Products
              </div>
              {purchasesLoading ? (
                <div className="text-xs text-[var(--color-muted-foreground)]">
                  Loading purchases...
                </div>
              ) : purchases.length === 0 ? (
                <div className="text-xs text-[var(--color-muted-foreground)]">
                  No purchases found for this contact.
                </div>
              ) : (
                <div className="space-y-1">
                  {purchases.map((product) => (
                    <div
                      key={`${product.productId}-${product.grantedAt}`}
                      className="rounded border border-[var(--color-border)] px-2 py-1.5"
                    >
                      <div className="text-xs font-medium text-[var(--color-foreground)]">
                        {product.title}
                      </div>
                      <div className="text-[11px] text-[var(--color-muted-foreground)]">
                        {product.productId}
                      </div>
                      <div className="text-[11px] text-[var(--color-muted-foreground)]">
                        {product.priceCents === null
                          ? "Price unavailable"
                          : `${product.currency || ""} ${(product.priceCents / 100).toFixed(2)}`}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  void save();
                }}
                disabled={busy}
                className="px-3 py-2 text-xs rounded bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:opacity-90 disabled:opacity-60"
              >
                Save
              </button>
              <button
                type="button"
                onClick={revert}
                disabled={busy || draftEqual(draft, original)}
                className="px-3 py-2 text-xs rounded border border-[var(--color-border)] bg-[var(--color-secondary)] hover:bg-[var(--color-surface)] disabled:opacity-60"
              >
                Revert
              </button>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setStatus("Edit cancelled.");
                }}
                disabled={busy}
                className="px-3 py-2 text-xs rounded border border-[var(--color-border)] bg-[var(--color-secondary)] hover:bg-[var(--color-surface)] disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
