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
  sort_order: number;
  status: ClassicProgramStatus;
  source_url: string | null;
  created_at?: string;
  updated_at?: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
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
};

export type HomePayload = {
  categories: Category[];
  liveEvent: EventItem | null;
  featured: Post | null;
  secondary: Post[];
  podcasts: Post[];
  grid: Post[];
  latest: Post[];
  mustWatch: Post[];
  elections: Post[];
  exclusives: Post[];
  popular: Post[];
};
