"use client"
import * as React from "react"
import { Play, Square, Pause, Clock, Tag } from "lucide-react"

export function TopBarTimer({ onSaveLog }: { onSaveLog: (topic: string, color: string, duration: number) => void }) {
  const [open, setOpen] = React.useState(false)
  const [running, setRunning] = React.useState(false)
  const [seconds, setSeconds] = React.useState(0)
  const [topic, setTopic] = React.useState("Focus")
  const [color, setColor] = React.useState("#3b82f6") // Blue default

  const containerRef = React.useRef<HTMLDivElement>(null)

  // Format time (MM:SS or HH:MM:SS)
  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600)
    const m = Math.floor((totalSeconds % 3600) / 60)
    const s = totalSeconds % 60
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  // Timer logic
  React.useEffect(() => {
    let interval: NodeJS.Timeout
    if (running) {
      interval = setInterval(() => {
        setSeconds(s => s + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [running])

  // Click outside to close
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleToggle = () => setRunning(!running)
  
  const handleStop = () => {
    setRunning(false)
    if (seconds >= 60) {
      onSaveLog(topic, color, seconds)
    }
    setSeconds(0)
    setOpen(false)
  }

  const presetColors = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#a855f7", "#ec4899", "#64748b"]

  return (
    <div className="relative" ref={containerRef}>
      <button 
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[12.5px] font-medium transition-colors border ${
          running ? "bg-[var(--acc-soft)] text-[var(--acc)] border-[var(--acc)]/30 animate-pulse" : "bg-[var(--bg-2)] text-[var(--fg-2)] border-[var(--bd-1)] hover:text-[var(--fg-1)]"
        }`}
      >
        {running ? <Clock size={13} className="animate-spin" style={{ animationDuration: '4s' }} /> : <Clock size={13} />}
        <span className="mono">{formatTime(seconds)}</span>
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-[var(--bg-1)] border border-[var(--bd-1)] rounded-lg shadow-xl overflow-hidden p-3 z-50 text-[13px]">
          <div className="font-semibold text-[var(--fg-0)] mb-3 flex items-center gap-2">
            <Clock size={14} className="text-[var(--acc)]" /> Session Tracker
          </div>
          
          <div className="mb-3">
            <label className="block text-[11px] text-[var(--fg-3)] uppercase tracking-wider mb-1 font-semibold">Topic / Subject</label>
            <div className="relative">
              <Tag size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--fg-3)]" />
              <input 
                type="text" 
                value={topic}
                onChange={e => setTopic(e.target.value)}
                className="w-full bg-[var(--bg-0)] border border-[var(--bd-1)] rounded p-1.5 pl-8 text-[13px] text-[var(--fg-1)] outline-none focus:border-[var(--acc)]"
                placeholder="e.g. CCNA"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-[11px] text-[var(--fg-3)] uppercase tracking-wider mb-1 font-semibold">Color</label>
            <div className="flex flex-wrap gap-1.5">
              {presetColors.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-5 h-5 rounded-full ${color === c ? 'ring-2 ring-offset-2 ring-offset-[var(--bg-1)] ring-[var(--acc)]' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={handleToggle}
              className={`flex-1 flex justify-center items-center gap-1.5 py-1.5 rounded text-white font-medium ${running ? 'bg-amber-500 hover:bg-amber-600' : 'bg-green-500 hover:bg-green-600'}`}
            >
              {running ? <><Pause size={14} /> Pause</> : <><Play size={14} /> Start</>}
            </button>
            {(seconds > 0 || running) && (
              <button 
                onClick={handleStop}
                className="flex-1 flex justify-center items-center gap-1.5 py-1.5 rounded bg-red-500 hover:bg-red-600 text-white font-medium"
              >
                <Square size={14} /> Stop
              </button>
            )}
          </div>
          <p className="text-[10.5px] text-[var(--fg-3)] mt-3 text-center">Sessions under 1 minute are not saved.</p>
        </div>
      )}
    </div>
  )
}
