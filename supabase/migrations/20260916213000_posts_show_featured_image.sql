-- Show/hide featured image on the public single-post hero.
-- Default true for normal news; video/podcast posts default to hide
-- so the player can occupy the hero slot.
alter table public.posts
  add column if not exists show_featured_image boolean not null default true;

comment on column public.posts.show_featured_image is
  'When false, the single-post hero hides the featured image and (if present) places the video/podcast player in that slot. Defaults to false for Video/Podcast.';

update public.posts
set show_featured_image = false
where show_featured_image = true
  and (
    is_video = true
    or is_podcast = true
    or category_id in (
      select id
      from public.categories
      where lower(slug) in ('video', 'podcast', 'podcasts')
         or lower(name) in ('video', 'podcast', 'podcasts')
    )
  );
