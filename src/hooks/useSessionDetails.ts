import { useState, useEffect } from 'react';
import { SessionDetailInteraction } from '../types/analytics';

// Helper function to normalize array fields
const normalizeInteraction = (interaction: any): SessionDetailInteraction[] => {
  // Handle arrays in response fields
  const responseContent = Array.isArray(interaction.response_content) 
    ? interaction.response_content 
    : [interaction.response_content];
  
  const responseType = Array.isArray(interaction.response_type)
    ? interaction.response_type
    : [interaction.response_type];
    
  const responseToolId = Array.isArray(interaction.response_tool_id)
    ? interaction.response_tool_id
    : [interaction.response_tool_id];
    
  const responseToolName = Array.isArray(interaction.response_tool_name)
    ? interaction.response_tool_name
    : [interaction.response_tool_name];
    
  const responseToolInputs = Array.isArray(interaction.response_tool_inputs)
    ? interaction.response_tool_inputs
    : [interaction.response_tool_inputs];

  // Create separate interactions for each response
  const maxLength = Math.max(
    responseContent.length,
    responseType.length,
    responseToolId.length,
    responseToolName.length,
    responseToolInputs.length
  );

  const interactions: SessionDetailInteraction[] = [];
  
  for (let i = 0; i < maxLength; i++) {
    interactions.push({
      ...interaction,
      response_content: responseContent[i] || '',
      response_type: responseType[i] || '',
      response_tool_id: responseToolId[i] || '',
      response_tool_name: responseToolName[i] || '',
      response_tool_inputs: responseToolInputs[i] || null,
      // Add a suffix to exchange_id for multiple responses
      exchange_id: maxLength > 1 ? `${interaction.exchange_id}-response-${i + 1}` : interaction.exchange_id
    });
  }
  
  return interactions;
};
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
        
        // Handle new API format where data is keyed by request ID
        let allInteractions: SessionDetailInteraction[] = [];
        
        if (typeof data === 'object' && data !== null) {
          // If data is an object with request IDs as keys
          Object.values(data).forEach((requestInteractions: any) => {
            if (Array.isArray(requestInteractions)) {
              requestInteractions.forEach(interaction => {
                const normalizedInteractions = normalizeInteraction(interaction);
                allInteractions.push(...normalizedInteractions);
              });
            }
          });
        } else if (Array.isArray(data)) {
          // Fallback for old format
          data.forEach(interaction => {
            const normalizedInteractions = normalizeInteraction(interaction);
            allInteractions.push(...normalizedInteractions);
          });
        }
        
        // Sort interactions by timestamp
        const sortedInteractions = allInteractions.sort((a, b) => a.timestamp - b.timestamp);
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