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

      const url = new URL('https://aira-metrics.onwavemaker.com/sessions');
      
      if (filters?.username) {
        url.searchParams.append('username', filters.username);
      }
      if (filters?.projectName) {
        url.searchParams.append('projectName', filters.projectName);
      }
      if (filters?.dateRange) {
        url.searchParams.append('startDate', filters.dateRange.start.toISOString());
        url.searchParams.append('endDate', filters.dateRange.end.toISOString());
      }

      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setSessions(data);
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch sessions');
      
      // Fallback to mock data on error
      setSessions([
        {
          sessionId: 'session-1',
          username: 'john.doe',
          projectName: 'Sample Project',
          startTime: Date.now() - 3600000,
          endTime: Date.now(),
          duration: 3600000,
          totalTokens: 15420,
          interactions: 8
        },
        {
          sessionId: 'session-2',
          username: 'jane.smith',
          projectName: 'Another Project',
          startTime: Date.now() - 7200000,
          endTime: Date.now() - 3600000,
          duration: 3600000,
          totalTokens: 9876,
          interactions: 5
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [filters?.username, filters?.projectName, filters?.dateRange?.start, filters?.dateRange?.end]);

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