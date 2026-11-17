"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, TrendingUp, Lightbulb, Building2, Newspaper } from "lucide-react";
import { useDb } from "@/lib/db/store";
import { publishedArticles, articleCategory } from "@/lib/articles";
import ArticleCard from "./ArticleCard";
import { Empty } from "@/components/ui/bits";

const PAGE = 9;

export default function NewsView() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const category = params.get("category") ?? "";
  const q = params.get("q") ?? "";
  const tag = params.get("tag") ?? "";
  const [page, setPage] = useState(1);
  const cats = useDb((s) => s.articleCategories);
  const all = useDb((s) => publishedArticles(s.articles));

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return all.filter(
      (a) =>
        (!category || a.category === category) &&
        (!tag || a.tags.includes(tag)) &&
        (!s || `${a.title} ${a.excerpt} ${a.tags.join(" ")}`.toLowerCase().includes(s))
    );
  }, [all, category, q, tag]);

  const browsing = !category && !q && !tag;
  const featured = all.filter((a) => a.featured).slice(0, 3);
  const trending = [...all].filter((a) => a.trending).sort((a, b) => b.views - a.views).slice(0, 5);
  const tips = all.filter((a) => ["investment-tips", "financial-education", "mutual-funds"].includes(a.category)).slice(0, 3);
  const realty = all.filter((a) => ["real-estate-news", "property-investment"].includes(a.category)).slice(0, 3);
  const latest = browsing ? all.filter((a) => !featured.includes(a)) : filtered;
  const shown = latest.slice(0, page * PAGE);

  function set(patch) {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    setPage(1);
    router.replace(`${pathname}?${next}`, { scroll: false });
  }

  const cat = category && articleCategory(category, cats);

  return (
    <div className="theme-news">
      <div className="container page-pad">
        <div className="news-head">
          <div>
            <p className="eyebrow">{cat ? "Category" : tag ? "Tag" : "News & insights"}</p>
            <h1 className="h-page h-serif">{cat ? cat.label : tag ? `#${tag}` : q ? `Results for “${q}”` : "News, tips & analysis"}</h1>
          </div>
          <form
            className="search-q"
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              set({ q: new FormData(e.currentTarget).get("q") });
            }}
          >
            <Search size={18} />
            <input name="q" key={q} defaultValue={q} placeholder="Search articles" aria-label="Search articles" />
            <button className="btn btn--primary btn--sm" type="submit">
              Search
            </button>
          </form>
        </div>

        <div className="cat-scroll" role="tablist" aria-label="Categories">
          <button type="button" role="tab" aria-selected={!category} className={`chip${!category ? " is-active" : ""}`} onClick={() => set({ category: "", tag: "" })}>
            All
          </button>
          {cats.map((c) => (
            <button key={c.id} type="button" role="tab" aria-selected={category === c.id} className={`chip${category === c.id ? " is-active" : ""}`} onClick={() => set({ category: c.id, tag: "" })}>
              {c.label}
            </button>
          ))}
        </div>

        {browsing && featured.length > 0 && (
          <section className="news-featured">
            <ArticleCard a={featured[0]} variant="lead" />
            <div className="news-featured__side">
              {featured.slice(1).map((a) => (
                <ArticleCard key={a.id} a={a} variant="card" />
              ))}
            </div>
          </section>
        )}

        <div className="news-layout">
          <div>
            <h2 className="h-sec">
              <Newspaper size={20} /> {browsing ? "Latest" : `${filtered.length} ${filtered.length === 1 ? "article" : "articles"}`}
            </h2>
            {shown.length === 0 ? (
              <Empty title="No articles found" text="Try another search or category." action={{ label: "See all articles", href: "/news" }} />
            ) : (
              <div className="news-grid">
                {shown.map((a) => (
                  <ArticleCard key={a.id} a={a} />
                ))}
              </div>
            )}
            {shown.length < latest.length && (
              <div className="center mt-32">
                <button type="button" className="btn btn--ghost" onClick={() => setPage(page + 1)}>
                  Load more
                </button>
              </div>
            )}
          </div>

          <aside className="news-side">
            <section className="side-box">
              <h3>
                <TrendingUp size={18} /> Trending
              </h3>
              <ol className="trending">
                {trending.map((a, i) => (
                  <li key={a.id}>
                    <span>{i + 1}</span>
                    <Link href={`/news/${a.slug}`}>{a.title}</Link>
                  </li>
                ))}
              </ol>
            </section>
            {browsing && (
              <>
                <section className="side-box">
                  <h3>
                    <Lightbulb size={18} /> Investment tips
                  </h3>
                  {tips.map((a) => (
                    <ArticleCard key={a.id} a={a} variant="row" />
                  ))}
                  <Link href="/news?category=investment-tips" className="link-inline">
                    All tips
                  </Link>
                </section>
                <section className="side-box">
                  <h3>
                    <Building2 size={18} /> Real estate updates
                  </h3>
                  {realty.map((a) => (
                    <ArticleCard key={a.id} a={a} variant="row" />
                  ))}
                </section>
              </>
            )}
            <section className="side-box">
              <h3>Popular tags</h3>
              <div className="chips">
                {[...new Set(all.flatMap((a) => a.tags))].slice(0, 14).map((t) => (
                  <button key={t} type="button" className={`chip chip--sm${tag === t ? " is-active" : ""}`} onClick={() => set({ tag: tag === t ? "" : t, category: "" })}>
                    #{t}
                  </button>
                ))}
              </div>
            </section>
            <p className="disclaimer small">
              Articles are general information and education, not investment advice or a recommendation to buy or sell any security.
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}
