// Leads, moderation, CMS and configuration records (development only — see README).

export const INQUIRIES = [
  { id: "iq1", propertyId: "I2G-PR-10001", ownerId: "u1", name: "Neha Kapoor", phone: "+919876500002", email: "neha.kapoor@example.com", message: "Is the price negotiable? I'd like to visit this weekend.", type: "inquiry", status: "new", createdAt: "2026-11-16T19:20:00+05:30" },
  { id: "iq2", propertyId: "I2G-PR-10001", ownerId: "u1", name: "Vikram Singh", phone: "+919876500003", email: "vikram.singh@example.com", message: "Does the society allow pets? Also, what is the maintenance charge?", type: "inquiry", status: "contacted", createdAt: "2026-11-14T12:05:00+05:30" },
  { id: "iq3", propertyId: "I2G-PR-10009", ownerId: "u1", name: "Karan Malhotra", phone: "+919876500015", email: "karan.m@example.com", message: "Interested in the farmhouse. Can you share documents for the land title?", type: "inquiry", status: "new", createdAt: "2026-11-15T09:40:00+05:30" },
  { id: "iq4", propertyId: "I2G-PR-10003", ownerId: "u8", name: "Sneha Patil", phone: "+919876500010", email: "sneha.patil@example.com", message: "Looking to move in from December 1st.", type: "inquiry", status: "closed", createdAt: "2026-11-11T08:15:00+05:30" },
  { id: "iq5", propertyId: "I2G-PR-10004", ownerId: "u5", name: "Divya Reddy", phone: "+919876500016", email: "divya.reddy@example.com", message: "Please share the payment plan and floor plan for the corner villa.", type: "inquiry", status: "new", createdAt: "2026-11-16T15:30:00+05:30" },
  { id: "iq6", propertyId: "I2G-PR-10013", ownerId: "u4", name: "Ananya Das", phone: "+919876500014", email: "ananya.das@example.com", message: "Is the society OC received?", type: "inquiry", status: "contacted", createdAt: "2026-11-13T17:00:00+05:30" },
  { id: "iq7", propertyId: "I2G-PR-10005", ownerId: "u6", name: "Meera Joshi", phone: "+919876500012", email: "meera.joshi@example.com", message: "We need 40 seats from January. Is a shorter lock-in possible?", type: "inquiry", status: "new", createdAt: "2026-11-17T08:10:00+05:30" },
  { id: "iq8", propertyId: "I2G-PR-10016", ownerId: "u5", name: "Neha Kapoor", phone: "+919876500002", email: "neha.kapoor@example.com", message: "What is the expected possession date for Tower B?", type: "inquiry", status: "new", createdAt: "2026-11-12T10:30:00+05:30" },
];

export const VISITS = [
  { id: "sv1", propertyId: "I2G-PR-10001", ownerId: "u1", name: "Neha Kapoor", phone: "+919876500002", date: "2026-11-22", slot: "11:00 – 12:00", status: "requested", createdAt: "2026-11-16T19:25:00+05:30" },
  { id: "sv2", propertyId: "I2G-PR-10009", ownerId: "u1", name: "Karan Malhotra", phone: "+919876500015", date: "2026-11-23", slot: "16:00 – 17:00", status: "confirmed", createdAt: "2026-11-15T09:45:00+05:30" },
  { id: "sv3", propertyId: "I2G-PR-10004", ownerId: "u5", name: "Divya Reddy", phone: "+919876500016", date: "2026-11-21", slot: "10:00 – 11:00", status: "requested", createdAt: "2026-11-16T15:35:00+05:30" },
];

export const REPORTS = [
  { id: "rp1", propertyId: "I2G-PR-10017", reason: "Incorrect price", details: "Price shown differs from what the owner quoted on call.", reporter: "Imran Qureshi", status: "open", createdAt: "2026-11-15T13:00:00+05:30" },
  { id: "rp2", propertyId: "I2G-PR-10010", reason: "Already rented / sold", details: "", reporter: "Divya Reddy", status: "resolved", createdAt: "2026-11-10T09:00:00+05:30" },
];

