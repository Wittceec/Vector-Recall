import * as React from "react"
import { Icon, VectorMark } from "./Icons"
import { UserMenu } from "./UserMenu"
import { TopBarTimer } from "./TopBarTimer"

export const TopBar = ({ onToggleLeft, onToggleRight, onOpenCmdK, onOpenAsk, onOpenSettings, onOpenHistory, onOpenHelp, onSaveLog, breadcrumb = ["Vault", "recall"], isSaving }: { onToggleLeft?: () => void, onToggleRight?: () => void, onOpenCmdK?: () => void, onOpenAsk?: () => void, onOpenSettings?: () => void, onOpenHistory?: () => void, onOpenHelp?: () => void, onSaveLog?: (topic: string, color: string, duration: number) => void, breadcrumb?: string[], isSaving?: boolean }) => (
  <header className="topbar flex items-center px-3 gap-3 relative z-20 shrink-0">
    <div className="flex items-center gap-2 pr-3" style={{ borderRight: "1px solid var(--bd-1)", height: "100%" }}>
      <VectorMark size={22} />
      <div className="flex items-baseline gap-1.5">
        <span className="font-semibold tracking-tight" style={{ fontSize: 14.5, color: "#dff5f4" }}>Vector</span>
        <span className="font-medium tracking-tight" style={{ fontSize: 14.5, color: "var(--fg-1)" }}>Recall</span>
      </div>
    </div>

    <div className="flex items-center gap-0.5">
      <button onClick={onToggleLeft} className="p-1.5 rounded hover:bg-[var(--bg-3)] text-[var(--fg-2)]" title="Toggle left sidebar (⌘\)"><Icon name="panel-left" size={15} /></button>
      <button onClick={onToggleRight} className="p-1.5 rounded hover:bg-[var(--bg-3)] text-[var(--fg-2)]" title="Toggle right sidebar"><Icon name="panel-right" size={15} /></button>
    </div>

    <div className="flex items-center gap-1.5 text-[12.5px] mono" style={{ color: "var(--fg-2)" }}>
      {breadcrumb.flatMap((b, i) => {
        const arr = [<span key={`b${i}`} className={i === breadcrumb.length - 1 ? "" : "hover:text-[var(--fg-0)] cursor-pointer"} style={i === breadcrumb.length - 1 ? { color: "var(--fg-0)" } : {}}>{b}</span>];
        if (i < breadcrumb.length - 1) arr.push(<span key={`s${i}`} style={{ color: "var(--fg-3)" }}>/</span>);
        return arr;
      })}
      {isSaving !== undefined && (
        <span className="ml-2 text-[10px] text-[var(--fg-3)] flex items-center gap-1 bg-[var(--bg-2)] px-2 py-0.5 rounded-full border border-[var(--bd-1)] transition-opacity duration-300">
          {isSaving ? (
            <><Icon name="sparkles" size={10} className="animate-spin text-[var(--acc)]" /> Saving...</>
          ) : (
            <><Icon name="check" size={10} className="text-[var(--acc)]" /> Saved</>
          )}
        </span>
      )}
    </div>

    <div className="ml-auto flex items-center gap-2">
      <TopBarTimer onSaveLog={onSaveLog || (() => {})} />

      <button onClick={onOpenAsk} className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[12.5px]" style={{ background: "var(--acc-soft)", border: "1px solid oklch(0.78 0.13 195 / 0.45)", color: "var(--acc)" }}>
        <Icon name="sparkles" size={13} />
        <span className="font-medium">Ask Vector</span>
        <kbd style={{ background: "transparent", borderColor: "oklch(0.5 0.1 200 / 0.4)", color: "var(--acc)" }}>⌘ ⇧ K</kbd>
      </button>

      <button onClick={onOpenCmdK} className="topsearch flex items-center gap-2.5 px-3 py-1.5 rounded-md text-[12.5px]" style={{ width: 300 }}>
        <Icon name="search" size={13} />
        <span className="flex-1 text-left">Search vault, jump to note…</span>
        <kbd>⌘</kbd><kbd>K</kbd>
      </button>

      <div className="flex items-center gap-1">
        <button onClick={onOpenHelp} className="p-1.5 rounded hover:bg-[var(--bg-3)] text-[var(--fg-2)]" title="Cheat Sheet & Help"><Icon name="help" size={15} /></button>
        <button onClick={onOpenHistory} className="p-1.5 rounded hover:bg-[var(--bg-3)] text-[var(--fg-2)]" title="History"><Icon name="history" size={15} /></button>
        <button onClick={onOpenSettings} className="p-1.5 rounded hover:bg-[var(--bg-3)] text-[var(--fg-2)]" title="Settings"><Icon name="settings" size={15} /></button>
        <UserMenu onOpenSettings={onOpenSettings}>
          <div className="w-7 h-7 rounded-full ml-1 flex items-center justify-center mono text-[11px] font-semibold" style={{
            background: "linear-gradient(135deg, var(--acc-deep), oklch(0.40 0.10 200))",
            color: "#04181c", border: "1px solid oklch(0.5 0.1 200 / 0.5)"
          }}>VL</div>
        </UserMenu>
      </div>
    </div>
  </header>
);
