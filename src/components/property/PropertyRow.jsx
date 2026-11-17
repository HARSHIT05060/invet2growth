"use client";

import Link from "next/link";
import { MapPin, BadgeCheck, Heart } from "lucide-react";
import { useDb, useHydrated, actions } from "@/lib/db/store";
import { priceText, priceSuffix, listingLabel, bhk, areaText, categoryLabel, pricePerSqft } from "@/lib/property";
import { inr, date } from "@/lib/format";
import { toast } from "@/components/ui/Toast";

export default function PropertyRow({ p, actions: extra }) {
  const hydrated = useHydrated();
  const saved = useDb((s) => s.me.wishlist.includes(p.id), [p.id]) && hydrated;
  const ppsf = pricePerSqft(p);

  return (
    <article className="prow">
      <Link href={`/properties/${p.id}`} className="prow__media" tabIndex={-1} aria-hidden="true">
        <img src={p.images[0]} alt="" loading="lazy" />
        <span className={`badge badge--${p.listingType}`}>{listingLabel(p.listingType)}</span>
      </Link>
      <div className="prow__body">
        <div className="prow__top">
          <div>
            <div className="prow__price">
              {priceText(p)} <small>{priceSuffix(p)}</small>
            </div>
            {ppsf && <div className="prow__ppsf">{inr(ppsf)} / sq.ft</div>}
          </div>
          <button
            type="button"
            className={`icon-btn${saved ? " is-saved" : ""}`}
            aria-pressed={saved}
            aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
            onClick={() => toast(actions.toggleWishlist(p.id) ? "Saved to your wishlist" : "Removed from wishlist")}
          >
            <Heart size={17} />
          </button>
        </div>
        <h3>
          <Link href={`/properties/${p.id}`}>{p.title}</Link>
        </h3>
        <p className="prow__place">
          <MapPin size={14} /> {p.locality}, {p.city}
        </p>
        <p className="prow__facts">
          {[categoryLabel(p.category), bhk(p), areaText(p), p.furnishing].filter(Boolean).join(" · ")}
        </p>
        <div className="prow__foot">
          <span>
            {p.verified && (
              <span className="vtag">
                <BadgeCheck size={14} /> Verified
              </span>
            )}
            {p.postedBy?.name} · {date(p.postedAt)}
          </span>
          {extra}
        </div>
      </div>
    </article>
  );
}
