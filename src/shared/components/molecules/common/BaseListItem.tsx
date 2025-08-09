/**
 * BaseListItem Component - Generic List Item Foundation
 * Layer 3: Components (CLAUDE.md Architecture)
 * 
 * Following CLAUDE.md principles:
 * - Single Responsibility: Generic list item component for reusable list patterns
 * - DRY: Base list implementation to avoid duplication across list variants
 * - Reusability: Configurable list item component for different use cases
 * - Integration: Works with existing theme system and design patterns
 */

import React from 'react';
import { cn } from '../../../utils/helpers/common';
import { useCentralizedTheme, themeUtils } from '../../../utils/ui/themeConfig';

export interface BaseListItemProps {
  children?: React.ReactNode;
  
  // Core list item properties
  variant?: 'default' | 'glass' | 'hover' | 'timeline' | 'card';
  size?: 'sm' | 'md' | 'lg';
  
  // Interactive states
  interactive?: boolean;
  loading?: boolean;
  disabled?: boolean;
  selected?: boolean;
  
  // Visual enhancements
  showBorder?: boolean;
  showHoverEffect?: boolean;
  showTimeline?: boolean;
  
  // Event handlers
  onClick?: () => void;
  onHover?: () => void;
  
  // Accessibility
  'aria-label'?: string;
  role?: string;
  
  // Custom styling
  className?: string;
  
  // Content sections
  leading?: React.ReactNode;  // Icon, avatar, thumbnail
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  trailing?: React.ReactNode; // Actions, badges, prices
  
  // Timeline specific props
  timelineColor?: string;
  timelineIcon?: React.ReactNode;
  
  // Key for list rendering
  itemKey?: string;
}

/**
 * Generic BaseListItem component for consistent list item patterns
 * Provides flexible foundation for various list item implementations
 */
