export type UserRole =
  | "superadmin"
  | "admin"
  | "editor"
  | "journalist"
  | "subscriber"
  | "guest";

export type PostStatus =
  | "draft"
  | "pending_review"
  | "scheduled"
  | "published"
  | "archived"
  | "trash";

export type EventFormat = "video" | "text";

export type HelpCenterSubmission = {
  id: string;
  created_at: string;
  email: string;
  help_area: string;
  journalism_issue: string | null;
  subject: string;
  description: string;
  attachment_paths: string[];
  read_at: string | null;
};

export type ClassicProgramStatus = "draft" | "published" | "archived";

export type ClassicProgramsSortMode =
  | "manual"
  | "a_z"
  | "z_a"
  | "random"
  | "newest";

export type ClassicProgram = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  description: string | null;
  body: string | null;
  featured_image_url: string | null;
  external_url: string | null;
  schedule_note: string | null;
  /** Short badge label, e.g. Comedy */
  genre?: string | null;
  /** Modal subtitle, e.g. Family comedy · Classic television */
  genres_label?: string | null;
  /** Compact card line, e.g. Mon–Fri · 3:00 PM ET */
  schedule_line?: string | null;
  sort_order: number;
  status: ClassicProgramStatus;
  source_url: string | null;
  created_at?: string;
  updated_at?: string;
};

export type MinistryProgramStatus = ClassicProgramStatus;
export type MinistryProgramsSortMode = ClassicProgramsSortMode;
export type MinistryProgram = ClassicProgram & {
  status: MinistryProgramStatus;
  /** Host / speaker line under the title (FPTN Shows cards). */
  host_name?: string | null;
  /** Multi-line air times for the public grid (newline-separated). */
  schedule_detail?: string | null;
};

export type ScheduleDisplayMode = "dynamic" | "pdf" | "both";

/** Public layout for /schedule-programs dynamic grid. */
export type ScheduleLayoutTemplate = "template_1" | "template_2";

export type ScheduleEntry = {
  id: string;
  air_date: string;
  start_time: string;
  end_time: string | null;
  title: string;
  description: string | null;
  category: string | null;
  color: string | null;
  created_at?: string;
  updated_at?: string;
};

export type SchedulePdf = {
  id: string;
  year: number;
  month: number;
  title: string;
  pdf_url: string;
  created_at?: string;
  updated_at?: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  parent_id: string | null;
};

export type Tag = {
  id: string;
  name: string;
  slug: string;
};

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  role: UserRole;
  avatar_url: string | null;
};

export type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string | null;
  status: PostStatus;
  category_id: string | null;
  author_id: string | null;
  featured_image_url: string | null;
  video_url: string | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image_url: string | null;
  is_featured: boolean;
  is_premium: boolean;
  is_video: boolean;
  is_podcast: boolean;
  is_popular?: boolean;
  /**
   * Article-page hero only. When false, NewsArticleView hides the hero image
   * and may place the video player there. Cards / grids / SEO never hide the
   * image for this flag — they use featured_image_url, then og_image_url,
   * then a YouTube thumbnail from video_url.
   */
  show_featured_image?: boolean;
  /**
   * Home first section pin: 1 = large left, 2–3 = stacked right.
   * Null = not pinned (chronological Latest fill).
   */
  home_first_slot?: 1 | 2 | 3 | null;
  reading_time_minutes: number;
  view_count: number;
  published_at: string | null;
  category?: Category | null;
  author?: Profile | null;
};

export type EventItem = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  format: EventFormat;
  video_url: string | null;
  body: string | null;
  host_name: string | null;
  starts_at: string | null;
  ends_at: string | null;
  is_live: boolean;
  show_on_home: boolean;
  thumbnail_url: string | null;
  /** Optional CTA URL for home orange bar / title click (new tab). */
  external_url: string | null;
};

export type HomePayload = {
  categories: Category[];
  liveEvent: EventItem | null;
  tickerEvents: EventItem[];
  /** Next closest upcoming (or live) event for the home orange bar. */
  nextUpcomingEvent: EventItem | null;
  /** Newest published story — hero main image (Latest News). */
  featured: Post | null;
  /** Next two newest — side stories beside the hero. */
  secondary: Post[];
  podcasts: Post[];
  /** @deprecated Prefer politics + world. Kept as politics∪world for callers. */
  grid: Post[];
  /** Continuación del feed Latest (después de hero + 2 sides); con ellos ≈ 8. */
  latest: Post[];
  /** Últimas 4 de Politics. */
  politics: Post[];
  /** Últimas 4 de World. */
  world: Post[];
  mustWatch: Post[];
  elections: Post[];
  exclusives: Post[];
  popular: Post[];
};
