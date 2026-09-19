-- Enable Classic Programs (public /classic-programs + admin) without changing schedule.
insert into public.site_settings (key, value)
values ('program_modules', '{"classic": true, "schedule": true}'::jsonb)
on conflict (key) do update
set
  value = coalesce(public.site_settings.value, '{}'::jsonb) || '{"classic": true}'::jsonb,
  updated_at = timezone('utc', now());
