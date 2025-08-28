/**
 * ActivityFilterHub Component - Unified Design System Implementation
 *
 * Reusable filter hub component extracted from Activity.tsx
 * to prevent JSX duplication for search input, filter pills, and date range selector.
 *
 * Following CLAUDE.md principles:
 * - Single Responsibility: Handles all activity filtering UI and logic
 * - DRY: Eliminates repeated filter section JSX structures
 * - Reusability: Can be used across different activity displays
 * - Design System Integration: Uses unified glassmorphism patterns with PokemonCard, PokemonInput, PokemonButton, and PokemonSelect
 * - Unified Styling: Implements white/10 backgrounds, cyan-200 labels, white text, and cyan-400 highlights
 */

import React from 'react';
import { Calendar, LucideIcon, Search } from 'lucide-react';
import {
  PokemonBadge,
  PokemonButton,
  PokemonCard,
  PokemonInput,
  PokemonSelect,
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
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cyan-200 w-5 h-5" />
            <PokemonInput
              type="text"
              placeholder="Search activities..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-12 bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-cyan-200/70 focus:border-cyan-400/30 focus:ring-cyan-400/20"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  clearSearch();
                }}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-cyan-200/80 hover:text-white transition-colors duration-200"
              >
                ✕
              </button>
            )}
          </form>
        </div>

        {/* Filter Pills using PokemonButton */}
        <div className="flex flex-wrap gap-3">
          {filterOptions.map((option) => {
            const IconComponent = option.icon;
            const isActive =
              (option.value === 'all' && !filters.type) ||
              filters.type === option.value;

            return (
              <PokemonButton
                key={option.value}
                onClick={() => handleFilterChange(option.value)}
                variant={isActive ? 'primary' : 'ghost'}
                size="sm"
                className={`
                  ${isActive 
                    ? 'bg-cyan-400/20 border border-cyan-400/30 text-white shadow-lg shadow-cyan-400/20' 
                    : 'bg-white/10 border border-white/20 text-cyan-200 hover:bg-cyan-400/10 hover:border-cyan-400/30 hover:text-white'
                  }
                  backdrop-blur-sm transition-all duration-300
                `}
                startIcon={<IconComponent className="w-4 h-4" />}
              >
                {option.label}
              </PokemonButton>
            );
          })}
        </div>

        {/* Date Range */}
        <div className="flex items-center space-x-3">
          <Calendar className="w-5 h-5 text-cyan-200" />
          <PokemonSelect
            value={filters.dateRange || 'all'}
            onChange={(e) => handleDateRangeChange(e.target.value)}
            options={dateRangeOptions.map(option => ({
              value: option.value,
              label: option.label
            }))}
            variant="filter"
            size="sm"
            className="bg-white/10 backdrop-blur-sm border border-white/20 text-white focus:border-cyan-400/30 focus:ring-cyan-400/20"
          />
        </div>
      </div>
    </PokemonCard>
  );
};

export default ActivityFilterHub;
