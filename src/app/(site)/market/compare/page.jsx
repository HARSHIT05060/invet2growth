import { Suspense } from "react";
import StockCompare from "@/components/market/StockCompare";

export const metadata = { title: "Compare stocks" };

export default function StockComparePage() {
  return (
    <Suspense fallback={null}>
      <StockCompare />
    </Suspense>
  );
}
