import { Interaction, SessionGroup } from '../types/analytics';

export function groupInteractionsBySession(interactions: Interaction[]): SessionGroup[] {
  const sessionMap = new Map<string, Interaction[]>();
  
  // Group interactions by sessionId
  interactions.forEach(interaction => {
    const sessionId = interaction.sessionId;
    if (!sessionMap.has(sessionId)) {
      sessionMap.set(sessionId, []);
    }
    sessionMap.get(sessionId)!.push(interaction);
  });
  
  // Convert to SessionGroup array
  return Array.from(sessionMap.entries()).map(([sessionId, sessionInteractions]) => {
    const sortedInteractions = sessionInteractions.sort((a, b) => a.timestamp - b.timestamp);
    const startTime = sortedInteractions[0].timestamp;
    const endTime = sortedInteractions[sortedInteractions.length - 1].timestamp;
    const duration = endTime - startTime;
    const totalTokens = sortedInteractions.reduce((sum, interaction) => sum + interaction.tokenUsage.totalTokens, 0);
    
    return {
      sessionId,
      interactions: sortedInteractions,
      totalTokens,
      duration,
      startTime,
      endTime,
      username: sortedInteractions[0].llmRequest.content.includes('userDisplayName') 
        ? JSON.parse(sortedInteractions[0].llmRequest.content).userDisplayName || 'Unknown'
        : 'Unknown',
      projectName: 'Unknown', // This would come from project context
      agentId: sortedInteractions[0].agentId
    };
  });
}

export function formatDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

export function formatTokenCount(tokens: number): string {
  if (tokens >= 1000000) {
    return `${(tokens / 1000000).toFixed(1)}M`;
  } else if (tokens >= 1000) {
    return `${(tokens / 1000).toFixed(1)}K`;
  }
  return tokens.toString();
}