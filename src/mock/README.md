# Mock data (development only)

Everything in this folder is **sample data for the UI prototype**. It is not real
property, market or user data and must never be shipped as production content.

- The website and admin panel read it through `src/lib/db` (properties, users,
  articles, admin records) and `src/lib/market` (stock quotes and charts).
- Those two layers are the only places that know this folder exists. When the
  NestJS backend is ready, swap their internals for REST calls to `/api/v1/...`
  and delete this folder; no page or component imports from here directly.
- Market prices are **simulated** by `src/lib/market/providers/mock.js` and are
  labelled as such in the UI. Real NSE data must come from a licensed provider.
