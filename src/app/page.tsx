"use client"
import * as React from "react"
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from "react-resizable-panels"
import { TopBar } from "@/components/TopBar"
import { LeftSidebar } from "@/components/LeftSidebar"
import { RightSidebar } from "@/components/RightSidebar"
import { Editor } from "@/components/Editor"
import { useNotes } from "@/hooks/useNotes"

import { CommandPalette } from "@/components/CommandPalette"
import { SettingsDialog } from "@/components/SettingsDialog"
import { HistoryDialog } from "@/components/HistoryDialog"
import { HelpDialog } from "@/components/HelpDialog"
import { extractTags } from "@/utils/markdownParser"

export default function AppShell() {
  const [leftCollapsed, setLeftCollapsed] = React.useState(false);
  const [rightCollapsed, setRightCollapsed] = React.useState(false);

  const leftPanelRef = React.useRef<any>(null);
  const rightPanelRef = React.useRef<any>(null);

  const { notes, loading, isSaving, createNote, updateNote, deleteNote, refreshNotes } = useNotes();
  const [activeNoteId, setActiveNoteId] = React.useState<string | null>(null);
  const [activeTag, setActiveTag] = React.useState<string | null>(null);

  const allTags = React.useMemo(() => {
    const tags = new Set<string>();
    notes.forEach(note => {
      extractTags(note.content_markdown || "").forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [notes]);

  const tagCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    notes.forEach(note => {
      extractTags(note.content_markdown || "").forEach(tag => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });
    return counts;
  }, [notes]);

  // Dialog states
  const [cmdOpen, setCmdOpen] = React.useState(false);
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [historyOpen, setHistoryOpen] = React.useState(false);
  const [helpOpen, setHelpOpen] = React.useState(false);

  // Auto-select first note if none is selected
  React.useEffect(() => {
    if (!loading && notes.length > 0 && !activeNoteId) {
      setActiveNoteId(notes[0].id);
    }
  }, [notes, loading, activeNoteId]);

  const activeNote = notes.find(n => n.id === activeNoteId);

  const toggleLeft = () => {
    const panel = leftPanelRef.current;
    if (panel) {
      if (panel.isCollapsed()) {
        panel.expand();
        setLeftCollapsed(false);
      } else {
        panel.collapse();
        setLeftCollapsed(true);
      }
    }
  };

  const toggleRight = () => {
    const panel = rightPanelRef.current;
    if (panel) {
      if (panel.isCollapsed()) {
        panel.expand();
        setRightCollapsed(false);
      } else {
        panel.collapse();
        setRightCollapsed(true);
      }
    }
  };

  const handleCreateNote = async () => {
    const newNote = await createNote();
    if (newNote) {
      setActiveNoteId(newNote.id);
    }
  };

  const handleDeleteNote = async (id: string) => {
    await deleteNote(id);
    if (activeNoteId === id) {
      setActiveNoteId(null);
    }
  };

  const handleUpdateContent = React.useCallback((content: string) => {
    if (activeNoteId) {
      const titleMatch = content.match(/^#\s+(.*)/m);
      const title = titleMatch ? titleMatch[1].trim() : "Untitled Note";
      updateNote(activeNoteId, { content_markdown: content, title });
    }
  }, [activeNoteId, updateNote]);

  const handleLinkClick = async (title: string) => {
    const existingNote = notes.find(n => n.title.toLowerCase() === title.toLowerCase());
    if (existingNote) {
      setActiveNoteId(existingNote.id);
    } else {
      const newNote = await createNote({ title });
      if (newNote) setActiveNoteId(newNote.id);
    }
  };

  return (
    <div className="w-screen h-screen overflow-hidden text-[var(--fg-0)] bg-[var(--bg-0)]">
      <CommandPalette open={cmdOpen} setOpen={setCmdOpen} notes={notes} onSelectNote={setActiveNoteId} />
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} onImportComplete={refreshNotes} />
      <HistoryDialog open={historyOpen} onOpenChange={setHistoryOpen} noteId={activeNoteId} onRestore={(content, title) => {
        if (activeNoteId) {
          updateNote(activeNoteId, { content_markdown: content, title });
        }
      }} />

      <PanelGroup orientation="horizontal">
        {/* LEFT SIDEBAR */}
        <Panel 
          panelRef={leftPanelRef}
          defaultSize="18%" 
          minSize="12%" 
          maxSize="30%" 
          collapsible 
          collapsedSize="4%"
          onResize={() => {
            if (leftPanelRef.current) setLeftCollapsed(leftPanelRef.current.isCollapsed());
          }}
          className="relative transition-all duration-300 ease-in-out"
        >
          <LeftSidebar 
            notes={notes} 
            activeId={activeNoteId} 
            onSelect={setActiveNoteId}
            onCreateNote={async (title?: string, folder_path?: string) => {
              const initialData: any = {};
              if (title) initialData.title = title;
              if (folder_path) initialData.folder_path = folder_path;
              
              const newNote = await createNote(initialData);
              if (newNote) {
                if (newNote.title !== '.keep') setActiveNoteId(newNote.id);
                if (window.innerWidth < 768) setLeftCollapsed(true);
              }
            }}
            onDeleteNote={handleDeleteNote}
            onDeleteFolder={(folderPath: string) => {
              notes.forEach((n: any) => {
                if (n.folder_path === folderPath || n.folder_path?.startsWith(folderPath + '/')) {
                  deleteNote(n.id);
                }
              });
            }}
            onMoveNode={(node: any, newPath: string) => {
              if (node.type === 'note') {
                updateNote(node.id, { folder_path: newPath });
              } else if (node.type === 'folder') {
                const newBasePath = newPath ? `${newPath}/${node.name}` : node.name;
                // Find all notes inside this folder and update their paths
                notes.forEach((n: any) => {
                  if (n.folder_path === node.path || n.folder_path?.startsWith(node.path + '/')) {
                    const relativePath = n.folder_path.substring(node.path.length);
                    const updatedPath = relativePath ? `${newBasePath}${relativePath}` : newBasePath;
                    updateNote(n.id, { folder_path: updatedPath });
                  }
                });
              }
            }}
            collapsed={leftCollapsed} 
            onToggle={toggleLeft} 
            activeTag={activeTag}
            setActiveTag={setActiveTag}
            tagCounts={tagCounts}
          />
        </Panel>

        <PanelResizeHandle className="vresizer" />

        {/* CENTER MAIN */}
        <Panel defaultSize="62%" className="flex flex-col">
          <TopBar 
            onToggleLeft={toggleLeft} 
            onToggleRight={toggleRight} 
            onOpenCmdK={() => setCmdOpen(true)}
            onOpenAsk={() => {
              setCmdOpen(true);
              setTimeout(() => {
                const input = document.querySelector('input[placeholder*="Search vault"]');
                if (input) {
                  (input as HTMLInputElement).value = "? ";
                  input.dispatchEvent(new Event('input', { bubbles: true }));
                }
              }, 50);
            }}
            onOpenSettings={() => setSettingsOpen(true)}
            onOpenHistory={() => setHistoryOpen(true)}
            onOpenHelp={() => setHelpOpen(true)}
            breadcrumb={["Vault", activeNote?.title || "Untitled Note"]} 
            isSaving={isSaving}
          />
          
          <main className="flex-1 overflow-hidden relative flex flex-col">
            <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />
            <div className="scroll-y w-full h-full relative z-10 px-8 py-10 md:px-16 md:py-16">
              
              <div className="max-w-3xl mx-auto h-full flex flex-col">
                {loading ? (
                  <div className="text-[var(--fg-2)]">Loading notes...</div>
                ) : activeNote ? (
                  <>
                    <div className="mb-4">
                      <div className="flex items-center gap-3 text-[11.5px] text-[var(--fg-2)] mono">
                        <span>Created: {new Date(activeNote.created_at).toLocaleDateString()}</span>
                        <span>Modified: {new Date(activeNote.updated_at).toLocaleTimeString()}</span>
                      </div>
                    </div>
                    <Editor 
                      initialContent={activeNote.content_markdown || `# ${activeNote.title}\n\nStart typing...`} 
                      onUpdate={handleUpdateContent} 
                      noteTitles={notes.map(n => n.title)}
                      tags={allTags}
                      onLinkClick={handleLinkClick}
                    />
                  </>
                ) : (
                  <div className="text-center text-[var(--fg-2)] mt-20">
                    <p>No notes found. Create a new note to get started.</p>
                    <button onClick={handleCreateNote} className="mt-4 px-4 py-2 rounded bg-[var(--acc-soft)] text-[var(--acc)] hover:opacity-80">
                      Create Note
                    </button>
                  </div>
                )}
              </div>

            </div>
          </main>
        </Panel>

        <PanelResizeHandle className="vresizer" />

        {/* RIGHT SIDEBAR */}
        <Panel 
          panelRef={rightPanelRef}
          defaultSize="20%" 
          minSize="15%" 
          maxSize="35%" 
          collapsible 
          collapsedSize="4%"
          onResize={() => {
            if (rightPanelRef.current) setRightCollapsed(rightPanelRef.current.isCollapsed());
          }}
          className="relative transition-all duration-300 ease-in-out"
        >
          <RightSidebar 
            notes={notes}
            activeId={activeNoteId}
            onLinkClick={setActiveNoteId}
            onUpdateNote={updateNote}
            collapsed={rightCollapsed} 
            onToggle={toggleRight} 
          />
        </Panel>

      </PanelGroup>

      <CommandPalette open={cmdOpen} setOpen={setCmdOpen} notes={notes} onSelectNote={setActiveNoteId} />
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
      <HistoryDialog open={historyOpen} onOpenChange={setHistoryOpen} noteId={activeNoteId} onRestore={(content, title) => updateNote(activeNoteId!, { content_markdown: content, title })} />
      <HelpDialog open={helpOpen} setOpen={setHelpOpen} />
    </div>
  )
}
