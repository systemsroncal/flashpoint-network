-- Popular home sidebar flag (editor-controlled, chronological among flagged)
alter table public.posts
  add column if not exists is_popular boolean not null default false;

create index if not exists posts_is_popular_idx on public.posts (is_popular)
  where is_popular = true;

-- Bump stale 2024 publish timestamps into 2026 (seed / legacy demo data)
update public.posts
set published_at = published_at + interval '2 years'
where published_at is not null
  and extract(year from published_at at time zone 'utc') = 2024;

update public.events
set
  starts_at = case
    when starts_at is not null and extract(year from starts_at at time zone 'utc') = 2024
      then starts_at + interval '2 years'
    else starts_at
  end,
  ends_at = case
    when ends_at is not null and extract(year from ends_at at time zone 'utc') = 2024
      then ends_at + interval '2 years'
    else ends_at
  end
where
  (starts_at is not null and extract(year from starts_at at time zone 'utc') = 2024)
  or (ends_at is not null and extract(year from ends_at at time zone 'utc') = 2024);

-- Flag existing popular seed stories if present
update public.posts
set is_popular = true
where slug in (
  'popular-01',
  'popular-02',
  'popular-03',
  'popular-04',
  'popular-05'
);
