// SIMULATED market data provider for UI development.
//
// Prices are generated deterministically from the symbol and the trading day,
// so every visitor sees the same numbers and charts are stable on refresh.
// Nothing here is real NSE/BSE data. In production this file is replaced by an
// adapter for a licensed vendor (see ../README.md for the interface).

import { STOCKS, INDICES } from "@/mock/stocks";
import { MARKET_CONFIG } from "@/mock/admin";
import { marketSession, previousTradingDays } from "../session";

const OPEN_MIN = 9 * 60 + 15;
const SESSION_MIN = 375; // 09:15 → 15:30
const STEPS = 75; // 5-minute bars

const INSTRUMENTS = new Map([
  ...STOCKS.map((s) => [s.symbol, { ...s, kind: "stock" }]),
  ...INDICES.map((i) => [i.id, { symbol: i.id, name: i.name, base: i.base, vol: i.vol, kind: "index", exchange: i.exchange }]),
]);

/* ───── Deterministic randomness ───── */
function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  return h >>> 0;
}
function rng(seed) {
  let a = hash(seed);
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const gauss = (r) => {
  const u = Math.max(r(), 1e-9);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r());
};

/* ───── Series generation (memoised per symbol + session day) ───── */
const memo = new Map();

function build(symbol, day, holidays) {
  const key = `${symbol}|${day}`;
  if (memo.has(key)) return memo.get(key);
  const inst = INSTRUMENTS.get(symbol);
  const r = rng(key);

  // Previous close wanders a little around the reference price day to day.
  const prevClose = inst.base * (1 + (rng(`${symbol}|${day}|pc`)() - 0.5) * 0.06);

  // ~5 years of daily closes, ending at prevClose.
  const N = 1260;
  const closes = new Array(N);
  closes[N - 1] = prevClose;
  const r2 = rng(`${symbol}|hist`);
  for (let i = N - 1; i > 0; i--) closes[i - 1] = closes[i] / (1 + 0.00045 + inst.vol * gauss(r2));
  const dates = previousTradingDays(day, N, holidays); // oldest → newest, excluding `day`

  // Intraday path for the session day.
  const open = prevClose * (1 + gauss(r) * inst.vol * 0.35);
  const path = [open];
  const stepVol = inst.vol / Math.sqrt(STEPS);
  const drift = gauss(r) * inst.vol * 0.4 / STEPS;
  for (let i = 1; i <= STEPS; i++) path.push(path[i - 1] * (1 + drift + stepVol * gauss(r)));

  const volFactor = 0.6 + r() * 0.9;
  const out = { inst, prevClose, closes, dates, path, volFactor };
  memo.set(key, out);
  if (memo.size > 400) memo.delete(memo.keys().next().value);
  return out;
}

function snapshot(symbol, now = new Date(), cfg = MARKET_CONFIG) {
  const inst = INSTRUMENTS.get(symbol);
  if (!inst) return null;
  const sess = marketSession(now, cfg.holidays);
  const s = build(symbol, sess.sessionDate, cfg.holidays);
  const idx = Math.round(sess.progress * STEPS);
  let price = s.path[idx];
  if (sess.state === "open") {
    // Small jitter between bars so the UI visibly updates while the market is open.
    const j = rng(`${symbol}|${Math.floor(now.getTime() / 5000)}`);
    price *= 1 + (j() - 0.5) * inst.vol * 0.02;
  }
  const seen = s.path.slice(0, idx + 1).concat(price);
  const high = Math.max(...seen);
  const low = Math.min(...seen);
  const yearCloses = s.closes.slice(-250).concat(price);
  const volume = inst.kind === "stock" ? Math.round(inst.avgVol * s.volFactor * Math.max(sess.progress, 0.02)) : null;
  const change = price - s.prevClose;
  return {
    symbol,
    name: inst.name,
    sector: inst.sector ?? null,
    kind: inst.kind,
    exchange: inst.exchange ?? "NSE",
    price,
    open: s.path[0],
    prevClose: s.prevClose,
    high,
    low,
    change,
    changePct: (change / s.prevClose) * 100,
    volume,
    value: volume ? volume * price : null,
    high52: Math.max(...yearCloses),
    low52: Math.min(...yearCloses),
    marketCap: inst.shares ? inst.shares * 1e7 * price : null,
    asOf: now.toISOString(),
    session: sess,
    source: "simulated",
  };
}

