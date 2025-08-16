/**
 * DashboardStatCard Component
 *
 * Extracted from Dashboard.tsx to eliminate DRY violations
 * Provides reusable statistical card with glassmorphism effects
 * Following CLAUDE.md principles: DRY elimination, component reusability
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { PokemonCard } from '../../../../shared/components/atoms/design-system';

export interface DashboardStatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  colorScheme: {
    bg: string;
    iconColor: string;
    titleColor: string;
    valueGradient: string;
    valueShadow: string;
    dotColors: {
      primary: string;
      secondary: string;
    };
  };
  loading?: boolean;
  label?: string;
  children?: React.ReactNode;
  onClick?: () => void;
}

export const DashboardStatCard: React.FC<DashboardStatCardProps> = ({
  title,
  value,
  icon: Icon,
  colorScheme,
  loading = false,
  children,
  onClick,
}) => {
  return (
    <PokemonCard variant="glass" size="md" interactive className="group" onClick={onClick}>
      <div className="relative z-10 flex items-center">
        <div className="relative mr-4">
          <div
            className={`w-16 h-16 bg-gradient-to-br ${colorScheme.bg} backdrop-blur-sm rounded-[1.2rem] flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}
          >
            <Icon
              className={`w-8 h-8 ${colorScheme.iconColor} relative z-10 animate-pulse`}
            />

            {/* Default orbital animation if no custom children provided */}
            {!children && (
              <div
                className="absolute inset-0 animate-spin opacity-60 group-hover:opacity-100 transition-opacity duration-500"
                style={{ animationDuration: '20s' }}
              >
                <div
                  className={`w-1.5 h-1.5 ${colorScheme.dotColors.primary} rounded-full absolute -top-0.5 left-1/2 transform -translate-x-1/2 blur-sm`}
                ></div>
                <div
                  className={`w-1 h-1 ${colorScheme.dotColors.secondary} rounded-full absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 blur-sm`}
                ></div>
              </div>
            )}

            {/* Custom animations if provided */}
            {children}
          </div>
        </div>
        <div className="flex-1">
          <p
            className={`text-sm font-semibold ${colorScheme.titleColor} mb-2 tracking-wider uppercase`}
          >
            {title}
          </p>
          <p
            className={`text-3xl font-black bg-gradient-to-r ${colorScheme.valueGradient} bg-clip-text text-transparent ${colorScheme.valueShadow} group-hover:scale-105 transition-transform duration-300`}
          >
            {loading ? (
              <span className="animate-pulse bg-slate-500/20 rounded-lg px-4 py-2">--</span>
            ) : (
              value
            )}
          </p>
        </div>
      </div>
    </PokemonCard>
  );
};

// Specific stat card variants matching Activity page styling
export const DashboardItemsCard: React.FC<
  Omit<DashboardStatCardProps, 'children' | 'colorScheme'> & {
    label: string;
    icon: LucideIcon;
    colorScheme: string;
  }
> = ({ label, icon, colorScheme, ...props }) => {
  const colorConfig = {
    bg: 'from-cyan-500/30 via-purple-500/20 to-pink-500/30',
    iconColor: 'text-cyan-300',
    titleColor: 'text-cyan-200/90',
    valueGradient: 'from-cyan-300 via-purple-300 to-pink-300',
    valueShadow: 'drop-shadow-[0_0_20px_rgba(6,182,212,0.3)]',
    dotColors: {
      primary: 'bg-cyan-400',
      secondary: 'bg-purple-400',
    },
  };

  return (
    <DashboardStatCard
      {...props}
      title={label}
      icon={icon}
      colorScheme={colorConfig}
    />
  );
};

export const DashboardSalesCard: React.FC<
  Omit<DashboardStatCardProps, 'children' | 'colorScheme'> & {
    label: string;
    icon: LucideIcon;
    colorScheme: string;
  }
