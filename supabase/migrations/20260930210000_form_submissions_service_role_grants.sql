-- Ensure service_role can read form submissions for admin (Forms hub).

grant select, insert, update, delete on table public.help_center_submissions to service_role;
grant select, insert, update, delete on table public.advertise_inquiries to service_role;
