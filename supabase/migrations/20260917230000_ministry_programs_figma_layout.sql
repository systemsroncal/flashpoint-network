-- Network Programs: host + multi-line schedule on cards (schema only — no content DML)

alter table public.ministry_programs
  add column if not exists host_name text;

alter table public.ministry_programs
  add column if not exists schedule_detail text;
