import React from 'react';
import { X, MessageSquare, Bot, User, Clock, Zap, ChevronDown, ChevronRight, Terminal, Code, MoreHorizontal, PenTool as Tool } from 'lucide-react';
import { SessionGroup } from '../types/analytics';
import { formatTokenCount } from '../utils/sessionUtils';
import { useSessionDetails } from '../hooks/useSessionDetails';
import { MarkdownRenderer } from './MarkdownRenderer';
import { SessionDetailInteraction } from '../types/analytics';

interface ConversationDialogProps {
  session: SessionGroup | null;
  isOpen: boolean;
  onClose: () => void;
}

interface RequestGroup {
  requestId: string;
  interactions: SessionDetailInteraction[];
  timestamp: number;
  userPrompt?: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  agentId: string;
  provider: string;
  model: string;
}

export function ConversationDialog({ session, isOpen, onClose }: ConversationDialogProps) {
  const [expandedRequests, setExpandedRequests] = React.useState<Set<string>>(new Set());
  const [expandedToolCalls, setExpandedToolCalls] = React.useState<Set<string>>(new Set());
  const [expandedToolInputs, setExpandedToolInputs] = React.useState<Set<string>>(new Set());
  const [expandedExchanges, setExpandedExchanges] = React.useState<Set<string>>(new Set());
  const { interactions: apiInteractions, loading, error } = useSessionDetails(session?.sessionId || null);

  const toggleRequest = (requestId: string) => {
    const newExpanded = new Set(expandedRequests);
    if (newExpanded.has(requestId)) {
      newExpanded.delete(requestId);
    } else {
      newExpanded.add(requestId);
    }
    setExpandedRequests(newExpanded);
  };

  const toggleExchange = (exchangeId: string) => {
    const newExpanded = new Set(expandedExchanges);
    if (newExpanded.has(exchangeId)) {
      newExpanded.delete(exchangeId);
    } else {
      newExpanded.add(exchangeId);
    }
    setExpandedExchanges(newExpanded);
  };

  const toggleToolCall = (toolCallId: string) => {
    const newExpanded = new Set(expandedToolCalls);
    if (newExpanded.has(toolCallId)) {
      newExpanded.delete(toolCallId);
    } else {
      newExpanded.add(toolCallId);
    }
    setExpandedToolCalls(newExpanded);
  };

  const toggleToolInputs = (toolInputId: string) => {
    const newExpanded = new Set(expandedToolInputs);
    if (newExpanded.has(toolInputId)) {
      newExpanded.delete(toolInputId);
    } else {
      newExpanded.add(toolInputId);
    }
    setExpandedToolInputs(newExpanded);
  };
  // Group interactions by request_id
  const requestGroups = React.useMemo(() => {
    const groups = new Map<string, SessionDetailInteraction[]>();
    
    apiInteractions.forEach(interaction => {
      const requestId = interaction.request_id;
      if (!groups.has(requestId)) {
        groups.set(requestId, []);
      }
      groups.get(requestId)!.push(interaction);
    });
    
    // Convert to array and sort by earliest timestamp in each group
    return Array.from(groups.entries()).map(([requestId, interactions]) => {
      const sortedInteractions = interactions.sort((a, b) => a.timestamp - b.timestamp);
      const userPrompt = sortedInteractions.find(i => i.request_type === 'user_prompt')?.request_content;
      
      // Calculate token totals for this request
      const inputTokens = sortedInteractions.reduce((sum, interaction) => sum + (interaction.input_tokens || 0), 0);
      const outputTokens = sortedInteractions.reduce((sum, interaction) => sum + (interaction.output_tokens || 0), 0);
      const totalTokens = sortedInteractions.reduce((sum, interaction) => sum + (interaction.total_tokens || 0), 0);
      const agentId = sortedInteractions[0]?.agent_id || '';
      const provider = sortedInteractions[0]?.provider || '';
      const model = sortedInteractions[0]?.model || '';
      
      return {
        requestId,
        interactions: sortedInteractions,
        timestamp: Math.min(...sortedInteractions.map(i => i.timestamp)),
        userPrompt,
        inputTokens,
        outputTokens,
        totalTokens,
        agentId,
        provider,
        model
      };
    }).sort((a, b) => a.timestamp - b.timestamp);
  }, [apiInteractions]);

  // Calculate total tokens for the entire session
  const sessionTotalTokens = React.useMemo(() => {
    return requestGroups.reduce((sum, group) => sum + group.totalTokens, 0);
  }, [requestGroups]);

  // Group interactions by exchange_id
  const exchangeGroups = React.useMemo(() => {
    const groups = new Map<string, SessionDetailInteraction[]>();
    
    apiInteractions.forEach(interaction => {
      const exchangeId = interaction.exchange_id;
      if (!groups.has(exchangeId)) {
        groups.set(exchangeId, []);
      }
      groups.get(exchangeId)!.push(interaction);
    });
    
    // Convert to array and sort by earliest timestamp in each group
    return Array.from(groups.entries()).map(([exchangeId, interactions]) => ({
      exchangeId,
      interactions: interactions.sort((a, b) => a.timestamp - b.timestamp),
      timestamp: Math.min(...interactions.map(i => i.timestamp))
    })).sort((a, b) => a.timestamp - b.timestamp);
  }, [apiInteractions]);

  // Group responses by type for better display
  const groupResponsesByType = (interactions: SessionDetailInteraction[]) => {
    const textResponses: SessionDetailInteraction[] = [];
    const toolCalls: SessionDetailInteraction[] = [];
    const toolResults: SessionDetailInteraction[] = [];
    
    interactions.forEach(interaction => {
      if (Array.isArray(interaction.response_type)) {
        interaction.response_type.forEach((type, index) => {
          const singleInteraction = {
            ...interaction,
            response_type: type,
            response_content: Array.isArray(interaction.response_content) 
              ? interaction.response_content[index] 
              : interaction.response_content,
            response_tool_id: Array.isArray(interaction.response_tool_id)
              ? interaction.response_tool_id[index]
              : interaction.response_tool_id,
            response_tool_name: Array.isArray(interaction.response_tool_name)
              ? interaction.response_tool_name[index]
              : interaction.response_tool_name,
            response_tool_inputs: Array.isArray(interaction.response_tool_inputs)
              ? interaction.response_tool_inputs[index]
              : interaction.response_tool_inputs
          };
          
          if (type === 'text') {
            textResponses.push(singleInteraction);
          } else if (type === 'tool_use') {
            toolCalls.push(singleInteraction);
          }
        });
      } else {
        if (interaction.response_type === 'text') {
          textResponses.push(interaction);
        } else if (interaction.response_type === 'tool_use') {
          toolCalls.push(interaction);
        } else if (interaction.request_type === 'tool_result') {
          toolResults.push(interaction);
        }
      }
    });
    
    return { textResponses, toolCalls, toolResults };
  };

  // Find tool response from the next interaction
  const findToolResponse = (currentRequestIndex: number, currentInteractionIndex: number) => {
    debugger
    const currentGroup = requestGroups[currentRequestIndex];
    
    // Look for tool response in the next interaction within the same request
    if (currentInteractionIndex + 1 < currentGroup.interactions.length) {
      const nextInteraction = currentGroup.interactions[currentInteractionIndex + 1];
      if (nextInteraction.request_type === 'tool_result') {
        return nextInteraction.request_content;
      }
    }
    
    return null;
  };
  if (!isOpen || !session) return null;

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getRequestTypeColor = (type: string) => {
    switch (type) {
      case 'user_message':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'tool_result':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'tool_use':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getResponseTypeColor = (type: string) => {
    switch (type) {
      case 'text':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'tool_use':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            <MessageSquare className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Session Details</h2>
              <p className="text-sm text-gray-600">
                Session: {session.sessionId} • {loading ? 'Loading...' : `${requestGroups.length} requests`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors duration-150"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Session Summary */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">User</p>
                <p className="text-sm font-medium text-gray-900">
                  {apiInteractions.length > 0 ? apiInteractions[0].user_name : session.username}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Bot className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Project</p>
                <p className="text-sm font-medium text-gray-900">
                  {apiInteractions.length > 0 ? apiInteractions[0].project_name : session.projectName}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Duration</p>
                <p className="text-sm font-medium text-gray-900">
                  {Math.round(session.duration / 60000)}m {Math.round((session.duration % 60000) / 1000)}s
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Total Tokens</p>
                <p className="text-sm font-medium text-gray-900">{formatTokenCount(sessionTotalTokens)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
            <span className="text-gray-600">Loading session details...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex-1 p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">Error loading session details: {error}</p>
            </div>
          </div>
        )}

        {/* Request Groups */}
        {!loading && !error && (
          <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[60vh]">
            {requestGroups.map((requestGroup, index) => {
              const { textResponses, toolCalls, toolResults } = groupResponsesByType(requestGroup.interactions);
              const isExpanded = expandedRequests.has(requestGroup.requestId);
              
              return (
                <div key={requestGroup.requestId} className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Request Header */}
                  <div 
                    className="bg-gray-50 px-4 py-3 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                    onClick={() => toggleRequest(requestGroup.requestId)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-sm font-medium text-gray-900">
                              Request #{index + 1}
                            </span>
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {requestGroup.interactions.length} interaction{requestGroup.interactions.length !== 1 ? 's' : ''}
                            </span>
                            {requestGroup.totalTokens > 0 && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                {formatTokenCount(requestGroup.totalTokens)} tokens
                              </span>
                            )}
                          </div>
                          {requestGroup.userPrompt && (
                            <p className="text-sm text-gray-700 truncate">
                              {requestGroup.userPrompt}
                            </p>
                          )}
                          {requestGroup.totalTokens > 0 && (
                            <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                              <span>Input: {formatTokenCount(requestGroup.inputTokens)}</span>
                              <span>Output: {formatTokenCount(requestGroup.outputTokens)}</span>
                              <span>Agent: {requestGroup.agentId}</span>
                              <span>Model: {requestGroup.provider}-{requestGroup.model.split('/').pop()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 ml-4">
                        <span>{formatTimestamp(requestGroup.timestamp)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Expandable Content */}
                  {isExpanded && (
                    <div className="bg-white">
                      {/* User Prompt */}
                      {requestGroup.userPrompt && (
                        <div className="p-4 border-b border-gray-100">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium text-gray-900 mb-2">User Message</h4>
                              <div className="bg-blue-50 rounded-lg p-3">
                                <MarkdownRenderer 
                                  content={requestGroup.userPrompt}
                                  className="text-sm text-gray-700"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Tool Calls */}
                      {requestGroup.interactions
                        .filter(interaction => interaction.response_type === 'tool_use')
                        .map((toolCall, toolIndex) => {
                          const interactionIndex = requestGroup.interactions.indexOf(toolCall);
                          const toolCallId = `${requestGroup.requestId}-tool-${toolIndex}`;
                          const toolInputId = `${toolCallId}-inputs`;
                          const isToolExpanded = expandedToolCalls.has(toolCallId);
                          const isInputsExpanded = expandedToolInputs.has(toolInputId);
                          const toolResponse = findToolResponse(index, interactionIndex);
                          
                          return (
                            <div key={toolCallId} className="p-4 border-b border-gray-100">
                              <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                  <Tool className="w-4 h-4 text-orange-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  {/* Tool Header */}
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                      <button
                                        onClick={() => toggleToolCall(toolCallId)}
                                        className="flex items-center space-x-2 text-sm font-medium text-gray-900 hover:text-orange-600 transition-colors duration-150"
                                      >
                                        {isToolExpanded ? (
                                          <ChevronDown className="w-4 h-4" />
                                        ) : (
                                          <ChevronRight className="w-4 h-4" />
                                        )}
                                        <span>{toolCall.response_tool_name || 'Tool Call'}</span>
                                      </button>
                                      <button
                                        onClick={() => toggleToolInputs(toolInputId)}
                                        className="p-1 hover:bg-gray-100 rounded transition-colors duration-150"
                                        title="Show tool inputs"
                                      >
                                        <MoreHorizontal className="w-4 h-4 text-gray-500" />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Tool Inputs (shown when 3 dots clicked) */}
                                  {isInputsExpanded && toolCall.response_tool_inputs && (
                                    <div className="mb-3 bg-gray-50 rounded-lg p-3">
                                      <h5 className="text-xs font-medium text-gray-700 mb-2">Tool Inputs:</h5>
                                      <pre className="text-xs text-gray-600 whitespace-pre-wrap overflow-x-auto">
                                        {typeof toolCall.response_tool_inputs === 'string' 
                                          ? toolCall.response_tool_inputs 
                                          : JSON.stringify(toolCall.response_tool_inputs, null, 2)
                                        }
                                      </pre>
                                    </div>
                                  )}

                                  {/* Tool Response (shown when expanded) */}
                                  {isToolExpanded && (
                                    <div className="bg-orange-50 rounded-lg p-3">
                                      <h5 className="text-xs font-medium text-orange-700 mb-2">Tool Response:</h5>
                                      {toolResponse ? (
                                        <div className="text-sm text-gray-700">
                                          <MarkdownRenderer content={toolResponse} />
                                        </div>
                                      ) : (
                                        <p className="text-sm text-gray-500 italic">No response found</p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      {/* Text Responses */}
                      {textResponses.map((response, responseIndex) => (
                        <div key={`text-${responseIndex}`} className="p-4 border-b border-gray-100">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <Bot className="w-4 h-4 text-green-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium text-gray-900 mb-2">
                                {response.agent_id ? response.agent_id : 'Assistant'}
                              </h4>
                              <div className="bg-green-50 rounded-lg p-3">
                                <MarkdownRenderer 
                                  content={response.response_content}
                                  className="text-sm text-gray-700"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
 
        

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-150"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}