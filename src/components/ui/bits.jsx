"use client";

import Link from "next/link";
import { Share2, Inbox } from "lucide-react";
import { toast } from "@/components/ui/Toast";

/** Status pill: tone = good | warn | bad | info | neutral */
export function Status({ tone = "neutral", children }) {
  return <span className={`status status--${tone}`}>{children}</span>;
}

export function Empty({ icon: Icon = Inbox, title, text, action }) {
  return (
    <div className="empty">
      <span className="empty__icon">
        <Icon size={22} />
      </span>
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {action && (
        <div className="empty__action">
          {action.href ? (
            <Link href={action.href} className="btn btn--primary btn--sm">
              {action.label}
            </Link>
          ) : (
            <button type="button" className="btn btn--primary btn--sm" onClick={action.onClick}>
              {action.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/** Native share sheet where available, otherwise copies the link. */
export function ShareButton({ title, url, className = "btn btn--ghost btn--sm", label = "Share" }) {
  async function share() {
    const href = url ? new URL(url, window.location.origin).href : window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url: href });
        return;
      } catch (e) {
        if (e.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(href);
      toast("Link copied to clipboard");
    } catch {
      toast("Couldn't copy the link", "error");
    }
  }
  return (
    <button type="button" className={className} onClick={share}>
      <Share2 size={16} /> {label}
    </button>
  );
}

export function Field({ label, hint, error, children, className = "" }) {
  return (
    <label className={`f ${className}`}>
      <span className="f__label">{label}</span>
      {children}
      {error ? <span className="f__error">{error}</span> : hint ? <span className="f__hint">{hint}</span> : null}
    </label>
  );
}

export function Toggle({ checked, onChange, label, description }) {
  return (
    <label className="toggle">
      <span className="toggle__text">
        <span className="toggle__label">{label}</span>
        {description && <span className="toggle__desc">{description}</span>}
      </span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="toggle__ui" aria-hidden="true" />
    </label>
  );
}

/** Up/down change text; never colour alone — always a sign and an arrow. */
export function Change({ value, pct, size = "md" }) {
  const v = value ?? pct;
  const dir = v > 0 ? "up" : v < 0 ? "down" : "flat";
  const arrow = dir === "up" ? "▲" : dir === "down" ? "▼" : "•";
  const fmt = (n) => (n == null ? "" : Math.abs(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  return (
    <span className={`chg chg--${dir} chg--${size}`}>
      <span aria-hidden="true">{arrow}</span>
      {value != null && (
        <span>
          {dir === "down" ? "−" : dir === "up" ? "+" : ""}
          {fmt(value)}
        </span>
      )}
      {pct != null && (
        <span>
          {value != null && "("}
          {dir === "down" ? "−" : dir === "up" ? "+" : ""}
          {fmt(pct)}%{value != null && ")"}
        </span>
      )}
    </span>
  );
}

export function Skeleton({ h = 16, w = "100%", r = 8 }) {
  return <span className="skel" style={{ height: h, width: w, borderRadius: r }} />;
}
