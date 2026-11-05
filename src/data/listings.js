// Property listings. Read these through src/lib/listings.js, not directly,
// so swapping this file for a database later only changes that one file.

export const LISTING_MODES = ["buy", "rent"];

export const LISTINGS = [
  {
    id: 1,
    mode: "buy",
    price: "₹45 Lakh",
    title: "2 BHK Apartment",
    place: "Vaishali Nagar, Jaipur",
    beds: "2 BHK",
    area: "1,050 sq.ft",
    extra: { icon: "key", label: "Ready to move" },
    image: "/images/listings/jaipur.webp",
  },
  {
    id: 2,
    mode: "buy",
    price: "₹78 Lakh",
    title: "3 BHK Independent House",
    place: "New Town, Kolkata",
    beds: "3 BHK",
    area: "1,800 sq.ft",
    extra: { icon: "car", label: "With parking" },
    image: "/images/listings/kolkata.webp",
    featured: true,
  },
  {
    id: 3,
    mode: "rent",
    price: "₹18,000",
    per: "/ month",
    title: "2 BHK Apartment",
    place: "Wakad, Pune",
    beds: "2 BHK",
    area: "950 sq.ft",
    extra: { icon: "sofa", label: "Fully furnished" },
    image: "/images/listings/pune.webp",
  },
];
