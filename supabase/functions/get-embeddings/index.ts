import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { InferenceClient } from "npm:@huggingface/inference";
import { createClient } from 'npm:@supabase/supabase-js@2';
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json'
};
const MODEL_ID = 'google/embeddinggemma-300m';
const EXPECTED_DIMENSION = 768;
// ---- utils ----
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: CORS_HEADERS
  });
}
function extractEmbedding(data) {
  if (!Array.isArray(data)) throw new Error(`Expected array, got ${typeof data}`);
  if (Array.isArray(data[0])) return data[0];
  if (typeof data[0] === 'number') return data;
  throw new Error(`Invalid embedding format: ${JSON.stringify(data).slice(0, 200)}`);
}
/**
 * Remove any prefix from a key like "newsapi_article_8893469402".
 * Strategy: take the substring after the last underscore.
 * If no underscore is present, return the key unchanged.
 */ function baseKeyFromPrefixed(key) {
  if (!key) return null;
  const idx = key.lastIndexOf('_');
  return idx >= 0 ? key.slice(idx + 1) : key;
}
serve(async (req)=>{
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: CORS_HEADERS
    });
  }
  try {
    const { query, type = 'query' } = await req.json();
    if (!query) return jsonResponse({
      error: 'Query text is required'
    }, 400);
    if (type !== 'query' && type !== 'document') {
      return jsonResponse({
        error: 'Type must be "query" or "document"'
      }, 400);
    }
    const hfApiKey = Deno.env.get('HUGGINGFACE_API_KEY');
    if (!hfApiKey) return jsonResponse({
      error: 'HuggingFace API key not configured'
    }, 500);
    const client = new InferenceClient(hfApiKey);
    const embeddingData = await client.featureExtraction({
      model: MODEL_ID,
      inputs: [
        `task: clustering | query:${query}`
      ]
    });
    const embedding = extractEmbedding(embeddingData);
    if (embedding.length !== EXPECTED_DIMENSION) {
      console.warn(`Expected ${EXPECTED_DIMENSION} dimensions, got ${embedding.length}`);
    }
    const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
      global: {
        headers: {
          Authorization: req.headers.get('Authorization') ?? ''
        }
      }
    });
    // 1) Find similar content rows
    const { data: matches, error: matchError } = await supabase.rpc('match_content_embeddings', {
      query_embedding: embedding,
      match_threshold: 0.5,
      match_count: 100
    });
    if (matchError) throw matchError;
    // 2) Sort by similarity desc, then DEDUPE by canonical key (base_key if present, else original key)
    const sorted = (matches ?? []).sort((a, b)=>(b.similarity ?? 0) - (a.similarity ?? 0));
    // Keep the best (highest-similarity) per canonical id
    const seen = new Set();
    const deduped = [];
    for (const row of sorted){
      const originalKey = row.key ?? null;
      if (!originalKey) continue; // skip rows without a key
      const base = baseKeyFromPrefixed(originalKey);
      const canonical = base ?? originalKey;
      if (seen.has(canonical)) continue;
      seen.add(canonical);
      deduped.push({
        ...row,
        _base_key: base,
        _canonical: canonical
      });
    }
    // 3) Prepare unique base ids for article fetch (only those that actually exist)
    const baseIds = [
      ...new Set(deduped.map((r)=>r._base_key).filter(Boolean))
    ];
    // 4) Fetch related articles by news_id (deduped)
    const articlesByNewsId = {};
    if (baseIds.length > 0) {
      const { data: articles, error: artErr } = await supabase.from('news_articles').select('id, news_id, headline, description, image, published_at, source, original_link, trust_score, confidence_level, category, content').in('news_id', baseIds);
      if (artErr) throw artErr;
      for (const a of articles ?? []){
        articlesByNewsId[a.news_id] = a;
      }
    }
    // 5) Build response arrays/maps with NO duplicates
    const resultsArr = [];
    const resultsByKey = {};
    for (const row of deduped){
      const originalKey = row.key;
      const baseKey = row._base_key ?? null;
      const article = baseKey ? articlesByNewsId[baseKey] ?? null : null;
      const item = {
        similarity: row.similarity ?? 0,
        embedding_id: row.id,
        key: originalKey,
        base_key: baseKey,
        created_at: row.created_at ?? null,
        cluster_id: row.cluster_id ?? null,
        article
      };
      resultsArr.push(item);
      resultsByKey[originalKey] = item;
    }
    // Deterministic order: by similarity desc of the deduped set
    const order = resultsArr.map((r)=>r.key);
    return new Response(JSON.stringify({
      order,
      resultsByKey,
      count: resultsArr.length,
      // Optional: expose how many were removed
      meta: {
        requested: (matches ?? []).length,
        returned_unique: resultsArr.length
      }
    }), {
      headers: CORS_HEADERS
    });
  } catch (error) {
    console.error('Error:', error);
    return jsonResponse({
      error: error.message,
      stack: error.stack
    }, 500);
  }
});
