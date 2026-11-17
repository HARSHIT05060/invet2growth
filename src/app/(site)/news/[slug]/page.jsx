import ArticleView from "@/components/news/ArticleView";
import { ARTICLES } from "@/mock/articles";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const a = ARTICLES.find((x) => x.slug === slug);
  if (!a) return { title: "Article" };
  return {
    title: a.seoTitle || a.title,
    description: a.metaDescription || a.excerpt,
    openGraph: { type: "article", images: [a.image], publishedTime: a.publishedAt ?? undefined },
  };
}

export default async function ArticlePage({ params }) {
  const { slug } = await params;
  return <ArticleView slug={slug} />;
}
