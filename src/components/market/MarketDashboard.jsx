"use client";

import { useState } from "react";
import Link from "next/link";
import { Star, ArrowRight, AlertTriangle } from "lucide-react";
import { useMarket } from "@/lib/market/hooks";
import { useDb, useHydrated, actions } from "@/lib/db/store";
import { num2, compact } from "@/lib/format";
import { publishedArticles } from "@/lib/articles";
import { Change, Skeleton } from "@/components/ui/bits";
import { Sparkline } from "@/components/charts/Charts";
import { toast } from "@/components/ui/Toast";
import MarketStatus from "./MarketStatus";
import DataLabel from "./DataLabel";
import StockSearch from "./StockSearch";
import StockChart from "./StockChart";
import ArticleCard from "@/components/news/ArticleCard";
import AdSlot from "@/components/ui/AdSlot";

const MOVER_TABS = [
  ["gainers", "Top gainers"],
  ["losers", "Top losers"],
  ["volume", "Top volume"],
  ["active", "Most active (value)"],
];

export function WatchStar({ symbol }) {
  const hydrated = useHydrated();
  const on = useDb((s) => s.me.watchlist.includes(symbol), [symbol]) && hydrated;
  return (
    <button
      type="button"
      className={`star${on ? " is-on" : ""}`}
      aria-pressed={on}
      aria-label={on ? `Remove ${symbol} from watchlist` : `Add ${symbol} to watchlist`}
      onClick={(e) => {
        e.preventDefault();
        toast(actions.toggleWatch(symbol) ? `${symbol} added to watchlist` : `${symbol} removed from watchlist`);
      }}
    >
      <Star size={16} />
    </button>
  );
}

