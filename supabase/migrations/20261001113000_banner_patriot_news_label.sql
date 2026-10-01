-- Patriot full-width banner is shown on /news (not the network home).

update public.banner_widgets
set
  label = 'News — Are You a Patriot (full-width)',
  updated_at = timezone('utc', now())
where slot = 'home_patriot_banner'
  and label = 'Home — Are You a Patriot (full-width)';
