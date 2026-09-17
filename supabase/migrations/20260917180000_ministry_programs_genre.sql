-- Network Programs: genre badge + compact schedule line (public redesign)

alter table public.ministry_programs
  add column if not exists genre text;

alter table public.ministry_programs
  add column if not exists genres_label text;

alter table public.ministry_programs
  add column if not exists schedule_line text;

update public.ministry_programs set
  title = case slug
    when 'revivalmakers-with-pastor-tony-suarez' then 'Revivalmakers with Tony Suarez'
    when 'wake-up-church-with-nate-schatzline' then 'Wake Up Church with Nate Schatzline'
    when 'kinston-first-pentecostal-holiness-church-with-paston-brian-rogers' then 'Kinston First Pentecostal Holiness Church with Pastor Brian Rogers'
    else title
  end,
  excerpt = case slug
    when 'revivalmakers-with-pastor-tony-suarez' then 'Revivalmakers with Tony Suarez — Sundays at 9:00 PM ET.'
    when 'make-the-word-alive-with-pastor-joanne-ramsay' then 'Make the Word Alive with Pastor JoAnne Ramsay — Monday through Friday at 10:30 AM ET.'
    when 'revival-nation-with-pastor-alan-didio' then 'Revival Nation with Pastor Alan DiDio — Sundays at 10:00 AM ET.'
    when 'hans-hess-ministries' then 'Hans Hess Ministries — Sundays at 9:00 AM ET.'
    when 'revival-at-cape-henry-with-pastor-larry-reece' then 'Revival at Cape Henry with Pastor Larry Reece — Monday through Friday at 7:30 PM ET.'
    when 'billy-graham-classics' then 'Billy Graham Classics — Sundays at 12:30 PM ET.'
    when 'daily-faith-with-philip-cameron' then 'Daily Faith with Philip Cameron — Monday through Friday at 11:30 AM ET.'
    when 'disturbing-the-peace-with-john-amanchukwu' then 'Disturbing the Peace with John Amanchukwu — Sundays at 5:00 PM ET and Wednesdays at 2:30 PM ET.'
    when 'voice-of-god-with-joseph-z' then 'Voice of God with Joseph Z — Monday through Friday at 10:00 AM ET.'
    when 'wake-up-church-with-nate-schatzline' then 'Wake Up Church with Nate Schatzline — Mondays at 11:00 PM ET.'
    when 'souls-to-the-poles-with-lorenzo-sewell' then 'Souls to the Poles with Lorenzo Sewell — Sundays at 7:30 PM ET.'
    when 'mercy-culture-church-with-pastor-landon-schott' then 'Mercy Culture Church with Pastor Landon Schott — Sundays at 11:00 AM ET and 8:00 PM ET.'
    when 'living-room-church-with-pastor-stephen-and-pam-marshell' then 'Living Room Church with Pastor Stephen and Pam Marshell — Thursdays at 12:00 PM ET.'
    when 'in-the-word-with-pastor-brian-rogers' then 'In the Word with Pastor Brian Rogers — Wednesdays at 8:30 PM ET.'
    when 'walking-in-the-word-with-brandy-shiloh' then 'Walking in the Word with Brandy Shiloh — Sundays at 6:00 PM ET.'
    when 'ministry-specials' then 'Ministry Specials — Sundays starting at 2:00 PM ET.'
    when 'revival-radio-tv-with-host-dr-gene-bailey' then 'Revival Radio TV with host Dr. Gene Bailey — Sundays at 12:00 PM ET.'
    when 'kinston-first-pentecostal-holiness-church-with-paston-brian-rogers' then 'Kinston First Pentecostal Holiness Church with Pastor Brian Rogers — Sundays at 1:00 PM ET.'
    when 'voices-in-the-wilderness-with-pastor-maria-goldstein' then 'Voices in the Wilderness with Pastor Maria Goldstein — Sundays at 5:30 PM ET.'
    else excerpt
  end,
  schedule_note = case slug
    when 'revivalmakers-with-pastor-tony-suarez' then 'Sundays at 9:00 PM ET'
    when 'make-the-word-alive-with-pastor-joanne-ramsay' then 'Monday through Friday at 10:30 AM ET'
    when 'revival-nation-with-pastor-alan-didio' then 'Sundays at 10:00 AM ET'
    when 'hans-hess-ministries' then 'Sundays at 9:00 AM ET'
    when 'revival-at-cape-henry-with-pastor-larry-reece' then 'Monday through Friday at 7:30 PM ET'
    when 'billy-graham-classics' then 'Sundays at 12:30 PM ET'
    when 'daily-faith-with-philip-cameron' then 'Monday through Friday at 11:30 AM ET'
    when 'disturbing-the-peace-with-john-amanchukwu' then 'Sundays at 5:00 PM ET and Wednesdays at 2:30 PM ET'
    when 'voice-of-god-with-joseph-z' then 'Monday through Friday at 10:00 AM ET'
    when 'wake-up-church-with-nate-schatzline' then 'Mondays at 11:00 PM ET'
    when 'souls-to-the-poles-with-lorenzo-sewell' then 'Sundays at 7:30 PM ET'
    when 'mercy-culture-church-with-pastor-landon-schott' then 'Sundays at 11:00 AM ET and 8:00 PM ET'
    when 'living-room-church-with-pastor-stephen-and-pam-marshell' then 'Thursdays at 12:00 PM ET'
    when 'in-the-word-with-pastor-brian-rogers' then 'Wednesdays at 8:30 PM ET'
    when 'walking-in-the-word-with-brandy-shiloh' then 'Sundays at 6:00 PM ET'
    when 'ministry-specials' then 'Sundays starting at 2:00 PM ET'
    when 'revival-radio-tv-with-host-dr-gene-bailey' then 'Sundays at 12:00 PM ET'
    when 'kinston-first-pentecostal-holiness-church-with-paston-brian-rogers' then 'Sundays at 1:00 PM ET'
    when 'voices-in-the-wilderness-with-pastor-maria-goldstein' then 'Sundays at 5:30 PM ET'
    else schedule_note
  end,
  genre = coalesce(genre, case slug
    when 'revivalmakers-with-pastor-tony-suarez' then 'Revival'
    when 'make-the-word-alive-with-pastor-joanne-ramsay' then 'Teaching'
    when 'revival-nation-with-pastor-alan-didio' then 'Revival'
    when 'hans-hess-ministries' then 'Ministry'
    when 'revival-at-cape-henry-with-pastor-larry-reece' then 'Revival'
    when 'billy-graham-classics' then 'Classic'
    when 'daily-faith-with-philip-cameron' then 'Faith'
    when 'disturbing-the-peace-with-john-amanchukwu' then 'Commentary'
    when 'voice-of-god-with-joseph-z' then 'Prophecy'
    when 'wake-up-church-with-nate-schatzline' then 'Revival'
    when 'souls-to-the-poles-with-lorenzo-sewell' then 'Ministry'
    when 'mercy-culture-church-with-pastor-landon-schott' then 'Church'
    when 'living-room-church-with-pastor-stephen-and-pam-marshell' then 'Church'
    when 'in-the-word-with-pastor-brian-rogers' then 'Teaching'
    when 'walking-in-the-word-with-brandy-shiloh' then 'Teaching'
    when 'ministry-specials' then 'Special'
    when 'revival-radio-tv-with-host-dr-gene-bailey' then 'Revival'
    when 'kinston-first-pentecostal-holiness-church-with-paston-brian-rogers' then 'Church'
    when 'voices-in-the-wilderness-with-pastor-maria-goldstein' then 'Ministry'
    else 'Ministry'
  end),
  genres_label = coalesce(genres_label, case slug
    when 'revivalmakers-with-pastor-tony-suarez' then 'Revival · Gospel teaching'
    when 'make-the-word-alive-with-pastor-joanne-ramsay' then 'Teaching · Gospel broadcast'
    when 'revival-nation-with-pastor-alan-didio' then 'Revival · Gospel teaching'
    when 'hans-hess-ministries' then 'Ministry · Gospel teaching'
    when 'revival-at-cape-henry-with-pastor-larry-reece' then 'Revival · Gospel teaching'
    when 'billy-graham-classics' then 'Classic · Gospel message'
    when 'daily-faith-with-philip-cameron' then 'Faith · Daily encouragement'
    when 'disturbing-the-peace-with-john-amanchukwu' then 'Commentary · Cultural engagement'
    when 'voice-of-god-with-joseph-z' then 'Prophecy · Gospel teaching'
    when 'wake-up-church-with-nate-schatzline' then 'Revival · Gospel teaching'
    when 'souls-to-the-poles-with-lorenzo-sewell' then 'Ministry · Outreach'
    when 'mercy-culture-church-with-pastor-landon-schott' then 'Church · Worship & teaching'
    when 'living-room-church-with-pastor-stephen-and-pam-marshell' then 'Church · Worship & teaching'
    when 'in-the-word-with-pastor-brian-rogers' then 'Teaching · Bible study'
    when 'walking-in-the-word-with-brandy-shiloh' then 'Teaching · Bible study'
    when 'ministry-specials' then 'Special · Network feature'
    when 'revival-radio-tv-with-host-dr-gene-bailey' then 'Revival · Gospel broadcast'
    when 'kinston-first-pentecostal-holiness-church-with-paston-brian-rogers' then 'Church · Worship service'
    when 'voices-in-the-wilderness-with-pastor-maria-goldstein' then 'Ministry · Gospel teaching'
    else 'Gospel teaching · Network broadcast'
  end),
  schedule_line = coalesce(schedule_line, case slug
    when 'revivalmakers-with-pastor-tony-suarez' then 'Sun · 9:00 PM ET'
    when 'make-the-word-alive-with-pastor-joanne-ramsay' then 'Mon–Fri · 10:30 AM ET'
    when 'revival-nation-with-pastor-alan-didio' then 'Sun · 10:00 AM ET'
    when 'hans-hess-ministries' then 'Sun · 9:00 AM ET'
    when 'revival-at-cape-henry-with-pastor-larry-reece' then 'Mon–Fri · 7:30 PM ET'
    when 'billy-graham-classics' then 'Sun · 12:30 PM ET'
    when 'daily-faith-with-philip-cameron' then 'Mon–Fri · 11:30 AM ET'
    when 'disturbing-the-peace-with-john-amanchukwu' then 'Sun · 5:00 PM ET · Wed · 2:30 PM ET'
    when 'voice-of-god-with-joseph-z' then 'Mon–Fri · 10:00 AM ET'
    when 'wake-up-church-with-nate-schatzline' then 'Mon · 11:00 PM ET'
    when 'souls-to-the-poles-with-lorenzo-sewell' then 'Sun · 7:30 PM ET'
    when 'mercy-culture-church-with-pastor-landon-schott' then 'Sun · 11:00 AM ET · Sun · 8:00 PM ET'
    when 'living-room-church-with-pastor-stephen-and-pam-marshell' then 'Thu · 12:00 PM ET'
    when 'in-the-word-with-pastor-brian-rogers' then 'Wed · 8:30 PM ET'
    when 'walking-in-the-word-with-brandy-shiloh' then 'Sun · 6:00 PM ET'
    when 'ministry-specials' then 'Sun · 2:00 PM ET'
    when 'revival-radio-tv-with-host-dr-gene-bailey' then 'Sun · 12:00 PM ET'
    when 'kinston-first-pentecostal-holiness-church-with-paston-brian-rogers' then 'Sun · 1:00 PM ET'
    when 'voices-in-the-wilderness-with-pastor-maria-goldstein' then 'Sun · 5:30 PM ET'
    else schedule_line
  end)
where status = 'published';
