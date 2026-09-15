-- SEO + Open Graph fields for News (posts)
alter table public.posts
  add column if not exists seo_title text,
  add column if not exists seo_description text,
  add column if not exists seo_keywords text,
  add column if not exists og_title text,
  add column if not exists og_description text,
  add column if not exists og_image_url text;

comment on column public.posts.seo_title is 'Optional SEO meta title (fallback: title)';
comment on column public.posts.seo_description is 'Optional SEO meta description (fallback: excerpt)';
comment on column public.posts.seo_keywords is 'Comma-separated focus / SEO keywords';
comment on column public.posts.og_title is 'Optional Open Graph title';
comment on column public.posts.og_description is 'Optional Open Graph description';
comment on column public.posts.og_image_url is 'Optional Open Graph image URL';
