# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project context

FoodLingo is a multilingual food-ordering web app, built as a university Software Engineering project ("Hệ thống đặt món ăn đa ngôn ngữ"). The full requirements spec (Vietnamese) is in the parent directory: `../Đề tài HỆ THỐNG ĐẶT MÓN ĂN ĐA NGÔN NGỮ.txt`. It covers customer features (register/login, browse/search/filter, food detail with text-to-speech narration, cart, checkout, order tracking/history) and admin features that are **not built yet** (managing dishes, categories, translations, orders, customers, narration content, statistics). The spec plans for a real backend (Node/Express) with MySQL/SQL Server and a React Native mobile client. None of these exist yet.

The git repo root is the parent directory (`..`). This Next.js app lives in `project/`. Code comments are mostly in Vietnamese.

## Commands

Run these from `project/`:

```bash
npm run dev     # next dev (allowedDevOrigins includes 192.168.1.2 for LAN/mobile testing)
npm run build   # next build
npm run start   # serve the production build
```

Both `package-lock.json` and `pnpm-lock.yaml` exist. `packageManager` is set to pnpm. There is no linter, no test framework and no test script. `next.config.mjs` sets `typescript.ignoreBuildErrors: true`, so the build does **not** type-check. Run `npx tsc --noEmit` to check types.

## Architecture

**Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4 (configured through `app/globals.css`; there is no tailwind config file), and shadcn/ui using the `base-nova` style on `@base-ui/react`, with components in `components/ui`. The path alias `@/*` maps to the project root.

**There is no backend.** All state lives on the client in `localStorage`:
- `lib/store.tsx`: `AppProvider` (mounted in `app/layout.tsx`) and the `useApp()` hook hold language, cart, orders and the current user. They persist under `foodlingo:*` keys. `hydrated` stays false until localStorage has been read, so pages should wait for it before redirecting a guest to `/login`. The `ORDERS_KEY` is versioned (`:v2`); bump it to discard old stored data.
- `lib/auth.ts`: demo accounts in `foodlingo:accounts`, with passwords stored as salted SHA-256. It includes pure-JS fallbacks for `crypto.randomUUID` and `crypto.subtle` because those APIs don't exist on plain-http LAN origins. When a real API arrives, the plan is to replace `registerAccount` and `authenticate` with API calls.
- `lib/foods.ts`: the static menu (`FOODS`). Each dish's name and description is stored inline per language in `t: Record<LangCode, FoodText>`. Images are in `public/foods/`.

Nearly every page is a client component (`"use client"`) that reads from `useApp()`. Shared navigation and layout come from `components/app-shell.tsx`, which provides the bottom/side nav, cart badge, language switcher and toaster.

**i18n:** `lib/languages.ts` defines 10 `LangCode`s (the default is `vi`; `ar` is RTL). It also sets the `speechLang` BCP-47 tag used for TTS. `lib/i18n.ts` holds the `Dict` interface and a `translations` record that needs every key in every language. `t()` handles `{var}` interpolation. To add a UI string, add it to `Dict` **and** to all 10 language objects. To add a dish, include all 10 languages in its `t`. The store sets `<html lang/dir>` whenever the language changes.

**Text-to-speech:** `hooks/use-speech.ts` (used by `app/food/[id]/page.tsx`) splits text into chunks of 150 characters or fewer. It uses a browser `speechSynthesis` voice only when one matches the language, preferring Microsoft Natural voices such as HoaiMy. Otherwise it plays audio from `app/api/tts/route.ts`, a server proxy to Google Translate TTS that takes 300 characters max per request and needs internet. If that fails, it falls back to the default synth voice. `app/api/tts` is the only server route.

Luôn trả lời bằng tiếng Việt, trừ khi mình yêu cầu khác. Tên biến, hàm và comment trong code vẫn giữ tiếng Anh.