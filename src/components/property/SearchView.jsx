"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { LayoutGrid, List, Map as MapIcon, SlidersHorizontal, X, Search, GitCompareArrows } from "lucide-react";
import { useDb, isPublic } from "@/lib/db/store";
import { searchProperties } from "@/lib/property";
import { FURNISHING, AVAILABILITY, SEGMENTS } from "@/mock/catalog";
import PropertyCard from "./PropertyCard";
import PropertyRow from "./PropertyRow";
import { Empty } from "@/components/ui/bits";

const PropertyMap = dynamic(() => import("./PropertyMap"), { ssr: false, loading: () => <div className="pmap pmap--loading">Loading map…</div> });

const KEYS = ["q", "type", "segment", "category", "city", "locality", "min", "max", "minArea", "maxArea", "beds", "furnishing", "availability", "verified", "sort"];
const PAGE = 9;

const PRICE_STEPS = {
  sale: [500000, 1000000, 2500000, 5000000, 7500000, 10000000, 20000000, 50000000, 100000000],
  rent: [5000, 10000, 15000, 20000, 30000, 50000, 100000, 300000, 500000],
};

const label = (n) => (n >= 1e7 ? `₹${n / 1e7} Cr` : n >= 1e5 ? `₹${n / 1e5} L` : `₹${(n / 1000).toFixed(0)}K`);

