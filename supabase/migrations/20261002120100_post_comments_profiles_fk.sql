-- PostgREST embed: post_comments.author → profiles (schema cache relationship).

alter table public.post_comments
  drop constraint if exists post_comments_user_id_fkey;

alter table public.post_comments
  add constraint post_comments_user_id_fkey
  foreign key (user_id) references public.profiles (id) on delete cascade;
