-- Re-enable Schedule Programs (public /schedule-programs + admin) without changing classic.
insert into public.site_settings (key, value)
values ('program_modules', '{"classic": false, "schedule": true}'::jsonb)
on conflict (key) do update
set
  value = coalesce(public.site_settings.value, '{}'::jsonb) || '{"schedule": true}'::jsonb,
  updated_at = timezone('utc', now());
