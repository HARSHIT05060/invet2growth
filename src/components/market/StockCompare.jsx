"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { useMarket } from "@/lib/market/hooks";
import { num2, compact, date } from "@/lib/format";
import { Change, Skeleton } from "@/components/ui/bits";
import { LineChart } from "@/components/charts/Charts";
import StockSearch from "./StockSearch";
import DataLabel from "./DataLabel";
import { RANGES } from "./StockChart";

const MAX = 3; // categorical palette validates all-pairs for 3 series

export default function StockCompare() {
  const params = useSearchParams();
  const [syms, setSyms] = useState(() => {
    const s = params.get("s");
    return s ? [s, ...["TCS", "INFY"].filter((x) => x !== s)].slice(0, 2) : ["TCS", "INFY"];
  });
  const [range, setRange] = useState("1Y");

  const { data } = useMarket(
    async (m, cfg) => {
      const [quotes, hist] = await Promise.all([m.quotes(syms, cfg), Promise.all(syms.map((s) => m.history(s, range, cfg)))]);
      return { quotes, hist };
    },
    [syms.join(), range],
    { poll: range === "1D" }
  );

  // Index every series to 100 at the start of the range so different price levels share one axis.
  const series = data
    ? syms.map((s, i) => {
        const pts = data.hist[i] ?? [];
        const base = pts[0]?.v || 1;
        return { id: s, label: s, points: pts.map((p) => ({ t: p.t, v: (p.v / base) * 100 })) };
      })
    : [];

  const rows = [
    ["Price (₹)", (q) => num2(q.price)],
    ["Change today", (q) => <Change value={q.change} pct={q.changePct} size="sm" />],
    ["Sector", (q) => q.sector],
    ["Day range", (q) => `${num2(q.low)} – ${num2(q.high)}`],
    ["52-week high", (q) => num2(q.high52)],
    ["52-week low", (q) => num2(q.low52)],
    ["Volume", (q) => compact(q.volume)],
    ["Market cap (₹)", (q) => compact(q.marketCap)],
    [`Return over ${range}`, (q, i) => {
      const pts = data.hist[i];
      if (!pts?.length) return "—";
      const r = ((pts.at(-1).v - pts[0].v) / pts[0].v) * 100;
      return <Change pct={r} size="sm" />;
    }],
  ];

  return (
    <div className="theme-market">
      <div className="container page-pad">
        <div className="mkt-head">
          <div>
            <p className="eyebrow">Market</p>
            <h1 className="h-page">Compare stocks</h1>
            <p className="muted">Up to {MAX} stocks. The chart shows each stock&apos;s value indexed to 100 at the start of the period.</p>
          </div>
          {syms.length < MAX && (
            <div className="mkt-head__search">
              <StockSearch placeholder="Add a stock to compare" onPick={(s) => !syms.includes(s) && setSyms([...syms, s])} />
            </div>
          )}
        </div>

        <div className="chips mb-16">
          {syms.map((s, i) => (
            <span key={s} className="fchip fchip--legend">
              <i style={{ background: `var(--series-${i + 1})` }} />
              {s}
              {syms.length > 1 && (
                <button type="button" onClick={() => setSyms(syms.filter((x) => x !== s))} aria-label={`Remove ${s}`}>
                  <X size={13} />
                </button>
              )}
            </span>
          ))}
        </div>

        <section className="panel">
          <div className="schart__head">
            <div className="seg seg--light" role="tablist">
              {RANGES.map((r) => (
                <button key={r} type="button" className={range === r ? "is-active" : ""} onClick={() => setRange(r)}>
                  {r}
                </button>
              ))}
            </div>
          </div>
          {data ? (
            <LineChart
              label={`Indexed performance of ${syms.join(", ")}`}
              series={series}
              area={false}
              height={340}
              baseline={100}
              yFormat={(v) => v.toFixed(0)}
              xFormat={(t) => date(new Date(t).toISOString(), range === "1D" ? { hour: "2-digit", minute: "2-digit", hour12: false } : range === "5Y" ? { month: "short", year: "numeric" } : { day: "numeric", month: "short" })}
              tipFormat={(t) => date(new Date(t).toISOString(), { day: "numeric", month: "short", year: "numeric" })}
            />
          ) : (
            <Skeleton h={340} />
          )}
        </section>

        {data && (
          <section className="panel">
            <div className="table-wrap">
              <table className="dtable dtable--compare">
                <thead>
                  <tr>
                    <th />
                    {data.quotes.map((q, i) => (
                      <th key={q.symbol}>
                        <Link href={`/market/stocks/${encodeURIComponent(q.symbol)}`} className="sym">
                          <strong>
                            <i className="legend-dot" style={{ background: `var(--series-${i + 1})` }} /> {q.symbol}
                          </strong>
                          <small>{q.name}</small>
                        </Link>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map(([label, get]) => (
                    <tr key={label}>
                      <th scope="row">{label}</th>
                      {data.quotes.map((q, i) => (
                        <td key={q.symbol} className="num">
                          {get(q, i)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
        <DataLabel />
      </div>
    </div>
  );
}
