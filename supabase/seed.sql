-- FP Network Phase 2 seed: content matching the home mockup.
-- Idempotent via fixed UUIDs and ON CONFLICT.
-- Requires a seed author profile (created by scripts/apply-supabase.mjs via Auth Admin API)
-- or set app.seed_author_id before running.

-- ---------------------------------------------------------------------------
-- Site settings
-- ---------------------------------------------------------------------------
insert into public.site_settings (key, value) values
  ('site_name', '"Flash Point Television Network"'::jsonb),
  ('site_short_name', '"FPTN"'::jsonb),
  ('site_tagline', '"Get The Full Story. As It Is."'::jsonb),
  ('site_url', '"https://fpnetwork.local"'::jsonb),
  ('social_links', '{"x":"https://x.com/fpnetwork","facebook":"https://facebook.com/fpnetwork","instagram":"https://instagram.com/fpnetwork","youtube":"https://youtube.com/@fpnetwork"}'::jsonb),
  ('paywall', '{"enabled":true,"free_article_limit":3,"modal_title":"Don''t stop here","modal_body":"Create your FPTN All Access account for free to keep reading and join the conversation."}'::jsonb),
  ('adsense', '{"enabled":false,"client_id":""}'::jsonb),
  ('ads_txt', '"google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0"'::jsonb),
  ('maintenance', '{"enabled":false,"message":""}'::jsonb),
  ('timezone', '"America/Chicago"'::jsonb)
on conflict (key) do update set value = excluded.value, updated_at = timezone('utc', now());

-- ---------------------------------------------------------------------------
-- Email templates
-- ---------------------------------------------------------------------------
insert into public.email_templates (id, name, slug, subject, body_html) values
  (
    'a1000000-0000-4000-8000-000000000001',
    'Welcome',
    'welcome',
    'Welcome to {SITE_NAME}',
    '<p>Hi {CURRENT_USER_FULLNAME},</p><p>Welcome to {SITE_NAME}. Get The Full Story. As It Is.</p><p>{SITE_URL}</p><p>&copy; {CURRENT_YEAR}</p>'
  ),
  (
    'a1000000-0000-4000-8000-000000000002',
    'Password Reset',
    'password-reset',
    'Reset your {SITE_NAME} password',
    '<p>Hi {CURRENT_USER_NAME},</p><p>Reset your password: <a href="{RESET_LINK}">Reset password</a></p><p>{CURRENT_DATE}</p>'
  )
on conflict (slug) do update set
  name = excluded.name,
  subject = excluded.subject,
  body_html = excluded.body_html,
  updated_at = timezone('utc', now());

update public.email_templates set
  header_bg_color = coalesce(header_bg_color, '#1b2a64'),
  footer_bg_color = coalesce(footer_bg_color, '#111111'),
  logo_url = coalesce(nullif(logo_url, ''), '/brand/fpn-logo-mark.svg'),
  max_width = coalesce(max_width, 600),
  logo_align = coalesce(logo_align, 'center')
where slug in ('welcome', 'password-reset');

-- ---------------------------------------------------------------------------
-- Categories (nav + Politics used on cards)
-- ---------------------------------------------------------------------------
insert into public.categories (id, name, slug, description, sort_order) values
  ('b1000000-0000-4000-8000-000000000001', 'U.S.', 'us', 'United States news', 10),
  ('b1000000-0000-4000-8000-000000000002', 'Politics', 'politics', 'Politics and power', 20),
  ('b1000000-0000-4000-8000-000000000003', 'World', 'world', 'International coverage', 30),
  ('b1000000-0000-4000-8000-000000000004', 'Opinion', 'opinion', 'Analysis and opinion', 40),
  ('b1000000-0000-4000-8000-000000000005', 'Business', 'business', 'Markets and business', 50),
  ('b1000000-0000-4000-8000-000000000006', 'Science', 'science', 'Science and discovery', 60),
  ('b1000000-0000-4000-8000-000000000007', 'Lifestyle', 'lifestyle', 'Culture and lifestyle', 70),
  ('b1000000-0000-4000-8000-000000000008', 'Health', 'health', 'Health and wellness', 80),
  ('b1000000-0000-4000-8000-000000000009', 'Tech & AI', 'tech-ai', 'Technology and artificial intelligence', 90),
  ('b1000000-0000-4000-8000-00000000000a', 'Elections', 'elections', 'Election coverage', 100),
  ('b1000000-0000-4000-8000-00000000000b', 'Video', 'video', 'Video stories', 110)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  sort_order = excluded.sort_order,
  updated_at = timezone('utc', now());

-- ---------------------------------------------------------------------------
-- Tags
-- ---------------------------------------------------------------------------
insert into public.tags (id, name, slug) values
  ('c1000000-0000-4000-8000-000000000001', 'Breaking', 'breaking'),
  ('c1000000-0000-4000-8000-000000000002', 'Exclusive', 'exclusive'),
  ('c1000000-0000-4000-8000-000000000003', 'Live', 'live'),
  ('c1000000-0000-4000-8000-000000000004', 'Must Watch', 'must-watch'),
  ('c1000000-0000-4000-8000-000000000005', 'Podcast', 'podcast'),
  ('c1000000-0000-4000-8000-000000000006', 'Popular', 'popular'),
  ('c1000000-0000-4000-8000-000000000007', 'Army', 'army'),
  ('c1000000-0000-4000-8000-000000000008', 'White House', 'white-house'),
  ('c1000000-0000-4000-8000-000000000009', 'Congress', 'congress'),
  ('c1000000-0000-4000-8000-00000000000a', 'Campaign Trail', 'campaign-trail')