function history(symbol, range, now = new Date(), cfg = MARKET_CONFIG) {
  const q = snapshot(symbol, now, cfg);
  if (!q) return [];
  const sess = q.session;
  const s = build(symbol, sess.sessionDate, cfg.holidays);
  const dayStart = Date.parse(`${sess.sessionDate}T09:15:00+05:30`);

  if (range === "1D") {
    const idx = Math.round(sess.progress * STEPS);
    const pts = s.path.slice(0, idx + 1).map((v, i) => ({ t: dayStart + i * 5 * 60000, v }));
    if (sess.state === "open") pts.push({ t: now.getTime(), v: q.price });
    return pts;
  }

  if (range === "1W") {
    // Last 4 sessions as hourly Brownian bridges between closes, then today.
    const pts = [];
    const n = s.closes.length;
    for (let d = 4; d >= 1; d--) {
      const from = s.closes[n - d - 1];
      const to = s.closes[n - d];
      const base = Date.parse(`${s.dates[s.dates.length - d]}T09:15:00+05:30`);
      const r = rng(`${symbol}|${s.dates[s.dates.length - d]}|w`);
      let w = 0;
      for (let h = 0; h <= 6; h++) {
        w += gauss(r) * q.price * symbolVol(symbol) * 0.25;
        const lin = from + ((to - from) * h) / 6;
        pts.push({ t: base + h * 62.5 * 60000, v: h === 6 ? to : lin + w * (1 - h / 6) });
      }
    }
    const idx = Math.round(sess.progress * STEPS);
    for (let i = 0; i <= idx; i += 12) pts.push({ t: dayStart + i * 5 * 60000, v: s.path[i] });
    pts.push({ t: now.getTime(), v: q.price });
    return pts;
  }

  const days = { "1M": 22, "3M": 65, "6M": 130, "1Y": 250, "5Y": 1250 }[range] ?? 22;
  const step = range === "5Y" ? 5 : 1;
  const pts = [];
  const n = s.closes.length;
  for (let i = n - days; i < n; i += step) {
    pts.push({ t: Date.parse(`${s.dates[i]}T15:30:00+05:30`), v: s.closes[i] });
  }
  pts.push({ t: now.getTime(), v: q.price });
  return pts;
}

const symbolVol = (symbol) => INSTRUMENTS.get(symbol)?.vol ?? 0.01;

/* ───── Provider interface ───── */
export const mockProvider = {
  id: "mock",
  label: "Simulated (development)",
  realtime: false,

  async status(cfg) {
    return marketSession(new Date(), cfg?.holidays ?? MARKET_CONFIG.holidays);
  },
  async quote(symbol, cfg) {
    const q = snapshot(symbol, new Date(), cfg);
    if (!q) throw Object.assign(new Error(`Unknown symbol ${symbol}`), { code: "NOT_FOUND" });
    return q;
  },
  async quotes(symbols, cfg) {
    const now = new Date();
    return symbols.map((s) => snapshot(s, now, cfg)).filter(Boolean);
  },
  async universe() {
    return STOCKS.map(({ symbol, name, sector }) => ({ symbol, name, sector }));
  },
  async indices(ids, cfg) {
    const now = new Date();
    return (ids ?? INDICES.map((i) => i.id)).map((id) => snapshot(id, now, cfg)).filter(Boolean);
  },
  async history(symbol, range, cfg) {
    return history(symbol, range, new Date(), cfg);
  },
};
