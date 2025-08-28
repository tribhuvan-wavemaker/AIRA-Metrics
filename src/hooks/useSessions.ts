import { useState, useEffect } from 'react';
import { SessionGroup, FilterOptions } from '../types/analytics';

interface UseSessionsReturn {
  sessions: SessionGroup[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useSessions(filters: FilterOptions = {}): UseSessionsReturn {
  const [sessions, setSessions] = useState<SessionGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('https://aira-metrics.onwavemaker.com/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filters),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSessions(data);
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch sessions');
      
      // Fallback to mock data on error
      const mockSessions: SessionGroup[] = [
        {
          sessionId: 'session-1',
          username: 'john.doe@example.com',
          projectName: 'E-commerce Dashboard',
          startTime: Date.now() - 3600000,
          endTime: Date.now() - 3000000,
          duration: 600000,
          totalTokens: 15420,
          interactionCount: 12,
          lastActivity: Date.now() - 3000000,
        },
        {
          sessionId: 'session-2',
          username: 'jane.smith@example.com',
          projectName: 'Blog Platform',
          startTime: Date.now() - 7200000,
          endTime: Date.now() - 6000000,
          duration: 1200000,
          totalTokens: 28750,
          interactionCount: 18,
          lastActivity: Date.now() - 6000000,
        },
      ];
      setSessions(mockSessions);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [JSON.stringify(filters)]);

  const refetch = () => {
    fetchSessions();
  };

  return {
    sessions,
    loading,
    error,
    refetch,
  };
}