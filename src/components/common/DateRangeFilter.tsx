/**
 * DateRangeFilter Component
 * Reusable date range filtering component
 *
 * Following CLAUDE.md principles:
 * - Single Responsibility: Handles date range filtering UI and logic
 * - Open/Closed: Extensible through preset configurations and custom ranges
 * - DRY: Eliminates duplicate date filtering across Analytics and SalesAnalytics
 * - Interface Segregation: Provides both preset and custom date range options
 */

import React, { useState } from 'react';
import { Calendar, Filter, X } from 'lucide-react';
import Button from './Button';

export interface DateRangeState {
  startDate?: string;
  endDate?: string;
  preset?: string;
}

interface DateRangeFilterProps {
  /** Current date range state */
  value: DateRangeState;
  /** Callback when date range changes */
  onChange: (dateRange: DateRangeState) => void;
  /** Whether to show preset time range options */
  showPresets?: boolean;
  /** Whether to show custom date range inputs */
  showCustomRange?: boolean;
  /** Custom preset options (overrides default) */
  presetOptions?: Array<{ value: string; label: string }>;
  /** Loading state */
  loading?: boolean;
  /** Additional CSS classes */
  className?: string;
}

// Default preset options
const DEFAULT_PRESET_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'quarter', label: 'This Quarter' },
  { value: 'year', label: 'This Year' },
  { value: 'all', label: 'All Time' },
];

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  value,
  onChange,
  showPresets = true,
  showCustomRange = true,
  presetOptions = DEFAULT_PRESET_OPTIONS,
  loading = false,
  className = '',
}) => {
  const [localCustomRange, setLocalCustomRange] = useState({
    startDate: value.startDate || '',
    endDate: value.endDate || '',
  });

  const handlePresetChange = (preset: string) => {
    onChange({
      preset,
      startDate: undefined,
      endDate: undefined,
    });
  };

  const handleCustomRangeSubmit = () => {
    onChange({
      preset: undefined,
      startDate: localCustomRange.startDate || undefined,
      endDate: localCustomRange.endDate || undefined,
    });
  };

  const handleClearRange = () => {
    setLocalCustomRange({ startDate: '', endDate: '' });
    onChange({
      preset: undefined,
      startDate: undefined,
      endDate: undefined,
    });
  };

  const hasActiveFilter = value.preset || value.startDate || value.endDate;

  return (
    <div
      className={`bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6 relative overflow-hidden ${className}`}
    >
      <div className='absolute inset-0 bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-purple-500/5'></div>
      <div className='relative z-10'>
        <div className='flex items-center justify-between mb-6'>
          <h3 className='text-lg font-bold text-slate-900 flex items-center tracking-wide'>
            <div className='w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg flex items-center justify-center mr-3'>
              <Filter className='w-4 h-4 text-white' />
            </div>
            Date Range Filter
          </h3>
          {hasActiveFilter && (
            <Button
              onClick={handleClearRange}
              variant='outline'
              size='sm'
              className='text-slate-600 hover:text-slate-800 border-slate-300 hover:border-slate-400'
              disabled={loading}
            >
              <X className='w-4 h-4 mr-1' />
              Clear
            </Button>
          )}
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* Preset Time Ranges */}
          {showPresets && (
            <div>
              <label className='block text-sm font-bold text-slate-700 mb-3 tracking-wide'>
                Quick Select
              </label>
              <div className='relative group'>
                <div className='absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300'></div>
                <Calendar className='absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-blue-600 transition-colors duration-300 z-10' />
                <select
                  value={value.preset || ''}
                  onChange={e => handlePresetChange(e.target.value)}
                  disabled={loading}
                  className='w-full pl-12 pr-10 py-3 text-base font-medium bg-white/90 backdrop-blur-sm border border-slate-200/50 rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300 focus:bg-white transition-all duration-300 hover:shadow-xl appearance-none cursor-pointer disabled:opacity-50'
                >
                  <option value=''>Select time range...</option>
                  {presetOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className='absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none z-10'>
                  <svg
                    className='w-5 h-5 text-slate-400'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M19 9l-7 7-7-7'
                    />
                  </svg>
                </div>
              </div>
            </div>
          )}

          {/* Custom Date Range */}
          {showCustomRange && (
            <div>
              <label className='block text-sm font-bold text-slate-700 mb-3 tracking-wide'>
                Custom Range
              </label>
              <div className='space-y-3'>
                <div className='grid grid-cols-2 gap-3'>
                  <div className='relative group'>
                    <div className='absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300'></div>
                    <input
                      type='date'
                      placeholder='Start date'
                      value={localCustomRange.startDate}
                      onChange={e =>
                        setLocalCustomRange(prev => ({ ...prev, startDate: e.target.value }))
                      }
                      disabled={loading}
                      className='w-full px-3 py-2 text-sm font-medium bg-white/90 backdrop-blur-sm border border-slate-200/50 rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-300 focus:bg-white transition-all duration-300 hover:shadow-xl disabled:opacity-50'
                    />
                  </div>
                  <div className='relative group'>
                    <div className='absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300'></div>
                    <input
                      type='date'
                      placeholder='End date'
                      value={localCustomRange.endDate}
                      onChange={e =>
                        setLocalCustomRange(prev => ({ ...prev, endDate: e.target.value }))
                      }
                      disabled={loading}
                      className='w-full px-3 py-2 text-sm font-medium bg-white/90 backdrop-blur-sm border border-slate-200/50 rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-300 focus:bg-white transition-all duration-300 hover:shadow-xl disabled:opacity-50'
                    />
                  </div>
                </div>
                <Button
                  onClick={handleCustomRangeSubmit}
                  variant='primary'
                  size='sm'
                  disabled={loading || (!localCustomRange.startDate && !localCustomRange.endDate)}
                  className='w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700'
                >
                  Apply Custom Range
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Active Filter Display */}
        {hasActiveFilter && (
          <div className='mt-6 pt-4 border-t border-slate-200/50'>
            <div className='flex items-center text-sm text-slate-600'>
              <Calendar className='w-4 h-4 mr-2' />
              <span className='font-medium'>
                Active filter:{' '}
                {value.preset && (
                  <span className='font-bold text-blue-600'>
                    {presetOptions.find(opt => opt.value === value.preset)?.label || value.preset}
                  </span>
                )}
                {(value.startDate || value.endDate) && (
                  <span className='font-bold text-emerald-600'>
                    {value.startDate || 'Start'} to {value.endDate || 'End'}
                  </span>
                )}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DateRangeFilter;
