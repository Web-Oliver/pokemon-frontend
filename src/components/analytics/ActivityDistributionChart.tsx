/**
 * Activity Distribution Chart Component
 *
 * Following CLAUDE.md principles:
 * - Single Responsibility: Only handles activity distribution visualization
 * - Layer 3: UI Building Block - presentational component
 * - DRY: Reusable chart structure
 * - Extracted from Analytics.tsx for better composition
 */

import React from 'react';
import { PieChart } from 'lucide-react';

interface ActivityDistributionChartProps {
  typeDistribution: Record<string, number>;
  totalActivities: number;
  getActivityIcon: (type: string) => React.ComponentType<any>;
  getActivityColor: (type: string) => string;
}

const ActivityDistributionChart: React.FC<ActivityDistributionChartProps> = ({
  typeDistribution,
  totalActivities,
  getActivityIcon,
  getActivityColor,
}) => {
  return (
    <div className='bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 relative overflow-hidden'>
      <div className='absolute inset-0 bg-gradient-to-br from-white/50 to-slate-50/50'></div>
      <div className='p-8 relative z-10'>
        <h3 className='text-2xl font-bold text-slate-900 mb-6 flex items-center'>
          <PieChart className='w-6 h-6 mr-3 text-indigo-600' />
          Activity Distribution
        </h3>

        <div className='space-y-4'>
          {Object.entries(typeDistribution)
            .sort(([, a], [, b]) => b - a) // Sort by count descending
            .map(([typeLabel, count]) => {
              // Convert back to type constant for icon/color lookup
              const typeKey = typeLabel.toUpperCase().replace(/ /g, '_');
              const IconComponent = getActivityIcon(typeKey);
              const color = getActivityColor(typeKey);
              const percentage = ((count / (totalActivities || 1)) * 100).toFixed(1);

              return (
                <div
                  key={typeLabel}
                  className='flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-slate-50/50 to-white/50 hover:from-indigo-50/50 hover:to-purple-50/50 transition-all duration-300 group'
                >
                  <div className='flex items-center'>
                    <div
                      className={`w-10 h-10 bg-gradient-to-br from-${color}-500 to-${color}-600 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <IconComponent className='w-5 h-5 text-white' />
                    </div>
                    <div>
                      <p className='font-semibold text-slate-900'>{typeLabel}</p>
                      <p className='text-sm text-slate-600'>
                        {count} event{count !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className='text-right'>
                    <p className='text-lg font-bold text-slate-900 group-hover:text-indigo-700 transition-colors duration-300'>
                      {percentage}%
                    </p>
                    <div className={`w-16 h-2 bg-slate-200 rounded-full overflow-hidden`}>
                      <div
                        className={`h-full bg-gradient-to-r from-${color}-500 to-${color}-600 transition-all duration-500 group-hover:animate-pulse`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default ActivityDistributionChart;
