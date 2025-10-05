create sequence "public"."claim_mentions_id_seq";

create sequence "public"."claim_verifications_id_seq";

create sequence "public"."claims_id_seq";

drop trigger if exists "content_embeddings_after_insert_tr" on "public"."content_embeddings";

drop trigger if exists "content_embeddings_after_upsert_tr" on "public"."content_embeddings";

drop trigger if exists "set_id_from_content" on "public"."content_embeddings";

revoke delete on table "public"."article_comments" from "anon";

revoke insert on table "public"."article_comments" from "anon";

revoke references on table "public"."article_comments" from "anon";

revoke select on table "public"."article_comments" from "anon";

revoke trigger on table "public"."article_comments" from "anon";

revoke truncate on table "public"."article_comments" from "anon";

revoke update on table "public"."article_comments" from "anon";

revoke delete on table "public"."article_comments" from "authenticated";

revoke insert on table "public"."article_comments" from "authenticated";

revoke references on table "public"."article_comments" from "authenticated";

revoke select on table "public"."article_comments" from "authenticated";

revoke trigger on table "public"."article_comments" from "authenticated";

revoke truncate on table "public"."article_comments" from "authenticated";

revoke update on table "public"."article_comments" from "authenticated";

revoke delete on table "public"."article_comments" from "service_role";

revoke insert on table "public"."article_comments" from "service_role";

revoke references on table "public"."article_comments" from "service_role";

revoke select on table "public"."article_comments" from "service_role";

revoke trigger on table "public"."article_comments" from "service_role";

revoke truncate on table "public"."article_comments" from "service_role";

revoke update on table "public"."article_comments" from "service_role";

revoke delete on table "public"."article_reactions" from "anon";

revoke insert on table "public"."article_reactions" from "anon";

revoke references on table "public"."article_reactions" from "anon";

revoke select on table "public"."article_reactions" from "anon";

revoke trigger on table "public"."article_reactions" from "anon";

revoke truncate on table "public"."article_reactions" from "anon";

revoke update on table "public"."article_reactions" from "anon";

revoke delete on table "public"."article_reactions" from "authenticated";

revoke insert on table "public"."article_reactions" from "authenticated";

revoke references on table "public"."article_reactions" from "authenticated";

revoke select on table "public"."article_reactions" from "authenticated";

revoke trigger on table "public"."article_reactions" from "authenticated";

revoke truncate on table "public"."article_reactions" from "authenticated";

revoke update on table "public"."article_reactions" from "authenticated";

revoke delete on table "public"."article_reactions" from "service_role";

revoke insert on table "public"."article_reactions" from "service_role";

revoke references on table "public"."article_reactions" from "service_role";

revoke select on table "public"."article_reactions" from "service_role";

revoke trigger on table "public"."article_reactions" from "service_role";

revoke truncate on table "public"."article_reactions" from "service_role";

revoke update on table "public"."article_reactions" from "service_role";

revoke delete on table "public"."comment_reactions" from "anon";

revoke insert on table "public"."comment_reactions" from "anon";

revoke references on table "public"."comment_reactions" from "anon";

revoke select on table "public"."comment_reactions" from "anon";

revoke trigger on table "public"."comment_reactions" from "anon";

revoke truncate on table "public"."comment_reactions" from "anon";

revoke update on table "public"."comment_reactions" from "anon";

revoke delete on table "public"."comment_reactions" from "authenticated";

revoke insert on table "public"."comment_reactions" from "authenticated";

revoke references on table "public"."comment_reactions" from "authenticated";

revoke select on table "public"."comment_reactions" from "authenticated";

revoke trigger on table "public"."comment_reactions" from "authenticated";

revoke truncate on table "public"."comment_reactions" from "authenticated";

revoke update on table "public"."comment_reactions" from "authenticated";

revoke delete on table "public"."comment_reactions" from "service_role";

revoke insert on table "public"."comment_reactions" from "service_role";

revoke references on table "public"."comment_reactions" from "service_role";

revoke select on table "public"."comment_reactions" from "service_role";

revoke trigger on table "public"."comment_reactions" from "service_role";

revoke truncate on table "public"."comment_reactions" from "service_role";

revoke update on table "public"."comment_reactions" from "service_role";

revoke delete on table "public"."feature_subscriptions" from "anon";

revoke insert on table "public"."feature_subscriptions" from "anon";

revoke references on table "public"."feature_subscriptions" from "anon";

revoke select on table "public"."feature_subscriptions" from "anon";

