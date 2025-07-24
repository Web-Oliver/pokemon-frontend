/**
 * Activity Timeline Component
 *
 * Following CLAUDE.md principles:
 * - Single Responsibility: Only handles activity timeline display
 * - Layer 3: UI Building Block - presentational component
 * - DRY: Reusable timeline structure
 * - Extracted from Analytics.tsx for better composition
 */

import React from 'react';
import { LineChart, BarChart3 } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import { getRelativeTime } from '../../utils/timeUtils';
import { displayPrice } from '../../utils/priceUtils';

interface Activity {
  _id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  priority?: string;
  metadata?: {
    cardName?: string;
    setName?: string;
    auctionTitle?: string;
    newPrice?: number;
    salePrice?: number;
    estimatedValue?: number;
    priceChangePercentage?: number;
  };
}

interface ActivityTimelineProps {
  activities: Activity[];
  loading: boolean;
  totalActivities: number;
  getActivityIcon: (type: string) => React.ComponentType<any>;
  getActivityColor: (type: string) => string;
  onNavigateToActivity: () => void;
}

const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  activities,
  loading,
  totalActivities,
  getActivityIcon,
  getActivityColor,
  onNavigateToActivity,
}) => {
  return (
    <div className='bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 relative overflow-hidden'>
      <div className='absolute inset-0 bg-gradient-to-br from-white/50 to-slate-50/50'></div>
      <div className='p-8 relative z-10'>
        <div className='flex items-center justify-between mb-6'>
          <h3 className='text-2xl font-bold text-slate-900 flex items-center'>
            <LineChart className='w-6 h-6 mr-3 text-indigo-600' />
            Recent Activity Timeline
          </h3>
          <button
            onClick={onNavigateToActivity}
            className='px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300'
          >
            View All Activities
          </button>
        </div>

        {loading ? (
          <div className='flex justify-center py-16'>
            <LoadingSpinner size='lg' text='Loading analytics...' />
          </div>
        ) : totalActivities ? (
          <div className='space-y-4'>
            {activities
              .filter(
                (activity, index, self) => index === self.findIndex(a => a._id === activity._id)
              )
              .slice(0, 10)
              .map((activity, index) => {
                const IconComponent = getActivityIcon(activity.type);
                const color = getActivityColor(activity.type);

                return (
                  <div
                    key={`${activity._id}-${index}`}
                    className='flex items-center p-4 rounded-2xl bg-gradient-to-r from-slate-50/50 to-white/50 hover:from-indigo-50/50 hover:to-purple-50/50 transition-all duration-300 group hover:shadow-md'
                  >
                    <div
                      className={`w-12 h-12 bg-gradient-to-br from-${color}-500 to-${color}-600 rounded-xl flex items-center justify-center mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      <IconComponent className='w-6 h-6 text-white' />
                    </div>
                    <div className='flex-1'>
                      <div className='flex items-center gap-2 mb-1'>
                        <p className='font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors duration-300'>
                          {activity.title}
                        </p>
                        {activity.priority === 'HIGH' && (
                          <span className='px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full'>
                            High Priority
                          </span>
                        )}
                        {activity.priority === 'CRITICAL' && (
                          <span className='px-2 py-1 bg-red-200 text-red-800 text-xs font-bold rounded-full'>
                            Critical
                          </span>
                        )}
                      </div>
                      <p className='text-sm text-slate-600'>{activity.description}</p>
                      {activity.metadata?.cardName && (
                        <p className='text-xs text-slate-500 mt-1'>
                          Card: {activity.metadata.cardName}
                          {activity.metadata.setName && ` • ${activity.metadata.setName}`}
                        </p>
                      )}
                      {activity.metadata?.auctionTitle && (
                        <p className='text-xs text-slate-500 mt-1'>
                          Auction: {activity.metadata.auctionTitle}
                        </p>
                      )}
                    </div>
                    <div className='text-right'>
                      <p className='text-sm text-slate-500 font-medium'>
                        {getRelativeTime(activity.timestamp)}
                      </p>
                      {(activity.metadata?.newPrice ||
                        activity.metadata?.salePrice ||
                        activity.metadata?.estimatedValue) && (
                        <p className='text-sm font-semibold text-emerald-700'>
                          {displayPrice(
                            activity.metadata.newPrice ||
                              activity.metadata.salePrice ||
                              activity.metadata.estimatedValue
                          )}
                        </p>
                      )}
                      {activity.metadata?.priceChangePercentage && (
                        <p
                          className={`text-xs font-medium ${
                            activity.metadata.priceChangePercentage > 0
                              ? 'text-emerald-600'
                              : 'text-red-600'
                          }`}
                        >
                          {activity.metadata.priceChangePercentage > 0 ? '+' : ''}
                          {activity.metadata.priceChangePercentage.toFixed(1)}%
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          <div className='text-center py-16'>
            <div className='w-20 h-20 bg-gradient-to-br from-slate-100 to-white rounded-3xl flex items-center justify-center mx-auto mb-6 border border-slate-200/50 shadow-lg'>
              <BarChart3 className='w-8 h-8 text-slate-400' />
            </div>
            <h4 className='text-xl font-bold text-slate-900 mb-3'>No Data Available</h4>
            <p className='text-slate-600 font-medium max-w-md mx-auto leading-relaxed'>
              Start using the collection management features to see analytics here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityTimeline;
