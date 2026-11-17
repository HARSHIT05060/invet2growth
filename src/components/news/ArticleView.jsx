"use client";

import Link from "next/link";
import { Heart, Bookmark, Clock, ShieldCheck, Newspaper } from "lucide-react";
import { useDb, useHydrated, actions } from "@/lib/db/store";
import { publishedArticles, articleCategory, relatedArticles } from "@/lib/articles";
import { sanitizeHtml } from "@/lib/sanitize";
import { date, initials } from "@/lib/format";
import { ShareButton, Empty } from "@/components/ui/bits";
import { toast } from "@/components/ui/Toast";
import ArticleCard from "./ArticleCard";
import AdSlot from "@/components/ui/AdSlot";

const ADVICE_CATEGORIES = ["investment-tips", "market-analysis", "mutual-funds", "ipo-updates", "property-investment"];

export default function ArticleView({ slug }) {
  const hydrated = useHydrated();
  const a = useDb((s) => publishedArticles(s.articles).find((x) => x.slug === slug), [slug]);
  const all = useDb((s) => s.articles);
  const cats = useDb((s) => s.articleCategories);
  const disclaimer = useDb((s) => s.settings.contentDisclaimer);
  const liked = useDb((s) => s.me.likes.includes(a?.id), [a?.id]) && hydrated;
  const saved = useDb((s) => s.me.bookmarks.includes(a?.id), [a?.id]) && hydrated;

  if (!a) {
    if (!hydrated) return <div className="container page-pad muted">Loading…</div>;
    return (
      <div className="container page-pad">
        <Empty icon={Newspaper} title="Article not found" text="It may have been unpublished or moved." action={{ label: "All articles", href: "/news" }} />
      </div>
    );
  }

  const cat = articleCategory(a.category, cats);
  const related = relatedArticles(all, a, 3);
  const needsDisclaimer = ADVICE_CATEGORIES.includes(a.category);

  return (
    <div className="theme-news">
      <article className="container page-pad article">
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link href="/news">News</Link>
          <span>/</span>
          <Link href={`/news?category=${cat.id}`}>{cat.label}</Link>
        </nav>

        <header className="article__head">
          <Link href={`/news?category=${cat.id}`} className={`ctag ctag--${cat.color}`}>
            {cat.label}
          </Link>
          <h1>{a.title}</h1>
          <p className="article__dek">{a.excerpt}</p>
          <div className="article__byline">
            <span className="avatar avatar--sm">{initials(a.author)}</span>
            <span>
              <strong>{a.author}</strong>
              <span className="muted">
                {date(a.publishedAt, { day: "numeric", month: "long", year: "numeric" })} · <Clock size={13} /> {a.readMins} min read
              </span>
            </span>
          </div>
        </header>

        <img src={a.image} alt="" className="article__img" />

        <div className="article__layout">
          <div className="article__tools" aria-label="Article actions">
            <button
              type="button"
              className={`icon-btn${liked ? " is-liked" : ""}`}
              aria-pressed={liked}
              aria-label={liked ? "Unlike" : "Like"}
              onClick={() => actions.toggleLike(a.id)}
            >
              <Heart size={18} />
            </button>
            <span className="small muted">{a.likes}</span>
            <button
              type="button"
              className={`icon-btn${saved ? " is-on" : ""}`}
              aria-pressed={saved}
              aria-label={saved ? "Remove bookmark" : "Bookmark"}
              onClick={() => toast(actions.toggleBookmark(a.id) ? "Article saved" : "Removed from saved")}
            >
              <Bookmark size={18} />
            </button>
            <ShareButton title={a.title} url={`/news/${a.slug}`} className="icon-btn" label="" />
          </div>

          <div className="article__body">
            {needsDisclaimer && (
              <aside className="disclaimer">
                <ShieldCheck size={16} /> {disclaimer}
              </aside>
            )}
            <div className="prose" dangerouslySetInnerHTML={{ __html: sanitizeHtml(a.body) }} />
            <AdSlot placement="news-inline" />
            <div className="article__tags">
              {a.tags.map((t) => (
                <Link key={t} href={`/news?tag=${encodeURIComponent(t)}`} className="chip chip--sm">
                  #{t}
                </Link>
              ))}
            </div>
            <div className="article__end">
              <button type="button" className={`btn btn--ghost btn--sm${liked ? " is-liked" : ""}`} onClick={() => actions.toggleLike(a.id)} aria-pressed={liked}>
                <Heart size={16} /> {liked ? "Liked" : "Like"} · {a.likes}
              </button>
              <button type="button" className={`btn btn--ghost btn--sm${saved ? " is-on" : ""}`} onClick={() => toast(actions.toggleBookmark(a.id) ? "Article saved" : "Removed from saved")} aria-pressed={saved}>
                <Bookmark size={16} /> {saved ? "Saved" : "Save"}
              </button>
              <ShareButton title={a.title} url={`/news/${a.slug}`} />
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="pd__more">
            <h2 className="h-sec">Related articles</h2>
            <div className="news-grid">
              {related.map((r) => (
                <ArticleCard key={r.id} a={r} />
              ))}
            </div>
          </section>
        )}
      </article>
    </div>
  );
}
