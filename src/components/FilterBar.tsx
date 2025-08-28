import React from 'react';
import { Calendar, User, FolderOpen, ArrowUpDown } from 'lucide-react';
import { FilterOptions } from '../types/analytics';
import { SearchableSelect } from './SearchableSelect';

interface FilterBarProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onApplyFilters: () => void;
  hasUnappliedChanges: boolean;
  users: string[];
  usersLoading?: boolean;
  usersError?: string | null;
  projects: string[];
}

export function FilterBar({ 
  filters, 
  onFiltersChange, 
  onApplyFilters, 
  hasUnappliedChanges, 
  users, 
  usersLoading = false,
  usersError = null,
  projects 
}: FilterBarProps) {
  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleReset = () => {
    onFiltersChange({
      users: [],
      project: '',
      dateRange: 'week',
      sortBy: 'timestamp',
      sortOrder: 'desc'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* User Filter */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="inline w-4 h-4 mr-1" />
            Users {usersLoading && <span className="text-xs text-gray-500">(Loading...)</span>}
          </label>
          {usersError ? (
            <div className="w-full rounded-md border border-red-300 px-3 py-2 text-sm bg-red-50">
              <span className="text-red-600">Error loading users: {usersError}</span>
            </div>
          ) : (
            <SearchableSelect
              options={users}
              value={filters.users}
              onChange={(value) => handleFilterChange('users', value)}
              placeholder={usersLoading ? "Loading users..." : "Select users..."}
              multiple={true}
              icon={<User className="w-4 h-4" />}
              disabled={usersLoading}
            />
          )}
        </div>

        {/* Project Filter */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FolderOpen className="inline w-4 h-4 mr-1" />
            Project
          </label>
          <SearchableSelect
            options={projects}
            value={filters.project}
            onChange={(value) => handleFilterChange('project', value)}
            placeholder="Search projects..."
            multiple={false}
            icon={<FolderOpen className="w-4 h-4" />}
          />
        </div>

        {/* Date Range Filter */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="inline w-4 h-4 mr-1" />
            Date Range
          </label>
          <select
            value={filters.dateRange}
            onChange={(e) => handleFilterChange('dateRange', e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="day">Last Day</option>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>

        {/* Sort Options */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <ArrowUpDown className="inline w-4 h-4 mr-1" />
            Sort By
          </label>
          <div className="flex gap-2">
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="timestamp">Time</option>
              <option value="tokens">Tokens</option>
              <option value="duration">Duration</option>
              <option value="interactions">Interactions</option>
            </select>
            <select
              value={filters.sortOrder}
              onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="desc">Desc</option>
              <option value="asc">Asc</option>
            </select>
          </div>
        </div>
      </div>

      {/* Custom Date Range */}
      {filters.dateRange === 'custom' && (
        <div className="flex gap-4 pt-4 border-t border-gray-100">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={filters.startDate || ''}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={filters.endDate || ''}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <button
          onClick={handleReset}
          className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-150"
        >
          Reset Filters
        </button>
        <button
          onClick={onApplyFilters}
          className={`px-6 py-2 text-sm font-medium rounded-lg transition-all duration-150 ${
            hasUnappliedChanges
              ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
          disabled={!hasUnappliedChanges}
        >
          Apply Filters
          {hasUnappliedChanges && (
            <span className="ml-2 inline-flex items-center justify-center w-2 h-2 bg-blue-300 rounded-full"></span>
          )}
        </button>
      </div>
    </div>
  );
}