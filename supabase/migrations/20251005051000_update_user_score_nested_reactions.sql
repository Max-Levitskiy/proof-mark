-- Migration to add user_score column and include both article and comment reactions
-- Starting score: 50 (neutral), True vote = +1, Fake vote = -1

-- Step 1: Add user_score column to news_articles with default 50
alter table public.news_articles
  add column if not exists user_score integer not null default 50;

-- Create index for user_score for better query performance
create index if not exists idx_news_articles_user_score
  on public.news_articles using btree (user_score desc);

-- Step 2: Update reaction_type enum to use 'true' and 'fake' (only if needed)
do $$
begin
  -- Check if the enum needs to be updated
  if exists (
    select 1
    from pg_enum e
    join pg_type t on e.enumtypid = t.oid
    where t.typname = 'reaction_type' and e.enumlabel = 'like'
  ) then
    -- Create new enum type
    create type reaction_type_new as enum ('true', 'fake');

    -- Update article_reactions table
    alter table public.article_reactions alter column reaction_type type text;
    update public.article_reactions set reaction_type = 'true' where reaction_type = 'like';
    update public.article_reactions set reaction_type = 'fake' where reaction_type = 'dislike';
    alter table public.article_reactions
      alter column reaction_type type reaction_type_new
      using reaction_type::reaction_type_new;

    -- Update comment_reactions table
    alter table public.comment_reactions alter column reaction_type type text;
    update public.comment_reactions set reaction_type = 'true' where reaction_type = 'like';
    update public.comment_reactions set reaction_type = 'fake' where reaction_type = 'dislike';
    alter table public.comment_reactions
      alter column reaction_type type reaction_type_new
      using reaction_type::reaction_type_new;

    -- Drop old enum and rename new one
    drop type reaction_type;
    alter type reaction_type_new rename to reaction_type;
  end if;
end $$;

-- Step 3: Create calculate_user_score function with nested reactions and base score of 50
create or replace function calculate_user_score(article_uuid uuid)
returns integer
language plpgsql
as $$
declare
  article_true_count integer;
  article_fake_count integer;
  comment_true_count integer;
  comment_fake_count integer;
  score integer;
  base_score integer := 50; -- Start at 50 (neutral)
begin
  -- Count 'true' reactions directly on the article
  select count(*) into article_true_count
  from public.article_reactions
  where article_id = article_uuid and reaction_type = 'true';

  -- Count 'fake' reactions directly on the article
  select count(*) into article_fake_count
  from public.article_reactions
  where article_id = article_uuid and reaction_type = 'fake';

  -- Count 'true' reactions on comments belonging to this article
  select count(*) into comment_true_count
  from public.comment_reactions cr
  inner join public.article_comments ac on cr.comment_id = ac.id
  where ac.article_id = article_uuid and cr.reaction_type = 'true';

  -- Count 'fake' reactions on comments belonging to this article
  select count(*) into comment_fake_count
  from public.comment_reactions cr
  inner join public.article_comments ac on cr.comment_id = ac.id
  where ac.article_id = article_uuid and cr.reaction_type = 'fake';

  -- Calculate total score: 50 + (article_true + comment_true) - (article_fake + comment_fake)
  score := base_score + (article_true_count + comment_true_count) - (article_fake_count + comment_fake_count);

  return score;
end;
$$;

-- Step 4: Create trigger function to update article user_score when article reactions change
create or replace function update_article_user_score()
returns trigger
language plpgsql
as $$
declare
  affected_article_id uuid;
begin
  -- Determine which article was affected
  if TG_OP = 'DELETE' then
    affected_article_id := OLD.article_id;
  else
    affected_article_id := NEW.article_id;
  end if;

  -- Update the user_score for the affected article
  update public.news_articles
  set user_score = calculate_user_score(affected_article_id)
  where id = affected_article_id;

  -- Return appropriate value based on operation
  if TG_OP = 'DELETE' then
    return OLD;
  else
    return NEW;
  end if;
end;
$$;

-- Step 5: Create triggers on article_reactions for INSERT, UPDATE, DELETE
drop trigger if exists trigger_update_user_score_on_insert on public.article_reactions;
create trigger trigger_update_user_score_on_insert
  after insert on public.article_reactions
  for each row
  execute function update_article_user_score();

drop trigger if exists trigger_update_user_score_on_update on public.article_reactions;
create trigger trigger_update_user_score_on_update
  after update on public.article_reactions
  for each row
  execute function update_article_user_score();

drop trigger if exists trigger_update_user_score_on_delete on public.article_reactions;
create trigger trigger_update_user_score_on_delete
  after delete on public.article_reactions
  for each row
  execute function update_article_user_score();

-- Step 6: Create trigger function to update article user_score when comment reactions change
create or replace function update_article_user_score_from_comment()
returns trigger
language plpgsql
as $$
declare
  affected_article_id uuid;
  affected_comment_id uuid;
begin
  -- Determine which comment was affected
  if TG_OP = 'DELETE' then
    affected_comment_id := OLD.comment_id;
  else
    affected_comment_id := NEW.comment_id;
  end if;

  -- Find the article_id for this comment
  select article_id into affected_article_id
  from public.article_comments
  where id = affected_comment_id;

  -- Update the user_score for the affected article
  if affected_article_id is not null then
    update public.news_articles
    set user_score = calculate_user_score(affected_article_id)
    where id = affected_article_id;
  end if;

  -- Return appropriate value based on operation
  if TG_OP = 'DELETE' then
    return OLD;
  else
    return NEW;
  end if;
end;
$$;

-- Step 7: Create triggers on comment_reactions for INSERT, UPDATE, DELETE
drop trigger if exists trigger_update_user_score_from_comment_insert on public.comment_reactions;
create trigger trigger_update_user_score_from_comment_insert
  after insert on public.comment_reactions
  for each row
  execute function update_article_user_score_from_comment();

drop trigger if exists trigger_update_user_score_from_comment_update on public.comment_reactions;
create trigger trigger_update_user_score_from_comment_update
  after update on public.comment_reactions
  for each row
  execute function update_article_user_score_from_comment();

drop trigger if exists trigger_update_user_score_from_comment_delete on public.comment_reactions;
create trigger trigger_update_user_score_from_comment_delete
  after delete on public.comment_reactions
  for each row
  execute function update_article_user_score_from_comment();

-- Step 8: Initialize user_score for all existing articles
update public.news_articles
set user_score = calculate_user_score(id);
