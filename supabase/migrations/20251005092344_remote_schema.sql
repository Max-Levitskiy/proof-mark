revoke delete on table "public"."claim_mentions" from "anon";

revoke insert on table "public"."claim_mentions" from "anon";

revoke references on table "public"."claim_mentions" from "anon";

revoke select on table "public"."claim_mentions" from "anon";

revoke trigger on table "public"."claim_mentions" from "anon";

revoke truncate on table "public"."claim_mentions" from "anon";

revoke update on table "public"."claim_mentions" from "anon";

revoke delete on table "public"."claim_mentions" from "authenticated";

revoke insert on table "public"."claim_mentions" from "authenticated";

revoke references on table "public"."claim_mentions" from "authenticated";

revoke select on table "public"."claim_mentions" from "authenticated";

revoke trigger on table "public"."claim_mentions" from "authenticated";

revoke truncate on table "public"."claim_mentions" from "authenticated";

revoke update on table "public"."claim_mentions" from "authenticated";

revoke delete on table "public"."claim_mentions" from "service_role";

revoke insert on table "public"."claim_mentions" from "service_role";

revoke references on table "public"."claim_mentions" from "service_role";

revoke select on table "public"."claim_mentions" from "service_role";

revoke trigger on table "public"."claim_mentions" from "service_role";

revoke truncate on table "public"."claim_mentions" from "service_role";

revoke update on table "public"."claim_mentions" from "service_role";

revoke delete on table "public"."claim_verifications" from "anon";

revoke insert on table "public"."claim_verifications" from "anon";

revoke references on table "public"."claim_verifications" from "anon";

revoke select on table "public"."claim_verifications" from "anon";

revoke trigger on table "public"."claim_verifications" from "anon";

revoke truncate on table "public"."claim_verifications" from "anon";

revoke update on table "public"."claim_verifications" from "anon";

revoke delete on table "public"."claim_verifications" from "authenticated";

revoke insert on table "public"."claim_verifications" from "authenticated";

revoke references on table "public"."claim_verifications" from "authenticated";

revoke select on table "public"."claim_verifications" from "authenticated";

revoke trigger on table "public"."claim_verifications" from "authenticated";

revoke truncate on table "public"."claim_verifications" from "authenticated";

revoke update on table "public"."claim_verifications" from "authenticated";

revoke delete on table "public"."claim_verifications" from "service_role";

revoke insert on table "public"."claim_verifications" from "service_role";

revoke references on table "public"."claim_verifications" from "service_role";

revoke select on table "public"."claim_verifications" from "service_role";

revoke trigger on table "public"."claim_verifications" from "service_role";

revoke truncate on table "public"."claim_verifications" from "service_role";

revoke update on table "public"."claim_verifications" from "service_role";

revoke delete on table "public"."claims" from "anon";

revoke insert on table "public"."claims" from "anon";

revoke references on table "public"."claims" from "anon";

revoke select on table "public"."claims" from "anon";

revoke trigger on table "public"."claims" from "anon";

revoke truncate on table "public"."claims" from "anon";

revoke update on table "public"."claims" from "anon";

revoke delete on table "public"."claims" from "authenticated";

revoke insert on table "public"."claims" from "authenticated";

revoke references on table "public"."claims" from "authenticated";

revoke select on table "public"."claims" from "authenticated";

revoke trigger on table "public"."claims" from "authenticated";

revoke truncate on table "public"."claims" from "authenticated";

revoke update on table "public"."claims" from "authenticated";

revoke delete on table "public"."claims" from "service_role";

revoke insert on table "public"."claims" from "service_role";

revoke references on table "public"."claims" from "service_role";

revoke select on table "public"."claims" from "service_role";

revoke trigger on table "public"."claims" from "service_role";

revoke truncate on table "public"."claims" from "service_role";

revoke update on table "public"."claims" from "service_role";

drop function if exists "public"."match_content_embeddings"(query_embedding vector, match_threshold double precision, match_count integer);

drop function if exists "public"."match_documents"(query_embedding vector, match_count integer, filter jsonb);

drop function if exists "public"."nn_candidates"(q vector, k integer, since interval);

alter table "public"."claim_mentions" enable row level security;

alter table "public"."claim_verifications" enable row level security;

alter table "public"."claims" add column "claim_cluster_id" bigint;

alter table "public"."claims" alter column "embedding" set data type extensions.vector(768) using "embedding"::extensions.vector(768);

alter table "public"."claims" enable row level security;

