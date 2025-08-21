/**
 * DashboardStatCard Component - Context7 2025 Award-Winning Design
 *
 * Complete redesign with cutting-edge Tabler patterns and modern dashboard aesthetics
 * Features ultra-premium glassmorphism, neo-brutalist elements, and holographic effects
 * Following CLAUDE.md + Context7 2025 principles for world-class UX
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface DashboardStatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
    glow: string;
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
    <div 
      className="group relative overflow-hidden cursor-pointer transition-all duration-700 ease-out hover:scale-[1.03] hover:rotate-1"
      onClick={onClick}
    >
      {/* Ultra-premium glassmorphism container */}
      <div className="relative h-40 bg-gradient-to-br from-white/[0.08] via-white/[0.05] to-transparent backdrop-blur-xl border border-white/[0.12] rounded-3xl shadow-2xl">
        
        {/* Holographic border animation */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 animate-pulse" />
        
        {/* Neo-brutalist status bar */}
        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${colorScheme.primary} rounded-t-3xl`} />
        
        {/* Floating geometric decorations */}
        <div className="absolute top-4 right-4 w-8 h-8 border border-white/20 rounded-lg rotate-45 opacity-30 group-hover:rotate-90 transition-transform duration-700" />
        <div className="absolute bottom-4 left-4 w-4 h-4 bg-white/10 rounded-full opacity-40 group-hover:scale-150 transition-transform duration-700" />
        
        {/* Main content */}
        <div className="relative z-10 p-6 h-full flex flex-col justify-between">
          {/* Header section */}
          <div className="flex items-start justify-between">
            {/* Icon with premium styling */}
            <div className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${colorScheme.primary} shadow-lg flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${colorScheme.glow} opacity-0 group-hover:opacity-50 blur-lg transition-opacity duration-500`} />
              <Icon className="w-7 h-7 text-white relative z-10" />
            </div>
            
            {/* Status indicator */}
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${colorScheme.accent} animate-pulse`} />
              <div className={`w-1 h-1 rounded-full ${colorScheme.accent} animate-pulse`} style={{ animationDelay: '500ms' }} />
            </div>
          </div>
          
          {/* Value section */}
          <div className="space-y-2">
            {/* Title */}
            <div className="text-xs font-bold tracking-widest uppercase text-white/70 group-hover:text-white transition-colors duration-300">
              {title}
            </div>
            
            {/* Value display */}
            <div className="relative">
              {loading ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-white/20 rounded-xl w-20" />
                  <div className="h-2 bg-white/10 rounded-lg w-16 mt-2" />
                </div>
              ) : (
                <>
                  <div className={`text-2xl font-black leading-none bg-gradient-to-r ${colorScheme.primary} bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300 drop-shadow-2xl`}
                    style={{
                      WebkitBackgroundClip: 'text',
                      backgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    {value || '0'}
                  </div>
                  {/* Subtle glow effect */}
                  <div className={`absolute inset-0 text-2xl font-black leading-none bg-gradient-to-r ${colorScheme.glow} bg-clip-text text-transparent opacity-0 group-hover:opacity-30 blur-sm transition-opacity duration-500`}
                    style={{
                      WebkitBackgroundClip: 'text',
                      backgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    {value || '0'}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Custom animations overlay */}
        {children && (
          <div className="absolute inset-0 pointer-events-none z-0 opacity-20 rounded-3xl overflow-hidden">
            {children}
          </div>
        )}
        
        {/* Premium shadow effects */}
        <div className={`absolute -inset-2 bg-gradient-to-br ${colorScheme.glow} opacity-0 group-hover:opacity-20 blur-xl rounded-3xl transition-opacity duration-700 -z-10`} />
      </div>
    </div>
  );
};

// Context7 2025 Premium Metric Card Variants
export const DashboardItemsCard: React.FC<
  Omit<DashboardStatCardProps, 'children' | 'colorScheme'> & {
    label: string;
    icon: LucideIcon;
    colorScheme: string;
  }
> = ({ label, icon, colorScheme, ...props }) => {
  const colorConfig = {
    primary: 'from-cyan-400 via-blue-500 to-purple-600',
    secondary: 'from-cyan-300 via-blue-400 to-purple-500',
    accent: 'bg-cyan-400',
    glow: 'from-cyan-500 via-blue-500 to-purple-600',
  };

  return (
    <DashboardStatCard
      {...props}
      title={label}
      icon={icon}
      colorScheme={colorConfig}
    >
      {/* Neural network animation */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/2 left-1/2 w-32 h-32 -translate-x-1/2 -translate-y-1/2">
          <div className="absolute inset-0 rounded-full border border-cyan-400/20 animate-ping" />
          <div className="absolute inset-4 rounded-full border border-cyan-400/30 animate-ping" style={{ animationDelay: '1s' }} />
          <div className="absolute inset-8 rounded-full border border-cyan-400/40 animate-ping" style={{ animationDelay: '2s' }} />
        </div>
      </div>
    </DashboardStatCard>
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
    primary: 'from-amber-400 via-orange-500 to-red-600',
    secondary: 'from-amber-300 via-orange-400 to-red-500',
    accent: 'bg-amber-400',
    glow: 'from-amber-500 via-orange-500 to-red-600',
  };

  return (
    <DashboardStatCard
      {...props}
      title={label}
      icon={icon}
      colorScheme={colorConfig}
    >
      {/* Temporal flow animation */}
      <div className="absolute inset-0 opacity-25">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-pulse" />
        <div className="absolute top-2 right-0 w-full h-px bg-gradient-to-l from-transparent via-orange-400 to-transparent animate-pulse" style={{ animationDelay: '0.5s' }} />
        <div className="absolute bottom-2 left-0 w-full h-px bg-gradient-to-r from-transparent via-red-400 to-transparent animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-0 right-0 w-full h-px bg-gradient-to-l from-transparent via-amber-400 to-transparent animate-pulse" style={{ animationDelay: '1.5s' }} />
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
    primary: 'from-emerald-400 via-teal-500 to-green-600',
    secondary: 'from-emerald-300 via-teal-400 to-green-500',
    accent: 'bg-emerald-400',
    glow: 'from-emerald-500 via-teal-500 to-green-600',
  };

  return (
    <DashboardStatCard
      {...props}
      title={label}
      icon={icon}
      colorScheme={colorConfig}
    >
      {/* Quantum value ripple effect */}
      <div className="absolute top-1/2 left-1/2 w-36 h-36 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <div className="absolute inset-0 rounded-full border border-emerald-400/15 animate-ping" style={{ animationDuration: '3s' }} />
        <div className="absolute inset-6 rounded-full border border-teal-400/20 animate-ping" style={{ animationDuration: '3s', animationDelay: '1s' }} />
        <div className="absolute inset-12 rounded-full border border-green-400/25 animate-ping" style={{ animationDuration: '3s', animationDelay: '2s' }} />
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
    primary: 'from-yellow-400 via-amber-500 to-orange-600',
    secondary: 'from-yellow-300 via-amber-400 to-orange-500', 
    accent: 'bg-yellow-400',
    glow: 'from-yellow-500 via-amber-500 to-orange-600',
  };

  return (
    <DashboardStatCard
      {...props}
      title={label}
      icon={icon}
      colorScheme={colorConfig}
    >
      {/* Elite achievement sparkles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-6 right-6 w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse shadow-lg shadow-yellow-400/60" style={{ animationDuration: '2s' }} />
        <div className="absolute top-10 right-10 w-1 h-1 bg-amber-400 rounded-full animate-pulse shadow-lg shadow-amber-400/60" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }} />
        <div className="absolute bottom-6 left-6 w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse shadow-lg shadow-orange-400/60" style={{ animationDuration: '3s', animationDelay: '1s' }} />
        <div className="absolute bottom-10 left-10 w-0.5 h-0.5 bg-yellow-400 rounded-full animate-pulse shadow-lg shadow-yellow-400/60" style={{ animationDuration: '2.2s', animationDelay: '1.5s' }} />
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
    primary: 'from-red-400 via-pink-500 to-rose-600',
    secondary: 'from-red-300 via-pink-400 to-rose-500',
    accent: 'bg-red-400',
    glow: 'from-red-500 via-pink-500 to-rose-600',
  };

  return (
    <DashboardStatCard
      {...props}
      title={label}
      icon={icon}
      colorScheme={colorConfig}
    >
      {/* Quantum data stream visualization */}
      <div className="absolute bottom-4 right-4 flex space-x-0.5 pointer-events-none">
        <div className="w-0.5 h-5 bg-red-400/60 rounded-full animate-pulse" style={{ animationDuration: '1.2s' }} />
        <div className="w-0.5 h-3 bg-pink-400/50 rounded-full animate-pulse" style={{ animationDuration: '1.4s', animationDelay: '0.2s' }} />
        <div className="w-0.5 h-4 bg-rose-400/55 rounded-full animate-pulse" style={{ animationDuration: '1.1s', animationDelay: '0.4s' }} />
        <div className="w-0.5 h-6 bg-red-400/65 rounded-full animate-pulse" style={{ animationDuration: '1.3s', animationDelay: '0.6s' }} />
        <div className="w-0.5 h-2 bg-pink-400/45 rounded-full animate-pulse" style={{ animationDuration: '1.5s', animationDelay: '0.8s' }} />
        <div className="w-0.5 h-4 bg-rose-400/55 rounded-full animate-pulse" style={{ animationDuration: '1.2s', animationDelay: '1s' }} />
      </div>
    </DashboardStatCard>
  );
};
