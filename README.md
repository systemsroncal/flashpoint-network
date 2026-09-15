# FP Network (Flash Point Network)

Digital newspaper platform: public SEO portal + editorial admin CMS.

## Stack

- Next.js App Router (TypeScript) + Tailwind
- Supabase clients (mocked until credentials are provided)
- Sharp, Tiptap, Resend/Nodemailer (installed; wired in later phases)
- Admin UI adapted from [Modernize Nextjs Free](https://github.com/adminmart/Modernize-Nextjs-Free) under `/admin`

## Getting started

```bash
npm install
cp .env.example .env.local   # optional — app runs without real secrets
npm run dev
```

Dev server defaults to **http://127.0.0.1:43125**.

## Routes (Phase 1)

| Path | Description |
|------|-------------|
| `/` | Public portal stub |
| `/admin` | Admin dashboard shell (Modernize) |
| `/api/health` | Health stub |

## Project layout

```
app/
  (public)/          # Public layout + home stub
  (admin)/admin/     # Admin routes
  api/               # Route handlers
components/
  public/            # Public UI
  admin/             # Modernize-adapted admin shell
lib/
  supabase/          # Browser/server clients (safe without secrets)
  email.ts           # Resend/mock sender stub
  env.ts             # Env helpers + fallbacks
```

## Supabase (Phase 2)

Versioned SQL lives under `supabase/migrations/` + `supabase/seed.sql`.

```bash
# Requires DATABASE_URL or SUPABASE_DB_PASSWORD or SUPABASE_ACCESS_TOKEN
# plus SUPABASE_SERVICE_ROLE_KEY + NEXT_PUBLIC_SUPABASE_URL
npm run db:apply
```

## Phase status

Phase 1: scaffold, deps, modular folders, admin shell.
Phase 2: schema, RLS, and home-mockup seed (see `supabase/`).
