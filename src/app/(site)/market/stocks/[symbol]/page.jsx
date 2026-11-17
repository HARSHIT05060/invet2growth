import StockDetail from "@/components/market/StockDetail";
import { STOCKS, INDICES } from "@/mock/stocks";

export async function generateMetadata({ params }) {
  const { symbol } = await params;
  const sym = decodeURIComponent(symbol);
  const s = STOCKS.find((x) => x.symbol === sym) ?? INDICES.find((x) => x.id === sym);
  if (!s) return { title: "Stock" };
  return {
    title: `${s.name} (${sym}) Share Price, Chart & News`,
    description: `${s.name} price, day range, 52-week high and low, volume and charts from 1 day to 5 years.`,
  };
}

export default async function StockPage({ params }) {
  const { symbol } = await params;
  return <StockDetail symbol={decodeURIComponent(symbol)} />;
}
