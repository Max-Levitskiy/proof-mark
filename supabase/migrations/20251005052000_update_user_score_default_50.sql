-- Migration to change user_score to start at 50 (neutral) instead of 0
-- New articles will have user_score = 50
-- True vote = +1, Fake vote = -1

-- Step 1: Update the calculate_user_score function to add 50 as base
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

  -- Calculate total score: 50 + (true_votes - fake_votes)
  score := base_score + (article_true_count + comment_true_count) - (article_fake_count + comment_fake_count);

  return score;
end;
$$;

-- Step 2: Change default value for user_score column to 50
alter table public.news_articles
  alter column user_score set default 50;

-- Step 3: Update existing articles to have score = 50 + current_score
update public.news_articles
set user_score = 50 + user_score;

-- Step 4: Re-calculate all scores with new base of 50
update public.news_articles
set user_score = calculate_user_score(id);
