import { useState, useEffect } from 'react';
import { SessionGroup } from '../types/analytics';

interface UseSessionsResult {
  sessions: SessionGroup[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useSessions(filters?: {
  username?: string;
  projectName?: string;
  dateRange?: { start: Date; end: Date };
}): UseSessionsResult {
  const [sessions, setSessions] = useState<SessionGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters?.username) params.append('username', filters.username);
      if (filters?.projectName) params.append('projectName', filters.projectName);
      if (filters?.dateRange) {
        params.append('startDate', filters.dateRange.start.toISOString());
        params.append('endDate', filters.dateRange.end.toISOString());
      }

      const url = `https://aira-metrics.onwavemaker.com/sessions${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setSessions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [filters?.username, filters?.projectName, filters?.dateRange]);

  const refetch = () => {
    fetchSessions();
  };

  return {
    sessions,
    loading,
    error,
    refetch
  };
}