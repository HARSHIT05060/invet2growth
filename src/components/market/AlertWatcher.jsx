"use client";

// Checks the visitor's active price alerts against (simulated) quotes every 30s.
// In production this runs on the backend and arrives as a push notification.

import { useEffect } from "react";
import { getState, setState } from "@/lib/db/store";
import { market } from "@/lib/market";
import { toast } from "@/components/ui/Toast";
import { inr2 } from "@/lib/format";

export default function AlertWatcher() {
  useEffect(() => {
    let alive = true;
    async function check() {
      const s = getState();
      const active = s.me.alerts.filter((a) => a.active);
      if (!active.length) return;
      const quotes = await market.quotes([...new Set(active.map((a) => a.symbol))], s.marketConfig);
      if (!alive) return;
      const fired = active.filter((a) => {
        const q = quotes.find((x) => x.symbol === a.symbol);
        return q && (a.condition === "above" ? q.price >= a.price : q.price <= a.price);
      });
      if (!fired.length) return;
      const cur = getState();
      setState({
        me: { ...cur.me, alerts: cur.me.alerts.map((a) => (fired.some((f) => f.id === a.id) ? { ...a, active: false, triggeredAt: new Date().toISOString() } : a)) },
        notifications: [
          ...fired.map((a) => ({
            id: `nt-${a.id}-${Date.now()}`,
            userId: cur.session?.userId ?? null,
            title: `${a.symbol} is ${a.condition} ${inr2(a.price)}`,
            body: "Your price alert was triggered (simulated data).",
            link: `/market/stocks/${encodeURIComponent(a.symbol)}`,
            kind: "alert",
            read: false,
            createdAt: new Date().toISOString(),
          })),
          ...cur.notifications,
        ],
      });
      fired.forEach((a) => toast(`Price alert: ${a.symbol} is ${a.condition} ${inr2(a.price)}`, "info"));
    }
    check();
    const t = setInterval(check, 30000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);
  return null;
}
