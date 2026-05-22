import * as React from "react"
import { createClient } from "@/utils/supabase/server"
import { notFound } from "next/navigation"
import { Editor } from "@/components/Editor"

export default async function PublicNotePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  const supabase = await createClient();

  // We query the database as an anonymous user.
  // Because of our RLS policy, this will ONLY succeed if is_public = true.
  const { data: note, error } = await supabase
    .from('notes')
    .select('title, content_markdown, updated_at')
    .eq('id', id)
    .single();

  if (error || !note) {
    console.error("Failed to fetch public note:", error);
    notFound();
  }

  return (
    <div className="min-h-screen bg-[var(--bg-0)] text-[var(--fg-0)] flex flex-col items-center py-12 px-4 sm:px-8">
      <div className="w-full max-w-3xl space-y-8">
        <header className="border-b border-[var(--bd-1)] pb-8 mb-8">
          <h1 className="text-3xl font-bold mb-2">{note.title || "Untitled Note"}</h1>
          <div className="text-[13px] text-[var(--fg-3)] mono">
            Last updated: {new Date(note.updated_at).toLocaleString()}
          </div>
        </header>
        
        <main className="prose-vc-container">
          <Editor 
            initialContent={note.content_markdown || ""} 
            editable={false}
          />
        </main>

        <footer className="pt-12 mt-12 border-t border-[var(--bd-1)] text-center text-[12px] text-[var(--fg-3)]">
          Published via <span className="font-semibold text-[var(--fg-1)]">Vector Recall</span>
        </footer>
      </div>
    </div>
  );
}
