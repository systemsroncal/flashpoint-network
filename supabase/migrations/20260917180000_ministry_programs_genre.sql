-- Network Programs: optional display columns (schema only — no content DML)

alter table public.ministry_programs
  add column if not exists genre text;

alter table public.ministry_programs
  add column if not exists genres_label text;

alter table public.ministry_programs
  add column if not exists schedule_line text;
