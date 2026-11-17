"use client";

import { useState } from "react";
import { Plus, Pencil, X, MapPin } from "lucide-react";
import { useDb, actions } from "@/lib/db/store";
import { PageHeader, DataTable, RowActions } from "@/components/admin/ui";
import { Field, Toggle } from "@/components/ui/bits";
import Modal from "@/components/ui/Modal";
import { toast } from "@/components/ui/Toast";
import { slugify } from "@/lib/format";

export default function LocationsPage() {
  const locations = useDb((s) => s.locations);
  const usage = useDb((s) => s.properties.reduce((a, p) => ((a[p.city] = (a[p.city] || 0) + 1), a), {}));
  const [edit, setEdit] = useState(null);
  const states = [...new Set(locations.map((l) => l.state))].sort();

  return (
    <>
      <PageHeader
        title="Location management"
        description={`${locations.length} cities in ${states.length} states · ${locations.reduce((n, l) => n + l.localities.length, 0)} localities`}
        actions={
          <button type="button" className="btn btn--primary btn--sm" onClick={() => setEdit({ localities: [], active: true })}>
            <Plus size={16} /> Add city
          </button>
        }
      />
      <section className="panel">
        <DataTable
          rows={locations}
          searchKeys={["city", "state", (l) => l.localities.join(" ")]}
          searchPlaceholder="Search city, state or locality"
          exportName="locations.csv"
          exportRow={(l) => ({ city: l.city, state: l.state, lat: l.lat, lng: l.lng, active: l.active, localities: l.localities.join("; ") })}
          columns={[
            { key: "city", label: "City", render: (l) => <span className="cell-stack"><strong>{l.city}</strong><small>{l.lat.toFixed(3)}, {l.lng.toFixed(3)}</small></span> },
            { key: "state", label: "State" },
            {
              key: "localities",
              label: "Localities",
              sort: (l) => l.localities.length,
              render: (l) => (
                <span className="chips">
                  {l.localities.slice(0, 4).map((x) => (
                    <span key={x} className="ptag">
                      {x}
                    </span>
                  ))}
                  {l.localities.length > 4 && <span className="muted small">+{l.localities.length - 4} more</span>}
                </span>
              ),
            },
            { key: "listings", label: "Listings", className: "r", sort: (l) => usage[l.city] ?? 0, render: (l) => usage[l.city] ?? 0 },
            {
              key: "active",
              label: "Visible",
              sort: (l) => Number(l.active),
              render: (l) => (
                <button
                  type="button"
                  className={`mini-toggle${l.active ? " is-on" : ""}`}
                  aria-pressed={l.active}
                  aria-label={l.active ? `Hide ${l.city}` : `Show ${l.city}`}
                  onClick={() => actions.adminSave("locations", { ...l, active: !l.active }, l.active ? `Hid ${l.city}` : `Activated ${l.city}`)}
                >
                  <span />
                </button>
              ),
            },
            {
              key: "actions",
              label: "",
              sort: false,
              render: (l) => (
                <RowActions>
                  <button type="button" className="icon-btn icon-btn--sm" aria-label={`Edit ${l.city}`} onClick={() => setEdit(l)}>
                    <Pencil size={15} />
                  </button>
                </RowActions>
              ),
            },
          ]}
        />
      </section>
      {edit && <CityForm loc={edit} onClose={() => setEdit(null)} existing={locations} />}
    </>
  );
}

function CityForm({ loc, onClose, existing }) {
  const isNew = !loc.id;
  const [d, setD] = useState({ city: "", state: "", lat: "", lng: "", ...loc });
  const [newLoc, setNewLoc] = useState("");
  const [err, setErr] = useState("");
  const set = (x) => setD((o) => ({ ...o, ...x }));

  function addLocality(e) {
    e.preventDefault();
    const v = newLoc.trim();
    if (!v || d.localities.includes(v)) return;
    set({ localities: [...d.localities, v] });
    setNewLoc("");
  }

  function save() {
    if (!d.city.trim() || !d.state.trim()) return setErr("City and state are required.");
    if (Number.isNaN(Number(d.lat)) || Number.isNaN(Number(d.lng)) || d.lat === "" || d.lng === "") return setErr("Enter valid latitude and longitude.");
    if (isNew && existing.some((l) => l.city.toLowerCase() === d.city.trim().toLowerCase())) return setErr("This city already exists.");
    const rec = { ...d, city: d.city.trim(), lat: Number(d.lat), lng: Number(d.lng) };
    // Locations use a readable slug id rather than a generated one.
    actions.adminSave("locations", isNew ? { ...rec, id: slugify(rec.city) } : rec, `${isNew ? "Added" : "Edited"} ${rec.city}`);
    toast(isNew ? "City added" : "City saved");
    onClose();
  }

  return (
    <Modal
      open
      side
      onClose={onClose}
      title={isNew ? "Add city" : `Edit ${loc.city}`}
      footer={
        <>
          <button type="button" className="btn btn--ghost btn--sm" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn btn--primary btn--sm" onClick={save}>
            Save
          </button>
        </>
      }
    >
      <div className="form-stack">
        <div className="form-grid">
          <Field label="City">
            <input className="input" value={d.city} onChange={(e) => set({ city: e.target.value })} />
          </Field>
          <Field label="State">
            <input className="input" value={d.state} onChange={(e) => set({ state: e.target.value })} />
          </Field>
          <Field label="Latitude">
            <input className="input" inputMode="decimal" value={d.lat} onChange={(e) => set({ lat: e.target.value })} />
          </Field>
          <Field label="Longitude">
            <input className="input" inputMode="decimal" value={d.lng} onChange={(e) => set({ lng: e.target.value })} />
          </Field>
        </div>
        <Toggle label="Visible on the website" description="Shown in search filters and the post-property form" checked={d.active} onChange={(v) => set({ active: v })} />
        <div className="f">
          <span className="f__label">Localities ({d.localities.length})</span>
          <div className="chips">
            {d.localities.map((x) => (
              <span key={x} className="fchip fchip--legend">
                <MapPin size={13} /> {x}
                <button type="button" aria-label={`Remove ${x}`} onClick={() => set({ localities: d.localities.filter((y) => y !== x) })}>
                  <X size={13} />
                </button>
              </span>
            ))}
          </div>
          <form className="inline-add mt-16" onSubmit={addLocality}>
            <input className="input input--sm" value={newLoc} onChange={(e) => setNewLoc(e.target.value)} placeholder="Add locality" aria-label="Add locality" />
            <button type="submit" className="btn btn--ghost btn--sm">
              <Plus size={15} /> Add
            </button>
          </form>
        </div>
        {err && <p className="f__error">{err}</p>}
      </div>
    </Modal>
  );
}
