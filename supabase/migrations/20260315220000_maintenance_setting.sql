-- Allow public (anon) read of maintenance flag for edge/layout gates.
-- Staff already see all keys via is_staff().

drop policy if exists "site_settings_public_read" on public.site_settings;
create policy "site_settings_public_read"
  on public.site_settings for select
  to anon, authenticated
  using (
    key in (
      'site_name',
      'site_short_name',
      'site_url',
      'site_tagline',
      'social_links',
      'maintenance',
      'ads_txt',
      'adsense',
      'paywall'
    )
    or public.is_staff()
  );

insert into public.site_settings (key, value) values
  ('maintenance', '{"enabled":false,"message":""}'::jsonb)
on conflict (key) do nothing;
