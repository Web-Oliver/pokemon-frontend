/**
 * Analytics Page Component - Context7 Award-Winning Design
 *
 * Comprehensive analytics dashboard with advanced charts and metrics.
 * Features premium data visualization, insights, and performance tracking.
 *
 * Following CLAUDE.md + Context7 principles:
 * - Award-winning visual design with interactive charts
 * - Glass-morphism and depth with floating cards
 * - Premium gradients and data visualization
 * - Context7 design system compliance
 * - Advanced analytics and insights
 */

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Eye,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  ArrowLeft,
  Target,
  Zap,
  Award,
  Activity as ActivityIcon,
  PieChart,
  LineChart,
  Users,
  Clock,
  Star,
  ShoppingBag,
  Plus,
  CheckCircle,
  Edit,
  Trash2,
} from 'lucide-react';
import { useActivity, useActivityStats, ACTIVITY_TYPES } from '../hooks/useActivity';
import { useCollectionStats } from '../hooks/useCollectionStats';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getRelativeTime } from '../utils/timeUtils';
import { displayPrice } from '../utils/priceUtils';

const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('month');
  const [selectedMetric, setSelectedMetric] = useState('all');

  // Context7 Analytics Hooks - Use limited data for analytics
  const { activities, stats, loading, error, fetchActivities, refresh } = useActivity({
    limit: 100,
  }); // Limit to 100 recent activities for analytics

  const { stats: activityStats, loading: statsLoading } = useActivityStats();

  // Context7 Collection Statistics Hook - for real collection metrics
  const { totalValueFormatted } = useCollectionStats();

  // Handle navigation
  const handleNavigation = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  // Context7 Analytics Data Processing
  const processAnalyticsData = () => {
    if (!activities.length) {
      return null;
    }

    // Remove any duplicates to ensure clean data
    const uniqueActivities = activities.filter(
      (activity, index, self) => index === self.findIndex(a => a._id === activity._id)
    );

    // Activity type distribution
    const typeDistribution = uniqueActivities.reduce(
      (acc, activity) => {
        acc[activity.type] = (acc[activity.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Daily activity trends (last 30 days)
    const dailyTrends = uniqueActivities
      .filter(activity => {
        const activityDate = new Date(activity.timestamp);
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        return activityDate >= thirtyDaysAgo;
      })
      .reduce(
        (acc, activity) => {
          const date = new Date(activity.timestamp).toDateString();
          acc[date] = (acc[date] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

    // Value-related activities
    const valueActivities = uniqueActivities.filter(
      activity =>
        activity.metadata?.newPrice ||
        activity.metadata?.salePrice ||
        activity.metadata?.estimatedValue
    );

    const totalValue = valueActivities.reduce((sum, activity) => {
      const value =
        activity.metadata?.newPrice ||
        activity.metadata?.salePrice ||
        activity.metadata?.estimatedValue ||
        0;
      return sum + (typeof value === 'number' ? value : 0);
    }, 0);

    // Calculate total activities correctly
    const totalActivities = uniqueActivities.length;

    return {
      typeDistribution,
      dailyTrends,
      valueActivities,
      totalValue,
      totalActivities,
      mostActiveDay: Object.entries(dailyTrends).sort(([, a], [, b]) => b - a)[0],
    };
  };

  const analyticsData = processAnalyticsData();

  // Context7 Activity Type Colors
  const getActivityColor = (type: string) => {
    const colorMap = {
      [ACTIVITY_TYPES.CARD_ADDED]: 'emerald',
      [ACTIVITY_TYPES.PRICE_UPDATE]: 'amber',
      [ACTIVITY_TYPES.AUCTION_CREATED]: 'purple',
      [ACTIVITY_TYPES.SALE_COMPLETED]: 'emerald',
      [ACTIVITY_TYPES.CARD_UPDATED]: 'blue',
      [ACTIVITY_TYPES.CARD_DELETED]: 'red',
    };
    return colorMap[type as keyof typeof colorMap] || 'indigo';
  };

  // Context7 Activity Type Icons
  const getActivityIcon = (type: string) => {
    const iconMap = {
      [ACTIVITY_TYPES.CARD_ADDED]: Plus,
      [ACTIVITY_TYPES.CARD_UPDATED]: Edit,
      [ACTIVITY_TYPES.CARD_DELETED]: Trash2,
      [ACTIVITY_TYPES.PRICE_UPDATE]: TrendingUp,
      [ACTIVITY_TYPES.AUCTION_CREATED]: DollarSign,
      [ACTIVITY_TYPES.SALE_COMPLETED]: CheckCircle,
    };
    return iconMap[type as keyof typeof iconMap] || ActivityIcon;
  };

  const timeRangeOptions = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' },
    { value: 'all', label: 'All Time' },
  ];

  useEffect(() => {
    fetchActivities({ dateRange: timeRange === 'all' ? undefined : timeRange });
  }, [timeRange]); // Remove fetchActivities from dependencies to prevent infinite loop

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 relative overflow-hidden'>
      {/* Context7 Premium Background Pattern */}
      <div className='absolute inset-0 opacity-30'>
        <div
          className='w-full h-full'
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='0.03'%3E%3Ccircle cx='40' cy='40' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      <div className='relative z-10 p-8'>
        <div className='max-w-7xl mx-auto space-y-8'>
          {/* Context7 Premium Header */}
          <div className='bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 rounded-3xl shadow-2xl text-white p-10 relative overflow-hidden border border-white/20'>
            <div className='absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10'></div>
            <div className='absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-white/50 via-white/80 to-white/50'></div>

            <div className='relative z-10'>
              <div className='flex items-center mb-6'>
                <button
                  onClick={() => handleNavigation('/dashboard')}
                  className='mr-4 p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-all duration-300 group'
                >
                  <ArrowLeft className='w-5 h-5 group-hover:scale-110 transition-transform duration-300' />
                </button>
                <div className='w-16 h-16 bg-white/20 rounded-3xl shadow-xl flex items-center justify-center mr-6'>
                  <BarChart3 className='w-8 h-8 text-white' />
                </div>
                <div>
                  <h1 className='text-4xl font-bold mb-2 tracking-wide drop-shadow-lg'>
                    Analytics & Insights
                  </h1>
                  <p className='text-indigo-100 text-xl font-medium leading-relaxed'>
                    Comprehensive data analysis and performance metrics
                  </p>
                </div>
              </div>

              {/* Controls */}
              <div className='flex items-center space-x-4'>
                <select
                  value={timeRange}
                  onChange={e => setTimeRange(e.target.value)}
                  className='bg-white/20 border border-white/30 rounded-xl px-4 py-2 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50'
                >
                  {timeRangeOptions.map(option => (
                    <option key={option.value} value={option.value} className='text-slate-900'>
                      {option.label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={refresh}
                  className='p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-all duration-300 group'
                  disabled={loading}
                >
                  <RefreshCw
                    className={`w-5 h-5 transition-transform duration-300 ${loading ? 'animate-spin' : 'group-hover:rotate-180'}`}
                  />
                </button>
              </div>
            </div>

            {/* Premium floating elements */}
            <div className='absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full animate-pulse'></div>
            <div className='absolute -bottom-6 -left-6 w-32 h-32 bg-white/5 rounded-full animate-pulse delay-75'></div>
          </div>

          {/* Context7 Key Metrics Grid */}
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
                    {analyticsData?.totalActivities || 0}
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
                  <p className='text-sm font-bold text-slate-600 tracking-wide uppercase'>
                    This Week
                  </p>
                  <p className='text-3xl font-bold text-slate-900 group-hover:text-emerald-700 transition-colors duration-300'>
                    {activityStats?.week || 0}
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
                  <p className='text-sm font-bold text-slate-600 tracking-wide uppercase'>
                    Total Value
                  </p>
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
                    {activityStats?.lastActivity
                      ? getRelativeTime(activityStats.lastActivity)
                      : 'No activity'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Context7 Activity Type Distribution */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
            <div className='bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 relative overflow-hidden'>
              <div className='absolute inset-0 bg-gradient-to-br from-white/50 to-slate-50/50'></div>
              <div className='p-8 relative z-10'>
                <h3 className='text-2xl font-bold text-slate-900 mb-6 flex items-center'>
                  <PieChart className='w-6 h-6 mr-3 text-indigo-600' />
                  Activity Distribution
                </h3>

                {analyticsData && (
                  <div className='space-y-4'>
                    {Object.entries(analyticsData.typeDistribution).map(([type, count]) => {
                      const IconComponent = getActivityIcon(type);
                      const color = getActivityColor(type);
                      const percentage = (
                        (count / (analyticsData?.totalActivities || 1)) *
                        100
                      ).toFixed(1);

                      return (
                        <div
                          key={type}
                          className='flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-slate-50/50 to-white/50 hover:from-indigo-50/50 hover:to-purple-50/50 transition-all duration-300'
                        >
                          <div className='flex items-center'>
                            <div
                              className={`w-10 h-10 bg-gradient-to-br from-${color}-500 to-${color}-600 rounded-xl flex items-center justify-center mr-4`}
                            >
                              <IconComponent className='w-5 h-5 text-white' />
                            </div>
                            <div>
                              <p className='font-semibold text-slate-900 capitalize'>
                                {type.replace(/_/g, ' ')}
                              </p>
                              <p className='text-sm text-slate-600'>
                                {count} event{count !== 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                          <div className='text-right'>
                            <p className='text-lg font-bold text-slate-900'>{percentage}%</p>
                            <div className={`w-16 h-2 bg-slate-200 rounded-full overflow-hidden`}>
                              <div
                                className={`h-full bg-gradient-to-r from-${color}-500 to-${color}-600 transition-all duration-500`}
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

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
                      {analyticsData?.mostActiveDay && analyticsData.mostActiveDay[1] > 0
                        ? `${new Date(analyticsData.mostActiveDay[0]).toLocaleDateString()} with ${analyticsData.mostActiveDay[1]} activities`
                        : 'Not enough data yet'}
                    </p>
                  </div>

                  <div className='p-6 rounded-2xl bg-gradient-to-r from-purple-50/80 to-violet-50/80 border border-purple-200/50'>
                    <div className='flex items-center mb-3'>
                      <TrendingUp className='w-5 h-5 text-purple-600 mr-2' />
                      <h4 className='font-bold text-purple-900'>Activity Trend</h4>
                    </div>
                    <p className='text-purple-800'>
                      {analyticsData?.totalActivities
                        ? `${analyticsData.totalActivities} total activities tracked`
                        : 'Start using the app to see trends'}
                    </p>
                  </div>

                  <div className='p-6 rounded-2xl bg-gradient-to-r from-amber-50/80 to-orange-50/80 border border-amber-200/50'>
                    <div className='flex items-center mb-3'>
                      <DollarSign className='w-5 h-5 text-amber-600 mr-2' />
                      <h4 className='font-bold text-amber-900'>Value Tracking</h4>
                    </div>
                    <p className='text-amber-800'>
                      {analyticsData?.valueActivities.length || 0} activities with price/value data
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Context7 Recent Activity Timeline */}
          <div className='bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 relative overflow-hidden'>
            <div className='absolute inset-0 bg-gradient-to-br from-white/50 to-slate-50/50'></div>
            <div className='p-8 relative z-10'>
              <div className='flex items-center justify-between mb-6'>
                <h3 className='text-2xl font-bold text-slate-900 flex items-center'>
                  <LineChart className='w-6 h-6 mr-3 text-indigo-600' />
                  Recent Activity Timeline
                </h3>
                <button
                  onClick={() => handleNavigation('/activity')}
                  className='px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300'
                >
                  View All Activities
                </button>
              </div>

              {loading ? (
                <div className='flex justify-center py-16'>
                  <LoadingSpinner size='lg' text='Loading analytics...' />
                </div>
              ) : analyticsData?.totalActivities ? (
                <div className='space-y-4'>
                  {activities
                    .filter(
                      (activity, index, self) =>
                        index === self.findIndex(a => a._id === activity._id)
                    )
                    .slice(0, 10)
                    .map((activity, index) => {
                      const IconComponent = getActivityIcon(activity.type);
                      const color = getActivityColor(activity.type);

                      return (
                        <div
                          key={`${activity._id}-${index}`}
                          className='flex items-center p-4 rounded-2xl bg-gradient-to-r from-slate-50/50 to-white/50 hover:from-indigo-50/50 hover:to-purple-50/50 transition-all duration-300'
                        >
                          <div
                            className={`w-10 h-10 bg-gradient-to-br from-${color}-500 to-${color}-600 rounded-xl flex items-center justify-center mr-4`}
                          >
                            <IconComponent className='w-5 h-5 text-white' />
                          </div>
                          <div className='flex-1'>
                            <p className='font-semibold text-slate-900'>{activity.title}</p>
                            <p className='text-sm text-slate-600'>{activity.description}</p>
                          </div>
                          <div className='text-right'>
                            <p className='text-sm text-slate-500'>
                              {getRelativeTime(activity.timestamp)}
                            </p>
                            {(activity.metadata?.newPrice || activity.metadata?.salePrice) && (
                              <p className='text-sm font-semibold text-slate-900'>
                                {displayPrice(
                                  activity.metadata.newPrice || activity.metadata.salePrice
                                )}
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
        </div>
      </div>
    </div>
  );
};

export default Analytics;
