/**
 * Pokemon Modal Component - The Ultimate Dialog Engine
 * Enhanced with advanced theme integration from common/Modal
 *
 * Consolidates ALL modal patterns across the entire codebase:
 * - PokemonModal (heavily used design system)
 * - common/Modal (advanced theme integration)
 * - ConfirmModal (confirmation dialog patterns)
 * - ItemSelectorModal (selection patterns)
 * - Various specific modals (export, auction, etc.)
 *
 * Following CLAUDE.md principles:
 * - DRY: Eliminates ALL duplicate modal implementations
 * - SRP: Single definitive modal component
 * - Reusable: Works everywhere - confirmations, forms, image views, details
 * - Theme Integration: Full ThemeContext support with CSS custom properties
 */

import React, { useEffect, forwardRef } from 'react';
import { X, Check, AlertTriangle, Info } from 'lucide-react';
import { StandardModalProps, ComponentSize } from '../../types/themeTypes';
import {
  cn,
  getGlassmorphismClasses,
  getAnimationClasses,
  getA11yClasses,
} from '../../../utils/unifiedUtilities';
import { cardClasses } from '../../../utils/ui/classNameUtils';
import {
  useVisualTheme,
  useLayoutTheme,
  useAnimationTheme,
} from '../../contexts/theme';
import { PokemonButton } from './PokemonButton';

export interface PokemonModalProps extends Omit<StandardModalProps, 'size'> {
  // Base modal props
  isOpen?: boolean; // Legacy support
  open?: boolean; // Theme system support
  onClose: () => void;
  title?: string;
  children: React.ReactNode;

  // Size and layout
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  maxWidth?: ComponentSize | 'fullscreen';
  variant?: 'default' | 'glass' | 'solid' | 'center';
  centered?: boolean;

  // Behavior
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean; // Legacy support
  closeOnBackdrop?: boolean; // Theme system support
  closeOnEscape?: boolean;
  loading?: boolean;

  // Enhanced features
  footer?: React.ReactNode;
  theme?: string;
  _colorScheme?: string;
  density?: 'compact' | 'normal' | 'spacious';
  animationIntensity?: 'none' | 'reduced' | 'normal' | 'enhanced';
  testId?: string;
  className?: string;

  // Confirmation modal features (from ConfirmModal)
  confirmVariant?: 'confirm' | 'warning' | 'danger' | 'info';
  confirmTitle?: string;
  confirmMessage?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;

  // Item selector features (from ItemSelectorModal)
  searchable?: boolean;
  multiSelect?: boolean;
  items?: any[];
  onItemSelect?: (item: any) => void;
  renderItem?: (item: any) => React.ReactNode;
}

/**
 * THE definitive modal - consolidates ALL modal patterns
 * Handles: confirmations, forms, image viewers, detail dialogs, item selection, etc.
 */