on conflict (slug) do update set name = excluded.name;

-- ---------------------------------------------------------------------------
-- Events (hero / live)
-- ---------------------------------------------------------------------------
insert into public.events (
  id, title, slug, description, format, video_url, body, host_name,
  starts_at, ends_at, is_live, show_on_home, thumbnail_url
) values
  (
    'd1000000-0000-4000-8000-000000000001',
    'Outgoing Army secretary breaks silence after submitting resignation',
    'flashpoint-live-army-secretary',
    'FlashPoint Live covers the resignation fallout and what comes next.',
    'video',
    'https://www.youtube.com/watch?v=una0oMq_oco',
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    'FlashPoint Live',
    '2026-09-02 19:00:00+00',
    '2026-09-02 19:30:00+00',
    true,
    true,
    'https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?auto=format&fit=crop&w=1600&q=80'
  ),
  (
    'd1000000-0000-4000-8000-000000000002',
    'Election Night Desk: Early returns special',
    'election-night-desk',
    'Text briefings and live updates from the elections desk.',
    'video',
    'https://www.youtube.com/watch?v=Wlwq68AnrdQ',
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim ad minim veniam.',
    'FPTN Elections Desk',
    '2026-11-05 23:00:00+00',
    '2026-11-06 06:00:00+00',
    false,
    true,
    'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1600&q=80'
  ),
  (
    'd1000000-0000-4000-8000-000000000003',
    'World Briefing: Markets and diplomacy',
    'world-briefing-markets',
    'A rapid briefing on overnight market moves and diplomatic cables.',
    'video',
    'https://www.youtube.com/watch?v=MXPa62I9wiY',
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    'FPTN World Desk',
    '2026-09-03 12:00:00+00',
    '2026-09-03 12:25:00+00',
    false,
    true,
    'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1600&q=80'
  )
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  format = excluded.format,
  video_url = excluded.video_url,
  body = excluded.body,
  host_name = excluded.host_name,
  starts_at = excluded.starts_at,
  ends_at = excluded.ends_at,
  is_live = excluded.is_live,
  show_on_home = excluded.show_on_home,
  thumbnail_url = excluded.thumbnail_url,
  updated_at = timezone('utc', now());

-- ---------------------------------------------------------------------------
-- Posts
-- author_id uses fixed seed editor profile f1000000-0000-4000-8000-000000000001
-- (created by scripts/apply-supabase.mjs via Auth Admin API before seed runs)
-- ---------------------------------------------------------------------------

