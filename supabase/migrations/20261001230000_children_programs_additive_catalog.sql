-- Children programs module + additive catalog rows only (ON CONFLICT DO NOTHING).

do $$ begin
  create type public.children_program_status as enum (
    'draft',
    'published',
    'archived'
  );
exception when duplicate_object then null;
end $$;

create table if not exists public.children_programs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  description text,
  body text,
  featured_image_url text,
  external_url text,
  schedule_note text,
  genre text,
  genres_label text,
  schedule_line text,
  sort_order integer not null default 0,
  status public.children_program_status not null default 'published',
  source_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists children_programs_status_sort_idx
  on public.children_programs (status, sort_order);

alter table public.children_programs enable row level security;

drop policy if exists "children_programs_public_read" on public.children_programs;
create policy "children_programs_public_read"
  on public.children_programs for select
  to anon, authenticated
  using (status = 'published'::public.children_program_status or public.is_staff());

drop policy if exists "children_programs_staff_write" on public.children_programs;
create policy "children_programs_staff_write"
  on public.children_programs for all
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

grant select on public.children_programs to anon, authenticated;
grant all on public.children_programs to service_role;

insert into public.site_settings (key, value) values
  ('children_programs_sort', '"manual"'::jsonb)
on conflict (key) do nothing;

-- Additive classic programs (skip if slug already exists)
insert into public.classic_programs (
  title, slug, featured_image_url, genre, schedule_line, sort_order, status
) values
  ('Bonanza', 'bonanza', '/brand/catalog/classic/Bonanza.png', 'Series', 'Mon–Sat · 1:00 AM ET · 1:00 PM ET', 110, 'published'),
  ('Hawkeye and the Last of the Mohicans', 'hawkeye-and-the-last-of-the-mohicans', '/brand/catalog/classic/Hawkeye and the Last of the Mohicans.png', 'Series', 'Mon–Sat · 1:00 AM ET · 1:00 PM ET', 111, 'published'),
  ('The Annie Oakley Show', 'the-annie-oakley-show', '/brand/catalog/classic/The Annie Oakley Show.png', 'Series', 'Mon–Sat · 1:00 AM ET · 1:00 PM ET', 112, 'published'),
  ('The Adventures of Robin Hood', 'the-adventures-of-robin-hood', '/brand/catalog/classic/Robin Hood.png', 'Series', 'Mon–Sat · 1:00 AM ET · 1:00 PM ET', 113, 'published'),
  ('Stories of the Century', 'stories-of-the-century', '/brand/catalog/classic/Stories of the Century.png', 'Series', 'Mon–Sat · 1:00 AM ET · 1:00 PM ET', 114, 'published'),
  ('Public Defender', 'public-defender', '/brand/catalog/classic/Public Defender.png', 'Series', 'Mon–Sat · 1:00 AM ET · 1:00 PM ET', 115, 'published'),
  ('Trouble with Father', 'trouble-with-father', '/brand/catalog/classic/Trouble with Father.png', 'Series', 'Mon–Sat · 1:00 AM ET · 1:00 PM ET', 116, 'published')
on conflict (slug) do nothing;

-- Additive network / ministry programs
insert into public.ministry_programs (
  title, slug, featured_image_url, host_name, schedule_detail, sort_order, status
) values
  ('Faith on Film', 'faith-on-film', '/brand/catalog/network/Faith on Film.png', null, E'Monday · 8:00 PM ET\nTuesday · 9:00 AM CT', 200, 'published'),
  ('Grace Grace', 'grace-grace', '/brand/catalog/network/Grace Grace.png', null, E'Wednesday · 7:00 PM ET\nThursday · 10:00 AM CT', 201, 'published'),
  ('N.O.W. Not Over With', 'now-not-over-with', '/brand/catalog/network/N.O.W. Not Over With.png', null, E'Friday · 6:00 PM ET\nSaturday · 11:00 AM CT', 202, 'published'),
  ('Speak Life', 'speak-life', '/brand/catalog/network/Speak Life.png', null, E'Sunday · 5:00 PM ET\nMonday · 8:00 AM CT', 203, 'published'),
  ('VFI News from Israel', 'vfi-news-from-israel', '/brand/catalog/network/VFI News from Israel.png', null, E'Tuesday · 6:00 PM ET\nWednesday · 9:00 AM CT', 204, 'published')
on conflict (slug) do nothing;

-- Children programs catalog
insert into public.children_programs (
  title, slug, featured_image_url, genre, schedule_line, sort_order, status
) values
  ('Captain Z-RO', 'captain-z-ro', '/brand/catalog/children/Captain Z-RO .png', 'Classic', 'Weekly · Sat 9:00 AM ET', 10, 'published'),
  ('The Howdy Doody Show', 'the-howdy-doody-show', '/brand/catalog/children/The Howdy Doody Show.png', 'Classic', 'Weekly · Sat 10:00 AM ET', 11, 'published'),
  ('Dusty''s Neighborhood', 'dustys-neighborhood', '/brand/catalog/children/Dusty''s Neighborhood.png', 'Weekly', 'Weekly · Sun 9:00 AM ET', 12, 'published'),
  ('Lessons from the Bible', 'lessons-from-the-bible', '/brand/catalog/children/Lessons from the Bible.png', 'Weekly', 'Weekly · Sun 10:30 AM ET', 13, 'published'),
  ('Gospel Time Square', 'gospel-time-square', '/brand/catalog/children/Gospel Time Square.png', 'Weekly', 'Weekly · Sat 11:00 AM ET', 14, 'published'),
  ('Miss Charity''s Diner', 'miss-charitys-diner', '/brand/catalog/children/Miss. Charity''s Diner.png', 'Weekly', 'Weekly · Sat 12:00 PM ET', 15, 'published'),
  ('Faithville', 'faithville', '/brand/catalog/children/Faithville.png', 'Weekly', 'Weekly · Sun 11:00 AM ET', 16, 'published')
on conflict (slug) do nothing;
