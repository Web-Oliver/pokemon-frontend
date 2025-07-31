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

import {
  Activity as ActivityIcon,
  Award,
  BarChart,
  BarChart3,
  CheckCircle,
  Clock,
  DollarSign,
  Edit,
  Gavel,
  LineChart,
  Minus,
  Package,
  PieChart,
  Plus,
  RefreshCw,
  Settings,
  Target,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import DateRangeFilter, {
  DateRangeState,
} from '../components/common/DateRangeFilter';
import { ContentLoading } from '../components/common/LoadingStates';
import { PageLayout } from '../components/layouts/PageLayout';
import {
  ACTIVITY_TYPES,
  useActivity,
  useActivityStats,
} from '../hooks/useActivity';
import { useCollectionStats } from '../hooks/useCollectionStats';
import { displayPrice, getRelativeTime } from '../utils/formatting';

const Analytics: React.FC = () => {
  const [selectedMetric, setSelectedMetric] = useState('all');
  const [dateRange, setDateRange] = useState<DateRangeState>({
    preset: 'month',
  });

  // Context7 Analytics Hooks - Use limited data for analytics
  const { activities, stats, loading, error, fetchActivities, refresh } =
    useActivity({
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
      (activity, index, self) =>
        index === self.findIndex((a) => a._id === activity._id)
    );

    // Activity type distribution with enhanced categorization
    const typeDistribution = uniqueActivities.reduce(
      (acc, activity) => {
        // Use readable labels for activity types
        const typeLabel = activity.type
          .replace(/_/g, ' ')
          .toLowerCase()
          .replace(/\b\w/g, (l) => l.toUpperCase());
        acc[typeLabel] = (acc[typeLabel] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Category-based activity grouping for better insights
    const categoryStats = {
      collection: 0,
      auction: 0,
      sales: 0,
      system: 0,
    };

    uniqueActivities.forEach((activity) => {
      if (activity.type.includes('CARD') || activity.type.includes('PRICE')) {
        categoryStats.collection++;
      } else if (activity.type.includes('AUCTION')) {
        categoryStats.auction++;
      } else if (activity.type.includes('SALE')) {
        categoryStats.sales++;
      } else {
        categoryStats.system++;
      }
    });

    // Daily activity trends (last 30 days)
    const dailyTrends = uniqueActivities
      .filter((activity) => {
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
      (activity) =>
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
      categoryStats,
      dailyTrends,
      valueActivities,
      totalValue,
      totalActivities,
      mostActiveDay: Object.entries(dailyTrends).sort(
        ([, a], [, b]) => b - a
      )[0],
    };
  };

  const analyticsData = processAnalyticsData();

  // Context7 Activity Type Colors - Standard for all activity types
  const getActivityColor = (type: string) => {
    const colorMap = {
      [ACTIVITY_TYPES.CARD_ADDED]: 'emerald',
      [ACTIVITY_TYPES.CARD_UPDATED]: 'blue',
      [ACTIVITY_TYPES.CARD_DELETED]: 'red',
      [ACTIVITY_TYPES.PRICE_UPDATE]: 'amber',
      [ACTIVITY_TYPES.AUCTION_CREATED]: 'purple',
      [ACTIVITY_TYPES.AUCTION_UPDATED]: 'indigo',
      [ACTIVITY_TYPES.AUCTION_DELETED]: 'red',
      [ACTIVITY_TYPES.AUCTION_ITEM_ADDED]: 'emerald',
      [ACTIVITY_TYPES.AUCTION_ITEM_REMOVED]: 'orange',
      [ACTIVITY_TYPES.SALE_COMPLETED]: 'emerald',
      [ACTIVITY_TYPES.SALE_UPDATED]: 'blue',
      [ACTIVITY_TYPES.MILESTONE]: 'yellow',
      [ACTIVITY_TYPES.COLLECTION_STATS]: 'cyan',
      [ACTIVITY_TYPES.SYSTEM]: 'slate',
    };
    return colorMap[type as keyof typeof colorMap] || 'indigo';
  };

  // Context7 Activity Type Icons - Standard for all activity types
  const getActivityIcon = (type: string) => {
    const iconMap = {
      [ACTIVITY_TYPES.CARD_ADDED]: Plus,
      [ACTIVITY_TYPES.CARD_UPDATED]: Edit,
      [ACTIVITY_TYPES.CARD_DELETED]: Trash2,
      [ACTIVITY_TYPES.PRICE_UPDATE]: TrendingUp,
      [ACTIVITY_TYPES.AUCTION_CREATED]: Gavel,
      [ACTIVITY_TYPES.AUCTION_UPDATED]: Edit,
      [ACTIVITY_TYPES.AUCTION_DELETED]: Trash2,
      [ACTIVITY_TYPES.AUCTION_ITEM_ADDED]: Plus,
      [ACTIVITY_TYPES.AUCTION_ITEM_REMOVED]: Minus,
      [ACTIVITY_TYPES.SALE_COMPLETED]: CheckCircle,
      [ACTIVITY_TYPES.SALE_UPDATED]: Edit,
      [ACTIVITY_TYPES.MILESTONE]: Award,
      [ACTIVITY_TYPES.COLLECTION_STATS]: BarChart,
      [ACTIVITY_TYPES.SYSTEM]: Settings,
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
    // Convert DateRangeState to the format expected by fetchActivities
    const rangeParam =
      dateRange.preset === 'all'
        ? undefined
        : dateRange.preset
          ? dateRange.preset
          : dateRange.startDate || dateRange.endDate
            ? {
                startDate: dateRange.startDate,
                endDate: dateRange.endDate,
              }
            : 'month';

    fetchActivities({ dateRange: rangeParam });
  }, [dateRange]); // Use dateRange instead of timeRange

  return (
    <PageLayout
      title="Analytics Dashboard"
      subtitle="Comprehensive analytics and insights for your collection"
      loading={loading}
      error={error}
      variant="default"
    >
      {/* Analytics Controls */}
      <div className="mb-8 grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <DateRangeFilter
            value={dateRange}
            onChange={setDateRange}
            showPresets={true}
            showCustomRange={true}
            presetOptions={timeRangeOptions}
            loading={loading}
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={refresh}
            className="w-full lg:w-auto px-6 py-3 rounded-xl bg-zinc-900/80 backdrop-blur-sm border border-zinc-700/20 hover:bg-zinc-800/90 transition-all duration-300 group shadow-lg flex items-center justify-center text-zinc-100"
            disabled={loading}
          >
            <RefreshCw
              className={`w-5 h-5 text-zinc-300 mr-2 ${loading ? 'animate-spin' : 'group-hover:rotate-180'} transition-transform duration-300`}
            />
            <span className="font-medium text-zinc-200">Refresh</span>
          </button>
        </div>
      </div>

      {/* Context7 Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="group bg-zinc-900/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 relative overflow-hidden border border-zinc-700/20 hover:scale-105 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5"></div>
          <div className="flex items-center relative z-10">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
              <ActivityIcon className="w-8 h-8 text-white" />
            </div>
            <div className="ml-6">
              <p className="text-sm font-bold text-zinc-400 tracking-wide uppercase">
                Total Activities
              </p>
              <p className="text-3xl font-bold text-zinc-100 group-hover:text-indigo-300 transition-colors duration-300">
                {analyticsData?.totalActivities || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="group bg-zinc-900/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 relative overflow-hidden border border-zinc-700/20 hover:scale-105 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5"></div>
          <div className="flex items-center relative z-10">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div className="ml-6">
              <p className="text-sm font-bold text-zinc-400 tracking-wide uppercase">
                This Week
              </p>
              <p className="text-3xl font-bold text-zinc-100 group-hover:text-emerald-300 transition-colors duration-300">
                {activityStats?.week || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="group bg-zinc-900/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 relative overflow-hidden border border-zinc-700/20 hover:scale-105 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5"></div>
          <div className="flex items-center relative z-10">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
              <DollarSign className="w-8 h-8 text-white" />
            </div>
            <div className="ml-6">
              <p className="text-sm font-bold text-zinc-400 tracking-wide uppercase">
                Total Value
              </p>
              <p className="text-3xl font-bold text-zinc-100 group-hover:text-amber-300 transition-colors duration-300">
                {totalValueFormatted || '--'}
              </p>
            </div>
          </div>
        </div>

        <div className="group bg-zinc-900/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 relative overflow-hidden border border-zinc-700/20 hover:scale-105 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-violet-500/5"></div>
          <div className="flex items-center relative z-10">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl shadow-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
              <Clock className="w-8 h-8 text-white" />
            </div>
            <div className="ml-6">
              <p className="text-sm font-bold text-zinc-400 tracking-wide uppercase">
                Last Activity
              </p>
              <p className="text-lg font-bold text-zinc-100 group-hover:text-purple-300 transition-colors duration-300">
                {activityStats?.lastActivity
                  ? getRelativeTime(activityStats.lastActivity)
                  : 'No activity'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Context7 Category Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-zinc-700/20">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-zinc-400 uppercase tracking-wide">
                Collection
              </p>
              <p className="text-2xl font-bold text-zinc-100">
                {analyticsData?.categoryStats.collection || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-zinc-700/20">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center">
              <Gavel className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-zinc-400 uppercase tracking-wide">
                Auctions
              </p>
              <p className="text-2xl font-bold text-zinc-100">
                {analyticsData?.categoryStats.auction || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-zinc-700/20">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-zinc-400 uppercase tracking-wide">
                Sales
              </p>
              <p className="text-2xl font-bold text-zinc-100">
                {analyticsData?.categoryStats.sales || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-zinc-700/20">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-slate-500 to-slate-600 rounded-xl flex items-center justify-center">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-zinc-400 uppercase tracking-wide">
                System
              </p>
              <p className="text-2xl font-bold text-zinc-100">
                {analyticsData?.categoryStats.system || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Context7 Activity Type Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-zinc-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-zinc-700/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-slate-50/50"></div>
          <div className="p-8 relative z-10">
            <h3 className="text-2xl font-bold text-zinc-100 mb-6 flex items-center">
              <PieChart className="w-6 h-6 mr-3 text-indigo-600" />
              Activity Distribution
            </h3>

            {analyticsData && (
              <div className="space-y-4">
                {Object.entries(analyticsData.typeDistribution)
                  .sort(([, a], [, b]) => b - a) // Sort by count descending
                  .map(([typeLabel, count]) => {
                    // Convert back to type constant for icon/color lookup
                    const typeKey = typeLabel.toUpperCase().replace(/ /g, '_');
                    const IconComponent = getActivityIcon(typeKey);
                    const color = getActivityColor(typeKey);
                    const percentage = (
                      (count / (analyticsData?.totalActivities || 1)) *
                      100
                    ).toFixed(1);

                    return (
                      <div
                        key={typeLabel}
                        className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-slate-50/50 to-white/50 hover:from-indigo-50/50 hover:to-purple-50/50 transition-all duration-300 group"
                      >
                        <div className="flex items-center">
                          <div
                            className={`w-10 h-10 bg-gradient-to-br from-${color}-500 to-${color}-600 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300`}
                          >
                            <IconComponent className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-zinc-100">
                              {typeLabel}
                            </p>
                            <p className="text-sm text-zinc-400">
                              {count} event{count !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-zinc-100 group-hover:text-indigo-300 transition-colors duration-300">
                            {percentage}%
                          </p>
                          <div
                            className={`w-16 h-2 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden`}
                          >
                            {' '}
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
            )}
          </div>
        </div>

        <div className="bg-zinc-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-zinc-700/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-slate-50/50"></div>
          <div className="p-8 relative z-10">
            <h3 className="text-2xl font-bold text-zinc-100 mb-6 flex items-center">
              <Target className="w-6 h-6 mr-3 text-indigo-600" />
              Key Insights
            </h3>

            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-50/80 to-teal-50/80 border border-emerald-200/50">
                <div className="flex items-center mb-3">
                  <Award className="w-5 h-5 text-emerald-600 mr-2" />
                  <h4 className="font-bold text-emerald-900">
                    Most Active Day
                  </h4>
                </div>
                <p className="text-emerald-800">
                  {analyticsData?.mostActiveDay &&
                  analyticsData.mostActiveDay[1] > 0
                    ? `${new Date(analyticsData.mostActiveDay[0]).toLocaleDateString()} with ${analyticsData.mostActiveDay[1]} activities`
                    : 'Not enough data yet'}
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-50/80 to-violet-50/80 border border-purple-200/50">
                <div className="flex items-center mb-3">
                  <TrendingUp className="w-5 h-5 text-purple-600 mr-2" />
                  <h4 className="font-bold text-purple-900">Activity Trend</h4>
                </div>
                <p className="text-purple-800">
                  {analyticsData?.totalActivities
                    ? `${analyticsData.totalActivities} total activities tracked`
                    : 'Start using the app to see trends'}
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-50/80 to-orange-50/80 border border-amber-200/50">
                <div className="flex items-center mb-3">
                  <DollarSign className="w-5 h-5 text-amber-600 mr-2" />
                  <h4 className="font-bold text-amber-900">Value Tracking</h4>
                </div>
                <p className="text-amber-800">
                  {analyticsData?.valueActivities.length || 0} activities with
                  price/value data
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Context7 Recent Activity Timeline */}
      <div className="bg-zinc-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-zinc-700/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-slate-50/50"></div>
        <div className="p-8 relative z-10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-zinc-100 flex items-center">
              <LineChart className="w-6 h-6 mr-3 text-indigo-600" />
              Recent Activity Timeline
            </h3>
            <button
              onClick={() => handleNavigation('/activity')}
              className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300"
            >
              View All Activities
            </button>
          </div>

          {loading ? (
            <ContentLoading text="Loading analytics..." />
          ) : analyticsData?.totalActivities ? (
            <div className="space-y-4">
              {activities
                .filter(
                  (activity, index, self) =>
                    index === self.findIndex((a) => a._id === activity._id)
                )
                .slice(0, 10)
                .map((activity, index) => {
                  const IconComponent = getActivityIcon(activity.type);
                  const color = getActivityColor(activity.type);

                  return (
                    <div
                      key={`${activity._id}-${index}`}
                      className="flex items-center p-4 rounded-2xl bg-gradient-to-r from-slate-50/50 to-white/50 hover:from-indigo-50/50 hover:to-purple-50/50 transition-all duration-300 group hover:shadow-md"
                    >
                      <div
                        className={`w-12 h-12 bg-gradient-to-br from-${color}-500 to-${color}-600 rounded-xl flex items-center justify-center mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                      >
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-zinc-100 group-hover:text-indigo-300 transition-colors duration-300">
                            {activity.title}
                          </p>
                          {activity.priority === 'HIGH' && (
                            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                              High Priority
                            </span>
                          )}
                          {activity.priority === 'CRITICAL' && (
                            <span className="px-2 py-1 bg-red-200 text-red-800 text-xs font-bold rounded-full">
                              Critical
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-zinc-400">
                          {activity.description}
                        </p>
                        {activity.metadata?.cardName && (
                          <p className="text-xs text-zinc-500 mt-1">
                            Card: {activity.metadata.cardName}
                            {activity.metadata.setName &&
                              ` • ${activity.metadata.setName}`}
                          </p>
                        )}
                        {activity.metadata?.auctionTitle && (
                          <p className="text-xs text-zinc-500 mt-1">
                            Auction: {activity.metadata.auctionTitle}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-zinc-500 font-medium">
                          {getRelativeTime(activity.timestamp)}
                        </p>
                        {(activity.metadata?.newPrice ||
                          activity.metadata?.salePrice ||
                          activity.metadata?.estimatedValue) && (
                          <p className="text-sm font-semibold text-emerald-700">
                            {displayPrice(
                              activity.metadata.newPrice ||
                                activity.metadata.salePrice ||
                                activity.metadata.estimatedValue
                            )}
                          </p>
                        )}
                        {activity.metadata?.priceChangePercentage && (
                          <p
                            className={`text-xs font-medium ${activity.metadata.priceChangePercentage > 0 ? 'text-emerald-600' : 'text-red-600'}`}
                          >
                            {activity.metadata.priceChangePercentage > 0
                              ? '+'
                              : ''}
                            {activity.metadata.priceChangePercentage.toFixed(1)}
                            %
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-white rounded-3xl flex items-center justify-center mx-auto mb-6 border border-slate-200/50 dark:border-zinc-700/50 dark:border-zinc-700/50 shadow-lg">
                <BarChart3 className="w-8 h-8 text-zinc-400" />
              </div>
              <h4 className="text-xl font-bold text-zinc-200 mb-3">
                No Data Available
              </h4>
              <p className="text-zinc-400 font-medium max-w-md mx-auto leading-relaxed">
                Start using the collection management features to see analytics
                here.
              </p>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default Analytics;