-- Helper CTE constants for images / lorem
-- Featured + hero story
insert into public.posts (
  id, title, slug, excerpt, body, status, category_id, author_id,
  featured_image_url, is_featured, is_premium, is_video, is_podcast, is_popular,
  reading_time_minutes, view_count, published_at
) values
(
  'e1000000-0000-4000-8000-000000000001',
  'Outgoing Army secretary breaks silence after submitting resignation',
  'outgoing-army-secretary-breaks-silence',
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p><p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>',
  'published',
  'b1000000-0000-4000-8000-000000000002',
  'f1000000-0000-4000-8000-000000000001'::uuid,
  'https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?auto=format&fit=crop&w=1600&q=80',
  true, false, false, false, false, 8, 2300, '2026-09-15 00:00:00+00'
),
-- Secondary stack (2)
(
  'e1000000-0000-4000-8000-000000000002',
  'Transition briefers clash over who authorized the late-night memo',
  'army-secretary-secondary-brief',
  'Sources describe a scramble inside the E-ring after the resignation landed.',
  '<p>Sources describe a scramble inside the E-ring after the resignation landed.</p>',
  'published',
  'b1000000-0000-4000-8000-000000000002',
  'f1000000-0000-4000-8000-000000000001'::uuid,
  'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=800&q=80',
  false, false, false, false, false, 8, 2300, '2026-09-15 00:55:21+00'
),
(
  'e1000000-0000-4000-8000-000000000003',
  'Pentagon aides circulate a 12-point continuity checklist',
  'army-secretary-tertiary-brief',
  'The checklist covers press posture, allied calls, and overnight watches.',
  '<p>The checklist covers press posture, allied calls, and overnight watches.</p>',
  'published',
  'b1000000-0000-4000-8000-000000000001',
  'f1000000-0000-4000-8000-000000000001'::uuid,
  'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&w=800&q=80',
  false, false, false, false, false, 8, 2300, '2026-09-15 01:50:43+00'
),
-- Podcasts (4)
(
  'e1000000-0000-4000-8000-000000000010',
  'Outgoing Army secretary breaks silence after submitting resignation',
  'podcast-army-secretary-1',
  'Flash Point Daily podcast edition.',
  '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Podcast transcript placeholder.</p>',
  'published',
  'b1000000-0000-4000-8000-000000000002',
  'f1000000-0000-4000-8000-000000000001'::uuid,
  'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=600&q=80',
  false, false, false, true, false, 8, 2300, '2026-09-15 02:46:05+00'
),
(
  'e1000000-0000-4000-8000-000000000011',
  'Outgoing Army secretary breaks silence after submitting resignation',
  'podcast-army-secretary-2',
  'Flash Point Daily podcast edition.',
  '<p>Lorem ipsum dolor sit amet. Podcast transcript placeholder.</p>',
  'published',
  'b1000000-0000-4000-8000-000000000002',
  'f1000000-0000-4000-8000-000000000001'::uuid,
  'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=600&q=80',
  false, false, false, true, false, 8, 2100, '2026-09-15 03:41:27+00'
),
(
  'e1000000-0000-4000-8000-000000000012',
  'Outgoing Army secretary breaks silence after submitting resignation',
  'podcast-army-secretary-3',
  'Flash Point Daily podcast edition.',
  '<p>Lorem ipsum dolor sit amet. Podcast transcript placeholder.</p>',
  'published',
  'b1000000-0000-4000-8000-000000000001',
  'f1000000-0000-4000-8000-000000000001'::uuid,
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
  false, false, false, true, false, 8, 1900, '2026-09-15 04:36:49+00'
),
(
  'e1000000-0000-4000-8000-000000000013',
  'Outgoing Army secretary breaks silence after submitting resignation',
  'podcast-army-secretary-4',
  'Flash Point Daily podcast edition.',
  '<p>Lorem ipsum dolor sit amet. Podcast transcript placeholder.</p>',
  'published',
  'b1000000-0000-4000-8000-000000000002',
  'f1000000-0000-4000-8000-000000000001'::uuid,
  'https://images.unsplash.com/photo-1485579149621-3123dd979885?auto=format&fit=crop&w=600&q=80',
  false, false, false, true, false, 8, 1800, '2026-09-15 05:32:11+00'
),
-- Politics / World band (4 + 4) — distinct from Latest hero pool
(
  'e1000000-0000-4000-8000-000000000020',
  'House panel presses Pentagon on overnight chain-of-command gaps',
  'grid-story-01',
  'Committee members demand a timeline for who held operational authority after the resignation.',
  '<p>Committee members demand a timeline for who held operational authority after the resignation.</p>',
  'published',
  'b1000000-0000-4000-8000-000000000002',
  'f1000000-0000-4000-8000-000000000001'::uuid,
  'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=900&q=80',
  false, false, false, false, false, 8, 2300, '2026-09-15 06:27:33+00'
),
(
  'e1000000-0000-4000-8000-000000000021',
  'Governors weigh emergency staffing as transition clocks tick',
  'grid-story-02',
  'Statehouses prepare contingency plans for federal liaison blackouts.',
  '<p>Statehouses prepare contingency plans for federal liaison blackouts.</p>',
  'published',
  'b1000000-0000-4000-8000-000000000002',
  'f1000000-0000-4000-8000-000000000001'::uuid,
  'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=900&q=80',
  false, false, false, false, false, 8, 2300, '2026-09-15 07:22:55+00'
),
(
  'e1000000-0000-4000-8000-000000000022',
  'Allies seek clarity after Washington signals a hard reset abroad',
  'grid-story-03',
  'Capitals from London to Tokyo scramble for readouts on the next 72 hours.',
  '<p>Capitals from London to Tokyo scramble for readouts on the next 72 hours.</p>',
  'published',
  'b1000000-0000-4000-8000-000000000003',
  'f1000000-0000-4000-8000-000000000001'::uuid,
  'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=900&q=80',
  false, false, false, false, false, 8, 2300, '2026-09-15 08:18:17+00'
),
(
  'e1000000-0000-4000-8000-000000000023',
  'Border corridors tighten as regional partners reopen talks',
  'grid-story-04',
  'Trade and migration desks coordinate overnight briefings across three time zones.',
  '<p>Trade and migration desks coordinate overnight briefings across three time zones.</p>',
  'published',
  'b1000000-0000-4000-8000-000000000003',
  'f1000000-0000-4000-8000-000000000001'::uuid,
  'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=900&q=80',
  false, false, false, false, false, 8, 2300, '2026-09-15 09:13:39+00'
),
(
  'e1000000-0000-4000-8000-000000000024',
  'Energy markets jump on overseas reserve rumors',
  'grid-story-05',
  'Traders watch Gulf and North Sea flows after an unconfirmed policy leak.',
  '<p>Traders watch Gulf and North Sea flows after an unconfirmed policy leak.</p>',
  'published',
  'b1000000-0000-4000-8000-000000000003',
  'f1000000-0000-4000-8000-000000000001'::uuid,
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=900&q=80',
  false, false, false, false, false, 8, 2300, '2026-09-15 10:09:01+00'
),
(
  'e1000000-0000-4000-8000-000000000025',
  'Summit planners redraw the guest list after last-minute walkouts',
  'grid-story-06',
  'Diplomatic protocol teams rewrite seating charts before dawn.',
  '<p>Diplomatic protocol teams rewrite seating charts before dawn.</p>',
  'published',
  'b1000000-0000-4000-8000-000000000003',
  'f1000000-0000-4000-8000-000000000001'::uuid,
  'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=900&q=80',
  false, false, false, false, false, 8, 2300, '2026-09-15 11:04:23+00'
),
(
  'e1000000-0000-4000-8000-000000000026',
  'Senate whip count flips on emergency funding package',
  'grid-story-07',
  'Floor managers track late switches as the cloture window narrows.',
  '<p>Floor managers track late switches as the cloture window narrows.</p>',
  'published',
  'b1000000-0000-4000-8000-000000000002',
  'f1000000-0000-4000-8000-000000000001'::uuid,
  'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=900&q=80',
  false, false, false, false, false, 7, 2100, '2026-09-15 11:59:45+00'
),
(
  'e1000000-0000-4000-8000-000000000027',
  'Campaign finance desks flag a surge in same-day PAC filings',
  'grid-story-08',
  'Watchdogs say the filings cluster around swing districts overnight.',
  '<p>Watchdogs say the filings cluster around swing districts overnight.</p>',
  'published',
  'b1000000-0000-4000-8000-000000000002',
  'f1000000-0000-4000-8000-000000000001'::uuid,
  'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&w=900&q=80',
  false, false, false, false, false, 6, 1900, '2026-09-15 12:55:06+00'
),
-- Latest news (4 text-forward)
(
  'e1000000-0000-4000-8000-000000000030',
  'Outgoing Army secretary breaks silence after submitting resignation',
  'latest-01',
  'Lorem ipsum dolor sit amet.',
  '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>',
  'published',
  'b1000000-0000-4000-8000-000000000001',
  'f1000000-0000-4000-8000-000000000001'::uuid,
  'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=400&q=80',
  false, false, false, false, false, 5, 1200, '2026-09-15 13:50:28+00'
),
(
  'e1000000-0000-4000-8000-000000000031',
  'Outgoing Army secretary breaks silence after submitting resignation',
  'latest-02',
  'Lorem ipsum dolor sit amet.',
  '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>',
  'published',
  'b1000000-0000-4000-8000-000000000003',
  'f1000000-0000-4000-8000-000000000001'::uuid,
  'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=400&q=80',
  false, false, false, false, false, 5, 1100, '2026-09-15 14:45:50+00'
),
(
  'e1000000-0000-4000-8000-000000000032',
  'Outgoing Army secretary breaks silence after submitting resignation',
  'latest-03',
  'Lorem ipsum dolor sit amet.',
  '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>',
  'published',
  'b1000000-0000-4000-8000-000000000005',
  'f1000000-0000-4000-8000-000000000001'::uuid,
  'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=400&q=80',
  false, false, false, false, false, 5, 1000, '2026-09-15 15:41:12+00'
),
(
  'e1000000-0000-4000-8000-000000000033',
  'Outgoing Army secretary breaks silence after submitting resignation',
  'latest-04',
  'Lorem ipsum dolor sit amet.',
  '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>',
  'published',
  'b1000000-0000-4000-8000-000000000009',
  'f1000000-0000-4000-8000-000000000001'::uuid,
  'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80',
  false, false, false, false, false, 5, 980, '2026-09-15 16:36:34+00'
),
-- Must-watch videos (1 large + 4 small)
(
  'e1000000-0000-4000-8000-000000000040',
  'Outgoing Army secretary breaks silence after submitting resignation',
  'must-watch-main',
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  '<p>Lorem ipsum dolor sit amet. Video story placeholder.</p>',
  'published',
  'b1000000-0000-4000-8000-00000000000b',
  'f1000000-0000-4000-8000-000000000001'::uuid,
  'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1400&q=80',
  true, false, true, false, false, 8, 4500, '2026-09-15 17:31:56+00'
),
(
  'e1000000-0000-4000-8000-000000000041',
  'Outgoing Army secretary breaks silence after submitting resignation',
  'must-watch-01',
  'Lorem ipsum dolor sit amet.',
  '<p>Lorem ipsum dolor sit amet. Video story placeholder.</p>',
  'published',
  'b1000000-0000-4000-8000-00000000000b',
  'f1000000-0000-4000-8000-000000000001'::uuid,
  'https://images.unsplash.com/photo-1611162616475-46b635cb6868?auto=format&fit=crop&w=700&q=80',
  false, false, true, false, false, 6, 2200, '2026-09-15 18:27:18+00'
),
(
  'e1000000-0000-4000-8000-000000000042',
  'Outgoing Army secretary breaks silence after submitting resignation',
  'must-watch-02',
  'Lorem ipsum dolor sit amet.',
  '<p>Lorem ipsum dolor sit amet. Video story placeholder.</p>',
  'published',
  'b1000000-0000-4000-8000-00000000000b',
  'f1000000-0000-4000-8000-000000000001'::uuid,
  'https://images.unsplash.com/photo-1611162616475-46b635cb6868?auto=format&fit=crop&w=700&q=80',
  false, false, true, false, false, 6, 2100, '2026-09-15 19:22:40+00'
),
(
  'e1000000-0000-4000-8000-000000000043',
  'Outgoing Army secretary breaks silence after submitting resignation',
  'must-watch-03',
  'Lorem ipsum dolor sit amet.',
  '<p>Lorem ipsum dolor sit amet. Video story placeholder.</p>',
  'published',
  'b1000000-0000-4000-8000-00000000000b',
  'f1000000-0000-4000-8000-000000000001'::uuid,
  'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=700&q=80',
  false, false, true, false, false, 6, 2000, '2026-09-15 20:18:02+00'
),
(
  'e1000000-0000-4000-8000-000000000044',
  'Outgoing Army secretary breaks silence after submitting resignation',
  'must-watch-04',
  'Lorem ipsum dolor sit amet.',
  '<p>Lorem ipsum dolor sit amet. Video story placeholder.</p>',
  'published',
  'b1000000-0000-4000-8000-00000000000b',
  'f1000000-0000-4000-8000-000000000001'::uuid,
  'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=700&q=80',
  false, false, true, false, false, 6, 1950, '2026-09-15 21:13:24+00'
),
-- Elections block (8)
(
  'e1000000-0000-4000-8000-000000000050',
  'Outgoing Army secretary breaks silence after submitting resignation',
  'elections-01',
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  '<p>Lorem ipsum dolor sit amet. Elections desk coverage.</p>',
  'published',
  'b1000000-0000-4000-8000-00000000000a',
  'f1000000-0000-4000-8000-000000000001'::uuid,
  'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&w=900&q=80',
  false, false, false, false, false, 8, 2300, '2026-09-15 22:08:46+00'
),
(
  'e1000000-0000-4000-8000-000000000051',
  'Outgoing Army secretary breaks silence after submitting resignation',
  'elections-02',
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  '<p>Lorem ipsum dolor sit amet. Elections desk coverage.</p>',
  'published',
  'b1000000-0000-4000-8000-00000000000a',
  'f1000000-0000-4000-8000-000000000001'::uuid,
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=80',
  false, false, false, false, false, 8, 2300, '2026-09-15 23:04:08+00'
),
(
  'e1000000-0000-4000-8000-000000000052',
  'Outgoing Army secretary breaks silence after submitting resignation',
  'elections-03',
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  '<p>Lorem ipsum dolor sit amet. Elections desk coverage.</p>',
  'published',
  'b1000000-0000-4000-8000-00000000000a',
  'f1000000-0000-4000-8000-000000000001'::uuid,
  'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&w=900&q=80',
  false, false, false, false, false, 8, 2300, '2026-09-15 23:59:30+00'
),
(
  'e1000000-0000-4000-8000-000000000053',
  'Outgoing Army secretary breaks silence after submitting resignation',
  'elections-04',
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  '<p>Lorem ipsum dolor sit amet. Elections desk coverage.</p>',
  'published',
  'b1000000-0000-4000-8000-00000000000a',
  'f1000000-0000-4000-8000-000000000001'::uuid,
  'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=900&q=80',
  false, false, false, false, false, 8, 2300, '2026-09-16 00:54:51+00'
),
(
  'e1000000-0000-4000-8000-000000000054',
  'Outgoing Army secretary breaks silence after submitting resignation',
  'elections-05',
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  '<p>Lorem ipsum dolor sit amet. Elections desk coverage.</p>',
  'published',
  'b1000000-0000-4000-8000-00000000000a',
  'f1000000-0000-4000-8000-000000000001'::uuid,
  'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=900&q=80',
  false, false, false, false, false, 8, 2300, '2026-09-16 01:50:13+00'
),
(
  'e1000000-0000-4000-8000-000000000055',
  'Outgoing Army secretary breaks silence after submitting resignation',
  'elections-06',
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  '<p>Lorem ipsum dolor sit amet. Elections desk coverage.</p>',
  'published',
  'b1000000-0000-4000-8000-00000000000a',
  'f1000000-0000-4000-8000-000000000001'::uuid,
  'https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?auto=format&fit=crop&w=900&q=80',
  false, false, false, false, false, 8, 2300, '2026-09-16 02:45:35+00'
),
(
  'e1000000-0000-4000-8000-000000000056',
  'Outgoing Army secretary breaks silence after submitting resignation',
  'elections-07',
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  '<p>Lorem ipsum dolor sit amet. Elections desk coverage.</p>',
  'published',
  'b1000000-0000-4000-8000-00000000000a',
  'f1000000-0000-4000-8000-000000000001'::uuid,
  'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=900&q=80',
  false, false, false, false, false, 8, 2300, '2026-09-16 03:40:57+00'
),
(
  'e1000000-0000-4000-8000-000000000057',
  'Outgoing Army secretary breaks silence after submitting resignation',
  'elections-08',
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  '<p>Lorem ipsum dolor sit amet. Elections desk coverage.</p>',
  'published',
  'b1000000-0000-4000-8000-00000000000a',
  'f1000000-0000-4000-8000-000000000001'::uuid,
  'https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?auto=format&fit=crop&w=900&q=80',
  false, false, false, false, false, 8, 2300, '2026-09-16 04:36:19+00'
),
-- Exclusive / premium (main + 4 grid + 4 list)
(
  'e1000000-0000-4000-8000-000000000060',
  'Outgoing Army secretary breaks silence after submitting resignation',
  'exclusive-main',
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Premium briefing for subscribers.',
  '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Exclusive reporting placeholder.</p>',
  'published',
  'b1000000-0000-4000-8000-000000000002',
  'f1000000-0000-4000-8000-000000000001'::uuid,
  'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&w=1400&q=80',
  true, true, false, false, false, 10, 3200, '2026-09-16 05:31:41+00'
),
(
  'e1000000-0000-4000-8000-000000000061',
  'Outgoing Army secretary breaks silence after submitting resignation',
  'exclusive-grid-01',
  'Lorem ipsum dolor sit amet.',
  '<p>Lorem ipsum dolor sit amet. Exclusive reporting placeholder.</p>',
  'published',
  'b1000000-0000-4000-8000-000000000002',
  'f1000000-0000-4000-8000-000000000001'::uuid,
  'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=700&q=80',
  false, true, false, false, false, 8, 2800, '2026-09-16 06:27:03+00'
),
(
  'e1000000-0000-4000-8000-000000000062',
  'Outgoing Army secretary breaks silence after submitting resignation',
  'exclusive-grid-02',
  'Lorem ipsum dolor sit amet.',
  '<p>Lorem ipsum dolor sit amet. Exclusive reporting placeholder.</p>',
  'published',
  'b1000000-0000-4000-8000-000000000002',
  'f1000000-0000-4000-8000-000000000001'::uuid,
  'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=700&q=80',
  false, true, false, false, false, 8, 2700, '2026-09-16 07:22:25+00'
),
(
  'e1000000-0000-4000-8000-000000000063',
  'Outgoing Army secretary breaks silence after submitting resignation',
  'exclusive-grid-03',
  'Lorem ipsum dolor sit amet.',
  '<p>Lorem ipsum dolor sit amet. Exclusive reporting placeholder.</p>',
  'published',
  'b1000000-0000-4000-8000-000000000009',
  'f1000000-0000-4000-8000-000000000001'::uuid,
  'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=700&q=80',
  false, true, false, false, false, 8, 2600, '2026-09-16 08:17:47+00'
),
(
  'e1000000-0000-4000-8000-000000000064',
  'Live Texas Election Results',
  'exclusive-grid-04-texas-results',
  'Lorem ipsum dolor sit amet. Live results desk.',
  '<p>Lorem ipsum dolor sit amet. Live Texas election results placeholder.</p>',
  'published',
  'b1000000-0000-4000-8000-00000000000a',
  'f1000000-0000-4000-8000-000000000001'::uuid,
  'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&w=700&q=80',
  false, true, false, false, false, 8, 2500, '2026-09-16 09:13:09+00'
),
(
  'e1000000-0000-4000-8000-000000000065',
  'Outgoing Army secretary breaks silence after submitting resignation',
  'exclusive-list-01',
  'Lorem ipsum dolor sit amet.',
  '<p>Lorem ipsum dolor sit amet.</p>',
  'published',
  'b1000000-0000-4000-8000-000000000002',
  'f1000000-0000-4000-8000-000000000001'::uuid,
  'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=400&q=80',
  false, true, false, false, false, 7, 2400, '2026-09-16 10:08:31+00'
),
(
  'e1000000-0000-4000-8000-000000000066',
  'Outgoing Army secretary breaks silence after submitting resignation',
  'exclusive-list-02',
  'Lorem ipsum dolor sit amet.',
  '<p>Lorem ipsum dolor sit amet.</p>',
  'published',
  'b1000000-0000-4000-8000-000000000004',
  'f1000000-0000-4000-8000-000000000001'::uuid,
  'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=400&q=80',
  false, true, false, false, false, 7, 2350, '2026-09-16 11:03:53+00'
),
(
  'e1000000-0000-4000-8000-000000000067',
  'Outgoing Army secretary breaks silence after submitting resignation',
  'exclusive-list-03',
  'Lorem ipsum dolor sit amet.',
  '<p>Lorem ipsum dolor sit amet.</p>',
  'published',
  'b1000000-0000-4000-8000-000000000005',
  'f1000000-0000-4000-8000-000000000001'::uuid,
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=400&q=80',
  false, true, false, false, false, 7, 2300, '2026-09-16 11:59:15+00'
),
(
  'e1000000-0000-4000-8000-000000000068',
  'Outgoing Army secretary breaks silence after submitting resignation',
  'exclusive-list-04',
  'Lorem ipsum dolor sit amet.',
  '<p>Lorem ipsum dolor sit amet.</p>',
  'published',
  'b1000000-0000-4000-8000-000000000008',
  'f1000000-0000-4000-8000-000000000001'::uuid,
  'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=400&q=80',
  false, true, false, false, false, 7, 2250, '2026-09-16 12:54:36+00'
),
-- Popular sidebar (5) — admin is_popular flag
(
  'e1000000-0000-4000-8000-000000000070',
  'Why the overnight briefing changed the map overnight',
  'popular-01',
  'Readers flooded the story after the first on-camera confirmation.',
  '<p>Readers flooded the story after the first on-camera confirmation.</p>',
  'published',
  'b1000000-0000-4000-8000-000000000002',
  'f1000000-0000-4000-8000-000000000001'::uuid,
  'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=400&q=80',
  false, false, false, false, true, 8, 9800, '2026-09-16 13:49:58+00'
),
(
  'e1000000-0000-4000-8000-000000000071',
  'Five charts that explain the succession scramble',
  'popular-02',
  'Data desks mapped the handoff minute by minute.',
  '<p>Data desks mapped the handoff minute by minute.</p>',
  'published',
  'b1000000-0000-4000-8000-000000000001',
  'f1000000-0000-4000-8000-000000000001'::uuid,
  'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=400&q=80',
  false, false, false, false, true, 8, 8700, '2026-09-16 14:45:20+00'
),
(
  'e1000000-0000-4000-8000-000000000072',
  'World desks react as partners demand a timeline',
  'popular-03',
  'Capitals want names, not talking points, before markets open.',
  '<p>Capitals want names, not talking points, before markets open.</p>',
  'published',
  'b1000000-0000-4000-8000-000000000003',
  'f1000000-0000-4000-8000-000000000001'::uuid,
  'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=400&q=80',
  false, false, false, false, true, 8, 7600, '2026-09-16 15:40:42+00'
),
(
  'e1000000-0000-4000-8000-000000000073',
  'Tech briefers flood transition war rooms with AI drafts',
  'popular-04',
  'Staffers say the first auto-summaries landed before sunrise.',
  '<p>Staffers say the first auto-summaries landed before sunrise.</p>',
  'published',
  'b1000000-0000-4000-8000-000000000009',
  'f1000000-0000-4000-8000-000000000001'::uuid,
  'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80',
  false, false, false, false, true, 8, 6500, '2026-09-16 16:36:04+00'
),
(
  'e1000000-0000-4000-8000-000000000074',
  'Faith leaders call for calm as rumors outpace facts',
  'popular-05',
  'Pastors and chaplains urge congregations to wait for verified updates.',
  '<p>Pastors and chaplains urge congregations to wait for verified updates.</p>',
  'published',
  'b1000000-0000-4000-8000-000000000006',
  'f1000000-0000-4000-8000-000000000001'::uuid,
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=400&q=80',
  false, false, false, false, true, 8, 5400, '2026-09-16 17:31:26+00'
),
-- Extra variety for World / Opinion / Business / Science / Lifestyle / Health / Tech
(
  'e1000000-0000-4000-8000-000000000080',
  'Diplomats race to contain overnight market shockwaves',
  'world-market-shockwaves',
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  '<p>Lorem ipsum dolor sit amet. World desk placeholder.</p>',
  'published',
  'b1000000-0000-4000-8000-000000000003',
  'f1000000-0000-4000-8000-000000000001'::uuid,
  'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=900&q=80',
  false, false, false, false, false, 6, 1400, '2026-09-16 18:26:48+00'
),
(
  'e1000000-0000-4000-8000-000000000081',
  'Why the resignation letter matters more than the press conference',
  'opinion-resignation-letter',
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  '<p>Lorem ipsum dolor sit amet. Opinion placeholder.</p>',
  'published',
  'b1000000-0000-4000-8000-000000000004',
  'f1000000-0000-4000-8000-000000000001'::uuid,
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=80',
  false, false, false, false, false, 7, 1600, '2026-09-16 19:22:10+00'
),
(
  'e1000000-0000-4000-8000-000000000082',
  'Defense contractors watch the succession clock',
  'business-defense-succession',
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  '<p>Lorem ipsum dolor sit amet. Business placeholder.</p>',
  'published',
  'b1000000-0000-4000-8000-000000000005',
  'f1000000-0000-4000-8000-000000000001'::uuid,
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=80',
  false, false, false, false, false, 6, 1500, '2026-09-16 20:17:32+00'
),
(
  'e1000000-0000-4000-8000-000000000083',
  'Satellite imagery shows overnight base activity surge',
  'science-satellite-base-activity',
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  '<p>Lorem ipsum dolor sit amet. Science placeholder.</p>',
  'published',
  'b1000000-0000-4000-8000-000000000006',
  'f1000000-0000-4000-8000-000000000001'::uuid,
  'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=900&q=80',
  false, false, false, false, false, 6, 1300, '2026-09-16 21:12:54+00'
),
(
  'e1000000-0000-4000-8000-000000000084',
  'Inside the capital dinner circuit after a shake-up',
  'lifestyle-capital-dinner-circuit',
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  '<p>Lorem ipsum dolor sit amet. Lifestyle placeholder.</p>',
  'published',
  'b1000000-0000-4000-8000-000000000007',
  'f1000000-0000-4000-8000-000000000001'::uuid,
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=80',
  false, false, false, false, false, 5, 1100, '2026-09-16 22:08:16+00'
),
(
  'e1000000-0000-4000-8000-000000000085',
  'Clinics prepare for a surge in stress-related visits',
  'health-stress-related-visits',
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  '<p>Lorem ipsum dolor sit amet. Health placeholder.</p>',
  'published',
  'b1000000-0000-4000-8000-000000000008',
  'f1000000-0000-4000-8000-000000000001'::uuid,
  'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=900&q=80',
  false, false, false, false, false, 5, 1050, '2026-09-16 23:03:38+00'
),
(
  'e1000000-0000-4000-8000-000000000086',
  'AI briefers flood the transition war rooms',
  'tech-ai-transition-war-rooms',
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  '<p>Lorem ipsum dolor sit amet. Tech & AI placeholder.</p>',
  'published',
  'b1000000-0000-4000-8000-000000000009',
  'f1000000-0000-4000-8000-000000000001'::uuid,
  'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=900&q=80',
  false, false, false, false, false, 6, 2100, '2026-09-16 23:59:00+00'
)
on conflict (slug) do update set
  title = excluded.title,
  excerpt = excluded.excerpt,
  body = excluded.body,
  status = excluded.status,
  category_id = excluded.category_id,
  author_id = excluded.author_id,
  featured_image_url = excluded.featured_image_url,
  is_featured = excluded.is_featured,
  is_premium = excluded.is_premium,
  is_video = excluded.is_video,
  is_podcast = excluded.is_podcast,
  is_popular = excluded.is_popular,
  reading_time_minutes = excluded.reading_time_minutes,
  view_count = excluded.view_count,
  published_at = excluded.published_at,
  updated_at = timezone('utc', now());

