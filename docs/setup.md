# Setup

`shopify.app.toml` is the committed template. It has no client ID and no tunnel URL.

**`shopify.app.dev.toml` is not in git.** Every developer creates their own after clone. `npm run dev` is `shopify app dev -c dev` and will not start without that file.

```bash
cp shopify.app.toml shopify.app.dev.toml
```

Then set `client_id` to the app’s client ID from the [Shopify Dev Dashboard](https://dev.shopify.com/dashboard) (same value as `SHOPIFY_API_KEY` in `web/.env`). Keep `scopes` aligned with `SHOPIFY_API_SCOPES`.

`shopify app dev` rewrites `application_url` and `redirect_urls` to the tunnel. Do not commit the result.

The same pattern applies later for `shopify.app.prod.toml` / `shopify.app.staging.toml` if you add those configs.

## Tunnel (ngrok)

Use a **reserved ngrok domain**, not the Cloudflare tunnel Shopify CLI starts by default.

That default hostname changes every `shopify app dev`. Then App Bridge, `SHOPIFY_APP_URL`, redirect URLs, and webhook URIs all have to be rewritten. A reserved ngrok URL does not change, so the Dev Dashboard, `shopify.app.dev.toml`, and `web/.env` stay pointed at the same origin.

1. Reserve a domain in the [ngrok dashboard](https://dashboard.ngrok.com/).
2. Tunnel to the Shopify CLI proxy (port `3000` unless you overrode it):

```bash
ngrok http --url=https://your-name.ngrok-free.dev 3000
```

3. Point Shopify CLI at that origin:

```bash
npm run dev -- --tunnel-url=https://your-name.ngrok-free.dev:3000
```

Set `SHOPIFY_APP_URL` in `web/.env` to the same `https://…` origin (no port).

## First run

```bash
npm install
cd web && npm install
cp .env.example .env
```

Fill `web/.env`, then:

```bash
cp shopify.app.toml shopify.app.dev.toml
# set client_id in shopify.app.dev.toml

docker compose up -d
cd web && npx prisma db push
```

From the repo root (ngrok already running on the reserved domain):

```bash
npm run dev -- --tunnel-url=https://your-name.ngrok-free.dev:3000
```
