/**
 * MetricCard Component - Reusable Metric Display
 *
 * Following CLAUDE.md principles:
 * - SRP: Single responsibility for displaying metrics
 * - DRY: Eliminates duplication across analytics components
 * - Reusability: Used in Analytics, Dashboard, SalesAnalytics
 * - Layer 3: Pure UI component with props interface
 */

import { LucideIcon } from 'lucide-react';
import React from 'react';
import { GlassmorphismContainer } from '../effects/GlassmorphismContainer';

export interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  colorScheme?: 'primary' | 'success' | 'warning' | 'danger' | 'custom';
  customGradient?: {
    from: string;
    via: string;
    to: string;
  };
  interactive?: boolean;
  onClick?: () => void;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon: Icon,
  colorScheme = 'primary',
  customGradient,
  interactive = true,
  onClick,
  className = '',
}) => {
  // Color mapping for different schemes
  const getIconColors = (scheme: string) => {
    const colorMap = {
      primary: { from: 'indigo-500', to: 'purple-600', shadow: 'rgba(99,102,241,0.3)' },
      success: { from: 'emerald-500', to: 'teal-600', shadow: 'rgba(16,185,129,0.3)' },
      warning: { from: 'amber-500', to: 'orange-600', shadow: 'rgba(245,158,11,0.3)' },
      danger: { from: 'red-500', to: 'red-600', shadow: 'rgba(239,68,68,0.3)' },
      custom: { from: 'purple-500', to: 'violet-600', shadow: 'rgba(147,51,234,0.3)' },
    };
    return colorMap[scheme as keyof typeof colorMap] || colorMap.primary;
  };

  const getHoverColor = (scheme: string) => {
    const hoverMap = {
      primary: 'indigo-300',
      success: 'emerald-300',
      warning: 'amber-300',
      danger: 'red-300',
      custom: 'purple-300',
    };
    return hoverMap[scheme as keyof typeof hoverMap] || hoverMap.primary;
  };

  const colors = getIconColors(colorScheme);
  const hoverColor = getHoverColor(colorScheme);

  return (
    <GlassmorphismContainer
      variant="intense"
      colorScheme={colorScheme}
      size="lg"
      rounded="3xl"
      pattern="neural"
      glow="medium"
      interactive={interactive}
      customGradient={customGradient}
      onClick={onClick}
      className={`group ${className}`}
    >
      {/* Holographic border */}
      <div className={`absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-${colors.from.split('-')[0]}-400/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700`}></div>

      <div className="flex items-center relative z-10">
        <div 
          className={`w-16 h-16 bg-gradient-to-br from-${colors.from} to-${colors.to} rounded-2xl shadow-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}
          style={{ 
            boxShadow: `0 0 20px ${colors.shadow}` 
          }}
        >
          <Icon className="w-8 h-8 text-white" />
        </div>
        <div className="ml-6">
          <p className="text-sm font-bold text-[var(--theme-text-secondary)] tracking-wide uppercase">
            {title}
          </p>
          <p className={`text-3xl font-bold text-[var(--theme-text-primary)] group-hover:text-${hoverColor} transition-colors duration-300`}>
            {value}
          </p>
        </div>
      </div>
    </GlassmorphismContainer>
  );
};

export default MetricCard;