-- ---------------------------------------------------------------------------
-- post_tags
-- ---------------------------------------------------------------------------
insert into public.post_tags (post_id, tag_id) values
  ('e1000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000001'),
  ('e1000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000007'),
  ('e1000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000008'),
  ('e1000000-0000-4000-8000-000000000010', 'c1000000-0000-4000-8000-000000000005'),
  ('e1000000-0000-4000-8000-000000000011', 'c1000000-0000-4000-8000-000000000005'),
  ('e1000000-0000-4000-8000-000000000012', 'c1000000-0000-4000-8000-000000000005'),
  ('e1000000-0000-4000-8000-000000000013', 'c1000000-0000-4000-8000-000000000005'),
  ('e1000000-0000-4000-8000-000000000040', 'c1000000-0000-4000-8000-000000000004'),
  ('e1000000-0000-4000-8000-000000000041', 'c1000000-0000-4000-8000-000000000004'),
  ('e1000000-0000-4000-8000-000000000042', 'c1000000-0000-4000-8000-000000000004'),
  ('e1000000-0000-4000-8000-000000000043', 'c1000000-0000-4000-8000-000000000004'),
  ('e1000000-0000-4000-8000-000000000044', 'c1000000-0000-4000-8000-000000000004'),
  ('e1000000-0000-4000-8000-000000000060', 'c1000000-0000-4000-8000-000000000002'),
  ('e1000000-0000-4000-8000-000000000061', 'c1000000-0000-4000-8000-000000000002'),
  ('e1000000-0000-4000-8000-000000000062', 'c1000000-0000-4000-8000-000000000002'),
  ('e1000000-0000-4000-8000-000000000063', 'c1000000-0000-4000-8000-000000000002'),
  ('e1000000-0000-4000-8000-000000000064', 'c1000000-0000-4000-8000-000000000002'),
  ('e1000000-0000-4000-8000-000000000070', 'c1000000-0000-4000-8000-000000000006'),
  ('e1000000-0000-4000-8000-000000000071', 'c1000000-0000-4000-8000-000000000006'),
  ('e1000000-0000-4000-8000-000000000072', 'c1000000-0000-4000-8000-000000000006'),
  ('e1000000-0000-4000-8000-000000000073', 'c1000000-0000-4000-8000-000000000006'),
  ('e1000000-0000-4000-8000-000000000074', 'c1000000-0000-4000-8000-000000000006'),
  ('e1000000-0000-4000-8000-000000000050', 'c1000000-0000-4000-8000-00000000000a'),
  ('e1000000-0000-4000-8000-000000000051', 'c1000000-0000-4000-8000-00000000000a')
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Expand article bodies for single-post layout (6–12 paragraphs of HTML)
-- Kept here so re-seeds match the fuller live content. Runtime updates:
--   node scripts/expand-post-bodies.mjs
-- ---------------------------------------------------------------------------
update public.posts
set
  body = $fpn_full_body$
