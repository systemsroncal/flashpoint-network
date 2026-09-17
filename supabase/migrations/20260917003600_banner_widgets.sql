-- CMS banner widgets: fixed placement slots with desktop/mobile creatives.
create table if not exists public.banner_widgets (
  id uuid primary key default gen_random_uuid(),
  slot text not null unique,
  label text not null,
  desktop_image_url text,
  mobile_image_url text,
  href text not null default '',
  open_in_new_tab boolean not null default true,
  enabled boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint banner_widgets_has_image check (
    nullif(trim(desktop_image_url), '') is not null
    or nullif(trim(mobile_image_url), '') is not null
  )
);

comment on table public.banner_widgets is
  'Admin-managed promo banners per placement slot (desktop ≥768 + mobile ≤767).';

drop trigger if exists banner_widgets_set_updated_at on public.banner_widgets;
create trigger banner_widgets_set_updated_at
  before update on public.banner_widgets
  for each row execute function public.set_updated_at();

alter table public.banner_widgets enable row level security;

drop policy if exists "banner_widgets_public_read" on public.banner_widgets;
create policy "banner_widgets_public_read"
  on public.banner_widgets for select
  to anon, authenticated
  using (enabled = true);

drop policy if exists "banner_widgets_staff_all" on public.banner_widgets;
create policy "banner_widgets_staff_all"
  on public.banner_widgets for all
  to authenticated
  using (public.is_editor_or_above())
  with check (public.is_editor_or_above());

grant select on public.banner_widgets to anon, authenticated;

-- Seed current hard-coded creatives (upsert by slot).
insert into public.banner_widgets (
  slot, label, desktop_image_url, mobile_image_url, href, open_in_new_tab, enabled, sort_order
) values
  (
    'home_above_podcasts',
    'Home — above Podcasts (OFC)',
    '/brand/ads/optimal-family-care-banner.webp',
    '/brand/ads/optimal-family-care-banner.webp',
    'https://optimalfc.com/',
    true,
    true,
    10
  ),
  (
    'home_above_latest',
    'Home — above Popular (Revival)',
    '/brand/ads/flashpoint-revival-promo.webp',
    '/brand/ads/flashpoint-revival-promo.webp',
    'https://www.amazon.com/Flashpoint-Revival-Awakening-Transformation-Nation/dp/1680318357',
    true,
    true,
    20
  ),
  (
    'home_patriot_banner',
    'Home — Are You a Patriot (full-width)',
    '/brand/banners/fpn-patriot-people.webp',
    '/brand/banners/fpn-patriot-banner-mobile.webp',
    'https://app.fparmychapters.com/register',
    true,
    true,
    30
  ),
  (
    'category_above_popular',
    'Category — above Popular (Revival)',
    '/brand/ads/flashpoint-revival-promo.webp',
    '/brand/ads/flashpoint-revival-promo.webp',
    'https://www.amazon.com/Flashpoint-Revival-Awakening-Transformation-Nation/dp/1680318357',
    true,
    true,
    40
  ),
  (
    'article_above_latest_patriot',
    'Article — above Latest News (Patriot)',
    '/brand/ads/patriot-sidebar-square.webp',
    '/brand/ads/patriot-sidebar-square.webp',
    'https://app.fparmychapters.com/register',
    true,
    true,
    50
  ),
  (
    'article_above_latest_ofc',
    'Article — above Latest News (OFC)',
    '/brand/ads/optimal-family-care-banner.webp',
    '/brand/ads/optimal-family-care-banner.webp',
    'https://optimalfc.com/',
    true,
    true,
    60
  )
on conflict (slot) do nothing;
