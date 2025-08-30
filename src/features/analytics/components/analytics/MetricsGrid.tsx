/**
 * MetricsGrid Component - Key Metrics Display Container
 *
 * Following CLAUDE.md principles:
 * - SRP: Single responsibility for orchestrating metric cards
 * - DRY: Reusable metrics grid layout
 * - Layer 3: UI component that composes MetricCard components
 */

import {
  Activity as ActivityIcon,
  Clock,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import React from 'react';
import { MetricCard } from './MetricCard';
import { getRelativeTime } from '@/shared/utils';

export interface MetricsGridProps {
  analyticsData: any;
  activityStats: any;
  totalValueFormatted: string;
  className?: string;
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({
  analyticsData,
  activityStats,
  totalValueFormatted,
  className = '',
}) => {
  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 ${className}`}
    >
      <MetricCard
        title="Total Activities"
        value={analyticsData?.totalActivities || 0}
        icon={ActivityIcon}
        colorScheme="custom"
        customGradient={{
          from: 'indigo-500/20',
          via: 'purple-500/15',
          to: 'cyan-500/20',
        }}
      />

      <MetricCard
        title="This Week"
        value={activityStats?.week || 0}
        icon={TrendingUp}
        colorScheme="success"
      />

      <MetricCard
        title="Total Value"
        value={totalValueFormatted || '--'}
        icon={DollarSign}
        colorScheme="warning"
      />

      <MetricCard
        title="Last Activity"
        value={
          activityStats?.lastActivity
            ? getRelativeTime(activityStats.lastActivity)
            : 'No activity'
        }
        icon={Clock}
        colorScheme="custom"
        customGradient={{
          from: 'purple-500/20',
          via: 'violet-500/15',
          to: 'pink-500/20',
        }}
      />
    </div>
  );
};

export default MetricsGrid;