<p>Flash Point Television Network reporters spent the day tracking developments as officials offered their first unfiltered comments since the resignation landed on Capitol desks. The remarks, delivered without a prepared teleprompter script, immediately reset the tone of the afternoon briefing cycle.</p>
<p>According to people familiar with the sequence, the outgoing secretary chose to speak after weeks of private consultations with career staff and outside advisers. Those conversations, sources said, focused on the timing of any public statement and how much detail could be shared without compromising ongoing reviews.</p>
<p>Inside the department, the reaction was mixed but measured. Mid-level managers described a surge of internal messages seeking clarity on transition plans, while senior aides emphasized continuity of operations. Several desk officers said the priority overnight was keeping routine briefings on schedule.</p>
<p>On the Hill, lawmakers from both parties framed the moment as a test of institutional stamina rather than a single personality drama. Committee staffers noted that hearing calendars already under pressure would likely absorb additional oversight requests in the coming weeks.</p>
<p>Outside analysts pointed to three questions that will dominate the next news cycle: who assumes acting authority, which pending decisions freeze until a successor is confirmed, and how allied counterparts interpret the change. Each carries implications for budget negotiations and overseas coordination.</p>
<p>Veterans of previous transitions cautioned against reading the first public comments as a complete narrative. "Early statements are often designed to stabilize markets and messaging," one former official told FPTN. "The fuller record tends to emerge in documents released later."</p>
<p>Meanwhile, advocacy groups and service organizations pressed for clearer timelines on personnel decisions that affect families and contractors. Their statements, circulated late in the day, urged the White House and department leadership to publish a written transition outline.</p>
<p>Flash Point Live will continue covering the fallout with extended analysis, including reactions from statehouse leaders and international desks. Readers can follow updates on FPTN digital channels and in tonight's broadcast window.</p>
<p>As night fell in Washington, aides were still refining talking points for morning shows. The working consensus among reporters who covered the briefings is that the story has moved from rumor to record — and that the next chapter will be written in confirmation hearings and paper trails.</p>
<p>For now, the public has a clearer sense of why the resignation unfolded when it did, even as many operational details remain under review. FPTN will update this report as additional documents and on-the-record responses become available.</p>
$fpn_full_body$,
  updated_at = timezone('utc', now())
