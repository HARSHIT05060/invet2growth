import { Suspense } from "react";
import SearchView from "@/components/property/SearchView";

export const metadata = {
  title: "Properties for Sale, Rent & Lease",
  description: "Search verified flats, houses, villas, plots, offices, shops and land across India with filters and map view.",
};

export default function PropertiesPage() {
  return (
    <Suspense fallback={<div className="container page-pad muted">Loading properties…</div>}>
      <SearchView />
    </Suspense>
  );
}
