// NSE trading-session calendar, computed in IST.
// Regular session 09:15–15:30, pre-open 09:00–09:15, Monday–Friday, minus holidays.

const IST_OFFSET = 330 * 60000;

/** IST calendar parts for a Date. */
export function ist(d = new Date()) {
  const t = new Date(d.getTime() + IST_OFFSET);
  return {
    date: t.toISOString().slice(0, 10),
    dow: t.getUTCDay(),
    minutes: t.getUTCHours() * 60 + t.getUTCMinutes(),
  };
}

const addDays = (iso, n) => new Date(Date.parse(`${iso}T00:00:00Z`) + n * 864e5).toISOString().slice(0, 10);
const dow = (iso) => new Date(`${iso}T00:00:00Z`).getUTCDay();

export function isTradingDay(iso, holidays = []) {
  const d = dow(iso);
  return d !== 0 && d !== 6 && !holidays.some((h) => h.date === iso);
}

/** `n` trading days before `iso` (exclusive), oldest first. */
export function previousTradingDays(iso, n, holidays = []) {
  const out = [];
  let d = iso;
  while (out.length < n) {
    d = addDays(d, -1);
    if (isTradingDay(d, holidays)) out.push(d);
  }
  return out.reverse();
}

function nextTradingDay(iso, holidays) {
  let d = addDays(iso, 1);
  while (!isTradingDay(d, holidays)) d = addDays(d, 1);
  return d;
}

/**
 * Current market state.
 * sessionDate — the session whose prices are shown (today once trading starts, else the last session).
 * progress    — 0..1 through that session.
 */
export function marketSession(now = new Date(), holidays = []) {
  const { date: today, minutes } = ist(now);
  const tradingToday = isTradingDay(today, holidays);
  const holiday = holidays.find((h) => h.date === today);
  const OPEN = 555;
  const CLOSE = 930;

  let state = "closed";
  let sessionDate;
  let progress = 1;
  let reason = holiday ? `Holiday: ${holiday.name}` : !tradingToday ? "Weekend" : null;

  if (tradingToday && minutes >= OPEN) {
    sessionDate = today;
    if (minutes < CLOSE) {
      state = "open";
      progress = (minutes - OPEN) / (CLOSE - OPEN);
    } else reason = "Closed for the day";
  } else {
    sessionDate = previousTradingDays(today, 1, holidays)[0];
    if (tradingToday && minutes >= 540) state = "pre-open";
    else if (tradingToday) reason = "Opens at 9:15 AM";
  }

  const next = state === "open" ? null : tradingToday && minutes < OPEN ? today : nextTradingDay(today, holidays);

  return {
    state,
    label: { open: "Market open", closed: "Market closed", "pre-open": "Pre-open session" }[state],
    reason,
    sessionDate,
    progress,
    nextOpen: next ? `${next}T09:15:00+05:30` : null,
  };
}
