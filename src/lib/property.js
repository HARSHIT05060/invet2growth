// Property display helpers shared by the website and admin panel.

import { PROPERTY_CATEGORIES, AVAILABILITY } from "@/mock/catalog";
import { inrShort, inr } from "@/lib/format";

export const categoryLabel = (id, cats = PROPERTY_CATEGORIES) => cats.find((c) => c.id === id)?.label ?? id;

export const listingLabel = (t) => ({ sale: "For sale", rent: "For rent", lease: "For lease" })[t] ?? t;

export const availabilityLabel = (id) => AVAILABILITY.find((a) => a.id === id)?.label ?? id;

export function priceText(p) {
  if (p.listingType === "sale") return inrShort(p.price);
  return p.price >= 1e5 ? inrShort(p.price) : inr(p.price);
}

export const priceSuffix = (p) => (p.listingType === "sale" ? "" : p.category === "coworking" ? "/ seat / month" : "/ month");

/** The most meaningful area figure for a listing, as a number. */
export const mainArea = (p) => p.builtUpArea || p.carpetArea || p.plotArea || null;

export function pricePerSqft(p) {
  const a = mainArea(p);
  return p.listingType === "sale" && a ? Math.round(p.price / a) : null;
}

export function areaText(p) {
  const a = mainArea(p);
  if (!a) return null;
  if (!p.builtUpArea && !p.carpetArea && a >= 43560) return `${(a / 43560).toFixed(2).replace(/\.00$/, "")} acre`;
  return `${a.toLocaleString("en-IN")} sq.ft`;
}

export const bhk = (p) => (p.bedrooms ? `${p.bedrooms} BHK` : null);

export const STATUS_TONES = {
  active: "good",
  pending: "warn",
  draft: "neutral",
  rejected: "bad",
  sold: "info",
  rented: "info",
};

export const statusLabel = (s) =>
  ({ active: "Live", pending: "Pending review", draft: "Draft", rejected: "Rejected", sold: "Sold", rented: "Rented" })[s] ?? s;

/** Filter + sort used by the search page (and reusable by a future API). */
export function searchProperties(list, f) {
  const q = (f.q || "").trim().toLowerCase();
  let out = list.filter((p) => {
    if (f.type && p.listingType !== f.type) return false;
    if (f.segment && p.segment !== f.segment) return false;
    if (f.category && p.category !== f.category) return false;
    if (f.city && p.city !== f.city) return false;
    if (f.locality && p.locality !== f.locality) return false;
    if (f.min && p.price < Number(f.min)) return false;
    if (f.max && p.price > Number(f.max)) return false;
    if (f.minArea && (mainArea(p) ?? 0) < Number(f.minArea)) return false;
    if (f.maxArea && (mainArea(p) ?? Infinity) > Number(f.maxArea)) return false;
    if (f.beds) {
      const b = Number(f.beds);
      if (b >= 4 ? (p.bedrooms ?? 0) < 4 : p.bedrooms !== b) return false;
    }
    if (f.furnishing && p.furnishing !== f.furnishing) return false;
    if (f.availability && p.availability !== f.availability) return false;
    if (f.verified && !p.verified) return false;
    if (q && !`${p.title} ${p.locality} ${p.city} ${p.id}`.toLowerCase().includes(q)) return false;
    return true;
  });
  const sorters = {
    newest: (a, b) => new Date(b.postedAt) - new Date(a.postedAt),
    "price-asc": (a, b) => a.price - b.price,
    "price-desc": (a, b) => b.price - a.price,
    popular: (a, b) => b.views - a.views,
  };
  out = [...out].sort(sorters[f.sort] ?? sorters.newest);
  return out;
}

export function similarProperties(list, p, n = 3) {
  return list
    .filter((x) => x.id !== p.id)
    .map((x) => ({
      x,
      score: (x.category === p.category ? 3 : 0) + (x.city === p.city ? 2 : 0) + (x.listingType === p.listingType ? 2 : 0) + (x.segment === p.segment ? 1 : 0),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, n)
    .map((r) => r.x);
}
