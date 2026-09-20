# Server actions

Every click, submit, and boot from the **merchant UI** or **staff admin** goes through a Next.js server action. No `fetch` to `/api/*` from those surfaces.

Shopify webhooks and ops probes stay as route handlers (`/api/webhooks`, `/api/health`). Those are not app UI.

## One file, one action

```
actions/<department>/<verb>-<noun>.ts
```

The file exports **one** `"use server"` function. Not two. Not a class. Not a barrel of helpers.

| UI does this | File |
| --- | --- |
| Merchant opens the app | `actions/shopify/establish-session.ts` |
| Staff signs in | `actions/admin/login.ts` |
| Staff creates a colleague | `actions/admin/create-user.ts` |
| Later: merchant saves a product | `actions/products/save-product.ts` |

If the work needs more than one function, those functions live in `lib/<department>/`. The action file only authenticates, validates, calls lib, and returns.

```typescript
"use server";

import { actionFail, actionFailFromError, actionOk, type ActionResponse } from "@/lib/core/action-response";
import { requireMerchantFromIdToken } from "@/lib/core/auth-context";
import { saveProduct } from "@/lib/products/save-product";

export async function saveProductAction(
  idToken: string,
  input: SaveProductInput,
): Promise<ActionResponse<{ id: string }>> {
  try {
    const { shop } = await requireMerchantFromIdToken(idToken);
    if (!input.title.trim()) {
      return actionFail("VALIDATION", "Title is required");
    }
    const product = await saveProduct(shop, input);
    return actionOk({ id: product.id });
  } catch (error) {
    return actionFailFromError(error);
  }
}
```

That products example is the shape — this starter does not ship a products feature.

## Departments

The folder name is the domain, not the HTTP verb and not a dump drawer.

| Department | When to use it |
| --- | --- |
| `actions/shopify` + `lib/shopify` | Install, tokens, Admin API, shop profile |
| `actions/admin` + `lib/admin` | Staff login, staff users, store list, jobs |
| `actions/products` + `lib/products` | Product work (when you add it) |
| `actions/billing` + `lib/billing` | Billing (when you add it) |

Merchant and staff do not share an action file. A staff “retry job” is `actions/admin/retry-job.ts`, not `actions/shopify/…`.

## What the action may do

1. Resolve who is calling:
   - Merchant: `requireMerchantFromIdToken(idToken)` — the client passes a fresh App Bridge ID token.
   - Staff: `requireAdminUser()` / `requireAdminShop(id)` — cookie session.
2. Validate input. Return `actionFail("VALIDATION", …)` on bad input.
3. Call `lib/<department>/`.
4. `revalidatePath` if a staff page must refresh.
5. Return `ActionResponse<T>`. Never throw to the UI. Never `export default`.

`logoutStaff` is the one action that `redirect`s instead of returning a payload.

## What the action must not do

- Prisma queries, Shopify GraphQL, Redis, or password hashing inline
- A second exported action in the same file
- Trust `?shop=` or a client-supplied shop id without `requireMerchantFromIdToken` / `requireAdminShop`

## `lib/` vs `utils/`

| | `lib/<department>/` | `utils/` |
| --- | --- | --- |
| May talk to Prisma, Shopify, Redis, cookies | Yes | No |
| Encodes a business rule | Yes | No |
| Auth, install, sessions | Yes | No |
| Formatters, serializers, HMAC, password hash, hostnames, dates | No | Yes |

`utils/` is only pure helpers. If a function needs `process.env` to decide *who* someone is, it is not a util.

```
utils/hmac.ts
utils/password.ts
utils/signed-payload.ts
utils/hostname.ts
utils/format-date.ts
```

## Client call

Merchant actions need an ID token. Use `callMerchantAction` so a stale token retries once:

```typescript
const result = await callMerchantAction((idToken) => saveProductAction(idToken, input));
if (!result.success) {
  // result.code is UNAUTHORIZED | VALIDATION | …
}
```

Staff actions run from forms and buttons. The cookie is already on the request.

## Server Components

Staff pages (`app/admin/(staff)`) may **read** through `lib/admin` after the layout has confirmed a session. That is a render, not a user action.

The moment the user submits, retries, or logs in, that path is an action file.

## Adding a feature

1. Put the rule in `lib/<department>/`.
2. Add `actions/<department>/<one-action>.ts`.
3. Point the button or form at that action.
4. Do not add an `/api` route for UI work.
