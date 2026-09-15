-- Email template design fields for live preview / compiled HTML
alter table public.email_templates
  add column if not exists header_bg_color text default '#1b2a64',
  add column if not exists footer_bg_color text default '#111111',
  add column if not exists logo_url text,
  add column if not exists max_width integer default 600;

comment on column public.email_templates.header_bg_color is 'Email header background color';
comment on column public.email_templates.footer_bg_color is 'Email footer background color';
comment on column public.email_templates.logo_url is 'Logo image URL shown in email header';
comment on column public.email_templates.max_width is 'Max content width in pixels';