revoke trigger on table "public"."feature_subscriptions" from "anon";

revoke truncate on table "public"."feature_subscriptions" from "anon";

revoke update on table "public"."feature_subscriptions" from "anon";

revoke delete on table "public"."feature_subscriptions" from "authenticated";

revoke insert on table "public"."feature_subscriptions" from "authenticated";

revoke references on table "public"."feature_subscriptions" from "authenticated";

revoke select on table "public"."feature_subscriptions" from "authenticated";

revoke trigger on table "public"."feature_subscriptions" from "authenticated";

revoke truncate on table "public"."feature_subscriptions" from "authenticated";

revoke update on table "public"."feature_subscriptions" from "authenticated";

revoke delete on table "public"."feature_subscriptions" from "service_role";

revoke insert on table "public"."feature_subscriptions" from "service_role";

revoke references on table "public"."feature_subscriptions" from "service_role";

revoke select on table "public"."feature_subscriptions" from "service_role";

revoke trigger on table "public"."feature_subscriptions" from "service_role";

revoke truncate on table "public"."feature_subscriptions" from "service_role";

revoke update on table "public"."feature_subscriptions" from "service_role";

revoke delete on table "public"."news_articles" from "anon";

revoke insert on table "public"."news_articles" from "anon";

revoke references on table "public"."news_articles" from "anon";

revoke select on table "public"."news_articles" from "anon";

revoke trigger on table "public"."news_articles" from "anon";

revoke truncate on table "public"."news_articles" from "anon";

revoke update on table "public"."news_articles" from "anon";

revoke delete on table "public"."news_articles" from "authenticated";

revoke insert on table "public"."news_articles" from "authenticated";

revoke references on table "public"."news_articles" from "authenticated";

revoke select on table "public"."news_articles" from "authenticated";

revoke trigger on table "public"."news_articles" from "authenticated";

revoke truncate on table "public"."news_articles" from "authenticated";

revoke update on table "public"."news_articles" from "authenticated";

revoke delete on table "public"."news_articles" from "service_role";

revoke insert on table "public"."news_articles" from "service_role";

revoke references on table "public"."news_articles" from "service_role";

revoke select on table "public"."news_articles" from "service_role";

revoke trigger on table "public"."news_articles" from "service_role";

revoke truncate on table "public"."news_articles" from "service_role";

revoke update on table "public"."news_articles" from "service_role";

revoke delete on table "public"."story_clusters" from "anon";

revoke insert on table "public"."story_clusters" from "anon";

revoke references on table "public"."story_clusters" from "anon";

revoke select on table "public"."story_clusters" from "anon";

revoke trigger on table "public"."story_clusters" from "anon";

revoke truncate on table "public"."story_clusters" from "anon";

revoke update on table "public"."story_clusters" from "anon";

revoke delete on table "public"."story_clusters" from "authenticated";

revoke insert on table "public"."story_clusters" from "authenticated";

revoke references on table "public"."story_clusters" from "authenticated";

revoke select on table "public"."story_clusters" from "authenticated";

revoke trigger on table "public"."story_clusters" from "authenticated";

revoke truncate on table "public"."story_clusters" from "authenticated";

revoke update on table "public"."story_clusters" from "authenticated";

revoke delete on table "public"."story_clusters" from "service_role";

revoke insert on table "public"."story_clusters" from "service_role";

revoke references on table "public"."story_clusters" from "service_role";

revoke select on table "public"."story_clusters" from "service_role";

revoke trigger on table "public"."story_clusters" from "service_role";

revoke truncate on table "public"."story_clusters" from "service_role";

revoke update on table "public"."story_clusters" from "service_role";

drop function if exists "public"."match_content_embeddings"(query_embedding vector, match_threshold double precision, match_count integer);

drop function if exists "public"."match_documents"(query_embedding vector, match_count integer, filter jsonb);

drop function if exists "public"."nn_candidates"(q vector, k integer, since interval);

create table "public"."claim_mentions" (
    "id" bigint not null default nextval('claim_mentions_id_seq'::regclass),
    "claim_id" bigint not null,
    "article_id" text not null,
    "cluster_id" bigint,
    "sentence" text not null,
    "sentence_ids" integer[],
    "created_at" timestamp with time zone default now()
);


create table "public"."claim_verifications" (
    "id" bigint not null default nextval('claim_verifications_id_seq'::regclass),
    "claim_id" bigint not null,
    "checked_at" timestamp with time zone default now(),
    "source" text,
    "publisher" text,
    "url" text,
    "verdict" text,
    "confidence" real,
    "raw" jsonb
);


