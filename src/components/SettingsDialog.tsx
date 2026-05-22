"use client"
import * as React from "react"
import { Dialog } from "@base-ui/react/dialog"
import { Icon } from "./Icons"
import { useTheme } from "@/components/ThemeProvider"

export function SettingsDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (o: boolean) => void }) {
  const { theme, setTheme } = useTheme();

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-200" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[var(--bg-1)] border border-[var(--bd-1)] rounded-xl shadow-2xl z-50 outline-none overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--bd-1)] flex items-center justify-between">
            <Dialog.Title className="text-[15px] font-semibold text-[var(--fg-0)]">Settings</Dialog.Title>
            <Dialog.Close className="text-[var(--fg-2)] hover:text-[var(--fg-0)] p-1 rounded-md hover:bg-[var(--bg-3)] transition-colors">
              <Icon name="plus" size={16} className="rotate-45" />
            </Dialog.Close>
          </div>
          
          <div className="p-5">
            <Dialog.Description className="text-[13px] text-[var(--fg-2)] mb-4">
              Manage your vault preferences and account details.
            </Dialog.Description>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[14px] font-medium text-[var(--fg-1)]">Theme</div>
                  <div className="text-[12px] text-[var(--fg-3)]">Select your preferred color mode.</div>
                </div>
                <select 
                  className="bg-[var(--bg-2)] border border-[var(--bd-1)] rounded-md px-3 py-1.5 text-[13px] text-[var(--fg-1)] outline-none focus:border-[var(--acc)]"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as any)}
                >
                  <option value="system">System</option>
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                </select>
              </div>
            </div>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