alter table "public"."content_embeddings" alter column "embedding" set data type extensions.vector(768) using "embedding"::extensions.vector(768);

alter table "public"."content_embeddings" alter column "id" set default (extensions.uuid_generate_v4())::text;

alter table "public"."story_clusters" alter column "centroid" set data type extensions.vector(768) using "centroid"::extensions.vector(768);

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.match_content_embeddings(query_embedding extensions.vector, match_threshold double precision DEFAULT 0.7, match_count integer DEFAULT 10)
 RETURNS TABLE(id text, content text, key text, metadata jsonb, similarity double precision, created_at timestamp with time zone, cluster_id integer, outlier_score real, cluster_prob real)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
  select
    content_embeddings.id,
    content_embeddings.content,
    content_embeddings.key,
    content_embeddings.metadata,
    1 - (content_embeddings.embedding <=> query_embedding) as similarity,
    content_embeddings.created_at,
    content_embeddings.cluster_id,
    content_embeddings.outlier_score,
    content_embeddings.cluster_prob
  from public.content_embeddings
  where 
    content_embeddings.embedding is not null
    and 1 - (content_embeddings.embedding <=> query_embedding) > match_threshold
  order by content_embeddings.embedding <=> query_embedding
  limit match_count;
$function$
;

CREATE OR REPLACE FUNCTION public.match_documents(query_embedding extensions.vector, match_count integer DEFAULT NULL::integer, filter jsonb DEFAULT '{}'::jsonb)
 RETURNS TABLE(id text, content text, metadata jsonb, similarity double precision)
 LANGUAGE plpgsql
AS $function$
begin
  return query
  select
    content_embeddings.id,
    content_embeddings.content,
    content_embeddings.metadata,
    1 - (content_embeddings.embedding <=> query_embedding) as similarity
  from content_embeddings
  where content_embeddings.metadata @> filter
  order by content_embeddings.embedding <=> query_embedding
  limit match_count;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.nn_candidates(q extensions.vector, k integer DEFAULT 100, since interval DEFAULT '7 days'::interval)
 RETURNS TABLE(id text, cluster_id bigint, cosine_sim real, created_at timestamp with time zone)
 LANGUAGE sql
 STABLE
AS $function$
  select
    ce.id,
    ce.cluster_id,
    1 - (ce.embedding <=> q) as cosine_sim,
    ce.created_at
  from public.content_embeddings ce
  where ce.embedding is not null
    and ce.created_at >= now() - since
  order by ce.embedding <=> q
  limit k
$function$
;

CREATE OR REPLACE FUNCTION public.assign_or_create_cluster(p_id text)
 RETURNS bigint
 LANGUAGE plpgsql
AS $function$declare
  v_emb vector(768);
  v_choice bigint;
  tau_story constant real := 0.85;  -- tune this
  k constant int := 100;
begin
  select embedding into v_emb
  from public.content_embeddings
  where id = p_id;

  if v_emb is null then
    raise exception 'No embedding for %', p_id;
  end if;

  -- pick the cluster that has the most neighbors above the threshold
  with candidates as (
    select cluster_id
    from public.nn_candidates(v_emb, k, '7 days')
    where cosine_sim >= tau_story
      and cluster_id is not null
    group by cluster_id
    order by count(*) desc
    limit 1
  )
  select cluster_id into v_choice from candidates;

  if v_choice is null then
    insert into public.story_clusters (centroid)
    values (v_emb)
    returning id into v_choice;
  end if;

  update public.content_embeddings
  set cluster_id = v_choice
  where id = p_id;

  -- refresh centroid as mean of members
  update public.story_clusters sc
  set centroid = sub.cntroid, last_updated = now()
  from (
    select cluster_id, avg(embedding) as cntroid
    from public.content_embeddings
    where cluster_id = v_choice
    group by cluster_id
  ) sub
  where sc.id = sub.cluster_id;

  return v_choice;
end;$function$
;

CREATE OR REPLACE FUNCTION public.calculate_user_score(article_uuid uuid)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.content_embeddings_after_upsert()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$BEGIN
  -- Log for debugging
  RAISE NOTICE 'Trigger fired for ID: %, TG_OP: %', NEW.id, TG_OP;
  
  IF (TG_OP = 'INSERT' AND NEW.embedding IS NOT NULL) THEN
    RAISE NOTICE 'INSERT condition met, calling assign_or_create_cluster';
    PERFORM public.assign_or_create_cluster(NEW.id);
  ELSIF (TG_OP = 'UPDATE' AND NEW.embedding IS NOT NULL) THEN
    -- For vectors, you might need a different comparison
    IF OLD.embedding IS NULL OR NEW.embedding::text != OLD.embedding::text THEN
      RAISE NOTICE 'UPDATE condition met, calling assign_or_create_cluster';
      PERFORM public.assign_or_create_cluster(NEW.id);
    END IF;
  END IF;
  
  RETURN NEW;
