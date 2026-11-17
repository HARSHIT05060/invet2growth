"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Pause, Play, ImagePlus } from "lucide-react";
import { useDb, actions } from "@/lib/db/store";
import { AD_PLACEMENTS } from "@/mock/admin";
import { PageHeader, DataTable, FilterSelect, RowActions, StatCard } from "@/components/admin/ui";
import { Status, Field } from "@/components/ui/bits";
import Modal, { Confirm } from "@/components/ui/Modal";
import { toast } from "@/components/ui/Toast";
import { date, num, compact } from "@/lib/format";
import { Megaphone, MousePointerClick, Eye, Percent } from "lucide-react";

const TONE = { active: "good", scheduled: "info", paused: "warn", ended: "neutral" };
const placement = (id) => AD_PLACEMENTS.find((p) => p.id === id)?.label ?? id;

export default function AdsPage() {
  const ads = useDb((s) => s.ads);
  const [status, setStatus] = useState("");
  const [edit, setEdit] = useState(null);
  const [del, setDel] = useState(null);
  const imp = ads.reduce((s, a) => s + a.impressions, 0);
  const clk = ads.reduce((s, a) => s + a.clicks, 0);

  return (
    <>
      <PageHeader
        title="Advertisement management"
        description="Banner campaigns across the website and app."
        actions={
          <button type="button" className="btn btn--primary btn--sm" onClick={() => setEdit({ placement: "home-mid", status: "scheduled" })}>
            <Plus size={16} /> New campaign
          </button>
        }
      />
      <div className="astat-grid astat-grid--4">
        <StatCard icon={Megaphone} label="Active campaigns" value={ads.filter((a) => a.status === "active").length} />
        <StatCard icon={Eye} label="Impressions" value={compact(imp)} />
        <StatCard icon={MousePointerClick} label="Clicks" value={num(clk)} />
        <StatCard icon={Percent} label="Average CTR" value={`${imp ? ((clk / imp) * 100).toFixed(2) : "0.00"}%`} />
      </div>
      <section className="panel">
        <DataTable
          rows={ads.filter((a) => !status || a.status === status)}
          searchKeys={["name", "advertiser"]}
          searchPlaceholder="Search campaigns"
          exportName="ad-campaigns.csv"
          filters={<FilterSelect label="Status" value={status} onChange={setStatus} options={[["", "All"], ["active", "Active"], ["scheduled", "Scheduled"], ["paused", "Paused"], ["ended", "Ended"]]} />}
          columns={[
            {
              key: "name",
              label: "Campaign",
              render: (a) => (
                <div className="cell-prop">
                  <img src={a.image} alt="" />
                  <span>
                    <strong>{a.name}</strong>
                    <small>{a.advertiser}</small>
                  </span>
                </div>
              ),
            },
            { key: "placement", label: "Placement", render: (a) => placement(a.placement) },
            { key: "startsAt", label: "Flight", render: (a) => <span className="small nowrap">{date(`${a.startsAt}T00:00:00+05:30`)} – {date(`${a.endsAt}T00:00:00+05:30`)}</span> },
            { key: "impressions", label: "Impr.", className: "r", render: (a) => compact(a.impressions) },
            { key: "clicks", label: "Clicks", className: "r", render: (a) => num(a.clicks) },
            { key: "ctr", label: "CTR", className: "r", sort: (a) => (a.impressions ? a.clicks / a.impressions : 0), render: (a) => (a.impressions ? `${((a.clicks / a.impressions) * 100).toFixed(2)}%` : "—") },
            { key: "status", label: "Status", render: (a) => <Status tone={TONE[a.status]}>{a.status}</Status> },
            {
              key: "actions",
              label: "",
              sort: false,
              render: (a) => (
                <RowActions>
                  {a.status === "active" && (
                    <button type="button" className="icon-btn icon-btn--sm" title="Pause" aria-label="Pause" onClick={() => { actions.adminSave("ads", { ...a, status: "paused" }, "Paused campaign"); toast("Campaign paused"); }}>
                      <Pause size={15} />
                    </button>
                  )}
                  {a.status === "paused" && (
                    <button type="button" className="icon-btn icon-btn--sm" title="Resume" aria-label="Resume" onClick={() => { actions.adminSave("ads", { ...a, status: "active" }, "Resumed campaign"); toast("Campaign resumed"); }}>
                      <Play size={15} />
                    </button>
                  )}
                  <button type="button" className="icon-btn icon-btn--sm" title="Edit" aria-label="Edit" onClick={() => setEdit(a)}>
                    <Pencil size={15} />
                  </button>
                  <button type="button" className="icon-btn icon-btn--sm" title="Delete" aria-label="Delete" onClick={() => setDel(a)}>
                    <Trash2 size={15} />
                  </button>
                </RowActions>
              ),
            },
          ]}
          empty="No campaigns"
        />
      </section>
      {edit && <AdForm ad={edit} onClose={() => setEdit(null)} />}
      <Confirm open={!!del} onClose={() => setDel(null)} danger title={`Delete “${del?.name}”?`} message="Reporting data for this campaign will be removed." confirmLabel="Delete" onConfirm={() => { actions.adminRemove("ads", del.id); toast("Campaign deleted"); }} />
    </>
  );
}

