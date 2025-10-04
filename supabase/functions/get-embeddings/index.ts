import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { InferenceClient } from "npm:@huggingface/inference";
import { createClient } from 'npm:@supabase/supabase-js@2'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json'
};

const MODEL_ID = 'google/embeddinggemma-300m';
const EXPECTED_DIMENSION = 768;

type EmbeddingType = 'query' | 'document';

interface RequestBody {
  query: string;
  type?: EmbeddingType;
}

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: CORS_HEADERS
  });
}

function extractEmbedding(data: unknown): number[] {
  if (!Array.isArray(data)) {
    throw new Error(`Expected array, got ${typeof data}`);
  }

  // Nested array: [[...vector...]]
  if (Array.isArray(data[0])) {
    return data[0] as number[];
  }

  // Flat array: [...vector...]
  if (typeof data[0] === 'number') {
    return data as number[];
  }

  throw new Error(`Invalid embedding format: ${JSON.stringify(data).substring(0, 200)}`);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  try {
    const { query, type = 'query' }: RequestBody = await req.json();

    if (!query) {
      return jsonResponse({ error: 'Query text is required' }, 400);
    }

    if (type !== 'query' && type !== 'document') {
      return jsonResponse({ error: 'Type must be "query" or "document"' }, 400);
    }

    const hfApiKey = Deno.env.get('HUGGINGFACE_API_KEY');
    if (!hfApiKey) {
      return jsonResponse({ error: 'HuggingFace API key not configured' }, 500);
    }

    const client = new InferenceClient(hfApiKey);

    const embeddingData = await client.featureExtraction({
      model: MODEL_ID,
      inputs: [query]
    });

    const embedding = extractEmbedding(embeddingData);

    if (embedding.length !== EXPECTED_DIMENSION) {
      console.warn(`Expected ${EXPECTED_DIMENSION} dimensions, got ${embedding.length}`);
    }

    // When running locally, SUPABASE_URL gets overridden to http://kong:8000
    // Use custom env vars to connect to cloud instead
    const supabaseUrl = Deno.env.get('SB_CLOUD_URL')!
    const supabaseKey = Deno.env.get('SB_CLOUD_SERVICE_ROLE_KEY')!

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Search for similar content using the embedding
    const { data, error } = await supabase.rpc('match_content_embeddings', {
      query_embedding: embedding,
      match_threshold: 0.7,
      match_count: 10,
    })

    if (error) {
      throw error
    }

    return new Response(
      JSON.stringify({ results: data }),
      { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error);
    return jsonResponse({
      error: error.message,
      stack: error.stack
    }, 500);
  }
});
