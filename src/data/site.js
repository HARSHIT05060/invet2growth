// Header menu and contact details shown on every page.

export const NAV = [
  {
    label: "Buy",
    items: [
      { label: "Flats & apartments", href: "/properties?type=sale&category=flat" },
      { label: "Villas & independent houses", href: "/properties?type=sale&segment=residential" },
      { label: "Plots & land", href: "/properties?type=sale&segment=land" },
      { label: "Ready to move", href: "/properties?type=sale&availability=ready" },
      { label: "New projects (under construction)", href: "/properties?type=sale&availability=under-construction" },
    ],
  },
  {
    label: "Rent",
    items: [
      { label: "Flats for rent", href: "/properties?type=rent&category=flat" },
      { label: "Houses for rent", href: "/properties?type=rent&category=house" },
      { label: "PG & hostels", href: "/properties?type=rent&category=pg" },
      { label: "Fully furnished", href: "/properties?type=rent&furnishing=Fully+furnished" },
    ],
  },
  {
    label: "Commercial",
    items: [
      { label: "Office space", href: "/properties?segment=commercial&category=office" },
      { label: "Shops & showrooms", href: "/properties?segment=commercial&category=shop" },
      { label: "Co-working", href: "/properties?segment=commercial&category=coworking" },
      { label: "Warehouses & industrial", href: "/properties?segment=commercial&category=warehouse" },
      { label: "Commercial on lease", href: "/properties?type=lease" },
    ],
  },
  {
    label: "Market",
    items: [
      { label: "Market dashboard", href: "/market" },
      { label: "My watchlist & alerts", href: "/market/watchlist" },
      { label: "Compare stocks", href: "/market/compare" },
      { label: "Market news", href: "/news?category=stock-market-news" },
    ],
  },
  {
    label: "News & Tips",
    items: [
      { label: "Latest news", href: "/news" },
      { label: "Investment tips", href: "/news?category=investment-tips" },
      { label: "Real estate updates", href: "/news?category=real-estate-news" },
      { label: "Mutual funds", href: "/news?category=mutual-funds" },
      { label: "IPO updates", href: "/news?category=ipo-updates" },
      { label: "Financial education", href: "/news?category=financial-education" },
    ],
  },
  {
    label: "Help",
    items: [
      { label: "Contact us", href: "/contact" },
      { label: "Post property", href: "/post-property" },
      { label: "Disclaimer", href: "/legal/disclaimer" },
      { label: "Privacy policy", href: "/legal/privacy" },
    ],
  },
];

// Replace with your brand's real profile URLs.
export const SOCIAL = [
  { label: "Instagram", href: "https://www.instagram.com/" },
  { label: "Facebook", href: "https://www.facebook.com/" },
  { label: "YouTube", href: "https://www.youtube.com/" },
];

export const CONTACT = {
  phone: "+91 98765 43210",
  phoneHref: "tel:+919876543210",
  email: "support@invest2growth.com",
};
