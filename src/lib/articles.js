// Article helpers shared by the website and admin CMS.

import { ARTICLE_CATEGORIES } from "@/mock/articles";

/** Published, plus scheduled articles whose time has come. Newest first. */
export function publishedArticles(list) {
  const now = Date.now();
  return list
    .filter((a) => !a.deletedAt && (a.status === "published" || (a.status === "scheduled" && a.scheduledAt && Date.parse(a.scheduledAt) <= now)))
    .map((a) => (a.status === "scheduled" ? { ...a, publishedAt: a.scheduledAt } : a))
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
}

export const articleCategory = (id, cats = ARTICLE_CATEGORIES) => cats.find((c) => c.id === id) ?? { id, label: id, color: "news" };

export function relatedArticles(list, a, n = 3) {
  return publishedArticles(list)
    .filter((x) => x.id !== a.id)
    .map((x) => ({ x, score: (x.category === a.category ? 3 : 0) + x.tags.filter((t) => a.tags.includes(t)).length }))
    .sort((p, q) => q.score - p.score)
    .slice(0, n)
    .map((r) => r.x);
}

export const ARTICLE_STATUS_TONE = { published: "good", draft: "neutral", scheduled: "info", archived: "neutral" };
export const COMPLIANCE_TONE = { approved: "good", pending: "warn", rejected: "bad", "not-required": "neutral" };
export const complianceLabel = (c) => ({ approved: "Compliance approved", pending: "Awaiting compliance", rejected: "Compliance rejected", "not-required": "No review needed" })[c] ?? c;

export const estimateReadMins = (html = "") => Math.max(1, Math.round(html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length / 200));
