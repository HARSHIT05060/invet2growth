"use client";

import { useEffect, useState } from "react";
import { MapPin, BedDouble, Ruler, KeyRound, Car, Sofa, Heart, ArrowUpRight } from "lucide-react";

const EXTRA_ICONS = { key: KeyRound, car: Car, sofa: Sofa };
const FILTERS = [
  { id: "all", label: "All" },
  { id: "buy", label: "For sale" },
  { id: "rent", label: "For rent" },
];

export default function PropertyListings({ listings }) {
  const [filter, setFilter] = useState("all");
  const [saved, setSaved] = useState([]);

  // Hero search sets the Buy / Rent filter.
  useEffect(() => {
    const onSearch = (e) => setFilter(e.detail.mode === "rent" ? "rent" : "buy");
    window.addEventListener("i2g:search", onSearch);
    return () => window.removeEventListener("i2g:search", onSearch);
  }, []);

  const list = filter === "all" ? listings : listings.filter((l) => l.mode === filter);

  function toggleSave(id) {
    setSaved((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

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
          <div className="seg seg--light" role="tablist" aria-label="Filter properties">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={filter === f.id}
                className={filter === f.id ? "is-active" : ""}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="listings">
          {list.map((p, i) => {
            const Extra = EXTRA_ICONS[p.extra.icon];
            const isSaved = saved.includes(p.id);
            return (
              <article key={`${filter}-${p.id}`} className="listing" data-reveal style={{ "--d": i }}>
                <div className="listing__media">
                  <img src={p.image} alt={`${p.title} in ${p.place}`} loading="lazy" />
                  <span className="listing__view" aria-hidden="true">View</span>
                  <span className={`badge badge--${p.mode}`}>{p.mode === "rent" ? "For rent" : "For sale"}</span>
                  <button
                    type="button"
                    className={`listing__save${isSaved ? " is-saved" : ""}`}
                    aria-label={isSaved ? "Remove from saved" : "Save property"}
                    aria-pressed={isSaved}
                    onClick={() => toggleSave(p.id)}
                  >
                    <Heart size={18} />
                  </button>
                </div>
                <div className="listing__body">
                  <div className="listing__price">
                    {p.price}
                    {p.per && <span>{p.per}</span>}
                  </div>
                  <h3>{p.title}</h3>
                  <p className="listing__place">
                    <MapPin size={15} /> {p.place}
                  </p>
                  <ul className="listing__facts">
                    <li>
                      <BedDouble size={16} /> {p.beds}
                    </li>
                    <li>
                      <Ruler size={16} /> {p.area}
                    </li>
                    <li>
                      <Extra size={16} /> {p.extra.label}
                    </li>
                  </ul>
                  <a href="#" className="listing__link">
                    View details <ArrowUpRight size={16} />
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
