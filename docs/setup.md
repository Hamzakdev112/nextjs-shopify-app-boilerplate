# Setup

`shopify.app.toml` is the committed template. It has no client ID and no tunnel URL.

**`shopify.app.dev.toml` is not in git.** Every developer creates their own after clone. `npm run dev` is `shopify app dev -c dev` and will not start without that file.

```bash
cp shopify.app.toml shopify.app.dev.toml
```

Then set `client_id` to the app’s client ID from the [Shopify Dev Dashboard](https://dev.shopify.com/dashboard) (same value as `SHOPIFY_API_KEY` in `web/.env`). Keep `scopes` aligned with `SHOPIFY_API_SCOPES`.

`shopify app dev` rewrites `application_url` and `redirect_urls` to the tunnel. Do not commit the result.

The same pattern applies later for `shopify.app.prod.toml` / `shopify.app.staging.toml` if you add those configs.

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

From the repo root:

```bash
npm run dev
```
