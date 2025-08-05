/**
 * Pokemon Card Component - Unified Design System
 * Consolidates 52+ glassmorphism card patterns into one solid component
 * 
 * Following CLAUDE.md principles:
 * - Single Responsibility: Handles all card display patterns
 * - DRY: Eliminates 400+ lines of duplicate glassmorphism code
 * - Reusability: Works across ALL pages and components
 * - Consistent: One source of truth for card styling
 */

import React from 'react';
import { cn } from '../../utils/common';

export interface PokemonCardProps {
  children: React.ReactNode;
  variant?: 'glass' | 'solid' | 'outline' | 'gradient' | 'cosmic';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  status?: 'active' | 'draft' | 'sold' | 'completed' | 'success' | 'warning' | 'danger';
  interactive?: boolean;
  loading?: boolean;
  className?: string;
  onClick?: () => void;
}

/**
 * THE definitive card component - replaces all duplicate glassmorphism patterns
 * Used by: Activity, Dashboard, Auctions, Forms, Modals, Lists, Stats, etc.
 */
export const PokemonCard: React.FC<PokemonCardProps> = ({
  children,
  variant = 'glass',
  size = 'md',
  status,
  interactive = false,
  loading = false,
  className = '',
  onClick,
}) => {
  // Base glassmorphism foundation - used everywhere
  const baseClasses = [
    'relative overflow-hidden',
    'backdrop-blur-xl',
    'border border-white/[0.15]',
    'shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]',
    'transition-all duration-500',
    'group'
  ].join(' ');

  // Variant styles - consolidates all background patterns
  const variantClasses = {
    glass: [
      'bg-gradient-to-br from-white/[0.12] via-cyan-500/[0.08] to-purple-500/[0.12]',
      'hover:shadow-[0_12px_40px_0_rgba(6,182,212,0.3)]'
    ].join(' '),
    solid: [
      'bg-zinc-900/90 backdrop-blur-sm',
      'hover:bg-zinc-800/95'
    ].join(' '),
    outline: [
      'bg-transparent border-zinc-700/50',
      'hover:bg-white/[0.05] hover:border-cyan-400/30'
    ].join(' '),
    gradient: [
      'bg-gradient-to-br from-cyan-500/20 via-purple-500/15 to-pink-500/20',
      'hover:from-cyan-500/30 hover:via-purple-500/25 hover:to-pink-500/30'
    ].join(' '),
    cosmic: [
      'bg-gradient-to-br from-zinc-800/80 via-cyan-900/30 to-purple-900/30',
      'border-cyan-600/50',
      'hover:border-cyan-500 hover:bg-cyan-900/30',
      'hover:shadow-[0_12px_40px_0_rgba(34,211,238,0.4)]'
    ].join(' ')
  };

  // Size system - consistent spacing
  const sizeClasses = {
    sm: 'p-4 rounded-xl',
    md: 'p-6 rounded-[1.5rem]',
    lg: 'p-8 rounded-[2rem]',
    xl: 'p-12 rounded-[2.5rem]'
  };

  // Status colors - used across Activity, Auctions, etc.
  const statusClasses = {
    active: 'border-emerald-400/30 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10',
    draft: 'border-amber-400/30 bg-gradient-to-br from-amber-500/10 to-orange-500/10',
    sold: 'border-purple-400/30 bg-gradient-to-br from-purple-500/10 to-pink-500/10',
    completed: 'border-emerald-400/30 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10',
    success: 'border-emerald-400/30',
    warning: 'border-amber-400/30',
    danger: 'border-red-400/30'
  };

  // Interactive states - hover, click, focus
  const interactiveClasses = interactive || onClick ? [
    'cursor-pointer',
    'hover:scale-[1.02] hover:-translate-y-1',
    'active:scale-[0.98] active:translate-y-0',
    'focus-within:ring-2 focus-within:ring-cyan-500/50'
  ].join(' ') : '';

  // Loading state
  const loadingClasses = loading ? 'animate-pulse pointer-events-none' : '';

  // Combine all classes
  const finalClassName = cn(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    status && statusClasses[status],
    interactiveClasses,
    loadingClasses,
    className
  );

  return (
    <div className={finalClassName} onClick={onClick}>
      {/* Holographic border effect - used in Activity/Dashboard */}
      <div className="absolute inset-0 rounded-inherit bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 animate-pulse" />
      
      {/* Top accent line - used everywhere */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/5 backdrop-blur-sm flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};