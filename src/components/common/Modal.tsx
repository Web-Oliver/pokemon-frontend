/**
 * Theme-Aware Modal Component
 * Phase 2.1.4: Migrated to unified theme system with enhanced functionality
 *
 * Following CLAUDE.md + Context7 principles + Unified Theme System:
 * - Standardized prop interfaces from themeTypes.ts
 * - Theme-aware styling with CSS custom properties
 * - Consistent variant system across all components
 * - Premium visual effects through centralized utilities
 * - Full integration with ThemeContext for dynamic theming
 * - Backward compatibility with existing usage patterns
 */

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { StandardModalProps, ComponentSize } from '../../types/themeTypes';
import { cn } from '../../utils/themeUtils';
import { cardClasses } from '../../utils/classNameUtils';
import { useVisualTheme, useLayoutTheme, useAnimationTheme } from '../../contexts/theme';

export interface ModalProps extends Omit<StandardModalProps, 'size'> {
  maxWidth?: ComponentSize | 'fullscreen';
}

const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  children,
  maxWidth = 'md',
  size = 'md',
  centered = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
  showCloseButton = true,
  theme,
  _colorScheme,
  density,
  animationIntensity,
  className = '',
  testId,
}) => {
  const visualTheme = useVisualTheme();
  const layoutTheme = useLayoutTheme();
  const animationTheme = useAnimationTheme();

  // Merge context theme with component props
  const effectiveTheme = theme || visualTheme?.visualTheme;
  const effectiveDensity = density || layoutTheme?.density;
  const effectiveAnimationIntensity =
    animationIntensity || animationTheme?.animationIntensity;
  const particleEffectsEnabled = visualTheme?.particleEffectsEnabled;

  // Handle escape key and body scroll
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && closeOnEscape) {
        onClose();
      }
    };

    if (open) {
      if (closeOnEscape) {
        document.addEventListener('keydown', handleEscapeKey);
      }
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [open, closeOnEscape, onClose]);

  if (!open) {
    return null;
  }

  // Size mapping for both legacy maxWidth and new size prop
  const effectiveSize = maxWidth !== 'md' ? maxWidth : size;
  const sizeClasses = {
    xs: 'max-w-xs',
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    fullscreen: 'max-w-full min-h-screen',
  };
  const maxWidthClass =
    sizeClasses[effectiveSize as keyof typeof sizeClasses] || sizeClasses.md;

  // Theme-aware backdrop classes
  const backdropClasses = cn(
    'fixed inset-0 transition-all duration-500 ease-out backdrop-blur-xl',
    effectiveTheme === 'dba-cosmic'
      ? 'bg-gradient-to-br from-purple-950/90 via-pink-900/80 to-purple-950/90'
      : effectiveTheme === 'context7-futuristic'
        ? 'bg-gradient-to-br from-blue-950/90 via-cyan-900/80 to-blue-950/90'
        : effectiveTheme === 'minimal'
          ? 'bg-white/80'
          : 'bg-gradient-to-br from-zinc-950/90 via-zinc-900/80 to-zinc-950/90'
  );

  // Theme-aware modal panel classes
  const modalPanelClasses = cn(
    // Base modal styles
    'inline-block align-bottom text-left overflow-hidden transform transition-all duration-500 ease-out',
    'sm:my-8 sm:align-middle sm:w-full relative group',

    // Size classes
    maxWidthClass,
    effectiveSize === 'fullscreen'
      ? 'w-full h-full rounded-none'
      : 'rounded-3xl',

    // Theme-aware card styling
    cardClasses({
      theme: effectiveTheme,
      size:
        effectiveDensity === 'compact'
          ? 'sm'
          : effectiveDensity === 'spacious'
            ? 'lg'
            : 'md',
      interactive: false,
      animationIntensity: effectiveAnimationIntensity,
    }),

    // Animation based on intensity
    effectiveAnimationIntensity === 'disabled'
      ? ''
      : effectiveAnimationIntensity === 'subtle'
        ? 'scale-98 hover:scale-100'
        : effectiveAnimationIntensity === 'enhanced'
          ? 'scale-95 hover:scale-102'
          : 'scale-95 hover:scale-100',

    className
  );

  // Theme-aware title classes
  const titleClasses = cn(
    'text-2xl font-bold mb-6',
    effectiveTheme === 'minimal'
      ? 'text-gray-900'
      : 'text-zinc-100 bg-gradient-to-r from-theme-primary to-theme-accent bg-clip-text text-transparent'
  );

  // Theme-aware close button classes
  const closeButtonClasses = cn(
    'p-2 rounded-2xl focus:outline-none focus:ring-2 transition-all duration-theme-normal',
    'backdrop-blur-sm',
    effectiveTheme === 'minimal'
      ? 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:ring-gray-500/50'
      : 'text-zinc-400 hover:text-zinc-200 hover:bg-theme-bg-accent focus:ring-theme-primary/50',
    effectiveAnimationIntensity === 'enhanced' &&
      'hover:shadow-lg hover:scale-105 active:scale-95'
  );

  // Backdrop click handler
  const handleBackdropClick = (event: React.MouseEvent) => {
    if (closeOnBackdrop && event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" data-testid={testId}>
      {/* Theme-Aware Modal Container */}
      <div
        className={cn(
          'flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0',
          !centered && 'items-start pt-20'
        )}
      >
        {/* Theme-Aware Backdrop */}
        <div className={backdropClasses} onClick={handleBackdropClick} />

        {/* Gradient overlay for depth (theme-aware) */}
        <div
          className={cn(
            'fixed inset-0 pointer-events-none',
            effectiveTheme === 'minimal'
              ? 'bg-gradient-to-t from-gray-100/20 via-transparent to-gray-100/10'
              : 'bg-gradient-to-t from-black/20 via-transparent to-black/10'
          )}
        />

        {/* Particle Effects (conditional) */}
        {particleEffectsEnabled && effectiveTheme !== 'minimal' && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
              className={cn(
                'absolute top-1/4 left-1/4 w-2 h-2 rounded-full animate-pulse',
                effectiveTheme === 'dba-cosmic'
                  ? 'bg-purple-400/20'
                  : 'bg-zinc-400/20'
              )}
            ></div>
            <div
              className={cn(
                'absolute top-3/4 right-1/3 w-1 h-1 rounded-full animate-bounce delay-100',
                effectiveTheme === 'context7-futuristic'
                  ? 'bg-cyan-300/30'
                  : 'bg-indigo-300/30'
              )}
            ></div>
            <div
              className={cn(
                'absolute bottom-1/4 left-1/3 w-1.5 h-1.5 rounded-full animate-pulse delay-200',
                effectiveTheme === 'dba-cosmic'
                  ? 'bg-pink-300/25'
                  : 'bg-purple-300/25'
              )}
            ></div>
          </div>
        )}

        {/* Centering span */}
        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>

        {/* Theme-Aware Modal Panel */}
        <div className={modalPanelClasses}>
          {/* Theme-aware gradient border effect */}
          <div
            className={cn(
              'absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none',
              effectiveTheme === 'dba-cosmic'
                ? 'bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20'
                : effectiveTheme === 'context7-futuristic'
                  ? 'bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-cyan-500/20'
                  : effectiveTheme !== 'minimal' &&
                    'bg-gradient-to-r from-theme-primary/20 via-theme-accent/20 to-theme-primary/20'
            )}
          />

          {/* Content Container */}
          <div className="relative z-10">
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between mb-6">
                {title && <h3 className={titleClasses}>{title}</h3>}
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className={closeButtonClasses}
                    aria-label="Close modal"
                  >
                    <X
                      className={cn(
                        'w-6 h-6 transition-transform duration-300',
                        effectiveAnimationIntensity === 'enhanced' &&
                          'group-hover:rotate-90'
                      )}
                    />
                  </button>
                )}
              </div>
            )}

            {/* Content Area */}
            <div className="relative">{children}</div>
          </div>

          {/* Theme-aware shimmer effect */}
          {effectiveAnimationIntensity !== 'disabled' &&
            effectiveTheme !== 'minimal' && (
              <div
                className={cn(
                  'absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none',
                  effectiveTheme === 'dba-cosmic'
                    ? 'bg-gradient-to-r from-transparent via-purple-200/10 to-transparent'
                    : 'bg-gradient-to-r from-transparent via-cyan-200/10 to-transparent'
                )}
              />
            )}

          {/* Sparkle effects (conditional) */}
          {particleEffectsEnabled && effectiveTheme !== 'minimal' && (
            <>
              <div
                className={cn(
                  'absolute top-4 right-4 w-1 h-1 rounded-full animate-pulse opacity-60',
                  effectiveTheme === 'dba-cosmic'
                    ? 'bg-purple-400'
                    : 'bg-cyan-400'
                )}
              ></div>
              <div
                className={cn(
                  'absolute bottom-8 left-8 w-0.5 h-0.5 rounded-full animate-pulse opacity-40 delay-500',
                  effectiveTheme === 'dba-cosmic'
                    ? 'bg-pink-400'
                    : 'bg-blue-400'
                )}
              ></div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
