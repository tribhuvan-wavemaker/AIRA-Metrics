import { useState, useEffect } from 'react';
import { SessionDetailInteraction } from '../types/analytics';

export function useSessionDetails(sessionId: string | null) {
  const [interactions, setInteractions] = useState<SessionDetailInteraction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setInteractions([]);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchSessionDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        // Use proxy in development, direct API in production
        const apiUrl = import.meta.env.DEV 
          ? `/api/sessions/${sessionId}` 
          : `https://aira-metrics.onwavemaker.com/sessions/${sessionId}`;

        const response = await fetch(apiUrl);

        if (!response.ok) {
          throw new Error(`Failed to fetch session details: ${response.status} ${response.statusText}`);
        }

        const data: SessionDetailInteraction[] = await response.json();
        
        // Sort interactions by timestamp
        const sortedInteractions = data.sort((a, b) => a.timestamp - b.timestamp);
        setInteractions(sortedInteractions);

      } catch (err) {
        console.error('Error fetching session details:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch session details');
        setInteractions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSessionDetails();
  }, [sessionId]);

  return { interactions, loading, error };
}