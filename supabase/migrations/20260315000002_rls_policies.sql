-- FP Network Phase 2: Row Level Security policies
-- Public: published content only
-- Journalists: manage own drafts / own posts
-- Editors+: manage editorial content
-- Admins: full control

-- ---------------------------------------------------------------------------
-- Enable RLS
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.tags enable row level security;
alter table public.posts enable row level security;
alter table public.post_tags enable row level security;
alter table public.events enable row level security;
alter table public.email_templates enable row level security;
alter table public.site_settings enable row level security;
alter table public.post_views enable row level security;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
drop policy if exists "profiles_select_own_or_staff" on public.profiles;
create policy "profiles_select_own_or_staff"
  on public.profiles for select
  to authenticated
  using (id = auth.uid() or public.is_staff());

drop policy if exists "profiles_select_public_authors" on public.profiles;
create policy "profiles_select_public_authors"
  on public.profiles for select
  to anon, authenticated
  using (
    role in (
      'superadmin'::public.user_role,
      'admin'::public.user_role,
      'editor'::public.user_role,
      'journalist'::public.user_role
    )
  );

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (
    id = auth.uid()
    and role = (select p.role from public.profiles p where p.id = auth.uid())
  );

drop policy if exists "profiles_admin_all" on public.profiles;
create policy "profiles_admin_all"
  on public.profiles for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- categories (public read; editors+ write)
-- ---------------------------------------------------------------------------
drop policy if exists "categories_public_read" on public.categories;
create policy "categories_public_read"
  on public.categories for select
  to anon, authenticated
  using (true);

drop policy if exists "categories_editor_write" on public.categories;
create policy "categories_editor_write"
  on public.categories for all
  to authenticated
  using (public.is_editor_or_above())
  with check (public.is_editor_or_above());

-- ---------------------------------------------------------------------------
-- tags
-- ---------------------------------------------------------------------------
drop policy if exists "tags_public_read" on public.tags;
create policy "tags_public_read"
  on public.tags for select
  to anon, authenticated
  using (true);

drop policy if exists "tags_editor_write" on public.tags;
create policy "tags_editor_write"
  on public.tags for all
  to authenticated
  using (public.is_editor_or_above())
  with check (public.is_editor_or_above());

-- ---------------------------------------------------------------------------
-- posts
-- ---------------------------------------------------------------------------
drop policy if exists "posts_public_read_published" on public.posts;
create policy "posts_public_read_published"
  on public.posts for select
  to anon, authenticated
  using (
    status = 'published'::public.post_status
    or (
      auth.uid() is not null
      and (
        author_id = auth.uid()
        or public.is_editor_or_above()
        or public.is_admin()
      )
    )
  );

drop policy if exists "posts_journalist_insert_own" on public.posts;
create policy "posts_journalist_insert_own"
  on public.posts for insert
  to authenticated
  with check (
    author_id = auth.uid()
    and public.is_staff()
    and (
      public.is_editor_or_above()
      or status in (
        'draft'::public.post_status,
        'pending_review'::public.post_status
      )
    )
  );

drop policy if exists "posts_journalist_update_own" on public.posts;
create policy "posts_journalist_update_own"
  on public.posts for update
  to authenticated
  using (
    author_id = auth.uid()
    and public.current_user_role() = 'journalist'::public.user_role
  )
  with check (
    author_id = auth.uid()
    and status in (
      'draft'::public.post_status,
      'pending_review'::public.post_status,
      'trash'::public.post_status
    )
  );

drop policy if exists "posts_editor_all" on public.posts;
create policy "posts_editor_all"
  on public.posts for all
  to authenticated
  using (public.is_editor_or_above())
  with check (public.is_editor_or_above());

-- ---------------------------------------------------------------------------
-- post_tags
-- ---------------------------------------------------------------------------
drop policy if exists "post_tags_public_read_published" on public.post_tags;
create policy "post_tags_public_read_published"
  on public.post_tags for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.posts p
      where p.id = post_id
        and (
          p.status = 'published'::public.post_status
          or p.author_id = auth.uid()
          or public.is_editor_or_above()
        )
    )
  );

drop policy if exists "post_tags_staff_write" on public.post_tags;
create policy "post_tags_staff_write"
  on public.post_tags for all
  to authenticated
  using (
    public.is_editor_or_above()
    or exists (
      select 1 from public.posts p
      where p.id = post_id and p.author_id = auth.uid()
    )
  )
  with check (
    public.is_editor_or_above()
    or exists (
      select 1 from public.posts p
      where p.id = post_id and p.author_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- events
-- ---------------------------------------------------------------------------
drop policy if exists "events_public_read" on public.events;
create policy "events_public_read"
  on public.events for select
  to anon, authenticated
  using (true);

drop policy if exists "events_editor_write" on public.events;
create policy "events_editor_write"
  on public.events for all
  to authenticated
  using (public.is_editor_or_above())
  with check (public.is_editor_or_above());

-- ---------------------------------------------------------------------------
-- email_templates (staff read; admin write)
-- ---------------------------------------------------------------------------
drop policy if exists "email_templates_staff_read" on public.email_templates;
create policy "email_templates_staff_read"
  on public.email_templates for select
  to authenticated
  using (public.is_staff());

drop policy if exists "email_templates_admin_write" on public.email_templates;
create policy "email_templates_admin_write"
  on public.email_templates for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- site_settings (public read selected keys; admin write)
-- ---------------------------------------------------------------------------
drop policy if exists "site_settings_public_read" on public.site_settings;
create policy "site_settings_public_read"
  on public.site_settings for select
  to anon, authenticated
  using (
    key in ('site_name', 'site_short_name', 'site_url', 'site_tagline', 'social_links')
    or public.is_staff()
  );

drop policy if exists "site_settings_admin_write" on public.site_settings;
create policy "site_settings_admin_write"
  on public.site_settings for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- post_views (anyone can insert anonymized views; staff read)
-- ---------------------------------------------------------------------------
drop policy if exists "post_views_insert_public" on public.post_views;
create policy "post_views_insert_public"
  on public.post_views for insert
  to anon, authenticated
  with check (
    exists (
      select 1 from public.posts p
      where p.id = post_id
        and p.status = 'published'::public.post_status
    )
  );

drop policy if exists "post_views_staff_read" on public.post_views;
create policy "post_views_staff_read"
  on public.post_views for select
  to authenticated
  using (public.is_staff());

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------
grant select on public.categories, public.tags, public.events to anon, authenticated;
grant select on public.posts, public.post_tags, public.profiles to anon, authenticated;
grant select on public.site_settings to anon, authenticated;
grant insert on public.post_views to anon, authenticated;

grant select, insert, update, delete on all tables in schema public to authenticated;
grant all on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to authenticated, service_role;