export const NOTIFICATIONS = [
  { id: "nt1", userId: "u1", title: "New inquiry on your 2 BHK in Vaishali Nagar", body: "Neha Kapoor asked about price negotiation.", link: "/account/leads", kind: "lead", read: false, createdAt: "2026-11-16T19:20:00+05:30" },
  { id: "nt2", userId: "u1", title: "Site visit request", body: "Neha Kapoor wants to visit on 22 Nov, 11:00 – 12:00.", link: "/account/leads", kind: "visit", read: false, createdAt: "2026-11-16T19:25:00+05:30" },
  { id: "nt3", userId: "u1", title: "RELIANCE crossed your alert", body: "Your price alert above ₹1,380 was triggered (simulated data).", link: "/market/watchlist", kind: "alert", read: true, createdAt: "2026-11-14T11:02:00+05:30" },
  { id: "nt4", userId: "u1", title: "Listing approved", body: "Your farmhouse on Ajmer Road is now live.", link: "/account/properties", kind: "listing", read: true, createdAt: "2026-10-20T12:00:00+05:30" },
  { id: "nt5", userId: "u1", title: "Weekly wrap is out", body: "Banks lead as NIFTY ends the week higher.", link: "/news/nifty-weekly-wrap-banks-lead", kind: "news", read: false, createdAt: "2026-11-15T18:35:00+05:30" },
];

export const AUDIT_LOGS = [
  { id: "lg1", actor: "Fatima Sheikh", actorRole: "moderator", action: "property.approve", target: "I2G-PR-10021", detail: "Approved listing", ip: "103.21.58.14", createdAt: "2026-11-17T09:06:00+05:30" },
  { id: "lg2", actor: "Ritika Bansal", actorRole: "super_admin", action: "provider.update", target: "Primary market data provider", detail: "Changed polling interval to 5s", ip: "49.36.112.8", createdAt: "2026-11-17T08:58:00+05:30" },
  { id: "lg3", actor: "Manish Rao", actorRole: "content_editor", action: "article.publish", target: "ar1", detail: "Published weekly wrap", ip: "117.200.4.77", createdAt: "2026-11-15T18:30:00+05:30" },
  { id: "lg4", actor: "Fatima Sheikh", actorRole: "moderator", action: "user.suspend", target: "u9", detail: "Repeated spam inquiries", ip: "103.21.58.14", createdAt: "2026-11-14T16:40:00+05:30" },
  { id: "lg5", actor: "Ritika Bansal", actorRole: "super_admin", action: "settings.update", target: "Moderation", detail: "Require approval for all new listings", ip: "49.36.112.8", createdAt: "2026-11-13T10:12:00+05:30" },
  { id: "lg6", actor: "Manish Rao", actorRole: "content_editor", action: "article.schedule", target: "ar15", detail: "Scheduled for 20 Nov 08:00", ip: "117.200.4.77", createdAt: "2026-11-12T19:00:00+05:30" },
  { id: "lg7", actor: "Fatima Sheikh", actorRole: "moderator", action: "property.reject", target: "I2G-PR-09988", detail: "Duplicate listing", ip: "103.21.58.14", createdAt: "2026-11-12T11:20:00+05:30" },
  { id: "lg8", actor: "Ritika Bansal", actorRole: "super_admin", action: "admin.login", target: "ad1", detail: "Signed in", ip: "49.36.112.8", createdAt: "2026-11-17T08:55:00+05:30" },
];

export const ADS = [
  { id: "ad-1", name: "Home loan partner banner", placement: "home-mid", advertiser: "Partner Bank (sample)", image: "/images/categories/houses.webp", url: "https://example.com", startsAt: "2026-11-01", endsAt: "2026-12-31", status: "active", impressions: 182400, clicks: 2310 },
  { id: "ad-2", name: "Skyline Whitefield launch", placement: "property-sidebar", advertiser: "Skyline Developers", image: "/images/categories/flats.webp", url: "/properties/I2G-PR-10004", startsAt: "2026-11-10", endsAt: "2026-11-30", status: "active", impressions: 64100, clicks: 1290 },
  { id: "ad-3", name: "Investor education webinar", placement: "news-inline", advertiser: "invest2growth", image: "/images/hero.webp", url: "/news", startsAt: "2026-11-18", endsAt: "2026-11-25", status: "scheduled", impressions: 0, clicks: 0 },
  { id: "ad-4", name: "Diwali offers", placement: "home-mid", advertiser: "Harbour Homes", image: "/images/listings/kolkata.webp", url: "https://example.com", startsAt: "2026-10-15", endsAt: "2026-11-05", status: "ended", impressions: 240900, clicks: 3880 },
];

