/**
 * ActivityTimeline Component - Recent Activity Display
 *
 * Following CLAUDE.md principles:
 * - SRP: Single responsibility for displaying activity timeline
 * - DRY: Reusable across Analytics, Dashboard, Activity pages
 * - Layer 3: Pure UI component with clear props interface
 * - Dependencies: Layer 1 utilities only
 */

import React from 'react';
import { GlassmorphismContainer } from '../effects/GlassmorphismContainer';
import { ContentLoading } from '../../../../shared/components/molecules/common/LoadingStates';
import {
  getActivityColor,
  getActivityIcon,
} from '../../../shared/utils/helpers/activityHelpers';
import {
  displayPrice,
  getRelativeTime,
} from '../../../shared/utils/helpers/formatting';
import { LineChart } from 'lucide-react';

export interface ActivityTimelineProps {
  activities: any[];
  analyticsData?: any; // Made optional
  loading: boolean;
  onNavigate?: (path: string) => void;
  showHeader?: boolean;
  maxItems?: number;
  className?: string;
  containerless?: boolean; // Option to render without container
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  activities,
  analyticsData: _analyticsData,
  loading,
  onNavigate,
  showHeader = true,
  maxItems = 10,
  className = '',
  containerless = false,
}) => {
  const handleNavigation = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const content = (
    <div
      className={`relative z-10 ${containerless ? '' : 'group'} ${className}`}
    >
      {/* Holographic border - only when not containerless */}
      {!containerless && (
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-indigo-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-1000"></div>
      )}

      <div className="relative z-10">
        {showHeader && (
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
        )}

        {loading ? (
          <ContentLoading text="Loading analytics..." />
        ) : activities && activities.length > 0 ? (
          <div className="space-y-4">
            {activities
              .filter(
                (activity, index, self) =>
                  index === self.findIndex((a) => a._id === activity._id)
              )
              .slice(0, maxItems)
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
                          className={`text-xs font-medium ${
                            activity.metadata.priceChangePercentage > 0
                              ? 'text-emerald-400'
                              : 'text-red-400'
                          }`}
                        >
                          {activity.metadata.priceChangePercentage > 0
                            ? '+'
                            : ''}
                          {activity.metadata.priceChangePercentage.toFixed(1)}%
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
              <LineChart className="w-8 h-8 text-[var(--theme-text-secondary)]" />
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
  );

  // Return with or without container based on containerless prop
  return containerless ? (
    content
  ) : (
    <GlassmorphismContainer
      variant="intense"
      colorScheme="custom"
      size="lg"
      rounded="3xl"
      pattern="neural"
      glow="medium"
      interactive={true}
      customGradient={{
        from: 'cyan-500/10',
        via: 'indigo-500/5',
        to: 'purple-500/10',
      }}
    >
      {content}
    </GlassmorphismContainer>
  );
};

export default ActivityTimeline;
