"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Eye, Pencil, Trash2, RotateCcw, BadgeCheck, Star } from "lucide-react";
import { useDb, actions, getState } from "@/lib/db/store";
import { PageHeader, DataTable, FilterSelect, RowActions } from "@/components/admin/ui";
import { Status, Field, Toggle } from "@/components/ui/bits";
import Modal, { Confirm } from "@/components/ui/Modal";
import { toast } from "@/components/ui/Toast";
import { categoryLabel, priceText, statusLabel, STATUS_TONES, listingLabel } from "@/lib/property";
import { date, num } from "@/lib/format";
import { SEGMENTS } from "@/mock/catalog";

function Properties() {
  const params = useSearchParams();
  const [status, setStatus] = useState(params.get("status") ?? "");
  const [segment, setSegment] = useState("");
  const [type, setType] = useState("");
  const [city, setCity] = useState("");
  const [edit, setEdit] = useState(null);
  const [del, setDel] = useState(null);
  const all = useDb((s) => s.properties);
  const cats = useDb((s) => s.propertyCategories);
  const cities = [...new Set(all.map((p) => p.city))].sort();

  const rows = all.filter(
    (p) =>
      (status === "trash" ? p.deletedAt : !p.deletedAt) &&
      (!status || status === "trash" || p.status === status) &&
      (!segment || p.segment === segment) &&
      (!type || p.listingType === type) &&
      (!city || p.city === city)
  );

  const patch = (id, change, label) => {
    const p = getState().properties.find((x) => x.id === id);
    actions.adminSave("properties", { ...p, ...change }, label);
  };

  const bulkSet = (ids, change, label) => {
    ids.forEach((id) => actions.adminSave("properties", { ...getState().properties.find((x) => x.id === id), ...change }, label));
    toast(`${ids.length} listing${ids.length > 1 ? "s" : ""} updated`);
  };

  return (
    <>
      <PageHeader
        title="Properties"
        description={`${num(all.filter((p) => !p.deletedAt).length)} listings across ${cities.length} cities`}
        actions={
          <Link href="/admin/approvals" className="btn btn--primary btn--sm">
            Review pending ({all.filter((p) => p.status === "pending" && !p.deletedAt).length})
          </Link>
        }
      />
      <section className="panel">
        <DataTable
          rows={rows}
          searchKeys={["title", "id", "locality", "city", (r) => r.postedBy?.name]}
          searchPlaceholder="Search title, ID, locality or owner"
          exportName="properties.csv"
          exportRow={(p) => ({ id: p.id, title: p.title, category: categoryLabel(p.category, cats), type: p.listingType, price: p.price, city: p.city, locality: p.locality, status: p.status, verified: p.verified, featured: p.featured, views: p.views, owner: p.postedBy?.name, postedAt: p.postedAt })}
          filters={
            <>
              <FilterSelect label="Status" value={status} onChange={setStatus} options={[["", "All statuses"], ["active", "Live"], ["pending", "Pending"], ["draft", "Draft"], ["rejected", "Rejected"], ["sold", "Sold"], ["rented", "Rented"], ["trash", "Trash"]]} />
              <FilterSelect label="Segment" value={segment} onChange={setSegment} options={[["", "All segments"], ...SEGMENTS.map((s) => [s.id, s.label])]} />
              <FilterSelect label="Type" value={type} onChange={setType} options={[["", "Sale / rent / lease"], ["sale", "Sale"], ["rent", "Rent"], ["lease", "Lease"]]} />
              <FilterSelect label="City" value={city} onChange={setCity} options={[["", "All cities"], ...cities.map((c) => [c, c])]} />
            </>
          }
          bulk={
            status === "trash"
              ? [{ label: "Restore", onClick: (ids) => ids.forEach((id) => actions.adminRestore("properties", id)) }]
              : [
                  { label: "Mark verified", onClick: (ids) => bulkSet(ids, { verified: true }, "Bulk verify") },
                  { label: "Feature", onClick: (ids) => bulkSet(ids, { featured: true }, "Bulk feature") },
                  { label: "Unpublish", onClick: (ids) => bulkSet(ids, { status: "draft" }, "Bulk unpublish") },
                  { label: "Delete", danger: true, onClick: (ids) => { ids.forEach((id) => actions.adminRemove("properties", id, { soft: true })); toast("Moved to trash"); } },
                ]
          }
          columns={[
            {
              key: "title",
              label: "Property",
              render: (p) => (
                <div className="cell-prop">
                  <img src={p.images[0]} alt="" />
                  <span>
                    <Link href={`/properties/${p.id}`} target="_blank">
                      {p.title}
                    </Link>
                    <small>
                      {p.id} · {categoryLabel(p.category, cats)}
                    </small>
                  </span>
                </div>
              ),
            },
            { key: "price", label: "Price", className: "r", render: (p) => <span className="num">{priceText(p)}</span> },
            { key: "listingType", label: "Type", render: (p) => listingLabel(p.listingType) },
            { key: "city", label: "Location", render: (p) => `${p.locality}, ${p.city}` },
            { key: "owner", label: "Posted by", sort: (p) => p.postedBy?.name, render: (p) => <span className="small">{p.postedBy?.name}<br /><span className="muted">{p.postedBy?.role}</span></span> },
            { key: "status", label: "Status", render: (p) => <Status tone={p.deletedAt ? "bad" : STATUS_TONES[p.status]}>{p.deletedAt ? "Deleted" : statusLabel(p.status)}</Status> },
            {
              key: "flags",
              label: "Flags",
              sort: false,
              render: (p) => (
                <span className="row-actions">
                  <button type="button" className={`flag${p.verified ? " is-on" : ""}`} title={p.verified ? "Verified (click to unverify)" : "Mark verified"} aria-pressed={p.verified} onClick={() => patch(p.id, { verified: !p.verified }, p.verified ? "Unverified" : "Verified")}>
                    <BadgeCheck size={16} />
                  </button>
                  <button type="button" className={`flag flag--star${p.featured ? " is-on" : ""}`} title={p.featured ? "Featured (click to unfeature)" : "Feature on home page"} aria-pressed={p.featured} onClick={() => patch(p.id, { featured: !p.featured }, p.featured ? "Unfeatured" : "Featured")}>
                    <Star size={16} />
                  </button>
                </span>
              ),
            },
            { key: "views", label: "Views", className: "r", render: (p) => <span className="num">{num(p.views)}</span> },
            { key: "postedAt", label: "Posted", sort: (p) => Date.parse(p.postedAt), render: (p) => <span className="small nowrap">{date(p.postedAt)}</span> },
            {
              key: "actions",
              label: "",
              sort: false,
              render: (p) => (
                <RowActions>
                  <Link href={`/properties/${p.id}`} target="_blank" className="icon-btn icon-btn--sm" aria-label="View" title="View">
                    <Eye size={15} />
                  </Link>
                  {p.deletedAt ? (
                    <button type="button" className="icon-btn icon-btn--sm" aria-label="Restore" title="Restore" onClick={() => { actions.adminRestore("properties", p.id); toast("Listing restored"); }}>
                      <RotateCcw size={15} />
                    </button>
                  ) : (
                    <>
                      <button type="button" className="icon-btn icon-btn--sm" aria-label="Edit" title="Edit" onClick={() => setEdit(p)}>
                        <Pencil size={15} />
                      </button>
                      <button type="button" className="icon-btn icon-btn--sm" aria-label="Delete" title="Delete" onClick={() => setDel(p)}>
                        <Trash2 size={15} />
                      </button>
                    </>
                  )}
                </RowActions>
              ),
            },
          ]}
          empty="No properties match these filters"
        />
      </section>

      {edit && <EditProperty p={edit} onClose={() => setEdit(null)} />}
      <Confirm
        open={!!del}
        onClose={() => setDel(null)}
        danger
        title="Move listing to trash?"
        message={`${del?.id} will be hidden from the site. You can restore it from the Trash filter.`}
        confirmLabel="Move to trash"
        onConfirm={() => {
          actions.adminRemove("properties", del.id, { soft: true });
          toast("Moved to trash");
        }}
      />
    </>
  );
}

