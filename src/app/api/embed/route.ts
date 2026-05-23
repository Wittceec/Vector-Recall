import { NextResponse } from 'next/server';
import { pipeline, env } from '@xenova/transformers';

export const runtime = 'edge';

// Skip local model checks and use the HuggingFace Hub directly
env.allowLocalModels = false;
env.useBrowserCache = false;
env.cacheDir = '/tmp';
env.backends.onnx.wasm.numThreads = 1;

// We use a singleton pattern to ensure the model is only loaded once
class EmbedderPipeline {
  static task = 'feature-extraction' as const;
  static model = 'Supabase/gte-small';
  static instance: any = null;

  static async getInstance(progress_callback?: Function) {
    if (this.instance === null) {
      this.instance = pipeline(this.task, this.model, { progress_callback });
    }
    return this.instance;
  }
}

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const embedder = await EmbedderPipeline.getInstance();

    // Generate embeddings
    const output = await embedder(text, {
      pooling: 'mean',
      normalize: true,
    });

    // The output is a Float32Array, convert it to a regular array
    const embedding = Array.from(output.data);

    return NextResponse.json({ embedding });
  } catch (error: any) {
    console.error('Embedding error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
