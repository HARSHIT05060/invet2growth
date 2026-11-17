"use client";

import Link from "next/link";
import { MapPin, BedDouble, Ruler, Heart, ArrowUpRight, BadgeCheck, GitCompareArrows, Sofa, Hammer } from "lucide-react";
import { useDb, useHydrated, actions } from "@/lib/db/store";
import { priceText, priceSuffix, listingLabel, bhk, areaText, categoryLabel } from "@/lib/property";
import { toast } from "@/components/ui/Toast";

export default function PropertyCard({ p, i = 0, reveal = true, compact = false }) {
  const hydrated = useHydrated();
  const saved = useDb((s) => s.me.wishlist.includes(p.id), [p.id]) && hydrated;
  const comparing = useDb((s) => s.me.compare.includes(p.id), [p.id]) && hydrated;

  function save() {
    const on = actions.toggleWishlist(p.id);
    toast(on ? "Saved to your wishlist" : "Removed from wishlist");
  }
  function compare() {
    const r = actions.toggleCompare(p.id);
    if (!r.ok) toast(r.error, "error");
    else toast(r.added ? "Added to compare" : "Removed from compare");
  }

  const facts = [
    bhk(p) && { icon: BedDouble, text: bhk(p) },
    areaText(p) && { icon: Ruler, text: areaText(p) },
    p.availability === "under-construction" ? { icon: Hammer, text: "Under construction" } : p.furnishing && { icon: Sofa, text: p.furnishing },
  ].filter(Boolean);

  return (
    <article className={`listing${compact ? " listing--compact" : ""}`} data-reveal={reveal ? "" : undefined} style={{ "--d": i % 3 }}>
      <div className="listing__media">
        <Link href={`/properties/${p.id}`} tabIndex={-1} aria-hidden="true">
          <img src={p.images[0]} alt="" loading="lazy" />
          <span className="listing__view">View</span>
        </Link>
        <span className={`badge badge--${p.listingType}`}>{listingLabel(p.listingType)}</span>
        <div className="listing__tools">
          <button
            type="button"
            className={`listing__save${comparing ? " is-on" : ""}`}
            aria-label={comparing ? "Remove from compare" : "Add to compare"}
            aria-pressed={comparing}
            title="Compare"
            onClick={compare}
          >
            <GitCompareArrows size={17} />
          </button>
          <button
            type="button"
            className={`listing__save${saved ? " is-saved" : ""}`}
            aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
            aria-pressed={saved}
            onClick={save}
          >
            <Heart size={18} />
          </button>
        </div>
      </div>
      <div className="listing__body">
        <div className="listing__price">
          {priceText(p)}
          {priceSuffix(p) && <span>{priceSuffix(p)}</span>}
        </div>
        <h3>
          <Link href={`/properties/${p.id}`}>{p.title}</Link>
        </h3>
        <p className="listing__place">
          <MapPin size={15} /> {p.locality}, {p.city}
        </p>
        <ul className="listing__facts">
          <li className="listing__cat">{categoryLabel(p.category)}</li>
          {facts.map(({ icon: Icon, text }) => (
            <li key={text}>
              <Icon size={16} /> {text}
            </li>
          ))}
          {p.verified && (
            <li className="listing__verified">
              <BadgeCheck size={16} /> Verified
            </li>
          )}
        </ul>
        {!compact && (
          <Link href={`/properties/${p.id}`} className="listing__link">
            View details <ArrowUpRight size={16} />
          </Link>
        )}
      </div>
    </article>
  );
}
