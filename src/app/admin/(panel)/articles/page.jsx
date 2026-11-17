"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useDb } from "@/lib/db/store";
import { PageHeader } from "@/components/admin/ui";
import ArticlesTable from "@/components/admin/ArticlesTable";
import { publishedArticles } from "@/lib/articles";

function Articles() {
  const params = useSearchParams();
  const counts = useDb((s) => ({
    total: s.articles.filter((a) => !a.deletedAt).length,
    live: publishedArticles(s.articles).length,
    scheduled: s.articles.filter((a) => a.status === "scheduled" && !a.deletedAt).length,
    drafts: s.articles.filter((a) => a.status === "draft" && !a.deletedAt).length,
  }));
  return (
    <>
      <PageHeader title="News & articles" description={`${counts.total} articles · ${counts.live} live · ${counts.scheduled} scheduled · ${counts.drafts} drafts`} />
      <section className="panel">
        <ArticlesTable initialStatus={params.get("status") ?? ""} />
      </section>
    </>
  );
}

export default function ArticlesPage() {
  return (
    <Suspense fallback={null}>
      <Articles />
    </Suspense>
  );
}
