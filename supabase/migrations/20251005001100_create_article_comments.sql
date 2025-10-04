-- Create article_comments table with nested structure
create table public.article_comments (
  id uuid default gen_random_uuid() primary key,
  article_id uuid references public.news_articles(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  parent_comment_id uuid references public.article_comments(id) on delete cascade,
  content text not null,
  like_count integer default 0 not null,
  dislike_count integer default 0 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.article_comments enable row level security;

-- RLS Policies
create policy "Anyone can view comments"
  on public.article_comments for select
  using (true);

create policy "Authenticated users can create comments"
  on public.article_comments for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own comments"
  on public.article_comments for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own comments"
  on public.article_comments for delete
  to authenticated
  using (auth.uid() = user_id);

-- Create indexes for faster queries
create index article_comments_article_id_idx on public.article_comments(article_id);
create index article_comments_user_id_idx on public.article_comments(user_id);
create index article_comments_parent_comment_id_idx on public.article_comments(parent_comment_id);

-- Add updated_at trigger
create trigger on_article_comment_updated
  before update on public.article_comments
  for each row execute procedure public.handle_updated_at();
