"use client";

import { useState } from "react";
import Link from "next/link";
import { Trash2, BellPlus, Star, Pause, Play, Bell } from "lucide-react";
import { useMarket } from "@/lib/market/hooks";
import { useDb, useHydrated, actions } from "@/lib/db/store";
import { num2, compact, inr2, dateTime } from "@/lib/format";
import { Change, Empty } from "@/components/ui/bits";
import { toast } from "@/components/ui/Toast";
import StockSearch from "@/components/market/StockSearch";
import DataLabel from "@/components/market/DataLabel";
import MarketStatus from "@/components/market/MarketStatus";
import { AlertModal } from "@/components/market/StockDetail";

export default function WatchlistPage() {
  const hydrated = useHydrated();
  const watchlist = useDb((s) => s.me.watchlist);
  const alerts = useDb((s) => s.me.alerts);
  const { data } = useMarket((m, cfg) => m.quotes(watchlist, cfg), [watchlist.join()]);
  const [alertFor, setAlertFor] = useState(null);

  if (!hydrated) return <div className="container page-pad muted">Loading…</div>;

  return (
    <div className="theme-market">
      <div className="container page-pad">
        <div className="mkt-head">
          <div>
            <p className="eyebrow">Market</p>
            <h1 className="h-page">Watchlist & alerts</h1>
            <div className="mkt-head__meta">
              <MarketStatus />
            </div>
          </div>
          <div className="mkt-head__search">
            <StockSearch
              placeholder="Add a stock to your watchlist"
              onPick={(sym) => {
                if (watchlist.includes(sym)) return toast(`${sym} is already in your watchlist`, "info");
                actions.toggleWatch(sym);
                toast(`${sym} added to watchlist`);
              }}
            />
          </div>
        </div>

        <section className="panel">
          <div className="panel__head">
            <h2>
              <Star size={18} /> Watchlist ({watchlist.length})
            </h2>
          </div>
          {watchlist.length === 0 ? (
            <Empty title="Your watchlist is empty" text="Search above to add stocks you want to track." />
          ) : (
            <div className="table-wrap">
              <table className="dtable">
                <thead>
                  <tr>
                    <th>Company</th>
                    <th className="r">LTP (₹)</th>
                    <th className="r">Change</th>
                    <th className="r hide-sm">Day range</th>
                    <th className="r hide-sm">52W range</th>
                    <th className="r hide-sm">Volume</th>
                    <th className="r">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(data ?? []).map((q) => (
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
                      <td className="r num small hide-sm">
                        {num2(q.low)} – {num2(q.high)}
                      </td>
                      <td className="r num small hide-sm">
                        {num2(q.low52)} – {num2(q.high52)}
                      </td>
                      <td className="r num hide-sm">{compact(q.volume)}</td>
                      <td className="r nowrap">
                        <button type="button" className="icon-btn icon-btn--sm" onClick={() => setAlertFor(q)} aria-label={`Set alert for ${q.symbol}`} title="Set price alert">
                          <BellPlus size={16} />
                        </button>
                        <button
                          type="button"
                          className="icon-btn icon-btn--sm"
                          onClick={() => {
                            actions.toggleWatch(q.symbol);
                            toast(`${q.symbol} removed`);
                          }}
                          aria-label={`Remove ${q.symbol}`}
                          title="Remove"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="panel">
          <div className="panel__head">
            <h2>
              <Bell size={18} /> Price alerts ({alerts.length})
            </h2>
          </div>
          {alerts.length === 0 ? (
            <p className="muted">No alerts yet. Use the bell icon on any stock to create one.</p>
          ) : (
            <ul className="alerts">
              {alerts.map((a) => (
                <li key={a.id}>
                  <Link href={`/market/stocks/${encodeURIComponent(a.symbol)}`}>
                    <strong>{a.symbol}</strong>
                  </Link>
                  <span>
                    {a.condition} {inr2(a.price)}
                  </span>
                  <span className={`status status--${a.active ? "good" : a.triggeredAt ? "info" : "neutral"}`}>
                    {a.active ? "Active" : a.triggeredAt ? `Triggered ${dateTime(a.triggeredAt)}` : "Paused"}
                  </span>
                  <span className="alerts__btns">
                    <button
                      type="button"
                      className="icon-btn icon-btn--sm"
                      onClick={() => actions.updateAlert(a.id, { active: !a.active, triggeredAt: null })}
                      aria-label={a.active ? "Pause alert" : "Resume alert"}
                      title={a.active ? "Pause" : "Resume"}
                    >
                      {a.active ? <Pause size={15} /> : <Play size={15} />}
                    </button>
                    <button type="button" className="icon-btn icon-btn--sm" onClick={() => actions.removeAlert(a.id)} aria-label="Delete alert" title="Delete">
                      <Trash2 size={15} />
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <DataLabel />
      </div>
      {alertFor && <AlertModal open onClose={() => setAlertFor(null)} q={alertFor} />}
    </div>
  );
}
