# Authentication

There are two callers. Do not mix their credentials.

## Merchant (embedded)

No cookie login and no authorization-code redirect for the merchant session.

1. Shopify Admin loads `application_url` in an iframe.
2. App Bridge initializes asynchronously and sets `window.shopify` (listen for `shopify:ready`). `SessionProvider` waits for that; a missing object on first paint does not mean you are outside Admin.
3. `SessionProvider` calls `shopify.idToken()` and `establishSession` (`actions/shopify/establish-session.ts`) through `callMerchantAction`.
4. The action runs `requireMerchantFromIdToken`, token-exchanges for an **expiring offline** access token, and upserts the shop.
5. Tokens stay on the server.

Later merchant UI work uses the same pattern: fresh ID token in, `ActionResponse` out. `callMerchantAction` retries once on `UNAUTHORIZED`.

ID tokens last about a minute. Do not cache them.

| Token | Bound to | Use |
| --- | --- | --- |
| ID token | Current Admin tab | Prove the request came from Shopify Admin |
| Offline access token | The shop | Webhooks, jobs, Admin API |
| Online access token | A store staff member | Per-user Shopify permissions (not wired up) |

Jobs cannot mint an ID token. They use `getOfflineSession`.

`requireMerchantFromIdToken` checks the JWT with `SHOPIFY_API_SECRET` and takes the shop from `dest`.

Managed installation (`use_legacy_install_flow = false`) grants scopes at install. The first `establishSession` is what writes tokens.

`app/uninstalled` clears tokens and sets `uninstalledAt`. The next open exchanges again.

Opened outside Admin, `window.shopify` is missing — the shell tells the merchant to open the app from **Apps**.

## Staff (internal admin)

See [admin.md](admin.md).

- `loginStaff` / `logoutStaff` in `actions/admin`
- Signed `staff_session` cookie
- `requireAdminUser()` / `requireAdminShop(id)`
- Never send this cookie to Shopify, and never treat an ID token as staff auth
