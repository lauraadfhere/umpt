# UMPT Digital Library

Next.js 16 (App Router) platform styled after the ACM Digital Library: black chrome header, grey sub-navigation, geometric grey hero, italic section titles with a black bar, grey panels, and book cards with a red **NEW** badge. Type is set in **Fira Sans** (Noto Sans Arabic for RTL).

## Stack

- Next.js 16 + React 19 + TypeScript, built with webpack
- Tailwind CSS 4 (PostCSS); design tokens live in `src/app/globals.css` (`@theme`)
- `next-intl`: English, French, Spanish, Arabic (RTL)
- Backend: the same Parse Server as `daily-essential`, accessed server-side only

## Getting started (Yarn Classic v1)

This repo uses **Yarn 1.x** (Classic), not Yarn Berry (v2+). If you only have Yarn 4 from Corepack:

```bash
corepack disable
npm install -g yarn@1.22.22
yarn --version
# should print 1.22.x
```

Then:

```bash
cd umpt-platform
rmdir /s /q node_modules
del yarn.lock 2>nul
yarn install
yarn dev
```

Open http://localhost:3000. You are redirected to `/en`.

## Environment

`.env.local` (git-ignored) holds the backend credentials copied from `daily-essential`:

| Variable | Purpose |
|---|---|
| `PARSE_SERVER_URL`, `PARSE_APP_ID`, `PARSE_REST_KEY` | Read catalog data |
| `PARSE_MASTER_KEY` | Uploads (Parse Files) |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` | Dashboard sign-in |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Feedback tab and footer contact links (placeholder address until set) |
| `NEXT_PUBLIC_SITE_URL` | Optional public origin for RSS links |

See `.env.example` for placeholders.

## Routes

| Route | What it shows |
|---|---|
| `/[locale]` | Home: welcome panel and book cards |
| `/[locale]/proceedings` | Proceedings: title search and A–Z index (`?q=` supported) |
| `/[locale]/books` | All books from the Parse `Book` class |
| `/[locale]/people` | Author directory with subject filter |
| `/[locale]/login` | Admin sign-in |
| `/[locale]/dashboard` | Backend health, book catalog, image upload (admin only) |
| `/api/health` | Parse Server health check |
| `/api/books`, `/api/proceedings` | JSON catalog |
| `/api/rss` | RSS feed of the newest proceedings |
| `/api/admin/login`, `/api/admin/logout`, `/api/admin/uploads` | Auth and uploads |

While a page loads, `src/app/[locale]/loading.tsx` shows the ten-bar spinner from `src/components/ui/Loader.tsx`; the same loader appears in the sign-in button and the image uploader.

Books read from the Parse `Book` class and proceedings from `Proceeding` (`acronym`, `title`, `year`). When a class is empty or Parse is unreachable, bundled sample data is shown and the dashboard says so.

## Deploy on Cloudflare Workers

This app targets **[@opennextjs/cloudflare](https://opennext.js.org/cloudflare)** with `nodejs_compat` (see `wrangler.jsonc`).

1. Copy `.dev.vars.example` → `.dev.vars` and set `NEXTJS_ENV=development` for local Wrangler preview.
2. In the Cloudflare dashboard, add **production** secrets mirroring `.env.local` (`PARSE_*`, `ADMIN_*`, etc.).
3. Install deps and build:

```bash
yarn install
yarn build:worker
```

4. Preview locally on Workers runtime:

```bash
yarn preview:worker
```

5. Deploy:

```bash
yarn deploy:worker
```

Set `wrangler.jsonc` → `name` to your Worker name. Point your custom domain in Cloudflare after the first deploy.
