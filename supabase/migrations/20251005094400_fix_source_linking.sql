-- ============================================================================
-- FIX SOURCE LINKING - PROPER FOREIGN KEY RELATIONSHIP
-- ============================================================================
-- This migration fixes the source reliability system to use proper foreign keys
-- instead of text-based matching
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. ADD source_id FOREIGN KEY TO news_articles
-- ----------------------------------------------------------------------------

-- Add source_id column as foreign key to sources table
ALTER TABLE public.news_articles
  ADD COLUMN IF NOT EXISTS source_id uuid REFERENCES public.sources(id) ON DELETE SET NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_news_articles_source_id ON public.news_articles(source_id);

COMMENT ON COLUMN public.news_articles.source_id IS 'Foreign key to sources table for reliable source linking';

-- ----------------------------------------------------------------------------
-- 2. FUNCTION TO SYNC source_id FROM source JSON
-- ----------------------------------------------------------------------------

-- This function extracts URI from source JSONB and finds matching source_id
CREATE OR REPLACE FUNCTION sync_source_id_from_json(p_article_id uuid)
RETURNS void AS $$
DECLARE
  v_source_uri text;
  v_source_id uuid;
BEGIN
  -- Extract URI from source jsonb
  SELECT source->>'uri'
  INTO v_source_uri
  FROM public.news_articles
  WHERE id = p_article_id;
  
  IF v_source_uri IS NOT NULL THEN
    -- Find matching source by URI
    SELECT id
    INTO v_source_id
    FROM public.sources
    WHERE uri = v_source_uri;
    
    IF FOUND THEN
      -- Update article's source_id
      UPDATE public.news_articles
      SET source_id = v_source_id
      WHERE id = p_article_id;
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION sync_source_id_from_json(uuid) IS 'Syncs source_id foreign key from source JSONB uri field';

-- ----------------------------------------------------------------------------
-- 3. IMPROVED sync_article_source_reliability FUNCTION
-- ----------------------------------------------------------------------------

-- Replace the old text-matching version with proper FK-based lookup
CREATE OR REPLACE FUNCTION sync_article_source_reliability(p_article_id uuid)
RETURNS void AS $$
DECLARE
  v_reliability_score integer;
BEGIN
  -- First, ensure source_id is synced from JSON
  PERFORM sync_source_id_from_json(p_article_id);
  
  -- Get reliability score from linked source
  SELECT s.reliability_score
  INTO v_reliability_score
  FROM public.news_articles a
  JOIN public.sources s ON s.id = a.source_id
  WHERE a.id = p_article_id;
  
  IF FOUND THEN
    -- Update article's source_reliability_score
    UPDATE public.news_articles
    SET source_reliability_score = v_reliability_score
    WHERE id = p_article_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION sync_article_source_reliability(uuid) IS 'Syncs source_reliability_score from sources table using foreign key';

-- ----------------------------------------------------------------------------
-- 4. IMPROVED update_articles_source_reliability FUNCTION
-- ----------------------------------------------------------------------------

-- First, drop the old text-based version from the previous migration
DROP FUNCTION IF EXISTS update_articles_source_reliability(text, integer);

-- Replace text-matching with proper FK-based updates
CREATE OR REPLACE FUNCTION update_articles_source_reliability(p_source_id uuid, p_new_reliability integer)
RETURNS void AS $$
BEGIN
  -- Update all articles that reference this source via FK
  UPDATE public.news_articles
  SET source_reliability_score = p_new_reliability
  WHERE source_id = p_source_id;
  
  -- trust_score will be automatically recalculated by existing trigger
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_articles_source_reliability(uuid, integer) IS 'Updates source_reliability_score for all articles using source_id FK';

-- ----------------------------------------------------------------------------
-- 5. UPDATED TRIGGER ON SOURCES TABLE
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION trigger_update_articles_on_source_change()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND old.reliability_score IS DISTINCT FROM new.reliability_score THEN
    -- Use source ID instead of URI for reliable updates
    PERFORM update_articles_source_reliability(new.id, new.reliability_score);
  END IF;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger (it will use the updated function)
DROP TRIGGER IF EXISTS on_source_reliability_change ON public.sources;
CREATE TRIGGER on_source_reliability_change
  AFTER UPDATE ON public.sources
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_articles_on_source_change();

-- ----------------------------------------------------------------------------
-- 6. TRIGGER TO AUTO-SYNC source_id WHEN source JSON CHANGES
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION trigger_sync_source_id_on_article_change()
RETURNS trigger AS $$
BEGIN
  -- If source JSON changed or this is a new article
  IF (TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND old.source IS DISTINCT FROM new.source)) THEN
    PERFORM sync_source_id_from_json(new.id);
    
    -- Reload the article to get the updated source_id
    SELECT source_id INTO new.source_id
    FROM public.news_articles
    WHERE id = new.id;
    
    -- If source_id is now set, sync source_reliability_score
    IF new.source_id IS NOT NULL THEN
      SELECT reliability_score INTO new.source_reliability_score
      FROM public.sources
      WHERE id = new.source_id;
    END IF;
  END IF;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS auto_sync_source_id ON public.news_articles;
CREATE TRIGGER auto_sync_source_id
  BEFORE INSERT OR UPDATE ON public.news_articles
  FOR EACH ROW
  EXECUTE FUNCTION trigger_sync_source_id_on_article_change();

COMMENT ON FUNCTION trigger_sync_source_id_on_article_change() IS 'Automatically syncs source_id when source JSON changes';

