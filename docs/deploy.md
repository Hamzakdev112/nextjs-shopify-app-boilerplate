# Deploy (CapRover)

HTTP is a custom Express server (`web/server.js`) that prepares Next.js and listens on `PORT`. CapRover sits behind a proxy; the server sets `trust proxy`.

Same Docker image, two apps. The process is always `node --import tsx server.js`.

| CapRover app | `WORKER_MODE` | Role |
| --- | --- | --- |
| Web | `false` | Merchant iframe, `/admin`, enqueue webhooks |
| Worker | `true` | Same HTTP server, plus BullMQ workers (started from `server.js`) |

Point Shopify webhook URIs at the host that should accept them. Locally that is the tunnel. In production it is often the worker app so intake and processing share a box.

## Local

`web/.env` should include `WORKER_MODE=true` so one process serves Next and runs workers:

```bash
cd web
npm run dev
```

That is `node --import tsx server.js`, not `next dev`. Next still compiles the app and HMR works. `tsx` is only there so `server.js` can start the TypeScript workers.

`npm run start` is the same custom server after `npm run build`.

`npm run worker` starts workers alone if you want them in a second process.

## CapRover

1. Create two apps from this repo (or one app if you are fine running workers on the web box).
2. Deploy from the repo root. CapRover reads `captain-definition` → `Dockerfile` and `COPY web/`.
3. Enable HTTPS on the app. Put that public origin in `SHOPIFY_APP_URL` and deploy the Shopify app config.
4. Env on **web**:

```
NODE_ENV=production
PORT=3000
WORKER_MODE=false
SHOPIFY_API_KEY=
SHOPIFY_API_SECRET=
SHOPIFY_APP_URL=https://app.example.com
SHOPIFY_API_SCOPES=read_products
DATABASE_URL=
REDIS_HOST=
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
ADMIN_SESSION_SECRET=
```

`REDIS_URL` also works if you prefer a single string.

5. Env on **worker** — same as web, plus:

```
WORKER_MODE=true
```

If webhooks should hit the worker hostname, set the subscription URI (or `shopify.app.toml`) to that host’s `/api/webhooks`.

SQLite is for local clones. Use Postgres or MySQL on CapRover (`provider` in `prisma/schema.prisma`).

## Image

`Dockerfile` installs `web/`, generates Prisma, builds Next, prunes devDependencies, and runs:

```
node --import tsx server.js
```

Health: CapRover can GET `/api/health`.
