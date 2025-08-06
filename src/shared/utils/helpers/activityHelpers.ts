/**
 * Activity Helpers - Utility Functions for Activity Management
 *
 * Following CLAUDE.md principles:
 * - Layer 1: Core utilities with no dependencies on other layers
 * - DRY: Centralized activity type logic
 * - Reusability: Used across Analytics, Activity, Dashboard components
 */

import {
  Activity as ActivityIcon,
  Award,
  BarChart,
  CheckCircle,
  Edit,
  Gavel,
  LucideIcon,
  Minus,
  Plus,
  Settings,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import { ACTIVITY_TYPES } from '../../hooks/useActivity';

/**
 * Get color scheme for activity type
 * Used for consistent theming across all activity displays
 */
export const getActivityColor = (type: string): string => {
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

/**
 * Get icon component for activity type
 * Used for consistent iconography across all activity displays
 */
export const getActivityIcon = (type: string): LucideIcon => {
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

/**
 * Format activity type to human-readable label
 * Converts SNAKE_CASE to Title Case
 */
export const formatActivityTypeLabel = (type: string): string => {
  return type
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());
};

/**
 * Categorize activity types for analytics grouping
 */
export interface ActivityCategoryStats {
  collection: number;
  auction: number;
  sales: number;
  system: number;
}

export const categorizeActivity = (
  type: string
): keyof ActivityCategoryStats => {
  if (type.includes('CARD') || type.includes('PRICE')) {
    return 'collection';
  } else if (type.includes('AUCTION')) {
    return 'auction';
  } else if (type.includes('SALE')) {
    return 'sales';
  } else {
    return 'system';
  }
};

/**
 * Process activities for analytics
 * Removes duplicates and calculates category stats
 */
export const processActivitiesForAnalytics = (activities: any[]) => {
  if (!activities.length) {
    return null;
  }

  // Remove duplicates
  const uniqueActivities = activities.filter(
    (activity, index, self) =>
      index === self.findIndex((a) => a._id === activity._id)
  );

  // Activity type distribution with enhanced categorization
  const typeDistribution = uniqueActivities.reduce(
    (acc, activity) => {
      const typeLabel = formatActivityTypeLabel(activity.type);
      acc[typeLabel] = (acc[typeLabel] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // Category-based activity grouping
  const categoryStats: ActivityCategoryStats = {
    collection: 0,
    auction: 0,
    sales: 0,
    system: 0,
  };

  uniqueActivities.forEach((activity) => {
    const category = categorizeActivity(activity.type);
    categoryStats[category]++;
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

  const totalActivities = uniqueActivities.length;

  return {
    typeDistribution,
    categoryStats,
    dailyTrends,
    valueActivities,
    totalValue,
    totalActivities,
    mostActiveDay: Object.entries(dailyTrends).sort(([, a], [, b]) => b - a)[0],
  };
};
