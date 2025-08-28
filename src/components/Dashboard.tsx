import React, { useState, useMemo } from 'react';
import { Activity, Users, MessageSquare, Zap, Clock, TrendingUp, ChevronUp, ChevronDown } from 'lucide-react';
import { UserProfile } from './UserProfile';
import { FilterBar } from './FilterBar';
import { MetricsCard } from './MetricsCard';
import { SessionTable } from './SessionTable';
import { ConversationDialog } from './ConversationDialog';
import { formatTokenCount } from '../utils/sessionUtils';
import { mockProjectData } from '../data/mockData';
import { groupInteractionsBySession } from '../utils/sessionUtils';
import { FilterOptions, Interaction, SessionGroup } from '../types/analytics';
import { useUsers } from '../hooks/useUsers';
import { useSessions } from '../hooks/useSessions';

export function Dashboard() {
  const { users: apiUsers, loading: usersLoading, error: usersError } = useUsers();
  
  const [showMetrics, setShowMetrics] = useState(false);
  
  const [filters, setFilters] = useState<FilterOptions>({
    users: [],
    project: '',
    dateRange: 'week',
    sortBy: 'timestamp',
    sortOrder: 'desc'
  });
  
  const [appliedFilters, setAppliedFilters] = useState<FilterOptions>({
    users: [],
    project: '',
    dateRange: 'week',
    sortBy: 'timestamp',
    sortOrder: 'desc'
  });
  
  const { sessions: apiSessions, loading: sessionsLoading, error: sessionsError } = useSessions({
    usernames: appliedFilters.users
  });
  
  const { sessions: apiSessions, loading: sessionsLoading, error: sessionsError, refetch: refetchSessions } = useSessions({
    usernames: appliedFilters.users
  });
  
  const [selectedSession, setSelectedSession] = useState<SessionGroup | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const hasUnappliedChanges = JSON.stringify(filters) !== JSON.stringify(appliedFilters);

  const handleApplyFilters = () => {
    setAppliedFilters({ ...filters });
  };

  const handleRefresh = () => {
    refetchSessions();
  };

  const handleSessionClick = (session: SessionGroup) => {
    // Only allow clicking if session has interactions
    if (!session.interactionCount) return;
    
    // Get detailed interactions from mock data
    const allInteractions = mockProjectData.flatMap(project => project.interaction);
    const detailedSessions = groupInteractionsBySession(allInteractions);
    const detailedSession = detailedSessions.find(s => s.sessionId === session.sessionId);
    
    setSelectedSession(detailedSession || session);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedSession(null);
  };

  // Get unique projects from API sessions
  const projects = useMemo(() => 
    [...new Set(apiSessions.map(s => s.projectName))], [apiSessions]);

  // Filter sessions based on filters
  const filteredSessions = useMemo(() => {
    let filtered = apiSessions;

    // Filter by project
    if (appliedFilters.project) {
      filtered = filtered.filter(session => session.projectName === appliedFilters.project);
    }

    // Filter by date range
    const now = Date.now();
    const ranges = {
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000,
      quarter: 90 * 24 * 60 * 60 * 1000
    };

    if (appliedFilters.dateRange !== 'custom') {
      const cutoff = now - ranges[appliedFilters.dateRange];
      filtered = filtered.filter(session => session.startTime >= cutoff);
    } else if (appliedFilters.startDate || appliedFilters.endDate) {
      const startTime = appliedFilters.startDate ? new Date(appliedFilters.startDate).getTime() : 0;
      const endTime = appliedFilters.endDate ? new Date(appliedFilters.endDate).getTime() : now;
      filtered = filtered.filter(session => 
        session.startTime >= startTime && session.startTime <= endTime
      );
    }

    return filtered;
  }, [apiSessions, appliedFilters]);

  // Apply sorting to sessions
  const sessions = useMemo(() => {
    return [...filteredSessions].sort((a, b) => {
      let aValue, bValue;
      
      switch (appliedFilters.sortBy) {
        case 'tokens':
          aValue = a.totalTokens;
          bValue = b.totalTokens;
          break;
        case 'duration':
          aValue = a.duration;
          bValue = b.duration;
          break;
        case 'interactions':
          aValue = a.interactionCount || a.interactions.length;
          bValue = b.interactionCount || b.interactions.length;
          break;
        default:
          aValue = a.startTime;
          bValue = b.startTime;
      }
      
      return appliedFilters.sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });
  }, [filteredSessions, appliedFilters.sortBy, appliedFilters.sortOrder]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalSessions = sessions.length;
    const totalInteractions = sessions.reduce((sum, session) => sum + (session.interactionCount || session.interactions.length), 0);
    const totalTokens = sessions.reduce((sum, session) => sum + session.totalTokens, 0);
    const avgTokensPerSession = totalSessions > 0 ? Math.round(totalTokens / totalSessions) : 0;
    const avgDuration = sessions.length > 0 
      ? sessions.reduce((sum, session) => sum + session.duration, 0) / sessions.length 
      : 0;
    const uniqueUsers = new Set(sessions.map(s => s.username)).size;

    return {
      totalSessions,
      totalInteractions,
      totalTokens,
      avgTokensPerSession,
      avgDuration,
      uniqueUsers
    };
  }, [sessions]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AIRA Metrics</h1>
              <p className="text-gray-600 mt-2">Monitor and analyze user interactions with AI agents</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Activity className="w-4 h-4" />
                <span>{sessionsLoading ? 'Loading...' : 'Real-time monitoring'}</span>
              </div>
              <UserProfile />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Loading and Error States */}
        {sessionsLoading && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading sessions...</p>
          </div>
        )}

        {sessionsError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">Error loading sessions: {sessionsError}</p>
          </div>
        )}

        {/* Metrics Cards */}
        {!sessionsLoading && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Key Metrics</h3>
              <button
                onClick={() => setShowMetrics(!showMetrics)}
                className="flex items-center space-x-2 px-3 py-1 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-150"
              >
                <span>{showMetrics ? 'Hide' : 'Show'}</span>
                {showMetrics ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>
            {showMetrics && (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <MetricsCard
                    title="Total Sessions"
                    value={metrics.totalSessions}
                    icon={<MessageSquare className="w-6 h-6" />}
                    color="blue"
                    trend={{ direction: 'up', percentage: 12.5 }}
                  />
                  <MetricsCard
                    title="Total Interactions"
                    value={metrics.totalInteractions}
                    icon={<Activity className="w-6 h-6" />}
                    color="teal"
                    trend={{ direction: 'up', percentage: 8.3 }}
                  />
                  <MetricsCard
                    title="Total Tokens"
                    value={metrics.totalTokens ? formatTokenCount(metrics.totalTokens) : '-'}
                    icon={<Zap className="w-6 h-6" />}
                    color="orange"
                  />
                  <MetricsCard
                    title="Avg Tokens/Session"
                    value={metrics.avgTokensPerSession ? formatTokenCount(metrics.avgTokensPerSession) : '-'}
                    icon={<TrendingUp className="w-6 h-6" />}
                    color="green"
                  />
                  <MetricsCard
                    title="Avg Session Duration"
                    value={`${Math.round(metrics.avgDuration / 60000)}m`}
                    icon={<Clock className="w-6 h-6" />}
                    color="purple"
                  />
                  <MetricsCard
                    title="Active Users"
                    value={metrics.uniqueUsers}
                    icon={<Users className="w-6 h-6" />}
                    color="red"
                    trend={{ direction: 'up', percentage: 5.7 }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Filters */}
        <FilterBar 
          filters={filters}
          onFiltersChange={setFilters}
          onApplyFilters={handleApplyFilters}
          hasUnappliedChanges={hasUnappliedChanges}
          users={apiUsers}
          usersLoading={usersLoading}
          usersError={usersError}
          projects={projects}
        />

        {/* Session Table */}
        {!sessionsLoading && (
          <SessionTable 
            sessions={sessions} 
            onSessionClick={handleSessionClick}
            onRefresh={handleRefresh}
            isRefreshing={sessionsLoading}
          />
        )}
        
        {/* Conversation Dialog */}
        <ConversationDialog 
          session={selectedSession}
          isOpen={isDialogOpen}
          onClose={handleCloseDialog}
        />
      </div>
    </div>
  );
}