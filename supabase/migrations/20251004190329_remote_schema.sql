create sequence "public"."story_clusters_id_seq";

revoke delete on table "public"."users" from "anon";

revoke insert on table "public"."users" from "anon";

revoke references on table "public"."users" from "anon";

revoke select on table "public"."users" from "anon";

revoke trigger on table "public"."users" from "anon";

revoke truncate on table "public"."users" from "anon";

revoke update on table "public"."users" from "anon";

revoke delete on table "public"."users" from "authenticated";

revoke insert on table "public"."users" from "authenticated";

revoke references on table "public"."users" from "authenticated";

revoke select on table "public"."users" from "authenticated";

revoke trigger on table "public"."users" from "authenticated";

revoke truncate on table "public"."users" from "authenticated";

revoke update on table "public"."users" from "authenticated";

revoke delete on table "public"."users" from "service_role";

revoke insert on table "public"."users" from "service_role";

revoke references on table "public"."users" from "service_role";

revoke select on table "public"."users" from "service_role";

revoke trigger on table "public"."users" from "service_role";

revoke truncate on table "public"."users" from "service_role";

revoke update on table "public"."users" from "service_role";

drop function if exists "public"."match_content_embeddings"(query_embedding vector, match_threshold double precision, match_count integer);

drop function if exists "public"."match_documents"(query_embedding vector, match_count integer, filter jsonb);

create table "public"."story_clusters" (
    "id" bigint not null default nextval('story_clusters_id_seq'::regclass),
    "created_at" timestamp with time zone default now(),
    "centroid" extensions.vector(768),
    "last_updated" timestamp with time zone default now(),
    "size" integer default 0
);


alter table "public"."story_clusters" enable row level security;

alter table "public"."content_embeddings" add column "chunk_index" bigint;

alter table "public"."content_embeddings" add column "raw_content" text;

alter table "public"."content_embeddings" add column "total_chunks" bigint;

alter table "public"."content_embeddings" alter column "embedding" set data type extensions.vector(768) using "embedding"::extensions.vector(768);

alter sequence "public"."story_clusters_id_seq" owned by "public"."story_clusters"."id";

CREATE INDEX idx_story_centroid_hnsw ON public.story_clusters USING hnsw (centroid extensions.vector_cosine_ops) WHERE (centroid IS NOT NULL);

CREATE UNIQUE INDEX story_clusters_pkey ON public.story_clusters USING btree (id);

alter table "public"."story_clusters" add constraint "story_clusters_pkey" PRIMARY KEY using index "story_clusters_pkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.assign_or_create_cluster(p_id text)
 RETURNS bigint
 LANGUAGE plpgsql
AS $function$
declare
  v_emb vector(768);
  v_choice bigint;
  tau_story constant real := 0.78;  -- tune this
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
end;
$function$
;

CREATE OR REPLACE FUNCTION public.content_embeddings_after_upsert()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Only act on UPDATE when embedding is not null and has changed, or on INSERT when embedding is not null
  IF (TG_OP = 'INSERT' AND NEW.embedding IS NOT NULL) OR
     (TG_OP = 'UPDATE' AND NEW.embedding IS NOT NULL AND NOT (NEW.embedding = OLD.embedding)) THEN
    PERFORM public.assign_or_create_cluster(NEW.id);
  END IF;
  RETURN NEW;
END;
$function$
;

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
begin
  new.updated_at = now();
  return new;
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

create policy "Allow service role full access"
on "public"."content_embeddings"
as permissive
for all
to service_role
using (true)
with check (true);


CREATE TRIGGER content_embeddings_after_insert_tr AFTER INSERT ON public.content_embeddings FOR EACH ROW WHEN ((new.embedding IS NOT NULL)) EXECUTE FUNCTION content_embeddings_after_upsert();

CREATE TRIGGER content_embeddings_after_upsert_tr AFTER UPDATE ON public.content_embeddings FOR EACH ROW WHEN (((new.embedding IS NOT NULL) AND (old.embedding IS DISTINCT FROM new.embedding))) EXECUTE FUNCTION content_embeddings_after_upsert();



