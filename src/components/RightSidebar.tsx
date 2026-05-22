"use client"
import * as React from "react"
import { Icon } from "./Icons"
import { Note } from "@/hooks/useNotes"
import { extractTags, extractWikilinks, extractHeadings, getStats, getContextSnippet } from "@/utils/markdownParser"
import { NetworkGraph } from "./NetworkGraph"

const Outline = ({ headings }: { headings: any[] }) => {
  return (
    <div className="space-y-1 mono text-[12px]">
      {headings.length === 0 && <div className="text-[var(--fg-3)]">No headings found.</div>}
      {headings.map((it, i) => (
        <div key={i} className="flex items-center gap-2 py-0.5 cursor-pointer hover:bg-[var(--bg-2)] rounded" style={{ paddingLeft: it.d * 14, color: "var(--fg-1)" }}>
          <span style={{ width: it.d === 0 ? 8 : 6, height: 1, background: "var(--fg-3)" }}></span>
          <span className="hover:text-[var(--fg-0)]">{it.text}</span>
        </div>
      ))}
    </div>
  );
};

export const RightSidebar = ({ notes = [], activeId = null, onLinkClick = () => {}, onUpdateNote = () => {}, collapsed = false, onToggle }: any) => {
  const [tab, setTab] = React.useState("graph");

  const activeNote = React.useMemo(() => notes.find((n: Note) => n.id === activeId), [notes, activeId]);

  const { graphData, tags, linkedMentions, unlinkedMentions, headings, stats } = React.useMemo(() => {
    let graphNodes: any[] = [];
    let graphLinks: any[] = [];
    let tagsList: string[] = [];
    let linked: any[] = [];
    let unlinked: any[] = [];
    let activeHeadings: any[] = [];
    let activeStats = { words: 0, chars: 0 };

    if (!activeNote) return { graphData: { nodes: [], links: [] }, tags: [], linkedMentions: [], unlinkedMentions: [], headings: [], stats: activeStats };

    activeHeadings = extractHeadings(activeNote.content_markdown || "");
    activeStats = getStats(activeNote.content_markdown || "");
    tagsList = extractTags(activeNote.content_markdown || "");

    const activeTitleLower = activeNote.title.toLowerCase();

    for (const note of notes) {
      graphNodes.push({ id: note.id, title: note.title, active: note.id === activeNote.id });
      
      const md = note.content_markdown || "";
      const links = extractWikilinks(md);
      
      for (const link of links) {
        const targetNote = notes.find((n: Note) => n.title.toLowerCase() === link.toLowerCase());
        if (targetNote) {
          graphLinks.push({ source: note.id, target: targetNote.id });
        }
      }

      if (note.id !== activeNote.id && links.some(l => l.toLowerCase() === activeTitleLower)) {
        linked.push({
          id: note.id,
          title: note.title,
          path: "Vault",
          snippet: getContextSnippet(md, `[[${activeNote.title}]]`)
        });
      }

      if (note.id !== activeNote.id && !links.some(l => l.toLowerCase() === activeTitleLower) && md.toLowerCase().includes(activeTitleLower)) {
        unlinked.push({
          id: note.id,
          title: note.title,
          path: "Vault",
          snippet: getContextSnippet(md, activeTitleLower)
        });
      }
    }

    return {
      graphData: { nodes: graphNodes, links: graphLinks },
      tags: tagsList,
      linkedMentions: linked,
      unlinkedMentions: unlinked,
      headings: activeHeadings,
      stats: activeStats
    };
  }, [notes, activeNote]);

  if (collapsed) {
    return (
      <aside className="relative flex flex-col items-center gap-3 py-3 w-full h-full" style={{ background: "var(--bg-1)" }}>
        <button className="edge-tab left-edge" onClick={onToggle} title="Expand panel"><Icon name="chev-left" size={11} /></button>
        <button onClick={() => setTab("graph")} className="p-2 rounded-md hover:bg-[var(--bg-3)] text-[var(--fg-2)]"><Icon name="graph" size={16} /></button>
        <button onClick={() => setTab("links")} className="p-2 rounded-md hover:bg-[var(--bg-3)] text-[var(--fg-2)]"><Icon name="link" size={16} /></button>
        <button onClick={() => setTab("outline")} className="p-2 rounded-md hover:bg-[var(--bg-3)] text-[var(--fg-2)]"><Icon name="circle-dot" size={16} /></button>
      </aside>
    );
  }

  return (
    <aside className="relative flex flex-col scroll-y w-full h-full" style={{ background: "var(--bg-1)" }}>
      <button className="edge-tab left-edge" onClick={onToggle} title="Collapse panel"><Icon name="chev-right" size={11} /></button>
      
      {activeNote && (
        <div className="px-4 py-3 flex flex-col gap-2 shrink-0" style={{ borderBottom: "1px solid var(--bd-1)", background: "var(--bg-2)" }}>
          <div className="flex items-center justify-between">
            <div className="seclabel">Publishing</div>
            <label className="flex items-center cursor-pointer">
              <div className="relative">
                <input type="checkbox" className="sr-only" checked={activeNote.is_public || false} onChange={(e) => onUpdateNote(activeNote.id, { is_public: e.target.checked })} />
                <div className={`block w-8 h-4 rounded-full transition-colors ${activeNote.is_public ? 'bg-[var(--acc)]' : 'bg-[var(--bd-1)]'}`}></div>
                <div className={`dot absolute left-1 top-1 bg-white w-2 h-2 rounded-full transition-transform ${activeNote.is_public ? 'transform translate-x-4' : ''}`}></div>
              </div>
              <div className="ml-2 text-[12px] text-[var(--fg-1)]">Public Web</div>
            </label>
          </div>
          {activeNote.is_public && (
            <div className="flex items-center justify-between bg-[var(--bg-3)] p-1.5 rounded">
              <span className="text-[11px] mono text-[var(--fg-2)] truncate max-w-[150px]">/public/{activeNote.id.substring(0, 8)}...</span>
              <button 
                onClick={() => navigator.clipboard.writeText(`${window.location.origin}/public/${activeNote.id}`)}
                className="text-[10px] mono bg-[var(--bg-1)] px-1.5 py-0.5 rounded text-[var(--fg-0)] hover:bg-[var(--bd-1)] transition-colors"
              >
                Copy
              </button>
            </div>
          )}
        </div>
      )}

      <div className="flex shrink-0" style={{ borderBottom: "1px solid var(--bd-1)" }}>
        <div className={"rs-tab " + (tab === "graph" ? "active" : "")} onClick={() => setTab("graph")}>Graph</div>
        <div className={"rs-tab " + (tab === "links" ? "active" : "")} onClick={() => setTab("links")}>Links <span style={{ color: "var(--fg-3)" }}>· {linkedMentions.length}/{unlinkedMentions.length}</span></div>
        <div className={"rs-tab " + (tab === "outline" ? "active" : "")} onClick={() => setTab("outline")}>Outline</div>
      </div>

      {tab === "graph" && (
        <div className="px-4 py-4 space-y-4">
          <div className="relative rounded-lg overflow-hidden flex items-center justify-center text-[var(--fg-2)]" style={{ background: "radial-gradient(circle at 50% 50%, #0c1117, #07090c)", border: "1px solid var(--bd-1)", height: 220 }}>
            <NetworkGraph 
              graphData={graphData} 
              onNodeClick={(node) => onLinkClick(node.id)} 
            />
          </div>
          <div>
            <div className="seclabel mb-2 flex items-center gap-1.5"><Icon name="tag" size={11} /> Related Tags</div>
            <div className="flex flex-wrap gap-1.5">
              {tags.length === 0 && <span className="text-[12px] text-[var(--fg-3)]">No tags found. Type #tag in your note.</span>}
              {tags.map(t => (
                <span key={t} className="tag cursor-pointer hover:opacity-80">{t}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "links" && (
        <div className="px-4 py-4 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="seclabel flex items-center gap-1.5"><Icon name="link" size={11} /> Linked mentions</div>
              <span className="mono text-[10.5px] px-1.5 py-px rounded" style={{ background: "var(--bg-3)", color: "var(--fg-1)" }}>{linkedMentions.length}</span>
            </div>
            {linkedMentions.length === 0 && <div className="text-[12px] text-[var(--fg-3)]">No linked mentions found. Link this note with [[{activeNote?.title || "title"}]]</div>}
            <div className="space-y-2">
              {linkedMentions.map(b => (
                <div key={b.id} className="backlink-card cursor-pointer" onClick={() => onLinkClick(b.id)}>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-medium text-[13px]" style={{ color: "var(--fg-0)" }}>{b.title}</span>
                    <span className="ml-auto" style={{ color: "var(--fg-3)" }}><Icon name="arrow-up-right" size={11} /></span>
                  </div>
                  <div className="text-[12px] leading-relaxed" style={{ color: "var(--fg-1)" }}>
                    {b.snippet.split(/(\[\[[^\]]+\]\])/g).map((part: string, i: number) =>
                      part.startsWith("[[") ? <span key={i} className="pill-link">{part}</span> : <span key={i}>{part}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="seclabel flex items-center gap-1.5"><Icon name="alert" size={11} className="text-[var(--mag)]" /> Unlinked mentions</div>
              <span className="mono text-[10.5px] px-1.5 py-px rounded" style={{ background: "var(--bg-3)", color: "var(--fg-1)" }}>{unlinkedMentions.length}</span>
            </div>
            {unlinkedMentions.length > 0 && (
              <div className="text-[11px] mb-2 mono" style={{ color: "var(--fg-2)" }}>
                notes that reference this concept by name but haven't linked it.
              </div>
            )}
            <div className="space-y-2">
              {unlinkedMentions.map(b => (
                <div key={b.id} className="backlink-card cursor-pointer" onClick={() => onLinkClick(b.id)}>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-medium text-[13px]" style={{ color: "var(--fg-1)" }}>{b.title}</span>
                    <button className="ml-auto mono text-[10.5px] px-1.5 py-0.5 rounded" style={{ background: "var(--acc-soft)", color: "var(--acc)", border: "1px solid oklch(0.78 0.13 195 / 0.3)" }} onClick={(e) => { e.stopPropagation(); }}>+ link</button>
                  </div>
                  <div className="text-[12px] leading-relaxed" style={{ color: "var(--fg-2)" }}>
                    {b.snippet}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "outline" && (
        <div className="px-4 py-4">
          <div className="seclabel mb-3">Document outline</div>
          <Outline headings={headings} />
          <div className="seclabel mt-6 mb-2">Word count</div>
          <div className="mono text-[12px]" style={{ color: "var(--fg-1)" }}>
            {stats.words} words · {stats.chars} chars
          </div>
        </div>
      )}
    </aside>
  );
};
