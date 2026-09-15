# Flash Point Network (FP Network)

Digital newspaper: public SEO portal + Modernize admin CMS on Next.js + Supabase.

## Stack

- Next.js App Router (TypeScript) + Tailwind
- Supabase (Auth, Postgres, Storage, RLS)
- Sharp, Tiptap, Resend/Nodemailer, Plyr
- Admin UI adapted from [Modernize Nextjs Free](https://github.com/adminmart/Modernize-Nextjs-Free)

## Getting started

```bash
npm install
cp .env.example .env.local
npm run dev
```

Dev server: **http://127.0.0.1:43125**

## Key routes

| Path | Description |
|------|-------------|
| `/` | Public home |
| `/news/[slug]` | Article (paywall + SEO + share) |
| `/events/[slug]` | Event detail |
| `/classic-programs` | Classic TV grid (sort mode from settings) |
| `/classic-programs/[slug]` | Classic program detail |
| `/ministry-programs` | Ministry / gospel grid |
| `/ministry-programs/[slug]` | Ministry program detail |
| `/login` `/register` `/forgot-password` | Auth flows |
| `/admin` | Staff CMS (RBAC: superadmin/admin/editor/journalist) |
| `/admin/classic-programs` | Classic Programs CRUD + grid sort |
| `/admin/ministry-programs` | Ministry Programs CRUD + grid sort |
| `/ads.txt` | Dynamic ads.txt from Settings |
| `/api/health` | Health check |
| `/api/revalidate` | On-demand path revalidation |

## Staff users

Create/update verified staff accounts (service role):

```bash
node scripts/ensure-staff-users.mjs
```

Passwords via `STAFF_USER_*_PASSWORD` env vars (never commit them).

## Supabase

```bash
npm run db:apply
```

Requires `SUPABASE_SERVICE_ROLE_KEY` + DB password or access token (see `scripts/apply-supabase.mjs`).

## Classic Programs seed

Scrape public HTML from fptn.com and upsert into Supabase:

```bash
npm run seed:classic-programs
npm run seed:ministry-programs
```

Snapshots: `scripts/data/classic-programs-seed.json`, `scripts/data/ministry-programs-seed.json`. Images stay as remote GoDaddy CDN URLs.
