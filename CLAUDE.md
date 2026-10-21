# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

"FoodLingo" — a multilingual (vi/en/…) restaurant ordering web app for a Vietnamese food shop (software engineering course project). The root `README.md` is a stub; all code lives in `project/` (Next.js 16 App Router, React 19, Tailwind v4, shadcn/ui + `@base-ui/react`, TypeScript). UI text and code comments are mostly in Vietnamese.

## Commands

Run from `project/` (package manager is pnpm; `package-lock.json` also exists):

```
pnpm install
pnpm dev      # next dev
pnpm build    # next build
pnpm start    # next start
```

There is no lint script and no test suite configured.

Environment: copy `project/.env.example` to `project/.env.local`. `ADMIN_PIN` (default `1234`) guards the kitchen pages. `SUPABASE_URL` + `SUPABASE_SECRET_KEY` are optional (see storage below).

## Architecture

**Two-sided order model.** Customers and the kitchen see orders in different stores:
- *Customer side* is entirely client-side state in `lib/store.tsx` (`AppProvider`/`useApp`): language, cart, user (fake auth), and local orders, all persisted in `localStorage` under `foodlingo:*` keys. Local order IDs look like `DH4004`.
- *Shop side* orders are persisted server-side via `lib/orders-db.ts` and have 6-digit IDs. `lib/order-links.ts` maps local ID → server ID in localStorage and polls `/api/orders/status` every 5s (`useServerOrders`) so the customer sees status updates and cancel reasons set by the kitchen.

**Storage backend switch (`lib/orders-db.ts`).** Chooses at import time: Supabase REST (via plain `fetch`, no SDK; table `orders`, snake_case columns mapped in `toOrder`) when both env vars are set, otherwise a JSON file `data/orders.json` (writes serialized through a promise queue, atomic tmp+rename). Both stores implement the same `list/add/update/statuses` interface; always go through the exported `listOrders/addOrder/updateStatus/getStatuses`. Statuses: `ordered → confirmed → preparing → delivering → completed`, plus `cancelled`; `completed`/`cancelled` are final and `updateStatus` returns `{error: "locked"}` for them. The file store won't work on read-only/serverless hosts (hence Supabase for Vercel).

**API (`app/api/orders/**`).** `POST /api/orders` is public (server recomputes `total` from items and sanitizes input). `GET`, and the status-update routes, require header `x-admin-pin` matching `ADMIN_PIN`. The admin pages (`app/admin`, `app/admin/thong-ke`) keep the PIN in localStorage via `lib/admin-pin.ts` and send it on each request.

**Dine-in vs delivery rule.** Scanning a table QR (`/menu?table=5`, see `app/qr`) stores the table in localStorage for 4h (`lib/table.ts`; `table=none` means online/delivery QR). `lib/require-login.ts` (`useRequireLogin`) lets table diners order without login but forces login/register for delivery. `?next=` redirects must go through `safeNext`.

**Content & i18n.** Menu data is static in `lib/foods.ts` (images in `public/foods/`); translations in `lib/i18n.ts` with language list in `lib/languages.ts`; `hooks/use-speech.ts` provides speech features. Statistics/export helpers: `lib/order-stats.ts`, `lib/xlsx-lite.ts`.
