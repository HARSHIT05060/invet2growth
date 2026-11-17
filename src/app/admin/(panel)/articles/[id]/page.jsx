import ArticleEditor from "@/components/admin/ArticleEditor";

export default async function EditArticlePage({ params }) {
  const { id } = await params;
  return <ArticleEditor key={id} id={id} />;
}