END;$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
  insert into public.users (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.maybe_merge_around(p_cluster_id bigint)
 RETURNS bigint
 LANGUAGE plpgsql
AS $function$
declare
  tau_merge constant real := 0.82;   -- tune on your data
  min_size  constant int  := 2;      -- avoid merging empty shells
  neighbor  record;
  keep_id   bigint := p_cluster_id;
  keep_size int;
  cand_size int;
begin
  -- fetch current size
  select size into keep_size from public.story_clusters where id = keep_id;

  for neighbor in
    select * from public.near_clusters(keep_id, 5)
  loop
    if neighbor.cosine_sim >= tau_merge then
      -- get sizes to decide direction
      select size into cand_size from public.story_clusters where id = neighbor.other_id;

      if keep_size is null then keep_size := 0; end if;
      if cand_size is null then cand_size := 0; end if;

      -- survivor = larger (or earlier if sizes tie)
      if cand_size > keep_size then
        perform public.merge_clusters(neighbor.other_id, keep_id);
        keep_id := neighbor.other_id;
        keep_size := cand_size;
      else
        perform public.merge_clusters(keep_id, neighbor.other_id);
        -- keep_id stays, size may have grown:
        select size into keep_size from public.story_clusters where id = keep_id;
      end if;
    end if;
  end loop;

  return keep_id;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.merge_clusters(p_keep bigint, p_absorb bigint)
 RETURNS bigint
 LANGUAGE plpgsql
AS $function$
begin
  -- move members
  update public.content_embeddings
  set cluster_id = p_keep
  where cluster_id = p_absorb;

  -- recompute centroid + size
  update public.story_clusters sc
  set centroid = sub.cntroid,
      size = sub.sz,
      last_updated = now()
  from (
    select cluster_id as id,
           avg(embedding) as cntroid,
           count(*) as sz
    from public.content_embeddings
    where cluster_id in (p_keep)
    group by cluster_id
  ) sub
  where sc.id = sub.id;

  -- delete absorbed cluster row
  delete from public.story_clusters where id = p_absorb;

  return p_keep;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.near_clusters(p_cluster_id bigint, k integer DEFAULT 5)
 RETURNS TABLE(other_id bigint, cosine_sim real)
 LANGUAGE sql
 STABLE
AS $function$
  select sc2.id,
         1 - (sc1.centroid <=> sc2.centroid) as cosine_sim
  from public.story_clusters sc1
  join public.story_clusters sc2 on sc2.id <> sc1.id
  where sc1.id = p_cluster_id
  order by sc1.centroid <=> sc2.centroid
  limit k
$function$
;

CREATE OR REPLACE FUNCTION public.prevent_duplicate_comments()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.prevent_self_comment_reaction()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.prevent_self_comment_reply()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.sweep_merge(limit_clusters integer DEFAULT 200)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
declare
  r record;
begin
  for r in
    select id from public.story_clusters
    order by size desc nulls last, last_updated desc
    limit limit_clusters
  loop
    perform public.maybe_merge_around(r.id);
  end loop;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.trg_set_id_from_content()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.id := encode(digest(NEW.content, 'sha256'), 'hex');
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_article_user_score()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.update_article_user_score_from_comment()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.update_comment_reaction_counts()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.update_key_by_content(p_content text, p_new_key text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_id text := encode(digest(p_content, 'sha256'), 'hex');
BEGIN
    UPDATE public.content_embeddings
    SET "key" = p_new_key
    WHERE id = v_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.validate_comment_reaction()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
  -- Check if this is a reply (has parent_comment_id)
  if new.parent_comment_id is not null then
    -- For replies: check if user has reacted to the parent comment
    if not exists (
      select 1
      from public.comment_reactions
      where comment_id = new.parent_comment_id
        and user_id = new.user_id
    ) then
      raise exception 'You must react to the comment before replying';
    end if;
  else
    -- For top-level comments: check if user has reacted to the article
    if not exists (
      select 1
      from public.article_reactions
      where article_id = new.article_id
        and user_id = new.user_id
    ) then
      raise exception 'You must react to the article before commenting';
    end if;
  end if;

  return new;
end;
$function$
;



