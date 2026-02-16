# Project Rules

## Deployment
- After finishing any code changes, always commit, push to `main`, and deploy to Vercel production with `npx vercel --prod`.
- Vercel project: `trading-news` (alias: `trading-news-lemon.vercel.app`)

## Stack
- Next.js 16 (App Router, Turbopack)
- Prisma with PostgreSQL (Supabase)
- Tailwind CSS v4 (CSS-based config, `@tailwindcss/typography`)
- React 19, TypeScript

## Conventions
- WSJ-inspired design: cream `#FAF7F2`, navy `#0F4C81`, serif headings
- i18n via `src/lib/i18n.ts` (EN/ZH) — add keys for any new user-facing text
- Prisma client via lazy proxy in `src/lib/prisma.ts`
- Admin auth uses `ADMIN_PASSWORD` env var with HTTP-only session cookie
