"use client";

import { Info } from "lucide-react";
import { market } from "@/lib/market";
import { useDb } from "@/lib/db/store";

/** States the data's provenance on every market screen. Never claims "live" unless the provider is licensed for it. */
export default function DataLabel() {
  const mode = useDb((s) => s.marketConfig.dataLabel);
  const simulated = market.provider.id === "mock";
  return (
    <p className="data-label">
      <Info size={14} />
      {simulated
        ? "Simulated prices for development. Not real NSE/BSE data."
        : mode === "realtime" && market.provider.realtime
          ? "Real-time data from a licensed provider."
          : "Data may be delayed by up to 15 minutes."}{" "}
      For information only, not investment advice.
    </p>
  );
}
