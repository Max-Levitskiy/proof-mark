-- ============================================================================
-- COMPREHENSIVE TRUST SCORE SYSTEM
-- ============================================================================
-- IMPORTANT: This migration integrates with the existing user_score system
-- that was created in migration 20251005051000_update_user_score_nested_reactions.sql
--
-- What this migration DOES:
-- 1. Creates sources table for tracking source reliability
-- 2. Adds score component columns (factual_accuracy, source_reliability)
-- 3. Adds configurable weights for trust_score calculation
-- 4. Creates automatic trust_score recalculation triggers
-- 5. Uses the EXISTING user_score system (already handles reactions/comments)
--
-- What this migration DOES NOT DO:
-- - Does NOT create user_score column (already exists)
-- - Does NOT create calculate_user_score function (already exists)
-- - Does NOT create user_score triggers (already exist)
--
-- Note: Uses 'true'/'fake' reactions (not 'like'/'dislike')
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. CREATE SOURCES TABLE
-- ----------------------------------------------------------------------------
create table if not exists public.sources (
  id uuid default gen_random_uuid() primary key,
  uri text not null unique,  -- The URI that identifies this source
  name text not null,
  reliability_score integer default 50 check (reliability_score >= 0 and reliability_score <= 100),
  description text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index if not exists idx_sources_uri on public.sources(uri);
create index if not exists idx_sources_reliability_score on public.sources(reliability_score desc);

comment on table public.sources is 'Tracks news sources and their reliability scores';
comment on column public.sources.uri is 'Unique identifier for the source (e.g., domain name, RSS feed URL)';
comment on column public.sources.reliability_score is 'Source reliability score (0-100, 50=neutral)';

-- ----------------------------------------------------------------------------
-- 2. ADD SCORE COMPONENT COLUMNS TO NEWS_ARTICLES
-- ----------------------------------------------------------------------------
-- Note: user_score already exists from 20251005051000_update_user_score_nested_reactions.sql
-- We only add the NEW columns here
alter table public.news_articles
  add column if not exists factual_accuracy_score integer default 50 
    check (factual_accuracy_score >= 0 and factual_accuracy_score <= 100),
  add column if not exists source_reliability_score integer default 50 
    check (source_reliability_score >= 0 and source_reliability_score <= 100),
  add column if not exists trust_score_weights jsonb default '{
    "factual_accuracy": 0.35,
    "source_reliability": 0.30,
    "confidence_level": 0.20,
    "user_score": 0.15
  }'::jsonb;

-- Add indexes for performance
create index if not exists idx_news_articles_factual_accuracy on public.news_articles(factual_accuracy_score);
create index if not exists idx_news_articles_source_reliability on public.news_articles(source_reliability_score);
-- Note: idx_news_articles_user_score already created in 20251005051000

comment on column public.news_articles.factual_accuracy_score is 'Externally verified factual accuracy (0-100)';
comment on column public.news_articles.source_reliability_score is 'Derived from sources table (0-100)';
comment on column public.news_articles.user_score is 'Community engagement score (can be negative, starts at 0)';
comment on column public.news_articles.trust_score_weights is 'Configurable weights for trust score calculation';

-- ----------------------------------------------------------------------------
-- 3. FUNCTION TO CALCULATE TRUST SCORE
-- ----------------------------------------------------------------------------
create or replace function calculate_trust_score(
  p_factual_accuracy integer,
  p_source_reliability integer,
  p_confidence_level integer,
  p_user_score integer,
  p_weights jsonb
) returns integer as $$
declare
  v_factual_weight numeric;
  v_source_weight numeric;
  v_confidence_weight numeric;
  v_user_weight numeric;
  v_weighted_sum numeric;
  v_normalized_user_score numeric;
  v_final_score integer;
