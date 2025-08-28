import React from 'react';
import { X, MessageSquare, Bot, User, Clock, Zap, ChevronDown, ChevronRight, Terminal, Code, Play } from 'lucide-react';
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
}

export function ConversationDialog({ session, isOpen, onClose }: ConversationDialogProps) {
  const [expandedRequests, setExpandedRequests] = React.useState<Set<string>>(new Set());
  const [expandedToolCalls, setExpandedToolCalls] = React.useState<Set<string>>(new Set());
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

  const toggleToolCall = (toolCallId: string) => {
    const newExpanded = new Set(expandedToolCalls);
    if (newExpanded.has(toolCallId)) {
      newExpanded.delete(toolCallId);
    } else {
      newExpanded.add(toolCallId);
    }
    setExpandedToolCalls(newExpanded);
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
      
      return {
        requestId,
        interactions: sortedInteractions,
        timestamp: Math.min(...sortedInteractions.map(i => i.timestamp)),
        userPrompt
      };
    }).sort((a, b) => a.timestamp - b.timestamp);
  }, [apiInteractions]);

  // Process responses to separate text and tool calls
  const processResponses = (interaction: SessionDetailInteraction) => {
    const responses: Array<{
      type: string;
      content: string;
      toolId?: string;
      toolName?: string;
      toolInputs?: string;
      index: number;
    }> = [];

    if (Array.isArray(interaction.response_type)) {
      interaction.response_type.forEach((type, index) => {
        responses.push({
          type,
          content: Array.isArray(interaction.response_content) 
            ? interaction.response_content[index] || ''
            : interaction.response_content,
          toolId: Array.isArray(interaction.response_tool_id)
            ? interaction.response_tool_id[index]
            : interaction.response_tool_id,
          toolName: Array.isArray(interaction.response_tool_name)
            ? interaction.response_tool_name[index]
            : interaction.response_tool_name,
          toolInputs: Array.isArray(interaction.response_tool_inputs)
            ? interaction.response_tool_inputs[index]
            : interaction.response_tool_inputs,
          index
        });
      });
    } else {
      responses.push({
        type: interaction.response_type,
        content: interaction.response_content as string,
        toolId: interaction.response_tool_id as string,
        toolName: interaction.response_tool_name as string,
        toolInputs: interaction.response_tool_inputs as string,
        index: 0
      });
    }

    return responses;
  };

  if (!isOpen || !session) return null;

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
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
                Session: {session.sessionId.substring(0, 16)}... • {loading ? 'Loading...' : `${requestGroups.length} requests`}
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
                <p className="text-sm font-medium text-gray-900">
                  {apiInteractions.length > 0 
                    ? formatTokenCount(apiInteractions.reduce((sum, i) => sum + (i.total_tokens || 0), 0))
                    : formatTokenCount(session.totalTokens)
                  }
                </p>
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
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-50 border border-blue-200 text-blue-800">
                              {requestGroup.interactions.length} exchange{requestGroup.interactions.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                          {requestGroup.userPrompt && (
                            <p className="text-sm text-gray-700 line-clamp-2">
                              {requestGroup.userPrompt}
                            </p>
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
                      {requestGroup.interactions.map((interaction, interactionIndex) => (
                        <div key={`${interaction.exchange_id}-${interactionIndex}`} className="border-b border-gray-100 last:border-b-0">
                          
                          {/* User Message (for user_prompt type) */}
                          {interaction.request_type === 'user_prompt' && (
                            <div className="p-4 bg-blue-50">
                              <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                  <User className="w-4 h-4 text-blue-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <h4 className="text-sm font-medium text-gray-900">User Message</h4>
                                    <span className="text-xs text-gray-500">{formatTimestamp(interaction.timestamp)}</span>
                                  </div>
                                  <div className="bg-white rounded-lg p-3 border border-blue-200">
                                    <MarkdownRenderer 
                                      content={interaction.request_content}
                                      className="text-sm text-gray-700"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Tool Result (for tool_result type) */}
                          {interaction.request_type === 'tool_result' && (
                            <div className="p-4 bg-green-50">
                              <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                  <Terminal className="w-4 h-4 text-green-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <h4 className="text-sm font-medium text-gray-900">Tool Result</h4>
                                    <span className="text-xs text-gray-500">{formatTimestamp(interaction.timestamp)}</span>
                                    {interaction.request_tool_id && (
                                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        {interaction.request_tool_id}
                                      </span>
                                    )}
                                  </div>
                                  <div className="bg-white rounded-lg p-3 border border-green-200">
                                    <MarkdownRenderer 
                                      content={interaction.request_content}
                                      className="text-sm text-gray-700"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* AI Response */}
                          <div className="p-4">
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                <Bot className="w-4 h-4 text-purple-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 mb-3">
                                  <h4 className="text-sm font-medium text-gray-900">AI Response</h4>
                                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-50 border border-purple-200 text-purple-800">
                                    {interaction.agent_id}
                                  </span>
                                  {interaction.total_tokens && (
                                    <span className="text-xs text-gray-500">
                                      {formatTokenCount(interaction.total_tokens)} tokens
                                    </span>
                                  )}
                                </div>

                                {/* Process and display responses */}
                                <div className="space-y-3">
                                  {processResponses(interaction).map((response, responseIndex) => (
                                    <div key={responseIndex}>
                                      {response.type === 'text' && (
                                        <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                                          <MarkdownRenderer 
                                            content={response.content}
                                            className="text-sm text-gray-700"
                                          />
                                        </div>
                                      )}

                                      {response.type === 'tool_use' && (
                                        <div className="border border-orange-200 rounded-lg overflow-hidden">
                                          <div 
                                            className="bg-orange-50 px-3 py-2 cursor-pointer hover:bg-orange-100 transition-colors duration-150"
                                            onClick={() => toggleToolCall(`${interaction.exchange_id}-tool-${responseIndex}`)}
                                          >
                                            <div className="flex items-center justify-between">
                                              <div className="flex items-center space-x-2">
                                                {expandedToolCalls.has(`${interaction.exchange_id}-tool-${responseIndex}`) ? (
                                                  <ChevronDown className="w-4 h-4 text-orange-600" />
                                                ) : (
                                                  <ChevronRight className="w-4 h-4 text-orange-600" />
                                                )}
                                                <Code className="w-4 h-4 text-orange-600" />
                                                <span className="text-sm font-medium text-orange-900">
                                                  {response.toolName || 'Tool Call'}
                                                </span>
                                              </div>
                                              <Play className="w-4 h-4 text-orange-600" />
                                            </div>
                                          </div>

                                          {expandedToolCalls.has(`${interaction.exchange_id}-tool-${responseIndex}`) && (
                                            <div className="bg-white p-3 border-t border-orange-200">
                                              {response.content && (
                                                <div className="mb-3">
                                                  <p className="text-xs font-medium text-gray-600 mb-1">Description:</p>
                                                  <div className="bg-gray-50 rounded p-2">
                                                    <MarkdownRenderer 
                                                      content={response.content}
                                                      className="text-sm text-gray-700"
                                                    />
                                                  </div>
                                                </div>
                                              )}
                                              
                                              {response.toolInputs && (
                                                <div>
                                                  <p className="text-xs font-medium text-gray-600 mb-1">Tool Inputs:</p>
                                                  <div className="bg-gray-50 rounded p-2">
                                                    <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
                                                      {typeof response.toolInputs === 'string' 
                                                        ? response.toolInputs 
                                                        : JSON.stringify(response.toolInputs, null, 2)}
                                                    </pre>
                                                  </div>
                                                </div>
                                              )}

                                              {response.toolId && (
                                                <div className="mt-2 pt-2 border-t border-gray-200">
                                                  <p className="text-xs text-gray-500">Tool ID: {response.toolId}</p>
                                                </div>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {/* Request Info */}
                      <div className="bg-gray-50 px-4 py-2 text-xs text-gray-600">
                        <div className="flex items-center justify-between">
                          <span>Request ID:</span>
                          <span className="font-mono">{requestGroup.requestId}</span>
                        </div>
                      </div>
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