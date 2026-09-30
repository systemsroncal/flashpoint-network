-- Advertising inquiry form (/advertise) — staff read in admin Forms.

create table if not exists public.advertise_inquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  company text,
  name text not null,
  email text not null,
  phone text,
  message text not null,
  read_at timestamptz
);

create index if not exists advertise_inquiries_created_at_idx
  on public.advertise_inquiries (created_at desc);

alter table public.advertise_inquiries enable row level security;

drop policy if exists "advertise_inquiries_staff_select" on public.advertise_inquiries;
create policy "advertise_inquiries_staff_select"
  on public.advertise_inquiries for select
  to authenticated
  using (public.is_staff());

drop policy if exists "advertise_inquiries_staff_update" on public.advertise_inquiries;
create policy "advertise_inquiries_staff_update"
  on public.advertise_inquiries for update
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());
