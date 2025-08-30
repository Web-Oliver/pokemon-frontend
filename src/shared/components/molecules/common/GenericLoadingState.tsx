/**
 * Generic Loading State Component - Standardized Loading Patterns
 * Unified component supporting multiple loading variants with theme integration
 *
 * Following CLAUDE.md principles:
 * - Single Responsibility: Centralized loading state management
 * - Interface Segregation: Multiple variant support
 * - Theme Integration: Uses unified theme system for consistent styling
 * - DRY: Eliminates duplicate loading patterns
 */

import React from 'react';
import { useTheme } from '@/theme';
import { getElementTheme, type ThemeColor } from '@/lib/theme-utils';

export type LoadingVariant = 'spinner' | 'skeleton' | 'shimmer';

export interface GenericLoadingStateProps {
  variant?: LoadingVariant;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'blue' | 'gray' | 'green' | 'red' | 'yellow' | 'purple';
  text?: string;
  fullScreen?: boolean;
  className?: string;
  themeColor?: ThemeColor;
  skeletonLines?: number;
  width?: string;
  height?: string;
}

const GenericLoadingState: React.FC<GenericLoadingStateProps> = ({
  variant = 'spinner',
  size = 'md',
  color = 'blue',
  text,
  fullScreen = false,
  className = '',
  themeColor = 'dark',
  skeletonLines = 3,
  width = 'w-full',
  height = 'h-4',
}) => {
  // Theme context integration via centralized useTheme hook
  const { visualTheme } = useTheme();
  const elementTheme = getElementTheme(themeColor);

  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20',
  };

  const colorClasses = {
    blue: 'text-cyan-400',
    gray: 'text-cyan-400',
    green: 'text-cyan-400',
    red: 'text-cyan-400',
    yellow: 'text-cyan-400',
    purple: 'text-cyan-400',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  };

  const containerClasses = fullScreen
    ? 'fixed inset-0 flex items-center justify-center bg-zinc-950/80 backdrop-blur-lg z-50'
    : 'flex items-center justify-center';

  const renderSpinner = () => (
    <div className={containerClasses}>
      <div className="flex flex-col items-center">
        {/* Loading Container */}
        <div className="relative">
          {/* Multi-layer rotating rings */}
          <div
            className={`absolute inset-0 rounded-full border-2 border-transparent bg-gradient-to-r from-cyan-400 to-purple-400 animate-spin ${sizeClasses[size]}`}
          ></div>
          <div
            className={`absolute inset-1 rounded-full border border-transparent bg-gradient-to-l from-cyan-400/60 to-blue-400/60 animate-spin ${sizeClasses[size]} opacity-60`}
            style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}
          ></div>

          {/* Inner pulsing circle */}
          <div
            className={`relative bg-zinc-900/60 backdrop-blur-lg border border-cyan-400/30 rounded-full shadow-2xl flex items-center justify-center ${sizeClasses[size]}`}
          >
            <div
              className={`w-1/2 h-1/2 bg-gradient-to-br from-cyan-400 to-blue-400 rounded-full animate-pulse opacity-90 shadow-lg`}
            ></div>
          </div>

          {/* Shimmer effect */}
          <div
            className={`absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400/20 to-purple-400/20 animate-ping opacity-30 ${sizeClasses[size]}`}
            style={{ animationDelay: '0.5s' }}
          ></div>
        </div>

        {text && (
          <p
            className={`mt-4 text-cyan-100/70 font-semibold tracking-wide ${textSizeClasses[size]} animate-pulse`}
          >
            {text}
          </p>
        )}
      </div>
    </div>
  );

  const renderSkeleton = () => (
    <div className={`${fullScreen ? containerClasses : ''} ${className}`}>
      <div className="animate-pulse space-y-3">
        {Array.from({ length: skeletonLines }).map((_, index) => (
          <div
            key={index}
            className={`bg-gradient-to-r from-zinc-800/60 to-zinc-700/60 backdrop-blur-sm border border-cyan-400/10 rounded-md ${height} ${
              index === skeletonLines - 1 ? 'w-3/4' : width
            }`}
          />
        ))}
        {text && (
          <p className={`text-cyan-100/70 ${textSizeClasses[size]} mt-2`}>
            {text}
          </p>
        )}
      </div>
    </div>
  );

  const renderShimmer = () => (
    <div className={`${fullScreen ? containerClasses : ''} ${className}`}>
      <div
        className={`relative overflow-hidden bg-zinc-900/60 backdrop-blur-lg border border-cyan-400/20 rounded-lg ${width} ${height}`}
      >
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent"></div>
        {text && (
          <div className="flex items-center justify-center h-full">
            <p className={`text-cyan-100/70 ${textSizeClasses[size]}`}>{text}</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderLoadingState = () => {
    switch (variant) {
      case 'skeleton':
        return renderSkeleton();
      case 'shimmer':
        return renderShimmer();
      case 'spinner':
      default:
        return renderSpinner();
    }
  };

  return renderLoadingState();
};

export default GenericLoadingState;
