"use client"
import * as React from "react"
import { Icon } from "./Icons"
import { NoteMenu } from "./NoteMenu"
import { Note } from "@/hooks/useNotes"

export const DEFAULT_FILE_TYPES = [
  { ext: "md",    label: "M", color: "oklch(0.82 0.10 195)", name: "Markdown note" },
  { ext: "ps1",   label: "P", color: "oklch(0.80 0.10 250)", name: "PowerShell" },
  { ext: "rs",    label: "R", color: "oklch(0.74 0.10 30)",  name: "Rust" },
  { ext: "swift", label: "S", color: "oklch(0.78 0.10 25)",  name: "Swift" },
];

export const FileIcon = ({ name, types = DEFAULT_FILE_TYPES }: { name: string, types?: any[] }) => {
  const ext = name.split('.').pop()?.toLowerCase();
  const match = types.find(t => t.ext === ext);
  const color = match?.color || "var(--fg-3)";
  const label = match?.label || "\u2022";
  return (
    <span className="mono inline-flex items-center justify-center shrink-0" style={{
      width: 14, height: 14, fontSize: 9, fontWeight: 700,
      color, border: `1px solid ${color}`, borderRadius: 3, opacity: 0.85
    }}>{label}</span>
  );
};

const NoteNode = ({ note, activeId, onSelect, depth = 0 }: { note: Note, activeId: string | null, onSelect: (id: string) => void, depth?: number }) => {
  const isToday = new Date(note.created_at).toDateString() === new Date().toDateString();
  
  // Hide .keep files
  if (note.title === '.keep') return null;

  return (
    <div 
      draggable
      onDragStart={(e) => {
        e.stopPropagation();
        e.dataTransfer.setData('application/json', JSON.stringify({ type: 'note', id: note.id, path: note.folder_path || '' }));
      }}
      className={"tree-row " + (activeId === note.id ? "active" : "")} 
      style={{ paddingLeft: 12 + (depth * 14) }} 
      onClick={() => onSelect(note.id)}
    >
      <FileIcon name={note.title + ".md"} />
      <span className="truncate">{note.title || "Untitled"}</span>
      {isToday && <span className="ml-auto mono text-[10px] px-1 rounded shrink-0" style={{ background: "var(--acc-soft)", color: "var(--acc)" }}>today</span>}
    </div>
  );
};

const FolderNode = ({ name, path, children, activeId, onSelect, onMoveNode, onDeleteFolder, depth = 0, defaultExpanded = true }: any) => {
  const [expanded, setExpanded] = React.useState(defaultExpanded);
  
  return (
    <div>
      <div 
        draggable
        onDragStart={(e) => {
          e.stopPropagation();
          e.dataTransfer.setData('application/json', JSON.stringify({ type: 'folder', path, name }));
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.currentTarget.style.background = 'var(--bg-3)';
        }}
        onDragLeave={(e) => {
          e.currentTarget.style.background = '';
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.currentTarget.style.background = '';
          e.stopPropagation();
          try {
            const data = JSON.parse(e.dataTransfer.getData('application/json'));
            if (data.path === path || path.startsWith(data.path + '/')) return;
            onMoveNode?.(data, path);
          } catch(err) {}
        }}
        className="tree-row folder text-[var(--fg-2)] hover:text-[var(--fg-1)] cursor-pointer transition-colors group" 
        style={{ paddingLeft: 12 + (depth * 14) }} 
        onClick={() => setExpanded(!expanded)}
      >
        <span className={`transition-transform duration-200 shrink-0 ${expanded ? 'rotate-90' : ''}`}><Icon name="chev-right" size={11} /></span>
        <Icon name="folder" size={13} className={`shrink-0 ${expanded ? 'text-[var(--acc)]' : ''}`} />
        <span className="truncate font-medium flex-1">{name}</span>
        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 pr-1" onClick={e => e.stopPropagation()}>
          <button 
            title="Rename folder" 
            className="hover:text-[var(--acc)] transition-colors"
            onClick={() => {
              const newName = window.prompt("Rename folder:", name);
              if (newName && newName !== name) {
                const parts = path.split('/');
                parts[parts.length - 1] = newName;
                onMoveNode?.({ type: 'folder', path, name }, parts.slice(0, -1).join('/'));
              }
            }}
          >
            <Icon name="edit" size={11} />
          </button>
          <button 
            title="Delete folder" 
            className="hover:text-[#e06c75] transition-colors"
            onClick={() => {
              if (window.confirm(`Delete folder "${name}" and all notes inside it?`)) {
                onDeleteFolder?.(path);
              }
            }}
          >
            <Icon name="x" size={11} />
          </button>
        </div>
      </div>
      {expanded && (
        <div>
          {children.map((child: any) => 
            child.type === 'folder' ? (
              <FolderNode key={child.path} {...child} activeId={activeId} onSelect={onSelect} onMoveNode={onMoveNode} onDeleteFolder={onDeleteFolder} depth={depth + 1} />
            ) : (
              <NoteNode key={child.path} note={child.note} activeId={activeId} onSelect={onSelect} depth={depth + 1} />
            )
          )}
        </div>
      )}
    </div>
  );
};

