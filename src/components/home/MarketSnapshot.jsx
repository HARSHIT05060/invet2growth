"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useMarket } from "@/lib/market/hooks";
import { num2 } from "@/lib/format";
import { Change, Skeleton } from "@/components/ui/bits";
import MarketStatus from "@/components/market/MarketStatus";
import DataLabel from "@/components/market/DataLabel";

export default function MarketSnapshot() {
  const { data } = useMarket(async (m, cfg) => {
    const [indices, movers] = await Promise.all([m.indices(cfg.trackedIndices, cfg), m.movers(cfg, 4)]);
    return { indices, movers };
  });

  return (
    <section className="section theme-market" id="market">
      <div className="container">
        <div className="mkt-band" data-reveal>
          <div className="section__head">
            <div>
              <p className="eyebrow">Markets today</p>
              <h2>
                Track the <em>market</em>, alongside your property.
              </h2>
            </div>
            <div className="section__tools">
              <MarketStatus />
              <Link href="/market" className="link-arrow">
                Market dashboard <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          <div className="idx-row">
            {(data?.indices ?? Array.from({ length: 4 }, (_, i) => ({ symbol: i }))).map((q) => (
              <Link key={q.symbol} href={q.name ? `/market/stocks/${q.symbol}` : "/market"} className="idx-card">
                {q.name ? (
                  <>
                    <span className="idx-card__name">{q.name}</span>
                    <span className="idx-card__val num">{num2(q.price)}</span>
                    <Change value={q.change} pct={q.changePct} size="sm" />
                  </>
                ) : (
                  <>
                    <Skeleton w="50%" />
                    <Skeleton h={28} w="80%" />
                    <Skeleton w="60%" />
                  </>
                )}
              </Link>
            ))}
          </div>

          <div className="mkt-band__movers">
            {[
              ["Top gainers", data?.movers.gainers],
              ["Top losers", data?.movers.losers],
            ].map(([title, rows]) => (
              <div key={title} className="mini-table">
                <h3>{title}</h3>
                {(rows ?? []).map((q) => (
                  <Link key={q.symbol} href={`/market/stocks/${encodeURIComponent(q.symbol)}`} className="mini-table__row">
                    <span>
                      <strong>{q.symbol}</strong>
                      <small>{q.name}</small>
                    </span>
                    <span className="num">₹{num2(q.price)}</span>
                    <Change pct={q.changePct} size="sm" />
                  </Link>
                ))}
                {rows && !rows.length && <p className="muted small">None right now.</p>}
              </div>
            ))}
          </div>
          <DataLabel />
        </div>
      </div>
    </section>
  );
}
