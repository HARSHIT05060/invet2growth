"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { market } from "@/lib/market";

/** Typeahead over the symbol master. onPick(symbol) — defaults to opening the stock page. */
export default function StockSearch({ onPick, placeholder = "Search NSE stocks, e.g. RELIANCE or Infosys", autoFocus }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [items, setItems] = useState([]);
  const [hi, setHi] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    market.search(q).then((r) => alive && (setItems(r), setHi(0)));
    return () => {
      alive = false;
    };
  }, [q]);

  function pick(sym) {
    setQ("");
    setOpen(false);
    if (onPick) onPick(sym);
    else router.push(`/market/stocks/${encodeURIComponent(sym)}`);
  }

  return (
    <div className="ssearch">
      <Search size={18} />
      <input
        role="combobox"
        aria-expanded={open && items.length > 0}
        aria-controls="ssearch-list"
        aria-autocomplete="list"
        value={q}
        autoFocus={autoFocus}
        placeholder={placeholder}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") setHi((h) => Math.min(h + 1, items.length - 1));
          else if (e.key === "ArrowUp") setHi((h) => Math.max(h - 1, 0));
          else if (e.key === "Enter" && items[hi]) {
            e.preventDefault();
            pick(items[hi].symbol);
          } else if (e.key === "Escape") setOpen(false);
        }}
      />
      {open && items.length > 0 && (
        <ul id="ssearch-list" role="listbox" className="ssearch__list">
          {items.map((s, i) => (
            <li key={s.symbol} role="option" aria-selected={i === hi} className={i === hi ? "is-hi" : ""} onMouseDown={() => pick(s.symbol)} onMouseEnter={() => setHi(i)}>
              <strong>{s.symbol}</strong>
              <span>{s.name}</span>
              <small>{s.sector}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
