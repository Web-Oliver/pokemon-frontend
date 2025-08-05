/**
 * Analytics Page Component - Refactored with Component Composition
 *
 * Following CLAUDE.md principles:
 * - SRP: Single responsibility for page orchestration
 * - DRY: Uses reusable components from analytics package
 * - Layer 4: Page-level component that orchestrates Layer 3 components
 * - Maintainability: Reduced from 893 to ~150 lines
 */

import { RefreshCw } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import DateRangeFilter, { DateRangeState } from '../components/common/DateRangeFilter';
import { PageLayout } from '../components/layouts/PageLayout';
import { GlassmorphismContainer } from '../components/effects/GlassmorphismContainer';
import {
  AnalyticsBackground,
  AnalyticsHeader,
  ActivityTimeline,
  CategoryStats,
  MetricsGrid,
} from '../components/analytics';
import { useActivity, useActivityStats } from '../hooks/useActivity';
import { useCollectionStats } from '../hooks/useCollectionStats';
import { useAnalyticsData } from '../hooks/useAnalyticsData';

const Analytics: React.FC = () => {
  const [dateRange, setDateRange] = useState<DateRangeState>({
    preset: 'month',
  });

  // Context7 Analytics Hooks - Use limited data for analytics
  const { activities, loading, fetchActivities, refresh } = useActivity({
    limit: 100,
  });

  const { stats: activityStats } = useActivityStats();
  const { totalValueFormatted } = useCollectionStats();
  
  // Process analytics data using extracted hook
  const analyticsData = useAnalyticsData({ activities });

  // Handle navigation
  const handleNavigation = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
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
  }, [dateRange, fetchActivities]);

  return (
    <PageLayout title="Analytics" subtitle="Collection analytics and insights">
      <div className="min-h-screen bg-gradient-to-br from-[var(--theme-background)] via-purple-950/20 to-indigo-950/30 relative overflow-hidden">
        {/* Background Effects */}
        <AnalyticsBackground />

        <div className="relative z-10 p-8">
          <div className="max-w-7xl mx-auto space-y-12">
            {/* Analytics Header */}
            <AnalyticsHeader />

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
                <GlassmorphismContainer
                  variant="medium"
                  colorScheme="primary"
                  size="sm"
                  rounded="2xl"
                  interactive={true}
                  onClick={refresh}
                  className="w-full lg:w-auto flex items-center justify-center cursor-pointer disabled:opacity-50 group"
                >
                  {/* Button glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <RefreshCw
                    className={`w-5 h-5 text-[var(--theme-text-secondary)] mr-2 ${
                      loading ? 'animate-spin' : 'group-hover:rotate-180'
                    } transition-transform duration-300 relative z-10`}
                  />
                  <span className="font-medium text-[var(--theme-text-primary)] relative z-10">
                    Refresh
                  </span>
                </GlassmorphismContainer>
              </div>
            </div>

            {/* Key Metrics Grid */}
            <MetricsGrid
              analyticsData={analyticsData}
              activityStats={activityStats}
              totalValueFormatted={totalValueFormatted}
            />

            {/* Category Overview */}
            <CategoryStats analyticsData={analyticsData} />

            {/* Activity Timeline */}
            <ActivityTimeline
              activities={activities}
              analyticsData={analyticsData}
              loading={loading}
              onNavigate={handleNavigation}
            />
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Analytics;