/**
 * useAnalyticsData Hook - Analytics Business Logic
 *
 * Following CLAUDE.md principles:
 * - Layer 2: Business logic and data orchestration
 * - SRP: Single responsibility for analytics data processing
 * - DRY: Centralizes analytics logic for reuse
 * - Dependencies: Layer 1 utilities only
 */

import { useMemo } from 'react';
import { processActivitiesForAnalytics } from '../utils/helpers/activityHelpers';

export interface AnalyticsData {
  typeDistribution: Record<string, number>;
  categoryStats: {
    collection: number;
    auction: number;
    sales: number;
    system: number;
  };
  dailyTrends: Record<string, number>;
  valueActivities: any[];
  totalValue: number;
  totalActivities: number;
  mostActiveDay: [string, number] | undefined;
}

export interface UseAnalyticsDataProps {
  activities: any[];
}

/**
 * Hook for processing analytics data
 * Memoizes expensive calculations for performance
 */
export const useAnalyticsData = ({
  activities,
}: UseAnalyticsDataProps): AnalyticsData | null => {
  const analyticsData = useMemo(() => {
    return processActivitiesForAnalytics(activities);
  }, [activities]);

  return analyticsData;
};

export default useAnalyticsData;
