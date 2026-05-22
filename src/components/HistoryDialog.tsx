"use client"
import * as React from "react"
import { Dialog } from "@base-ui/react/dialog"
import { Icon } from "./Icons"
import { createClient } from "@/utils/supabase/client"

interface HistorySnapshot {
  id: string
  created_at: string
  title: string
  content_markdown: string
}

export function HistoryDialog({ 
  open, 
  onOpenChange, 
  noteId, 
  onRestore 
}: { 
  open: boolean, 
  onOpenChange: (o: boolean) => void, 
  noteId: string | null,
  onRestore: (content: string, title: string) => void
}) {
  const [history, setHistory] = React.useState<HistorySnapshot[]>([])
  const [loading, setLoading] = React.useState(false)
  const [selectedSnapshot, setSelectedSnapshot] = React.useState<HistorySnapshot | null>(null)
  const supabase = createClient()

  React.useEffect(() => {
    if (open && noteId) {
      setLoading(true)
      supabase
        .from('note_history')
        .select('*')
        .eq('note_id', noteId)
        .order('created_at', { ascending: false })
        .then(({ data, error }) => {
          if (!error && data) {
            setHistory(data)
            setSelectedSnapshot(data[0] || null)
          }
          setLoading(false)
        })
    } else {
      setHistory([])
      setSelectedSnapshot(null)
    }
  }, [open, noteId, supabase])

  const handleRestore = () => {
    if (selectedSnapshot) {
      onRestore(selectedSnapshot.content_markdown, selectedSnapshot.title)
      onOpenChange(false)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-200" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[80vh] flex flex-col bg-[var(--bg-1)] border border-[var(--bd-1)] rounded-xl shadow-2xl z-50 outline-none overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--bd-1)] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Icon name="history" size={16} className="text-[var(--acc)]" />
              <Dialog.Title className="text-[15px] font-semibold text-[var(--fg-0)]">Note History</Dialog.Title>
            </div>
            <Dialog.Close className="text-[var(--fg-2)] hover:text-[var(--fg-0)] p-1 rounded-md hover:bg-[var(--bg-3)] transition-colors">
              <Icon name="plus" size={16} className="rotate-45" />
            </Dialog.Close>
          </div>
          
          <div className="flex-1 flex overflow-hidden">
            {/* Sidebar with timestamps */}
            <div className="w-64 border-r border-[var(--bd-1)] bg-[var(--bg-2)] flex flex-col shrink-0 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-[13px] text-[var(--fg-2)]">Loading history...</div>
              ) : history.length === 0 ? (
                <div className="p-4 text-[13px] text-[var(--fg-2)]">No history found. Keep typing to generate snapshots!</div>
              ) : (
                history.map((snapshot) => {
                  const isSelected = selectedSnapshot?.id === snapshot.id;
                  const date = new Date(snapshot.created_at);
                  return (
                    <button
                      key={snapshot.id}
                      onClick={() => setSelectedSnapshot(snapshot)}
                      className={`flex flex-col items-start px-4 py-3 text-left border-b border-[var(--bd-1)] transition-colors ${
                        isSelected ? "bg-[var(--acc-soft)] text-[var(--acc)]" : "hover:bg-[var(--bg-3)] text-[var(--fg-1)]"
                      }`}
                    >
                      <span className="text-[13px] font-medium mb-1 truncate w-full">{snapshot.title}</span>
                      <span className="text-[11px] opacity-70 mono">{date.toLocaleDateString()} at {date.toLocaleTimeString()}</span>
                    </button>
                  );
                })
              )}
            </div>

            {/* Preview Area */}
            <div className="flex-1 bg-[var(--bg-0)] flex flex-col min-w-0">
              {selectedSnapshot ? (
                <>
                  <div className="p-3 border-b border-[var(--bd-1)] flex items-center justify-between bg-[var(--bg-1)] shrink-0">
                    <span className="text-[12px] text-[var(--fg-2)] mono">Previewing snapshot from {new Date(selectedSnapshot.created_at).toLocaleString()}</span>
                    <button 
                      onClick={handleRestore}
                      className="px-3 py-1.5 rounded bg-[var(--acc-soft)] text-[var(--acc)] text-[12.5px] font-medium hover:bg-[var(--acc-fade)] transition-colors border border-[var(--bd-1)]"
                    >
                      Restore Version
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-8 prose-vc">
                    <h1 className="text-[32px] font-bold tracking-tight mb-6">{selectedSnapshot.title}</h1>
                    <pre className="whitespace-pre-wrap font-sans text-[15px] leading-relaxed text-[var(--fg-1)]">
                      {selectedSnapshot.content_markdown}
                    </pre>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-[var(--fg-3)] text-[13px]">
                  Select a snapshot to preview
                </div>
              )}
            </div>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
