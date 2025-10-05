create table public.news_articles (
  id uuid not null default gen_random_uuid (),
  image text null,
  headline text not null,
  description text null,
  category jsonb not null default '[]'::jsonb,
  trust_score integer null,
  trust_explanation text null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  content text null,
  author jsonb null,
  location text null,
  published_at timestamp with time zone null,
  read_time text null,
  source jsonb null,
  sources_verified integer null default 0,
  flags jsonb null default '[]'::jsonb,
  detailed_analysis jsonb null,
  original_link text null,
  metadata jsonb null,
  news_id text null,
  constraint news_articles_pkey primary key (id),
  constraint news_articles_trust_score_check check (
    (
      (trust_score >= 0)
      and (trust_score <= 100)
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_news_articles_published_at on public.news_articles using btree (published_at desc) TABLESPACE pg_default;

create index IF not exists idx_news_articles_author on public.news_articles using btree (author) TABLESPACE pg_default;

create index IF not exists idx_news_articles_trust_score on public.news_articles using btree (trust_score desc) TABLESPACE pg_default;

create index IF not exists idx_news_articles_category on public.news_articles using gin (category) TABLESPACE pg_default;

create index IF not exists idx_news_articles_created_at on public.news_articles using btree (created_at desc) TABLESPACE pg_default;

create trigger set_updated_at BEFORE
update on news_articles for EACH row
execute FUNCTION handle_updated_at ();

-- Create enum for reaction types
create type reaction_type as enum ('like', 'dislike');

-- Create article_reactions table
create table public.article_reactions (
  id uuid default gen_random_uuid() primary key,
  article_id uuid references public.news_articles(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  reaction_type reaction_type not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  -- Ensure one reaction per user per article
  unique(article_id, user_id)
);

-- Enable Row Level Security
alter table public.article_reactions enable row level security;

-- RLS Policies
create policy "Anyone can view article reactions"
  on public.article_reactions for select
  using (true);

create policy "Authenticated users can create reactions"
  on public.article_reactions for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own reactions"
  on public.article_reactions for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own reactions"
  on public.article_reactions for delete
  to authenticated
  using (auth.uid() = user_id);

-- Create index for faster lookups
create index article_reactions_article_id_idx on public.article_reactions(article_id);
create index article_reactions_user_id_idx on public.article_reactions(user_id);

-- Add updated_at trigger
create trigger on_article_reaction_updated
  before update on public.article_reactions
  for each row execute procedure public.handle_updated_at();
