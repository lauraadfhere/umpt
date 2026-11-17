# Cloudflare Workers build (Git-connected)

## Dashboard build settings (Workers & Pages → umpt → Settings)

| Field | Value |
| --- | --- |
| **Build command** | `yarn build:worker` |
| **Deploy command** | `npx wrangler deploy` |

Cloudflare already runs `yarn install` (immutable) before the build command. Do **not** repeat `yarn install` in the build step.

If your UI only exposes **Deploy command**, use:

`yarn build:worker && npx wrangler deploy`

## Variables & secrets (Settings → Variables)

Add these as **Secrets** (encrypted), copying values from your local `.env.local`:

| Name | Required |
| --- | --- |
| `PARSE_SERVER_URL` | Yes |
| `PARSE_APP_ID` | Yes |
| `PARSE_REST_KEY` | Yes |
| `PARSE_MASTER_KEY` | Yes (uploads / admin writes) |
| `ADMIN_EMAIL` | Yes |
| `ADMIN_PASSWORD` | Yes |
| `ADMIN_SESSION_SECRET` | Yes |
| `NEXT_PUBLIC_SITE_URL` | Yes (public site URL) |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Recommended |

Optional: `PARSE_QUERY_TIMEOUT_MS`, `READER_SESSION_SECRET`.

Production also sets `NODE_ENV=production` automatically on Workers.

## Local deploy

```bash
yarn install
yarn cf:deploy
```

Requires `wrangler login` or `CLOUDFLARE_API_TOKEN`.