-- Optional outbound URL for home orange bar / event CTA (opens in new tab).
alter table public.events
  add column if not exists external_url text;

comment on column public.events.external_url is
  'Optional URL for home ticker / title CTA; opens in a new tab when set.';