create table "public"."claims" (
    "id" bigint not null default nextval('claims_id_seq'::regclass),
    "canonical_text" text not null,
    "canonical_sig" text not null,
    "lang" text,
    "date" date,
    "location_qid" text,
    "event_type" text,
    "number_value" numeric,
    "number_bucket" text,
    "entities" jsonb,
    "embedding" extensions.vector(768),
    "support_count" integer default 0,
    "first_seen" timestamp with time zone default now(),
    "last_seen" timestamp with time zone default now()
);


alter table "public"."content_embeddings" alter column "embedding" set data type extensions.vector(768) using "embedding"::extensions.vector(768);

alter table "public"."content_embeddings" alter column "id" set default (extensions.uuid_generate_v4())::text;

alter table "public"."news_articles" enable row level security;

alter table "public"."story_clusters" alter column "centroid" set data type extensions.vector(768) using "centroid"::extensions.vector(768);

alter sequence "public"."claim_mentions_id_seq" owned by "public"."claim_mentions"."id";

alter sequence "public"."claim_verifications_id_seq" owned by "public"."claim_verifications"."id";

alter sequence "public"."claims_id_seq" owned by "public"."claims"."id";

CREATE INDEX claim_mentions_article_id_idx ON public.claim_mentions USING btree (article_id);

CREATE INDEX claim_mentions_claim_id_idx ON public.claim_mentions USING btree (claim_id);

CREATE UNIQUE INDEX claim_mentions_pkey ON public.claim_mentions USING btree (id);

CREATE INDEX claim_verifications_claim_id_idx ON public.claim_verifications USING btree (claim_id);

CREATE UNIQUE INDEX claim_verifications_pkey ON public.claim_verifications USING btree (id);

CREATE UNIQUE INDEX claims_canonical_sig_key ON public.claims USING btree (canonical_sig);

CREATE UNIQUE INDEX claims_pkey ON public.claims USING btree (id);

CREATE INDEX idx_claims_date ON public.claims USING btree (date);

CREATE INDEX idx_claims_embedding_hnsw ON public.claims USING hnsw (embedding extensions.vector_cosine_ops) WHERE (embedding IS NOT NULL);

CREATE INDEX idx_claims_event ON public.claims USING btree (event_type);

CREATE INDEX idx_claims_loc ON public.claims USING btree (location_qid);

alter table "public"."claim_mentions" add constraint "claim_mentions_pkey" PRIMARY KEY using index "claim_mentions_pkey";

alter table "public"."claim_verifications" add constraint "claim_verifications_pkey" PRIMARY KEY using index "claim_verifications_pkey";

alter table "public"."claims" add constraint "claims_pkey" PRIMARY KEY using index "claims_pkey";

alter table "public"."claim_mentions" add constraint "claim_mentions_article_id_fkey" FOREIGN KEY (article_id) REFERENCES content_embeddings(id) ON DELETE CASCADE not valid;

alter table "public"."claim_mentions" validate constraint "claim_mentions_article_id_fkey";

alter table "public"."claim_mentions" add constraint "claim_mentions_claim_id_fkey" FOREIGN KEY (claim_id) REFERENCES claims(id) ON DELETE CASCADE not valid;

alter table "public"."claim_mentions" validate constraint "claim_mentions_claim_id_fkey";

alter table "public"."claim_mentions" add constraint "claim_mentions_cluster_id_fkey" FOREIGN KEY (cluster_id) REFERENCES story_clusters(id) not valid;

alter table "public"."claim_mentions" validate constraint "claim_mentions_cluster_id_fkey";

alter table "public"."claim_verifications" add constraint "claim_verifications_claim_id_fkey" FOREIGN KEY (claim_id) REFERENCES claims(id) ON DELETE CASCADE not valid;

alter table "public"."claim_verifications" validate constraint "claim_verifications_claim_id_fkey";

alter table "public"."claims" add constraint "claims_canonical_sig_key" UNIQUE using index "claims_canonical_sig_key";

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

create policy "Allow public read access"
on "public"."news_articles"
as permissive
for select
to public
using (true);


CREATE TRIGGER content_embeddings_after_upsert AFTER INSERT ON public.content_embeddings FOR EACH ROW EXECUTE FUNCTION content_embeddings_after_upsert();

CREATE TRIGGER content_embeddings_after_upsert_upd AFTER UPDATE ON public.content_embeddings FOR EACH ROW EXECUTE FUNCTION content_embeddings_after_upsert();



