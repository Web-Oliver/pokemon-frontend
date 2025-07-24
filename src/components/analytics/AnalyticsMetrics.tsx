/**
 * Analytics Metrics Component
 *
 * Following CLAUDE.md principles:
 * - Single Responsibility: Only handles key metrics display
 * - Layer 3: UI Building Block - presentational component
 * - DRY: Reusable metric card structure
 * - Extracted from Analytics.tsx for better composition
 */

import React from 'react';
import { Activity as ActivityIcon, TrendingUp, DollarSign, Clock } from 'lucide-react';
import { getRelativeTime } from '../../utils/timeUtils';

interface AnalyticsMetricsProps {
  totalActivities: number;
  weeklyActivities?: number;
  totalValueFormatted: string | null;
  lastActivity?: string | null;
}

const AnalyticsMetrics: React.FC<AnalyticsMetricsProps> = ({
  totalActivities,
  weeklyActivities = 0,
  totalValueFormatted,
  lastActivity,
}) => {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
      <div className='group bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 relative overflow-hidden border border-white/20 hover:scale-105 transition-all duration-300'>
        <div className='absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5'></div>
        <div className='flex items-center relative z-10'>
          <div className='w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500'>
            <ActivityIcon className='w-8 h-8 text-white' />
          </div>
          <div className='ml-6'>
            <p className='text-sm font-bold text-slate-600 tracking-wide uppercase'>
              Total Activities
            </p>
            <p className='text-3xl font-bold text-slate-900 group-hover:text-indigo-700 transition-colors duration-300'>
              {totalActivities}
            </p>
          </div>
        </div>
      </div>

      <div className='group bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 relative overflow-hidden border border-white/20 hover:scale-105 transition-all duration-300'>
        <div className='absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5'></div>
        <div className='flex items-center relative z-10'>
          <div className='w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500'>
            <TrendingUp className='w-8 h-8 text-white' />
          </div>
          <div className='ml-6'>
            <p className='text-sm font-bold text-slate-600 tracking-wide uppercase'>This Week</p>
            <p className='text-3xl font-bold text-slate-900 group-hover:text-emerald-700 transition-colors duration-300'>
              {weeklyActivities}
            </p>
          </div>
        </div>
      </div>

      <div className='group bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 relative overflow-hidden border border-white/20 hover:scale-105 transition-all duration-300'>
        <div className='absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5'></div>
        <div className='flex items-center relative z-10'>
          <div className='w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500'>
            <DollarSign className='w-8 h-8 text-white' />
          </div>
          <div className='ml-6'>
            <p className='text-sm font-bold text-slate-600 tracking-wide uppercase'>Total Value</p>
            <p className='text-3xl font-bold text-slate-900 group-hover:text-amber-700 transition-colors duration-300'>
              {totalValueFormatted || '--'}
            </p>
          </div>
        </div>
      </div>

      <div className='group bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 relative overflow-hidden border border-white/20 hover:scale-105 transition-all duration-300'>
        <div className='absolute inset-0 bg-gradient-to-br from-purple-500/5 to-violet-500/5'></div>
        <div className='flex items-center relative z-10'>
          <div className='w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl shadow-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500'>
            <Clock className='w-8 h-8 text-white' />
          </div>
          <div className='ml-6'>
            <p className='text-sm font-bold text-slate-600 tracking-wide uppercase'>
              Last Activity
            </p>
            <p className='text-lg font-bold text-slate-900 group-hover:text-purple-700 transition-colors duration-300'>
              {lastActivity ? getRelativeTime(lastActivity) : 'No activity'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsMetrics;
