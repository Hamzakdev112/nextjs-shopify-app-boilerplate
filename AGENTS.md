# This repo

Embedded Next.js Shopify app plus a standalone staff admin. `web/` is the Next.js app. Docs in `docs/` are the source of truth.

## Rules

- Every merchant and staff UI operation is a server action. One exported function per file under `actions/<department>/`.
- Domain logic lives in `lib/<department>/`. `utils/` is formatters, serializers, crypto, dates, hostnames — no I/O, no auth.
- Merchant actions take an App Bridge ID token and call `requireMerchantFromIdToken`. Do not trust `?shop=`.
- Staff actions call `requireAdminUser` / `requireAdminShop`. Do not wrap `/admin` in `SessionProvider`.
- Return `ActionResponse<T>`. Do not throw to the UI.
- `/api` is webhooks and health only.
- Offline tokens live in Prisma. Jobs use `getOfflineSession`.
- `shopify.app.dev.toml` is local. Do not commit it. Developers copy `shopify.app.toml` — see `docs/setup.md`.
- HTTP runs through `web/server.js`. Do not switch local/prod back to `next dev` / `next start`.
- `startWorkers()` only from `server.js` when `WORKER_MODE=true`, or from `web/worker.ts`. Route handlers and actions must not import `lib/queues/worker.ts`.
- Comments only when the next reader would otherwise do the wrong thing.

Read `docs/actions.md` before adding a feature.
