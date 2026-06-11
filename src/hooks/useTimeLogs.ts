import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'

export type TimeLog = {
  id: string;
  user_id: string;
  topic: string;
  color: string;
  duration_seconds: number;
  date: string;
  created_at: string;
}

export function useTimeLogs() {
  const [logs, setLogs] = useState<TimeLog[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('time_logs')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setLogs(data);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const saveLog = async (topic: string, color: string, durationSeconds: number) => {
    if (durationSeconds < 60) return; // Don't save logs under 1 minute to avoid clutter
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Get today's date in YYYY-MM-DD format based on local timezone
    const today = new Date();
    const dateStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');

    const newLog = {
      user_id: user.id,
      topic,
      color,
      duration_seconds: durationSeconds,
      date: dateStr
    };

    const { data, error } = await supabase
      .from('time_logs')
      .insert([newLog])
      .select()
      .single();

    if (!error && data) {
      setLogs(prev => [data, ...prev]);
      return data;
    }
    return null;
  };

  const deleteLog = async (id: string) => {
    const { error } = await supabase.from('time_logs').delete().eq('id', id);
    if (!error) {
      setLogs(prev => prev.filter(log => log.id !== id));
    }
  };

  return { logs, loading, saveLog, deleteLog, refreshLogs: fetchLogs };
}
