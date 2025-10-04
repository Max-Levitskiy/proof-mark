SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;
COMMENT ON SCHEMA "public" IS 'standard public schema';
CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "vector" WITH SCHEMA "extensions";
CREATE OR REPLACE FUNCTION "public"."match_documents"("query_embedding" "extensions"."vector", "match_count" integer DEFAULT NULL::integer, "filter" "jsonb" DEFAULT '{}'::"jsonb") RETURNS TABLE("id" "text", "content" "text", "metadata" "jsonb", "similarity" double precision)
    LANGUAGE "plpgsql"
    AS $$
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
$$;
ALTER FUNCTION "public"."match_documents"("query_embedding" "extensions"."vector", "match_count" integer, "filter" "jsonb") OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."trg_set_id_from_content"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.id := encode(digest(NEW.content, 'sha256'), 'hex');
    RETURN NEW;
END;
$$;
ALTER FUNCTION "public"."trg_set_id_from_content"() OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."update_key_by_content"("p_content" "text", "p_new_key" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_id text := encode(digest(p_content, 'sha256'), 'hex');
BEGIN
    UPDATE public.content_embeddings
    SET "key" = p_new_key
    WHERE id = v_id;
END;
$$;
ALTER FUNCTION "public"."update_key_by_content"("p_content" "text", "p_new_key" "text") OWNER TO "postgres";
SET default_tablespace = '';
SET default_table_access_method = "heap";
CREATE TABLE IF NOT EXISTS "public"."content_embeddings" (
    "content" "text" NOT NULL,
    "key" "text",
    "metadata" "jsonb",
    "embedding" "extensions"."vector"(768),
    "id" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "cluster_id" integer,
    "outlier_score" real,
    "cluster_prob" real
);
ALTER TABLE "public"."content_embeddings" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."rss_feed_processing" (
    "feed_url" "text" NOT NULL,
    "last_processed_at" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);
ALTER TABLE "public"."rss_feed_processing" OWNER TO "postgres";
ALTER TABLE ONLY "public"."content_embeddings"
    ADD CONSTRAINT "content_embeddings_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."rss_feed_processing"
    ADD CONSTRAINT "rss_feed_processing_pkey" PRIMARY KEY ("feed_url");
CREATE INDEX "idx_content_embeddings_created_at" ON "public"."content_embeddings" USING "btree" ("created_at");
CREATE INDEX "idx_rss_feed_processing_last_processed" ON "public"."rss_feed_processing" USING "btree" ("last_processed_at");
CREATE INDEX "news_embedding_hnsw_half" ON "public"."content_embeddings" USING "hnsw" ((("embedding")::"extensions"."halfvec"(3072)) "extensions"."halfvec_cosine_ops") WITH ("m"='16', "ef_construction"='200');
CREATE OR REPLACE TRIGGER "set_id_from_content" BEFORE INSERT OR UPDATE OF "content" ON "public"."content_embeddings" FOR EACH ROW EXECUTE FUNCTION "public"."trg_set_id_from_content"();
CREATE POLICY "Users can manage their own RSS feeds" ON "public"."rss_feed_processing" TO "authenticated" USING (true) WITH CHECK (true);
ALTER TABLE "public"."content_embeddings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."rss_feed_processing" ENABLE ROW LEVEL SECURITY;
ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";
GRANT ALL ON FUNCTION "public"."trg_set_id_from_content"() TO "anon";
GRANT ALL ON FUNCTION "public"."trg_set_id_from_content"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."trg_set_id_from_content"() TO "service_role";
GRANT ALL ON FUNCTION "public"."update_key_by_content"("p_content" "text", "p_new_key" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."update_key_by_content"("p_content" "text", "p_new_key" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_key_by_content"("p_content" "text", "p_new_key" "text") TO "service_role";
GRANT ALL ON TABLE "public"."content_embeddings" TO "anon";
GRANT ALL ON TABLE "public"."content_embeddings" TO "authenticated";
GRANT ALL ON TABLE "public"."content_embeddings" TO "service_role";
GRANT ALL ON TABLE "public"."rss_feed_processing" TO "anon";
GRANT ALL ON TABLE "public"."rss_feed_processing" TO "authenticated";
GRANT ALL ON TABLE "public"."rss_feed_processing" TO "service_role";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";
RESET ALL;