export const BaseListItem: React.FC<BaseListItemProps> = ({
  children,
  variant = 'default',
  size = 'md',
  interactive = false,
  loading = false,
  disabled = false,
  selected = false,
  showBorder = false,
  showHoverEffect = true,
  showTimeline = false,
  onClick,
  onHover,
  'aria-label': ariaLabel,
  role,
  className = '',
  leading,
  title,
  subtitle,
  trailing,
  timelineColor = 'cyan',
  timelineIcon,
  itemKey,
}) => {
  const themeConfig = useCentralizedTheme();
  const shouldDisableAnimations = themeUtils.shouldDisableAnimations(themeConfig);
  const shouldShowEffects = themeUtils.shouldShowParticles(themeConfig);
  const isHighContrast = themeUtils.isHighContrast(themeConfig);

  // Base list item styling - consistent foundation
  const baseClasses = [
    'relative',
    'group',
    'transition-all duration-300 ease-out',
    disabled && 'opacity-50 pointer-events-none',
    !shouldDisableAnimations && 'transform-gpu',
    loading && 'animate-pulse pointer-events-none',
  ].filter(Boolean).join(' ');

  // Variant-specific styling
  const variantClasses = {
    default: [
      'border-b border-transparent',
      showBorder && 'border-zinc-700/20',
      isHighContrast && 'border-white/20',
    ].filter(Boolean).join(' '),
    
    glass: [
      'backdrop-blur-sm',
      'bg-gradient-to-r from-white/[0.02] to-white/[0.05]',
      'border border-white/[0.05]',
      'rounded-lg',
      'mb-2',
      isHighContrast && 'bg-white/10 border-white/20',
    ].filter(Boolean).join(' '),
    
    hover: [
      'border-b border-transparent',
      'hover:bg-gradient-to-r hover:from-cyan-500/5 hover:to-purple-500/5',
      'hover:border-cyan-500/20',
      isHighContrast && 'hover:bg-white/10',
    ].filter(Boolean).join(' '),
    
    timeline: [
      'relative',
      'mb-6',
      'backdrop-blur-xl',
      'bg-gradient-to-br from-white/[0.12] via-cyan-500/[0.05] to-purple-500/[0.08]',
      'border border-white/[0.15]',
      'rounded-2xl',
      'shadow-[0_8px_32px_0_rgba(6,182,212,0.15)]',
      'hover:shadow-[0_12px_40px_0_rgba(6,182,212,0.25)]',
      'transition-all duration-500',
      'group',
      isHighContrast && 'bg-white/20 border-white/30',
    ].filter(Boolean).join(' '),
    
    card: [
      'backdrop-blur-xl',
      'bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-white/[0.08]',
      'border border-white/[0.12]',
      'rounded-2xl',
      'shadow-[0_8px_32px_0_rgba(31,38,135,0.25)]',
      'mb-4',
      isHighContrast && 'bg-white/15 border-white/30',
    ].filter(Boolean).join(' '),
  };

  // Size-based spacing
  const sizeClasses = {
    sm: 'px-4 py-3',
    md: 'px-6 py-4',
    lg: 'px-8 py-6',
  };

  // Interactive states
  const interactiveClasses = (interactive || onClick) && !disabled ? [
    'cursor-pointer',
    showHoverEffect && [
      !shouldDisableAnimations && 'hover:scale-[1.01]',
      'hover:shadow-lg',
    ].filter(Boolean).join(' '),
    'focus-visible:outline-none',
    'focus-visible:ring-2',
    'focus-visible:ring-cyan-500/50',
    'focus-visible:ring-offset-2',
    'focus-visible:ring-offset-zinc-900',
  ].filter(Boolean).join(' ') : '';

  // Selection state
  const selectedClasses = selected ? [
    'bg-cyan-500/10',
    'border-cyan-500/30',
    'shadow-[0_0_20px_rgba(34,211,238,0.15)]',
  ].join(' ') : '';

  // Timeline accent styling
  const timelineAccentClasses = showTimeline ? [
    'before:absolute before:left-0 before:top-0 before:h-full before:w-[2px]',
    'before:bg-gradient-to-b before:from-transparent before:via-current before:to-transparent',
    timelineColor === 'cyan' && 'before:text-cyan-400/30',
    timelineColor === 'purple' && 'before:text-purple-400/30',
    timelineColor === 'emerald' && 'before:text-emerald-400/30',
    'before:opacity-0 before:group-hover:opacity-100 before:transition-opacity before:duration-500',
  ].filter(Boolean).join(' ') : '';

  // Combine all classes
  const finalClassName = cn(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    interactiveClasses,
    selectedClasses,
    timelineAccentClasses,
    className
  );

  // Event handlers
  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  const handleMouseEnter = () => {
    if (!disabled && onHover) {
      onHover();
    }
  };

  // Render content sections or children
  const renderContent = () => {
    // If children are provided, render them directly
    if (children) {
      return children;
    }

    // Otherwise, render structured content sections
    return (
      <div className="flex items-center space-x-4">
        {/* Leading section (icon, avatar, thumbnail) */}
        {leading && (
          <div className="flex-shrink-0">
            {leading}
          </div>
        )}

        {/* Main content section */}
        <div className="flex-1 min-w-0">
          {title && (
            <div className="text-base font-medium text-[var(--theme-text-primary)] group-hover:text-cyan-200 transition-colors">
              {title}
            </div>
          )}
          {subtitle && (
            <div className="text-sm text-[var(--theme-text-secondary)] mt-1">
              {subtitle}
            </div>
          )}
        </div>

        {/* Trailing section (actions, badges, prices) */}
        {trailing && (
          <div className="flex-shrink-0">
            {trailing}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      key={itemKey}
      className={finalClassName}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      aria-label={ariaLabel}
      role={role || (onClick ? 'button' : 'listitem')}
      tabIndex={interactive && !disabled ? 0 : undefined}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && onClick && !disabled) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {/* Timeline icon container - only for timeline variant */}
      {showTimeline && timelineIcon && (
        <div className="absolute -left-2 top-6">
          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-cyan-400/30 to-purple-400/30 flex items-center justify-center">
            {timelineIcon}
          </div>
        </div>
      )}

      {/* Subtle hover effect - only if effects enabled */}
      {shouldShowEffects && !isHighContrast && showHoverEffect && (
        <div className="absolute inset-0 rounded-inherit bg-gradient-to-r from-transparent via-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      )}

      {/* Content area */}
      <div className="relative z-10">
        {renderContent()}
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center rounded-inherit">
          <div className="w-4 h-4 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};

export default BaseListItem;