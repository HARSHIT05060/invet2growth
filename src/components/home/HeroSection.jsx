"use client";

import { useState } from "react";
import { MapPin, Building2, IndianRupee, Search, BadgeCheck, ArrowUpRight } from "lucide-react";
import { scrollToId } from "@/lib/utils";

const MODES = [
  { id: "buy", label: "Buy" },
  { id: "rent", label: "Rent" },
  { id: "sell", label: "Sell" },
];

export default function HeroSection({ cities, propertyTypes, budgets: budgetOptions, featured }) {
  const [mode, setMode] = useState("buy");
  const [city, setCity] = useState("");
  const [type, setType] = useState("");
  const [budget, setBudget] = useState("");

  const budgets = mode === "rent" ? budgetOptions.rent : budgetOptions.buy;

  function changeMode(id) {
    setMode(id);
    setBudget("");
  }

  function onSubmit(e) {
    e.preventDefault();
    if (mode === "sell") {
      scrollToId("post");
      return;
    }
    // Hook point: replace with router.push(`/search?...`) once a results page exists.
    window.dispatchEvent(new CustomEvent("i2g:search", { detail: { mode, city, type, budget } }));
    scrollToId("properties");
  }

  return (
    <section className="hero">
      <div className="container">
        <div className="hero__frame">
          <div className="hero__media">
            <img className="hero__img" src="/images/hero.webp" alt="" fetchPriority="high" data-parallax="0.12" />
          </div>
          <div className="hero__veil" />

          <div className="hero__top">
            <div className="hero__copy">
              <span className="pill pill--glass hero__pill">
                <BadgeCheck size={15} /> Verified homes across India
              </span>
              <h1 aria-label="Apna ghar, apni jagah. Yahin se shuru karein.">
                <span className="line" style={{ "--i": 0 }} aria-hidden="true">
                  <span>
                    Apna <em>ghar,</em>
                  </span>
                </span>
                <span className="line" style={{ "--i": 1 }} aria-hidden="true">
                  <span>
                    apni <em>jagah.</em>
                  </span>
                </span>
                <span className="line line--soft" style={{ "--i": 2 }} aria-hidden="true">
                  <span>Yahin se shuru karein.</span>
                </span>
              </h1>
              <p className="hero__sub">
                Buy, sell and rent flats, houses, plots and shops directly from owners and trusted brokers.
              </p>
            </div>

            <a href="#properties" className="featured glass">
              <span className="featured__tag">Featured</span>
              <span className="featured__price">{featured.price}</span>
              <span className="featured__title">{featured.title}</span>
              <span className="featured__place">
                <MapPin size={14} /> {featured.place}
              </span>
              <span className="featured__go" aria-hidden="true">
                <ArrowUpRight size={18} />
              </span>
            </a>
          </div>

          <form className="search glass" onSubmit={onSubmit} role="search">
            <div className="seg" role="tablist" aria-label="What do you want to do?">
              {MODES.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  role="tab"
                  aria-selected={mode === m.id}
                  className={mode === m.id ? "is-active" : ""}
                  onClick={() => changeMode(m.id)}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <div className="search__row">
              <label className="field">
                <span className="field__label">City or locality</span>
                <span className="field__control">
                  <MapPin size={18} />
                  <input
                    list="i2g-cities"
                    placeholder="e.g. Vaishali Nagar, Jaipur"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                  <datalist id="i2g-cities">
                    {cities.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </span>
              </label>

              <label className="field">
                <span className="field__label">Property type</span>
                <span className="field__control">
                  <Building2 size={18} />
                  <select value={type} onChange={(e) => setType(e.target.value)}>
                    <option value="">Any type</option>
                    {propertyTypes.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </span>
              </label>

              {mode !== "sell" && (
                <label className="field">
                  <span className="field__label">Budget</span>
                  <span className="field__control">
                    <IndianRupee size={18} />
                    <select value={budget} onChange={(e) => setBudget(e.target.value)}>
                      <option value="">Any budget</option>
                      {budgets.map((b) => (
                        <option key={b}>{b}</option>
                      ))}
                    </select>
                  </span>
                </label>
              )}

              <button type="submit" className="btn btn--primary search__submit">
                <Search size={18} strokeWidth={2.4} />
                {mode === "sell" ? "Start listing" : "Search"}
              </button>
            </div>
          </form>
        </div>

        <div className="cities">
          <span className="cities__label">Popular cities</span>
          <div className="cities__list">
            {cities.map((c) => (
              <button key={c} type="button" className={`chip${city === c ? " is-active" : ""}`} onClick={() => setCity(c)}>
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
