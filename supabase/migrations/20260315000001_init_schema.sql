-- FP Network Phase 2: core enums, tables, indexes, and helpers
-- Safe to re-run partially: uses IF NOT EXISTS / OR REPLACE where practical.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
do $$ begin
  create type public.user_role as enum (
    'superadmin',
    'admin',
    'editor',
    'journalist',
    'subscriber',
    'guest'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.post_status as enum (
    'draft',
    'pending_review',
    'scheduled',
    'published',
    'archived',
    'trash'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.event_format as enum (
    'video',
    'text'
  );
exception when duplicate_object then null;
end $$;

-- ---------------------------------------------------------------------------
-- updated_at helper
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  first_name text,
  last_name text,
  full_name text,
  role public.user_role not null default 'subscriber',
  avatar_url text,
  bio text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists profiles_role_idx on public.profiles (role);
create index if not exists profiles_email_idx on public.profiles (email);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, first_name, last_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'subscriber')
  )
  on conflict (id) do update set
    email = excluded.email,
    updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- categories
-- ---------------------------------------------------------------------------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists categories_sort_order_idx on public.categories (sort_order);

drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- tags
-- ---------------------------------------------------------------------------
create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default timezone('utc', now())
);

-- ---------------------------------------------------------------------------
-- posts
-- ---------------------------------------------------------------------------
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  body text,
  status public.post_status not null default 'draft',
  category_id uuid references public.categories (id) on delete set null,
  author_id uuid references public.profiles (id) on delete set null,
  featured_image_url text,
  is_featured boolean not null default false,
  is_premium boolean not null default false,
  is_video boolean not null default false,
  is_podcast boolean not null default false,
  reading_time_minutes integer not null default 5,
  view_count integer not null default 0,
  published_at timestamptz,
  scheduled_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint posts_reading_time_positive check (reading_time_minutes >= 0),
  constraint posts_view_count_nonneg check (view_count >= 0)
);

create index if not exists posts_status_published_at_idx
  on public.posts (status, published_at desc);
create index if not exists posts_category_id_idx on public.posts (category_id);
create index if not exists posts_author_id_idx on public.posts (author_id);
create index if not exists posts_is_featured_idx on public.posts (is_featured)
  where is_featured = true;
create index if not exists posts_is_premium_idx on public.posts (is_premium)
  where is_premium = true;
create index if not exists posts_is_video_idx on public.posts (is_video)
  where is_video = true;
create index if not exists posts_is_podcast_idx on public.posts (is_podcast)
  where is_podcast = true;

drop trigger if exists posts_set_updated_at on public.posts;
create trigger posts_set_updated_at
  before update on public.posts
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- post_tags
-- ---------------------------------------------------------------------------
create table if not exists public.post_tags (
  post_id uuid not null references public.posts (id) on delete cascade,
  tag_id uuid not null references public.tags (id) on delete cascade,
  primary key (post_id, tag_id)
);

create index if not exists post_tags_tag_id_idx on public.post_tags (tag_id);

-- ---------------------------------------------------------------------------
-- events (CPT)
-- ---------------------------------------------------------------------------
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  format public.event_format not null default 'video',
  video_url text,
  body text,
  host_name text,
  starts_at timestamptz,
  ends_at timestamptz,
  is_live boolean not null default false,
  show_on_home boolean not null default false,
  thumbnail_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists events_show_on_home_idx on public.events (show_on_home, starts_at desc)
  where show_on_home = true;
create index if not exists events_is_live_idx on public.events (is_live)
  where is_live = true;

drop trigger if exists events_set_updated_at on public.events;
create trigger events_set_updated_at
  before update on public.events
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- email_templates
-- ---------------------------------------------------------------------------
create table if not exists public.email_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  subject text not null,
  body_html text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists email_templates_set_updated_at on public.email_templates;
create trigger email_templates_set_updated_at
  before update on public.email_templates
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- site_settings (key / jsonb value)
-- ---------------------------------------------------------------------------
create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists site_settings_set_updated_at on public.site_settings;
create trigger site_settings_set_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- post_views
-- ---------------------------------------------------------------------------
create table if not exists public.post_views (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  viewer_id uuid references public.profiles (id) on delete set null,
  viewer_ip text,
  user_agent text,
  viewed_at timestamptz not null default timezone('utc', now())
);

create index if not exists post_views_post_id_viewed_at_idx
  on public.post_views (post_id, viewed_at desc);
create index if not exists post_views_viewer_id_idx on public.post_views (viewer_id);

-- ---------------------------------------------------------------------------
-- Role helpers (used by RLS)
-- ---------------------------------------------------------------------------
create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role from public.profiles where id = auth.uid()),
    'guest'::public.user_role
  );
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_role() in (
    'superadmin'::public.user_role,
    'admin'::public.user_role,
    'editor'::public.user_role,
    'journalist'::public.user_role
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_role() in (
    'superadmin'::public.user_role,
    'admin'::public.user_role
  );
$$;

create or replace function public.is_editor_or_above()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_role() in (
    'superadmin'::public.user_role,
    'admin'::public.user_role,
    'editor'::public.user_role
  );
$$;

grant usage on schema public to anon, authenticated, service_role;
grant execute on function public.current_user_role() to anon, authenticated, service_role;
grant execute on function public.is_staff() to anon, authenticated, service_role;
grant execute on function public.is_admin() to anon, authenticated, service_role;
grant execute on function public.is_editor_or_above() to anon, authenticated, service_role;
