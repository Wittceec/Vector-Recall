"use client"
import * as React from "react"
import dynamic from "next/dynamic"

// Dynamically import react-force-graph-2d with no SSR because it requires canvas/window
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });

export function NetworkGraph({ 
  graphData, 
  onNodeClick,
  activeNoteId
}: { 
  graphData: { nodes: any[], links: any[] },
  onNodeClick: (node: any) => void,
  activeNoteId?: string
}) {
  const fgRef = React.useRef<any>(null);

  React.useEffect(() => {
    // Zoom to fit only when switching to a new active note
    if (fgRef.current && graphData.nodes.length > 0) {
      setTimeout(() => {
        fgRef.current?.zoomToFit(400, 20);
      }, 500);
    }
  }, [activeNoteId]); // Do NOT depend on graphData here, otherwise it spasms on every keystroke!

  return (
    <ForceGraph2D
      ref={fgRef}
      graphData={graphData}
      nodeLabel="title"
      nodeColor={(node: any) => node.active ? "oklch(0.82 0.13 195)" : "oklch(0.5 0.1 200 / 0.5)"}
      nodeRelSize={4}
      linkColor={() => "rgba(255,255,255,0.2)"}
      linkWidth={1}
      backgroundColor="transparent"
      onNodeClick={onNodeClick}
      width={320} // We will make this responsive in CSS, but provide a default
      height={220}
      d3VelocityDecay={0.3}
    />
  )
}
