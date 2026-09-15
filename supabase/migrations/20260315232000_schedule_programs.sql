-- Schedule Programs: timed entries + monthly PDF + display mode

do $$ begin
  create type public.schedule_display_mode as enum (
    'dynamic',
    'pdf',
    'both'
  );
exception when duplicate_object then null;
end $$;

create table if not exists public.schedule_entries (
  id uuid primary key default gen_random_uuid(),
  air_date date not null,
  start_time time not null,
  end_time time,
  title text not null,
  description text,
  category text,
  color text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists schedule_entries_air_date_idx
  on public.schedule_entries (air_date, start_time);
create index if not exists schedule_entries_title_idx
  on public.schedule_entries (title);

drop trigger if exists schedule_entries_set_updated_at on public.schedule_entries;
create trigger schedule_entries_set_updated_at
  before update on public.schedule_entries
  for each row execute function public.set_updated_at();

alter table public.schedule_entries enable row level security;

drop policy if exists "schedule_entries_public_read" on public.schedule_entries;
create policy "schedule_entries_public_read"
  on public.schedule_entries for select
  to anon, authenticated
  using (true);

drop policy if exists "schedule_entries_staff_write" on public.schedule_entries;
create policy "schedule_entries_staff_write"
  on public.schedule_entries for all
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

grant select on public.schedule_entries to anon, authenticated;
grant all on public.schedule_entries to service_role;

create table if not exists public.schedule_pdfs (
  id uuid primary key default gen_random_uuid(),
  year integer not null,
  month integer not null check (month between 1 and 12),
  title text not null,
  pdf_url text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (year, month)
);

drop trigger if exists schedule_pdfs_set_updated_at on public.schedule_pdfs;
create trigger schedule_pdfs_set_updated_at
  before update on public.schedule_pdfs
  for each row execute function public.set_updated_at();

alter table public.schedule_pdfs enable row level security;

drop policy if exists "schedule_pdfs_public_read" on public.schedule_pdfs;
create policy "schedule_pdfs_public_read"
  on public.schedule_pdfs for select
  to anon, authenticated
  using (true);

drop policy if exists "schedule_pdfs_staff_write" on public.schedule_pdfs;
create policy "schedule_pdfs_staff_write"
  on public.schedule_pdfs for all
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

grant select on public.schedule_pdfs to anon, authenticated;
grant all on public.schedule_pdfs to service_role;

insert into public.site_settings (key, value) values
  ('schedule_display_mode', '"dynamic"'::jsonb)
on conflict (key) do nothing;

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
      'classic_programs_sort',
      'ministry_programs_sort',
      'schedule_display_mode'
    )
    or public.is_staff()
  );
