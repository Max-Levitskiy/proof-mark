import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

/**
 * Search for similar content using vector similarity search
 *
 * @param {string} query - The search query text
 * @param {number} matchThreshold - Minimum similarity threshold (0-1), default 0.7
 * @param {number} matchCount - Maximum number of results to return, default 10
 * @returns {Object} - Array of similar content with similarity scores
 */
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { query, matchThreshold = 0.7, matchCount = 10 } = await req.json();

    console.log('Received search query:', query);
    console.log('Match threshold:', matchThreshold);
    console.log('Match count:', matchCount);

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Query text is required and must be a non-empty string' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate parameters
    if (typeof matchThreshold !== 'number' || matchThreshold < 0 || matchThreshold > 1) {
      return new Response(
        JSON.stringify({ error: 'matchThreshold must be a number between 0 and 1' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (typeof matchCount !== 'number' || matchCount < 1 || matchCount > 100) {
      return new Response(
        JSON.stringify({ error: 'matchCount must be a number between 1 and 100' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get Supabase credentials
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Supabase credentials not configured');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Step 1: Generate embedding for the query using the get-embeddings function
    console.log('Calling get-embeddings function...');
    const embeddingResponse = await fetch(`${supabaseUrl}/functions/v1/get-embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`
      },
      body: JSON.stringify({ query })
    });

    if (!embeddingResponse.ok) {
      const errorText = await embeddingResponse.text();
      console.error('Failed to generate embedding:', errorText);
      return new Response(
        JSON.stringify({
          error: 'Failed to generate query embedding',
          details: errorText
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const { embedding, dimension } = await embeddingResponse.json();
    console.log('Query embedding generated, dimension:', dimension);

    if (!embedding || !Array.isArray(embedding) || embedding.length === 0) {
      console.error('Invalid embedding received from get-embeddings function');
      return new Response(
        JSON.stringify({ error: 'Failed to generate valid embedding' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Step 2: Perform vector similarity search using Supabase
    console.log('Initializing Supabase client...');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Calling match_content_embeddings RPC...');
    const { data: results, error: searchError } = await supabase.rpc('match_content_embeddings', {
      query_embedding: embedding,
      match_threshold: matchThreshold,
      match_count: matchCount
    });

    if (searchError) {
      console.error('Vector search error:', searchError);
      return new Response(
        JSON.stringify({
          error: 'Failed to perform similarity search',
          details: searchError.message
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`Found ${results?.length || 0} matching results`);

    // Return the search results
    return new Response(
      JSON.stringify({
        query,
        matchThreshold,
        matchCount,
        resultsCount: results?.length || 0,
        results: results || []
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
        stack: error.stack
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