export const AD_PLACEMENTS = [
  { id: "home-mid", label: "Home page — mid banner" },
  { id: "property-sidebar", label: "Property details — sidebar" },
  { id: "news-inline", label: "Article — inline" },
  { id: "market-top", label: "Market dashboard — top strip" },
];

export const PUSH_CAMPAIGNS = [
  { id: "pc1", title: "Markets closed higher today", body: "NIFTY 50 and BANK NIFTY ended in the green. Read the wrap.", audience: "all", platforms: ["android", "ios", "web"], status: "sent", sentAt: "2026-11-15T18:40:00+05:30", scheduledAt: null, delivered: 48210, opened: 6120 },
  { id: "pc2", title: "New verified homes in Pune", body: "12 new verified 2 BHK listings in Wakad and Baner.", audience: "city:pune", platforms: ["android", "ios"], status: "sent", sentAt: "2026-11-12T11:00:00+05:30", scheduledAt: null, delivered: 8940, opened: 1450 },
  { id: "pc3", title: "Budget explainer goes live Friday", body: "What salaried taxpayers should watch for.", audience: "all", platforms: ["android", "ios", "web"], status: "scheduled", sentAt: null, scheduledAt: "2026-11-20T08:05:00+05:30", delivered: 0, opened: 0 },
];

export const SEO_PAGES = [
  { id: "seo-home", path: "/", title: "invest2growth | Property, Market & Investment News", description: "Verified properties, live-style market dashboards and investment education for India.", index: true },
  { id: "seo-properties", path: "/properties", title: "Properties for Sale & Rent in India", description: "Search verified flats, houses, plots and commercial spaces across India.", index: true },
  { id: "seo-market", path: "/market", title: "Stock Market Today — NIFTY, SENSEX, Gainers & Losers", description: "Market dashboard with indices, top gainers, losers and most active NSE stocks.", index: true },
  { id: "seo-news", path: "/news", title: "Investment News, Tips & Market Analysis", description: "Stock market news, real estate updates and financial education.", index: true },
  { id: "seo-post", path: "/post-property", title: "Post Your Property for Free", description: "List your flat, house, plot or commercial space for free.", index: true },
  { id: "seo-account", path: "/account", title: "My account", description: "", index: false },
];

export const API_PROVIDERS = [
  {
    id: "prov-primary", name: "Primary market data provider", vendor: "Licensed NSE data vendor (to be contracted)", kind: "market",
    role: "primary", enabled: true, mode: "delayed", baseUrl: "https://api.vendor.example/v1", wsUrl: "wss://stream.vendor.example",
    apiKey: "sk_live_****************7c2a", rateLimit: 300, timeoutMs: 4000, pollSeconds: 5, cacheSeconds: 3,
    status: "simulated", latencyMs: 0, lastCheckedAt: "2026-11-17T08:58:00+05:30",
  },
  {
    id: "prov-fallback", name: "Fallback provider", vendor: "Secondary vendor (optional)", kind: "market",
    role: "fallback", enabled: false, mode: "delayed", baseUrl: "https://api.backup.example/v2", wsUrl: "",
    apiKey: "", rateLimit: 120, timeoutMs: 6000, pollSeconds: 15, cacheSeconds: 10,
    status: "not-configured", latencyMs: 0, lastCheckedAt: null,
  },
  {
    id: "prov-sms", name: "SMS / OTP gateway", vendor: "DLT-registered SMS provider", kind: "otp",
    role: "primary", enabled: true, mode: "n/a", baseUrl: "https://sms.vendor.example", wsUrl: "",
    apiKey: "sk_****************91ef", rateLimit: 60, timeoutMs: 5000, pollSeconds: 0, cacheSeconds: 0,
    status: "simulated", latencyMs: 0, lastCheckedAt: "2026-11-16T10:00:00+05:30",
  },
  {
    id: "prov-storage", name: "Object storage (S3-compatible)", vendor: "AWS S3", kind: "storage",
    role: "primary", enabled: true, mode: "n/a", baseUrl: "https://s3.ap-south-1.amazonaws.com/i2g-media", wsUrl: "",
    apiKey: "AKIA************QX3D", rateLimit: 0, timeoutMs: 10000, pollSeconds: 0, cacheSeconds: 0,
    status: "simulated", latencyMs: 0, lastCheckedAt: "2026-11-16T10:00:00+05:30",
  },
];

