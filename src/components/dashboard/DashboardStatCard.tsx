/**
 * DashboardStatCard Component
 * 
 * Extracted from Dashboard.tsx to eliminate DRY violations
 * Provides reusable statistical card with glassmorphism effects
 * Following CLAUDE.md principles: DRY elimination, component reusability
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { GlassmorphismContainer, IconGlassmorphism } from '../effects/GlassmorphismContainer';

export interface DashboardStatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  colorScheme?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  pattern?: 'neural' | 'quantum' | 'holographic' | 'matrix';
  customGradient?: string;
  loading?: boolean;
  children?: React.ReactNode; // For unique animations/effects
  onClick?: () => void;
}

export const DashboardStatCard: React.FC<DashboardStatCardProps> = ({
  title,
  value,
  icon: Icon,
  colorScheme = 'default',
  pattern = 'neural',
  customGradient,
  loading = false,
  children,
  onClick,
}) => {
  const isClickable = !!onClick;
  
  return (
    <div 
      className={`group relative overflow-hidden ${isClickable ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {/* Holographic border animation */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-[var(--theme-accent-primary)]/20 via-transparent to-[var(--theme-accent-secondary)]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <GlassmorphismContainer
        variant="premium"
        colorScheme={colorScheme}
        size="lg"
        rounded="3xl"
        pattern={pattern}
        glow="subtle"
        interactive={isClickable}
        className="relative p-8 h-full"
        style={customGradient ? { background: customGradient } : undefined}
      >
        {/* Quantum glow effect */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[var(--theme-accent-primary)]/5 via-transparent to-[var(--theme-accent-secondary)]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="relative z-10 flex items-center h-full">
          {/* Icon container */}
          <div className="mr-6">
            <IconGlassmorphism
              variant="premium"
              colorScheme={colorScheme}
              className="relative"
            >
              <Icon 
                size={32} 
                className="relative z-10 drop-shadow-lg" 
                style={{ 
                  filter: 'drop-shadow(0 0 20px var(--theme-accent-primary))' 
                }} 
              />
            </IconGlassmorphism>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[var(--theme-text-secondary)] mb-1 uppercase tracking-wide">
              {title}
            </p>
            <p className="text-3xl font-bold text-[var(--theme-text-primary)] truncate">
              {loading ? '--' : value}
            </p>
          </div>
        </div>

        {/* Custom animations/effects */}
        {children && (
          <div className="absolute inset-0 pointer-events-none">
            {children}
          </div>
        )}
      </GlassmorphismContainer>
    </div>
  );
};

// Specific stat card variants for common use cases
export const DashboardItemsCard: React.FC<Omit<DashboardStatCardProps, 'children'>> = (props) => (
  <DashboardStatCard {...props}>
    {/* Orbiting quantum particles */}
    <div className="absolute top-1/2 left-1/2 w-32 h-32 -translate-x-1/2 -translate-y-1/2">
      <div className="absolute inset-0 rounded-full border border-[var(--theme-accent-primary)]/20 animate-spin">
        <div className="absolute top-0 left-1/2 w-2 h-2 bg-[var(--theme-accent-primary)] rounded-full -translate-x-1/2 -translate-y-1/2 shadow-lg shadow-[var(--theme-accent-primary)]/50" />
      </div>
      <div className="absolute inset-2 rounded-full border border-[var(--theme-accent-secondary)]/20 animate-spin animation-delay-300">
        <div className="absolute top-0 left-1/2 w-1.5 h-1.5 bg-[var(--theme-accent-secondary)] rounded-full -translate-x-1/2 -translate-y-1/2 shadow-lg shadow-[var(--theme-accent-secondary)]/50" />
      </div>
    </div>
  </DashboardStatCard>
);

export const DashboardSalesCard: React.FC<Omit<DashboardStatCardProps, 'children'>> = (props) => (
  <DashboardStatCard {...props}>
    {/* Success flow animation */}
    <div className="absolute inset-0 opacity-30">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--theme-status-success)] to-transparent animate-pulse" />
      <div className="absolute bottom-0 right-0 w-full h-1 bg-gradient-to-l from-transparent via-[var(--theme-status-success)] to-transparent animate-pulse animation-delay-500" />
    </div>
  </DashboardStatCard>
);

export const DashboardValueCard: React.FC<Omit<DashboardStatCardProps, 'children'>> = (props) => (
  <DashboardStatCard {...props}>
    {/* Temporal ripple effect */}
    <div className="absolute top-1/2 left-1/2 w-40 h-40 -translate-x-1/2 -translate-y-1/2">
      <div className="absolute inset-0 rounded-full border border-[var(--theme-accent-primary)]/10 animate-ping" />
      <div className="absolute inset-4 rounded-full border border-[var(--theme-accent-primary)]/15 animate-ping animation-delay-200" />
      <div className="absolute inset-8 rounded-full border border-[var(--theme-accent-primary)]/20 animate-ping animation-delay-400" />
    </div>
  </DashboardStatCard>
);

export const DashboardGradedCard: React.FC<Omit<DashboardStatCardProps, 'children'>> = (props) => (
  <DashboardStatCard {...props}>
    {/* Achievement sparkles */}
    <div className="absolute inset-0">
      <div className="absolute top-4 right-4 w-2 h-2 bg-[var(--theme-accent-primary)] rounded-full animate-pulse shadow-lg shadow-[var(--theme-accent-primary)]/50" />
      <div className="absolute top-8 right-8 w-1 h-1 bg-[var(--theme-accent-secondary)] rounded-full animate-pulse animation-delay-300 shadow-lg shadow-[var(--theme-accent-secondary)]/50" />
      <div className="absolute bottom-4 left-4 w-1.5 h-1.5 bg-[var(--theme-accent-primary)] rounded-full animate-pulse animation-delay-600 shadow-lg shadow-[var(--theme-accent-primary)]/50" />
    </div>
  </DashboardStatCard>
);

export const DashboardDataCard: React.FC<Omit<DashboardStatCardProps, 'children'>> = (props) => (
  <DashboardStatCard {...props}>
    {/* Database sync animation */}
    <div className="absolute bottom-2 right-2 opacity-40">
      <div className="flex space-x-1">
        <div className="w-1 h-8 bg-[var(--theme-accent-primary)] rounded-full animate-pulse" />
        <div className="w-1 h-6 bg-[var(--theme-accent-primary)] rounded-full animate-pulse animation-delay-150" />
        <div className="w-1 h-4 bg-[var(--theme-accent-primary)] rounded-full animate-pulse animation-delay-300" />
        <div className="w-1 h-6 bg-[var(--theme-accent-primary)] rounded-full animate-pulse animation-delay-450" />
        <div className="w-1 h-8 bg-[var(--theme-accent-primary)] rounded-full animate-pulse animation-delay-600" />
      </div>
    </div>
  </DashboardStatCard>
);