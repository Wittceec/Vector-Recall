"use client"
import * as React from "react"
import { Command } from "cmdk"
import { Icon } from "./Icons"
import { Note } from "@/hooks/useNotes"
import { createClient } from "@/utils/supabase/client"

export function CommandPalette({ 
  open, 
  setOpen, 
  notes, 
  onSelectNote 
}: { 
  open: boolean; 
  setOpen: (open: boolean) => void;
  notes: Note[];
  onSelectNote: (id: string) => void;
}) {
  const [query, setQuery] = React.useState("");
  const [askMode, setAskMode] = React.useState(false);
  const [isSearching, setIsSearching] = React.useState(false);
  const [semanticResults, setSemanticResults] = React.useState<any[]>([]);
  const [askSources, setAskSources] = React.useState<any[]>([]);
  const supabase = createClient();

  const [completion, setCompletion] = React.useState("");
  const [isAsking, setIsAsking] = React.useState(false);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen(true)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [setOpen])

  // Watch for '?' prefix to enter Ask mode
  React.useEffect(() => {
    if (query.startsWith("?")) {
      setAskMode(true);
    } else if (query === "") {
      setAskMode(false);
      setSemanticResults([]);
    }
  }, [query]);

  const handleAsk = async () => {
    if (!query.trim() || query === "?") return;
    const searchQuery = query.replace(/^\?\s*/, "");
    
    // Clear previous results
    setCompletion("");
    setAskSources([]);
    
    try {
      setIsAsking(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");

      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: searchQuery, userId: user.id })
      });

      if (!res.ok) throw new Error("API failed");

      const sourcesHeader = res.headers.get("x-sources");
      if (sourcesHeader) {
        try {
          setAskSources(JSON.parse(atob(sourcesHeader)));
        } catch(e) {}
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      
      if (reader) {
        let chunk = await reader.read();
        while (!chunk.done) {
          const text = decoder.decode(chunk.value, { stream: true });
          setCompletion(prev => prev + text);
          chunk = await reader.read();
        }
      }
    } catch (e) {
      console.error(e);
      setCompletion("An error occurred while asking Vector.");
    } finally {
      setIsAsking(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)}>
      <div 
        className="w-full max-w-xl bg-[var(--bg-1)] border border-[var(--bd-1)] rounded-xl shadow-2xl overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
        style={{
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px var(--bd-1)",
        }}
      >
        <Command label="Command Menu" className="flex flex-col w-full h-full" shouldFilter={!askMode}>
          <div className="flex items-center px-4 py-3 border-b border-[var(--bd-1)] text-[var(--fg-1)]">
            {askMode ? (
              <Icon name="sparkles" size={16} className="text-[var(--acc)]" />
            ) : (
              <Icon name="search" size={16} />
            )}
            
            <Command.Input 
              autoFocus
              value={query}
              onValueChange={setQuery}
              onKeyDown={(e) => {
                if (e.key === "Enter" && askMode) {
                  handleAsk();
                }
              }}
              placeholder="Search vault, type '?' to Ask Vector..." 
              className="flex-1 ml-3 bg-transparent border-none outline-none text-[14px] text-[var(--fg-0)] placeholder-[var(--fg-3)]"
            />
            {askMode ? (
              <button onClick={handleAsk} className="mono text-[10px] text-[var(--acc)] bg-[var(--acc-soft)] px-2 py-1 rounded hover:opacity-80 transition-opacity">Ask</button>
            ) : (
              <kbd className="mono text-[10px] text-[var(--fg-3)] bg-[var(--bg-2)] px-1.5 py-0.5 rounded border border-[var(--bd-2)]">ESC</kbd>
            )}
          </div>
          
          <Command.List className="max-h-[300px] overflow-y-auto p-2 scroll-y">
            {isAsking && !completion ? (
              <div className="py-6 text-center text-[13px] text-[var(--fg-2)] flex flex-col items-center gap-3">
                <Icon name="sparkles" size={18} className="animate-pulse text-[var(--acc)]" />
                Thinking...
              </div>
            ) : completion ? (
              <div className="p-3 text-[14px] leading-relaxed text-[var(--fg-1)]">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-1.5 rounded-md bg-[var(--acc-soft)] text-[var(--acc)] shrink-0">
                    <Icon name="sparkles" size={14} />
                  </div>
                  <div className="flex-1 prose-vc text-[14px] whitespace-pre-wrap">{completion}</div>
                </div>
                
                {askSources.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-[var(--bd-1)]">
                    <div className="text-[10px] font-semibold tracking-wider uppercase text-[var(--fg-3)] mb-2">Sources</div>
                    <div className="flex flex-col gap-1">
                      {askSources.map(res => (
                        <button
                          key={res.id}
                          onClick={() => {
                            onSelectNote(res.id);
                            setOpen(false);
                            setQuery("");
                            setCompletion("");
                            setAskSources([]);
                          }}
                          className="flex items-center gap-2 text-left p-2 rounded-md hover:bg-[var(--bg-3)] transition-colors text-[13px] text-[var(--fg-1)]"
                        >
                          <Icon name="file" size={12} className="text-[var(--fg-3)]" />
                          <span className="truncate flex-1">{res.title || "Untitled"}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                {!askMode && (
                  <>
                    <Command.Group heading="Notes" className="text-[11px] font-medium text-[var(--fg-3)] px-2 py-1.5 uppercase tracking-wider">
                      {notes.map(note => (
                        <Command.Item 
                          key={note.id}
                          value={note.title}
                          onSelect={() => {
                            onSelectNote(note.id);
                            setOpen(false);
                          }}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer text-[13px] text-[var(--fg-1)] data-[selected=true]:bg-[var(--bg-3)] data-[selected=true]:text-[var(--fg-0)]"
                        >
                          <Icon name="file" size={14} />
                          <span>{note.title || "Untitled"}</span>
                          <span className="ml-auto text-[11px] text-[var(--fg-3)] mono">{new Date(note.updated_at).toLocaleDateString()}</span>
                        </Command.Item>
                      ))}
                    </Command.Group>

                    <Command.Separator className="h-px bg-[var(--bd-1)] my-2" />

                    <Command.Group heading="Actions" className="text-[11px] font-medium text-[var(--fg-3)] px-2 py-1.5 uppercase tracking-wider">
                      <Command.Item 
                        onSelect={() => {
                          setOpen(false);
                          // handle create new note via callback if implemented here
                        }}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer text-[13px] text-[var(--fg-1)] data-[selected=true]:bg-[var(--bg-3)] data-[selected=true]:text-[var(--fg-0)]"
                      >
                        <Icon name="plus" size={14} />
                        <span>Create new note</span>
                      </Command.Item>
                    </Command.Group>
                  </>
                )}
              </>
            )}
          </Command.List>
        </Command>
      </div>
    </div>
  )
}
