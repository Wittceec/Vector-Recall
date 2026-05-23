import { NextResponse } from 'next/server';
import { pipeline, env } from '@xenova/transformers';

import { createClient } from '@supabase/supabase-js';

env.allowLocalModels = false;
env.useBrowserCache = false;
env.cacheDir = '/tmp';

// Create a direct Supabase client using service role for the API
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

class EmbedderPipeline {
  static task = 'feature-extraction' as const;
  static model = 'Supabase/gte-small';
  static instance: any = null;

  static async getInstance() {
    if (this.instance === null) {
      this.instance = pipeline(this.task, this.model);
    }
    return this.instance;
  }
}

export async function POST(req: Request) {
  try {
    const { query, userId } = await req.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const embedder = await EmbedderPipeline.getInstance();

    // Generate embedding for the search query
    const output = await embedder(query, {
      pooling: 'mean',
      normalize: true,
    });
    
    const query_embedding = Array.from(output.data);

    // Perform vector similarity search using our match_notes RPC
    const { data: vectorNotes, error: vectorError } = await supabase.rpc('match_notes', {
      query_embedding,
      match_threshold: 0.30, // significantly lower threshold for better recall
      match_count: 20,       // Top 20 results
      p_user_id: userId
    });

    if (vectorError) {
      console.error('RPC Error:', vectorError);
      return NextResponse.json({ error: vectorError.message }, { status: 500 });
    }

    // Perform basic keyword search as fallback for short/exact queries
    const { data: keywordNotes, error: keywordError } = await supabase
      .from('notes')
      .select('id, title, content_markdown')
      .eq('user_id', userId)
      .or(`title.ilike.%${query}%,content_markdown.ilike.%${query}%`)
      .limit(10);

    if (keywordError) {
      console.error('Keyword Search Error:', keywordError);
    }

    // Combine and deduplicate
    const allNotes = [...(vectorNotes || []), ...(keywordNotes || [])];
    const uniqueNotesMap = new Map();
    for (const n of allNotes) {
      if (!uniqueNotesMap.has(n.id)) {
        uniqueNotesMap.set(n.id, n);
      }
    }
    const notes = Array.from(uniqueNotesMap.values());

    return NextResponse.json({ results: notes || [] });
  } catch (error: any) {
    console.error('Search error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
