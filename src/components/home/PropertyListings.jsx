"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useDb, isPublic } from "@/lib/db/store";
import PropertyCard from "@/components/property/PropertyCard";

const FILTERS = [
  { id: "all", label: "All", test: () => true, href: "/properties" },
  { id: "sale", label: "For sale", test: (p) => p.listingType === "sale", href: "/properties?type=sale" },
  { id: "rent", label: "For rent", test: (p) => p.listingType === "rent", href: "/properties?type=rent" },
  { id: "commercial", label: "Commercial", test: (p) => p.segment === "commercial", href: "/properties?segment=commercial" },
];

export default function PropertyListings() {
  const [filter, setFilter] = useState("all");
  const f = FILTERS.find((x) => x.id === filter);
  const list = useDb(
    (s) =>
      s.properties
        .filter((p) => isPublic(p) && f.test(p))
        .sort((a, b) => Number(b.featured) - Number(a.featured) || b.views - a.views)
        .slice(0, 6),
    [filter]
  );

  return (
    <section className="section" id="properties">
      <div className="container">
        <div className="section__head" data-reveal>
          <div>
            <p className="eyebrow">Handpicked this week</p>
            <h2>
              Popular <em>properties</em>
            </h2>
          </div>
          <div className="section__tools">
            <div className="seg seg--light" role="tablist" aria-label="Filter properties">
              {FILTERS.map((x) => (
                <button
                  key={x.id}
                  type="button"
                  role="tab"
                  aria-selected={filter === x.id}
                  className={filter === x.id ? "is-active" : ""}
                  onClick={() => setFilter(x.id)}
                >
                  {x.label}
                </button>
              ))}
            </div>
            <Link href={f.href} className="link-arrow">
              View all <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        <div className="listings">
          {list.map((p, i) => (
            <PropertyCard key={`${filter}-${p.id}`} p={p} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
