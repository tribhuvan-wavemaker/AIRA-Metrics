import { useState, useEffect } from 'react';
import { ApiSession, SessionsApiResponse, SessionGroup } from '../types/analytics';

// Mock API sessions for fallback
const mockApiSessions: ApiSession[] = [
  {
    session_id: "ae620910-91bf-4a0e-892a-58fec8da54f2",
    first_interaction: "Tue, 26 Aug 2025 10:00:00 GMT",
    last_interaction: "Tue, 26 Aug 2025 10:05:00 GMT",
    interaction_count: 15,
    project_id: "WMPRJ2c9180889675120e01968571d1250159",
    project_name: "pilot_test",
    user_name: "john doe",
  },
  {
    session_id: "bf731021-a2cg-5b1f-9a3b-69gfd9eb65g3",
    first_interaction: "Tue, 26 Aug 2025 14:30:00 GMT",
    last_interaction: "Tue, 26 Aug 2025 14:32:00 GMT",
    interaction_count: 8,
    project_id: "WMPRJ3d8291990786231f02079682e2361270",
    project_name: "ecommerce_platform",
    user_name: "sarah wilson",
  },
  {
    session_id: "cg842132-b3dh-6c2g-ab4c-7ahge0fc76h4",
    first_interaction: "Tue, 26 Aug 2025 09:00:00 GMT",
    last_interaction: "Tue, 26 Aug 2025 09:03:00 GMT",
    interaction_count: 22,
    project_id: "WMPRJ4f9402a01897342g03190793f3472381",
    project_name: "data_analysis_tool",
    user_name: "mike chen",
  },
];

interface UseSessionsProps {
  usernames: string[];
}

export function useSessions({ usernames }: UseSessionsProps) {
  const [sessions, setSessions] = useState<SessionGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toTitleCase = (str: string) => {
    return str.replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  };

  const convertApiSessionToSessionGroup = (apiSession: ApiSession): SessionGroup => {
    const firstInteraction = new Date(apiSession.first_interaction).getTime();
    const lastInteraction = new Date(apiSession.last_interaction).getTime();
    const duration = lastInteraction - firstInteraction;

    return {
      sessionId: apiSession.session_id,
      interactions: [], // Empty for now as we don't have detailed interaction data
      totalTokens: 0, // Will be left empty for now
      duration,
      startTime: firstInteraction,
      endTime: lastInteraction,
      username: toTitleCase(apiSession.user_name),
      projectName: apiSession.project_name,
      agentId: '', // Will be left empty for now
      interactionCount: apiSession.interaction_count
    };
  };

  const fetchSessions = async (requestUsernames: string[]) => {
    try {
      setLoading(true);
      setError(null);

      // Use proxy in development, direct API in production
      const apiUrl = import.meta.env.DEV 
        ? 'https://aira-metrics.onwavemaker.com/sessions' 
        : 'https://aira-metrics.onwavemaker.com/sessions';
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usernames: requestUsernames
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch sessions: ${response.status} ${response.statusText}`);
      }

      const data: SessionsApiResponse = await response.json();
      
      const convertedSessions = data.data.map(convertApiSessionToSessionGroup);
      setSessions(convertedSessions);

    } catch (err) {
      console.error('Error fetching sessions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch sessions');
      // Fallback to mock data
      const convertedMockSessions = mockApiSessions.map(convertApiSessionToSessionGroup);
      setSessions(convertedMockSessions);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions(usernames);
  }, [usernames]);

  const refetch = () => {
    fetchSessions(usernames);
  };

  return { sessions, loading, error, refetch };
}