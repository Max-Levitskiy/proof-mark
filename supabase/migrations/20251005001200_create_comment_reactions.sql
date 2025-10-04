-- Create comment_reactions table
create table public.comment_reactions (
  id uuid default gen_random_uuid() primary key,
  comment_id uuid references public.article_comments(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  reaction_type reaction_type not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  -- Ensure one reaction per user per comment
  unique(comment_id, user_id)
);

-- Enable Row Level Security
alter table public.comment_reactions enable row level security;

-- RLS Policies
create policy "Anyone can view comment reactions"
  on public.comment_reactions for select
  using (true);

create policy "Authenticated users can create comment reactions"
  on public.comment_reactions for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own comment reactions"
  on public.comment_reactions for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own comment reactions"
  on public.comment_reactions for delete
  to authenticated
  using (auth.uid() = user_id);

-- Create indexes
create index comment_reactions_comment_id_idx on public.comment_reactions(comment_id);
create index comment_reactions_user_id_idx on public.comment_reactions(user_id);

-- Add updated_at trigger
create trigger on_comment_reaction_updated
  before update on public.comment_reactions
  for each row execute procedure public.handle_updated_at();

-- Function to update comment like/dislike counts
create or replace function public.update_comment_reaction_counts()
returns trigger as $$
begin
  -- Recalculate counts for the affected comment
  update public.article_comments
  set
    like_count = (
      select count(*)
      from public.comment_reactions
      where comment_id = coalesce(new.comment_id, old.comment_id)
        and reaction_type = 'like'
    ),
    dislike_count = (
      select count(*)
      from public.comment_reactions
      where comment_id = coalesce(new.comment_id, old.comment_id)
        and reaction_type = 'dislike'
    )
  where id = coalesce(new.comment_id, old.comment_id);

  return coalesce(new, old);
end;
$$ language plpgsql security definer;

-- Triggers to update counts on insert/update/delete
create trigger on_comment_reaction_insert
  after insert on public.comment_reactions
  for each row execute procedure public.update_comment_reaction_counts();

create trigger on_comment_reaction_update
  after update on public.comment_reactions
  for each row execute procedure public.update_comment_reaction_counts();

create trigger on_comment_reaction_delete
  after delete on public.comment_reactions
  for each row execute procedure public.update_comment_reaction_counts();
