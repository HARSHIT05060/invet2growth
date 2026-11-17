"use client";

import Link from "next/link";
import { ShieldCheck, AlertTriangle } from "lucide-react";
import { useDb } from "@/lib/db/store";
import { PageHeader } from "@/components/admin/ui";
import ArticlesTable from "@/components/admin/ArticlesTable";
import { REVIEW_CATEGORIES } from "@/components/admin/ArticleEditor";
import { dateTime } from "@/lib/format";

const TIP_CATEGORIES = ["investment-tips", "mutual-funds", "financial-education", "property-investment"];

export default function TipsPage() {
  const queue = useDb((s) => s.articles.filter((a) => REVIEW_CATEGORIES.includes(a.category) && a.compliance === "pending" && !a.deletedAt));

  return (
    <>
      <PageHeader
        title="Investment tips"
        description="Educational tips and guides. Advice-like content goes through compliance review before publishing."
        actions={
          <Link href="/admin/articles/new?category=investment-tips" className="btn btn--primary btn--sm">
            New tip
          </Link>
        }
      />

      <div className="adm-grid adm-grid--2-1">
        <section className="panel">
          <div className="panel__head">
            <h2>
              <ShieldCheck size={18} /> Compliance review queue
            </h2>
            <span className="status status--warn">{queue.length} waiting</span>
          </div>
          {queue.length === 0 ? (
            <p className="muted">Nothing awaiting review.</p>
          ) : (
            <ul className="queue">
              {queue.map((a) => (
                <li key={a.id}>
                  {a.image ? <img src={a.image} alt="" /> : <span className="cell-prop__ph" />}
                  <div>
                    <Link href={`/admin/articles/${a.id}`}>{a.title}</Link>
                    <span className="muted small">
                      {a.author} · updated {dateTime(a.updatedAt ?? a.createdAt ?? a.publishedAt ?? new Date().toISOString())}
                    </span>
                  </div>
                  <Link href={`/admin/articles/${a.id}`} className="btn btn--ghost btn--sm">
                    Review
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="panel policy">
          <h2 className="panel__title">
            <AlertTriangle size={18} /> Content policy
          </h2>
          <ul>
            <li>Educational and general only. No personalised buy/sell/hold recommendations.</li>
            <li>No guaranteed, assured or “risk-free” return claims.</li>
            <li>No target prices unless published by a SEBI-registered research analyst.</li>
            <li>Disclose risks and that past performance doesn&apos;t indicate future results.</li>
            <li>The SEBI disclaimer is added automatically to advice-like categories.</li>
          </ul>
        </section>
      </div>

      <section className="panel">
        <ArticlesTable categories={TIP_CATEGORIES} newHref="/admin/articles/new?category=investment-tips" />
      </section>
    </>
  );
}
