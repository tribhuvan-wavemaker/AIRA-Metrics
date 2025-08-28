import React, { useState } from 'react';
import { BarChart3, Users, Clock, Zap } from 'lucide-react';
import { FilterBar } from './FilterBar';
import { MetricsCard } from './MetricsCard';
import { SessionTable } from './SessionTable';
import { ConversationDialog } from './ConversationDialog';
import { UserProfile } from './UserProfile';
import { useSessions } from '../hooks/useSessions';
import { useUsers } from '../hooks/useUsers';
import { SessionGroup, FilterOptions } from '../types/analytics';
import { formatTokenCount } from '../utils/sessionUtils';

export function Dashboard() {
  const [selectedSession, setSelectedSession] = useState<SessionGroup | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    username: '',
    projectName: '',
    dateRange: { start: '', end: '' }
  });

  const { sessions, loading: sessionsLoading, error: sessionsError } = useSessions(filters);
  const { users: apiUsers, loading: usersLoading } = useUsers();

  const handleSessionClick = (session: SessionGroup) => {
    setSelectedSession(session);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedSession(null);
  };

  // Calculate metrics
  const totalSessions = sessions.length;
  const totalUsers = new Set(sessions.map(s => s.username)).size;
  const avgDuration = sessions.length > 0 
    ? sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length 
    : 0;
  const totalTokens = sessions.reduce((sum, s) => sum + s.totalTokens, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <BarChart3 className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            </div>
            <UserProfile />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="mb-8">
          <FilterBar
            filters={filters}
            onFiltersChange={setFilters}
            users={apiUsers.map(user => user.username)}
            projects={Array.from(new Set(sessions.map(s => s.projectName)))}
            loading={usersLoading}
          />
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricsCard
            title="Total Sessions"
            value={totalSessions.toString()}
            icon={BarChart3}
            color="blue"
          />
          <MetricsCard
            title="Active Users"
            value={totalUsers.toString()}
            icon={Users}
            color="green"
          />
          <MetricsCard
            title="Avg Duration"
            value={`${Math.round(avgDuration / 60000)}m`}
            icon={Clock}
            color="yellow"
          />
          <MetricsCard
            title="Total Tokens"
            value={formatTokenCount(totalTokens)}
            icon={Zap}
            color="purple"
          />
        </div>

        {/* Sessions Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Sessions</h2>
          </div>
          <SessionTable
            sessions={sessions}
            loading={sessionsLoading}
            error={sessionsError}
            onSessionClick={handleSessionClick}
          />
        </div>
      </div>

      {/* Conversation Dialog */}
      <ConversationDialog
        session={selectedSession}
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
      />
    </div>
  );
}