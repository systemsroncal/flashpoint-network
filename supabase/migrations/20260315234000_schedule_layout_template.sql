-- Allow public read of the schedule layout template setting.

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
      'paywall',
      'classic_programs_sort',
      'ministry_programs_sort',
      'schedule_display_mode',
      'schedule_layout_template'
    )
    or public.is_staff()
  );

insert into public.site_settings (key, value) values
  ('schedule_layout_template', '"template_1"'::jsonb)
on conflict (key) do nothing;
