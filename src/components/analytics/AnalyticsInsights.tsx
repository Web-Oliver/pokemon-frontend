/**
 * Analytics Insights Component
 *
 * Following CLAUDE.md principles:
 * - Single Responsibility: Only handles key insights display
 * - Layer 3: UI Building Block - presentational component
 * - DRY: Reusable insight card structure
 * - Extracted from Analytics.tsx for better composition
 */

import React from 'react';
import { Target, Award, TrendingUp, DollarSign } from 'lucide-react';

interface AnalyticsInsightsProps {
  mostActiveDay?: [string, number] | null;
  totalActivities: number;
  valueActivitiesCount: number;
}

const AnalyticsInsights: React.FC<AnalyticsInsightsProps> = ({
  mostActiveDay,
  totalActivities,
  valueActivitiesCount,
}) => {
  return (
    <div className='bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 relative overflow-hidden'>
      <div className='absolute inset-0 bg-gradient-to-br from-white/50 to-slate-50/50'></div>
      <div className='p-8 relative z-10'>
        <h3 className='text-2xl font-bold text-slate-900 mb-6 flex items-center'>
          <Target className='w-6 h-6 mr-3 text-indigo-600' />
          Key Insights
        </h3>

        <div className='space-y-6'>
          <div className='p-6 rounded-2xl bg-gradient-to-r from-emerald-50/80 to-teal-50/80 border border-emerald-200/50'>
            <div className='flex items-center mb-3'>
              <Award className='w-5 h-5 text-emerald-600 mr-2' />
              <h4 className='font-bold text-emerald-900'>Most Active Day</h4>
            </div>
            <p className='text-emerald-800'>
              {mostActiveDay && mostActiveDay[1] > 0
                ? `${new Date(mostActiveDay[0]).toLocaleDateString()} with ${mostActiveDay[1]} activities`
                : 'Not enough data yet'}
            </p>
          </div>

          <div className='p-6 rounded-2xl bg-gradient-to-r from-purple-50/80 to-violet-50/80 border border-purple-200/50'>
            <div className='flex items-center mb-3'>
              <TrendingUp className='w-5 h-5 text-purple-600 mr-2' />
              <h4 className='font-bold text-purple-900'>Activity Trend</h4>
            </div>
            <p className='text-purple-800'>
              {totalActivities
                ? `${totalActivities} total activities tracked`
                : 'Start using the app to see trends'}
            </p>
          </div>

          <div className='p-6 rounded-2xl bg-gradient-to-r from-amber-50/80 to-orange-50/80 border border-amber-200/50'>
            <div className='flex items-center mb-3'>
              <DollarSign className='w-5 h-5 text-amber-600 mr-2' />
              <h4 className='font-bold text-amber-900'>Value Tracking</h4>
            </div>
            <p className='text-amber-800'>
              {valueActivitiesCount || 0} activities with price/value data
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsInsights;
