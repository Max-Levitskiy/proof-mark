-- Migration to include comment reactions in article user_score calculation
-- This makes user_score count both direct article reactions AND nested comment reactions

-- Step 1: Update calculate_user_score function to include comment reactions
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

  -- Calculate total score: (article_true + comment_true) - (article_fake + comment_fake)
  score := (article_true_count + comment_true_count) - (article_fake_count + comment_fake_count);

  return score;
end;
$$;

-- Step 2: Create trigger function to update article user_score when comment reactions change
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

-- Step 3: Create triggers on comment_reactions for INSERT, UPDATE, DELETE
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

-- Step 4: Re-initialize user_score for all existing articles with new calculation
update public.news_articles
set user_score = calculate_user_score(id);
