import { NextResponse } from 'next/server';
import { pipeline, env } from '@xenova/transformers';
import { createClient } from '@supabase/supabase-js';
import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

env.allowLocalModels = false;
env.useBrowserCache = false;
env.cacheDir = '/tmp';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY
});

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

// Since Vercel AI SDK expects standard Request, we can read JSON from it.
export async function POST(req: Request) {
  try {
    const { prompt, userId } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const embedder = await EmbedderPipeline.getInstance();

    // Generate embedding for the search query
    const output = await embedder(prompt, {
      pooling: 'mean',
      normalize: true,
    });
    
    const query_embedding = Array.from(output.data);

    // Perform vector similarity search using our match_notes RPC
    const { data: vectorNotes, error: vectorError } = await supabase.rpc('match_notes', {
      query_embedding,
      match_threshold: 0.30, // significantly lower threshold for better recall
      match_count: 20,       // Top 20 results to let Gemini rerank
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
      .or(`title.ilike.%${prompt}%,content_markdown.ilike.%${prompt}%`)
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

    // Prepare context from notes
    const contextText = (notes || []).map((n: any, i: number) => {
      return `[Source ${i+1}: ${n.title}]\n${n.content_markdown || "No content"}`;
    }).join("\n\n---\n\n");

    const systemPrompt = `You are Vector Recall, an intelligent assistant for a user's personal "Second Brain" note-taking app.
The user's query is provided below. You have retrieved the following relevant notes from their vault:

${contextText}

Instructions:
1. If the user asks a specific question, answer it clearly and concisely based ONLY on the provided notes.
2. If the user just types a short keyword or topic (like "entra" or "react"), provide a helpful summary of what their notes say about that topic.
3. If the provided notes do not contain information relevant to the user's query, say "I couldn't find an answer to that in your vault." Do NOT invent information or hallucinate facts outside the provided notes.
4. Keep formatting clean and readable.`;

    // Stream text using Gemini 2.5 Flash
    const result = streamText({
      model: google('gemini-2.5-flash'),
      system: systemPrompt,
      prompt: prompt,
    });

    // To pass the sources back to the client along with the stream, 
    // Vercel AI SDK supports custom headers or returning a custom StreamData,
    // but the easiest way is to append them as a header.
    const response = result.toTextStreamResponse({
      headers: {
        'x-sources': Buffer.from(JSON.stringify(notes || [])).toString('base64'),
      }
    });

    return response;

  } catch (error: any) {
    console.error('Ask API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
