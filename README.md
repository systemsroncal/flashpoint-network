# Flash Point Network (FP Network)

Digital newspaper: public SEO portal + Flash Point Network admin CMS on Next.js + Supabase.

## Stack

- Next.js App Router (TypeScript) + Tailwind
- Supabase (Auth, Postgres, RLS; legacy Storage URLs still load)
- Sharp → local `public/uploads/` for new admin images; Tiptap, Resend/Nodemailer, Plyr
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
| `/network-programs` | Network / gospel grid |
| `/network-programs/[slug]` | Network program detail |
| `/schedule-programs` | Broadcast schedule (day grid + optional PDF) |
| `/login` `/register` `/forgot-password` | Auth flows |
| `/admin` | Staff CMS (RBAC: superadmin/admin/editor/journalist) |
| `/admin/classic-programs` | Classic Programs CRUD + grid sort |
| `/admin/network-programs` | Network Programs CRUD + grid sort |
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

**Migrations run on your local machine only** — not on the VPS. Supabase is cloud-hosted; `db:apply` talks to the project API/DB from `.env.local`. The server only needs app env vars for the Next.js runtime.

```bash
npm run db:apply
# optional after ministry seed changes:
npm run db:sync-ministry-figma
```

Requires `SUPABASE_SERVICE_ROLE_KEY` + DB password or access token (see `scripts/apply-supabase.mjs`).

Typical release order:

1. Local: `npm run db:apply` (and any seed scripts) when `supabase/migrations/` changed.
2. Local: commit, `git push origin main`.
3. VPS: `bash scripts/deploy-from-github.sh` (pull, build, pm2 — **no** `db:apply`).

## Classic Programs seed

Scrape public HTML from fptn.com and upsert into Supabase:

```bash
npm run seed:classic-programs
npm run seed:ministry-programs
npm run seed:schedule-programs
```

Snapshots under `scripts/data/`. Program posters live in the repo at `public/media/programs/` (full Storage dump under `public/media/`) so a new host does not depend on fptn.com or a cold bucket.

```bash
npm run seed:program-images   # remote posters → Supabase Storage (legacy; prefer local)
npm run vendor:media          # Storage bucket → public/media (commit the files)
```

Classic/Network pages rewrite Storage URLs to `/media/...`. Schedule seeds dated entries for September 2026 and copies the PDF to `public/schedules/`.

## Admin image uploads (local disk)

New admin uploads go through **`POST /api/admin/media/upload`** (Route Handler — not a Server Action), run Sharp → WebP (max width **1920px**), and write to **`public/uploads/YYYY-MM-DD/<uuid>.webp`**.

Public URLs are **`/uploads/...`**. Next rewrites those to **`/api/media/...`**, which reads the same folder from disk — this avoids OpenLiteSpeed/CyberPanel static docroots returning 404 before the request reaches Node. Relative `/uploads` still works same-origin; rich HTML / OG / JSON-LD concatenate `SITE_URL` so `src` is absolute when needed.

- Max size **10MB**. Server Actions also allow up to **11MB** (`experimental.serverActions.bodySizeLimit`) for other form posts.
- Binaries are gitignored; keep `public/uploads/.gitkeep`.
- On the VPS the folder persists across deploys — `scripts/deploy-from-github.sh` excludes `public/uploads` from `git clean`.
- Optional: set `UPLOADS_DIR=/absolute/path/to/public/uploads` in PM2/env if `process.cwd()` is wrong.
- Older posts that already store full Supabase Storage URLs continue to work unchanged.
- If PM2 has `SITE_URL=https://fptn.com, https://fptn.com`, scrub it to a single origin (`https://fptn.com`) so Next stops throwing `ERR_INVALID_URL`.

### VPS verify after upload

```bash
cd /home/fptn.com/app/flashpoint-network
ls -la public/uploads/$(date -u +%F)/
curl -sI "https://fptn.com/uploads/YYYY-MM-DD/<uuid>.webp" | head -20
# Expect HTTP/2 200 and content-type: image/webp
```

## Deploy / VPS (pm2)

**Important:** The VPS must deploy from **Git**, not from copying individual files in Cursor Projects or SFTP. If you upload only the latest file (change 13) without pushing changes 10–12 to GitHub, the server will never see them. Always:

1. Local: `npm run db:apply` if there are new SQL migrations (never on the VPS).
2. Commit **all** local changes on your machine.
3. `git push origin main`
4. On the VPS: `bash scripts/deploy-from-github.sh` (pulls the full branch, then `npm ci`, build, pm2).

From Windows (PowerShell, repo root):

```powershell
.\scripts\publish-full.ps1 -Message "Your commit message"
# optional automatic SSH deploy:
.\scripts\publish-full.ps1 -VpsHost "root@your-vps-ip"
```

The canonical server script is `scripts/deploy-from-github.sh` (env files and `public/uploads` are preserved across deploys).

After every rebuild, **hard-refresh** open admin tabs (Ctrl/Cmd+Shift+R). Stale clients call old Server Action IDs and fail with `Failed to find Server Action "…"`. The News editor shows a reload toast when that happens.

```bash
cd /path/to/flashpoint-network
bash scripts/deploy-from-github.sh
```

`MaxListenersExceededWarning` on Gzip after restarts is usually from leftover Node streams; `pm2 flush` + a clean restart clears it. It is unrelated to News placements.
