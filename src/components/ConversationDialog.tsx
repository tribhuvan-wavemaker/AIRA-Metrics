import React from 'react';
import { X, MessageSquare, Bot, User, Clock, Zap, ChevronDown, ChevronRight, Hash } from 'lucide-react';
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
}

export function ConversationDialog({ session, isOpen, onClose }: ConversationDialogProps) {
  const [expandedRequests, setExpandedRequests] = React.useState<Set<string>>(new Set());
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
    return Array.from(groups.entries()).map(([requestId, interactions]) => ({
      requestId,
      interactions: interactions.sort((a, b) => a.timestamp - b.timestamp),
      timestamp: Math.min(...interactions.map(i => i.timestamp))
    })).sort((a, b) => a.timestamp - b.timestamp);
  }, [apiInteractions]);

  // Auto-expand first request when dialog opens
  React.useEffect(() => {
    if (requestGroups.length > 0 && expandedRequests.size === 0) {
      setExpandedRequests(new Set([requestGroups[0].requestId]));
    }
  }, [requestGroups]);

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
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            <MessageSquare className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Session Details</h2>
              <p className="text-sm text-gray-600">
                Session: {session.sessionId.substring(0, 16)}... • {loading ? 'Loading...' : `${apiInteractions.length} interactions`}
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
                <p className="text-xs text-gray-500">Agent</p>
                <p className="text-sm font-medium text-gray-900">
                  {session.agentId.replace('wm_', '').replace('_agent', '')}
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
                <p className="text-sm font-medium text-gray-900">{formatTokenCount(session.totalTokens)}</p>
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

        {/* Session Interactions */}
        {!loading && !error && (
          <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[60vh]">
            {requestGroups.map((request, index) => (
              <div key={request.requestId} className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Request Header */}
                <div 
                  className="bg-gray-50 px-4 py-3 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                  onClick={() => toggleRequest(request.requestId)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {expandedRequests.has(request.requestId) ? (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                      )}
                      <Hash className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-900">
                        Request #{index + 1}
                      </span>
                      <span className="text-xs text-gray-500 font-mono">
                        {request.requestId.substring(0, 8)}...
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium border bg-blue-50 border-blue-200 text-blue-800">
                        {request.interactions.length} interaction{request.interactions.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>{formatTimestamp(request.timestamp)}</span>
                    </div>
                  </div>
                </div>

                {/* Expandable Content */}
                {expandedRequests.has(request.requestId) && (
                  <div className="space-y-4">
                    {request.interactions.map((interaction, interactionIndex) => (
                      <div key={`${interaction.request_id}-${interactionIndex}`} className="border-b border-gray-100 last:border-b-0">
                        {/* Request */}
                        <div className="p-4 border-b border-gray-50">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-2">
                                <h4 className="text-sm font-medium text-gray-900">Request</h4>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRequestTypeColor(interaction.request_type)}`}>
                                  {interaction.request_type}
                                </span>
                                <span className="text-xs text-gray-400">{formatTimestamp(interaction.timestamp)}</span>
                              </div>
                              <div className="bg-gray-50 rounded-lg p-3">
                                <MarkdownRenderer 
                                  content={interaction.request_content}
                                  className="text-sm text-gray-700"
                                />
                              </div>
                              {interaction.request_tool_id && (
                                <p className="text-xs text-gray-500 mt-1">Tool ID: {interaction.request_tool_id}</p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Response */}
                        <div className="p-4">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <Bot className="w-4 h-4 text-green-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium text-gray-900 mb-2">Response</h4>
                              <div className="bg-green-50 rounded-lg p-3">
                                <div className="flex items-center space-x-2 mb-2">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getResponseTypeColor(interaction.response_type)}`}>
                                    {interaction.response_type}
                                  </span>
                                  {interaction.response_tool_name && (
                                    <span className="text-xs text-green-600">
                                      Tool: {interaction.response_tool_name}
                                    </span>
                                  )}
                                </div>
                                <MarkdownRenderer 
                                  content={interaction.response_content}
                                  className="text-sm text-gray-700"
                                />
                                {interaction.response_tool_inputs && interaction.response_tool_inputs !== null && (
                                  <div className="mt-2 pt-2 border-t border-green-200">
                                    <p className="text-xs text-green-600 mb-1">Tool Inputs:</p>
                                    <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono">
                                      {typeof interaction.response_tool_inputs === 'string' 
                                        ? interaction.response_tool_inputs 
                                        : JSON.stringify(interaction.response_tool_inputs, null, 2)}
                                    </pre>
                                  </div>
                                )}
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
                        <span className="font-mono">{request.requestId}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
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