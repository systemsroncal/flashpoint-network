-- Per-route SEO overrides for public static pages (admin → Pages).

create table if not exists public.public_page_seo (
  page_key text primary key,
  path text not null unique,
  seo_title text,
  seo_description text,
  seo_keywords text,
  og_title text,
  og_description text,
  og_image_url text,
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists public_page_seo_path_idx on public.public_page_seo (path);

alter table public.public_page_seo enable row level security;

drop policy if exists "public_page_seo_staff_all" on public.public_page_seo;
create policy "public_page_seo_staff_all"
  on public.public_page_seo for all
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

grant select, insert, update, delete on table public.public_page_seo to service_role;
