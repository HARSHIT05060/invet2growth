"use client";

import { useMarket } from "@/lib/market/hooks";
import { dateTime } from "@/lib/format";

export default function MarketStatus() {
  const { data: s } = useMarket((m, cfg) => m.status(cfg));
  if (!s) return <span className="mstatus">Checking market…</span>;
  return (
    <span className={`mstatus mstatus--${s.state}`} title={s.nextOpen ? `Next session: ${dateTime(s.nextOpen)}` : undefined}>
      <i aria-hidden="true" />
      {s.label}
      {s.reason && s.state !== "open" && <small>· {s.reason}</small>}
    </span>
  );
}