> = ({ label, icon, colorScheme, ...props }) => {
  const colorConfig = {
    bg: 'from-amber-500/30 via-orange-500/20 to-red-500/30',
    iconColor: 'text-amber-300',
    titleColor: 'text-amber-200/90',
    valueGradient: 'from-amber-300 via-orange-300 to-red-300',
    valueShadow: 'drop-shadow-[0_0_20px_rgba(245,158,11,0.3)]',
    dotColors: {
      primary: 'bg-amber-400',
      secondary: 'bg-orange-400',
    },
  };

  return (
    <DashboardStatCard
      {...props}
      title={label}
      icon={icon}
      colorScheme={colorConfig}
    >
      {/* Success flow animation */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-pulse" />
        <div className="absolute bottom-0 right-0 w-full h-1 bg-gradient-to-l from-transparent via-orange-400 to-transparent animate-pulse animation-delay-500" />
      </div>
    </DashboardStatCard>
  );
};

export const DashboardValueCard: React.FC<
  Omit<DashboardStatCardProps, 'children' | 'colorScheme'> & {
    label: string;
    icon: LucideIcon;
    colorScheme: string;
  }
> = ({ label, icon, colorScheme, ...props }) => {
  const colorConfig = {
    bg: 'from-emerald-500/30 via-teal-500/20 to-green-500/30',
    iconColor: 'text-emerald-300',
    titleColor: 'text-emerald-200/90',
    valueGradient: 'from-emerald-300 via-teal-300 to-green-300',
    valueShadow: 'drop-shadow-[0_0_20px_rgba(16,185,129,0.3)]',
    dotColors: {
      primary: 'bg-emerald-400',
      secondary: 'bg-teal-400',
    },
  };

  return (
    <DashboardStatCard
      {...props}
      title={label}
      icon={icon}
      colorScheme={colorConfig}
    >
      {/* Temporal ripple effect */}
      <div className="absolute top-1/2 left-1/2 w-40 h-40 -translate-x-1/2 -translate-y-1/2">
        <div className="absolute inset-0 rounded-full border border-emerald-400/10 animate-ping" />
        <div className="absolute inset-4 rounded-full border border-emerald-400/15 animate-ping animation-delay-200" />
        <div className="absolute inset-8 rounded-full border border-emerald-400/20 animate-ping animation-delay-400" />
      </div>
    </DashboardStatCard>
  );
};

export const DashboardGradedCard: React.FC<
  Omit<DashboardStatCardProps, 'children' | 'colorScheme'> & {
    label: string;
    icon: LucideIcon;
    colorScheme: string;
    customGradient?: {
      from: string;
      via: string;
      to: string;
    };
  }
> = ({ label, icon, colorScheme, customGradient, ...props }) => {
  const colorConfig = {
    bg: customGradient
      ? `from-${customGradient.from} via-${customGradient.via} to-${customGradient.to}`
      : 'from-yellow-500/30 via-amber-500/20 to-orange-500/30',
    iconColor: 'text-yellow-300',
    titleColor: 'text-yellow-200/90',
    valueGradient: 'from-yellow-300 via-amber-300 to-orange-300',
    valueShadow: 'drop-shadow-[0_0_20px_rgba(234,179,8,0.3)]',
    dotColors: {
      primary: 'bg-yellow-400',
      secondary: 'bg-amber-400',
    },
  };

  return (
    <DashboardStatCard
      {...props}
      title={label}
      icon={icon}
      colorScheme={colorConfig}
    >
      {/* Achievement sparkles */}
      <div className="absolute inset-0">
        <div className="absolute top-4 right-4 w-2 h-2 bg-yellow-400 rounded-full animate-pulse shadow-lg shadow-yellow-400/50" />
        <div className="absolute top-8 right-8 w-1 h-1 bg-amber-400 rounded-full animate-pulse animation-delay-300 shadow-lg shadow-amber-400/50" />
        <div className="absolute bottom-4 left-4 w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse animation-delay-600 shadow-lg shadow-orange-400/50" />
      </div>
    </DashboardStatCard>
  );
};

export const DashboardDataCard: React.FC<
  Omit<DashboardStatCardProps, 'children' | 'colorScheme'> & {
    label: string;
    icon: LucideIcon;
    colorScheme: string;
  }
> = ({ label, icon, colorScheme, ...props }) => {
  const colorConfig = {
    bg: 'from-red-500/30 via-pink-500/20 to-rose-500/30',
    iconColor: 'text-red-300',
    titleColor: 'text-red-200/90',
    valueGradient: 'from-red-300 via-pink-300 to-rose-300',
    valueShadow: 'drop-shadow-[0_0_20px_rgba(239,68,68,0.3)]',
    dotColors: {
      primary: 'bg-red-400',
      secondary: 'bg-pink-400',
    },
  };

  return (
    <DashboardStatCard
      {...props}
      title={label}
      icon={icon}
      colorScheme={colorConfig}
    >
      {/* Database sync animation */}
      <div className="absolute bottom-2 right-2 opacity-40">
        <div className="flex space-x-1">
          <div className="w-1 h-8 bg-red-400 rounded-full animate-pulse" />
          <div className="w-1 h-6 bg-red-400 rounded-full animate-pulse animation-delay-150" />
          <div className="w-1 h-4 bg-red-400 rounded-full animate-pulse animation-delay-300" />
          <div className="w-1 h-6 bg-red-400 rounded-full animate-pulse animation-delay-450" />
          <div className="w-1 h-8 bg-red-400 rounded-full animate-pulse animation-delay-600" />
        </div>
      </div>
    </DashboardStatCard>
  );
};
