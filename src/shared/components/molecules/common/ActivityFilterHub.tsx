/**
 * ActivityFilterHub Component - DRY Violation Fix
 *
 * Reusable filter hub component extracted from Activity.tsx
 * to prevent JSX duplication for search input, filter pills, and date range selector.
 *
 * Following CLAUDE.md principles:
 * - Single Responsibility: Handles all activity filtering UI and logic
 * - DRY: Eliminates repeated filter section JSX structures
 * - Reusability: Can be used across different activity displays
 * - Design System Integration: Uses PokemonCard, PokemonInput, and PokemonBadge for consistency
 */

import React from 'react';
import { Search, Calendar, LucideIcon } from 'lucide-react';
import {
  PokemonCard,
  PokemonInput,
  PokemonBadge,
} from '../../atoms/design-system';

interface FilterOption {
  value: string;
  label: string;
  icon: LucideIcon;
}

interface DateRangeOption {
  value: string;
  label: string;
}

interface ActivityFilters {
  type?: string;
  dateRange?: string;
}

interface ActivityFilterHubProps {
  /** Current search input value */
  searchInput: string;
  /** Function to update search input */
  setSearchInput: (value: string) => void;
  /** Current search term (from hook) */
  searchTerm: string;
  /** Function to handle search form submission */
  handleSearch: (e: React.FormEvent) => void;
  /** Function to clear search */
  clearSearch: () => void;
  /** Current active filters */
  filters: ActivityFilters;
  /** Function to handle filter changes */
  handleFilterChange: (filterValue: string) => void;
  /** Function to handle date range changes */
  handleDateRangeChange: (range: string) => void;
  /** Available filter options */
  filterOptions: FilterOption[];
  /** Available date range options */
  dateRangeOptions: DateRangeOption[];
}

const ActivityFilterHub: React.FC<ActivityFilterHubProps> = ({
  searchInput,
  setSearchInput,
  searchTerm,
  handleSearch,
  clearSearch,
  filters,
  handleFilterChange,
  handleDateRangeChange,
  filterOptions,
  dateRangeOptions,
}) => {
  return (
    <PokemonCard variant="glass" size="lg" className="group relative">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <PokemonInput
              type="text"
              placeholder="Search activities..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-12"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  clearSearch();
                }}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors duration-200"
              >
                ✕
              </button>
            )}
          </form>
        </div>

        {/* Filter Pills using PokemonBadge */}
        <div className="flex flex-wrap gap-3">
          {filterOptions.map((option) => {
            const IconComponent = option.icon;
            const isActive =
              (option.value === 'all' && !filters.type) ||
              filters.type === option.value;

            return (
              <button
                key={option.value}
                onClick={() => handleFilterChange(option.value)}
                className="transition-all duration-300 hover:scale-105"
              >
                <PokemonBadge
                  variant={isActive ? 'primary' : 'secondary'}
                  style={isActive ? 'solid' : 'glass'}
                  shape="pill"
                  className={`transition-all duration-300 ${
                    isActive ? 'shadow-lg scale-105' : 'hover:shadow-md'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  {option.label}
                </PokemonBadge>
              </button>
            );
          })}
        </div>

        {/* Date Range */}
        <div className="flex items-center space-x-3">
          <Calendar className="w-5 h-5 text-slate-500" />
          <select
            value={filters.dateRange || 'all'}
            onChange={(e) => handleDateRangeChange(e.target.value)}
            className="bg-zinc-800/60 border border-zinc-700/50 rounded-xl px-4 py-2 text-sm font-medium text-zinc-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            {dateRangeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </PokemonCard>
  );
};

export default ActivityFilterHub;
