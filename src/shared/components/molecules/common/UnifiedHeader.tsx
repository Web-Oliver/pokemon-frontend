/**
 * Unified Header Component - THE Header to Rule Them All
 *
 * Following CLAUDE.md principles:
 * - DRY: Eliminates ALL header duplication across codebase
 * - SRP: Single definitive header component for ALL use cases
 * - Reusable: Works everywhere - pages, forms, modals, cards
 * - Open/Closed: Extensible through props without modification
 *
 * Consolidates these existing headers:
 * - GlassmorphismHeader (premium styling)
 * - DbaHeaderGalaxy (stats display)
 * - CollectionItemHeader (action buttons)
 * - FormHeader (form styling)
 * - AnalyticsHeader (analytics styling)
 * - Custom page headers (inconsistent styling)
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { PokemonButton } from '../../atoms/design-system/PokemonButton';

// Header style variants
export type HeaderVariant =
  | 'glassmorphism' // Premium glass effect (default)
  | 'cosmic' // Cosmic/space theme
  | 'minimal' // Clean minimal design
  | 'analytics' // Data/charts focused
  | 'form' // Form-specific styling
  | 'card' // Card-style header
  | 'gradient'; // Gradient background

// Header sizes
export type HeaderSize = 'sm' | 'md' | 'lg' | 'xl';

// Stat display item
export interface HeaderStat {
  icon: LucideIcon;
  label: string;
  value: string | number;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  description?: string;
}

// Action button
export interface HeaderAction {
  icon?: LucideIcon;
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'outline';
  loading?: boolean;
}

export interface UnifiedHeaderProps {
  /** Header title */
  title: string;

  /** Optional subtitle/description */
  subtitle?: string;

  /** Header icon */
  icon?: LucideIcon;

  /** Visual variant */
  variant?: HeaderVariant;

  /** Size preset */
  size?: HeaderSize;

  /** Statistics to display */
  stats?: HeaderStat[];

  /** Action buttons */
  actions?: HeaderAction[];

  /** Additional children content */
  children?: React.ReactNode;

  /** Custom className */
  className?: string;

  /** Whether to show back button */
  showBackButton?: boolean;

  /** Back button handler */
  onBack?: () => void;

  /** Whether to center content */
  centered?: boolean;

  /** Whether to show divider at bottom */
  showDivider?: boolean;
}

