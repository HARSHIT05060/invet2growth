"use client";

import { useState } from "react";
import Link from "next/link";
import { BellPlus, GitCompareArrows, Star, Trash2, LineChart as LineIcon } from "lucide-react";
import { useMarket, useTick } from "@/lib/market/hooks";
import { useDb, useHydrated, actions } from "@/lib/db/store";
import { num2, compact, inr2, dateTime } from "@/lib/format";
import { publishedArticles } from "@/lib/articles";
import { Change, Skeleton, ShareButton, Empty, Field } from "@/components/ui/bits";
import Modal from "@/components/ui/Modal";
import { toast } from "@/components/ui/Toast";
import MarketStatus from "./MarketStatus";
import DataLabel from "./DataLabel";
import StockChart from "./StockChart";
import StockSearch from "./StockSearch";
import ArticleCard from "@/components/news/ArticleCard";

function RangeBar({ low, high, value, label }) {
  const pos = high > low ? ((value - low) / (high - low)) * 100 : 50;
  return (
    <div className="rbar">
      <span className="rbar__label">{label}</span>
      <div className="rbar__track">
        <i style={{ left: `${Math.min(100, Math.max(0, pos))}%` }} aria-hidden="true" />
      </div>
      <div className="rbar__ends">
        <span>L {num2(low)}</span>
        <span>H {num2(high)}</span>
      </div>
    </div>
  );
}

