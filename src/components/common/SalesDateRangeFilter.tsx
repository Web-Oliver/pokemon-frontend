/**
 * SalesDateRangeFilter Component - DRY Violation Fix
 *
 * Reusable date range filter component extracted from SalesAnalytics.tsx
 * to prevent JSX duplication for the complex date filter headerActions.
 *
 * Following CLAUDE.md principles:
 * - Single Responsibility: Handles date range filtering UI and logic
 * - DRY: Eliminates repeated date filter JSX structures
 * - Reusability: Can be used across different analytics displays
 * - Design System Integration: Uses consistent styling patterns
 */

import React from 'react';
import { Calendar, X } from 'lucide-react';
import { DateRangeState } from './DateRangeFilter';

interface SalesDateRangeFilterProps {
  /** Current local date range state */
  localDateRange: DateRangeState;
  /** Function to update local date range */
  setLocalDateRange: React.Dispatch<React.SetStateAction<DateRangeState>>;
  /** Function to update global date range */
  setDateRange: (range: { startDate?: string; endDate?: string }) => void;
  /** Additional CSS classes */
  className?: string;
}

const SalesDateRangeFilter: React.FC<SalesDateRangeFilterProps> = ({
  localDateRange,
  setLocalDateRange,
  setDateRange,
  className = '',
}) => {
  const handleStartDateChange = (value: string) => {
    setLocalDateRange((prev) => ({
      ...prev,
      startDate: value,
    }));
  };

  const handleEndDateChange = (value: string) => {
    setLocalDateRange((prev) => ({
      ...prev,
      endDate: value,
    }));
  };

  const handleDateBlur = () => {
    setDateRange({
      startDate: localDateRange.startDate,
      endDate: localDateRange.endDate,
    });
  };

  const handleClear = () => {
    setLocalDateRange({ startDate: '', endDate: '' });
    setDateRange({ startDate: undefined, endDate: undefined });
  };

  return (
    <div className={`card-premium p-4 min-w-[380px] bg-[var(--theme-surface)] border-[var(--theme-border)] backdrop-blur-xl ${className}`}>
      <div className="flex items-center space-x-4">
        {/* Calendar Icon with Context7 glow */}
        <div className="w-10 h-10 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-xl flex items-center justify-center glow-on-hover border border-cyan-400/30">
          <Calendar className="w-5 h-5 text-cyan-300" />
        </div>

        {/* Start Date Input - Context7 Premium */}
        <div className="flex-1">
          <label className="block text-xs font-medium text-[var(--theme-text-secondary)] mb-1">
            From
          </label>
          <input
            type="date"
            value={localDateRange.startDate || ''}
            onChange={(e) => handleStartDateChange(e.target.value)}
            onBlur={handleDateBlur}
            className="input-premium w-full px-3 py-2 text-[var(--theme-text-primary)] font-medium"
          />
        </div>

        {/* Premium Separator */}
        <div className="flex flex-col items-center">
          <div className="w-6 h-0.5 bg-gradient-to-r from-cyan-400/50 to-purple-400/50 rounded-full mb-1"></div>
          <span className="text-xs text-[var(--theme-text-muted)]">to</span>
          <div className="w-6 h-0.5 bg-gradient-to-r from-cyan-400/50 to-purple-400/50 rounded-full mt-1"></div>
        </div>

        {/* End Date Input - Context7 Premium */}
        <div className="flex-1">
          <label className="block text-xs font-medium text-[var(--theme-text-secondary)] mb-1">
            Until
          </label>
          <input
            type="date"
            value={localDateRange.endDate || ''}
            onChange={(e) => handleEndDateChange(e.target.value)}
            onBlur={handleDateBlur}
            className="input-premium w-full px-3 py-2 text-[var(--theme-text-primary)] font-medium"
          />
        </div>

        {/* Clear Button - Premium glassmorphism */}
        {(localDateRange.startDate || localDateRange.endDate) && (
          <button
            onClick={handleClear}
            className="w-8 h-8 bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-400/50 rounded-xl transition-all duration-300 flex items-center justify-center scale-on-hover backdrop-blur-sm"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Active Filter Indicator - Premium design */}
      {(localDateRange.startDate || localDateRange.endDate) && (
        <div className="mt-3 pt-3 border-t border-[var(--theme-border)]">
          <div className="flex items-center text-xs text-cyan-300 font-medium">
            <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full mr-2 animate-pulse"></div>
            Filtering: {localDateRange.startDate || 'Start'} →{' '}
            {localDateRange.endDate || 'End'}
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesDateRangeFilter;