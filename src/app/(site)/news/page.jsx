import { Suspense } from "react";
import NewsView from "@/components/news/NewsView";

export const metadata = {
  title: "Investment News, Tips & Market Analysis",
  description: "Stock market news, investment tips, real estate updates, mutual funds, IPOs and financial education.",
};

export default function NewsPage() {
  return (
    <Suspense fallback={<div className="container page-pad muted">Loading articles…</div>}>
      <NewsView />
    </Suspense>
  );
}
