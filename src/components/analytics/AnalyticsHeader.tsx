/**
 * AnalyticsHeader Component - Analytics Page Header
 *
 * Following CLAUDE.md principles:
 * - SRP: Single responsibility for analytics header display
 * - Reusability: Header pattern reusable across analytics pages
 * - Layer 3: Pure UI component
 */

import { BarChart3 } from 'lucide-react';
import React from 'react';
import { GlassmorphismContainer } from '../effects/GlassmorphismContainer';

export interface AnalyticsHeaderProps {
  title?: string;
  subtitle?: string;
  className?: string;
}

export const AnalyticsHeader: React.FC<AnalyticsHeaderProps> = ({
  title = 'Analytics Dashboard',
  subtitle = 'Comprehensive analytics and insights for your collection',
  className = '',
}) => {
  return (
    <div className={`relative group ${className}`}>
      <GlassmorphismContainer
        variant="intense"
        colorScheme="custom"
        size="xl"
        rounded="3xl"
        pattern="neural"
        glow="intense"
        animated={true}
        customGradient={{
          from: 'cyan-500/20',
          via: 'purple-500/15',
          to: 'emerald-500/20'
        }}
      >
        {/* Holographic border animation */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent opacity-30 group-hover:opacity-100 transition-all duration-1000 animate-pulse"></div>

        {/* Top accent line */}
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-cyan-400 via-purple-500 to-emerald-500 opacity-80 animate-pulse"></div>

        {/* Floating analytics icon */}
        <div className="absolute top-8 right-8 w-16 h-16 border-2 border-cyan-400/40 rounded-2xl rotate-12 animate-pulse opacity-40 flex items-center justify-center">
          <BarChart3 className="w-8 h-8 text-cyan-400" />
        </div>

        <div className="relative z-10">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-300 via-purple-300 to-emerald-300 bg-clip-text text-transparent mb-4">
            {title}
          </h1>
          <p className="text-xl text-[var(--theme-text-secondary)] font-medium">
            {subtitle}
          </p>
        </div>
      </GlassmorphismContainer>
    </div>
  );
};

export default AnalyticsHeader;