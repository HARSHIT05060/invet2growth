// Property taxonomy, amenities and locations (sample data — see README).

export const SEGMENTS = [
  { id: "residential", label: "Residential" },
  { id: "commercial", label: "Commercial" },
  { id: "land", label: "Land" },
];

export const PROPERTY_CATEGORIES = [
  // Residential
  { id: "flat", segment: "residential", label: "Flat / Apartment", image: "/images/categories/flats.webp", active: true },
  { id: "villa", segment: "residential", label: "Villa / Bungalow", image: "/images/categories/houses.webp", active: true },
  { id: "house", segment: "residential", label: "Independent House", image: "/images/listings/kolkata.webp", active: true },
  { id: "res-plot", segment: "residential", label: "Residential Plot", image: "/images/categories/plots.webp", active: true },
  { id: "farmhouse", segment: "residential", label: "Farmhouse", image: "/images/categories/agricultural.webp", active: true },
  { id: "pg", segment: "residential", label: "PG / Hostel", image: "/images/categories/pg.webp", active: true },
  // Commercial
  { id: "office", segment: "commercial", label: "Office Space", image: "/images/categories/shops.webp", active: true },
  { id: "shop", segment: "commercial", label: "Shop / Showroom", image: "/images/categories/shops.webp", active: true },
  { id: "com-building", segment: "commercial", label: "Commercial Building", image: "/images/categories/shops.webp", active: true },
  { id: "warehouse", segment: "commercial", label: "Warehouse", image: "/images/categories/shops.webp", active: true },
  { id: "industrial", segment: "commercial", label: "Industrial Property", image: "/images/categories/shops.webp", active: true },
  { id: "coworking", segment: "commercial", label: "Co-working Space", image: "/images/categories/shops.webp", active: true },
  // Land
  { id: "agri-land", segment: "land", label: "Agricultural Land", image: "/images/categories/agricultural.webp", active: true },
  { id: "ind-land", segment: "land", label: "Industrial Land", image: "/images/categories/plots.webp", active: true },
  { id: "com-land", segment: "land", label: "Commercial Land", image: "/images/categories/plots.webp", active: true },
  { id: "res-land", segment: "land", label: "Residential Land", image: "/images/categories/plots.webp", active: true },
  { id: "na-plot", segment: "land", label: "NA Plot", image: "/images/categories/plots.webp", active: true },
];

export const LISTING_TYPES = [
  { id: "sale", label: "Sell", buyerLabel: "Buy" },
  { id: "rent", label: "Rent", buyerLabel: "Rent" },
  { id: "lease", label: "Lease", buyerLabel: "Lease" },
];

export const FURNISHING = ["Unfurnished", "Semi-furnished", "Fully furnished"];
export const FACING = ["North", "East", "South", "West", "North-East", "North-West", "South-East", "South-West"];
export const OWNERSHIP = ["Freehold", "Leasehold", "Co-operative society", "Power of attorney"];
export const AVAILABILITY = [
  { id: "ready", label: "Ready to move" },
  { id: "under-construction", label: "Under construction" },
];

export const AMENITIES = [
  { id: "lift", label: "Lift", active: true },
  { id: "power-backup", label: "Power backup", active: true },
  { id: "security", label: "24×7 security", active: true },
  { id: "cctv", label: "CCTV", active: true },
  { id: "gym", label: "Gym", active: true },
  { id: "pool", label: "Swimming pool", active: true },
  { id: "clubhouse", label: "Clubhouse", active: true },
  { id: "park", label: "Park / garden", active: true },
  { id: "play-area", label: "Children's play area", active: true },
  { id: "water", label: "24×7 water", active: true },
  { id: "gas", label: "Piped gas", active: true },
  { id: "parking-visitor", label: "Visitor parking", active: true },
  { id: "rainwater", label: "Rainwater harvesting", active: true },
  { id: "wifi", label: "Wi-Fi", active: true },
  { id: "meals", label: "Meals included", active: true },
  { id: "fire", label: "Fire safety", active: true },
  { id: "loading-bay", label: "Loading bay", active: true },
  { id: "boundary", label: "Boundary wall", active: true },
  { id: "road", label: "Road access", active: true },
  { id: "borewell", label: "Borewell", active: true },
];

