import MarketDashboard from "@/components/market/MarketDashboard";

export const metadata = {
  title: "Stock Market Today: NIFTY, SENSEX, Gainers & Losers",
  description: "NIFTY 50, BANK NIFTY, NIFTY NEXT 50 and SENSEX with top gainers, losers, most active stocks and market news.",
};

export default function MarketPage() {
  return <MarketDashboard />;
}
