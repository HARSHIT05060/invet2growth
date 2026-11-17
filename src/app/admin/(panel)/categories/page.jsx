"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { useDb, actions, setState } from "@/lib/db/store";
import { SEGMENTS } from "@/mock/catalog";
import { PageHeader, RowActions } from "@/components/admin/ui";
import { Field, Status } from "@/components/ui/bits";
import Modal, { Confirm } from "@/components/ui/Modal";
import { toast } from "@/components/ui/Toast";
import { slugify } from "@/lib/format";

const TABS = [
  ["property", "Property categories"],
  ["amenities", "Amenities"],
  ["articles", "Article categories"],
  ["tags", "Article tags"],
];

export default function CategoriesPage() {
  const [tab, setTab] = useState("property");
  return (
    <>
      <PageHeader title="Category management" description="Taxonomies used across listings, search filters and the news CMS." />
      <div className="tabs mb-16">
        {TABS.map(([id, l]) => (
          <button key={id} type="button" className={tab === id ? "is-active" : ""} onClick={() => setTab(id)}>
            {l}
          </button>
        ))}
      </div>
      {tab === "property" && <PropertyCategories />}
      {tab === "amenities" && <SimpleList collection="amenities" title="Amenities" usageKey="amenities" />}
      {tab === "articles" && <ArticleCategories />}
      {tab === "tags" && <Tags />}
    </>
  );
}

