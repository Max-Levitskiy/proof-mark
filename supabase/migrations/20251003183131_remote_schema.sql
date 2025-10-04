drop function if exists "public"."match_documents"(query_embedding vector, match_count integer, filter jsonb);

alter table "public"."content_embeddings" alter column "embedding" set data type extensions.vector(768) using "embedding"::extensions.vector(768);

CREATE INDEX idx_content_embeddings_embedding_hnsw ON public.content_embeddings USING hnsw (embedding extensions.vector_cosine_ops) WHERE (embedding IS NOT NULL);

CREATE INDEX idx_content_embeddings_vector ON public.content_embeddings USING hnsw (embedding extensions.vector_cosine_ops);

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.match_content_embeddings(query_embedding extensions.vector, match_threshold double precision DEFAULT 0.7, match_count integer DEFAULT 10)
 RETURNS TABLE(id text, content text, key text, metadata jsonb, similarity double precision, created_at timestamp with time zone, cluster_id integer, outlier_score real, cluster_prob real)
 LANGUAGE sql
 STABLE
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



