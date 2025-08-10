/**
 * EmptyState Component - Unified Empty State Implementation
 * Layer 3: Components (UI Building Blocks)
 *
 * Consolidates all empty state patterns including DBA variants:
 * - Eliminates duplicate empty state patterns across 15+ files
 * - Consolidates DbaEmptyState, DbaEmptyStateCosmic, UnifiedDbaEmptyState
 * - Supports both standard and cosmic/premium variants
 *
 * Following CLAUDE.md principles:
 * - DRY: Single implementation for all empty states
 * - Single Responsibility: Handles only empty state display
 * - Reusability: Used across multiple contexts (no data, errors, loading, DBA)
 * - Design System Integration: Uses existing color variables and patterns
 */

import React from 'react';
import { LucideIcon, Sparkles, Star } from 'lucide-react';
import { PokemonButton } from '../../atoms/design-system/PokemonButton';

interface EmptyStateProps {
  /** Icon to display in the empty state */
  icon?: LucideIcon;
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
  /** Style variant for the empty state */
  variant?:
    | 'default'
    | 'error'
    | 'success'
    | 'warning'
    | 'info'
    | 'cosmic'
    | 'premium';
  /** Size of the icon container */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** DBA-specific props for backward compatibility */
  psaCardsLength?: number;
  rawCardsLength?: number;
  sealedProductsLength?: number;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  variant = 'default',
  size = 'lg',
  psaCardsLength,
  rawCardsLength,
  sealedProductsLength,
}) => {
  // DBA empty state logic: only show if all collections are empty
  if (
    typeof psaCardsLength === 'number' &&
    typeof rawCardsLength === 'number' &&
    typeof sealedProductsLength === 'number'
  ) {
    if (psaCardsLength > 0 || rawCardsLength > 0 || sealedProductsLength > 0) {
      return null;
    }
  }

  // Use default icons for cosmic/premium variants if none provided
  const getDefaultIcon = () => {
    if (variant === 'cosmic' || variant === 'premium') {
      return Sparkles;
    }
    if (variant === 'default' && !Icon) {
      return Star;
    }
    return Icon;
  };

  const FinalIcon = getDefaultIcon();

  // Define variant-specific styles
  const variantStyles = {
    default: {
      container:
        'from-[var(--theme-surface-secondary)] to-[var(--theme-surface-secondary)]/80',
      border: 'border-[var(--theme-border)]',
      icon: 'text-[var(--theme-text-muted)]',
      background: '',
      shimmer: '',
    },
    error: {
      container: 'from-[var(--theme-status-error)]/50 to-pink-900/50',
      border: 'border-[var(--theme-status-error)]/30',
      icon: 'text-[var(--theme-status-error)]',
      background: '',
      shimmer: '',
    },
    success: {
      container: 'from-[var(--theme-status-success)]/50 to-teal-600/50',
      border: 'border-[var(--theme-status-success)]/30',
      icon: 'text-[var(--theme-status-success)]',
      background: '',
      shimmer: '',
    },
    warning: {
      container: 'from-amber-500/50 to-orange-600/50',
      border: 'border-amber-400/30',
      icon: 'text-amber-400',
      background: '',
      shimmer: '',
    },
    info: {
      container: 'from-slate-100 to-white',
      border: 'border-slate-200/50 dark:border-zinc-700/50',
      icon: 'text-slate-500 dark:text-zinc-500 dark:text-zinc-400',
      background: '',
      shimmer: '',
    },
    cosmic: {
      container: 'from-violet-500/20 to-pink-500/20',
      border: 'border-violet-400/30',
      icon: 'text-violet-400',
      background:
        'bg-gradient-to-br from-violet-900/80 via-purple-900/70 to-pink-900/80 backdrop-blur-3xl shadow-[0_0_80px_rgba(139,92,246,0.2)]',
      shimmer:
        'bg-gradient-to-r from-transparent via-violet-400/5 to-transparent',
    },
    premium: {
      container: 'from-blue-500/20 to-purple-500/20',
      border: 'border-blue-400/30',
      icon: 'text-blue-400',
      background:
        'bg-gradient-to-br from-blue-900/80 via-indigo-900/70 to-purple-900/80 backdrop-blur-3xl shadow-[0_0_80px_rgba(59,130,246,0.2)]',
      shimmer:
        'bg-gradient-to-r from-transparent via-blue-400/5 to-transparent',
    },
  };

  // Define size-specific styles
  const sizeStyles = {
    sm: {
      container: 'w-16 h-16',
      icon: 'w-8 h-8',
      rounded: 'rounded-2xl',
      padding: 'py-8',
      title: 'text-lg',
      description: 'text-sm',
    },
    md: {
      container: 'w-20 h-20',
      icon: 'w-10 h-10',
      rounded: 'rounded-3xl',
      padding: 'py-12',
      title: 'text-xl',
      description: 'text-base',
    },
    lg: {
      container: 'w-24 h-24',
      icon: 'w-12 h-12',
      rounded: 'rounded-3xl',
      padding: 'py-16',
      title: 'text-xl',
      description: 'text-base',
    },
    xl: {
      container: 'w-32 h-32',
      icon: 'w-16 h-16',
      rounded: 'rounded-3xl',
      padding: 'py-20',
      title: 'text-3xl',
      description: 'text-lg',
    },
  };

  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];

  // Cosmic/Premium variants use special layout
  if (variant === 'cosmic' || variant === 'premium') {
    return (
      <div className="relative group overflow-hidden">
        {/* Holographic background */}
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/15 via-purple-500/15 to-pink-500/15 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-700"></div>

        <div
          className={`relative ${variantStyle.background} rounded-3xl border ${variantStyle.border} ${sizeStyle.padding}`}
        >
          {/* Shimmer effect */}
          <div
            className={`absolute inset-0 ${variantStyle.shimmer} -translate-x-full group-hover:translate-x-full transition-transform duration-2000 ease-out rounded-3xl`}
          ></div>

          <div className="relative z-10 text-center">
            {/* Cosmic icon */}
            <div className="relative mb-12">
              <div
                className={`${sizeStyle.container} bg-gradient-to-r ${variantStyle.container} rounded-full mx-auto mb-8 flex items-center justify-center border-4 ${variantStyle.border} backdrop-blur-sm`}
              >
                <div className="relative">
                  {FinalIcon && (
                    <FinalIcon
                      className={`${sizeStyle.icon} ${variantStyle.icon}`}
                    />
                  )}
                  {/* Floating particles around icon */}
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-1 h-1 bg-gradient-to-r from-violet-400 to-pink-400 rounded-full animate-bounce opacity-60"
                      style={{
                        left: `${Math.random() * 100 - 50}px`,
                        top: `${Math.random() * 100 - 50}px`,
                        animationDelay: `${i * 0.3}s`,
                        animationDuration: `${2 + Math.random() * 2}s`,
                      }}
                    ></div>
                  ))}
                </div>
              </div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-500/10 to-pink-500/10 blur-2xl animate-pulse"></div>
            </div>

            <h3 className={`${sizeStyle.title} font-bold text-white mb-4`}>
              {title}
            </h3>
            <p
              className={`${sizeStyle.description} text-zinc-400 max-w-md mx-auto mb-6`}
            >
              {description ||
                'Add items to your collection to start exporting to DBA.dk'}
            </p>

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

            {!action && (
              <div className="inline-flex items-center px-4 py-2 bg-zinc-800 border border-zinc-600 rounded-lg">
                <Star className="w-4 h-4 text-zinc-400 mr-2" />
                <span className="text-zinc-300 text-sm">
                  Add items to get started
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Standard variants use original layout
  return (
    <div className={`text-center ${sizeStyle.padding}`}>
      {/* Icon Container */}
      <div
        className={`
        ${sizeStyle.container} 
        bg-gradient-to-br ${variantStyle.container} 
        ${sizeStyle.rounded} 
        shadow-xl 
        flex items-center justify-center 
        mx-auto mb-6 
        border ${variantStyle.border}
      `}
      >
        {FinalIcon && (
          <FinalIcon className={`${sizeStyle.icon} ${variantStyle.icon}`} />
        )}
      </div>

      {/* Title */}
      <h3
        className={`${sizeStyle.title} font-bold text-[var(--theme-text-primary)] mb-3`}
      >
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p
          className={`${sizeStyle.description} text-[var(--theme-text-secondary)] font-medium max-w-md mx-auto leading-relaxed mb-6`}
        >
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
