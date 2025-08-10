/**
 * ActivityListItem Component - DRY Violation Fix
 *
 * Reusable activity item component extracted from Activity.tsx
 * to prevent JSX duplication for individual activity items in the timeline.
 *
 * Following CLAUDE.md principles:
 * - Single Responsibility: Handles rendering of a single activity item
 * - DRY: Eliminates repeated activity item JSX structures using BaseListItem
 * - Reusability: Can be used across different activity displays
 * - Design System Integration: Uses BaseListItem foundation with PokemonBadge
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { PokemonBadge } from '../../atoms/design-system';
import BaseListItem from './BaseListItem';
import {
  displayPrice,
  getRelativeTime,
} from '../../../utils/helpers/formatting';

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
  // Render leading icon section
  const renderLeadingIcon = () => (
    <div className="flex-shrink-0 relative">
      {/* Outer holographic ring */}
      <div className="absolute inset-0 rounded-[1.2rem] bg-gradient-to-br from-cyan-400/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-all duration-500 animate-pulse blur-sm"></div>

      {/* Main neumorphic icon container */}
      <div
        className={`relative w-16 h-16 bg-gradient-to-br ${colors.bg} backdrop-blur-sm rounded-[1.2rem] shadow-[inset_0_2px_4px_0_rgba(255,255,255,0.1),inset_0_-2px_4px_0_rgba(0,0,0,0.1),0_8px_16px_0_rgba(0,0,0,0.2)] flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}
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
  );

  // Render trailing timestamp and price section
  const renderTrailingInfo = () => (
    <div className="text-right relative flex items-center space-x-4">
      {/* Futuristic timestamp and price section */}
      <div className="text-right">
        {/* Timestamp container */}
        <div className="relative mb-3">
          <span className="relative text-xs font-semibold text-gray-300 bg-black/20 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-sm group-hover:text-white transition-all duration-300">
            {getRelativeTime(activity.timestamp)}
          </span>
        </div>

        {/* Price display */}
        {(activity.metadata?.newPrice ||
          activity.metadata?.salePrice ||
          activity.metadata?.estimatedValue) && (
          <div className="relative">
            <span className="relative text-base font-black text-white px-3 py-1.5 rounded-lg bg-black/30 border border-white/20 backdrop-blur-sm group-hover:scale-105 transition-transform duration-300">
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

      {/* Activity Indicator */}
      <div className="flex-shrink-0 relative mt-2">
        <div
          className={`relative w-4 h-4 ${colors.dot} rounded-full opacity-80 group-hover:opacity-100 transition-all duration-300 group-hover:scale-125`}
        >
          <div className="absolute inset-0.5 bg-white/30 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );

  return (
    <BaseListItem
      itemKey={uniqueKey}
      variant="timeline"
      size="lg"
      interactive
      showTimeline
      timelineColor="cyan"
      leading={renderLeadingIcon()}
      trailing={renderTrailingInfo()}
      className="mb-6 group relative"
      title={
        <h3 className="text-xl font-black text-white mb-3 leading-tight transition-all duration-500">
          {activity.title}
        </h3>
      }
      subtitle={
        <div>
          <p className="text-sm text-gray-200 leading-relaxed mb-3 group-hover:text-white transition-colors duration-300">
            {activity.description}
          </p>

          {/* Details with subtle accent */}
          {activity.details && (
            <p className="text-xs text-gray-300 font-medium group-hover:text-gray-200 transition-colors duration-300 italic mb-4">
              {activity.details}
            </p>
          )}

          {/* Badge System using PokemonBadge */}
          {activity.metadata?.badges && activity.metadata.badges.length > 0 && (
            <div className="flex items-center space-x-3 mt-4">
              {activity.metadata.badges.map((badge, badgeIndex) => (
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
          )}
        </div>
      }
    />
  );
};

export default ActivityListItem;
