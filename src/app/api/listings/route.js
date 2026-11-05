// GET /api/listings           → all listings
// GET /api/listings?mode=rent → only rentals ("buy" | "rent")
// GET /api/listings?id=2      → one listing
import { getListings, getListing } from "@/lib/listings";

export async function GET(request) {
  const params = request.nextUrl.searchParams;
  const id = params.get("id");

  if (id) {
    const listing = await getListing(id);
    if (!listing) return Response.json({ error: "Listing not found" }, { status: 404 });
    return Response.json({ data: listing });
  }

  const listings = await getListings(params.get("mode"));
  return Response.json({ data: listings });
}
