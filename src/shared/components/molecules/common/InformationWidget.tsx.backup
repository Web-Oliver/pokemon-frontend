/**
 * InformationWidget Component - For Stats and Info Display
 * Layer 3: Components (CLAUDE.md Architecture)
 *
 * Following CLAUDE.md principles:
 * - Single Responsibility: Displays statistical/informational data
 * - DRY: Reusable info widget for stats, counters, indicators
 * - Integration: Works with unified design system
 *
 * UNIFIED DESIGN SYSTEM:
 * - Glassmorphism: white/10 backgrounds with backdrop-blur-sm
 * - Borders: white/20 base with cyan-400/30 hover states
 * - Shadows: Consistent patterns with cyan accent glows
 * - Transitions: 300ms ease-out for smooth interactions
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../../utils';

export interface InformationWidgetProps {
  // Content
  title?: string;
  value?: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  
  // Styling
  variant?: 'glass' | 'solid' | 'outline' | 'gradient';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  status?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  
  // Interactive
  interactive?: boolean;
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  
  // Custom
  className?: string;
}

export const InformationWidget: React.FC<InformationWidgetProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'glass',
  size = 'md',
  status = 'default',
  interactive = false,
  loading = false,
  disabled = false,
  onClick,
  className = '',
}) => {
  const baseClasses = [
    'relative overflow-hidden backdrop-blur-xl border shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] group',
    'bg-gradient-to-br from-white/[0.12] via-cyan-500/[0.08] to-purple-500/[0.12]',
    'transition-all duration-300',
    'rounded-[1.5rem]',
    interactive && !disabled && [
      'cursor-pointer',
      'hover:scale-[1.02] hover:-translate-y-1',
      'active:scale-[0.98] active:translate-y-0',
      'hover:shadow-[0_12px_40px_0_rgba(6,182,212,0.3)]',
      'focus-within:ring-2 focus-within:ring-cyan-500/50',
    ],
    disabled && 'opacity-50 pointer-events-none',
    loading && 'animate-pulse',
  ].flat().filter(Boolean).join(' ');

  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6', 
    lg: 'p-8',
    xl: 'p-10'
  };

  const borderClasses = {
    default: 'border-white/10 hover:border-white/20',
    success: 'border-emerald-400/30 hover:border-emerald-400/50',
    warning: 'border-amber-400/30 hover:border-amber-400/50', 
    danger: 'border-red-400/30 hover:border-red-400/50',
    info: 'border-cyan-400/30 hover:border-cyan-400/50',
  };

  const statusColors = {
    default: 'text-white',
    success: 'text-emerald-400',
    warning: 'text-amber-400',
    danger: 'text-red-400', 
    info: 'text-cyan-400',
  };

  return (
    <div
      className={cn(
        baseClasses,
        sizeClasses[size],
        borderClasses[status],
        className
      )}
      onClick={onClick}
    >
      {/* Hover effects */}
      <div className="absolute inset-0 rounded-inherit bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 animate-pulse" />
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Content */}
      <div className="relative z-10">
        <div className="flex flex-col items-center text-center space-y-4">
          {Icon && (
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
              <Icon className="w-7 h-7 text-white" />
            </div>
          )}
          
          <div className="space-y-1">
            {value !== undefined && (
              <div className={cn(
                "text-4xl font-black group-hover:text-emerald-400 transition-colors duration-300",
                statusColors[status]
              )}>
                {loading ? '...' : value}
              </div>
            )}
            
            {title && (
              <div className="text-sm font-semibold uppercase tracking-wider text-white/70 group-hover:text-white transition-colors duration-300">
                {title}
              </div>
            )}
            
            {subtitle && (
              <div className="text-xs text-white/50">
                {subtitle}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InformationWidget;