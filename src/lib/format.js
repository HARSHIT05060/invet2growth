// Formatting helpers. Dates always render in IST so server and client agree.

const TZ = "Asia/Kolkata";

const nf = new Intl.NumberFormat("en-IN");
const nf2 = new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** 4500000 → "₹45 Lakh", 32500000 → "₹3.25 Cr", 18000 → "₹18,000" */
export function inrShort(n) {
  if (n == null || Number.isNaN(n)) return "—";
  if (n >= 1e7) return `₹${trim(n / 1e7)} Cr`;
  if (n >= 1e5) return `₹${trim(n / 1e5)} Lakh`;
  return `₹${nf.format(Math.round(n))}`;
}

const trim = (x) => (Math.round(x * 100) / 100).toString();

export const inr = (n) => (n == null ? "—" : `₹${nf.format(Math.round(n))}`);
export const inr2 = (n) => (n == null ? "—" : `₹${nf2.format(n)}`);
export const num = (n) => (n == null ? "—" : nf.format(Math.round(n)));
export const num2 = (n) => (n == null ? "—" : nf2.format(n));

/** 1.2345 → "+1.23%" */
export const pct = (n) => (n == null ? "—" : `${n > 0 ? "+" : n < 0 ? "−" : ""}${Math.abs(n).toFixed(2)}%`);
export const signed = (n) => (n == null ? "—" : `${n > 0 ? "+" : n < 0 ? "−" : ""}${nf2.format(Math.abs(n))}`);

/** Volume / market cap in Indian units: 12,40,000 → "12.4 L", 3.2e7 → "3.2 Cr" */
export function compact(n) {
  if (n == null) return "—";
  if (n >= 1e7) return `${(n / 1e7).toFixed(2)} Cr`;
  if (n >= 1e5) return `${(n / 1e5).toFixed(2)} L`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)} K`;
  return String(Math.round(n));
}

export function date(iso, opts = { day: "numeric", month: "short", year: "numeric" }) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-IN", { timeZone: TZ, ...opts }).format(new Date(iso));
}

export const dateTime = (iso) =>
  date(iso, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true });

export const time = (iso) => date(iso, { hour: "2-digit", minute: "2-digit", hour12: true });

/** Relative time. Only call on the client (depends on the current time). */
export function ago(iso) {
  if (!iso) return "—";
  const s = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hr ago`;
  const d = Math.round(h / 24);
  if (d < 30) return `${d} day${d > 1 ? "s" : ""} ago`;
  return date(iso);
}

export const initials = (name = "") =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

export const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** Download rows as a CSV file in the browser. */
export function downloadCsv(filename, rows) {
  if (!rows.length) return;
  const cols = Object.keys(rows[0]);
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: filename });
  a.click();
  URL.revokeObjectURL(url);
}
