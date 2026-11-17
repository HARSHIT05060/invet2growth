"use client";

import Link from "next/link";
import { X, GitCompareArrows, Check, Minus } from "lucide-react";
import { useDb, useHydrated, actions } from "@/lib/db/store";
import { priceText, priceSuffix, categoryLabel, listingLabel, availabilityLabel, pricePerSqft } from "@/lib/property";
import { inr, date } from "@/lib/format";
import { Empty } from "@/components/ui/bits";

const sq = (n) => (n ? `${n.toLocaleString("en-IN")} sq.ft` : null);

const ROWS = [
  ["Price", (p) => `${priceText(p)} ${priceSuffix(p)}`],
  ["Price per sq.ft", (p) => (pricePerSqft(p) ? inr(pricePerSqft(p)) : null)],
  ["Listing type", (p) => listingLabel(p.listingType)],
  ["Category", (p) => categoryLabel(p.category)],
  ["Location", (p) => `${p.locality}, ${p.city}`],
  ["Carpet area", (p) => sq(p.carpetArea)],
  ["Built-up area", (p) => sq(p.builtUpArea)],
  ["Plot area", (p) => sq(p.plotArea)],
  ["Bedrooms", (p) => p.bedrooms],
  ["Bathrooms", (p) => p.bathrooms],
  ["Balconies", (p) => p.balconies],
  ["Furnishing", (p) => p.furnishing],
  ["Floor", (p) => (p.totalFloors ? `${p.floor ?? 0} of ${p.totalFloors}` : null)],
  ["Parking", (p) => (p.parking !== "None" ? p.parking : null)],
  ["Facing", (p) => p.facing],
  ["Possession", (p) => availabilityLabel(p.availability)],
  ["Age", (p) => (p.availability === "ready" ? `${p.ageYears} yrs` : "New")],
  ["RERA", (p) => p.rera],
  ["Verified", (p) => (p.verified ? true : false)],
  ["Posted", (p) => date(p.postedAt)],
];

export default function CompareView() {
  const hydrated = useHydrated();
  const ids = useDb((s) => s.me.compare);
  const props = useDb((s) => ids.map((id) => s.properties.find((p) => p.id === id)).filter(Boolean), [ids]);
  const amenities = useDb((s) => s.amenities);

  if (!hydrated) return <div className="container page-pad muted">Loading…</div>;

  return (
    <div className="container page-pad">
      <div className="search-head">
        <div>
          <p className="eyebrow">Compare</p>
          <h1 className="h-page">Compare properties</h1>
          <p className="muted">Side by side, up to 4 at a time.</p>
        </div>
        {props.length > 0 && (
          <button type="button" className="btn btn--ghost btn--sm" onClick={actions.clearCompare}>
            Clear all
          </button>
        )}
      </div>

      {props.length === 0 ? (
        <Empty icon={GitCompareArrows} title="Nothing to compare yet" text="Use the compare button on any property card to add it here." action={{ label: "Browse properties", href: "/properties" }} />
      ) : (
        <div className="table-wrap" data-lenis-prevent>
          <table className="ctable">
            <thead>
              <tr>
                <th scope="col" className="ctable__corner">
                  {props.length < 4 && (
                    <Link href="/properties" className="btn btn--ghost btn--sm">
                      + Add property
                    </Link>
                  )}
                </th>
                {props.map((p) => (
                  <th key={p.id} scope="col">
                    <div className="ctable__head">
                      <button type="button" className="icon-btn icon-btn--sm" onClick={() => actions.toggleCompare(p.id)} aria-label={`Remove ${p.title}`}>
                        <X size={15} />
                      </button>
                      <img src={p.images[0]} alt="" />
                      <Link href={`/properties/${p.id}`}>{p.title}</Link>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map(([label, get]) => (
                <tr key={label}>
                  <th scope="row">{label}</th>
                  {props.map((p) => {
                    const v = get(p);
                    return (
                      <td key={p.id}>
                        {v === true ? <Check size={18} className="ok" aria-label="Yes" /> : v === false || v == null ? <Minus size={16} className="muted" aria-label="Not available" /> : v}
                      </td>
                    );
                  })}
                </tr>
              ))}
              <tr>
                <th scope="row">Amenities</th>
                {props.map((p) => (
                  <td key={p.id} className="small">
                    {p.amenities.map((a) => amenities.find((x) => x.id === a)?.label ?? a).join(", ") || "—"}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
