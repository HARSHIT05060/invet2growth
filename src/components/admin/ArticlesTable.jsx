"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil, Trash2, RotateCcw, Eye, Star, Plus } from "lucide-react";
import { useDb, actions, getState } from "@/lib/db/store";
import { DataTable, FilterSelect, RowActions } from "./ui";
import { Status } from "@/components/ui/bits";
import { toast } from "@/components/ui/Toast";
import { articleCategory, ARTICLE_STATUS_TONE, COMPLIANCE_TONE, complianceLabel } from "@/lib/articles";
import { date, num } from "@/lib/format";

/** Article list used by News & articles and Investment tips. */
export default function ArticlesTable({ categories, initialStatus = "", newHref = "/admin/articles/new" }) {
  const all = useDb((s) => s.articles);
  const cats = useDb((s) => s.articleCategories);
  const [status, setStatus] = useState(initialStatus);
  const [category, setCategory] = useState("");
  const [compliance, setCompliance] = useState("");

  const rows = all.filter(
    (a) =>
      (!categories || categories.includes(a.category)) &&
      (status === "trash" ? a.deletedAt : !a.deletedAt) &&
      (!status || status === "trash" || a.status === status) &&
      (!category || a.category === category) &&
      (!compliance || a.compliance === compliance)
  );

  const patch = (ids, change, label) => {
    ids.forEach((id) => actions.adminSave("articles", { ...getState().articles.find((x) => x.id === id), ...change }, label));
    toast(`${ids.length} article${ids.length > 1 ? "s" : ""} updated`);
  };

  return (
    <DataTable
      rows={rows}
      searchKeys={["title", "author", (a) => a.tags.join(" ")]}
      searchPlaceholder="Search title, author or tag"
      exportName="articles.csv"
      exportRow={(a) => ({ id: a.id, title: a.title, category: a.category, status: a.status, compliance: a.compliance, author: a.author, publishedAt: a.publishedAt, views: a.views, likes: a.likes })}
      filters={
        <>
          <FilterSelect label="Status" value={status} onChange={setStatus} options={[["", "All statuses"], ["published", "Published"], ["scheduled", "Scheduled"], ["draft", "Drafts"], ["trash", "Trash"]]} />
          {(!categories || categories.length > 1) && (
            <FilterSelect label="Category" value={category} onChange={setCategory} options={[["", "All categories"], ...cats.filter((c) => !categories || categories.includes(c.id)).map((c) => [c.id, c.label])]} />
          )}
          <FilterSelect label="Compliance" value={compliance} onChange={setCompliance} options={[["", "Any compliance"], ["pending", "Awaiting review"], ["approved", "Approved"], ["rejected", "Rejected"], ["not-required", "Not required"]]} />
          <Link href={newHref} className="btn btn--primary btn--sm">
            <Plus size={15} /> New article
          </Link>
        </>
      }
      bulk={
        status === "trash"
          ? [{ label: "Restore", onClick: (ids) => ids.forEach((id) => actions.adminRestore("articles", id)) }]
          : [
              { label: "Feature", onClick: (ids) => patch(ids, { featured: true }, "Featured") },
              { label: "Unfeature", onClick: (ids) => patch(ids, { featured: false }, "Unfeatured") },
              { label: "Move to drafts", onClick: (ids) => patch(ids, { status: "draft" }, "Unpublished") },
              { label: "Trash", danger: true, onClick: (ids) => ids.forEach((id) => actions.adminRemove("articles", id, { soft: true })) },
            ]
      }
      columns={[
        {
          key: "title",
          label: "Article",
          render: (a) => (
            <div className="cell-prop">
              {a.image ? <img src={a.image} alt="" /> : <span className="cell-prop__ph" />}
              <span>
                <Link href={`/admin/articles/${a.id}`}>{a.title}</Link>
                <small>
                  {a.author} · {a.readMins} min
                </small>
              </span>
            </div>
          ),
        },
        { key: "category", label: "Category", render: (a) => <span className={`ctag ctag--${articleCategory(a.category, cats).color}`}>{articleCategory(a.category, cats).label}</span> },
        {
          key: "status",
          label: "Status",
          render: (a) =>
            a.deletedAt ? (
              <Status tone="bad">Trash</Status>
            ) : (
              <span className="cell-stack">
                <Status tone={ARTICLE_STATUS_TONE[a.status]}>{a.status}</Status>
                {a.status === "scheduled" && <small>{date(a.scheduledAt, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: true })}</small>}
              </span>
            ),
        },
        { key: "compliance", label: "Compliance", render: (a) => <Status tone={COMPLIANCE_TONE[a.compliance]}>{complianceLabel(a.compliance)}</Status> },
        {
          key: "featured",
          label: "Featured",
          sort: (a) => Number(a.featured),
          render: (a) => (
            <button type="button" className={`flag flag--star${a.featured ? " is-on" : ""}`} aria-pressed={a.featured} title={a.featured ? "Unfeature" : "Feature"} onClick={() => patch([a.id], { featured: !a.featured }, a.featured ? "Unfeatured" : "Featured")}>
              <Star size={16} />
            </button>
          ),
        },
        { key: "views", label: "Views", className: "r", render: (a) => num(a.views) },
        { key: "publishedAt", label: "Published", sort: (a) => Date.parse(a.publishedAt ?? a.scheduledAt ?? 0), render: (a) => <span className="small nowrap">{a.publishedAt ? date(a.publishedAt) : "—"}</span> },
        {
          key: "actions",
          label: "",
          sort: false,
          render: (a) => (
            <RowActions>
              {a.status === "published" && !a.deletedAt && (
                <Link href={`/news/${a.slug}`} target="_blank" className="icon-btn icon-btn--sm" title="View" aria-label="View">
                  <Eye size={15} />
                </Link>
              )}
              {a.deletedAt ? (
                <button type="button" className="icon-btn icon-btn--sm" title="Restore" aria-label="Restore" onClick={() => actions.adminRestore("articles", a.id)}>
                  <RotateCcw size={15} />
                </button>
              ) : (
                <>
                  <Link href={`/admin/articles/${a.id}`} className="icon-btn icon-btn--sm" title="Edit" aria-label="Edit">
                    <Pencil size={15} />
                  </Link>
                  <button type="button" className="icon-btn icon-btn--sm" title="Move to trash" aria-label="Move to trash" onClick={() => { actions.adminRemove("articles", a.id, { soft: true }); toast("Moved to trash"); }}>
                    <Trash2 size={15} />
                  </button>
                </>
              )}
            </RowActions>
          ),
        },
      ]}
      empty="No articles"
    />
  );
}
