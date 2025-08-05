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
  const [dateRange, setDateRange] = useState<DateRangeState>({
    preset: 'month',
  });

  // Context7 Analytics Hooks - Use limited data for analytics
  const { activities, stats, loading, error, fetchActivities, refresh } =
    useActivity({
      limit: 100,
    }); // Limit to 100 recent activities for analytics

  const { stats: activityStats } = useActivityStats();

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
    <PageLayout>
      <div className="min-h-screen bg-gradient-to-br from-[var(--theme-background)] via-purple-950/20 to-indigo-950/30 relative overflow-hidden">
        {/* Context7 2025 Futuristic Neural Background - Quantum Analytics Field */}
        <div className="absolute inset-0 opacity-15">
          {/* Analytics Neural Network Pattern */}
          <div
            className="absolute inset-0 animate-pulse"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='140' height='140' viewBox='0 0 140 140' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cfilter id='analyticsglow'%3E%3CfeGaussianBlur stdDeviation='2' result='coloredBlur'/%3E%3CfeMerge%3E%3CfeMergeNode in='coloredBlur'/%3E%3CfeMergeNode in='SourceGraphic'/%3E%3C/feMerge%3E%3C/filter%3E%3C/defs%3E%3Cg fill='none' stroke='%2306b6d4' stroke-width='0.3' filter='url(%23analyticsglow)'%3E%3Ccircle cx='70' cy='70' r='3'/%3E%3Cpath d='M20,70 Q45,30 70,70 Q95,110 120,70'/%3E%3Cpath d='M70,20 Q110,45 70,70 Q30,95 70,120'/%3E%3C/g%3E%3C/svg%3E")`,
              animationDuration: '8s',
            }}
          />
          {/* Chart Visualization Particles */}
          <div
            className="absolute inset-0 animate-bounce"
            style={{
              animationDuration: '12s',
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='240' height='240' viewBox='0 0 240 240' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23a855f7' fill-opacity='0.03'%3E%3Crect x='60' y='180' width='8' height='40'/%3E%3Crect x='80' y='160' width='8' height='60'/%3E%3Crect x='100' y='140' width='8' height='80'/%3E%3Crect x='120' y='120' width='8' height='100'/%3E%3Crect x='140' y='100' width='8' height='120'/%3E%3Crect x='160' y='170' width='8' height='50'/%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
          {/* Data Flow Grid */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `linear-gradient(90deg, transparent 97%, rgba(6, 182, 212, 0.08) 100%), linear-gradient(transparent 97%, rgba(168, 85, 247, 0.08) 100%)`,
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        {/* Floating Analytics Particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full opacity-15 animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 4 + 1}px`,
                height: `${Math.random() * 4 + 1}px`,
                background: `radial-gradient(circle, ${['#06b6d4', '#a855f7', '#10b981', '#f59e0b'][Math.floor(Math.random() * 4)]}, transparent)`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${Math.random() * 6 + 4}s`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 p-8">
          <div className="max-w-7xl mx-auto space-y-12">
            {/* Context7 2025 Futuristic Glassmorphism Header */}
            <div className="relative group">
              <div className="backdrop-blur-xl bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-[2rem] shadow-2xl text-[var(--theme-text-primary)] p-12 relative overflow-hidden">
                {/* Neural network glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/15 to-emerald-500/20 opacity-70 blur-3xl"></div>
                
                {/* Holographic border animation */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent opacity-30 group-hover:opacity-100 transition-all duration-1000 animate-pulse"></div>
                
                {/* Top accent line */}
                <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-cyan-400 via-purple-500 to-emerald-500 opacity-80 animate-pulse"></div>
                
                {/* Floating analytics icon */}
                <div className="absolute top-8 right-8 w-16 h-16 border-2 border-cyan-400/40 rounded-2xl rotate-12 animate-pulse opacity-40 flex items-center justify-center">
                  <BarChart3 className="w-8 h-8 text-cyan-400" />
                </div>

                <div className="relative z-10">
                  <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-300 via-purple-300 to-emerald-300 bg-clip-text text-transparent mb-4">
                    Analytics Dashboard
                  </h1>
                  <p className="text-xl text-[var(--theme-text-secondary)] font-medium">
                    Comprehensive analytics and insights for your collection
                  </p>
                </div>
              </div>
            </div>

            {/* Analytics Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
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
                  className="w-full lg:w-auto px-6 py-3 rounded-2xl backdrop-blur-xl bg-[var(--theme-surface)] border border-[var(--theme-border)] hover:bg-[var(--theme-surface-hover)] transition-all duration-300 group shadow-xl flex items-center justify-center text-[var(--theme-text-primary)] relative overflow-hidden"
                  disabled={loading}
                >
                  {/* Button glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <RefreshCw
                    className={`w-5 h-5 text-[var(--theme-text-secondary)] mr-2 ${loading ? 'animate-spin' : 'group-hover:rotate-180'} transition-transform duration-300 relative z-10`}
                  />
                  <span className="font-medium text-[var(--theme-text-primary)] relative z-10">Refresh</span>
                </button>
              </div>
            </div>

            {/* Context7 Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="group backdrop-blur-xl bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-3xl shadow-2xl p-8 relative overflow-hidden hover:scale-105 transition-all duration-300">
                {/* Neural glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/15 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
                {/* Holographic border */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-indigo-400/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
                
                <div className="flex items-center relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-[0_0_20px_rgba(99,102,241,0.3)]">
                    <ActivityIcon className="w-8 h-8 text-white" />
                  </div>
                  <div className="ml-6">
                    <p className="text-sm font-bold text-[var(--theme-text-secondary)] tracking-wide uppercase">
                      Total Activities
                    </p>
                    <p className="text-3xl font-bold text-[var(--theme-text-primary)] group-hover:text-indigo-300 transition-colors duration-300">
                      {analyticsData?.totalActivities || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="group backdrop-blur-xl bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-3xl shadow-2xl p-8 relative overflow-hidden hover:scale-105 transition-all duration-300">
                {/* Neural glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-teal-500/15 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
                {/* Holographic border */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
                
                <div className="flex items-center relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                  <div className="ml-6">
                    <p className="text-sm font-bold text-[var(--theme-text-secondary)] tracking-wide uppercase">
                      This Week
                    </p>
                    <p className="text-3xl font-bold text-[var(--theme-text-primary)] group-hover:text-emerald-300 transition-colors duration-300">
                      {activityStats?.week || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="group backdrop-blur-xl bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-3xl shadow-2xl p-8 relative overflow-hidden hover:scale-105 transition-all duration-300">
                {/* Neural glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 via-orange-500/15 to-yellow-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
                {/* Holographic border */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-amber-400/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
                
                <div className="flex items-center relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                    <DollarSign className="w-8 h-8 text-white" />
                  </div>
                  <div className="ml-6">
                    <p className="text-sm font-bold text-[var(--theme-text-secondary)] tracking-wide uppercase">
                      Total Value
                    </p>
                    <p className="text-3xl font-bold text-[var(--theme-text-primary)] group-hover:text-amber-300 transition-colors duration-300">
                      {totalValueFormatted || '--'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="group backdrop-blur-xl bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-3xl shadow-2xl p-8 relative overflow-hidden hover:scale-105 transition-all duration-300">
                {/* Neural glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-violet-500/15 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
                {/* Holographic border */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-purple-400/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
                
                <div className="flex items-center relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl shadow-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-[0_0_20px_rgba(147,51,234,0.3)]">
                    <Clock className="w-8 h-8 text-white" />
                  </div>
                  <div className="ml-6">
                    <p className="text-sm font-bold text-[var(--theme-text-secondary)] tracking-wide uppercase">
                      Last Activity
                    </p>
                    <p className="text-lg font-bold text-[var(--theme-text-primary)] group-hover:text-purple-300 transition-colors duration-300">
                      {activityStats?.lastActivity
                        ? getRelativeTime(activityStats.lastActivity)
                        : 'No activity'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Context7 Category Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="backdrop-blur-xl bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300 group">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)] group-hover:scale-110 transition-transform duration-300">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-semibold text-[var(--theme-text-secondary)] uppercase tracking-wide">
                      Collection
                    </p>
                    <p className="text-2xl font-bold text-[var(--theme-text-primary)]">
                      {analyticsData?.categoryStats.collection || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="backdrop-blur-xl bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300 group">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(147,51,234,0.3)] group-hover:scale-110 transition-transform duration-300">
                    <Gavel className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-semibold text-[var(--theme-text-secondary)] uppercase tracking-wide">
                      Auctions
                    </p>
                    <p className="text-2xl font-bold text-[var(--theme-text-primary)]">
                      {analyticsData?.categoryStats.auction || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="backdrop-blur-xl bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300 group">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)] group-hover:scale-110 transition-transform duration-300">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-semibold text-[var(--theme-text-secondary)] uppercase tracking-wide">
                      Sales
                    </p>
                    <p className="text-2xl font-bold text-[var(--theme-text-primary)]">
                      {analyticsData?.categoryStats.sales || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="backdrop-blur-xl bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300 group">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-slate-500 to-slate-600 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(100,116,139,0.3)] group-hover:scale-110 transition-transform duration-300">
                    <Settings className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-semibold text-[var(--theme-text-secondary)] uppercase tracking-wide">
                      System
                    </p>
                    <p className="text-2xl font-bold text-[var(--theme-text-primary)]">
                      {analyticsData?.categoryStats.system || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Context7 Activity Type Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="backdrop-blur-xl bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-3xl shadow-2xl relative overflow-hidden group">
                {/* Neural glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/5 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-2xl"></div>
                {/* Holographic border */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-1000"></div>
                
                <div className="p-8 relative z-10">
                  <h3 className="text-2xl font-bold text-[var(--theme-text-primary)] mb-6 flex items-center">
                    <PieChart className="w-6 h-6 mr-3 text-cyan-400" />
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
                              className="flex items-center justify-between p-4 rounded-2xl backdrop-blur-sm bg-[var(--theme-surface)]/50 border border-[var(--theme-border)]/30 hover:bg-[var(--theme-surface-hover)]/70 transition-all duration-300 group/item"
                            >
                              <div className="flex items-center">
                                <div
                                  className={`w-10 h-10 bg-gradient-to-br from-${color}-500 to-${color}-600 rounded-xl flex items-center justify-center mr-4 group-hover/item:scale-110 transition-transform duration-300 shadow-[0_0_10px_rgba(99,102,241,0.3)]`}
                                >
                                  <IconComponent className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <p className="font-semibold text-[var(--theme-text-primary)]">
                                    {typeLabel}
                                  </p>
                                  <p className="text-sm text-[var(--theme-text-secondary)]">
                                    {count} event{count !== 1 ? 's' : ''}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold text-[var(--theme-text-primary)] group-hover/item:text-cyan-300 transition-colors duration-300">
                                  {percentage}%
                                </p>
                                <div className="w-16 h-2 bg-[var(--theme-surface)] rounded-full overflow-hidden border border-[var(--theme-border)]">
                                  <div
                                    className={`h-full bg-gradient-to-r from-${color}-500 to-${color}-600 transition-all duration-500 group-hover/item:animate-pulse`}
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

              <div className="backdrop-blur-xl bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-3xl shadow-2xl relative overflow-hidden group">
                {/* Neural glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-purple-500/5 to-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-2xl"></div>
                {/* Holographic border */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-1000"></div>
                
                <div className="p-8 relative z-10">
                  <h3 className="text-2xl font-bold text-[var(--theme-text-primary)] mb-6 flex items-center">
                    <Target className="w-6 h-6 mr-3 text-emerald-400" />
                    Key Insights
                  </h3>

                  <div className="space-y-6">
                    <div className="p-6 rounded-2xl backdrop-blur-sm bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-400/20 hover:border-emerald-400/40 transition-colors duration-300">
                      <div className="flex items-center mb-3">
                        <Award className="w-5 h-5 text-emerald-400 mr-2" />
                        <h4 className="font-bold text-[var(--theme-text-primary)]">
                          Most Active Day
                        </h4>
                      </div>
                      <p className="text-[var(--theme-text-secondary)]">
                        {analyticsData?.mostActiveDay &&
                        analyticsData.mostActiveDay[1] > 0
                          ? `${new Date(analyticsData.mostActiveDay[0]).toLocaleDateString()} with ${analyticsData.mostActiveDay[1]} activities`
                          : 'Not enough data yet'}
                      </p>
                    </div>

                    <div className="p-6 rounded-2xl backdrop-blur-sm bg-gradient-to-r from-purple-500/10 to-violet-500/10 border border-purple-400/20 hover:border-purple-400/40 transition-colors duration-300">
                      <div className="flex items-center mb-3">
                        <TrendingUp className="w-5 h-5 text-purple-400 mr-2" />
                        <h4 className="font-bold text-[var(--theme-text-primary)]">Activity Trend</h4>
                      </div>
                      <p className="text-[var(--theme-text-secondary)]">
                        {analyticsData?.totalActivities
                          ? `${analyticsData.totalActivities} total activities tracked`
                          : 'Start using the app to see trends'}
                      </p>
                    </div>

                    <div className="p-6 rounded-2xl backdrop-blur-sm bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-400/20 hover:border-amber-400/40 transition-colors duration-300">
                      <div className="flex items-center mb-3">
                        <DollarSign className="w-5 h-5 text-amber-400 mr-2" />
                        <h4 className="font-bold text-[var(--theme-text-primary)]">Value Tracking</h4>
                      </div>
                      <p className="text-[var(--theme-text-secondary)]">
                        {analyticsData?.valueActivities.length || 0} activities with
                        price/value data
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Context7 Recent Activity Timeline */}
            <div className="backdrop-blur-xl bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-3xl shadow-2xl relative overflow-hidden group">
              {/* Neural glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-indigo-500/5 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-2xl"></div>
              {/* Holographic border */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-indigo-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-1000"></div>
              
              <div className="p-8 relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-[var(--theme-text-primary)] flex items-center">
                    <LineChart className="w-6 h-6 mr-3 text-indigo-400" />
                    Recent Activity Timeline
                  </h3>
                  <button
                    onClick={() => handleNavigation('/activity')}
                    className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300 hover:scale-105"
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
                            className="flex items-center p-4 rounded-2xl backdrop-blur-sm bg-[var(--theme-surface)]/50 border border-[var(--theme-border)]/30 hover:bg-[var(--theme-surface-hover)]/70 transition-all duration-300 group/activity hover:shadow-md"
                          >
                            <div
                              className={`w-12 h-12 bg-gradient-to-br from-${color}-500 to-${color}-600 rounded-xl flex items-center justify-center mr-4 shadow-lg group-hover/activity:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(99,102,241,0.3)]`}
                            >
                              <IconComponent className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-semibold text-[var(--theme-text-primary)] group-hover/activity:text-indigo-300 transition-colors duration-300">
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
                              <p className="text-sm text-[var(--theme-text-secondary)]">
                                {activity.description}
                              </p>
                              {activity.metadata?.cardName && (
                                <p className="text-xs text-[var(--theme-text-tertiary)] mt-1">
                                  Card: {activity.metadata.cardName}
                                  {activity.metadata.setName &&
                                    ` • ${activity.metadata.setName}`}
                                </p>
                              )}
                              {activity.metadata?.auctionTitle && (
                                <p className="text-xs text-[var(--theme-text-tertiary)] mt-1">
                                  Auction: {activity.metadata.auctionTitle}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-[var(--theme-text-secondary)] font-medium">
                                {getRelativeTime(activity.timestamp)}
                              </p>
                              {(activity.metadata?.newPrice ||
                                activity.metadata?.salePrice ||
                                activity.metadata?.estimatedValue) && (
                                <p className="text-sm font-semibold text-emerald-400">
                                  {displayPrice(
                                    activity.metadata.newPrice ||
                                      activity.metadata.salePrice ||
                                      activity.metadata.estimatedValue
                                  )}
                                </p>
                              )}
                              {activity.metadata?.priceChangePercentage && (
                                <p
                                  className={`text-xs font-medium ${activity.metadata.priceChangePercentage > 0 ? 'text-emerald-400' : 'text-red-400'}`}
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
                    <div className="w-20 h-20 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-[var(--theme-border)] shadow-xl backdrop-blur-sm">
                      <BarChart3 className="w-8 h-8 text-[var(--theme-text-secondary)]" />
                    </div>
                    <h4 className="text-xl font-bold text-[var(--theme-text-primary)] mb-3">
                      No Data Available
                    </h4>
                    <p className="text-[var(--theme-text-secondary)] font-medium max-w-md mx-auto leading-relaxed">
                      Start using the collection management features to see analytics
                      here.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Analytics;