export default function MarketDashboard() {
  const cfg = useDb((s) => s.marketConfig);
  const watchlist = useDb((s) => s.me.watchlist);
  const hydrated = useHydrated();
  const [tab, setTab] = useState("gainers");
  const news = useDb((s) => publishedArticles(s.articles).filter((a) => ["stock-market-news", "market-analysis", "ipo-updates"].includes(a.category)).slice(0, 3));

  const ids = cfg.trackedIndices.filter((id) => cfg.showSensex || id !== "SENSEX");
  const { data, error } = useMarket(async (m, c) => {
    const [indices, movers, spark] = await Promise.all([
      m.indices(ids, c),
      m.movers(c, c.moversCount || 5),
      Promise.all(ids.map((id) => m.history(id, "1D", c))),
    ]);
    return { indices, movers, spark: Object.fromEntries(ids.map((id, i) => [id, spark[i]])) };
  }, [ids.join()]);

  const { data: wq } = useMarket((m, c) => m.quotes(watchlist, c), [watchlist.join()]);

  const sectors = data
    ? Object.values(
        data.movers.all.reduce((acc, q) => {
          (acc[q.sector] ??= { sector: q.sector, sum: 0, n: 0 });
          acc[q.sector].sum += q.changePct;
          acc[q.sector].n += 1;
          return acc;
        }, {})
      )
        .map((x) => ({ sector: x.sector, pct: x.sum / x.n }))
        .sort((a, b) => b.pct - a.pct)
    : [];
  const maxAbs = Math.max(0.5, ...sectors.map((s) => Math.abs(s.pct)));
  const b = data?.movers.breadth;

  return (
    <div className="theme-market">
      <div className="container page-pad">
        <div className="mkt-head">
          <div>
            <p className="eyebrow">Market dashboard</p>
            <h1 className="h-page">Stock market today</h1>
            <div className="mkt-head__meta">
              <MarketStatus />
            </div>
          </div>
          <div className="mkt-head__search">
            <StockSearch />
          </div>
        </div>

        <AdSlot placement="market-top" />

        {error && !data && (
          <div className="banner banner--bad">
            <AlertTriangle size={18} /> Market data provider is unavailable. Showing nothing rather than stale prices.
          </div>
        )}

        <div className="idx-row idx-row--lg">
          {(data?.indices ?? ids.map((id) => ({ symbol: id }))).map((q) => (
            <Link key={q.symbol} href={`/market/stocks/${q.symbol}`} className="idx-card">
              {q.name ? (
                <>
                  <span className="idx-card__name">
                    {q.name} <small>{q.exchange}</small>
                  </span>
                  <span className="idx-card__val num">{num2(q.price)}</span>
                  <Change value={q.change} pct={q.changePct} size="sm" />
                  <span className="idx-card__spark">
                    <Sparkline points={data.spark[q.symbol]} up={q.change >= 0} width={120} height={36} />
                  </span>
                </>
              ) : (
                <>
                  <Skeleton w="50%" />
                  <Skeleton h={28} w="80%" />
                  <Skeleton w="40%" />
                </>
              )}
            </Link>
          ))}
        </div>

        <div className="mkt-grid">
          <section className="panel mkt-grid__chart">
            <div className="panel__head">
              <h2>NIFTY 50</h2>
              <Link href="/market/stocks/NIFTY50" className="link-inline">
                Details <ArrowRight size={14} />
              </Link>
            </div>
            <StockChart symbol="NIFTY50" prevClose={data?.indices.find((i) => i.symbol === "NIFTY50")?.prevClose} height={300} />
          </section>

          <section className="panel">
            <div className="panel__head">
              <h2>Market breadth</h2>
            </div>
            {b ? (
              <>
                <div className="breadth" role="img" aria-label={`${b.up} advancing, ${b.down} declining, ${b.flat} unchanged`}>
                  <span className="breadth__up" style={{ flexGrow: b.up }} />
                  <span className="breadth__flat" style={{ flexGrow: b.flat }} />
                  <span className="breadth__down" style={{ flexGrow: b.down }} />
                </div>
                <div className="breadth__legend">
                  <span>▲ {b.up} advancing</span>
                  <span>▼ {b.down} declining</span>
                </div>
              </>
            ) : (
              <Skeleton h={40} />
            )}
            <h3 className="panel__sub">Sector performance</h3>
            <ul className="sectors">
              {sectors.map((s) => (
                <li key={s.sector}>
                  <span>{s.sector}</span>
                  <span className="sectors__bar">
                    <i className={s.pct >= 0 ? "up" : "down"} style={{ width: `${(Math.abs(s.pct) / maxAbs) * 50}%` }} />
                  </span>
                  <Change pct={s.pct} size="sm" />
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section className="panel">
          <div className="panel__head panel__head--wrap">
            <div className="tabs tabs--flush" role="tablist">
              {MOVER_TABS.map(([id, l]) => (
                <button key={id} type="button" role="tab" aria-selected={tab === id} className={tab === id ? "is-active" : ""} onClick={() => setTab(id)}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div className="table-wrap">
            <table className="dtable">
              <thead>
                <tr>
                  <th>Company</th>
                  <th className="r">LTP (₹)</th>
                  <th className="r">Change</th>
                  <th className="r hide-sm">Volume</th>
                  <th className="r hide-sm">Value (₹)</th>
                  <th className="r hide-sm">Day range</th>
                  <th aria-label="Watchlist" />
                </tr>
              </thead>
              <tbody>
                {(data?.movers[tab] ?? []).map((q) => (
                  <tr key={q.symbol}>
                    <td>
                      <Link href={`/market/stocks/${encodeURIComponent(q.symbol)}`} className="sym">
                        <strong>{q.symbol}</strong>
                        <small>{q.name}</small>
                      </Link>
                    </td>
                    <td className="r num">{num2(q.price)}</td>
                    <td className="r">
                      <Change value={q.change} pct={q.changePct} size="sm" />
                    </td>
                    <td className="r num hide-sm">{compact(q.volume)}</td>
                    <td className="r num hide-sm">{compact(q.value)}</td>
                    <td className="r num hide-sm small">
                      {num2(q.low)} – {num2(q.high)}
                    </td>
                    <td className="r">
                      <WatchStar symbol={q.symbol} />
                    </td>
                  </tr>
                ))}
                {data && !data.movers[tab].length && (
                  <tr>
                    <td colSpan={7} className="muted center">
                      No stocks in this list right now.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <div className="two-col">
          <section className="panel">
            <div className="panel__head">
              <h2>My watchlist</h2>
              <Link href="/market/watchlist" className="link-inline">
                Manage <ArrowRight size={14} />
              </Link>
            </div>
            {hydrated && watchlist.length === 0 ? (
              <p className="muted">Star any stock to add it here.</p>
            ) : (
              <div className="qtable">
                {(wq ?? []).map((q) => (
                  <Link key={q.symbol} href={`/market/stocks/${encodeURIComponent(q.symbol)}`} className="qtable__row">
                    <span>
                      <strong>{q.symbol}</strong>
                      <small>{q.name}</small>
                    </span>
                    <span className="num">₹{num2(q.price)}</span>
                    <Change pct={q.changePct} size="sm" />
                  </Link>
                ))}
              </div>
            )}
          </section>
          <section className="panel theme-news">
            <div className="panel__head">
              <h2>Market news</h2>
              <Link href="/news?category=stock-market-news" className="link-inline">
                More <ArrowRight size={14} />
              </Link>
            </div>
            <div className="stack-sm">
              {news.map((a) => (
                <ArticleCard key={a.id} a={a} variant="row" />
              ))}
            </div>
          </section>
        </div>

        <DataLabel />
      </div>
    </div>
  );
}
