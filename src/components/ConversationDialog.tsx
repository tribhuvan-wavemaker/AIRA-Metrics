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
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Session Details</h2>
              <p className="text-sm text-gray-500">
                {session.sessionId.substring(0, 16)}... • {loading ? 'Loading...' : `${apiInteractions.length} interactions`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-150"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Session Summary */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">User</p>
                <p className="text-sm font-semibold text-gray-900">
                  {apiInteractions.length > 0 ? apiInteractions[0].user_name : session.username}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Bot className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Agent</p>
                <p className="text-sm font-semibold text-gray-900">
                  {session.agentId.replace('wm_', '').replace('_agent', '')}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Duration</p>
                <p className="text-sm font-semibold text-gray-900">
                  {Math.round(session.duration / 60000)}m {Math.round((session.duration % 60000) / 1000)}s
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Tokens</p>
                <p className="text-sm font-semibold text-gray-900">{formatTokenCount(session.totalTokens)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
              <span className="text-gray-600 font-medium">Loading session details...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex-1 p-6">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-800 font-medium">Error loading session details: {error}</p>
            </div>
          </div>
        )}

        {/* Session Interactions */}
        {!loading && !error && (
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-4">
              {requestGroups.map((request, index) => (
                <div key={request.requestId} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  {/* Request Header */}
                  <div 
                    className="px-6 py-4 bg-gray-50 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                    onClick={() => toggleRequest(request.requestId)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {expandedRequests.has(request.requestId) ? (
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-gray-500" />
                          )}
                          <div className="w-6 h-6 bg-blue-100 rounded-md flex items-center justify-center">
                            <Hash className="w-3 h-3 text-blue-600" />
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900">
                            Request #{index + 1}
                          </h4>
                          <p className="text-xs text-gray-500 font-mono">
                            {request.requestId.substring(0, 8)}...
                          </p>
                        </div>
                        <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {request.interactions.length} interaction{request.interactions.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 font-medium">
                        {formatTimestamp(request.timestamp)}
                      </div>
                    </div>
                  </div>

                  {/* Expandable Content */}
                  {expandedRequests.has(request.requestId) && (
                    <div className="divide-y divide-gray-100">
                      {request.interactions.map((interaction, interactionIndex) => (
                        <div key={`${interaction.request_id}-${interactionIndex}`} className="p-6">
                          {/* User Message */}
                          <div className="flex space-x-4 mb-6">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-blue-600" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="text-sm font-semibold text-gray-900">You</span>
                                <span className="text-xs text-gray-500">{formatTimestamp(interaction.timestamp)}</span>
                              </div>
                              <div className="bg-gray-50 rounded-2xl px-4 py-3">
                                <MarkdownRenderer 
                                  content={interaction.request_content}
                                  className="text-sm text-gray-800"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Assistant Response */}
                          <div className="flex space-x-4">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <Bot className="w-4 h-4 text-green-600" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="text-sm font-semibold text-gray-900">Assistant</span>
                                <span className="text-xs text-gray-500">{formatTimestamp(interaction.timestamp)}</span>
                                {interaction.response_tool_name && (
                                  <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                                    {interaction.response_tool_name}
                                  </span>
                                )}
                              </div>
                              <div className="bg-blue-50 rounded-2xl px-4 py-3">
                                <MarkdownRenderer 
                                  content={interaction.response_content}
                                  className="text-sm text-gray-800"
                                />
                                {interaction.response_tool_inputs && interaction.response_tool_inputs !== null && (
                                  <div className="mt-3 pt-3 border-t border-blue-200">
                                    <p className="text-xs font-medium text-blue-700 mb-2">Tool Parameters:</p>
                                    <pre className="text-xs text-blue-600 whitespace-pre-wrap font-mono bg-blue-100 rounded-lg p-2">
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
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-150 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}