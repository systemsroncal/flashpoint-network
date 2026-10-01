-- Threaded replies and heart likes on post comments; expose commenter display names.

alter table public.post_comments
  add column if not exists parent_id uuid references public.post_comments (id) on delete cascade;

create index if not exists post_comments_parent_id_idx
  on public.post_comments (parent_id)
  where parent_id is not null;

create table if not exists public.post_comment_likes (
  comment_id uuid not null references public.post_comments (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (comment_id, user_id)
);

create index if not exists post_comment_likes_comment_id_idx
  on public.post_comment_likes (comment_id);

alter table public.post_comment_likes enable row level security;

drop policy if exists "post_comment_likes_public_read" on public.post_comment_likes;
create policy "post_comment_likes_public_read"
  on public.post_comment_likes for select
  to anon, authenticated
  using (true);

drop policy if exists "post_comment_likes_insert_own" on public.post_comment_likes;
create policy "post_comment_likes_insert_own"
  on public.post_comment_likes for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "post_comment_likes_delete_own" on public.post_comment_likes;
create policy "post_comment_likes_delete_own"
  on public.post_comment_likes for delete
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "post_comment_likes_staff_all" on public.post_comment_likes;
create policy "post_comment_likes_staff_all"
  on public.post_comment_likes for all
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

drop policy if exists "profiles_select_comment_authors" on public.profiles;
create policy "profiles_select_comment_authors"
  on public.profiles for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.post_comments pc
      where pc.user_id = profiles.id
        and pc.status = 'visible'
    )
  );

drop policy if exists "post_comments_insert_own" on public.post_comments;
create policy "post_comments_insert_own"
  on public.post_comments for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and char_length(trim(body)) > 0
    and char_length(body) <= 4000
    and (
      parent_id is null
      or exists (
        select 1
        from public.post_comments parent
        where parent.id = parent_id
          and parent.post_id = post_comments.post_id
          and parent.status = 'visible'
      )
    )
  );

grant select on public.post_comment_likes to anon, authenticated;
