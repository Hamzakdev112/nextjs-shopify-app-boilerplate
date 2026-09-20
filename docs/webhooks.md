# Webhooks

Shopify must get a `2xx` quickly. The route verifies HMAC, enqueues, and returns. The worker does the work.

```
POST /api/webhooks
    verify HMAC (raw body)
    enqueue { shop, payload }  jobId = x-shopify-webhook-id
    200

worker
    processAppUninstalled / processShopUpdate / GDPR
```

## Topics in this starter

| Topic | Job | Effect |
| --- | --- | --- |
| `app/uninstalled` | `jobs/webhooks/app-uninstalled.ts` | Clear tokens, set `uninstalledAt` |
| `shop/update` | `jobs/webhooks/shop-update.ts` | Name, email, currency, timezone, plan |
| `customers/data_request` | `jobs/webhooks/compliance.ts` | Store the payload |
| `customers/redact` | `jobs/webhooks/compliance.ts` | Store the payload |
| `shop/redact` | `jobs/webhooks/compliance.ts` | Store the payload, delete the shop |

GDPR topics are required for App Store review. The compliance table is a placeholder — implement a real export/delete before you submit.

## Add a topic

1. Subscribe in `shopify.app.toml` under `[[webhooks.subscriptions]]`.
2. Write a processor in `web/src/jobs/webhooks/` that accepts `Job<WebhookJobData>`.
3. Register it in `web/src/lib/queues/registry.ts` with a queue name.
4. Deploy the app config (`shopify app deploy` or `shopify app dev`).

Unknown topics are acknowledged and ignored so a mistyped subscription does not fail delivery.

## HMAC

`verifyShopifyWebhook` hashes the **raw** body with `SHOPIFY_API_SECRET` and compares with `timingSafeEqual`. Do not `request.json()` before that check.

Invalid HMAC → `401`. Enqueue failure → `500` so Shopify retries.

## Idempotency and retries

Jobs use `x-shopify-webhook-id` as `jobId`. A replay of the same delivery is dropped by BullMQ.

Each job gets 3 attempts with exponential backoff (10s base). Failed jobs stay for 14 days.

Processors should be safe to run twice (update-by-domain, not “insert once”).

## Local delivery

`shopify app dev` rewrites the subscription URI to the tunnel. Keep Redis and the worker running or jobs will sit in the queue.

```bash
docker compose up -d
npm run dev
```

`web:dev` is the custom server. With `WORKER_MODE=true` in `web/.env`, that process also starts the workers.
