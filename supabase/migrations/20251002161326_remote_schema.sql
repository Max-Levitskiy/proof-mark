revoke delete on table "public"."content_embeddings" from "anon";
revoke insert on table "public"."content_embeddings" from "anon";
revoke references on table "public"."content_embeddings" from "anon";
revoke select on table "public"."content_embeddings" from "anon";
revoke trigger on table "public"."content_embeddings" from "anon";
revoke truncate on table "public"."content_embeddings" from "anon";
revoke update on table "public"."content_embeddings" from "anon";
revoke delete on table "public"."content_embeddings" from "authenticated";
revoke insert on table "public"."content_embeddings" from "authenticated";
revoke references on table "public"."content_embeddings" from "authenticated";
revoke select on table "public"."content_embeddings" from "authenticated";
revoke trigger on table "public"."content_embeddings" from "authenticated";
revoke truncate on table "public"."content_embeddings" from "authenticated";
revoke update on table "public"."content_embeddings" from "authenticated";
revoke delete on table "public"."content_embeddings" from "service_role";
revoke insert on table "public"."content_embeddings" from "service_role";
revoke references on table "public"."content_embeddings" from "service_role";
revoke select on table "public"."content_embeddings" from "service_role";
revoke trigger on table "public"."content_embeddings" from "service_role";
revoke truncate on table "public"."content_embeddings" from "service_role";
revoke update on table "public"."content_embeddings" from "service_role";
revoke delete on table "public"."rss_feed_processing" from "anon";
revoke insert on table "public"."rss_feed_processing" from "anon";
revoke references on table "public"."rss_feed_processing" from "anon";
revoke select on table "public"."rss_feed_processing" from "anon";
revoke trigger on table "public"."rss_feed_processing" from "anon";
revoke truncate on table "public"."rss_feed_processing" from "anon";
revoke update on table "public"."rss_feed_processing" from "anon";
revoke delete on table "public"."rss_feed_processing" from "authenticated";
revoke insert on table "public"."rss_feed_processing" from "authenticated";
revoke references on table "public"."rss_feed_processing" from "authenticated";
revoke select on table "public"."rss_feed_processing" from "authenticated";
revoke trigger on table "public"."rss_feed_processing" from "authenticated";
revoke truncate on table "public"."rss_feed_processing" from "authenticated";
revoke update on table "public"."rss_feed_processing" from "authenticated";
revoke delete on table "public"."rss_feed_processing" from "service_role";
revoke insert on table "public"."rss_feed_processing" from "service_role";
revoke references on table "public"."rss_feed_processing" from "service_role";
revoke select on table "public"."rss_feed_processing" from "service_role";
revoke trigger on table "public"."rss_feed_processing" from "service_role";
revoke truncate on table "public"."rss_feed_processing" from "service_role";
revoke update on table "public"."rss_feed_processing" from "service_role";
drop function if exists "public"."match_documents"(query_embedding vector, match_count integer, filter jsonb);
drop index if exists "public"."news_embedding_hnsw_half";
alter table "public"."content_embeddings" alter column "embedding" set data type extensions.vector(768) using "embedding"::extensions.vector(768);
set check_function_bodies = off;
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
