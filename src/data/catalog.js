// Marketing content for the home page: popular cities and featured categories.
// The full taxonomy (all categories, amenities, localities) lives in the store,
// seeded from src/mock/catalog.js, and is managed from the admin panel.

export const CITIES = ["Jaipur", "Delhi NCR", "Mumbai", "Bengaluru", "Pune", "Ahmedabad", "Hyderabad", "Kolkata", "Lucknow", "Surat"];

export const CATEGORIES = [
  { title: "Flats & Apartments", note: "Ready and under construction", image: "/images/categories/flats.webp", href: "/properties?category=flat" },
  { title: "Independent Houses", note: "Houses, villas and bungalows", image: "/images/categories/houses.webp", href: "/properties?segment=residential&category=house" },
  { title: "Plots & Land", note: "Residential, NA and agricultural", image: "/images/categories/plots.webp", href: "/properties?segment=land" },
  { title: "Shops & Offices", note: "Retail, office and co-working", image: "/images/categories/shops.webp", href: "/properties?segment=commercial" },
  { title: "PG & Hostels", note: "Rooms for students and staff", image: "/images/categories/pg.webp", href: "/properties?category=pg" },
  { title: "Farmhouses", note: "Farmland and weekend homes", image: "/images/categories/agricultural.webp", href: "/properties?category=farmhouse" },
];
