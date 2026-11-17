"use client";

import { useState } from "react";
import { LineChart } from "@/components/charts/Charts";
import { useMarket } from "@/lib/market/hooks";
import { date, num2 } from "@/lib/format";
import { Skeleton } from "@/components/ui/bits";

export const RANGES = ["1D", "1W", "1M", "3M", "6M", "1Y", "5Y"];

const xFmt = (range) => (t) =>
  range === "1D"
    ? date(new Date(t).toISOString(), { hour: "2-digit", minute: "2-digit", hour12: false })
    : range === "1W"
      ? date(new Date(t).toISOString(), { weekday: "short", day: "numeric" })
      : range === "5Y"
        ? date(new Date(t).toISOString(), { month: "short", year: "numeric" })
        : date(new Date(t).toISOString(), { day: "numeric", month: "short" });

export default function StockChart({ symbol, prevClose, height = 340 }) {
  const [range, setRange] = useState("1D");
  const { data, error } = useMarket((m, cfg) => m.history(symbol, range, cfg), [symbol, range], { poll: range === "1D" });
  const first = data?.[0]?.v;
  const last = data?.at(-1)?.v;
  const ref = range === "1D" ? prevClose : first;
  const change = last != null && ref ? ((last - ref) / ref) * 100 : null;

  return (
    <div className="schart">
      <div className="schart__head">
        <div className="seg seg--light" role="tablist" aria-label="Chart range">
          {RANGES.map((r) => (
            <button key={r} type="button" role="tab" aria-selected={range === r} className={range === r ? "is-active" : ""} onClick={() => setRange(r)}>
              {r}
            </button>
          ))}
        </div>
        {change != null && (
          <span className={`chg chg--${change >= 0 ? "up" : "down"} chg--sm`}>
            {change >= 0 ? "▲ +" : "▼ −"}
            {Math.abs(change).toFixed(2)}% over {range}
          </span>
        )}
      </div>
      {error && !data ? (
        <p className="muted">Chart data is unavailable right now.</p>
      ) : !data ? (
        <Skeleton h={height} r={16} />
      ) : (
        <LineChart
          label={`${symbol} price, ${range}`}
          series={[{ id: `${symbol}-${range}`, label: symbol, points: data, color: change >= 0 ? "var(--up)" : "var(--down)" }]}
          height={height}
          baseline={range === "1D" ? prevClose : undefined}
          yFormat={(v, tip) => (tip ? `₹${num2(v)}` : v >= 10000 ? `${(v / 1000).toFixed(1)}k` : v.toFixed(v < 100 ? 1 : 0))}
          xFormat={xFmt(range)}
          tipFormat={(t) => date(new Date(t).toISOString(), range === "1D" || range === "1W" ? { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: true } : { day: "numeric", month: "short", year: "numeric" })}
        />
      )}
    </div>
  );
}