const UnifiedHeader: React.FC<UnifiedHeaderProps> = ({
  title,
  subtitle,
  icon: Icon,
  variant = 'glassmorphism',
  size = 'lg',
  stats = [],
  actions = [],
  children,
  className = '',
  showBackButton = false,
  onBack,
  centered = false,
  showDivider = true,
}) => {
  console.log('UnifiedHeader: Rendering with props:', { title, subtitle, variant, size, stats, actions });

  // Size configurations
  const sizeConfigs = {
    sm: {
      container: 'p-4',
      title: 'text-2xl',
      subtitle: 'text-sm',
      icon: 'w-8 h-8',
      iconContainer: 'w-12 h-12',
    },
    md: {
      container: 'p-6',
      title: 'text-3xl',
      subtitle: 'text-base',
      icon: 'w-10 h-10',
      iconContainer: 'w-16 h-16',
    },
    lg: {
      container: 'p-8 sm:p-12',
      title: 'text-4xl sm:text-5xl',
      subtitle: 'text-lg sm:text-xl',
      icon: 'w-12 h-12',
      iconContainer: 'w-20 h-20',
    },
    xl: {
      container: 'p-12 sm:p-16',
      title: 'text-5xl sm:text-6xl',
      subtitle: 'text-xl sm:text-2xl',
      icon: 'w-16 h-16',
      iconContainer: 'w-24 h-24',
    },
  };

  // Variant configurations
  const variantConfigs = {
    glassmorphism: {
      container: [
        'backdrop-blur-xl bg-gradient-to-br from-white/[0.15] via-cyan-500/[0.12] to-purple-500/[0.15]',
        'border border-white/[0.20] rounded-[2rem] shadow-2xl text-white relative overflow-hidden group',
      ],
      effects: (
        <>
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/15 to-pink-500/20 opacity-70 blur-3xl" />
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent opacity-30 group-hover:opacity-100 transition-all duration-1000 animate-pulse" />
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 opacity-80 animate-pulse" />
          <div
            className="absolute top-8 right-8 w-20 h-20 border-2 border-cyan-400/50 rounded-2xl rotate-45 animate-spin opacity-40 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
            style={{ animationDuration: '20s' }}
          />
          <div className="absolute bottom-8 left-8 w-16 h-16 border-2 border-purple-400/50 rounded-full animate-pulse opacity-40 shadow-[0_0_20px_rgba(168,85,247,0.3)]" />
        </>
      ),
      titleClasses:
        'font-black tracking-tight bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(6,182,212,0.5)]',
      subtitleClasses: 'text-cyan-100/90 font-medium leading-relaxed',
      iconContainer:
        'bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-[1.5rem] shadow-2xl border border-white/[0.15] group-hover:scale-105 transition-all duration-500',
      iconClasses: 'text-cyan-300 relative z-10 animate-pulse',
    },
    cosmic: {
      container: [
        'bg-gradient-to-br from-slate-900/95 via-purple-900/90 to-cyan-900/95',
        'border border-purple-500/30 rounded-3xl shadow-[0_0_50px_rgba(168,85,247,0.3)] text-white relative overflow-hidden',
      ],
      effects: (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(168,85,247,0.15),transparent_70%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(6,182,212,0.1),transparent_70%)]" />
        </>
      ),
      titleClasses:
        'font-bold tracking-wide bg-gradient-to-r from-purple-300 to-cyan-300 bg-clip-text text-transparent',
      subtitleClasses: 'text-purple-200/80',
      iconContainer:
        'bg-gradient-to-br from-purple-600/30 to-cyan-600/30 rounded-2xl shadow-lg border border-purple-400/30',
      iconClasses: 'text-purple-300',
    },
    minimal: {
      container: [
        'bg-white dark:bg-zinc-900',
        'border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-lg text-zinc-900 dark:text-white',
      ],
      effects: null,
      titleClasses: 'font-bold tracking-tight',
      subtitleClasses: 'text-zinc-600 dark:text-zinc-400',
      iconContainer:
        'bg-zinc-100 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700',
      iconClasses: 'text-zinc-700 dark:text-zinc-300',
    },
    analytics: {
      container: [
        'bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/30',
        'border border-blue-200 dark:border-blue-800 rounded-2xl shadow-lg text-blue-900 dark:text-blue-100',
      ],
      effects: null,
      titleClasses: 'font-bold tracking-tight',
      subtitleClasses: 'text-blue-700 dark:text-blue-300',
      iconContainer: 'bg-blue-600 rounded-xl shadow-lg',
      iconClasses: 'text-white',
    },
    form: {
      container: [
        'bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-900/20 dark:to-teal-900/30',
        'border border-emerald-200 dark:border-emerald-800 rounded-2xl shadow-lg text-emerald-900 dark:text-emerald-100',
      ],
      effects: null,
      titleClasses: 'font-bold tracking-tight',
      subtitleClasses: 'text-emerald-700 dark:text-emerald-300',
      iconContainer: 'bg-emerald-600 rounded-xl shadow-lg',
      iconClasses: 'text-white',
    },
    card: {
      container: [
        'bg-zinc-800 dark:bg-zinc-900',
        'border border-zinc-700 dark:border-zinc-600 rounded-lg shadow-lg text-white',
      ],
      effects: null,
      titleClasses: 'font-bold',
      subtitleClasses: 'text-zinc-400',
      iconContainer: 'bg-blue-600 rounded-lg',
      iconClasses: 'text-white',
    },
    gradient: {
      container: [
        'bg-gradient-to-r from-purple-600 via-pink-600 to-red-600',
        'rounded-2xl shadow-lg text-white relative overflow-hidden',
      ],
      effects: (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      ),
      titleClasses: 'font-bold tracking-tight',
      subtitleClasses: 'text-white/90',
      iconContainer: 'bg-white/20 backdrop-blur-sm rounded-xl',
      iconClasses: 'text-white',
    },
  };

  const sizeConfig = sizeConfigs[size];
  const variantConfig = variantConfigs[variant];

  // Stat item component
  const StatItem: React.FC<{ stat: HeaderStat }> = ({ stat }) => {
    const StatIcon = stat.icon;
    const variantClasses = {
      default: 'text-blue-400',
      success: 'text-green-400',
      warning: 'text-yellow-400',
      danger: 'text-red-400',
    };

    return (
      <div className="text-center">
        <StatIcon
          className={`w-4 h-4 mx-auto mb-1 ${variantClasses[stat.variant || 'default']}`}
        />
        <p className="text-xs text-zinc-400 mb-0.5">{stat.label}</p>
        <p className="text-lg font-bold text-white">{stat.value}</p>
        {stat.description && (
          <p className="text-xs text-zinc-500 mt-0.5">{stat.description}</p>
        )}
      </div>
    );
  };

  return (
    <div
      className={`${variantConfig.container.join(' ')} ${sizeConfig.container} ${className}`}
    >
      {/* Background effects */}
      {variantConfig.effects}

      <div className="relative z-10">
        {/* Main content */}
        <div
          className={`flex items-start ${centered ? 'justify-center text-center' : 'justify-between'} mb-6`}
        >
          <div className="flex items-center flex-1">
            {/* Back button */}
            {showBackButton && onBack && (
              <PokemonButton
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="mr-4 text-current hover:bg-white/10"
                startIcon={<span>←</span>}
              >
                Back
              </PokemonButton>
            )}

            {/* Icon */}
            {Icon && (
              <div
                className={`${variantConfig.iconContainer} ${sizeConfig.iconContainer} flex items-center justify-center mr-6 relative`}
              >
                <Icon
                  className={`${variantConfig.iconClasses} ${sizeConfig.icon}`}
                />
                {variant === 'glassmorphism' && (
                  <>
                    <div className="absolute inset-2 bg-gradient-to-br from-cyan-400/10 to-purple-500/10 rounded-xl blur-lg" />
                    <div
                      className="absolute inset-0 animate-spin opacity-40"
                      style={{ animationDuration: '15s' }}
                    >
                      <div className="w-2 h-2 bg-cyan-400 rounded-full absolute -top-1 left-1/2 transform -translate-x-1/2" />
                      <div className="w-1.5 h-1.5 bg-purple-400 rounded-full absolute -bottom-1 left-1/2 transform -translate-x-1/2" />
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Title and subtitle */}
            <div className="flex-1">
              <h1
                className={`${variantConfig.titleClasses} ${sizeConfig.title} mb-2`}
              >
                {title}
              </h1>
              {subtitle && (
                <p
                  className={`${variantConfig.subtitleClasses} ${sizeConfig.subtitle} flex items-center gap-3`}
                >
                  {variant === 'glassmorphism' && (
                    <span className="w-5 h-5 text-cyan-400 animate-pulse">
                      ✨
                    </span>
                  )}
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          {actions.length > 0 && !centered && (
            <div className="flex items-center space-x-3 ml-6">
              {actions.map((action, index) => {
                const ActionIcon = action.icon;
                return (
                  <PokemonButton
                    key={index}
                    variant={action.variant || 'primary'}
                    onClick={action.onClick}
                    loading={action.loading}
                    startIcon={
                      ActionIcon ? (
                        <ActionIcon className="w-4 h-4" />
                      ) : undefined
                    }
                  >
                    {action.label}
                  </PokemonButton>
                );
              })}
            </div>
          )}
        </div>

        {/* Stats grid */}
        {stats.length > 0 && (
          <div
            className={`grid gap-4 mb-6 ${stats.length <= 2 ? 'grid-cols-2' : stats.length <= 4 ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-3 md:grid-cols-5'}`}
          >
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-zinc-700/50 backdrop-blur-sm rounded-lg p-3"
              >
                <StatItem stat={stat} />
              </div>
            ))}
          </div>
        )}

        {/* Centered actions */}
        {actions.length > 0 && centered && (
          <div className="flex justify-center space-x-3 mb-6">
            {actions.map((action, index) => {
              const ActionIcon = action.icon;
              return (
                <PokemonButton
                  key={index}
                  variant={action.variant || 'primary'}
                  onClick={action.onClick}
                  loading={action.loading}
                  startIcon={
                    ActionIcon ? <ActionIcon className="w-4 h-4" /> : undefined
                  }
                >
                  {action.label}
                </PokemonButton>
              );
            })}
          </div>
        )}

        {/* Additional children */}
        {children && <div className="mt-6">{children}</div>}
      </div>

      {/* Bottom divider */}
      {showDivider && (
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-current to-transparent opacity-20" />
      )}
    </div>
  );
};

export default UnifiedHeader;
