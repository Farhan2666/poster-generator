# Poster Generator — Agent Guide

## Project Overview
NextJS 14 + TypeScript app untuk AI-powered TikTok content generator bagi produk poster aesthetic. Build dengan pnpm, dev di port 3000.

## Dev Commands
- `pnpm dev` — start dev server
- `pnpm build` — full build (Turbopack + TypeScript check)
- `pnpm lint` — ESLint

## Architecture
- `/config/ai.config.json` — task→provider mapping (hot-reloadable at runtime)
- `/src/lib/ai/` — AI Provider Abstraction Layer (types, registry, router, config)
- `/src/services/` — Business logic services (ai.service, render.service, product.service, image-processing.service)
- `/src/app/api/` — API routes (13 endpoints)
- `/src/app/(dashboard)/` — Pages (9 pages)

## Key Patterns
- All CRUD works WITHOUT Supabase via `tmp/products.json` fallback
- AI keys can be set via Settings page (localStorage) OR `.env.local`
- `/api/upload` saves to `public/uploads/` and returns persistent URLs
- Image processing saves to `public/processed/{productId}/`
- No emojis in the codebase — use CSS + text alternatives
- UI: dark + glassmorphism (no light mode)
- Background: animated gradient cycling 8 color themes every 8s

## Important Gotchas
- `next.config.ts` imports `config.ts` which uses `fs` — causes Turbopack NFT warning (cosmetic, non-blocking)
- TypeScript: Node v24 requires `new Uint8Array(buffer)` instead of `Buffer` for `Blob()` constructor
- 1 build warning expected (Turbopack NFT tracing) — do not treat as error
