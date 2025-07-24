/**
 * Context7 Award-Winning Loading Spinner Component
 * Ultra-premium loading spinner with stunning visual hierarchy and micro-animations
 * Features glass-morphism, premium gradients, and award-winning design patterns
 *
 * Following CLAUDE.md + Context7 principles:
 * - Award-winning visual design with micro-animations
 * - Premium gradient effects and glass-morphism
 * - Context7 design system compliance
 * - Stunning pulsing and rotation effects
 */

import React from 'react';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'blue' | 'gray' | 'green' | 'red' | 'yellow' | 'purple';
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'blue',
  text,
  fullScreen = false,
}) => {
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
          {/* Multi-layer rotating rings */}
          <div
            className={`absolute inset-0 rounded-full border-2 border-transparent bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 animate-spin ${sizeClasses[size]}`}
            style={{ clipPath: 'polygon(0% 0%, 25% 0%, 25% 25%, 0% 25%)' }}
          ></div>
          <div
            className={`absolute inset-1 rounded-full border border-transparent bg-gradient-to-l from-cyan-400 via-blue-400 to-cyan-400 animate-spin ${sizeClasses[size]} opacity-60`}
            style={{
              clipPath: 'polygon(75% 75%, 100% 75%, 100% 100%, 75% 100%)',
              animationDuration: '1.5s',
              animationDirection: 'reverse',
            }}
          ></div>

          {/* Inner pulsing circle with enhanced glow */}
          <div
            className={`relative bg-zinc-900/95 backdrop-blur-sm rounded-full border border-zinc-700/50 shadow-2xl flex items-center justify-center ${sizeClasses[size]} shadow-[0_0_20px_0_rgb(6,182,212,0.3)]`}
          >
            <div
              className={`w-1/2 h-1/2 bg-gradient-to-br ${colorClasses[color]} rounded-full animate-pulse opacity-90 shadow-lg`}
            ></div>
          </div>

          {/* Premium shimmer effect with enhanced animation */}
          <div
            className={`absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-cyan-200/20 to-transparent animate-ping opacity-30 ${sizeClasses[size]}`}
            style={{ animationDelay: '0.5s' }}
          ></div>
          <div
            className={`absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-cyan-300/20 to-transparent animate-ping opacity-20 ${sizeClasses[size]}`}
            style={{ animationDelay: '1s' }}
          ></div>
        </div>

        {text && (
          <p
            className={`mt-4 text-zinc-300 font-semibold tracking-wide ${textSizeClasses[size]} animate-pulse bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent`}
          >
            {text}
          </p>
        )}
      </div>
    </div>
  );

  return SpinnerElement;
};

export default LoadingSpinner;