function EditProperty({ p, onClose }) {
  const cats = useDb((s) => s.propertyCategories);
  const [d, setD] = useState(p);
  const set = (x) => setD((o) => ({ ...o, ...x }));
  return (
    <Modal
      open
      side
      onClose={onClose}
      title={`Edit ${p.id}`}
      footer={
        <>
          <button type="button" className="btn btn--ghost btn--sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn--primary btn--sm"
            onClick={() => {
              if (!d.title.trim() || !(Number(d.price) > 0)) return toast("Title and a valid price are required", "error");
              actions.adminSave("properties", { ...d, price: Number(d.price) }, "Edited listing");
              toast("Listing saved");
              onClose();
            }}
          >
            Save changes
          </button>
        </>
      }
    >
      <div className="form-stack">
        <Field label="Title">
          <input className="input" value={d.title} onChange={(e) => set({ title: e.target.value })} />
        </Field>
        <div className="form-grid">
          <Field label="Category">
            <select className="input" value={d.category} onChange={(e) => set({ category: e.target.value, segment: cats.find((c) => c.id === e.target.value)?.segment })}>
              {cats.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Listing type">
            <select className="input" value={d.listingType} onChange={(e) => set({ listingType: e.target.value })}>
              <option value="sale">Sale</option>
              <option value="rent">Rent</option>
              <option value="lease">Lease</option>
            </select>
          </Field>
          <Field label="Price (₹)">
            <input className="input" type="number" value={d.price} onChange={(e) => set({ price: e.target.value })} />
          </Field>
          <Field label="Status">
            <select className="input" value={d.status} onChange={(e) => set({ status: e.target.value })}>
              {["active", "pending", "draft", "rejected", "sold", "rented"].map((s) => (
                <option key={s} value={s}>
                  {statusLabel(s)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="RERA number">
            <input className="input" value={d.rera ?? ""} onChange={(e) => set({ rera: e.target.value || null })} />
          </Field>
          <Field label="Pincode">
            <input className="input" value={d.pincode} onChange={(e) => set({ pincode: e.target.value })} />
          </Field>
        </div>
        <Field label="Description">
          <textarea className="input" rows={6} value={d.description} onChange={(e) => set({ description: e.target.value })} />
        </Field>
        <Toggle label="Verified" description="Shows the verified badge to buyers" checked={d.verified} onChange={(v) => set({ verified: v })} />
        <Toggle label="Featured" description="Eligible for the home page and hero card" checked={d.featured} onChange={(v) => set({ featured: v })} />
      </div>
    </Modal>
  );
}

export default function PropertiesPage() {
  return (
    <Suspense fallback={null}>
      <Properties />
    </Suspense>
  );
}
