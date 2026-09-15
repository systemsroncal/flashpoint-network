-- Add video URL on posts (YouTube / external) for must-watch and video stories
alter table public.posts
  add column if not exists video_url text;

comment on column public.posts.video_url is
  'Optional YouTube or external video URL for video posts and must-watch embeds.';

-- Public media bucket for admin uploads (Sharp → WebP → Storage)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Public read for media objects
drop policy if exists "Public read media" on storage.objects;
create policy "Public read media"
  on storage.objects for select
  using (bucket_id = 'media');

-- Service role / authenticated writers (admin uses service role server-side)
drop policy if exists "Authenticated upload media" on storage.objects;
create policy "Authenticated upload media"
  on storage.objects for insert
  with check (bucket_id = 'media');

drop policy if exists "Authenticated update media" on storage.objects;
create policy "Authenticated update media"
  on storage.objects for update
  using (bucket_id = 'media');

drop policy if exists "Authenticated delete media" on storage.objects;
create policy "Authenticated delete media"
  on storage.objects for delete
  using (bucket_id = 'media');
