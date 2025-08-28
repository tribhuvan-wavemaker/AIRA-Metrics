import { useState, useEffect } from 'react';
import { SessionDetailInteraction } from '../types/analytics';

// Mock session details for fallback
const mockSessionDetails: SessionDetailInteraction[] = [
  {
    agent_id: "wm_ui_expert",
    exchange_id: "mock-exchange-1",
    input_tokens: 100,
    input_tokens_read_from_cache: 0,
    input_tokens_written_to_cache: 0,
    interaction_id: 1,
    llm_request_id: 1,
    llm_response_id: [1, 2],
    model: "anthropic/claude-3-sonnet",
    output_tokens: 200,
    project_name: "Mock Project",
    provider: "anthropic",
    request_content: "Hello, can you help me?",
    request_id: "mock-request-1",
    request_tool_id: "",
    request_type: "user_prompt",
    response_content: ["I'd be happy to help you! What do you need assistance with?"],
    response_tool_id: [""],
    response_tool_inputs: [null],
    response_tool_name: [""],
    response_type: ["text"],
    session_id: "mock-session",
    timestamp: Date.now(),
    total_tokens: 300,
    user_name: "Mock User"
  }
];

interface UseSessionDetailsProps {
  sessionId: string | null;
}

export function useSessionDetails(sessionId: string | null) {
  const [interactions, setInteractions] = useState<SessionDetailInteraction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setInteractions([]);
      return;
    }

    const fetchSessionDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        // Use proxy in development, direct API in production
        const apiUrl = import.meta.env.DEV 
          ? `/api/session-details/${sessionId}` 
          : `https://aira-metrics.onwavemaker.com/session-details/${sessionId}`;
        
        const response = await fetch(apiUrl);

        if (!response.ok) {
          throw new Error(`Failed to fetch session details: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        // Handle the new API format where data is keyed by request ID
        let allInteractions: SessionDetailInteraction[] = [];
        
        if (typeof data === 'object' && data !== null) {
          // If data is an object with request IDs as keys
          Object.values(data).forEach((requestInteractions: any) => {
            if (Array.isArray(requestInteractions)) {
              allInteractions.push(...requestInteractions);
            }
          });
        } else if (Array.isArray(data)) {
          // If data is directly an array
          allInteractions = data;
        }
        
        setInteractions(allInteractions);

      } catch (err) {
        console.error('Error fetching session details:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch session details');
        // Fallback to mock data
        setInteractions(mockSessionDetails);
      } finally {
        setLoading(false);
      }
    };

    fetchSessionDetails();
  }, [sessionId]);

  return { interactions, loading, error };
}