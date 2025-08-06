/**
 * ActivityListItem Component - DRY Violation Fix
 *
 * Reusable activity item component extracted from Activity.tsx
 * to prevent JSX duplication for individual activity items in the timeline.
 *
 * Following CLAUDE.md principles:
 * - Single Responsibility: Handles rendering of a single activity item
 * - DRY: Eliminates repeated activity item JSX structures
 * - Reusability: Can be used across different activity displays
 * - Design System Integration: Uses PokemonCard and PokemonBadge for consistency
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { PokemonCard, PokemonBadge } from '../design-system';
import { displayPrice, getRelativeTime } from '../../utils/formatting';

interface ActivityMetadata {
  color?: string;
  newPrice?: number;
  salePrice?: number;
  estimatedValue?: number;
  badges?: string[];
}

interface ActivityItemData {
  _id?: string;
  id?: string;
  type: string;
  title: string;
  description: string;
  details?: string;
  timestamp: string | Date;
  metadata?: ActivityMetadata;
}

interface ColorClasses {
  bg: string;
  badge: string;
  dot: string;
}

interface ActivityListItemProps {
  /** Activity data to display */
  activity: ActivityItemData;
  /** Icon component for the activity type */
  IconComponent: LucideIcon;
  /** Color classes for styling */
  colors: ColorClasses;
  /** Unique key for React rendering */
  uniqueKey: string;
}

const ActivityListItem: React.FC<ActivityListItemProps> = ({
  activity,
  IconComponent,
  colors,
  uniqueKey,
}) => {
  return (
    <PokemonCard
      key={uniqueKey}
      variant="glass"
      size="md"
      interactive
      className="mb-6 group relative"
    >
      {/* Timeline accent */}
      <div className="absolute left-0 top-0 h-full w-[2px] bg-gradient-to-b from-transparent via-cyan-400/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      <div className="relative z-10 flex items-start space-x-6">
        {/* Advanced Neumorphic Icon Container */}
        <div className="flex-shrink-0 relative">
          {/* Outer holographic ring */}
          <div className="absolute inset-0 rounded-[1.2rem] bg-gradient-to-br from-cyan-400/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-all duration-500 animate-pulse blur-sm"></div>

          {/* Main neumorphic icon container */}
          <div
            className={`relative w-16 h-16 bg-gradient-to-br ${colors.bg.replace('from-', 'from-').replace('to-', 'to-')} backdrop-blur-sm rounded-[1.2rem] shadow-[inset_0_2px_4px_0_rgba(255,255,255,0.1),inset_0_-2px_4px_0_rgba(0,0,0,0.1),0_8px_16px_0_rgba(0,0,0,0.2)] flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}
          >
            {/* Inner quantum glow */}
            <div className="absolute inset-2 bg-gradient-to-br from-white/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>

            {/* Icon with enhanced effects */}
            <IconComponent className="w-8 h-8 text-white relative z-10 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] group-hover:drop-shadow-[0_0_12px_rgba(6,182,212,0.6)] transition-all duration-500" />

            {/* Orbital elements */}
            <div
              className="absolute inset-0 animate-spin opacity-40 group-hover:opacity-70 transition-opacity duration-500"
              style={{ animationDuration: '15s' }}
            >
              <div className="w-1 h-1 bg-cyan-400 rounded-full absolute -top-0.5 left-1/2 transform -translate-x-1/2 blur-sm"></div>
              <div className="w-0.5 h-0.5 bg-purple-400 rounded-full absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 blur-sm"></div>
            </div>

            {/* Activity pulse ring */}
            <div className="absolute inset-0 rounded-[1.2rem] border border-white/20 animate-ping opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
          </div>
        </div>

        {/* Futuristic Content Section */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              {/* Enhanced title with cyberpunk styling */}
              <h3 className="text-xl font-black bg-gradient-to-r from-white via-cyan-200 to-purple-200 bg-clip-text text-transparent mb-3 leading-tight drop-shadow-[0_0_10px_rgba(6,182,212,0.3)] group-hover:from-cyan-300 group-hover:via-purple-300 group-hover:to-pink-300 transition-all duration-500">
                {activity.title}
              </h3>

              {/* Description with neural glow */}
              <p className="text-sm text-cyan-100/80 leading-relaxed mb-3 group-hover:text-white/90 transition-colors duration-300">
                {activity.description}
              </p>

              {/* Details with quantum accent */}
              {activity.details && (
                <p className="text-xs text-purple-200/60 font-medium group-hover:text-purple-200/80 transition-colors duration-300 italic">
                  {activity.details}
                </p>
              )}
            </div>

            {/* Futuristic timestamp and price section */}
            <div className="text-right ml-6 relative">
              {/* Holographic timestamp container */}
              <div className="relative mb-3">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <span className="relative text-xs font-semibold text-cyan-200/70 bg-white/[0.03] px-3 py-1.5 rounded-lg border border-white/[0.08] backdrop-blur-sm group-hover:text-cyan-200 group-hover:border-cyan-400/20 transition-all duration-300">
                  {getRelativeTime(activity.timestamp)}
                </span>
              </div>

              {/* Enhanced price display */}
              {(activity.metadata?.newPrice ||
                activity.metadata?.salePrice ||
                activity.metadata?.estimatedValue) && (
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <span className="relative text-base font-black bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.10] backdrop-blur-sm group-hover:scale-105 transition-transform duration-300 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]">
                    {activity.metadata.newPrice &&
                      displayPrice(activity.metadata.newPrice)}
                    {activity.metadata.salePrice &&
                      displayPrice(activity.metadata.salePrice)}
                    {activity.metadata.estimatedValue &&
                      `Est. ${displayPrice(activity.metadata.estimatedValue)}`}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Badge System using PokemonBadge */}
          <div className="flex items-center space-x-3 mt-4">
            {activity.metadata?.badges?.map((badge, badgeIndex) => (
              <PokemonBadge
                key={badgeIndex}
                variant="info"
                style="glass"
                shape="pill"
                size="sm"
                dot
                pulse
                className="group/badge hover:scale-105 transition-transform duration-300"
              >
                {badge}
              </PokemonBadge>
            ))}
          </div>
        </div>

        {/* Activity Indicator */}
        <div className="flex-shrink-0 relative mt-2">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400/30 to-purple-400/30 opacity-0 group-hover:opacity-100 animate-ping transition-opacity duration-500"></div>
          <div
            className={`relative w-4 h-4 ${colors.dot} rounded-full opacity-60 group-hover:opacity-100 transition-all duration-300 shadow-[0_0_8px_currentColor] group-hover:scale-125`}
          >
            <div className="absolute inset-0.5 bg-white/30 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </PokemonCard>
  );
};

export default ActivityListItem;