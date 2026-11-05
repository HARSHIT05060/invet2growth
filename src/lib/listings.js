// Listing lookups used by pages and by /api/listings.
// They're async so a database or external API can replace the static data
// later without changing any caller.

import { LISTINGS, LISTING_MODES } from "@/data/listings";

/** All listings, or only one mode ("buy" | "rent"). Unknown modes return all. */
export async function getListings(mode) {
  return LISTING_MODES.includes(mode) ? LISTINGS.filter((l) => l.mode === mode) : LISTINGS;
}

export async function getListing(id) {
  return LISTINGS.find((l) => l.id === Number(id)) ?? null;
}

export async function getFeaturedListing() {
  return LISTINGS.find((l) => l.featured) ?? LISTINGS[0] ?? null;
}
