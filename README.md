# invest2growth: frontend (UI/UX prototype)

Real estate marketplace + NSE market dashboard + investment news, with a Super Admin panel.
Built with Next.js 16 (App Router), React 19 and plain CSS.

> **Frontend only.** There is no backend yet. All data comes from clearly separated
> sample data in `src/mock/` and is kept in the browser (localStorage), so every
> button works end-to-end in the demo: a listing you post shows up in the admin
> approval queue, approving it publishes it, and so on. Market prices are
> **simulated** and labelled as such on every market screen.

## Run it locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

### Demo logins

| Where | How |
| --- | --- |
| Website | Mobile OTP with any number, code `123456`; or email `aarav.sharma@example.com` with any 6+ character password |
| Admin (`/admin/login`) | `admin@invest2growth.com` (Super Admin), `editor@invest2growth.com` (Content Editor), `moderator@invest2growth.com` (Moderator). Password `Admin@123` |

Reset everything from **Admin → System settings → Data & privacy → Reset demo data**.

## What's included

**Website** (`src/app/(site)`)

- Home: search hero (buy / rent / lease / sell), categories, popular listings, market snapshot, latest news
- `/properties`: search with filters (type, segment, category, city, locality, budget, area, BHK, furnishing, possession, verified), sort, grid / list / **map** view (OpenStreetMap + Leaflet)
- `/properties/[id]`: gallery + lightbox, full specs, amenities, map + Google Maps link, documents, call / WhatsApp / inquiry / site visit / share / report, similar and recently viewed
- `/compare`: up to 4 properties side by side
- `/post-property`: 7-step listing wizard (photos, documents, validation, drafts, edit mode)
- `/login`, `/signup`, `/forgot-password`: mobile OTP, email, Google (demo), role selection
- `/account/*`: overview, my properties (edit / mark sold / delete), inquiries and site visits, saved items, profile + photo, notification preferences, password, data export and deletion (DPDP)
- `/notifications`
- `/market`: indices, NIFTY chart, breadth, sectors, gainers / losers / volume / active, watchlist, market news
- `/market/stocks/[symbol]`: quote, day and 52-week ranges, stats, 1D–5Y charts, price alerts
- `/market/watchlist`, `/market/compare`
- `/news`, `/news/[slug]`: categories, search, tags, featured, trending, like / bookmark / share, related, SEBI disclaimer
- `/legal/disclaimer`, `/legal/privacy`, `/legal/terms`
- Mobile bottom tab bar (Home, Properties, Market, News, Profile) matching the planned app

**Super Admin** (`src/app/admin`): dashboard, property approvals (moderation checklist), properties,
inquiries and reports, agents and builders (KYC / RERA), categories, locations, users, news and articles
(rich text editor, SEO, scheduling, compliance review), investment tips, market configuration, API
providers (Super Admin only), advertisements, push notifications, SEO, reports and analytics, audit logs,
and system settings (roles and permissions matrix, admin users). Navigation and pages are gated by role permissions.

## Folder structure

```
src/
  app/
    (site)/          Public website (header, footer, mobile tab bar)
    admin/(auth)/    Admin login
    admin/(panel)/   Admin pages (sidebar shell, permission-gated)
    globals.css      Base design tokens + home page
    app.css          Website UI (marketplace / market / news identities)
    admin.css        Admin panel UI
  components/        UI by area: property, market, news, account, admin, charts, ui, layout
  lib/
    db/store.js      Browser demo database + all actions (swap for REST calls)
    market/          Provider-independent market data layer (mock provider, cache, fallback)
    format.js, property.js, articles.js, sanitize.js
  mock/              Sample data, development only (see src/mock/README.md)
  data/              Site content: menu, contact, home page cities and categories
```

## Connecting the backend later

- Replace the bodies of `actions` in `src/lib/db/store.js` with calls to `/api/v1/*` and keep the signatures.
- Add a licensed market data adapter next to `src/lib/market/providers/mock.js` and select it with
  `NEXT_PUBLIC_MARKET_PROVIDER`. Do not scrape NSE.
- Delete `src/mock/` once real data flows.

## Deploy to Vercel

Push to GitHub, import the repository on https://vercel.com, and keep the defaults. Optionally set
`NEXT_PUBLIC_SITE_URL` to your domain for social previews.
