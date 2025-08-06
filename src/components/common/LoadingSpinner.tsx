/**
 * Context7 Award-Winning Loading Spinner Component with Theme Integration
 * Ultra-premium loading spinner with stunning visual hierarchy and micro-animations
 * Features glass-morphism, premium gradients, and award-winning design patterns
 *
 * Following CLAUDE.md + Context7 principles:
 * - Award-winning visual design with micro-animations
 * - Premium gradient effects and glass-morphism
 * - Context7 design system compliance
 * - Stunning pulsing and rotation effects
 * - Theme Integration: Uses unified theme system for consistent styling
 */

import React, { memo } from 'react';
import { useVisualTheme } from '../../contexts/theme';
import { getElementTheme, ThemeColor } from '../../theme/formThemes';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'blue' | 'gray' | 'green' | 'red' | 'yellow' | 'purple';
  text?: string;
  fullScreen?: boolean;
  className?: string;
  themeColor?: ThemeColor;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = memo(({
  size = 'md',
  color = 'blue',
  text,
  fullScreen = false,
  themeColor = 'dark',
}) => {
  const { visualTheme: _visualTheme } = useVisualTheme();
  const elementTheme = getElementTheme(themeColor);
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20',
  };

  const colorClasses = {
    blue: 'text-cyan-400',
    gray: 'text-zinc-400',
    green: 'text-emerald-400',
    red: 'text-red-400',
    yellow: 'text-amber-400',
    purple: 'text-purple-400',
  };

  // Spinner classes are handled inline in the component

  const containerClasses = fullScreen
    ? 'fixed inset-0 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm z-50'
    : 'flex items-center justify-center';

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  };

  const SpinnerElement = (
    <div className={containerClasses}>
      <div className="flex flex-col items-center">
        {/* Context7 Premium Loading Container */}
        <div className="relative">
          {/* Multi-layer rotating rings with theme colors */}
          <div
            className={`absolute inset-0 rounded-full border-2 border-transparent bg-gradient-to-r ${elementTheme.gradient} animate-spin ${sizeClasses[size]} [clip-path:polygon(0%_0%,25%_0%,25%_25%,0%_25%)]`}
          ></div>
          <div
            className={`absolute inset-1 rounded-full border border-transparent bg-gradient-to-l ${elementTheme.glow} animate-spin ${sizeClasses[size]} opacity-60 [clip-path:polygon(75%_75%,100%_75%,100%_100%,75%_100%)] [animation-duration:1.5s] [animation-direction:reverse]`}
          ></div>

          {/* Inner pulsing circle with enhanced glow */}
          <div
            className={`relative bg-zinc-900/95 backdrop-blur-sm rounded-full ${elementTheme.border} shadow-2xl flex items-center justify-center ${sizeClasses[size]} shadow-[0_0_20px_0_rgb(6,182,212,0.3)]`}
          >
            <div
              className={`w-1/2 h-1/2 bg-gradient-to-br ${colorClasses[color]} rounded-full animate-pulse opacity-90 shadow-lg`}
            ></div>
          </div>

          {/* Premium shimmer effect with enhanced animation */}
          <div
            className={`absolute inset-0 rounded-full bg-gradient-to-r ${elementTheme.glow} animate-ping opacity-30 ${sizeClasses[size]} [animation-delay:0.5s]`}
          ></div>
          <div
            className={`absolute inset-0 rounded-full bg-gradient-to-r ${elementTheme.glow} animate-ping opacity-20 ${sizeClasses[size]} [animation-delay:1s]`}
          ></div>
        </div>

        {text && (
          <p
            className={`mt-4 text-zinc-300 font-semibold tracking-wide ${textSizeClasses[size]} animate-pulse bg-gradient-to-r ${elementTheme.gradient} bg-clip-text text-transparent`}
          >
            {text}
          </p>
        )}
      </div>
    </div>
  );

  return SpinnerElement;
});

export default LoadingSpinner;
