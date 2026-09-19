-- Network Programs: optional home carousel image (schema only — no content DML)

alter table public.ministry_programs
  add column if not exists carousel_image_url text;
