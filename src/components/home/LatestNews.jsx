"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useDb } from "@/lib/db/store";
import ArticleCard from "@/components/news/ArticleCard";
import { publishedArticles } from "@/lib/articles";

export default function LatestNews() {
  const list = useDb((s) => publishedArticles(s.articles).slice(0, 4));
  if (!list.length) return null;
  const [lead, ...rest] = list;

  return (
    <section className="section theme-news" id="news">
      <div className="container">
        <div className="section__head" data-reveal>
          <div>
            <p className="eyebrow">News & investment tips</p>
            <h2>
              Read before you <em>invest.</em>
            </h2>
          </div>
          <Link href="/news" className="link-arrow">
            All articles <ArrowRight size={16} />
          </Link>
        </div>
        <div className="news-home" data-reveal>
          <ArticleCard a={lead} variant="lead" />
          <div className="news-home__list">
            {rest.map((a) => (
              <ArticleCard key={a.id} a={a} variant="row" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
