-- Site display timezone (IANA). Timestamps remain timestamptz/UTC in the DB.
insert into public.site_settings (key, value)
values ('timezone', '"America/Chicago"'::jsonb)
on conflict (key) do nothing;
