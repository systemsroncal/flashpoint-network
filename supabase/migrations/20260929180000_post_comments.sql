-- Text comments on news articles (authenticated readers).

create table if not exists public.post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default timezone('utc', now()),
  status text not null default 'visible' check (status in ('visible', 'hidden'))
);

create index if not exists post_comments_post_id_created_idx
  on public.post_comments (post_id, created_at desc);

alter table public.post_comments enable row level security;

drop policy if exists "post_comments_public_read" on public.post_comments;
create policy "post_comments_public_read"
  on public.post_comments for select
  to anon, authenticated
  using (status = 'visible');

drop policy if exists "post_comments_insert_own" on public.post_comments;
create policy "post_comments_insert_own"
  on public.post_comments for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and char_length(trim(body)) > 0
    and char_length(body) <= 4000
  );

drop policy if exists "post_comments_staff_all" on public.post_comments;
create policy "post_comments_staff_all"
  on public.post_comments for all
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());
