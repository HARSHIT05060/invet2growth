// Provider-independent market data client.
//
// Pages and components call `market.*` only. The active provider is picked by
// NEXT_PUBLIC_MARKET_PROVIDER (default "mock"). Each call is cached for a few
// seconds, and if the provider fails the last good value is returned with
// `stale: true` so the UI can say so instead of breaking.
//
// To add a licensed vendor: implement the same methods as providers/mock.js
// (ideally behind the backend's /api/v1/market endpoints) and register it below.

import { mockProvider } from "./providers/mock";

const PROVIDERS = { mock: mockProvider };

const active = PROVIDERS[process.env.NEXT_PUBLIC_MARKET_PROVIDER ?? "mock"] ?? mockProvider;

const cache = new Map();

async function cached(key, ttlMs, fn) {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < ttlMs) return hit.value;
  try {
    const value = await fn();
    cache.set(key, { at: Date.now(), value });
    return value;
  } catch (err) {
    if (hit) return Array.isArray(hit.value) ? Object.assign([...hit.value], { stale: true }) : { ...hit.value, stale: true };
    throw err;
  }
}

export const market = {
  provider: { id: active.id, label: active.label, realtime: active.realtime },

  status: (cfg) => cached("status", 15000, () => active.status(cfg)),
  quote: (symbol, cfg) => cached(`q:${symbol}`, 3000, () => active.quote(symbol, cfg)),
  quotes: (symbols, cfg) => cached(`qs:${symbols.join(",")}`, 3000, () => active.quotes(symbols, cfg)),
  indices: (ids, cfg) => cached(`ix:${(ids ?? []).join(",")}`, 3000, () => active.indices(ids, cfg)),
  universe: () => cached("universe", 60 * 60000, () => active.universe()),
  history: (symbol, range, cfg) => cached(`h:${symbol}:${range}`, range === "1D" ? 5000 : 60000, () => active.history(symbol, range, cfg)),

  async search(q, limit = 8) {
    const all = await market.universe();
    const s = q.trim().toLowerCase();
    if (!s) return [];
    return all
      .filter((x) => x.symbol.toLowerCase().includes(s) || x.name.toLowerCase().includes(s))
      .sort((a, b) => Number(b.symbol.toLowerCase().startsWith(s)) - Number(a.symbol.toLowerCase().startsWith(s)))
      .slice(0, limit);
  },

  /** Top gainers / losers / volume / active (by traded value). */
  async movers(cfg, n = 5) {
    const all = await market.universe();
    const enabled = all.filter((s) => !(cfg?.disabledSymbols ?? []).includes(s.symbol)).map((s) => s.symbol);
    const qs = await market.quotes(enabled, cfg);
    const by = (k, dir = -1) => [...qs].sort((a, b) => dir * (a[k] - b[k])).slice(0, n);
    return {
      gainers: by("changePct").filter((q) => q.changePct > 0),
      losers: by("changePct", 1).filter((q) => q.changePct < 0),
      volume: by("volume"),
      active: by("value"),
      all: qs,
      breadth: { up: qs.filter((q) => q.change > 0).length, down: qs.filter((q) => q.change < 0).length, flat: qs.filter((q) => q.change === 0).length },
    };
  },
};
