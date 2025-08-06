/**
 * AnalyticsBackground Component - Animated Background Effects
 *
 * Following CLAUDE.md principles:
 * - SRP: Single responsibility for background visual effects
 * - Reusability: Can be used across Analytics, SalesAnalytics, Dashboard
 * - Layer 3: Pure UI component with no business logic
 */

import React from 'react';

export interface AnalyticsBackgroundProps {
  className?: string;
  opacity?: string;
  particleCount?: number;
}

export const AnalyticsBackground: React.FC<AnalyticsBackgroundProps> = ({
  className = '',
  opacity = 'opacity-15',
  particleCount = 20,
}) => {
  return (
    <>
      {/* Context7 2025 Futuristic Neural Background - Quantum Analytics Field */}
      <div className={`absolute inset-0 ${opacity} ${className}`}>
        {/* Analytics Neural Network Pattern */}
        <div
          className="absolute inset-0 animate-pulse"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='140' height='140' viewBox='0 0 140 140' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cfilter id='analyticsglow'%3E%3CfeGaussianBlur stdDeviation='2' result='coloredBlur'/%3E%3CfeMerge%3E%3CfeMergeNode in='coloredBlur'/%3E%3CfeMergeNode in='SourceGraphic'/%3E%3C/feMerge%3E%3C/filter%3E%3C/defs%3E%3Cg fill='none' stroke='%2306b6d4' stroke-width='0.3' filter='url(%23analyticsglow)'%3E%3Ccircle cx='70' cy='70' r='3'/%3E%3Cpath d='M20,70 Q45,30 70,70 Q95,110 120,70'/%3E%3Cpath d='M70,20 Q110,45 70,70 Q30,95 70,120'/%3E%3C/g%3E%3C/svg%3E")`,
            animationDuration: '8s',
          }}
        />
        {/* Chart Visualization Particles */}
        <div
          className="absolute inset-0 animate-bounce"
          style={{
            animationDuration: '12s',
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='240' height='240' viewBox='0 0 240 240' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23a855f7' fill-opacity='0.03'%3E%3Crect x='60' y='180' width='8' height='40'/%3E%3Crect x='80' y='160' width='8' height='60'/%3E%3Crect x='100' y='140' width='8' height='80'/%3E%3Crect x='120' y='120' width='8' height='100'/%3E%3Crect x='140' y='100' width='8' height='120'/%3E%3Crect x='160' y='170' width='8' height='50'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        {/* Data Flow Grid */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `linear-gradient(90deg, transparent 97%, rgba(6, 182, 212, 0.08) 100%), linear-gradient(transparent 97%, rgba(168, 85, 247, 0.08) 100%)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Floating Analytics Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(particleCount)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-15 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 4 + 1}px`,
              height: `${Math.random() * 4 + 1}px`,
              background: `radial-gradient(circle, ${
                ['#06b6d4', '#a855f7', '#10b981', '#f59e0b'][
                  Math.floor(Math.random() * 4)
                ]
              }, transparent)`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 6 + 4}s`,
            }}
          />
        ))}
      </div>
    </>
  );
};

export default AnalyticsBackground;
