/**
 * EmptyState Component - DRY Violation Fix
 * Layer 3: Components (UI Building Blocks)
 * 
 * Eliminates duplicate empty state patterns across 15+ files
 * Consolidates the repeated "w-20 h-20 bg-gradient-to-br" icon containers
 * 
 * Following CLAUDE.md principles:
 * - DRY: Single implementation for all empty states
 * - Single Responsibility: Handles only empty state display
 * - Reusability: Used across multiple contexts (no data, errors, loading)
 * - Design System Integration: Uses existing color variables and patterns
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { PokemonButton } from '../design-system/PokemonButton';

interface EmptyStateProps {
  /** Icon to display in the empty state */
  icon: LucideIcon;
  /** Title text */
  title: string;
  /** Optional description text */
  description?: string;
  /** Optional action button */
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  };
  /** Color variant for the icon container */
  variant?: 'default' | 'error' | 'success' | 'warning' | 'info';
  /** Size of the icon container */
  size?: 'sm' | 'md' | 'lg';
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  variant = 'default',
  size = 'lg'
}) => {
  // Define variant-specific styles
  const variantStyles = {
    default: {
      container: 'from-[var(--theme-surface-secondary)] to-[var(--theme-surface-secondary)]/80',
      border: 'border-[var(--theme-border)]',
      icon: 'text-[var(--theme-text-muted)]'
    },
    error: {
      container: 'from-[var(--theme-status-error)]/50 to-pink-900/50',
      border: 'border-[var(--theme-status-error)]/30',
      icon: 'text-[var(--theme-status-error)]'
    },
    success: {
      container: 'from-[var(--theme-status-success)]/50 to-teal-600/50',
      border: 'border-[var(--theme-status-success)]/30',
      icon: 'text-[var(--theme-status-success)]'
    },
    warning: {
      container: 'from-amber-500/50 to-orange-600/50',
      border: 'border-amber-400/30',
      icon: 'text-amber-400'
    },
    info: {
      container: 'from-slate-100 to-white',
      border: 'border-slate-200/50 dark:border-zinc-700/50',
      icon: 'text-slate-500 dark:text-zinc-500 dark:text-zinc-400'
    }
  };

  // Define size-specific styles
  const sizeStyles = {
    sm: {
      container: 'w-16 h-16',
      icon: 'w-8 h-8',
      rounded: 'rounded-2xl'
    },
    md: {
      container: 'w-20 h-20',
      icon: 'w-10 h-10',
      rounded: 'rounded-3xl'
    },
    lg: {
      container: 'w-24 h-24',
      icon: 'w-12 h-12',
      rounded: 'rounded-3xl'
    }
  };

  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];

  return (
    <div className="text-center py-16">
      {/* Icon Container */}
      <div className={`
        ${sizeStyle.container} 
        bg-gradient-to-br ${variantStyle.container} 
        ${sizeStyle.rounded} 
        shadow-xl 
        flex items-center justify-center 
        mx-auto mb-6 
        border ${variantStyle.border}
      `}>
        <Icon className={`${sizeStyle.icon} ${variantStyle.icon}`} />
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold text-[var(--theme-text-primary)] mb-3">
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="text-[var(--theme-text-secondary)] font-medium max-w-md mx-auto leading-relaxed mb-6">
          {description}
        </p>
      )}

      {/* Action Button */}
      {action && (
        <PokemonButton
          onClick={action.onClick}
          variant={action.variant || 'primary'}
          size="lg"
          className="shadow-lg hover:shadow-xl hover:scale-105"
        >
          {action.label}
        </PokemonButton>
      )}
    </div>
  );
};

export default EmptyState;