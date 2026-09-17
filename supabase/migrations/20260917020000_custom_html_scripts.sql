-- Trusted admin-only HTML/script injection for public pages (GA, Meta Pixel, etc.).
-- Read server-side via service role only — not exposed on anon site_settings public_read.

insert into public.site_settings (key, value) values
  (
    'custom_html',
    jsonb_build_object(
      'head', '',
      'body', '',
      'footer', ''
    )
  )
on conflict (key) do nothing;
