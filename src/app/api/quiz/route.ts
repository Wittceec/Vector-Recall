import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { content } = await req.json();

    if (!content) {
      return new NextResponse("Content is required", { status: 400 });
    }

    // Generate quiz using Gemini
    const result = await generateObject({
      model: google('gemini-2.5-flash'),
      schema: z.object({
        questions: z.array(
          z.object({
            question: z.string().describe("The multiple choice question based on the text."),
            options: z.array(z.string()).min(3).max(5).describe("The multiple choice options. Exactly one should be correct."),
            correctAnswerIndex: z.number().describe("The index (0-based) of the correct option in the options array."),
            explanation: z.string().describe("A brief explanation of why the answer is correct.")
          })
        ).min(3).max(7).describe("An array of 3 to 7 multiple choice questions.")
      }),
      system: "You are a helpful study assistant. Your task is to generate a high-quality multiple choice quiz based strictly on the provided markdown text. Do not test on information outside of the text.",
      prompt: `Generate a multiple-choice quiz based on the following notes:\n\n${content}`
    });

    return NextResponse.json(result.object);

  } catch (error) {
    console.error('[QUIZ_ERROR]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
