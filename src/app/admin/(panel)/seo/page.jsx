"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useDb, actions } from "@/lib/db/store";
import { PageHeader, DataTable, RowActions } from "@/components/admin/ui";
import { Field, Toggle, Status } from "@/components/ui/bits";
import Modal from "@/components/ui/Modal";
import { toast } from "@/components/ui/Toast";

export default function SeoPage() {
  const pages = useDb((s) => s.seoPages);
  const settings = useDb((s) => s.settings);
  const [edit, setEdit] = useState(null);
  const [robots, setRobots] = useState(settings.robotsTxt ?? "User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /account\n\nSitemap: https://invest2growth.com/sitemap.xml");

  return (
    <>
      <PageHeader
        title="SEO management"
        description="Page titles, meta descriptions and indexing rules. Listings and articles get their own SEO fields automatically."
        actions={
          <button type="button" className="btn btn--primary btn--sm" onClick={() => setEdit({ index: true })}>
            <Plus size={16} /> Add page
          </button>
        }
      />
      <section className="panel">
        <DataTable
          rows={pages}
          searchKeys={["path", "title", "description"]}
          searchPlaceholder="Search pages"
          columns={[
            { key: "path", label: "Path", render: (p) => <code className="code">{p.path}</code> },
            {
              key: "title",
              label: "Title & description",
              render: (p) => (
                <span className="cell-stack">
                  <strong>{p.title}</strong>
                  <small>{p.description || <em className="muted">No description</em>}</small>
                </span>
              ),
            },
            {
              key: "len",
              label: "Lengths",
              sort: false,
              render: (p) => (
                <span className="small nowrap">
                  <span className={p.title.length > 60 ? "chg--down" : ""}>{p.title.length}/60</span> · <span className={p.description.length > 160 ? "chg--down" : ""}>{p.description.length}/160</span>
                </span>
              ),
            },
            { key: "index", label: "Indexing", render: (p) => <Status tone={p.index ? "good" : "neutral"}>{p.index ? "index" : "noindex"}</Status> },
            {
              key: "actions",
              label: "",
              sort: false,
              render: (p) => (
                <RowActions>
                  <button type="button" className="icon-btn icon-btn--sm" aria-label={`Edit ${p.path}`} onClick={() => setEdit(p)}>
                    <Pencil size={15} />
                  </button>
                  <button type="button" className="icon-btn icon-btn--sm" aria-label={`Delete ${p.path}`} onClick={() => { actions.adminRemove("seoPages", p.id); toast("SEO entry removed"); }}>
                    <Trash2 size={15} />
                  </button>
                </RowActions>
              ),
            },
          ]}
        />
      </section>

      <div className="adm-grid adm-grid--2">
        <section className="panel form-stack">
          <div className="panel__head">
            <h2>robots.txt</h2>
          </div>
          <textarea className="input code-area" rows={8} value={robots} onChange={(e) => setRobots(e.target.value)} spellCheck={false} />
          <div>
            <button type="button" className="btn btn--primary btn--sm" onClick={() => { actions.updateConfig("settings", { robotsTxt: robots }, "Updated robots.txt"); toast("robots.txt saved"); }}>
              Save robots.txt
            </button>
          </div>
        </section>
        <section className="panel form-stack">
          <div className="panel__head">
            <h2>Defaults</h2>
          </div>
          <Toggle label="Generate XML sitemap" description="Includes live listings, published articles and stock pages" checked={settings.sitemap ?? true} onChange={(v) => actions.updateConfig("settings", { sitemap: v }, `Sitemap ${v ? "on" : "off"}`)} />
          <Toggle label="Noindex listings pending review" description="Prevents unapproved listings from appearing in search" checked={settings.noindexPending ?? true} onChange={(v) => actions.updateConfig("settings", { noindexPending: v }, "Updated noindex rule")} />
          <Toggle label="Structured data (schema.org)" description="RealEstateListing, NewsArticle and BreadcrumbList markup" checked={settings.schemaOrg ?? true} onChange={(v) => actions.updateConfig("settings", { schemaOrg: v }, "Updated structured data")} />
        </section>
      </div>

      {edit && <SeoForm p={edit} onClose={() => setEdit(null)} />}
    </>
  );
}

function SeoForm({ p, onClose }) {
  const [d, setD] = useState({ path: "", title: "", description: "", ...p });
  const set = (x) => setD((o) => ({ ...o, ...x }));
  return (
    <Modal
      open
      onClose={onClose}
      title={p.id ? `SEO: ${p.path}` : "Add page"}
      footer={
        <>
          <button type="button" className="btn btn--ghost btn--sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn--primary btn--sm"
            onClick={() => {
              if (!d.path.startsWith("/") || !d.title.trim()) return toast("A path starting with / and a title are required", "error");
              actions.adminSave("seoPages", d, `SEO updated for ${d.path}`);
              toast("Saved");
              onClose();
            }}
          >
            Save
          </button>
        </>
      }
    >
      <div className="form-stack">
        <Field label="Path">
          <input className="input" value={d.path} onChange={(e) => set({ path: e.target.value })} disabled={!!p.id} />
        </Field>
        <Field label="Title" hint={`${d.title.length}/60`}>
          <input className="input" value={d.title} onChange={(e) => set({ title: e.target.value })} />
        </Field>
        <Field label="Meta description" hint={`${d.description.length}/160`}>
          <textarea className="input" rows={3} value={d.description} onChange={(e) => set({ description: e.target.value })} />
        </Field>
        <Toggle label="Allow search engines to index" checked={d.index} onChange={(v) => set({ index: v })} />
        <div className="serp">
          <span className="serp__url">invest2growth.com{d.path}</span>
          <span className="serp__title">{d.title || "Page title"}</span>
          <span className="serp__desc">{d.description || "Meta description"}</span>
        </div>
      </div>
    </Modal>
  );
}
