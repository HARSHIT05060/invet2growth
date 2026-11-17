"use client";

import { useState } from "react";
import { Send, Smartphone, Globe, CalendarClock, XCircle } from "lucide-react";
import { useDb, actions } from "@/lib/db/store";
import { PageHeader, DataTable, RowActions } from "@/components/admin/ui";
import { Field, Status } from "@/components/ui/bits";
import { toast } from "@/components/ui/Toast";
import { dateTime, num } from "@/lib/format";

const PLATFORMS = [
  ["android", "Android"],
  ["ios", "iOS"],
  ["web", "Web"],
];

export default function PushPage() {
  const campaigns = useDb((s) => s.pushCampaigns);
  const locations = useDb((s) => s.locations);
  const [d, setD] = useState({ title: "", body: "", link: "", audience: "all", platforms: ["android", "ios", "web"], when: "now", scheduledAt: "" });
  const [err, setErr] = useState("");
  const set = (x) => setD((o) => ({ ...o, ...x }));

  function send(e) {
    e.preventDefault();
    if (!d.title.trim() || d.title.length > 65) return setErr("Title is required (max 65 characters).");
    if (!d.body.trim() || d.body.length > 180) return setErr("Message is required (max 180 characters).");
    if (!d.platforms.length) return setErr("Pick at least one platform.");
    if (d.when === "later" && (!d.scheduledAt || Date.parse(d.scheduledAt) <= Date.now())) return setErr("Pick a future time.");
    setErr("");
    const r = actions.sendPush({ title: d.title.trim(), body: d.body.trim(), link: d.link, audience: d.audience, platforms: d.platforms, scheduledAt: d.when === "later" ? new Date(d.scheduledAt).toISOString() : null });
    toast(r.status === "scheduled" ? "Notification scheduled" : `Sent to ~${num(r.delivered)} devices`);
    setD({ ...d, title: "", body: "", link: "" });
  }

  return (
    <>
      <PageHeader title="Push notification management" description="Send announcements to app and web users. Delivery goes through FCM/APNs in production." />
      <div className="adm-grid adm-grid--2-1">
        <form className="panel form-stack" onSubmit={send} noValidate>
          <div className="panel__head">
            <h2>Compose</h2>
          </div>
          <Field label="Title" hint={`${d.title.length}/65`}>
            <input className="input" value={d.title} onChange={(e) => set({ title: e.target.value })} maxLength={65} />
          </Field>
          <Field label="Message" hint={`${d.body.length}/180`}>
            <textarea className="input" rows={3} value={d.body} onChange={(e) => set({ body: e.target.value })} maxLength={180} />
          </Field>
          <Field label="Open link (optional)" hint="App deep link or website path, e.g. /market">
            <input className="input" value={d.link} onChange={(e) => set({ link: e.target.value })} placeholder="/news/…" />
          </Field>
          <div className="form-grid">
            <Field label="Audience">
              <select className="input" value={d.audience} onChange={(e) => set({ audience: e.target.value })}>
                <option value="all">All users</option>
                <option value="role:owner">Property owners</option>
                <option value="role:agent">Agents, builders & agencies</option>
                <option value="role:buyer">Buyers & tenants</option>
                <option value="segment:watchlist">Users with a stock watchlist</option>
                {locations.map((l) => (
                  <option key={l.id} value={`city:${l.id}`}>
                    City: {l.city}
                  </option>
                ))}
              </select>
            </Field>
            <div className="f">
              <span className="f__label">Platforms</span>
              <div className="row-wrap">
                {PLATFORMS.map(([id, l]) => (
                  <label key={id} className="check">
                    <input type="checkbox" checked={d.platforms.includes(id)} onChange={(e) => set({ platforms: e.target.checked ? [...d.platforms, id] : d.platforms.filter((x) => x !== id) })} />
                    <span>{l}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="seg seg--light">
            <button type="button" className={d.when === "now" ? "is-active" : ""} onClick={() => set({ when: "now" })}>
              Send now
            </button>
            <button type="button" className={d.when === "later" ? "is-active" : ""} onClick={() => set({ when: "later" })}>
              <CalendarClock size={15} /> Schedule
            </button>
          </div>
          {d.when === "later" && (
            <Field label="Send at">
              <input className="input" type="datetime-local" value={d.scheduledAt} onChange={(e) => set({ scheduledAt: e.target.value })} />
            </Field>
          )}
          {err && <p className="f__error">{err}</p>}
          <div>
            <button type="submit" className="btn btn--primary btn--sm">
              <Send size={15} /> {d.when === "later" ? "Schedule notification" : "Send notification"}
            </button>
          </div>
        </form>

        <section className="panel">
          <div className="panel__head">
            <h2>Preview</h2>
          </div>
          <div className="push-preview">
            <div className="push-preview__phone">
              <div className="push-card">
                <div className="push-card__app">
                  <img src="/icon.png" alt="" width="18" height="18" /> invest2growth · now
                </div>
                <strong>{d.title || "Notification title"}</strong>
                <p>{d.body || "Your message appears here."}</p>
              </div>
            </div>
            <p className="muted small">
              <Smartphone size={14} /> Android & iOS · <Globe size={14} /> Web push. Keep titles short; iOS truncates around 40–50 characters on the lock screen.
            </p>
          </div>
        </section>
      </div>

      <section className="panel">
        <div className="panel__head">
          <h2>History</h2>
        </div>
        <DataTable
          rows={campaigns}
          searchKeys={["title", "body"]}
          searchPlaceholder="Search notifications"
          exportName="push-notifications.csv"
          columns={[
            { key: "title", label: "Notification", render: (c) => <span className="cell-stack"><strong>{c.title}</strong><small>{c.body}</small></span> },
            { key: "audience", label: "Audience", render: (c) => <code className="code">{c.audience}</code> },
            { key: "platforms", label: "Platforms", sort: false, render: (c) => c.platforms.join(", ") },
            { key: "status", label: "Status", render: (c) => <Status tone={{ sent: "good", scheduled: "info", cancelled: "neutral" }[c.status]}>{c.status}</Status> },
            { key: "sentAt", label: "Time", sort: (c) => Date.parse(c.sentAt ?? c.scheduledAt ?? 0), render: (c) => <span className="small nowrap">{dateTime(c.sentAt ?? c.scheduledAt)}</span> },
            { key: "delivered", label: "Delivered", className: "r", render: (c) => num(c.delivered) },
            { key: "opened", label: "Open rate", className: "r", sort: (c) => (c.delivered ? c.opened / c.delivered : 0), render: (c) => (c.delivered ? `${((c.opened / c.delivered) * 100).toFixed(1)}%` : "—") },
            {
              key: "actions",
              label: "",
              sort: false,
              render: (c) =>
                c.status === "scheduled" && (
                  <RowActions>
                    <button type="button" className="icon-btn icon-btn--sm" title="Cancel" aria-label="Cancel scheduled notification" onClick={() => { actions.adminSave("pushCampaigns", { ...c, status: "cancelled" }, "Cancelled push"); toast("Scheduled notification cancelled"); }}>
                      <XCircle size={15} />
                    </button>
                  </RowActions>
                ),
            },
          ]}
        />
      </section>
    </>
  );
}
