"use client"
import * as React from "react"
import { Dialog } from "@base-ui/react/dialog"
import { Icon } from "./Icons"
import { useTheme } from "@/components/ThemeProvider"
import { createClient } from "@/utils/supabase/client"

// Helper to strip Obsidian YAML frontmatter (e.g. --- ... ---)
const stripFrontmatter = (text: string) => {
  if (text.startsWith('---')) {
    const endMatch = text.indexOf('---', 3);
    if (endMatch !== -1) {
      return text.substring(endMatch + 3).trim();
    }
  }
  return text;
};

export function SettingsDialog({ open, onOpenChange, onImportComplete }: { open: boolean, onOpenChange: (o: boolean) => void, onImportComplete?: () => void }) {
  const { theme, setTheme } = useTheme();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [importing, setImporting] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [total, setTotal] = React.useState(0);
  const supabase = createClient();

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Filter only markdown files
    const mdFiles = Array.from(files).filter(f => f.name.endsWith('.md'));
    if (mdFiles.length === 0) {
      alert("No markdown files found in the selected folder.");
      return;
    }

    setImporting(true);
    setTotal(mdFiles.length);
    setProgress(0);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setImporting(false);
      return;
    }

    // Process files sequentially to avoid rate limits / overwhelming the browser
    for (let i = 0; i < mdFiles.length; i++) {
      const file = mdFiles[i];
      try {
        const text = await file.text();
        const content = stripFrontmatter(text);
        const title = file.name.replace(/\.md$/i, '');

        // Insert into DB
        const { data: note, error } = await supabase
          .from('notes')
          .insert([{ user_id: user.id, title, content_markdown: content }])
          .select('id')
          .single();

        if (error || !note) {
          console.error(`Failed to import ${file.name}:`, error);
          continue;
        }

        // Generate embedding
        if (content.trim()) {
          try {
            const res = await fetch('/api/embed', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text: content })
            });
            if (res.ok) {
              const { embedding } = await res.json();
              await supabase.from('notes').update({ embedding }).eq('id', note.id);
            }
          } catch (embedError) {
            console.error(`Failed to embed ${file.name}:`, embedError);
          }
        }
      } catch (err) {
        console.error(`Error reading ${file.name}:`, err);
      }
      setProgress(i + 1);
    }

    setImporting(false);
    if (onImportComplete) onImportComplete();
    // Reset the input so the same folder can be selected again if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <Dialog.Root open={open} onOpenChange={(o) => {
      // Don't allow closing while importing
      if (importing) return;
      onOpenChange(o);
    }}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-200" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[var(--bg-1)] border border-[var(--bd-1)] rounded-xl shadow-2xl z-50 outline-none overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--bd-1)] flex items-center justify-between">
            <Dialog.Title className="text-[15px] font-semibold text-[var(--fg-0)]">Settings</Dialog.Title>
            <Dialog.Close 
              disabled={importing}
              className="text-[var(--fg-2)] hover:text-[var(--fg-0)] p-1 rounded-md hover:bg-[var(--bg-3)] transition-colors disabled:opacity-50"
            >
              <Icon name="plus" size={16} className="rotate-45" />
            </Dialog.Close>
          </div>
          
          <div className="p-5 space-y-8">
            {/* Theme Settings */}
            <div className="space-y-4">
              <h3 className="text-[14px] font-semibold text-[var(--fg-0)]">Appearance</h3>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[13px] font-medium text-[var(--fg-1)]">Theme</div>
                  <div className="text-[12px] text-[var(--fg-3)]">Select your preferred color mode.</div>
                </div>
                <select 
                  disabled={importing}
                  className="bg-[var(--bg-2)] border border-[var(--bd-1)] rounded-md px-3 py-1.5 text-[13px] text-[var(--fg-1)] outline-none focus:border-[var(--acc)] disabled:opacity-50"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as any)}
                >
                  <option value="system">System</option>
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                </select>
              </div>
            </div>

            {/* Import Settings */}
            <div className="space-y-4 pt-4 border-t border-[var(--bd-1)]">
              <h3 className="text-[14px] font-semibold text-[var(--fg-0)]">Data Management</h3>
              
              <div className="flex flex-col gap-3">
                <div>
                  <div className="text-[13px] font-medium text-[var(--fg-1)]">Bulk Obsidian Import</div>
                  <div className="text-[12px] text-[var(--fg-3)]">
                    Import a folder of Markdown files directly into your vault. Subfolders are fully supported.
                  </div>
                </div>
                
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  {...({ webkitdirectory: "", directory: "", multiple: true } as any)}
                />

                {!importing ? (
                  <button 
                    onClick={handleImportClick}
                    className="w-full flex items-center justify-center gap-2 bg-[var(--acc)] text-white hover:bg-[var(--acc-hover)] py-2 rounded-md text-[13px] font-medium transition-colors"
                  >
                    <Icon name="upload" size={14} /> Import Folder
                  </button>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[12px] mono text-[var(--fg-2)]">
                      <span>Importing notes...</span>
                      <span>{progress} / {total}</span>
                    </div>
                    <div className="w-full h-1.5 bg-[var(--bg-3)] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[var(--acc)] transition-all duration-200" 
                        style={{ width: `${(progress / total) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
