-- First Section home slots: 1 = large left, 2–3 = stacked right.
alter table public.posts
  add column if not exists home_first_slot smallint;

alter table public.posts
  drop constraint if exists posts_home_first_slot_range;

alter table public.posts
  add constraint posts_home_first_slot_range
  check (home_first_slot is null or home_first_slot in (1, 2, 3));

comment on column public.posts.home_first_slot is
  'Home first section position: 1 = large left featured, 2–3 = stacked sides. Null = not pinned.';

-- Only one post per slot (any status); empty slots fall back to Latest chronology on home.
create unique index if not exists posts_home_first_slot_uidx
  on public.posts (home_first_slot)
  where home_first_slot is not null;
