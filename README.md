# Next.js Shopify App

Embedded Shopify app starter. Next.js App Router in Admin, token exchange for access tokens, Prisma for shops, BullMQ + Redis for webhooks, and a standalone staff admin at `/admin`.

Merchant and staff UI talk to the server only through **server actions** — one action per file, domain code in `lib/<department>/`, pure helpers in `utils/`. See [docs/actions.md](docs/actions.md).

No product logic, no extensions. Add those when you have a reason.

## Stack

| Piece | Choice |
| --- | --- |
| App | Next.js 15 (App Router), React 19 |
| Merchant auth | App Bridge ID tokens → `establishSession` |
| Staff auth | Signed cookie + password hash (`/admin`) |
| Admin API | `@shopify/shopify-api` |
| Database | Prisma + SQLite (swap the provider when you need to) |
| Jobs | BullMQ on Redis |
| CLI | Shopify CLI (`shopify.app.toml`) |

HTTP is a custom Express server (`web/server.js`) — same shape as a CapRover deploy. `WORKER_MODE=true` also starts BullMQ workers in that process. See [docs/deploy.md](docs/deploy.md).

## Quick start

1. Create an **embedded** app in the [Shopify Dev Dashboard](https://dev.shopify.com/dashboard) and copy the client ID and secret.

2. Install dependencies and copy env files:

```bash
npm install
cd web && npm install
cp .env.example .env
```

3. Fill `web/.env`:

```
SHOPIFY_API_KEY=          # same as client_id
SHOPIFY_API_SECRET=
SHOPIFY_APP_URL=          # reserved ngrok origin, e.g. https://your-name.ngrok-free.dev
SHOPIFY_API_SCOPES=read_products
DATABASE_URL="file:./dev.db"
REDIS_URL=redis://127.0.0.1:6379
WORKER_MODE=true
ADMIN_EMAIL=you@company.com
ADMIN_PASSWORD=a-long-password
```

4. Create **your** Shopify CLI config (this file is gitignored — every developer makes one):

```bash
cp shopify.app.toml shopify.app.dev.toml
```

Put your client ID in `shopify.app.dev.toml`. Keep `scopes` aligned with `SHOPIFY_API_SCOPES`. See [docs/setup.md](docs/setup.md).

5. Start Redis and create the database:

```bash
docker compose up -d
cd web && npx prisma db push
```

6. From the repo root, start ngrok on a **reserved domain** (the URL stays the same across runs — Shopify’s default tunnel does not), then:

```bash
ngrok http --url=https://your-name.ngrok-free.dev 3000
npm run dev -- --tunnel-url=https://your-name.ngrok-free.dev:3000
```

See [docs/setup.md](docs/setup.md).

- Merchants: open the app from the development store’s **Apps** menu.
- Staff: `cd web && npm run db:seed`, then open `/admin` in a normal tab. [docs/admin.md](docs/admin.md).

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | `shopify app dev -c dev` (pass `--tunnel-url` for ngrok) |
| `npm run web:dev` | Custom server (`server.js`), workers if `WORKER_MODE=true` |
| `npm run worker` | Workers only |
| `npm run web:build` / `web:start` | Production custom server |
| `npm --prefix web test` | Vitest |
| `npm run deploy:dev` | Push config from `shopify.app.dev.toml` |

CapRover: same image, two apps. Web has `WORKER_MODE=false`; worker has `WORKER_MODE=true`. [docs/deploy.md](docs/deploy.md).

## Layout

```
├── Dockerfile
├── captain-definition
├── docs/
│   ├── setup.md              Clone and shopify.app.dev.toml
│   ├── actions.md            How to add UI work
│   ├── architecture.md
│   ├── authentication.md
│   ├── admin.md
│   ├── webhooks.md
│   └── deploy.md             CapRover + custom server
└── web/
    ├── server.js             Express + Next (CapRover entry)
    ├── worker.ts             Workers without HTTP
    └── src/
        ├── actions/
        │   ├── shopify/      One file per merchant action
        │   └── admin/        One file per staff action
        ├── lib/
        │   ├── shopify/      Tokens, Admin API, session
        │   ├── admin/        Staff session and queries
        │   ├── core/         ActionResponse, auth entry
        │   └── queues/
        ├── utils/            Format, crypto, dates — no I/O
        ├── app/(embedded)/   Merchant UI
        ├── app/admin/        Staff UI
        └── app/api/          Webhooks + health only
```

## Where to add things

| Want | Put it here |
| --- | --- |
| A button or form | `actions/<department>/<one-action>.ts` |
| The rule behind it | `lib/<department>/` |
| A date, hash, or hostname helper | `utils/` |
| A merchant page | `app/(embedded)/` + `components/app-nav.tsx` |
| A staff page | `app/admin/(staff)/` + `components/admin/nav.tsx` |
| A Shopify event | [docs/webhooks.md](docs/webhooks.md) |
| Scopes | `shopify.app.toml` and `SHOPIFY_API_SCOPES` |

Read [docs/actions.md](docs/actions.md) and [docs/architecture.md](docs/architecture.md) before changing the layering.