begin
  -- Extract weights from jsonb
  v_factual_weight := (p_weights->>'factual_accuracy')::numeric;
  v_source_weight := (p_weights->>'source_reliability')::numeric;
  v_confidence_weight := (p_weights->>'confidence_level')::numeric;
  v_user_weight := (p_weights->>'user_score')::numeric;
  
  -- Normalize user_score to 0-100 range
  -- User score starts at 0 and can go negative with 'fake' reactions
  -- We map [-100, 100] to [0, 100] for weighting purposes
  -- Formula: normalized = (user_score + 100) / 2
  -- Note: After migration 20251005094300, user_score will be 0-based (not 50-based)
  v_normalized_user_score := greatest(0, least(100, (p_user_score + 100.0) / 2.0));
  
  -- Calculate weighted sum
  v_weighted_sum := 
    (p_factual_accuracy * v_factual_weight) +
    (p_source_reliability * v_source_weight) +
    (p_confidence_level * v_confidence_weight) +
    (v_normalized_user_score * v_user_weight);
  
  -- Round to integer and ensure it's in [0, 100] range
  v_final_score := round(v_weighted_sum)::integer;
  v_final_score := greatest(0, least(100, v_final_score));
  
  return v_final_score;
end;
$$ language plpgsql immutable;

comment on function calculate_trust_score(integer, integer, integer, integer, jsonb) is 'Calculates weighted trust score from component scores';

-- ----------------------------------------------------------------------------
-- 4. FUNCTION TO UPDATE ARTICLE TRUST SCORE
-- ----------------------------------------------------------------------------
create or replace function update_article_trust_score(p_article_id uuid)
returns void as $$
declare
  v_article record;
  v_new_trust_score integer;
begin
  -- Get current article scores
  select 
    factual_accuracy_score,
    source_reliability_score,
    confidence_level,
    user_score,
    trust_score_weights
  into v_article
  from public.news_articles
  where id = p_article_id;
  
  if not found then
    return;
  end if;
  
  -- Calculate new trust score
  v_new_trust_score := calculate_trust_score(
    coalesce(v_article.factual_accuracy_score, 50),
    coalesce(v_article.source_reliability_score, 50),
    coalesce(v_article.confidence_level, 0),
    coalesce(v_article.user_score, 0),
    v_article.trust_score_weights
  );
  
  -- Update the article
  update public.news_articles
  set trust_score = v_new_trust_score
  where id = p_article_id;
end;
$$ language plpgsql;

comment on function update_article_trust_score(uuid) is 'Recalculates and updates trust score for a specific article';

-- ----------------------------------------------------------------------------
-- 5. TRIGGER TO AUTO-UPDATE TRUST SCORE ON COMPONENT CHANGES
-- ----------------------------------------------------------------------------
create or replace function trigger_update_trust_score()
returns trigger as $$
begin
  -- Only recalculate if relevant columns changed
  if (TG_OP = 'UPDATE' and (
    old.factual_accuracy_score is distinct from new.factual_accuracy_score or
    old.source_reliability_score is distinct from new.source_reliability_score or
    old.confidence_level is distinct from new.confidence_level or
    old.user_score is distinct from new.user_score or
    old.trust_score_weights is distinct from new.trust_score_weights
  )) or TG_OP = 'INSERT' then
    
    new.trust_score := calculate_trust_score(
      coalesce(new.factual_accuracy_score, 50),
      coalesce(new.source_reliability_score, 50),
      coalesce(new.confidence_level, 0),
      coalesce(new.user_score, 0),
      new.trust_score_weights
    );
  end if;
  
  return new;
end;
$$ language plpgsql;

drop trigger if exists auto_update_trust_score on public.news_articles;
create trigger auto_update_trust_score
  before insert or update on public.news_articles
  for each row
  execute function trigger_update_trust_score();

comment on function trigger_update_trust_score() is 'Automatically recalculates trust_score when component scores change';

-- ----------------------------------------------------------------------------
-- 6. FUNCTION TO UPDATE SOURCE RELIABILITY SCORE IN ARTICLES
-- ----------------------------------------------------------------------------
create or replace function update_articles_source_reliability(p_source_uri text, p_new_reliability integer)
returns void as $$
begin
  -- Update all articles that reference this source
  update public.news_articles
  set source_reliability_score = p_new_reliability
  where source::text like '%' || p_source_uri || '%';
  
  -- Note: trust_score will be automatically recalculated by the trigger
end;
$$ language plpgsql;

comment on function update_articles_source_reliability(text, integer) is 'Updates source_reliability_score for all articles using a specific source';

