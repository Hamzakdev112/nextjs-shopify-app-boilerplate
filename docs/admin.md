# Staff admin

`/admin` is an internal dashboard for your team. It is not the merchant app and it does not use App Bridge.

Open it as a normal browser tab: `https://<app-host>/admin`.

User-triggered work (login, create user, password, retry job) goes through `actions/admin/<one-action>.ts`. See [actions.md](actions.md).

## Routes

| Route | Purpose |
| --- | --- |
| `/admin/login` | `loginStaff` |
| `/admin` | Shop and staff counts (read via `lib/admin`) |
| `/admin/stores` | All shops |
| `/admin/stores/[id]` | One shop |
| `/admin/users` | `createStaffUser` |
| `/admin/jobs` | `retryStaffJob` |
| `/admin/account` | `updateOwnPassword` |

## Auth

1. `loginStaff` checks email + password (`utils/password` + `lib/admin/users`).
2. `lib/admin/staff-session` sets `staff_session` (7 days, `SameSite=Lax`).
3. `app/admin/(staff)/layout.tsx` calls `getAdminUser()` and redirects to `/admin/login` when the cookie is missing.
4. Mutations call `requireAdminUser()` before they touch Prisma or Redis.

Signing uses `ADMIN_SESSION_SECRET`, or `SHOPIFY_API_SECRET` if that is unset.

Admin routes send `Content-Security-Policy: frame-ancestors 'none'`.

## First user

```bash
cd web
# ADMIN_EMAIL / ADMIN_PASSWORD in .env
npx prisma db push
npm run db:seed
```

Then open `/admin/login`.

## Acting on a shop

Use `requireAdminShop(id)` when a staff action mutates a specific store. Jobs still use that shop’s offline Shopify token (`getOfflineSession`). Staff credentials never go to Shopify.
