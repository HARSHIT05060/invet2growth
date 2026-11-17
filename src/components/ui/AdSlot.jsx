"use client";

// Renders the active ad campaign for a placement (managed in Admin → Advertisements).

import { useDb, useHydrated, setState } from "@/lib/db/store";

export default function AdSlot({ placement, className = "" }) {
  const hydrated = useHydrated();
  const today = new Date().toISOString().slice(0, 10);
  const ad = useDb((s) => s.ads.find((a) => a.placement === placement && a.status === "active" && a.startsAt <= today && a.endsAt >= today), [placement, today]);
  if (!hydrated || !ad) return null;
  const external = /^https?:\/\//.test(ad.url);
  return (
    <aside className={`adslot adslot--${placement} ${className}`} aria-label="Sponsored">
      <span className="adslot__label">Sponsored</span>
      <a
        href={ad.url}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer sponsored" : undefined}
        onClick={() => setState((s) => ({ ads: s.ads.map((x) => (x.id === ad.id ? { ...x, clicks: x.clicks + 1 } : x)) }))}
      >
        <img src={ad.image} alt="" />
        <span className="adslot__text">
          <strong>{ad.name}</strong>
          <small>{ad.advertiser}</small>
        </span>
      </a>
    </aside>
  );
}