where status = 'published';


-- Assign FlashPoint YouTube videos to video posts
-- Channel: https://www.youtube.com/channel/UCXheOYtaoPyYZ4aOnoIVpCQ
update public.posts set video_url = 'https://www.youtube.com/watch?v=una0oMq_oco'
  where slug in ('must-watch-01', 'outgoing-army-secretary-breaks-silence');
update public.posts set video_url = 'https://www.youtube.com/watch?v=-v4tTVtNW4M' where slug = 'must-watch-02';
update public.posts set video_url = 'https://www.youtube.com/watch?v=MXPa62I9wiY' where slug = 'must-watch-03';
update public.posts set video_url = 'https://www.youtube.com/watch?v=rn3nVESk9ag' where slug = 'must-watch-04';
update public.posts set video_url = 'https://www.youtube.com/watch?v=N8IYeaDUJ9I' where slug = 'must-watch-05';
update public.posts set video_url = 'https://www.youtube.com/watch?v=Jhz623HVN3A'
  where is_video = true and coalesce(video_url, '') = '' and slug like 'elections-%';
update public.posts set video_url = 'https://www.youtube.com/watch?v=ro3XhGvcag4'
  where is_video = true and coalesce(video_url, '') = '';
update public.posts set video_url = 'https://www.youtube.com/watch?v=FN-Pec2eVy4'
  where is_podcast = true and coalesce(video_url, '') = '';

-- Video / Podcast: hide featured image by default (player takes the hero slot)
update public.posts
set show_featured_image = false
where is_video = true
   or is_podcast = true
   or category_id = 'b1000000-0000-4000-8000-00000000000b';

-- Sample SEO for the flagship story
update public.posts set
  seo_title = 'Army secretary breaks silence | FPTN',
  seo_description = 'First unfiltered comments after the resignation landed on Capitol desks. Full Flash Point Television Network report.',
  seo_keywords = 'army, resignation, capitol, flashpoint'
where slug = 'outgoing-army-secretary-breaks-silence';
