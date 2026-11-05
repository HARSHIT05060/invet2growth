# invest2growth

Property marketplace website for buying, selling and renting across India.
Built with Next.js 16 (App Router), React 19 and plain CSS.

## Run it locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. Other devices on your Wi-Fi can use the Network address that `npm run dev` prints.

To test the production build locally:

```bash
npm run build
npm run start
```

## Folder structure

```
public/images/            Static images (served at /images/...)
  categories/             Category gallery photos
  listings/               Property listing photos

src/
  app/                    Routes (each folder with a page.jsx is a URL)
    layout.jsx            Shell for every page: fonts, SEO, header, footer
    page.jsx              Home page  →  /
    contact/page.jsx      Contact page  →  /contact
    login/page.jsx        Log in (coming soon)  →  /login
    not-found.jsx         404 page for unknown URLs
    api/listings/route.js JSON API  →  /api/listings
    icon.png              Browser tab icon
    globals.css           All styles and design tokens

  components/
    layout/               Header, Footer, SmoothScroll (scroll animations)
    home/                 Home page sections
    ui/                   Small shared pieces

  data/                   Site content: menu, contact details, cities, listings
  lib/                    Helpers (listing lookups, scrolling, formatting)
```

**Editing content:** menu links and contact details are in `src/data/site.js`;
cities, categories and budgets in `src/data/catalog.js`; properties in
`src/data/listings.js`.

## API

| Request                       | Returns            |
| ----------------------------- | ------------------ |
| `GET /api/listings`           | All listings       |
| `GET /api/listings?mode=rent` | Rentals (or `buy`) |
| `GET /api/listings?id=2`      | One listing        |

## Deploy to Vercel

### 1. Put the code on GitHub

Create an empty repository on https://github.com/new (no README, no .gitignore), then run in this folder:

```bash
git init
git add .
git commit -m "invest2growth website"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git push -u origin main
```

### 2. Import it on Vercel

1. Go to https://vercel.com and sign up with GitHub.
2. Click **Add New → Project** and pick your repository.
3. Leave every setting as it is (Vercel detects Next.js automatically) and click **Deploy**.

After about a minute you get a live link like `https://your-repo.vercel.app`.

### 3. Updating the site

Every `git push` to `main` redeploys automatically:

```bash
git add .
git commit -m "Describe your change"
git push
```

### Optional

- **Custom domain:** Project → Settings → Domains.
- **Social preview link:** after adding a domain, set the environment variable
  `NEXT_PUBLIC_SITE_URL` (for example `https://invest2growth.com`) in
  Project → Settings → Environment Variables, then redeploy.
