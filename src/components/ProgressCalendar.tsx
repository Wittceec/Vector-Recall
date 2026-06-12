"use client"
import * as React from "react"
import { TimeLog } from "@/hooks/useTimeLogs"
import { Icon } from "./Icons"

export function ProgressCalendar({ logs }: { logs: TimeLog[] }) {
  const [currentDate, setCurrentDate] = React.useState(new Date())

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
      acc[log.topic].color = log.color;
    });
    return Object.entries(acc).sort((a, b) => b[1].duration - a[1].duration);
  }, [logs]);

  const formatHours = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  }
  
  const formatCompact = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    if (h > 0 && m > 0) return `${h}h${m}m`;
    if (h > 0) return `${h}h`;
    return `${m}m`;
  }

  // Generate calendar grid for current month
  const calendarDays = React.useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const days = [];
    
    // Padding days before the 1st
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }
    
    // Actual days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const d = new Date(year, month, i);
      const dateStr = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      days.push({
        date: dateStr,
        dayNum: i,
        data: logsByDate[dateStr] || null
      });
    }
    return days;
  }, [currentDate, logsByDate]);

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h3 className="text-[13px] font-semibold text-[var(--fg-1)]">Study Activity</h3>
        <p className="text-[11px] text-[var(--fg-3)]">Total time logged: <span className="text-[var(--fg-0)] font-medium">{formatHours(totalTime)}</span></p>
      </div>

      <div className="bg-[var(--bg-2)] rounded-lg border border-[var(--bd-1)] p-3">
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="p-1 hover:bg-[var(--bg-3)] rounded text-[var(--fg-2)]"><Icon name="chev-left" size={14} /></button>
          <div className="text-[13px] font-medium text-[var(--fg-1)]">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </div>
          <button onClick={nextMonth} className="p-1 hover:bg-[var(--bg-3)] rounded text-[var(--fg-2)]"><Icon name="chev-right" size={14} /></button>
        </div>
        
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <div key={i} className="text-center text-[10px] font-semibold text-[var(--fg-3)]">{d}</div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, i) => {
            if (!day) return <div key={`empty-${i}`} className="aspect-square" />;
            
            const hasData = day.data && day.data.duration > 0;
            const mainColor = hasData ? Object.values(day.data.topics)[0] : 'var(--bg-3)';
            
            return (
              <div 
                key={i} 
                className={`relative aspect-square rounded-[4px] border border-[var(--bd-1)] flex flex-col items-center justify-center overflow-hidden transition-all ${hasData ? 'bg-[var(--bg-3)]' : 'bg-[var(--bg-1)] opacity-70'}`}
                title={hasData ? `${day.date}: ${formatHours(day.data.duration)}` : day.date}
              >
                <span className={`text-[10px] font-medium z-10 ${hasData ? 'text-[var(--fg-0)] mt-[-4px]' : 'text-[var(--fg-3)]'}`}>{day.dayNum}</span>
                {hasData && (
                  <>
                    <span className="text-[9px] font-bold z-10" style={{ color: mainColor }}>{formatCompact(day.data.duration)}</span>
                    <div className="absolute bottom-0 left-0 w-full h-[3px] opacity-80" style={{ backgroundColor: mainColor }} />
                  </>
                )}
              </div>
            )
          })}
        </div>
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
