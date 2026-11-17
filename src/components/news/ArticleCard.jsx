"use client";

import Link from "next/link";
import { Bookmark, Clock } from "lucide-react";
import { useDb, useHydrated, actions } from "@/lib/db/store";
import { articleCategory } from "@/lib/articles";
import { date } from "@/lib/format";
import { toast } from "@/components/ui/Toast";

/** variant: "card" (grid) | "lead" (big feature) | "row" (compact list item) */
export default function ArticleCard({ a, variant = "card" }) {
  const cats = useDb((s) => s.articleCategories);
  const hydrated = useHydrated();
  const saved = useDb((s) => s.me.bookmarks.includes(a.id), [a.id]) && hydrated;
  const cat = articleCategory(a.category, cats);

  function bookmark(e) {
    e.preventDefault();
    const on = actions.toggleBookmark(a.id);
    toast(on ? "Article saved" : "Removed from saved articles");
  }

  return (
    <article className={`acard acard--${variant}`}>
      <Link href={`/news/${a.slug}`} className="acard__media" tabIndex={-1} aria-hidden="true">
        <img src={a.image} alt="" loading="lazy" />
      </Link>
      <div className="acard__body">
        <div className="acard__meta">
          <Link href={`/news?category=${cat.id}`} className={`ctag ctag--${cat.color}`}>
            {cat.label}
          </Link>
          <span>{date(a.publishedAt)}</span>
        </div>
        <h3>
          <Link href={`/news/${a.slug}`}>{a.title}</Link>
        </h3>
        {variant !== "row" && <p>{a.excerpt}</p>}
        <div className="acard__foot">
          <span>
            <Clock size={14} /> {a.readMins} min read
          </span>
          <button type="button" className={`icon-btn icon-btn--sm${saved ? " is-on" : ""}`} onClick={bookmark} aria-pressed={saved} aria-label={saved ? "Remove bookmark" : "Bookmark article"}>
            <Bookmark size={16} />
          </button>
        </div>
      </div>
    </article>
  );
}
