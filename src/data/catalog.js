// Cities, categories, property types and budget ranges used by search and browse.

export const CITIES = [
  "Jaipur",
  "Delhi NCR",
  "Mumbai",
  "Bengaluru",
  "Pune",
  "Ahmedabad",
  "Surat",
  "Lucknow",
  "Udaipur",
  "Kolkata",
];

export const CATEGORIES = [
  { title: "Flats & Apartments", note: "Ready and under construction", image: "/images/categories/flats.webp" },
  { title: "Independent Houses", note: "Houses, villas and bungalows", image: "/images/categories/houses.webp" },
  { title: "Plots & Land", note: "Residential and gated plots", image: "/images/categories/plots.webp" },
  { title: "Shops & Offices", note: "Retail, office and showroom", image: "/images/categories/shops.webp" },
  { title: "PG & Shared", note: "Rooms for students and staff", image: "/images/categories/pg.webp" },
  { title: "Agricultural Land", note: "Farmland and farm houses", image: "/images/categories/agricultural.webp" },
];

export const PROPERTY_TYPES = [
  "Flat / Apartment",
  "Independent House",
  "Villa",
  "Plot / Land",
  "Shop / Office",
  "PG / Shared",
  "Agricultural Land",
];

export const BUDGETS = {
  buy: ["Under ₹25 Lakh", "₹25 – 50 Lakh", "₹50 Lakh – 1 Cr", "₹1 – 2 Cr", "Above ₹2 Cr"],
  rent: ["Under ₹10,000", "₹10,000 – 20,000", "₹20,000 – 40,000", "Above ₹40,000"],
};