export default function StockDetail({ symbol }) {
  const hydrated = useHydrated();
  const { data: q, error, loading } = useMarket((m, cfg) => m.quote(symbol, cfg), [symbol]);
  const dir = useTick(q?.price);
  const watching = useDb((s) => s.me.watchlist.includes(symbol), [symbol]) && hydrated;
  const alerts = useDb((s) => s.me.alerts.filter((a) => a.symbol === symbol), [symbol]);
  const news = useDb((s) => publishedArticles(s.articles).filter((a) => ["stock-market-news", "market-analysis"].includes(a.category)).slice(0, 3));
  const [alertOpen, setAlertOpen] = useState(false);

  if (error && !q) {
    return (
      <div className="container page-pad theme-market">
        <Empty icon={LineIcon} title={error.code === "NOT_FOUND" ? `We couldn't find "${symbol}"` : "Quote unavailable"} text="Check the symbol or search for another company." />
        <div className="narrow mt-24">
          <StockSearch />
        </div>
      </div>
    );
  }

  const stats = q && [
    ["Previous close", num2(q.prevClose)],
    ["Open", num2(q.open)],
    ["Day high", num2(q.high)],
    ["Day low", num2(q.low)],
    q.volume != null && ["Volume", compact(q.volume)],
    q.value != null && ["Traded value", `₹${compact(q.value)}`],
    ["52-week high", num2(q.high52)],
    ["52-week low", num2(q.low52)],
    q.marketCap != null && ["Market cap", `₹${compact(q.marketCap)}`],
    q.sector && ["Sector", q.sector],
  ].filter(Boolean);

  return (
    <div className="theme-market">
      <div className="container page-pad">
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link href="/market">Market</Link>
          <span>/</span>
          <span>{symbol}</span>
        </nav>

        <div className="sd-head">
          <div>
            <p className="sd-head__sym">
              {q?.exchange ?? "NSE"}: <strong>{symbol}</strong> {q?.kind === "index" && <span className="ptag">Index</span>}
            </p>
            <h1 className="h-page">{q?.name ?? <Skeleton w={280} h={36} />}</h1>
            {q ? (
              <div className="sd-price">
                <span className={`sd-price__val num${dir ? ` flash-${dir}` : ""}`}>{q.kind === "index" ? num2(q.price) : inr2(q.price)}</span>
                <Change value={q.change} pct={q.changePct} size="lg" />
              </div>
            ) : (
              <Skeleton h={44} w={260} />
            )}
            <div className="sd-head__meta">
              <MarketStatus />
              {q && <span className="muted small">As of {dateTime(q.asOf)} IST</span>}
              {q?.stale && <span className="status status--warn">Showing last known price</span>}
            </div>
          </div>
          <div className="sd-head__actions">
            <button
              type="button"
              className={`btn btn--sm ${watching ? "btn--ghost is-on" : "btn--primary"}`}
              aria-pressed={watching}
              onClick={() => toast(actions.toggleWatch(symbol) ? "Added to watchlist" : "Removed from watchlist")}
            >
              <Star size={16} /> {watching ? "In watchlist" : "Add to watchlist"}
            </button>
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => setAlertOpen(true)} disabled={!q}>
              <BellPlus size={16} /> Price alert
            </button>
            <Link href={`/market/compare?s=${encodeURIComponent(symbol)}`} className="btn btn--ghost btn--sm">
              <GitCompareArrows size={16} /> Compare
            </Link>
            <ShareButton title={`${symbol} on invest2growth`} />
          </div>
        </div>

        <div className="sd-grid">
          <section className="panel">{q || loading ? <StockChart symbol={symbol} prevClose={q?.prevClose} /> : null}</section>
          <aside className="panel">
            <h2 className="panel__title">Key statistics</h2>
            {q ? (
              <>
                <RangeBar label="Day range" low={q.low} high={q.high} value={q.price} />
                <RangeBar label="52-week range" low={q.low52} high={q.high52} value={q.price} />
                <dl className="kv">
                  {stats.map(([k, v]) => (
                    <div key={k}>
                      <dt>{k}</dt>
                      <dd className="num">{v}</dd>
                    </div>
                  ))}
                </dl>
              </>
            ) : (
              <Skeleton h={260} />
            )}
          </aside>
        </div>

        {hydrated && alerts.length > 0 && (
          <section className="panel">
            <div className="panel__head">
              <h2>Your alerts on {symbol}</h2>
              <Link href="/market/watchlist" className="link-inline">
                All alerts
              </Link>
            </div>
            <ul className="alerts">
              {alerts.map((a) => (
                <li key={a.id}>
                  <span>
                    Price {a.condition} <strong>{inr2(a.price)}</strong>
                  </span>
                  <span className={`status status--${a.active ? "good" : "neutral"}`}>{a.active ? "Active" : a.triggeredAt ? "Triggered" : "Paused"}</span>
                  <button type="button" className="icon-btn icon-btn--sm" onClick={() => actions.removeAlert(a.id)} aria-label="Delete alert">
                    <Trash2 size={15} />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="panel theme-news">
          <div className="panel__head">
            <h2>Market news & analysis</h2>
          </div>
          <div className="news-grid">
            {news.map((a) => (
              <ArticleCard key={a.id} a={a} />
            ))}
          </div>
        </section>

        <DataLabel />
      </div>

      {q && <AlertModal open={alertOpen} onClose={() => setAlertOpen(false)} q={q} />}
    </div>
  );
}

export function AlertModal({ open, onClose, q }) {
  const [condition, setCondition] = useState("above");
  const [price, setPrice] = useState("");
  const [err, setErr] = useState("");
  function submit(e) {
    e.preventDefault();
    const p = Number(price);
    if (!p || p <= 0) return setErr("Enter a valid price");
    if (condition === "above" && p <= q.price) return setErr(`For "above", pick a price higher than the current ${num2(q.price)}`);
    if (condition === "below" && p >= q.price) return setErr(`For "below", pick a price lower than the current ${num2(q.price)}`);
    actions.addAlert({ symbol: q.symbol, condition, price: p });
    toast(`Alert set: ${q.symbol} ${condition} ₹${num2(p)}`);
    setErr("");
    setPrice("");
    onClose();
  }
  return (
    <Modal open={open} onClose={onClose} title={`Price alert for ${q.symbol}`} size="sm">
      <form className="form-stack" onSubmit={submit} noValidate>
        <p className="muted">
          Current price: <strong>₹{num2(q.price)}</strong>
        </p>
        <div className="seg seg--light seg--full">
          {["above", "below"].map((c) => (
            <button key={c} type="button" className={condition === c ? "is-active" : ""} onClick={() => setCondition(c)}>
              Goes {c}
            </button>
          ))}
        </div>
        <Field label="Target price (₹)" error={err}>
          <input className="input" type="number" step="0.05" min="0" value={price} onChange={(e) => setPrice(e.target.value)} placeholder={num2(q.price * (condition === "above" ? 1.05 : 0.95))} />
        </Field>
        <div className="chips">
          {[-5, -2, 2, 5].map((p) => (
            <button
              key={p}
              type="button"
              className="chip"
              onClick={() => {
                setCondition(p > 0 ? "above" : "below");
                setPrice((q.price * (1 + p / 100)).toFixed(2));
              }}
            >
              {p > 0 ? "+" : "−"}
              {Math.abs(p)}%
            </button>
          ))}
        </div>
        <p className="muted small">You&apos;ll get a notification when the price crosses this level. Alerts are informational, not trading instructions.</p>
        <button type="submit" className="btn btn--primary btn--block">
          <BellPlus size={16} /> Create alert
        </button>
      </form>
    </Modal>
  );
}
