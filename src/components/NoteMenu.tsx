"use client"
import * as React from "react"
import { Menu } from "@base-ui/react/menu"
import { Edit2, Trash2 } from "lucide-react"

export function NoteMenu({ 
  children, 
  onDelete, 
  onRename 
}: { 
  children: React.ReactNode, 
  onDelete: () => void,
  onRename: () => void 
}) {
  return (
    <Menu.Root>
      <Menu.Trigger className="outline-none inline-flex">
        {children}
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner align="end" sideOffset={4} className="z-50">
          <Menu.Popup className="w-48 bg-[var(--bg-1)] border border-[var(--bd-1)] rounded-lg shadow-xl overflow-hidden p-1 outline-none text-[13px] text-[var(--fg-1)] origin-top-right transition-all">
            
            <Menu.Item 
              onClick={onRename}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-md cursor-pointer outline-none hover:bg-[var(--bg-3)] hover:text-[var(--fg-0)]"
            >
              <Edit2 size={14} />
              <span>Rename</span>
            </Menu.Item>
            
            <div className="h-px bg-[var(--bd-1)] my-1"></div>

            <Menu.Item 
              onClick={onDelete}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-md cursor-pointer outline-none hover:bg-red-500/10 hover:text-red-400 text-[var(--fg-2)]"
            >
              <Trash2 size={14} />
              <span>Delete note</span>
            </Menu.Item>

          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}
