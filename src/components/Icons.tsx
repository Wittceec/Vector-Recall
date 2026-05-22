import * as React from "react"

export const Icon = ({ name, size = 14, className = "", strokeWidth = 1.6 }: { name: string; size?: number; className?: string; strokeWidth?: number }) => {
  const c = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, className };
  switch (name) {
    case "chev-right": return <svg {...c}><path d="M9 6l6 6-6 6"/></svg>;
    case "chev-left":  return <svg {...c}><path d="M15 6l-6 6 6 6"/></svg>;
    case "chev-down":  return <svg {...c}><path d="M6 9l6 6 6-6"/></svg>;
    case "folder":     return <svg {...c}><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/></svg>;
    case "folder-open":return <svg {...c}><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2"/><path d="M3 9h18l-2 9a2 2 0 0 1-2 1.6H5a2 2 0 0 1-2-1.6L3 9z"/></svg>;
    case "search":     return <svg {...c}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>;
    case "settings":   return <svg {...c}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 0 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 0 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 0 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 0 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>;
    case "panel-left": return <svg {...c}><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16"/></svg>;
    case "panel-right":return <svg {...c}><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M15 4v16"/></svg>;
    case "graph":      return <svg {...c}><circle cx="6" cy="6" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="12" cy="18" r="2"/><path d="M7.5 7.5 11 16M16.5 7.5 13 16M8 6h8"/></svg>;
    case "link":       return <svg {...c}><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 1 0-5.7-5.7l-1.4 1.4"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 1 0 5.7 5.7l1.4-1.4"/></svg>;
    case "tag":        return <svg {...c}><path d="M3 11.5V4a1 1 0 0 1 1-1h7.5L21 12.5 12.5 21 3 11.5z"/><circle cx="8" cy="8" r="1.2" fill="currentColor"/></svg>;
    case "clock":      return <svg {...c}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>;
    case "plus":       return <svg {...c}><path d="M12 5v14M5 12h14"/></svg>;
    case "more":       return <svg {...c}><circle cx="5" cy="12" r="1.2" fill="currentColor"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/><circle cx="19" cy="12" r="1.2" fill="currentColor"/></svg>;
    case "star":       return <svg {...c}><path d="m12 3 2.7 5.7 6.3.9-4.6 4.4 1.1 6.2L12 17.3 6.5 20.2l1.1-6.2L3 9.6l6.3-.9L12 3z"/></svg>;
    case "history":    return <svg {...c}><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l3 2"/></svg>;
    case "sparkles":   return <svg {...c}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2 2M16 16l2 2M6 18l2-2M16 8l2-2"/></svg>;
    case "calendar":   return <svg {...c}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>;
    case "zap":        return <svg {...c}><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z"/></svg>;
    case "circle-dot": return <svg {...c}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none"/></svg>;
    case "arrow-up-right": return <svg {...c}><path d="M7 17 17 7"/><path d="M8 7h9v9"/></svg>;
    case "edit":       return <svg {...c}><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>;
    case "x":          return <svg {...c}><path d="M18 6 6 18M6 6l12 12"/></svg>;
    default: return null;
  }
}

export const VectorMark = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <defs>
      <linearGradient id="vc-acc" x1="0" y1="1" x2="1" y2="0">
        <stop offset="0%" stopColor="oklch(0.60 0.12 200)"/>
        <stop offset="100%" stopColor="oklch(0.86 0.13 195)"/>
      </linearGradient>
    </defs>
    <g stroke="rgba(170, 190, 210, 0.07)" strokeWidth="1">
      <line x1="6" y1="6" x2="6" y2="26"/>
      <line x1="11" y1="6" x2="11" y2="26"/>
      <line x1="16" y1="6" x2="16" y2="26"/>
      <line x1="21" y1="6" x2="21" y2="26"/>
      <line x1="26" y1="6" x2="26" y2="26"/>
      <line x1="6" y1="6" x2="26" y2="6"/>
      <line x1="6" y1="11" x2="26" y2="11"/>
      <line x1="6" y1="16" x2="26" y2="16"/>
      <line x1="6" y1="21" x2="26" y2="21"/>
      <line x1="6" y1="26" x2="26" y2="26"/>
    </g>
    <circle cx="6" cy="26" r="1.5" fill="url(#vc-acc)"/>
    <line x1="6" y1="26" x2="23" y2="9" stroke="url(#vc-acc)" strokeWidth="2" strokeLinecap="round"/>
    <path d="M23 9 L18 9 M23 9 L23 14" stroke="url(#vc-acc)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
