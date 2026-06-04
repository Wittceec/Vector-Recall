import * as React from "react"
import { Icon } from "./Icons"

export function HelpDialog({ open, setOpen }: { open: boolean, setOpen: (open: boolean) => void }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)}>
      <div 
        className="w-full max-w-2xl rounded-xl shadow-2xl flex flex-col overflow-hidden" 
        style={{ background: "var(--bg-1)", border: "1px solid var(--bd-1)", maxHeight: '85vh' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 shrink-0" style={{ borderBottom: "1px solid var(--bd-1)", background: "var(--bg-0)" }}>
          <div className="flex items-center gap-2">
            <Icon name="help" size={16} className="text-[var(--acc)]" />
            <h2 className="font-semibold text-[15px] text-[var(--fg-0)]">Cheat Sheet & Shortcuts</h2>
          </div>
          <button onClick={() => setOpen(false)} className="p-1 rounded-md hover:bg-[var(--bg-3)] text-[var(--fg-2)]">
            <Icon name="x" size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 text-[14px] text-[var(--fg-1)]">
          
          <h3 className="font-semibold text-[var(--acc)] mb-3 mt-1 text-[13px] tracking-wider uppercase">Keyboard Shortcuts</h3>
          <div className="grid grid-cols-2 gap-3 mb-8">
            <div className="flex justify-between items-center bg-[var(--bg-2)] p-2.5 rounded border border-[var(--bd-1)]">
              <span>Command Palette</span>
              <kbd className="text-[11px] bg-[var(--bg-3)] px-1.5 py-0.5 rounded border border-[var(--bd-1)]">⌘ K</kbd>
            </div>
            <div className="flex justify-between items-center bg-[var(--bg-2)] p-2.5 rounded border border-[var(--bd-1)]">
              <span>Ask AI Assistant</span>
              <div className="flex gap-1">
                <kbd className="text-[11px] bg-[var(--bg-3)] px-1.5 py-0.5 rounded border border-[var(--bd-1)]">⌘ ⇧ K</kbd>
              </div>
            </div>
            <div className="flex justify-between items-center bg-[var(--bg-2)] p-2.5 rounded border border-[var(--bd-1)]">
              <span>Toggle Left Sidebar</span>
              <kbd className="text-[11px] bg-[var(--bg-3)] px-1.5 py-0.5 rounded border border-[var(--bd-1)]">⌘ \</kbd>
            </div>
          </div>

          <h3 className="font-semibold text-[var(--acc)] mb-3 text-[13px] tracking-wider uppercase">Note Linking & Syntax</h3>
          <div className="space-y-3 mb-8">
            <div className="bg-[var(--bg-2)] p-3 rounded border border-[var(--bd-1)]">
              <div className="font-medium text-[var(--fg-0)] mb-1">Create a link to another note</div>
              <code className="text-[#a5d6ff] bg-[#0d1117] px-1.5 py-0.5 rounded text-[13px]">[[Note Title]]</code>
              <p className="text-[13px] text-[var(--fg-2)] mt-1.5">
                Typing double brackets automatically searches your vault and creates a bidirectional link between notes. These links will appear in the graph on the right!
              </p>
            </div>
            
            <div className="bg-[var(--bg-2)] p-3 rounded border border-[var(--bd-1)]">
              <div className="font-medium text-[var(--fg-0)] mb-1">Add Tags</div>
              <code className="text-[#a5d6ff] bg-[#0d1117] px-1.5 py-0.5 rounded text-[13px]">#tag-name</code>
              <p className="text-[13px] text-[var(--fg-2)] mt-1.5">
                Any word starting with a hashtag is automatically extracted and added to your Vault's tag list in the left sidebar.
              </p>
            </div>
          </div>

          <h3 className="font-semibold text-[var(--acc)] mb-3 text-[13px] tracking-wider uppercase">Markdown Formatting</h3>
          <div className="bg-[var(--bg-2)] p-4 rounded border border-[var(--bd-1)] mb-8 text-[13.5px]">
            <p className="mb-4 text-[var(--fg-2)]">Your editor supports full Markdown syntax for text formatting!</p>
            <div className="grid grid-cols-2 gap-y-3 gap-x-6">
              <div className="flex justify-between items-center border-b border-[var(--bd-1)] pb-2">
                <span className="font-bold">Bold Text</span>
                <code className="text-[12px] bg-[var(--bg-3)] px-1.5 py-0.5 rounded">**bold**</code>
              </div>
              <div className="flex justify-between items-center border-b border-[var(--bd-1)] pb-2">
                <span className="italic">Italic Text</span>
                <code className="text-[12px] bg-[var(--bg-3)] px-1.5 py-0.5 rounded">*italic*</code>
              </div>
              <div className="flex justify-between items-center border-b border-[var(--bd-1)] pb-2">
                <span className="text-[15px] font-bold">Heading 1</span>
                <code className="text-[12px] bg-[var(--bg-3)] px-1.5 py-0.5 rounded"># Heading</code>
              </div>
              <div className="flex justify-between items-center border-b border-[var(--bd-1)] pb-2">
                <span className="text-[14px] font-bold">Heading 2</span>
                <code className="text-[12px] bg-[var(--bg-3)] px-1.5 py-0.5 rounded">## Heading</code>
              </div>
              <div className="flex justify-between items-center border-b border-[var(--bd-1)] pb-2">
                <span className="text-[#a5d6ff] bg-[#0d1117] px-1 rounded inline-block">Inline Code</span>
                <code className="text-[12px] bg-[var(--bg-3)] px-1.5 py-0.5 rounded">`code`</code>
              </div>
              <div className="flex justify-between items-center border-b border-[var(--bd-1)] pb-2">
                <span className="text-[var(--fg-2)] border-l-2 border-[var(--acc)] pl-2 italic">Blockquote</span>
                <code className="text-[12px] bg-[var(--bg-3)] px-1.5 py-0.5 rounded">{'> quote'}</code>
              </div>
              <div className="flex justify-between items-center col-span-2 pt-1">
                <span className="text-[#a5d6ff] bg-[#0d1117] p-2 rounded block w-24 text-center">Code Block</span>
                <code className="text-[12px] bg-[var(--bg-3)] px-1.5 py-0.5 rounded">```bash<br/>echo "hello"<br/>```</code>
              </div>
            </div>
          </div>

          <h3 className="font-semibold text-[var(--acc)] mb-3 text-[13px] tracking-wider uppercase">Pro Tips</h3>
          <ul className="list-disc pl-5 space-y-2 text-[13.5px] text-[var(--fg-2)]">
            <li><strong className="text-[var(--fg-1)]">Semantic Search:</strong> The search bar doesn't just look for exact words. It uses an AI embedding model to find notes based on the <em>meaning</em> of your query.</li>
            <li><strong className="text-[var(--fg-1)]">Ask Mode:</strong> Type <code className="bg-[var(--bg-3)] px-1 rounded text-[12px] text-[var(--fg-1)]">?</code> at the start of any search query (or use ⌘⇧K) to instantly ask Gemini a question about your entire vault.</li>
            <li><strong className="text-[var(--fg-1)]">Drag and Drop:</strong> You can organize your vault by dragging notes and folders around in the left sidebar.</li>
          </ul>

        </div>
      </div>
    </div>
  );
}
