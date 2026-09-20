# Architecture

Two processes, two HTTP surfaces. UI work always goes through a server action.

```
Shopify Admin (iframe)          Browser tab
        │  ID token                     │  staff cookie
        ▼                               ▼
 actions/shopify                 actions/admin
        │                               │
        ▼                               ▼
   lib/shopify                      lib/admin
        │
        │  enqueue (Shopify → /api/webhooks only)
        ▼
     Redis → workers (WORKER_MODE) → jobs/webhooks
```

Read [actions.md](actions.md) before adding a button, form, or page.

## Processes

HTTP always goes through `web/server.js` (Express + Next). CapRover and `npm run dev` / `npm run start` use that file — not `next dev` / `next start`.

**Web** (`WORKER_MODE=false`) serves the merchant iframe, `/admin`, and inbound HTTP. It enqueues webhooks. It does not construct BullMQ `Worker`s.

**Worker** (`WORKER_MODE=true`) is the same custom server. After Next prepares, `server.js` calls `startWorkers()`. Local `.env` sets this so one process does both. CapRover usually runs a second app with the same image.

`web/worker.ts` still exists if you want workers in a process that does not serve HTTP.

Redis is the queue. Prisma holds shops, offline tokens, and staff users.

See [deploy.md](deploy.md) for CapRover.

## Surfaces

| Surface | URL | Auth | Frame |
| --- | --- | --- | --- |
| Merchant app | `/`, `/settings` | App Bridge ID token → `actions/shopify` | Shopify Admin iframe |
| Staff admin | `/admin` | Cookie → `actions/admin` | Standalone (`frame-ancestors 'none'`) |

`app/(embedded)/` wraps merchant pages in App Bridge + `SessionProvider`. `app/admin/` does not. The App Bridge script stays in the root layout so Shopify’s embed check sees it on `/`.

`/api/webhooks` and `/api/health` are not UI. Do not use that folder for merchant or staff features.

## Layers

| Folder | Owns | Does not own |
| --- | --- | --- |
| `actions/<department>/` | One `"use server"` function per file | Prisma, GraphQL, hashing, extra helpers |
| `lib/<department>/` | Domain rules, I/O, auth helpers | UI, `"use server"` entrypoints |
| `utils/` | Pure formatters, serializers, crypto, dates, hostnames | Auth, Prisma, Shopify, env-based identity |
| `jobs/webhooks/` | What a Shopify topic does | HMAC, HTTP, UI |
| `lib/queues/` | Enqueue and worker boot | Job business rules |
| `app/(embedded)/` | Merchant views | Tokens, mutations |
| `app/admin/` | Staff views | Shopify ID tokens |
| `app/api/` | Shopify webhooks and health | Anything a button calls |

## Data

`Shop` — myshopify domain, expiring offline token, profile fields.

`User` — internal staff only. Not a Shopify staff member.

`ComplianceRequest` — GDPR payloads. Replace with a real export/delete before App Store review.

SQLite is the default. Change `provider` in `schema.prisma` for Postgres or MySQL.

## Adding a feature

1. Write the rule in `lib/<department>/`.
2. Add one action file under `actions/<department>/`.
3. If Shopify triggers it, add a webhook job and register the topic.
4. Keep pages as views.