function PropertyCategories() {
  const cats = useDb((s) => s.propertyCategories);
  const usage = useDb((s) => s.properties.reduce((a, p) => ((a[p.category] = (a[p.category] || 0) + 1), a), {}));
  const [edit, setEdit] = useState(null);
  const [del, setDel] = useState(null);

  return (
    <>
      <div className="adm-grid adm-grid--3">
        {SEGMENTS.map((seg) => (
          <section key={seg.id} className="panel">
            <div className="panel__head">
              <h2>{seg.label}</h2>
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => setEdit({ segment: seg.id, active: true })}>
                <Plus size={15} /> Add
              </button>
            </div>
            <ul className="cat-list">
              {cats
                .filter((c) => c.segment === seg.id)
                .map((c) => (
                  <li key={c.id}>
                    <img src={c.image} alt="" />
                    <span className="cell-stack">
                      <strong>{c.label}</strong>
                      <small>
                        {usage[c.id] ?? 0} listings · <code className="code">{c.id}</code>
                      </small>
                    </span>
                    <button
                      type="button"
                      className={`mini-toggle${c.active ? " is-on" : ""}`}
                      aria-pressed={c.active}
                      title={c.active ? "Active — click to hide" : "Hidden — click to activate"}
                      onClick={() => actions.adminSave("propertyCategories", { ...c, active: !c.active }, c.active ? "Hid category" : "Activated category")}
                    >
                      <span />
                    </button>
                    <RowActions>
                      <button type="button" className="icon-btn icon-btn--sm" aria-label="Edit" onClick={() => setEdit(c)}>
                        <Pencil size={14} />
                      </button>
                      <button type="button" className="icon-btn icon-btn--sm" aria-label="Delete" onClick={() => setDel(c)}>
                        <Trash2 size={14} />
                      </button>
                    </RowActions>
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </div>

      {edit && (
        <Modal open size="sm" onClose={() => setEdit(null)} title={edit.id ? `Edit ${edit.label}` : "Add category"}>
          <form
            className="form-stack"
            onSubmit={(e) => {
              e.preventDefault();
              const d = Object.fromEntries(new FormData(e.currentTarget));
              if (!d.label.trim()) return;
              const isNew = !edit.id;
              const id = isNew ? slugify(d.label) : edit.id;
              if (isNew && cats.some((c) => c.id === id)) return toast("A category with this name exists", "error");
              setState((s) => ({
                propertyCategories: isNew
                  ? [...s.propertyCategories, { id, segment: d.segment, label: d.label, image: d.image || "/images/categories/flats.webp", active: true }]
                  : s.propertyCategories.map((c) => (c.id === id ? { ...c, ...d } : c)),
              }));
              actions.log(`propertyCategories.${isNew ? "create" : "update"}`, id, d.label);
              toast(isNew ? "Category added" : "Category saved");
              setEdit(null);
            }}
          >
            <Field label="Name">
              <input className="input" name="label" defaultValue={edit.label} autoFocus />
            </Field>
            <Field label="Segment">
              <select className="input" name="segment" defaultValue={edit.segment}>
                {SEGMENTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Image path" hint="Uploaded to object storage in production">
              <input className="input" name="image" defaultValue={edit.image ?? "/images/categories/flats.webp"} />
            </Field>
            <button type="submit" className="btn btn--primary btn--sm">
              Save
            </button>
          </form>
        </Modal>
      )}

      <Confirm
        open={!!del}
        onClose={() => setDel(null)}
        danger
        title={`Delete “${del?.label}”?`}
        message={usage[del?.id] ? `${usage[del?.id]} listings use this category. Hide it instead to keep existing listings intact.` : "This category isn't used by any listing."}
        confirmLabel={usage[del?.id] ? "Hide instead" : "Delete"}
        onConfirm={() => {
          if (usage[del.id]) actions.adminSave("propertyCategories", { ...del, active: false }, "Hid category");
          else actions.adminRemove("propertyCategories", del.id);
          toast(usage[del.id] ? "Category hidden" : "Category deleted");
        }}
      />
    </>
  );
}

function SimpleList({ collection, title, usageKey }) {
  const items = useDb((s) => s[collection]);
  const usage = useDb((s) => s.properties.reduce((a, p) => (p[usageKey] ?? []).reduce((b, id) => ((b[id] = (b[id] || 0) + 1), b), a), {}));
  const [label, setLabel] = useState("");
  return (
    <section className="panel">
      <div className="panel__head">
        <h2>{title}</h2>
        <form
          className="inline-add"
          onSubmit={(e) => {
            e.preventDefault();
            if (!label.trim()) return;
            const id = slugify(label);
            if (items.some((x) => x.id === id)) return toast("Already exists", "error");
            setState((s) => ({ [collection]: [...s[collection], { id, label: label.trim(), active: true }] }));
            actions.log(`${collection}.create`, id, label.trim());
            toast("Added");
            setLabel("");
          }}
        >
          <input className="input input--sm" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="New amenity" aria-label="New amenity" />
          <button type="submit" className="btn btn--primary btn--sm">
            <Plus size={15} /> Add
          </button>
        </form>
      </div>
      <ul className="tag-grid">
        {items.map((a) => (
          <li key={a.id} className={a.active ? "" : "is-off"}>
            <button
              type="button"
              className={`mini-toggle${a.active ? " is-on" : ""}`}
              aria-pressed={a.active}
              aria-label={a.active ? `Hide ${a.label}` : `Show ${a.label}`}
              onClick={() => {
                setState((s) => ({ [collection]: s[collection].map((x) => (x.id === a.id ? { ...x, active: !x.active } : x)) }));
                actions.log(`${collection}.update`, a.id, a.active ? "Hidden" : "Activated");
              }}
            >
              <span />
            </button>
            <span>{a.label}</span>
            <small className="muted">{usage[a.id] ?? 0}</small>
            {!usage[a.id] && (
              <button type="button" className="icon-btn icon-btn--sm" aria-label={`Delete ${a.label}`} onClick={() => actions.adminRemove(collection, a.id)}>
                <X size={13} />
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function ArticleCategories() {
  const cats = useDb((s) => s.articleCategories);
  const usage = useDb((s) => s.articles.reduce((a, x) => ((a[x.category] = (a[x.category] || 0) + 1), a), {}));
  const [label, setLabel] = useState("");
  const [color, setColor] = useState("news");
  return (
    <section className="panel">
      <div className="panel__head panel__head--wrap">
        <h2>Article categories</h2>
        <form
          className="inline-add"
          onSubmit={(e) => {
            e.preventDefault();
            if (!label.trim()) return;
            const id = slugify(label);
            if (cats.some((c) => c.id === id)) return toast("Already exists", "error");
            setState((s) => ({ articleCategories: [...s.articleCategories, { id, label: label.trim(), color }] }));
            actions.log("articleCategories.create", id, label.trim());
            toast("Category added");
            setLabel("");
          }}
        >
          <input className="input input--sm" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="New category" aria-label="New category" />
          <select className="input input--sm" value={color} onChange={(e) => setColor(e.target.value)} aria-label="Colour group">
            <option value="news">News</option>
            <option value="market">Market</option>
            <option value="tips">Tips / education</option>
            <option value="property">Property</option>
          </select>
          <button type="submit" className="btn btn--primary btn--sm">
            <Plus size={15} /> Add
          </button>
        </form>
      </div>
      <ul className="cat-list">
        {cats.map((c) => (
          <li key={c.id}>
            <span className={`ctag ctag--${c.color}`}>{c.label}</span>
            <span className="muted small">
              {usage[c.id] ?? 0} articles · <code className="code">{c.id}</code>
            </span>
            <Status tone="neutral">{c.color}</Status>
            {!usage[c.id] && (
              <button type="button" className="icon-btn icon-btn--sm" aria-label={`Delete ${c.label}`} onClick={() => actions.adminRemove("articleCategories", c.id)}>
                <Trash2 size={14} />
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Tags() {
  const tags = useDb((s) => s.articleTags);
  const usage = useDb((s) => s.articles.reduce((a, x) => x.tags.reduce((b, t) => ((b[t] = (b[t] || 0) + 1), b), a), {}));
  const [t, setT] = useState("");
  return (
    <section className="panel">
      <div className="panel__head">
        <h2>Tags</h2>
        <form
          className="inline-add"
          onSubmit={(e) => {
            e.preventDefault();
            const v = t.trim();
            if (!v || tags.includes(v)) return;
            setState((s) => ({ articleTags: [...s.articleTags, v] }));
            actions.log("articleTags.create", v, "Added tag");
            setT("");
            toast("Tag added");
          }}
        >
          <input className="input input--sm" value={t} onChange={(e) => setT(e.target.value)} placeholder="New tag" aria-label="New tag" />
          <button type="submit" className="btn btn--primary btn--sm">
            <Plus size={15} /> Add
          </button>
        </form>
      </div>
      <ul className="tag-grid">
        {tags.map((x) => (
          <li key={x}>
            <span>#{x}</span>
            <small className="muted">{usage[x] ?? 0}</small>
            <button type="button" className="icon-btn icon-btn--sm" aria-label={`Delete tag ${x}`} onClick={() => {
                setState((s) => ({ articleTags: s.articleTags.filter((y) => y !== x) }));
                actions.log("articleTags.delete", x, "Removed tag");
              }}>
              <X size={13} />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