-- ----------------------------------------------------------------------------
-- 7. TRIGGER ON SOURCES TABLE TO UPDATE RELATED ARTICLES
-- ----------------------------------------------------------------------------
create or replace function trigger_update_articles_on_source_change()
returns trigger as $$
begin
  if TG_OP = 'UPDATE' and old.reliability_score is distinct from new.reliability_score then
    perform update_articles_source_reliability(new.uri, new.reliability_score);
  end if;
  
  return new;
end;
$$ language plpgsql;

drop trigger if exists on_source_reliability_change on public.sources;
create trigger on_source_reliability_change
  after update on public.sources
  for each row
  execute function trigger_update_articles_on_source_change();

comment on function trigger_update_articles_on_source_change() is 'Updates related articles when source reliability changes';

-- ----------------------------------------------------------------------------
-- 8. REMOVED: USER SCORE CALCULATION FUNCTIONS
-- ----------------------------------------------------------------------------
-- The following functions are NOT created here because they already exist
-- from migration 20251005051000_update_user_score_nested_reactions.sql:
--   - calculate_user_score(article_uuid uuid)
--   - update_article_user_score()
--   - update_article_user_score_from_comment()
--   - Associated triggers on article_reactions and comment_reactions
--
-- That migration handles:
--   - Counting 'true' and 'fake' reactions on articles and comments
--   - Updating user_score automatically when reactions/comments change
--   - Starting from base score of 50 (will be changed to 0 in next migration)

-- ----------------------------------------------------------------------------
-- 9. FUNCTION TO SYNC SOURCE RELIABILITY FROM SOURCE URI
-- ----------------------------------------------------------------------------
create or replace function sync_article_source_reliability(p_article_id uuid)
returns void as $$
declare
  v_source_uri text;
  v_reliability_score integer;
begin
  -- Extract URI from source jsonb
  select source->>'uri'
  into v_source_uri
  from public.news_articles
  where id = p_article_id;
  
  if v_source_uri is not null then
    -- Find matching source and get its reliability score
    select reliability_score
    into v_reliability_score
    from public.sources
    where uri = v_source_uri;
    
    if found then
      -- Update article's source_reliability_score
      update public.news_articles
      set source_reliability_score = v_reliability_score
      where id = p_article_id;
    end if;
  end if;
end;
$$ language plpgsql;

comment on function sync_article_source_reliability(uuid) is 'Syncs article source_reliability_score from sources table based on source URI';

-- ----------------------------------------------------------------------------
-- 10. HELPER FUNCTION TO INITIALIZE ARTICLE SCORES
-- ----------------------------------------------------------------------------
create or replace function initialize_article_scores(p_article_id uuid)
returns void as $$
begin
  -- Sync source reliability if source URI exists
  perform sync_article_source_reliability(p_article_id);
  
  -- Note: user_score is already being maintained by existing triggers
  -- from migration 20251005051000_update_user_score_nested_reactions.sql
  
  -- trust_score will be automatically calculated by the trigger
end;
$$ language plpgsql;

comment on function initialize_article_scores(uuid) is 'Initializes all score components for an article';

-- ----------------------------------------------------------------------------
-- 11. BACKFILL EXISTING DATA
-- ----------------------------------------------------------------------------
-- Update all existing articles to have default scores if null
update public.news_articles
set 
  factual_accuracy_score = coalesce(factual_accuracy_score, 50),
  source_reliability_score = coalesce(source_reliability_score, 50),
  user_score = coalesce(user_score, 0),
  trust_score_weights = coalesce(trust_score_weights, '{
    "factual_accuracy": 0.35,
    "source_reliability": 0.30,
    "confidence_level": 0.20,
    "user_score": 0.15
  }'::jsonb)
where 
  factual_accuracy_score is null or
  source_reliability_score is null or
  user_score is null or
  trust_score_weights is null;

-- Note: user_score is already initialized by migration 20251005051000
-- No need to recalculate here

-- ----------------------------------------------------------------------------
-- 12. GRANT PERMISSIONS
-- ----------------------------------------------------------------------------
grant select on public.sources to anon, authenticated;
grant insert, update on public.sources to authenticated;

-- Create RLS policies for sources
alter table public.sources enable row level security;

create policy "Anyone can view sources"
  on public.sources for select
  using (true);

create policy "Authenticated users can manage sources"
  on public.sources for all
  to authenticated
  using (true)
  with check (true);
