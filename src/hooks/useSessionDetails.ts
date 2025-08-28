import { useState, useEffect } from 'react';
import { SessionDetailInteraction } from '../types/analytics';

interface UseSessionDetailsResult {
  interactions: SessionDetailInteraction[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useSessionDetails(sessionId: string | null): UseSessionDetailsResult {
  const [interactions, setInteractions] = useState<SessionDetailInteraction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSessionDetails = async () => {
    if (!sessionId) {
      setInteractions([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://aira-metrics.onwavemaker.com/session-details/${sessionId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Process the new API format where data is keyed by request ID
      const processedInteractions: SessionDetailInteraction[] = [];
      
      // Handle the new format where data is an object keyed by request IDs
      Object.entries(data).forEach(([requestId, interactions]) => {
        if (Array.isArray(interactions)) {
          interactions.forEach((interaction: any) => {
            // Normalize the interaction data to handle arrays in response fields
            const normalizedInteractions = normalizeInteraction(interaction);
            processedInteractions.push(...normalizedInteractions);
          });
        }
      });

      // Sort by timestamp
      processedInteractions.sort((a, b) => a.timestamp - b.timestamp);
      
      setInteractions(processedInteractions);
    } catch (err) {
      console.error('Error fetching session details:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch session details');
      
      // Fallback to mock data for development
      setInteractions([]);
    } finally {
      setLoading(false);
    }
  };

  // Function to normalize interaction data that may have arrays in response fields
  const normalizeInteraction = (interaction: any): SessionDetailInteraction[] => {
    const baseInteraction = {
      ...interaction,
      // Ensure all required fields are present
      agent_id: interaction.agent_id || '',
      model: interaction.model || '',
      provider: interaction.provider || '',
      input_tokens: interaction.input_tokens || 0,
      output_tokens: interaction.output_tokens || 0,
      total_tokens: interaction.total_tokens || 0,
      project_name: interaction.project_name || '',
    };

    // If response fields are arrays, create separate interactions for each response
    if (Array.isArray(interaction.response_type)) {
      const normalizedInteractions: SessionDetailInteraction[] = [];
      
      interaction.response_type.forEach((type: string, index: number) => {
        normalizedInteractions.push({
          ...baseInteraction,
          response_type: type,
          response_content: Array.isArray(interaction.response_content) 
            ? interaction.response_content[index] || ''
            : interaction.response_content,
          response_tool_id: Array.isArray(interaction.response_tool_id)
            ? interaction.response_tool_id[index] || ''
            : interaction.response_tool_id || '',
          response_tool_name: Array.isArray(interaction.response_tool_name)
            ? interaction.response_tool_name[index] || ''
            : interaction.response_tool_name || '',
          response_tool_inputs: Array.isArray(interaction.response_tool_inputs)
            ? interaction.response_tool_inputs[index] || null
            : interaction.response_tool_inputs || null,
          // Add a unique identifier for each normalized interaction
          interaction_id: `${interaction.interaction_id}-${index}`,
        });
      });
      
      return normalizedInteractions;
    } else {
      // Single response, return as-is
      return [{
        ...baseInteraction,
        response_type: interaction.response_type || '',
        response_content: interaction.response_content || '',
        response_tool_id: interaction.response_tool_id || '',
        response_tool_name: interaction.response_tool_name || '',
        response_tool_inputs: interaction.response_tool_inputs || null,
      }];
    }
  };

  const refetch = () => {
    fetchSessionDetails();
  };

  useEffect(() => {
    fetchSessionDetails();
  }, [sessionId]);

  return {
    interactions,
    loading,
    error,
    refetch,
  };
}