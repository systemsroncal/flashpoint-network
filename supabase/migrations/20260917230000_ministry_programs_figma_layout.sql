-- FPTN Shows layout: host + multi-line schedule on cards

alter table public.ministry_programs
  add column if not exists host_name text;

alter table public.ministry_programs
  add column if not exists schedule_detail text;

-- Retire legacy slug set from the previous grid (replaced by Figma catalog)
update public.ministry_programs
set status = 'archived'
where slug in (
  'revivalmakers-with-pastor-tony-suarez',
  'make-the-word-alive-with-pastor-joanne-ramsay',
  'revival-nation-with-pastor-alan-didio',
  'hans-hess-ministries',
  'revival-at-cape-henry-with-pastor-larry-reece',
  'disturbing-the-peace-with-john-amanchukwu',
  'voice-of-god-with-joseph-z',
  'wake-up-church-with-nate-schatzline',
  'souls-to-the-poles-with-lorenzo-sewell',
  'mercy-culture-church-with-pastor-landon-schott',
  'living-room-church-with-pastor-stephen-and-pam-marshell',
  'in-the-word-with-pastor-brian-rogers',
  'walking-in-the-word-with-brandy-shiloh',
  'ministry-specials',
  'revival-radio-tv-with-host-dr-gene-bailey',
  'kinston-first-pentecostal-holiness-church-with-paston-brian-rogers',
  'voices-in-the-wilderness-with-pastor-maria-goldstein'
);