export const PokemonModal = forwardRef<HTMLDivElement, PokemonModalProps>(
  (
    {
      // Base props
      isOpen, // Legacy support
      open, // Theme system support
      onClose,
      title,
      children,

      // Size and layout
      size = 'md',
      maxWidth,
      variant = 'glass',
      centered = true,

      // Behavior
      showCloseButton = true,
      closeOnOverlayClick, // Legacy support
      closeOnBackdrop, // Theme system support
      closeOnEscape = true,
      loading = false,

      // Enhanced features
      footer,
      theme,
      _colorScheme,
      density,
      animationIntensity,
      testId,
      className = '',

      // Confirmation modal features
      confirmVariant,
      confirmTitle,
      confirmMessage,
      confirmButtonText = 'Confirm',
      cancelButtonText = 'Cancel',
      onConfirm,
      onCancel,

      // Item selector features
      searchable,
      multiSelect,
      items,
      onItemSelect,
      renderItem,

      ...props
    },
    ref
  ) => {
    // Theme context integration
    const visualTheme = useVisualTheme();
    const layoutTheme = useLayoutTheme();
    const animationTheme = useAnimationTheme();

    // Resolve open state (legacy vs theme system)
    const modalOpen = open !== undefined ? open : isOpen || false;

    // Resolve close on backdrop (legacy vs theme system)
    const shouldCloseOnBackdrop =
      closeOnBackdrop !== undefined
        ? closeOnBackdrop
        : closeOnOverlayClick !== false;

    // Merge context theme with component props
    const effectiveTheme = theme || visualTheme?.visualTheme;
    const effectiveDensity = density || layoutTheme?.density;
    const effectiveAnimationIntensity =
      animationIntensity || animationTheme?.intensity;

    // Handle escape key
    useEffect(() => {
      if (!modalOpen || !closeOnEscape) return;

      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }, [modalOpen, closeOnEscape, onClose]);

    // Prevent body scroll when modal is open
    useEffect(() => {
      if (modalOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'unset';
      }

      return () => {
        document.body.style.overflow = 'unset';
      };
    }, [modalOpen]);

    if (!modalOpen) return null;

    // Size mapping with theme system support
    const resolvedMaxWidth = maxWidth || size;
    const sizeClasses = {
      sm: 'max-w-md',
      md: 'max-w-2xl',
      lg: 'max-w-4xl',
      xl: 'max-w-6xl',
      full: 'max-w-[95vw]',
      fullscreen: 'w-screen h-screen max-w-none max-h-none m-0 rounded-none',
    };

    // Variant system with theme integration
    const variantClasses = {
      default: [
        'bg-[var(--theme-surface,rgba(15,23,42,0.95))]',
        'border border-[var(--theme-border,rgba(148,163,184,0.2))]',
        'text-[var(--theme-text,#f8fafc)]',
      ].join(' '),
      glass: [
        'bg-gradient-to-br from-[var(--theme-glass-primary,rgba(15,23,42,0.8))] to-[var(--theme-glass-secondary,rgba(30,41,59,0.9))]',
        'backdrop-blur-2xl border border-[var(--theme-accent-primary,#0891b2)]/20',
        'shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] shadow-[var(--theme-accent-primary,#0891b2)]/20',
        'text-[var(--theme-text,#f8fafc)]',
      ].join(' '),
      solid: [
        'bg-[var(--theme-surface-solid,#1e293b)]',
        'border border-[var(--theme-border,rgba(148,163,184,0.3))]',
        'shadow-2xl',
        'text-[var(--theme-text,#f8fafc)]',
      ].join(' '),
      center: [
        'bg-white dark:bg-slate-800',
        'border border-slate-200 dark:border-slate-700',
        'shadow-xl',
        'text-slate-900 dark:text-slate-100',
      ].join(' '),
    };

    // Animation classes based on intensity
    const getAnimationClasses = () => {
      switch (effectiveAnimationIntensity) {
        case 'none':
          return 'transition-none';
        case 'reduced':
          return 'transition-opacity duration-200 ease-out';
        case 'enhanced':
          return 'transition-all duration-500 ease-out animate-in slide-in-from-bottom-4 fade-in-0';
        default:
          return 'transition-all duration-300 ease-out animate-in slide-in-from-bottom-2 fade-in-0';
      }
    };

    // Confirmation modal content
    const renderConfirmationContent = () => {
      if (!confirmVariant) return null;

      const iconMap = {
        confirm: Check,
        warning: AlertTriangle,
        danger: AlertTriangle,
        info: Info,
      };

      const colorMap = {
        confirm: 'text-emerald-500',
        warning: 'text-amber-500',
        danger: 'text-red-500',
        info: 'text-blue-500',
      };

      const Icon = iconMap[confirmVariant];

      return (
        <div className="text-center">
          {Icon && (
            <div
              className={cn(
                'mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center',
                colorMap[confirmVariant]
              )}
            >
              <Icon className="w-8 h-8" />
            </div>
          )}
          <h3 className="text-lg font-semibold mb-2">
            {confirmTitle || title}
          </h3>
          {confirmMessage && (
            <p className="text-sm opacity-80 mb-6">{confirmMessage}</p>
          )}
          <div className="flex gap-3 justify-center">
            <PokemonButton
              variant="outline"
              onClick={() => {
                onCancel?.();
                onClose();
              }}
            >
              {cancelButtonText}
            </PokemonButton>
            <PokemonButton
              variant={confirmVariant === 'danger' ? 'danger' : 'primary'}
              onClick={() => {
                onConfirm?.();
                onClose();
              }}
            >
              {confirmButtonText}
            </PokemonButton>
          </div>
        </div>
      );
    };

    // Item selector content
    const renderItemSelectorContent = () => {
      if (!items) return null;

      return (
        <div className="space-y-4">
          {searchable && (
            <div className="border-b border-slate-700 pb-4">
              <input
                type="text"
                placeholder="Search items..."
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white"
              />
            </div>
          )}
          <div className="max-h-96 overflow-y-auto space-y-2">
            {items.map((item, index) => (
              <div
                key={index}
                className="p-3 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 cursor-pointer transition-colors"
                onClick={() => onItemSelect?.(item)}
              >
                {renderItem ? renderItem(item) : JSON.stringify(item)}
              </div>
            ))}
          </div>
        </div>
      );
    };

    // Generate card classes from theme system
    const cardStyleClasses = cardClasses({
      variant: 'elevated',
      theme: effectiveTheme,
      colorScheme: _colorScheme,
      density: effectiveDensity,
    });

    const modalClasses = cn(
      // Base modal styles
      'relative rounded-2xl overflow-hidden',
      sizeClasses[resolvedMaxWidth],
      variantClasses[variant],
      getAnimationClasses(),
      cardStyleClasses,
      resolvedMaxWidth === 'fullscreen' ? '' : 'mx-4',
      className
    );

    return (
      <div
        data-testid={testId}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={shouldCloseOnBackdrop ? onClose : undefined}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

        {/* Modal */}
        <div
          ref={ref}
          className={modalClasses}
          onClick={(e) => e.stopPropagation()}
          {...props}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              {title && (
                <h2 className="text-xl font-bold text-white">{title}</h2>
              )}
              {showCloseButton && (
                <PokemonButton
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="ml-auto -mr-2"
                >
                  <X className="w-5 h-5" />
                </PokemonButton>
              )}
            </div>
          )}

          {/* Content */}
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {confirmVariant ? renderConfirmationContent() : null}
                {items ? renderItemSelectorContent() : null}
                {!confirmVariant && !items ? children : null}
              </>
            )}
          </div>

          {/* Footer */}
          {footer && (
            <div className="px-6 py-4 border-t border-white/10 bg-black/20">
              {footer}
            </div>
          )}
        </div>
      </div>
    );
  }
);

PokemonModal.displayName = 'PokemonModal';

// Convenience components for common patterns
export const PokemonConfirmModal: React.FC<
  Omit<PokemonModalProps, 'confirmVariant'> & {
    variant?: 'confirm' | 'warning' | 'danger' | 'info';
  }
> = ({ variant = 'confirm', ...props }) => (
  <PokemonModal {...props} confirmVariant={variant} />
);

export const PokemonItemSelectorModal = <T extends any>({
  items,
  onItemSelect,
  renderItem,
  searchable = true,
  ...props
}: Omit<PokemonModalProps, 'items' | 'onItemSelect' | 'renderItem'> & {
  items: T[];
  onItemSelect: (item: T) => void;
  renderItem?: (item: T) => React.ReactNode;
  searchable?: boolean;
}) => (
  <PokemonModal
    {...props}
    items={items}
    onItemSelect={onItemSelect}
    renderItem={renderItem}
    searchable={searchable}
  />
);