function AdForm({ ad, onClose }) {
  const [d, setD] = useState({ name: "", advertiser: "", url: "", image: "", startsAt: "", endsAt: "", impressions: 0, clicks: 0, ...ad });
  const [err, setErr] = useState("");
  const set = (x) => setD((o) => ({ ...o, ...x }));

  function onImage(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => set({ image: r.result });
    r.readAsDataURL(f);
  }

  function save() {
    if (!d.name.trim() || !d.advertiser.trim()) return setErr("Name and advertiser are required.");
    if (!d.image) return setErr("Upload a banner image.");
    if (!/^(https?:\/\/|\/)/.test(d.url)) return setErr("Enter a valid click-through URL.");
    if (!d.startsAt || !d.endsAt || d.endsAt < d.startsAt) return setErr("Pick a valid start and end date.");
    const today = new Date().toISOString().slice(0, 10);
    const status = d.status === "paused" ? "paused" : d.endsAt < today ? "ended" : d.startsAt > today ? "scheduled" : "active";
    actions.adminSave("ads", { ...d, status }, ad.id ? `Edited campaign ${d.name}` : `Created campaign ${d.name}`);
    toast("Campaign saved");
    onClose();
  }

  return (
    <Modal
      open
      side
      onClose={onClose}
      title={ad.id ? "Edit campaign" : "New campaign"}
      footer={
        <>
          <button type="button" className="btn btn--ghost btn--sm" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn btn--primary btn--sm" onClick={save}>
            Save campaign
          </button>
        </>
      }
    >
      <div className="form-stack">
        <Field label="Campaign name">
          <input className="input" value={d.name} onChange={(e) => set({ name: e.target.value })} />
        </Field>
        <Field label="Advertiser">
          <input className="input" value={d.advertiser} onChange={(e) => set({ advertiser: e.target.value })} />
        </Field>
        <Field label="Placement">
          <select className="input" value={d.placement} onChange={(e) => set({ placement: e.target.value })}>
            {AD_PLACEMENTS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </Field>
        <div className="f">
          <span className="f__label">Banner image</span>
          {d.image ? (
            <div className="feat-img">
              <img src={d.image} alt="Banner preview" />
              <button type="button" className="thumbs__btn" onClick={() => set({ image: "" })} aria-label="Remove image">
                ×
              </button>
            </div>
          ) : (
            <label className="dropzone dropzone--sm">
              <ImagePlus size={22} />
              <span className="small">Upload banner (JPG/PNG/WebP)</span>
              <input type="file" accept="image/*" hidden onChange={onImage} />
            </label>
          )}
        </div>
        <Field label="Click-through URL">
          <input className="input" value={d.url} onChange={(e) => set({ url: e.target.value })} placeholder="https://" />
        </Field>
        <div className="form-grid">
          <Field label="Starts">
            <input className="input" type="date" value={d.startsAt} onChange={(e) => set({ startsAt: e.target.value })} />
          </Field>
          <Field label="Ends">
            <input className="input" type="date" value={d.endsAt} onChange={(e) => set({ endsAt: e.target.value })} />
          </Field>
        </div>
        <p className="muted small">Ads must be clearly labelled “Sponsored”. Financial product ads must comply with SEBI/RBI advertising codes.</p>
        {err && <p className="f__error">{err}</p>}
      </div>
    </Modal>
  );
}