-- ----------------------------------------------------------------------------
-- 7. HELPER FUNCTION TO CREATE/UPDATE SOURCE FROM ARTICLE
-- ----------------------------------------------------------------------------

-- This function helps create sources from article JSON if they don't exist
CREATE OR REPLACE FUNCTION upsert_source_from_article(
  p_uri text,
  p_name text DEFAULT NULL,
  p_reliability_score integer DEFAULT 50
)
RETURNS uuid AS $$
DECLARE
  v_source_id uuid;
  v_source_name text;
BEGIN
  -- Use provided name or extract domain from URI as fallback
  v_source_name := COALESCE(
    p_name,
    regexp_replace(p_uri, '^https?://(www\.)?([^/]+).*$', '\2')
  );
  
  -- Insert or update source
  INSERT INTO public.sources (uri, name, reliability_score)
  VALUES (p_uri, v_source_name, p_reliability_score)
  ON CONFLICT (uri) DO UPDATE
  SET name = EXCLUDED.name,
      updated_at = now()
  RETURNING id INTO v_source_id;
  
  RETURN v_source_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION upsert_source_from_article(text, text, integer) IS 'Creates or updates a source, returns source_id';

-- ----------------------------------------------------------------------------
-- 8. BACKFILL EXISTING DATA
-- ----------------------------------------------------------------------------

-- Step 1: Create sources for all unique URIs in news_articles that don't exist yet
INSERT INTO public.sources (uri, name, reliability_score, description)
SELECT DISTINCT
  a.source->>'uri' as uri,
  COALESCE(
    a.source->>'name',
    regexp_replace(a.source->>'uri', '^https?://(www\.)?([^/]+).*$', '\2')
  ) as name,
  50 as reliability_score,
  'Auto-created from news articles' as description
FROM public.news_articles a
WHERE a.source->>'uri' IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.sources s
    WHERE s.uri = a.source->>'uri'
  );

-- Step 2: Sync source_id for all existing articles
DO $$
DECLARE
  v_article_id uuid;
BEGIN
  FOR v_article_id IN 
    SELECT id FROM public.news_articles 
    WHERE source IS NOT NULL AND source->>'uri' IS NOT NULL
  LOOP
    PERFORM sync_source_id_from_json(v_article_id);
  END LOOP;
END $$;

-- Step 3: Sync source_reliability_score for all articles with source_id
UPDATE public.news_articles a
SET source_reliability_score = s.reliability_score
FROM public.sources s
WHERE a.source_id = s.id
  AND (a.source_reliability_score IS NULL OR a.source_reliability_score != s.reliability_score);

-- ----------------------------------------------------------------------------
-- 9. VIEW FOR EASY SOURCE MONITORING
-- ----------------------------------------------------------------------------

CREATE OR REPLACE VIEW article_source_status AS
SELECT 
  a.id as article_id,
  a.headline,
  a.source->>'uri' as source_uri_from_json,
  a.source_id,
  s.name as source_name,
  s.uri as source_uri_from_table,
  s.reliability_score as source_table_reliability,
  a.source_reliability_score as article_reliability,
  CASE 
    WHEN a.source_id IS NULL AND a.source->>'uri' IS NOT NULL THEN 'UNLINKED'
    WHEN a.source_id IS NOT NULL AND a.source_reliability_score != s.reliability_score THEN 'OUT_OF_SYNC'
    WHEN a.source_id IS NOT NULL THEN 'LINKED'
    ELSE 'NO_SOURCE'
  END as link_status
FROM public.news_articles a
LEFT JOIN public.sources s ON s.id = a.source_id;

COMMENT ON VIEW article_source_status IS 'Monitors source linking status for articles';

-- ----------------------------------------------------------------------------
-- 10. CONVENIENCE FUNCTIONS
-- ----------------------------------------------------------------------------

-- Function to fix all unlinked articles
CREATE OR REPLACE FUNCTION fix_all_unlinked_sources()
RETURNS TABLE(fixed_count bigint) AS $$
DECLARE
  v_count bigint;
BEGIN
  -- Sync all articles
  PERFORM sync_source_id_from_json(id)
  FROM public.news_articles
  WHERE source IS NOT NULL 
    AND source->>'uri' IS NOT NULL
    AND source_id IS NULL;
  
  -- Count how many we fixed
  GET DIAGNOSTICS v_count = ROW_COUNT;
  
  RETURN QUERY SELECT v_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION fix_all_unlinked_sources IS 'Fixes all articles with unlinked sources';

-- Function to get articles needing source attention
CREATE OR REPLACE FUNCTION get_articles_needing_source_attention()
RETURNS TABLE(
  article_id uuid,
  headline text,
  issue text,
  source_uri text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.headline,
    CASE 
      WHEN a.source IS NULL THEN 'No source JSON'
      WHEN a.source->>'uri' IS NULL THEN 'Source JSON missing URI'
      WHEN a.source_id IS NULL THEN 'Source not linked to sources table'
      WHEN a.source_reliability_score IS NULL THEN 'Missing reliability score'
    END as issue,
    a.source->>'uri' as source_uri
  FROM public.news_articles a
  WHERE a.source IS NULL
     OR a.source->>'uri' IS NULL
     OR a.source_id IS NULL
     OR a.source_reliability_score IS NULL
  ORDER BY a.created_at DESC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_articles_needing_source_attention IS 'Returns articles with source-related issues';

-- ----------------------------------------------------------------------------
-- 11. GRANT PERMISSIONS
-- ----------------------------------------------------------------------------

-- Grant access to the new view
GRANT SELECT ON article_source_status TO anon, authenticated;
