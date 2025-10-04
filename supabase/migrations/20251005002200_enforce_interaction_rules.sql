-- Remove UPDATE and DELETE policies for reactions (reactions are permanent)
drop policy if exists "Users can update their own reactions" on public.article_reactions;
drop policy if exists "Users can delete their own reactions" on public.article_reactions;
drop policy if exists "Users can update their own comment reactions" on public.comment_reactions;
drop policy if exists "Users can delete their own comment reactions" on public.comment_reactions;

-- Remove update triggers for reactions (no longer needed)
drop trigger if exists on_article_reaction_updated on public.article_reactions;
drop trigger if exists on_comment_reaction_updated on public.comment_reactions;

-- Function to prevent reacting to own comment
create or replace function public.prevent_self_comment_reaction()
returns trigger as $$
declare
  comment_author_id uuid;
begin
  -- Get the comment's author
  select user_id into comment_author_id
  from public.article_comments
  where id = new.comment_id;

  -- Prevent users from reacting to their own comments
  if comment_author_id = new.user_id then
    raise exception 'You cannot react to your own comment';
  end if;

  return new;
end;
$$ language plpgsql security definer;

-- Function to prevent multiple comments per entity
create or replace function public.prevent_duplicate_comments()
returns trigger as $$
declare
  existing_comment_count integer;
begin
  -- Check if user already has a comment for this entity
  if new.parent_comment_id is null then
    -- Top-level comment: check article
    select count(*) into existing_comment_count
    from public.article_comments
    where article_id = new.article_id
      and user_id = new.user_id
      and parent_comment_id is null;
  else
    -- Reply: check parent comment
    select count(*) into existing_comment_count
    from public.article_comments
    where parent_comment_id = new.parent_comment_id
      and user_id = new.user_id;
  end if;

  if existing_comment_count > 0 then
    raise exception 'You have already commented on this entity';
  end if;

  return new;
end;
$$ language plpgsql security definer;

-- Function to prevent commenting on own comment
create or replace function public.prevent_self_comment_reply()
returns trigger as $$
declare
  parent_comment_author_id uuid;
begin
  -- Only check if this is a reply (has parent_comment_id)
  if new.parent_comment_id is not null then
    -- Get the parent comment's author
    select user_id into parent_comment_author_id
    from public.article_comments
    where id = new.parent_comment_id;

    -- Prevent users from replying to their own comments
    if parent_comment_author_id = new.user_id then
      raise exception 'You cannot reply to your own comment';
    end if;
  end if;

  return new;
end;
$$ language plpgsql security definer;

-- Apply triggers
create trigger prevent_self_comment_reaction_trigger
  before insert on public.comment_reactions
  for each row execute procedure public.prevent_self_comment_reaction();

create trigger prevent_duplicate_comments_trigger
  before insert on public.article_comments
  for each row execute procedure public.prevent_duplicate_comments();

create trigger prevent_self_comment_reply_trigger
  before insert on public.article_comments
  for each row execute procedure public.prevent_self_comment_reply();

