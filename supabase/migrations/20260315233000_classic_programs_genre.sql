-- Classic Programs: genre badge + compact schedule line for public redesign

alter table public.classic_programs
  add column if not exists genre text;

alter table public.classic_programs
  add column if not exists genres_label text;

alter table public.classic_programs
  add column if not exists schedule_line text;

-- Seed genre + compact schedule for existing published classics
update public.classic_programs set
  genre = coalesce(genre, case slug
    when 'the-lucy-show' then 'Comedy'
    when 'the-roy-rogers-show' then 'Western'
    when 'the-adventures-of-ozzie-and-harriet' then 'Family Comedy'
    when 'dragnet' then 'Crime Drama'
    when 'the-mickey-rooney-show-hey-mulligan' then 'Comedy'
    when 'the-bob-cummings-show' then 'Comedy'
    when 'i-married-joan' then 'Comedy'
    when 'petticoat-junction' then 'Comedy'
    when 'my-little-margie' then 'Comedy'
    else 'Classic'
  end),
  genres_label = coalesce(genres_label, case slug
    when 'the-lucy-show' then 'Comedy · Classic television'
    when 'the-roy-rogers-show' then 'Western · Classic television'
    when 'the-adventures-of-ozzie-and-harriet' then 'Family comedy · Classic television'
    when 'dragnet' then 'Crime drama · Classic television'
    when 'the-mickey-rooney-show-hey-mulligan' then 'Comedy · Classic television'
    when 'the-bob-cummings-show' then 'Comedy · Classic television'
    when 'i-married-joan' then 'Comedy · Classic television'
    when 'petticoat-junction' then 'Comedy · Classic television'
    when 'my-little-margie' then 'Comedy · Classic television'
    else 'Classic television'
  end),
  schedule_line = coalesce(schedule_line, case
    when schedule_note ~* 'monday through friday' and schedule_note ~* '([0-9]{1,2}:[0-9]{2}\s*[AP]M)' then
      'Mon–Fri · ' || upper(substring(schedule_note from '([0-9]{1,2}:[0-9]{2}\s*[AP]M)')) || ' ET'
    else schedule_note
  end)
where status = 'published';
