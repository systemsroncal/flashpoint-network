-- Ministry Programs CPT + public sort setting

do $$ begin
  create type public.ministry_program_status as enum (
    'draft',
    'published',
    'archived'
  );
exception when duplicate_object then null;
end $$;

create table if not exists public.ministry_programs (
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
  status public.ministry_program_status not null default 'published',
  source_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists ministry_programs_status_sort_idx
  on public.ministry_programs (status, sort_order);
create index if not exists ministry_programs_title_idx
  on public.ministry_programs (title);

drop trigger if exists ministry_programs_set_updated_at on public.ministry_programs;
create trigger ministry_programs_set_updated_at
  before update on public.ministry_programs
  for each row execute function public.set_updated_at();

alter table public.ministry_programs enable row level security;

drop policy if exists "ministry_programs_public_read" on public.ministry_programs;
create policy "ministry_programs_public_read"
  on public.ministry_programs for select
  to anon, authenticated
  using (status = 'published'::public.ministry_program_status or public.is_staff());

drop policy if exists "ministry_programs_staff_write" on public.ministry_programs;
create policy "ministry_programs_staff_write"
  on public.ministry_programs for all
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

grant select on public.ministry_programs to anon, authenticated;
grant all on public.ministry_programs to service_role;

insert into public.site_settings (key, value) values
  ('ministry_programs_sort', '"manual"'::jsonb)
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
      'ministry_programs_sort'
    )
    or public.is_staff()
  );