// State → city → localities, with approximate coordinates for the map.
export const LOCATIONS = [
  {
    id: "jaipur", city: "Jaipur", state: "Rajasthan", lat: 26.9124, lng: 75.7873, active: true,
    localities: ["Vaishali Nagar", "Malviya Nagar", "Mansarovar", "Jagatpura", "Ajmer Road"],
  },
  {
    id: "mumbai", city: "Mumbai", state: "Maharashtra", lat: 19.076, lng: 72.8777, active: true,
    localities: ["Andheri West", "Powai", "Thane West", "Bandra West", "Lower Parel"],
  },
  {
    id: "pune", city: "Pune", state: "Maharashtra", lat: 18.5204, lng: 73.8567, active: true,
    localities: ["Wakad", "Baner", "Hinjewadi", "Kharadi", "Chakan"],
  },
  {
    id: "bengaluru", city: "Bengaluru", state: "Karnataka", lat: 12.9716, lng: 77.5946, active: true,
    localities: ["Whitefield", "HSR Layout", "Indiranagar", "Electronic City", "Devanahalli"],
  },
  {
    id: "delhi-ncr", city: "Delhi NCR", state: "Delhi", lat: 28.6139, lng: 77.209, active: true,
    localities: ["Dwarka", "Saket", "Gurugram Sector 54", "Noida Sector 150", "Okhla"],
  },
  {
    id: "kolkata", city: "Kolkata", state: "West Bengal", lat: 22.5726, lng: 88.3639, active: true,
    localities: ["New Town", "Salt Lake", "Ballygunge", "Rajarhat"],
  },
  {
    id: "ahmedabad", city: "Ahmedabad", state: "Gujarat", lat: 23.0225, lng: 72.5714, active: true,
    localities: ["Prahlad Nagar", "SG Highway", "Bopal", "Sanand"],
  },
  {
    id: "hyderabad", city: "Hyderabad", state: "Telangana", lat: 17.385, lng: 78.4867, active: true,
    localities: ["Gachibowli", "Kondapur", "Banjara Hills", "Shamshabad"],
  },
  {
    id: "lucknow", city: "Lucknow", state: "Uttar Pradesh", lat: 26.8467, lng: 80.9462, active: true,
    localities: ["Gomti Nagar", "Hazratganj", "Sultanpur Road"],
  },
  {
    id: "surat", city: "Surat", state: "Gujarat", lat: 21.1702, lng: 72.8311, active: true,
    localities: ["Vesu", "Adajan", "Pal"],
  },
  {
    id: "udaipur", city: "Udaipur", state: "Rajasthan", lat: 24.5854, lng: 73.7125, active: false,
    localities: ["Fatehpura", "Hiran Magri"],
  },
];

export const BUDGETS = {
  sale: [
    { label: "Under ₹25 Lakh", min: 0, max: 2500000 },
    { label: "₹25 – 50 Lakh", min: 2500000, max: 5000000 },
    { label: "₹50 Lakh – 1 Cr", min: 5000000, max: 10000000 },
    { label: "₹1 – 2 Cr", min: 10000000, max: 20000000 },
    { label: "Above ₹2 Cr", min: 20000000, max: null },
  ],
  rent: [
    { label: "Under ₹10,000", min: 0, max: 10000 },
    { label: "₹10,000 – 20,000", min: 10000, max: 20000 },
    { label: "₹20,000 – 40,000", min: 20000, max: 40000 },
    { label: "₹40,000 – 1 Lakh", min: 40000, max: 100000 },
    { label: "Above ₹1 Lakh", min: 100000, max: null },
  ],
};
