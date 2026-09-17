-- Network Programs (Figma): human-readable modal copy; keep schedule fields from prior migration.

update public.ministry_programs set
  description = case slug
    when 'revivalmakers-with-pastor-tony-suarez' then 'Revivalmakers with Tony Suarez — Sundays at 9:00 PM ET on FlashPoint Television Network.'
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
    else description
  end
where status = 'published';