export default function SearchView() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [view, setView] = useState("grid");
  const [sheet, setSheet] = useState(false);
  const [page, setPage] = useState(1);
  const [active, setActive] = useState(null);

  const f = useMemo(() => Object.fromEntries(KEYS.map((k) => [k, params.get(k) ?? ""])), [params]);
  const all = useDb((s) => s.properties.filter(isPublic));
  const categories = useDb((s) => s.propertyCategories.filter((c) => c.active));
  const locations = useDb((s) => s.locations.filter((l) => l.active));
  const compareCount = useDb((s) => s.me.compare.length);

  const results = useMemo(() => searchProperties(all, { ...f, verified: f.verified === "1" }), [all, f]);
  const shown = results.slice(0, page * PAGE);
  const cityObj = locations.find((l) => l.city === f.city);
  const priceSteps = f.type === "rent" || f.type === "lease" ? PRICE_STEPS.rent : PRICE_STEPS.sale;

  function set(patch) {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => (v === "" || v == null || v === false ? next.delete(k) : next.set(k, v)));
    if ("segment" in patch && patch.segment && f.category && categories.find((c) => c.id === f.category)?.segment !== patch.segment) next.delete("category");
    if ("city" in patch) next.delete("locality");
    if ("type" in patch) {
      next.delete("min");
      next.delete("max");
    }
    setPage(1);
    router.replace(`${pathname}?${next}`, { scroll: false });
  }

  const activeChips = KEYS.filter((k) => f[k] && k !== "sort").map((k) => {
    const v = f[k];
    const text =
      k === "type" ? { sale: "Buy", rent: "Rent", lease: "Lease" }[v]
      : k === "category" ? categories.find((c) => c.id === v)?.label
      : k === "segment" ? SEGMENTS.find((s) => s.id === v)?.label
      : k === "min" ? `Min ${label(+v)}`
      : k === "max" ? `Max ${label(+v)}`
      : k === "minArea" ? `≥ ${v} sq.ft`
      : k === "maxArea" ? `≤ ${v} sq.ft`
      : k === "beds" ? `${v}${v === "4" ? "+" : ""} BHK`
      : k === "availability" ? AVAILABILITY.find((a) => a.id === v)?.label
      : k === "verified" ? "Verified only"
      : k === "q" ? `“${v}”`
      : v;
    return { k, text };
  });

  const title = [
    f.category ? categories.find((c) => c.id === f.category)?.label : f.segment ? `${SEGMENTS.find((s) => s.id === f.segment)?.label} properties` : "Properties",
    f.type === "rent" ? "for rent" : f.type === "lease" ? "for lease" : f.type === "sale" ? "for sale" : "",
    f.locality ? `in ${f.locality}, ${f.city}` : f.city ? `in ${f.city}` : "in India",
  ].filter(Boolean).join(" ");

  const filters = (
    <div className="filters">
      <div className="filters__group">
        <span className="filters__label">Looking to</span>
        <div className="seg seg--light seg--full">
          {[["", "Any"], ["sale", "Buy"], ["rent", "Rent"], ["lease", "Lease"]].map(([v, l]) => (
            <button key={l} type="button" className={f.type === v ? "is-active" : ""} onClick={() => set({ type: v })}>
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="filters__group">
        <span className="filters__label">Property segment</span>
        <div className="chips">
          {[{ id: "", label: "All" }, ...SEGMENTS].map((s) => (
            <button key={s.id || "all"} type="button" className={`chip${f.segment === s.id ? " is-active" : ""}`} onClick={() => set({ segment: s.id })}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <label className="filters__group">
        <span className="filters__label">Property type</span>
        <select className="input" value={f.category} onChange={(e) => set({ category: e.target.value })}>
          <option value="">Any type</option>
          {categories
            .filter((c) => !f.segment || c.segment === f.segment)
            .map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
        </select>
      </label>

      <div className="filters__pair">
        <label className="filters__group">
          <span className="filters__label">City</span>
          <select className="input" value={f.city} onChange={(e) => set({ city: e.target.value })}>
            <option value="">All cities</option>
            {locations.map((l) => (
              <option key={l.id}>{l.city}</option>
            ))}
          </select>
        </label>
        <label className="filters__group">
          <span className="filters__label">Locality</span>
          <select className="input" value={f.locality} onChange={(e) => set({ locality: e.target.value })} disabled={!cityObj}>
            <option value="">{cityObj ? "All localities" : "Pick a city first"}</option>
            {cityObj?.localities.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="filters__pair">
        <label className="filters__group">
          <span className="filters__label">Min budget</span>
          <select className="input" value={f.min} onChange={(e) => set({ min: e.target.value })}>
            <option value="">No min</option>
            {priceSteps.map((n) => (
              <option key={n} value={n}>
                {label(n)}
              </option>
            ))}
          </select>
        </label>
        <label className="filters__group">
          <span className="filters__label">Max budget</span>
          <select className="input" value={f.max} onChange={(e) => set({ max: e.target.value })}>
            <option value="">No max</option>
            {priceSteps.map((n) => (
              <option key={n} value={n}>
                {label(n)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="filters__pair">
        <label className="filters__group">
          <span className="filters__label">Min area (sq.ft)</span>
          <input className="input" type="number" min="0" inputMode="numeric" placeholder="Any" key={`a${f.minArea}`} defaultValue={f.minArea} onBlur={(e) => set({ minArea: e.target.value })} />
        </label>
        <label className="filters__group">
          <span className="filters__label">Max area (sq.ft)</span>
          <input className="input" type="number" min="0" inputMode="numeric" placeholder="Any" key={`b${f.maxArea}`} defaultValue={f.maxArea} onBlur={(e) => set({ maxArea: e.target.value })} />
        </label>
      </div>

      <div className="filters__group">
        <span className="filters__label">Bedrooms</span>
        <div className="chips">
          {["1", "2", "3", "4"].map((b) => (
            <button key={b} type="button" className={`chip${f.beds === b ? " is-active" : ""}`} onClick={() => set({ beds: f.beds === b ? "" : b })}>
              {b}
              {b === "4" ? "+" : ""} BHK
            </button>
          ))}
        </div>
      </div>

      <div className="filters__group">
        <span className="filters__label">Furnishing</span>
        <div className="chips">
          {FURNISHING.map((x) => (
            <button key={x} type="button" className={`chip${f.furnishing === x ? " is-active" : ""}`} onClick={() => set({ furnishing: f.furnishing === x ? "" : x })}>
              {x}
            </button>
          ))}
        </div>
      </div>

      <div className="filters__group">
        <span className="filters__label">Possession</span>
        <div className="chips">
          {AVAILABILITY.map((x) => (
            <button key={x.id} type="button" className={`chip${f.availability === x.id ? " is-active" : ""}`} onClick={() => set({ availability: f.availability === x.id ? "" : x.id })}>
              {x.label}
            </button>
          ))}
        </div>
      </div>

      <label className="check">
        <input type="checkbox" checked={f.verified === "1"} onChange={(e) => set({ verified: e.target.checked ? "1" : "" })} />
        <span>Verified properties only</span>
      </label>
    </div>
  );

  return (
    <div className="container page-pad">
      <div className="search-head">
        <div>
          <p className="eyebrow">Property search</p>
          <h1 className="h-page">{title}</h1>
          <p className="muted">
            {results.length} {results.length === 1 ? "property" : "properties"} found
          </p>
        </div>
        <form
          className="search-q"
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            set({ q: new FormData(e.currentTarget).get("q") });
          }}
        >
          <Search size={18} />
          <input name="q" key={f.q} defaultValue={f.q} placeholder="Search by locality, project or ID" aria-label="Keyword" />
          <button type="submit" className="btn btn--primary btn--sm">
            Search
          </button>
        </form>
      </div>

      <div className="search-layout">
        <aside className={`search-side${sheet ? " is-open" : ""}`} data-lenis-prevent>
          <div className="search-side__head">
            <h2>Filters</h2>
            <button type="button" className="icon-btn search-side__close" onClick={() => setSheet(false)} aria-label="Close filters">
              <X size={18} />
            </button>
          </div>
          {filters}
          <div className="search-side__foot">
            <Link href="/properties" className="btn btn--ghost btn--sm" onClick={() => setPage(1)}>
              Clear all
            </Link>
            <button type="button" className="btn btn--primary btn--sm search-side__apply" onClick={() => setSheet(false)}>
              Show {results.length} results
            </button>
          </div>
        </aside>

        <div className="search-main">
          <div className="toolbar">
            <button type="button" className="btn btn--ghost btn--sm toolbar__filters" onClick={() => setSheet(true)}>
              <SlidersHorizontal size={16} /> Filters {activeChips.length > 0 && `(${activeChips.length})`}
            </button>
            <div className="toolbar__chips">
              {activeChips.map((c) => (
                <button key={c.k} type="button" className="fchip" onClick={() => set({ [c.k]: "" })}>
                  {c.text} <X size={13} />
                </button>
              ))}
            </div>
            <div className="toolbar__right">
              <select className="input input--sm" value={f.sort} onChange={(e) => set({ sort: e.target.value })} aria-label="Sort by">
                <option value="">Newest first</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
                <option value="popular">Most viewed</option>
              </select>
              <div className="seg seg--light seg--icons" role="tablist" aria-label="View">
                {[["grid", LayoutGrid, "Grid"], ["list", List, "List"], ["map", MapIcon, "Map"]].map(([v, Icon, l]) => (
                  <button key={v} type="button" role="tab" aria-selected={view === v} aria-label={`${l} view`} className={view === v ? "is-active" : ""} onClick={() => setView(v)}>
                    <Icon size={17} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {results.length === 0 ? (
            <Empty title="No properties match these filters" text="Try widening your budget, removing a filter or searching a nearby city." action={{ label: "Clear filters", href: "/properties" }} />
          ) : view === "map" ? (
            <div className="map-split">
              <PropertyMap items={results} activeId={active} onSelect={setActive} />
              <div className="map-split__list" data-lenis-prevent>
                {results.map((p) => (
                  <div key={p.id} className={active === p.id ? "is-active" : ""} onMouseEnter={() => setActive(p.id)}>
                    <PropertyRow p={p} />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className={view === "grid" ? "listings listings--2" : "rows"}>
                {shown.map((p, i) => (view === "grid" ? <PropertyCard key={p.id} p={p} i={i} reveal={false} /> : <PropertyRow key={p.id} p={p} />))}
              </div>
              {shown.length < results.length && (
                <div className="center mt-32">
                  <button type="button" className="btn btn--ghost" onClick={() => setPage(page + 1)}>
                    Show more ({results.length - shown.length} left)
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {compareCount > 0 && (
        <Link href="/compare" className="compare-fab">
          <GitCompareArrows size={18} /> Compare ({compareCount})
        </Link>
      )}
    </div>
  );
}
