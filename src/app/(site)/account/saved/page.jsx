"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Heart, LineChart, Bookmark, GitCompareArrows } from "lucide-react";
import { useDb, actions } from "@/lib/db/store";
import PropertyCard from "@/components/property/PropertyCard";
import ArticleCard from "@/components/news/ArticleCard";
import { Empty, Change } from "@/components/ui/bits";
import { useMarket } from "@/lib/market/hooks";
import { num2 } from "@/lib/format";

function Saved() {
  const params = useSearchParams();
  const [tab, setTab] = useState(params.get("tab") ?? "properties");
  const me = useDb((s) => s.me);
  const props = useDb((s) => me.wishlist.map((id) => s.properties.find((p) => p.id === id && !p.deletedAt)).filter(Boolean), [me.wishlist]);
  const articles = useDb((s) => me.bookmarks.map((id) => s.articles.find((a) => a.id === id)).filter(Boolean), [me.bookmarks]);
  const { data: quotes } = useMarket((m, cfg) => m.quotes(me.watchlist, cfg), [me.watchlist.join()]);

  const TABS = [
    ["properties", "Properties", props.length],
    ["stocks", "Stocks", me.watchlist.length],
    ["articles", "Articles", articles.length],
  ];

  return (
    <>
      <div className="acct__head">
        <h1>Saved items</h1>
        <p className="muted">Properties, stocks and articles you&apos;ve saved.</p>
      </div>
      <div className="tabs" role="tablist">
        {TABS.map(([id, label, n]) => (
          <button key={id} type="button" role="tab" aria-selected={tab === id} className={tab === id ? "is-active" : ""} onClick={() => setTab(id)}>
            {label} <span>{n}</span>
          </button>
        ))}
      </div>

      {tab === "properties" &&
        (props.length ? (
          <>
            {me.compare.length > 0 && (
              <Link href="/compare" className="btn btn--ghost btn--sm mb-16">
                <GitCompareArrows size={16} /> Compare selected ({me.compare.length})
              </Link>
            )}
            <div className="listings listings--2">
              {props.map((p, i) => (
                <PropertyCard key={p.id} p={p} i={i} reveal={false} />
              ))}
            </div>
          </>
        ) : (
          <Empty icon={Heart} title="No saved properties" text="Tap the heart on any listing to save it here." action={{ label: "Browse properties", href: "/properties" }} />
        ))}

      {tab === "stocks" &&
        (me.watchlist.length ? (
          <div className="panel">
            <div className="panel__head">
              <h2>Watchlist</h2>
              <Link href="/market/watchlist" className="link-inline">
                Manage watchlist & alerts
              </Link>
            </div>
            <div className="qtable">
              {(quotes ?? []).map((q) => (
                <div key={q.symbol} className="qtable__row">
                  <Link href={`/market/stocks/${encodeURIComponent(q.symbol)}`}>
                    <strong>{q.symbol}</strong>
                    <small>{q.name}</small>
                  </Link>
                  <span className="num">₹{num2(q.price)}</span>
                  <Change value={q.change} pct={q.changePct} size="sm" />
                  <button type="button" className="link-inline" onClick={() => actions.toggleWatch(q.symbol)}>
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <Empty icon={LineChart} title="Your watchlist is empty" text="Add stocks from the market dashboard to track them here." action={{ label: "Go to market", href: "/market" }} />
        ))}

      {tab === "articles" &&
        (articles.length ? (
          <div className="news-grid">
            {articles.map((a) => (
              <ArticleCard key={a.id} a={a} />
            ))}
          </div>
        ) : (
          <Empty icon={Bookmark} title="No saved articles" text="Bookmark articles to read them later." action={{ label: "Read news", href: "/news" }} />
        ))}
    </>
  );
}

export default function SavedPage() {
  return (
    <Suspense fallback={null}>
      <Saved />
    </Suspense>
  );
}
