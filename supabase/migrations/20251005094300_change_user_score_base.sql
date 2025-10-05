-- ============================================================================
-- CHANGE USER_SCORE BASE FROM 50 TO 0
-- ============================================================================
-- This migration changes the user_score system to start from 0 instead of 50
-- 
-- What this migration does:
-- 1. Updates calculate_user_score function to use base 0 instead of 50
-- 2. Changes the default value for new articles to 0
-- 3. Migrates existing data by subtracting 50 from all user_score values
-- 4. Ensures this migration is idempotent (safe to run multiple times)
--
-- After this migration:
-- - New articles will start with user_score = 0 (neutral)
-- - 'true' reactions will increase the score (+1)
-- - 'fake' reactions will decrease the score (-1)
-- - Scores can go negative
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. UPDATE calculate_user_score FUNCTION TO USE BASE 0
-- ----------------------------------------------------------------------------
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
  base_score integer := 0; -- Changed from 50 to 0
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

  -- Calculate total score: 0 + (article_true + comment_true) - (article_fake + comment_fake)
  score := base_score + (article_true_count + comment_true_count) - (article_fake_count + comment_fake_count);

  return score;
end;
$$;

comment on function calculate_user_score(uuid) is 'Calculates user engagement score from true/fake reactions (base 0)';

-- ----------------------------------------------------------------------------
-- 2. CHANGE DEFAULT VALUE FOR NEW ARTICLES TO 0
-- ----------------------------------------------------------------------------
alter table public.news_articles
  alter column user_score set default 0;

comment on column public.news_articles.user_score is 'Community engagement score starting from 0 (can be negative)';

-- ----------------------------------------------------------------------------
-- 3. MIGRATE EXISTING DATA (IDEMPOTENT)
-- ----------------------------------------------------------------------------
-- This block checks if migration is needed before running
-- It's safe to run multiple times

do $$
declare
  v_avg_user_score numeric;
  v_max_user_score integer;
  v_min_user_score integer;
  v_count_above_40 integer;
  v_total_count integer;
  v_needs_migration boolean := false;
begin
  -- Get statistics about current user_score values
  select 
    avg(user_score),
    max(user_score),
    min(user_score),
    count(*) filter (where user_score >= 40),
    count(*)
  into 
    v_avg_user_score,
    v_max_user_score,
    v_min_user_score,
    v_count_above_40,
    v_total_count
  from public.news_articles;
  
  -- Determine if migration is needed
  -- If most scores are around 50 (the old default), we need to migrate
  -- We check if average is close to 50 and many values are >= 40
  if v_total_count > 0 and v_avg_user_score >= 35 and v_count_above_40::numeric / v_total_count::numeric > 0.5 then
    v_needs_migration := true;
    raise notice 'User score migration needed. Avg: %, Max: %, Min: %, Count >= 40: %/%', 
      v_avg_user_score, v_max_user_score, v_min_user_score, v_count_above_40, v_total_count;
  else
    raise notice 'User score migration not needed. Avg: %, Max: %, Min: %, Count >= 40: %/%', 
      v_avg_user_score, v_max_user_score, v_min_user_score, v_count_above_40, v_total_count;
  end if;
  
  -- Only migrate if needed
  if v_needs_migration then
    raise notice 'Starting user_score migration: subtracting 50 from all values...';
    
    -- Subtract 50 from all existing user_score values
    update public.news_articles
    set user_score = user_score - 50
    where user_score is not null;
    
    raise notice 'User_score migration completed. Updated % articles.', v_total_count;
    
    -- Recalculate trust_scores for all articles to reflect the new user_scores
    -- This happens automatically via the trigger, but we can force it with an update
    update public.news_articles
    set updated_at = updated_at
    where true;
    
    raise notice 'Trust scores recalculated for all articles.';
  end if;
end $$;

-- ----------------------------------------------------------------------------
-- 4. VERIFICATION
-- ----------------------------------------------------------------------------
-- After migration, verify the results
do $$
declare
  v_stats record;
begin
  select 
    count(*) as total_articles,
    avg(user_score) as avg_score,
    max(user_score) as max_score,
    min(user_score) as min_score,
    count(*) filter (where user_score = 0) as zero_scores,
    count(*) filter (where user_score > 0) as positive_scores,
    count(*) filter (where user_score < 0) as negative_scores
  into v_stats
  from public.news_articles;
  
  raise notice 'Post-migration statistics:';
  raise notice '  Total articles: %', v_stats.total_articles;
  raise notice '  Average user_score: %', round(v_stats.avg_score, 2);
  raise notice '  Max user_score: %', v_stats.max_score;
  raise notice '  Min user_score: %', v_stats.min_score;
  raise notice '  Zero scores: %', v_stats.zero_scores;
  raise notice '  Positive scores: %', v_stats.positive_scores;
  raise notice '  Negative scores: %', v_stats.negative_scores;
end $$;
