-- Logo alignment for email template headers
alter table public.email_templates
  add column if not exists logo_align text default 'center';

alter table public.email_templates
  drop constraint if exists email_templates_logo_align_check;

alter table public.email_templates
  add constraint email_templates_logo_align_check
  check (logo_align in ('left', 'center', 'right'));

comment on column public.email_templates.logo_align is
  'Header logo alignment: left | center | right';

update public.email_templates
set logo_align = 'center'
where logo_align is null;
