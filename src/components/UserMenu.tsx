"use client"
import * as React from "react"
import { Menu } from "@base-ui/react/menu"
import { LogOut, User, Settings } from "lucide-react"
import { createClient } from "@/utils/supabase/client"

export function UserMenu({ children, onOpenSettings }: { children: React.ReactNode, onOpenSettings?: () => void }) {
  const [open, setOpen] = React.useState(false);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const handleOpenSettings = () => {
    setOpen(false);
    onOpenSettings?.();
  };

  return (
    <Menu.Root open={open} onOpenChange={setOpen}>
      <Menu.Trigger className="outline-none">
        {children}
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner align="end" sideOffset={8} className="z-50">
          <Menu.Popup className="w-56 bg-[var(--bg-1)] border border-[var(--bd-1)] rounded-lg shadow-xl overflow-hidden p-1 outline-none text-[13px] text-[var(--fg-1)] origin-top-right transition-all">
            
            <div className="px-3 py-2 border-b border-[var(--bd-1)] mb-1">
              <div className="font-medium text-[var(--fg-0)]">User</div>
              <div className="text-[11px] text-[var(--fg-3)] truncate">user@example.com</div>
            </div>

            <Menu.Item 
              onClick={() => {
                setOpen(false);
                alert("Profile view coming soon!");
              }}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-md cursor-pointer outline-none hover:bg-[var(--bg-3)] hover:text-[var(--fg-0)]"
            >
              <User size={14} />
              <span>Profile</span>
            </Menu.Item>
            
            <Menu.Item 
              onClick={handleOpenSettings}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-md cursor-pointer outline-none hover:bg-[var(--bg-3)] hover:text-[var(--fg-0)]"
            >
              <Settings size={14} />
              <span>Preferences</span>
            </Menu.Item>

            <div className="h-px bg-[var(--bd-1)] my-1"></div>

            <Menu.Item 
              onClick={handleLogout}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-md cursor-pointer outline-none hover:bg-red-500/10 hover:text-red-400 text-[var(--fg-2)]"
            >
              <LogOut size={14} />
              <span>Log out</span>
            </Menu.Item>

          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}