type TreeNode = {
  name: string;
  path: string;
  type: 'folder' | 'note';
  children?: TreeNode[];
  note?: Note;
};

const buildTree = (notes: Note[]) => {
  const root: TreeNode = { name: 'root', path: '', type: 'folder', children: [] };
  
  notes.forEach(note => {
    let current = root;
    const pathParts = (note.folder_path || '').split('/').filter(Boolean);
    
    let currentPath = '';
    pathParts.forEach(part => {
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      let existing = current.children!.find(c => c.name === part && c.type === 'folder');
      if (!existing) {
        existing = { name: part, path: currentPath, type: 'folder', children: [] };
        current.children!.push(existing);
      }
      current = existing;
    });
    
    current.children!.push({
      name: note.title,
      path: note.id,
      type: 'note',
      note
    });
  });

  const sortTree = (node: TreeNode) => {
    if (node.children) {
      node.children.sort((a, b) => {
        if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
      node.children.forEach(sortTree);
    }
  };
  sortTree(root);
  return root;
};

interface LeftSidebarProps {
  notes: any[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onCreateNote: (title?: string, folder_path?: string) => void;
  onDeleteNote: (id: string) => void;
  onMoveNode?: (node: any, newPath: string) => void;
  onDeleteFolder?: (path: string) => void;
  collapsed?: boolean;
  onToggle?: () => void;
  activeTag?: string | null;
  setActiveTag?: (tag: string | null) => void;
  tagCounts?: Record<string, number>;
}

export const LeftSidebar = ({ 
  notes = [], activeId = null, onSelect = () => {}, onCreateNote = () => {}, onDeleteNote, onMoveNode, onDeleteFolder,
  collapsed = false, onToggle, activeTag, setActiveTag, tagCounts 
}: LeftSidebarProps) => {
  const [query, setQuery] = React.useState("");
  const [tab, setTab] = React.useState<"files" | "tags">("files");

  const filteredNotes = React.useMemo(() => {
    let result = notes;
    if (activeTag) {
      result = result.filter((n: Note) => (n.content_markdown || "").toLowerCase().includes(activeTag.toLowerCase()));
    }
    if (query) {
      result = result.filter((n: Note) => n.title.toLowerCase().includes(query.toLowerCase()));
    }
    return result;
  }, [notes, query, activeTag]);

  const tree = React.useMemo(() => buildTree(filteredNotes), [filteredNotes]);
  const filteredTree = tree.children || [];

  const sortedTags = React.useMemo(() => {
    if (!tagCounts) return [];
    return Object.entries(tagCounts).sort((a: any, b: any) => b[1] - a[1]);
  }, [tagCounts]);

  if (collapsed) {
    return (
      <aside className="relative flex flex-col items-center gap-3 py-3 w-full h-full" style={{ background: "var(--bg-1)" }}>
        <button className="edge-tab right-edge" onClick={onToggle} title="Expand sidebar"><Icon name="chev-right" size={11} /></button>
        <button className="p-2 rounded-md hover:bg-[var(--bg-3)] text-[var(--fg-2)]" title="Search"><Icon name="search" size={16} /></button>
        <button className="p-2 rounded-md hover:bg-[var(--bg-3)] text-[var(--fg-2)]" title="Files"><Icon name="folder" size={16} /></button>
        <button className="p-2 rounded-md hover:bg-[var(--bg-3)] text-[var(--fg-2)]" title="Graph"><Icon name="graph" size={16} /></button>
        <button className="p-2 rounded-md hover:bg-[var(--bg-3)] text-[var(--fg-2)]" title="Daily"><Icon name="calendar" size={16} /></button>
        <button className="p-2 rounded-md hover:bg-[var(--bg-3)] text-[var(--fg-2)]" title="Tags"><Icon name="tag" size={16} /></button>
        <div className="flex-1" />
        <button className="p-2 rounded-md hover:bg-[var(--bg-3)] text-[var(--fg-2)]" title="Settings"><Icon name="settings" size={16} /></button>
      </aside>
    );
  }

  return (
    <aside className="relative flex flex-col w-full h-full" style={{ background: "var(--bg-1)" }}>
      <button className="edge-tab right-edge" onClick={onToggle} title="Collapse sidebar"><Icon name="chev-left" size={11} /></button>
      <div className="px-3 pt-3 pb-2 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <span className="seclabel">Vault</span>
            <span className="mono text-[10.5px]" style={{ color: "var(--fg-3)" }}>· recall</span>
          </div>
          <div className="flex items-center gap-0.5">
            <button 
              onClick={() => {
                const name = window.prompt("Folder name:");
                if (name) onCreateNote('.keep', name);
              }} 
              className="p-1 rounded hover:bg-[var(--bg-3)] text-[var(--fg-2)]" 
              title="New folder"
            >
              <Icon name="folder" size={13} />
            </button>
            <button onClick={() => onCreateNote()} className="p-1 rounded hover:bg-[var(--bg-3)] text-[var(--fg-2)]" title="New note"><Icon name="plus" size={13} /></button>
            <NoteMenu 
              onDelete={() => activeId && onDeleteNote?.(activeId)}
              onRename={() => {
                const titleEl = document.querySelector('.prose-vc h1') as HTMLElement;
                if (titleEl) titleEl.focus();
              }}
            >
              <div className="p-1 rounded hover:bg-[var(--bg-3)] text-[var(--fg-2)] cursor-pointer" title="More"><Icon name="more" size={13} /></div>
            </NoteMenu>
          </div>
        </div>

        <div className="relative">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--fg-3)]"><Icon name="search" size={13} /></span>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Filter files…"
            className="w-full pl-8 pr-2 py-1.5 text-[12.5px] rounded-md"
            style={{ background: "#0a0d12", border: "1px solid var(--bd-1)", color: "var(--fg-0)" }}
          />
        </div>
      </div>

      <div className="px-3 pt-2 pb-1 shrink-0 flex gap-4">
        <button className={`seclabel hover:text-[var(--fg-0)] transition-colors ${tab === 'files' ? 'text-[var(--fg-0)]' : 'text-[var(--fg-3)]'}`} onClick={() => setTab("files")}>Notes</button>
        <button className={`seclabel hover:text-[var(--fg-0)] transition-colors ${tab === 'tags' ? 'text-[var(--fg-0)]' : 'text-[var(--fg-3)]'}`} onClick={() => setTab("tags")}>Tags</button>
      </div>

      <div 
        className="flex-1 scroll-y px-1.5 pb-3 min-h-[50px]"
        onDragOver={(e) => {
          e.preventDefault();
        }}
        onDrop={(e) => {
          e.preventDefault();
          try {
            const data = JSON.parse(e.dataTransfer.getData('application/json'));
            if (data.path === '') return;
            onMoveNode?.(data, '');
          } catch(err) {}
        }}
      >
        {tab === "files" ? (
          <>
            {activeTag && (
              <div className="px-2 py-1 mb-2 mx-1.5 text-[11.5px] flex items-center justify-between" style={{ background: "var(--acc-soft)", color: "var(--acc)", borderRadius: 4 }}>
                <span className="font-medium">{activeTag}</span>
                <button onClick={() => setActiveTag?.(null)} className="hover:opacity-80 p-0.5"><Icon name="x" size={12} /></button>
              </div>
            )}
            
            {filteredTree.map((child: any) => 
              child.type === 'folder' ? (
                <FolderNode key={child.path} {...child} activeId={activeId} onSelect={onSelect} onMoveNode={onMoveNode} onDeleteFolder={onDeleteFolder} />
              ) : (
                <NoteNode key={child.path} note={child.note!} activeId={activeId} onSelect={onSelect} />
              )
            )}
            
            {filteredNotes.length === 0 && (
              <div className="px-3 py-4 text-center text-[12px] text-[var(--fg-2)]">
                No notes found.
              </div>
            )}
          </>
        ) : (
          <div className="px-1.5">
            {sortedTags.map(([tag, count]: any) => (
              <div 
                key={tag} 
                className="flex items-center justify-between px-2 py-1.5 rounded cursor-pointer hover:bg-[var(--bg-2)] transition-colors"
                onClick={() => {
                  setActiveTag?.(tag);
                  setTab("files");
                }}
              >
                <div className="flex items-center gap-2">
                  <Icon name="tag" size={13} className="text-[var(--fg-3)]" />
                  <span className="text-[13px] text-[var(--fg-1)]">{tag}</span>
                </div>
                <span className="mono text-[10px] text-[var(--fg-3)] px-1.5 py-0.5 rounded bg-[var(--bg-3)]">{count}</span>
              </div>
            ))}
            {sortedTags.length === 0 && (
              <div className="px-3 py-4 text-center text-[12px] text-[var(--fg-2)]">
                No tags found.
              </div>
            )}
          </div>
        )}
      </div>

      <div className="px-3 py-2.5 flex items-center gap-2 shrink-0" style={{ borderTop: "1px solid var(--bd-1)", background: "#0a0c11" }}>
        <span className="dot" style={{ background: "oklch(0.74 0.13 145)" }}></span>
        <div className="text-[11.5px] mono" style={{ color: "var(--fg-2)" }}>synced · {notes.length} notes</div>
        <div className="ml-auto mono text-[10.5px]" style={{ color: "var(--fg-3)" }}>v0.4.1</div>
      </div>
    </aside>
  );
};
