-- Classic Programs CPT + public sort setting

do $$ begin
  create type public.classic_program_status as enum (
    'draft',
    'published',
    'archived'
  );
exception when duplicate_object then null;
end $$;

create table if not exists public.classic_programs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  description text,
  body text,
  featured_image_url text,
  external_url text,
  schedule_note text,
  sort_order integer not null default 0,
  status public.classic_program_status not null default 'published',
  source_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists classic_programs_status_sort_idx
  on public.classic_programs (status, sort_order);
create index if not exists classic_programs_title_idx
  on public.classic_programs (title);

drop trigger if exists classic_programs_set_updated_at on public.classic_programs;
create trigger classic_programs_set_updated_at
  before update on public.classic_programs
  for each row execute function public.set_updated_at();

alter table public.classic_programs enable row level security;

drop policy if exists "classic_programs_public_read" on public.classic_programs;
create policy "classic_programs_public_read"
  on public.classic_programs for select
  to anon, authenticated
  using (status = 'published'::public.classic_program_status or public.is_staff());

drop policy if exists "classic_programs_staff_write" on public.classic_programs;
create policy "classic_programs_staff_write"
  on public.classic_programs for all
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

grant select on public.classic_programs to anon, authenticated;
grant all on public.classic_programs to service_role;

-- Public sort mode for the /classic-programs grid
insert into public.site_settings (key, value) values
  ('classic_programs_sort', '"manual"'::jsonb)
on conflict (key) do nothing;

-- Allow anon read of the sort setting
drop policy if exists "site_settings_public_read" on public.site_settings;
create policy "site_settings_public_read"
  on public.site_settings for select
  to anon, authenticated
  using (
    key in (
      'site_name',
      'site_short_name',
      'site_url',
      'site_tagline',
      'social_links',
      'maintenance',
      'ads_txt',
      'adsense',
      'paywall',
      'classic_programs_sort'
    )
    or public.is_staff()
  );
