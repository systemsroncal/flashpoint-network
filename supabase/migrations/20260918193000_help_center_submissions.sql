-- Help Center contact form submissions (public submit via API + staff read in admin).

create table if not exists public.help_center_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  email text not null,
  help_area text not null,
  journalism_issue text,
  subject text not null,
  description text not null,
  attachment_paths jsonb not null default '[]'::jsonb,
  read_at timestamptz
);

create index if not exists help_center_submissions_created_at_idx
  on public.help_center_submissions (created_at desc);

alter table public.help_center_submissions enable row level security;

drop policy if exists "help_center_staff_select" on public.help_center_submissions;
create policy "help_center_staff_select"
  on public.help_center_submissions for select
  to authenticated
  using (public.is_staff());

drop policy if exists "help_center_staff_update" on public.help_center_submissions;
create policy "help_center_staff_update"
  on public.help_center_submissions for update
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());
