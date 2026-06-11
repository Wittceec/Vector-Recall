"use client"
import * as React from "react"
import { TimeLog } from "@/hooks/useTimeLogs"

export function ProgressCalendar({ logs }: { logs: TimeLog[] }) {
  // Aggregate logs by date
  const logsByDate = React.useMemo(() => {
    const acc: Record<string, { duration: number, topics: Record<string, string> }> = {};
    logs.forEach(log => {
      if (!acc[log.date]) {
        acc[log.date] = { duration: 0, topics: {} };
      }
      acc[log.date].duration += log.duration_seconds;
      acc[log.date].topics[log.topic] = log.color;
    });
    return acc;
  }, [logs]);

  const totalTime = React.useMemo(() => {
    return logs.reduce((acc, log) => acc + log.duration_seconds, 0);
  }, [logs]);

  const topicBreakdown = React.useMemo(() => {
    const acc: Record<string, { duration: number, color: string }> = {};
    logs.forEach(log => {
      if (!acc[log.topic]) {
        acc[log.topic] = { duration: 0, color: log.color };
      }
      acc[log.topic].duration += log.duration_seconds;
      // prioritize the latest color if it changed
      acc[log.topic].color = log.color;
    });
    return Object.entries(acc).sort((a, b) => b[1].duration - a[1].duration);
  }, [logs]);

  // Generate 7 rows x 20 cols of dates for heatmap
  const heatmapData = React.useMemo(() => {
    const data = [];
    const today = new Date();
    // Start 140 days ago (20 weeks)
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 139);
    
    // adjust to nearest sunday
    while (startDate.getDay() !== 0) {
      startDate.setDate(startDate.getDate() - 1);
    }

    for (let i = 0; i < 140; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const dateStr = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      const dayData = logsByDate[dateStr];
      data.push({
        date: dateStr,
        duration: dayData?.duration || 0,
        mainColor: dayData && Object.keys(dayData.topics).length > 0 ? Object.values(dayData.topics)[0] : 'var(--bg-3)'
      });
    }
    
    // Split into 7 rows (days of week)
    const columns: any[][] = [];
    for (let w = 0; w < 20; w++) {
      columns.push(data.slice(w * 7, (w + 1) * 7));
    }
    return columns;
  }, [logsByDate]);

  const formatHours = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h3 className="text-[13px] font-semibold text-[var(--fg-1)]">Study Activity</h3>
        <p className="text-[11px] text-[var(--fg-3)]">Total time logged: <span className="text-[var(--fg-0)] font-medium">{formatHours(totalTime)}</span></p>
      </div>

      <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-none">
        {heatmapData.map((col, cIdx) => (
          <div key={cIdx} className="flex flex-col gap-1">
            {col.map((day, rIdx) => {
              // Calculate opacity based on duration (max ~4 hours)
              const maxDuration = 14400; 
              const intensity = day.duration === 0 ? 0 : Math.max(0.2, Math.min(1, day.duration / maxDuration));
              
              return (
                <div 
                  key={rIdx} 
                  title={`${day.date}: ${formatHours(day.duration)}`}
                  className="w-3 h-3 rounded-[2px]"
                  style={{
                    backgroundColor: day.duration > 0 ? day.mainColor : 'var(--bg-2)',
                    opacity: day.duration > 0 ? intensity : 1
                  }}
                />
              )
            })}
          </div>
        ))}
      </div>

      <div className="pt-2 border-t border-[var(--bd-1)] space-y-3">
        <h4 className="text-[12px] font-medium text-[var(--fg-2)] uppercase tracking-wider">Top Topics</h4>
        <div className="space-y-2">
          {topicBreakdown.length === 0 && <p className="text-[12px] text-[var(--fg-3)]">No topics logged yet.</p>}
          {topicBreakdown.map(([topic, data]) => (
            <div key={topic} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: data.color }} />
              <div className="text-[12px] text-[var(--fg-1)] truncate flex-1">{topic}</div>
              <div className="text-[11px] text-[var(--fg-3)] mono shrink-0">{formatHours(data.duration)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
