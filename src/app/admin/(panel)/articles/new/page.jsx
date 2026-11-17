"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ArticleEditor from "@/components/admin/ArticleEditor";

function NewArticle() {
  const params = useSearchParams();
  return <ArticleEditor defaultCategory={params.get("category") ?? undefined} />;
}

export default function NewArticlePage() {
  return (
    <Suspense fallback={null}>
      <NewArticle />
    </Suspense>
  );
}
