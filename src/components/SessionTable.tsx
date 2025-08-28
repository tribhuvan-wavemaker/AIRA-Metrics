import React from 'react';
import { Clock, MessageSquare, User, RefreshCw } from 'lucide-react';
import { SessionGroup } from '../types/analytics';
import { formatDuration } from '../utils/sessionUtils';

interface SessionTableProps {
  sessions: SessionGroup[];
  onSessionClick: (session: SessionGroup) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function SessionTable({ sessions, onSessionClick, onRefresh, isRefreshing = false }: SessionTableProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Sessions</h3>
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className={`p-2 rounded-lg transition-all duration-150 ${
                isRefreshing
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
              title="Refresh data"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User & Project
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Session
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Duration
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Interactions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sessions.map((session) => (
              <tr key={session.sessionId} className="hover:bg-gray-50 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <User className="w-4 h-4 text-gray-400 mr-2" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{session.username}</div>
                      <div className="text-sm text-gray-500">{session.projectName}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => onSessionClick(session)}
                    className={`flex items-center transition-colors duration-150 ${
                      session.interactionCount 
                        ? 'hover:text-blue-600 cursor-pointer'
                        : 'cursor-not-allowed opacity-50'
                    }`}
                    disabled={!session.interactionCount}
                  >
                    <MessageSquare className="w-4 h-4 text-gray-400 mr-2" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {session.sessionId.substring(0, 8)}...
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(session.startTime).toLocaleDateString()}
                      </div>
                    </div>
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-900">
                    <Clock className="w-4 h-4 text-gray-400 mr-2" />
                    {formatDuration(session.duration)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button 
                    onClick={() => onSessionClick(session)}
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors duration-150 ${
                      session.interactionCount 
                        ? 'bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer'
                        : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                    }`}
                    disabled={!session.interactionCount}
                  >
                    {session.interactionCount || session.interactions.length} messages
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}