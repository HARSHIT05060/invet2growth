"use client";

import { useEffect, useState } from "react";
import { Plus, X, CalendarX } from "lucide-react";
import { useDb, actions } from "@/lib/db/store";
import { INDICES, STOCKS } from "@/mock/stocks";
import { marketSession } from "@/lib/market/session";
import { PageHeader, DataTable } from "@/components/admin/ui";
import { Field, Toggle, Status } from "@/components/ui/bits";
import { toast } from "@/components/ui/Toast";
import { date, dateTime } from "@/lib/format";

export default function MarketConfigPage() {
  const cfg = useDb((s) => s.marketConfig);
  const [d, setD] = useState(cfg);
  const [holiday, setHoliday] = useState({ date: "", name: "" });
  const set = (x) => setD((o) => ({ ...o, ...x }));
  const dirty = JSON.stringify(d) !== JSON.stringify(cfg);
  const session = marketSession(new Date(), d.holidays);

  useEffect(() => setD(cfg), [cfg]);

  function save() {
    if (!d.trackedIndices.length) return toast("Track at least one index", "error");
    actions.updateConfig("marketConfig", d, "Updated market configuration");
    toast("Market configuration saved");
  }

  return (
    <>
      <PageHeader
        title="Stock market configuration"
        description="What the market dashboard shows and how often it refreshes."
        actions={
          <>
            <button type="button" className="btn btn--ghost btn--sm" disabled={!dirty} onClick={() => setD(cfg)}>
              Discard
            </button>
            <button type="button" className="btn btn--primary btn--sm" disabled={!dirty} onClick={save}>
              Save changes
            </button>
          </>
        }
      />

      <div className="adm-grid adm-grid--2">
        <section className="panel form-stack">
          <div className="panel__head">
            <h2>Dashboard</h2>
            <Status tone={session.state === "open" ? "good" : session.state === "pre-open" ? "warn" : "neutral"}>{session.label}</Status>
          </div>
          <div className="f">
            <span className="f__label">Tracked indices</span>
            <div className="tiles tiles--sm">
              {INDICES.map((i) => {
                const on = d.trackedIndices.includes(i.id);
                return (
                  <button key={i.id} type="button" className={`tile${on ? " is-active" : ""}`} aria-pressed={on} onClick={() => set({ trackedIndices: on ? d.trackedIndices.filter((x) => x !== i.id) : [...d.trackedIndices, i.id] })}>
                    {i.name}
                  </button>
                );
              })}
            </div>
          </div>
          <Toggle label="Show SENSEX (BSE)" description="Requires a BSE data licence in production" checked={d.showSensex} onChange={(v) => set({ showSensex: v })} />
          <div className="form-grid">
            <Field label="Data label shown to users" hint="Only choose real-time if your provider licence allows it">
              <select className="input" value={d.dataLabel} onChange={(e) => set({ dataLabel: e.target.value })}>
                <option value="delayed">Delayed (up to 15 min)</option>
                <option value="realtime">Real-time</option>
              </select>
            </Field>
            <Field label="Refresh interval (seconds)" hint="Polling fallback when WebSocket isn't available">
              <input className="input" type="number" min="2" max="300" value={d.refreshSeconds} onChange={(e) => set({ refreshSeconds: Math.max(2, Number(e.target.value) || 5) })} />
            </Field>
            <Field label="Movers list length">
              <select className="input" value={d.moversCount} onChange={(e) => set({ moversCount: Number(e.target.value) })}>
                {[5, 10, 15].map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
            </Field>
          </div>
        </section>

        <section className="panel form-stack">
          <div className="panel__head">
            <h2>
              <CalendarX size={18} /> Trading holidays
            </h2>
          </div>
          <p className="muted small">The market shows as closed on these dates. Next session: {session.nextOpen ? dateTime(session.nextOpen) : "now"}.</p>
          <ul className="holidays">
            {[...d.holidays].sort((a, b) => a.date.localeCompare(b.date)).map((h) => (
              <li key={h.date}>
                <strong>{date(`${h.date}T12:00:00+05:30`, { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</strong>
                <span>{h.name}</span>
                <button type="button" className="icon-btn icon-btn--sm" aria-label={`Remove ${h.name}`} onClick={() => set({ holidays: d.holidays.filter((x) => x.date !== h.date) })}>
                  <X size={14} />
                </button>
              </li>
            ))}
          </ul>
          <form
            className="inline-add"
            onSubmit={(e) => {
              e.preventDefault();
              if (!holiday.date || !holiday.name.trim()) return;
              if (d.holidays.some((h) => h.date === holiday.date)) return toast("That date is already a holiday", "error");
              set({ holidays: [...d.holidays, { date: holiday.date, name: holiday.name.trim() }] });
              setHoliday({ date: "", name: "" });
            }}
          >
            <input className="input input--sm" type="date" value={holiday.date} onChange={(e) => setHoliday({ ...holiday, date: e.target.value })} aria-label="Holiday date" />
            <input className="input input--sm" value={holiday.name} onChange={(e) => setHoliday({ ...holiday, name: e.target.value })} placeholder="Holiday name" aria-label="Holiday name" />
            <button type="submit" className="btn btn--ghost btn--sm">
              <Plus size={15} /> Add
            </button>
          </form>
        </section>
      </div>

      <section className="panel">
        <div className="panel__head">
          <h2>Symbol master</h2>
          <span className="muted small">{STOCKS.length - d.disabledSymbols.length} of {STOCKS.length} enabled · synced from the provider</span>
        </div>
        <DataTable
          rows={STOCKS.map((s) => ({ ...s, id: s.symbol }))}
          searchKeys={["symbol", "name", "sector"]}
          searchPlaceholder="Search symbol, company or sector"
          pageSize={12}
          bulk={[
            { label: "Enable", onClick: (ids) => set({ disabledSymbols: d.disabledSymbols.filter((x) => !ids.includes(x)) }) },
            { label: "Disable", danger: true, onClick: (ids) => set({ disabledSymbols: [...new Set([...d.disabledSymbols, ...ids])] }) },
          ]}
          columns={[
            { key: "symbol", label: "NSE symbol", render: (s) => <code className="code">{s.symbol}</code> },
            { key: "name", label: "Company" },
            { key: "sector", label: "Sector" },
            {
              key: "enabled",
              label: "Shown in movers & search",
              sort: (s) => Number(!d.disabledSymbols.includes(s.symbol)),
              render: (s) => {
                const on = !d.disabledSymbols.includes(s.symbol);
                return (
                  <button
                    type="button"
                    className={`mini-toggle${on ? " is-on" : ""}`}
                    aria-pressed={on}
                    aria-label={on ? `Disable ${s.symbol}` : `Enable ${s.symbol}`}
                    onClick={() => set({ disabledSymbols: on ? [...d.disabledSymbols, s.symbol] : d.disabledSymbols.filter((x) => x !== s.symbol) })}
                  >
                    <span />
                  </button>
                );
              },
            },
          ]}
        />
      </section>
      {dirty && (
        <div className="savebar">
          <span>You have unsaved changes</span>
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => setD(cfg)}>
            Discard
          </button>
          <button type="button" className="btn btn--primary btn--sm" onClick={save}>
            Save changes
          </button>
        </div>
      )}
    </>
  );
}
