# Flash Point Network (FP Network)

Digital newspaper: public SEO portal + Flash Point Network admin CMS on Next.js + Supabase.

## Stack

- Next.js App Router (TypeScript) + Tailwind
- Supabase (Auth, Postgres, Storage, RLS)
- Sharp, Tiptap, Resend/Nodemailer, Plyr
- Admin UI (MUI) branded with Flash Point Network orange (`--fpn-rojo` / `#FF490D`)

## Getting started

```bash
git clone https://github.com/systemsroncal/flashpoint-network.git
cd flashpoint-network
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
| `/schedule-programs` | Broadcast schedule (day grid + optional PDF) |
| `/login` `/register` `/forgot-password` | Auth flows |
| `/admin` | Staff CMS (RBAC: superadmin/admin/editor/journalist) |
| `/admin/classic-programs` | Classic Programs CRUD + grid sort |
| `/admin/ministry-programs` | Network Programs CRUD + grid sort |
| `/admin/schedule-programs` | Schedule entries + display mode + PDF |
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
npm run seed:schedule-programs
```

Snapshots under `scripts/data/`. Program posters live in the repo at `public/media/programs/` (full Storage dump under `public/media/`) so a new host does not depend on fptn.com or a cold bucket.

```bash
npm run seed:program-images   # remote posters → Supabase Storage (service role)
npm run vendor:media          # Storage bucket → public/media (commit the files)
```

Classic/Ministry pages rewrite Storage URLs to `/media/...`. Schedule seeds dated entries for September 2026 and copies the PDF to `public/schedules/`.

## Deploy / VPS (pm2)

After every rebuild, **hard-refresh** open admin tabs (Ctrl/Cmd+Shift+R). Stale clients call old Server Action IDs and fail with `Failed to find Server Action "…"`. The News editor shows a reload toast when that happens.

```bash
cd /path/to/flashpoint-network
git fetch origin && git checkout main && git pull
npm ci
npm run build
pm2 restart fptn && pm2 flush
```

`MaxListenersExceededWarning` on Gzip after restarts is usually from leftover Node streams; `pm2 flush` + a clean restart clears it. It is unrelated to News placements.