export const MARKET_CONFIG = {
  trackedIndices: ["NIFTY50", "BANKNIFTY", "NIFTYNEXT50", "SENSEX"],
  showSensex: true,
  dataLabel: "delayed",
  refreshSeconds: 5,
  moversCount: 5,
  holidays: [
    { date: "2026-11-24", name: "Guru Nanak Jayanti" },
    { date: "2026-12-25", name: "Christmas" },
  ],
  disabledSymbols: [],
};

export const SETTINGS = {
  siteName: "invest2growth",
  supportEmail: "support@invest2growth.com",
  supportPhone: "+91 98765 43210",
  maintenanceMode: false,
  requireListingApproval: true,
  autoVerifyBuilders: false,
  maxImagesPerListing: 20,
  maxUploadMb: 10,
  otpLength: 6,
  otpExpiryMinutes: 5,
  sessionHours: 24,
  marketDisclaimer: "Market data is provided for information only and may be delayed. It is not investment advice.",
  contentDisclaimer: "Articles are for general education only and are not investment advice. Consult a SEBI-registered adviser before investing.",
};

export const ADMIN_ROLES = [
  { id: "super_admin", label: "Super Admin" },
  { id: "moderator", label: "Moderator" },
  { id: "content_editor", label: "Content Editor" },
  { id: "support", label: "Support" },
];

export const PERMISSIONS = [
  { id: "users", label: "Users" },
  { id: "properties", label: "Properties & approvals" },
  { id: "agents", label: "Agents & builders" },
  { id: "catalog", label: "Categories & locations" },
  { id: "content", label: "News & tips" },
  { id: "compliance", label: "Compliance review" },
  { id: "market", label: "Market configuration" },
  { id: "providers", label: "API providers & credentials" },
  { id: "ads", label: "Advertisements" },
  { id: "push", label: "Push notifications" },
  { id: "seo", label: "SEO" },
  { id: "reports", label: "Reports" },
  { id: "settings", label: "System settings" },
];

export const ROLE_PERMISSIONS = {
  super_admin: PERMISSIONS.map((p) => p.id),
  moderator: ["users", "properties", "agents", "catalog", "reports"],
  content_editor: ["content", "seo", "push", "ads"],
  support: ["users", "properties", "reports"],
};

// 12 months of platform totals for the analytics charts (Dec 2025 → Nov 2026).
export const MONTHLY_STATS = [
  { month: "2025-12", users: 1840, listings: 412, inquiries: 2210, articles: 38 },
  { month: "2026-01", users: 2120, listings: 455, inquiries: 2480, articles: 41 },
  { month: "2026-02", users: 2290, listings: 470, inquiries: 2610, articles: 36 },
  { month: "2026-03", users: 2740, listings: 528, inquiries: 3090, articles: 44 },
  { month: "2026-04", users: 2610, listings: 541, inquiries: 3150, articles: 40 },
  { month: "2026-05", users: 2980, listings: 590, inquiries: 3420, articles: 47 },
  { month: "2026-06", users: 3210, listings: 612, inquiries: 3600, articles: 45 },
  { month: "2026-07", users: 3460, listings: 655, inquiries: 3910, articles: 52 },
  { month: "2026-08", users: 3390, listings: 670, inquiries: 4020, articles: 49 },
  { month: "2026-09", users: 3820, listings: 718, inquiries: 4380, articles: 55 },
  { month: "2026-10", users: 4410, listings: 802, inquiries: 5120, articles: 58 },
  { month: "2026-11", users: 2950, listings: 534, inquiries: 3310, articles: 31 },
];
