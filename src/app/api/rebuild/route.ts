import { NextResponse } from 'next/server';
import { pipeline, env } from '@xenova/transformers';
import { createClient } from '@supabase/supabase-js';

env.allowLocalModels = false;
env.useBrowserCache = false;
env.cacheDir = '/tmp';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

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

export async function GET() {
  try {
    // Find all notes missing an embedding
    const { data: notes, error } = await supabase
      .from('notes')
      .select('id, title, content_markdown')
      .is('embedding', null);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!notes || notes.length === 0) {
      return NextResponse.json({ message: 'No notes need rebuilding. All vectors are up to date!' });
    }

    const embedder = await EmbedderPipeline.getInstance();
    let count = 0;

    for (const note of notes) {
      const textToEmbed = `${note.title || ''}\n\n${note.content_markdown || ''}`.trim();
      
      if (!textToEmbed) continue;

      const output = await embedder(textToEmbed, {
        pooling: 'mean',
        normalize: true,
      });
      
      const embedding = Array.from(output.data);

      await supabase
        .from('notes')
        .update({ embedding })
        .eq('id', note.id);
        
      count++;
    }

    return NextResponse.json({ 
      message: `Success! Rebuilt vectors for ${count} notes. You can now close this tab.` 
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
