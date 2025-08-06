/**
 * Unified Card Component - THE Card to Rule Them All
 * 
 * Following CLAUDE.md principles:
 * - DRY: Eliminates ALL card duplication across codebase
 * - SRP: Single definitive card component for ALL use cases
 * - Reusable: Works everywhere - data display, forms, lists, stats
 * - Open/Closed: Extensible through props without modification
 * 
 * Consolidates repeated card patterns from:
 * - ItemEssentialDetails (10 files)
 * - All card displays now use PokemonCard orchestrator
 * - Stats cards across Dashboard/Analytics
 * - DBA item cards
 * - Form field containers
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';

// Card style variants
export type CardVariant = 
  | 'default'      // Standard card styling
  | 'glassmorphism' // Premium glass effect
  | 'stats'        // Statistics/metrics display
  | 'product'      // Product/item display
  | 'form'         // Form field container
  | 'minimal'      // Clean minimal design
  | 'elevated'     // High shadow/elevation
  | 'cosmic';      // Space/cosmic theme

// Card sizes
export type CardSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// Badge/status indicator
export interface CardBadge {
  label: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  icon?: LucideIcon;
}

// Action button for cards
export interface CardAction {
  icon?: LucideIcon;
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  loading?: boolean;
}

export interface SectionContainerProps {
  /** Card title */
  title?: string;
  
  /** Card subtitle */
  subtitle?: string;
  
  /** Main content */
  children: React.ReactNode;
  
  /** Card variant */
  variant?: CardVariant;
  
  /** Card size */
  size?: CardSize;
  
  /** Header icon */
  icon?: LucideIcon;
  
  /** Status badges */
  badges?: CardBadge[];
  
  /** Action buttons */
  actions?: CardAction[];
  
  /** Click handler for entire card */
  onClick?: () => void;
  
  /** Whether card is clickable */
  clickable?: boolean;
  
  /** Whether card is selected/active */
  selected?: boolean;
  
  /** Whether to show divider between header and content */
  showDivider?: boolean;
  
  /** Custom className */
  className?: string;
  
  /** Data test id */
  testId?: string;
}

