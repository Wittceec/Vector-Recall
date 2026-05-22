import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'

export type Note = {
  id: string;
  user_id: string;
  title: string;
  content_markdown: string;
  created_at: string;
  updated_at: string;
  is_public: boolean;
}

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const supabase = createClient();
  const embedTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const historyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error("Error fetching notes:", error);
    } else {
      setNotes(data || []);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const generateEmbedding = async (id: string, text: string) => {
    if (!text.trim()) return;
    try {
      const res = await fetch('/api/embed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      if (res.ok) {
        const { embedding } = await res.json();
        // Update database silently
        await supabase
          .from('notes')
          .update({ embedding })
          .eq('id', id);
      }
    } catch (e) {
      console.error("Failed to generate embedding", e);
    } finally {
      setIsSaving(false);
    }
  };

  const createNote = async (title = "Untitled Note", content = "") => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('notes')
      .insert([{ 
        user_id: user.id, 
        title, 
        content_markdown: content 
      }])
      .select()
      .single();

    if (error) {
      console.error("Error creating note:", error);
      return null;
    }

    setNotes(prev => [data, ...prev]);
    return data as Note;
  };

  const updateNote = async (id: string, updates: Partial<Note>) => {
    setIsSaving(true);
    // Optimistic update
    setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updates, updated_at: new Date().toISOString() } : n));

    const { error } = await supabase
      .from('notes')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error("Error updating note:", error);
      setIsSaving(false);
    }

    // Debounce the heavy AI embedding task
    if (updates.content_markdown !== undefined) {
      if (embedTimeoutRef.current) clearTimeout(embedTimeoutRef.current);
      embedTimeoutRef.current = setTimeout(() => {
        generateEmbedding(id, updates.content_markdown!);
      }, 2000); // 2 second debounce
      
      // Debounce history snapshot for 60 seconds of inactivity (or just 60s since last type)
      if (historyTimeoutRef.current) clearTimeout(historyTimeoutRef.current);
      historyTimeoutRef.current = setTimeout(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const note = notes.find(n => n.id === id);
          if (note) {
            await supabase.from('note_history').insert({
              note_id: id,
              user_id: user.id,
              title: updates.title || note.title,
              content_markdown: updates.content_markdown
            });
          }
        }
      }, 60000); // 60 seconds
    } else {
      setIsSaving(false);
    }
  };

  const deleteNote = async (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting note:", error);
    }
  };

  return {
    notes,
    loading,
    isSaving,
    createNote,
    updateNote,
    deleteNote
  };
}