const SectionContainer: React.FC<SectionContainerProps> = ({
  title,
  subtitle,
  children,
  variant = 'default',
  size = 'md',
  icon: Icon,
  badges = [],
  actions = [],
  onClick,
  clickable = false,
  selected = false,
  showDivider = true,
  className = '',
  testId,
}) => {
  // Size configurations
  const sizeConfigs = {
    xs: {
      container: 'p-3',
      title: 'text-sm font-medium',
      subtitle: 'text-xs',
      icon: 'w-4 h-4',
      iconContainer: 'w-8 h-8',
    },
    sm: {
      container: 'p-4',
      title: 'text-base font-semibold',
      subtitle: 'text-sm',
      icon: 'w-5 h-5',
      iconContainer: 'w-10 h-10',
    },
    md: {
      container: 'p-6',
      title: 'text-lg font-bold',
      subtitle: 'text-base',
      icon: 'w-6 h-6',
      iconContainer: 'w-12 h-12',
    },
    lg: {
      container: 'p-8',
      title: 'text-xl font-bold',
      subtitle: 'text-lg',
      icon: 'w-7 h-7',
      iconContainer: 'w-14 h-14',
    },
    xl: {
      container: 'p-10',
      title: 'text-2xl font-bold',
      subtitle: 'text-xl',
      icon: 'w-8 h-8',
      iconContainer: 'w-16 h-16',
    },
  };

  // Variant configurations
  const variantConfigs = {
    default: {
      container: [
        'bg-white dark:bg-zinc-900',
        'border border-zinc-200 dark:border-zinc-700',
        'rounded-xl shadow-sm hover:shadow-md transition-all duration-200',
        selected && 'ring-2 ring-blue-500 border-blue-500',
        clickable && 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]'
      ].filter(Boolean).join(' '),
      header: 'text-zinc-900 dark:text-white',
      iconContainer: 'bg-zinc-100 dark:bg-zinc-800 rounded-lg',
      iconClasses: 'text-zinc-700 dark:text-zinc-300',
    },
    glassmorphism: {
      container: [
        'backdrop-blur-xl bg-gradient-to-br from-white/[0.1] via-cyan-500/[0.08] to-purple-500/[0.1]',
        'border border-white/[0.15] rounded-2xl shadow-2xl',
        'text-white relative overflow-hidden group',
        selected && 'ring-2 ring-cyan-400 border-cyan-400/50',
        clickable && 'cursor-pointer hover:scale-[1.02] hover:shadow-3xl transition-all duration-300'
      ].filter(Boolean).join(' '),
      header: 'text-white',
      iconContainer: 'bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-xl border border-white/[0.15]',
      iconClasses: 'text-cyan-300',
      effects: (
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 opacity-70 blur-2xl" />
      ),
    },
    stats: {
      container: [
        'bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/30',
        'border border-blue-200 dark:border-blue-800',
        'rounded-xl shadow-sm hover:shadow-lg transition-all duration-200',
        'text-blue-900 dark:text-blue-100',
        selected && 'ring-2 ring-blue-500',
        clickable && 'cursor-pointer hover:scale-[1.02]'
      ].filter(Boolean).join(' '),
      header: 'text-blue-900 dark:text-blue-100',
      iconContainer: 'bg-blue-600 rounded-lg shadow-md',
      iconClasses: 'text-white',
    },
    product: {
      container: [
        'bg-white dark:bg-zinc-900',
        'border border-zinc-200 dark:border-zinc-700',
        'rounded-xl shadow-sm hover:shadow-xl transition-all duration-300',
        'group relative overflow-hidden',
        selected && 'ring-2 ring-green-500 border-green-500',
        clickable && 'cursor-pointer hover:scale-[1.02] hover:-translate-y-1'
      ].filter(Boolean).join(' '),
      header: 'text-zinc-900 dark:text-white',
      iconContainer: 'bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg shadow-lg',
      iconClasses: 'text-white',
    },
    form: {
      container: [
        'bg-zinc-50 dark:bg-zinc-800/50',
        'border border-zinc-200 dark:border-zinc-700',
        'rounded-lg',
        'text-zinc-900 dark:text-white',
        selected && 'ring-2 ring-purple-500 border-purple-500',
      ].filter(Boolean).join(' '),
      header: 'text-zinc-900 dark:text-white',
      iconContainer: 'bg-purple-100 dark:bg-purple-900 rounded-lg',
      iconClasses: 'text-purple-600 dark:text-purple-400',
    },
    minimal: {
      container: [
        'bg-transparent',
        'rounded-lg',
        clickable && 'cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors',
        selected && 'bg-blue-50 dark:bg-blue-900/20',
      ].filter(Boolean).join(' '),
      header: 'text-zinc-900 dark:text-white',
      iconContainer: 'bg-zinc-100 dark:bg-zinc-800 rounded-lg',
      iconClasses: 'text-zinc-600 dark:text-zinc-400',
    },
    elevated: {
      container: [
        'bg-white dark:bg-zinc-900',
        'border border-zinc-200 dark:border-zinc-700',
        'rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300',
        'transform hover:scale-[1.01]',
        selected && 'ring-2 ring-indigo-500 border-indigo-500',
        clickable && 'cursor-pointer'
      ].filter(Boolean).join(' '),
      header: 'text-zinc-900 dark:text-white',
      iconContainer: 'bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl shadow-lg',
      iconClasses: 'text-white',
    },
    cosmic: {
      container: [
        'bg-gradient-to-br from-slate-900/95 via-purple-900/90 to-cyan-900/95',
        'border border-purple-500/30 rounded-2xl shadow-[0_0_30px_rgba(168,85,247,0.3)]',
        'text-white relative overflow-hidden',
        selected && 'ring-2 ring-purple-400 border-purple-400/50',
        clickable && 'cursor-pointer hover:scale-[1.02] hover:shadow-[0_0_50px_rgba(168,85,247,0.4)] transition-all duration-300'
      ].filter(Boolean).join(' '),
      header: 'text-white',
      iconContainer: 'bg-gradient-to-br from-purple-600/30 to-cyan-600/30 rounded-xl border border-purple-400/30',
      iconClasses: 'text-purple-300',
      effects: (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(168,85,247,0.15),transparent_70%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(6,182,212,0.1),transparent_70%)]" />
        </>
      ),
    },
  };

  const sizeConfig = sizeConfigs[size];
  const variantConfig = variantConfigs[variant];

  // Badge component
  const Badge: React.FC<{ badge: CardBadge }> = ({ badge }) => {
    const BadgeIcon = badge.icon;
    const badgeVariants = {
      default: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200',
      success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      danger: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${badgeVariants[badge.variant || 'default']}`}>
        {BadgeIcon && <BadgeIcon className="w-3 h-3" />}
        {badge.label}
      </span>
    );
  };

  return (
    <div
      data-testid={testId}
      className={`${variantConfig.container} ${sizeConfig.container} ${className}`}
      onClick={clickable ? onClick : undefined}
    >
      {/* Background effects */}
      {variantConfig.effects}
      
      <div className="relative z-10">
        {/* Header */}
        {(title || subtitle || Icon || badges.length > 0) && (
          <div className="mb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3 flex-1">
                {/* Icon */}
                {Icon && (
                  <div className={`${variantConfig.iconContainer} ${sizeConfig.iconContainer} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`${variantConfig.iconClasses} ${sizeConfig.icon}`} />
                  </div>
                )}
                
                {/* Title and subtitle */}
                {(title || subtitle) && (
                  <div className="flex-1 min-w-0">
                    {title && (
                      <h3 className={`${sizeConfig.title} ${variantConfig.header} truncate`}>
                        {title}
                      </h3>
                    )}
                    {subtitle && (
                      <p className={`${sizeConfig.subtitle} ${variantConfig.header} opacity-70 truncate mt-1`}>
                        {subtitle}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              {actions.length > 0 && (
                <div className="flex items-center space-x-2 flex-shrink-0 ml-3">
                  {actions.map((action, index) => {
                    const ActionIcon = action.icon;
                    return (
                      <button
                        key={index}
                        onClick={(e) => {
                          e.stopPropagation();
                          action.onClick();
                        }}
                        disabled={action.loading}
                        className="p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                        title={action.label}
                      >
                        {ActionIcon && <ActionIcon className="w-4 h-4" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Badges */}
            {badges.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {badges.map((badge, index) => (
                  <Badge key={index} badge={badge} />
                ))}
              </div>
            )}

            {/* Divider */}
            {showDivider && (title || subtitle || Icon || badges.length > 0) && (
              <div className="mt-4 h-px bg-current opacity-10" />
            )}
          </div>
        )}

        {/* Content */}
        <div className="relative">
          {children}
        </div>
      </div>
    </div>
  );
};

export default SectionContainer;