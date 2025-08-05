/**
 * Accessibility-Focused Theme Features Component
 * Phase 3.2.2: Accessibility theme features ONLY
 *
 * Following CLAUDE.md principles:
 * - Single Responsibility: Manages accessibility theme features only
 * - Open/Closed: Extensible for new accessibility patterns
 * - DRY: Centralized accessibility theme logic
 * - Dependency Inversion: Abstracts accessibility implementation details
 *
 * Integrates with:
 * - ThemeContext.tsx for theme state management
 * - useAccessibilityTheme.ts for accessibility-specific operations
 * - pokemon-design-system.css for accessibility styles
 */

import { useEffect, ReactNode } from 'react';
import { useAccessibilityTheme as useAccessibilityThemeContext } from '../../contexts/theme';
import { useAccessibilityTheme } from '../../hooks/useAccessibilityTheme';
import { cn } from '../../utils/themeUtils';

// ================================
// ACCESSIBILITY THEME INTERFACES
// ================================

export interface AccessibilityThemeProps {
  /** Children to render with accessibility theme context */
  children: ReactNode;
  /** Enable automatic system preference detection */
  autoDetectPreferences?: boolean;
  /** Enable accessibility keyboard shortcuts */
  enableKeyboardShortcuts?: boolean;
  /** Custom high contrast color overrides */
  highContrastOverrides?: {
    background?: string;
    text?: string;
    border?: string;
    accent?: string;
  };
  /** Custom reduced motion settings */
  reducedMotionOverrides?: {
    disableTransitions?: boolean;
    disableAnimations?: boolean;
    disableParallax?: boolean;
    disableAutoplay?: boolean;
  };
  /** Focus management configuration */
  focusManagement?: {
    trapFocus?: boolean;
    restoreFocus?: boolean;
    skipLinks?: boolean;
  };
}

export interface AccessibilityIndicatorProps {
  /** Show accessibility status indicators */
  showIndicators?: boolean;
  /** Position of indicators */
  indicatorPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  /** Custom indicator styles */
  indicatorClassName?: string;
}

// ================================
// ACCESSIBILITY THEME PROVIDER
// ================================

/**
 * AccessibilityTheme Component
 * Wraps content with accessibility-aware theme features
 * Handles high contrast, reduced motion, and focus management
 */
const AccessibilityTheme: React.FC<
  AccessibilityThemeProps & AccessibilityIndicatorProps
> = ({
  children,
  autoDetectPreferences = true,
  enableKeyboardShortcuts = true,
  highContrastOverrides,
  reducedMotionOverrides,
  focusManagement = {
    trapFocus: false,
    restoreFocus: true,
    skipLinks: true,
  },
  showIndicators = false,
  indicatorPosition = 'top-right',
  indicatorClassName,
}) => {
  const theme = useAccessibilityThemeContext();
  const accessibility = useAccessibilityTheme({
    autoDetectPreferences,
    enableKeyboardShortcuts,
    highContrastOverrides,
    reducedMotionOverrides,
    focusManagement,
  });

  // Apply accessibility-specific CSS properties
  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const root = document.documentElement;

    // High contrast mode CSS properties
    if (theme.config.highContrast) {
      root.style.setProperty('--accessibility-high-contrast', 'true');

      // Apply high contrast overrides if provided
      if (highContrastOverrides) {
        if (highContrastOverrides.background) {
          root.style.setProperty(
            '--accessibility-hc-bg',
            highContrastOverrides.background
          );
        }
        if (highContrastOverrides.text) {
          root.style.setProperty(
            '--accessibility-hc-text',
            highContrastOverrides.text
          );
        }
        if (highContrastOverrides.border) {
          root.style.setProperty(
            '--accessibility-hc-border',
            highContrastOverrides.border
          );
        }
        if (highContrastOverrides.accent) {
          root.style.setProperty(
            '--accessibility-hc-accent',
            highContrastOverrides.accent
          );
        }
      }
    } else {
      root.style.removeProperty('--accessibility-high-contrast');
    }

    // Reduced motion mode CSS properties
    if (theme.config.reducedMotion) {
      root.style.setProperty('--accessibility-reduced-motion', 'true');

      // Apply reduced motion overrides if provided
      if (reducedMotionOverrides) {
        if (reducedMotionOverrides.disableTransitions) {
          root.style.setProperty('--accessibility-disable-transitions', 'true');
        }
        if (reducedMotionOverrides.disableAnimations) {
          root.style.setProperty('--accessibility-disable-animations', 'true');
        }
        if (reducedMotionOverrides.disableParallax) {
          root.style.setProperty('--accessibility-disable-parallax', 'true');
        }
        if (reducedMotionOverrides.disableAutoplay) {
          root.style.setProperty('--accessibility-disable-autoplay', 'true');
        }
      }
    } else {
      root.style.removeProperty('--accessibility-reduced-motion');
    }

    // Focus management properties
    if (focusManagement.trapFocus) {
      root.style.setProperty('--accessibility-trap-focus', 'true');
    }
    if (focusManagement.restoreFocus) {
      root.style.setProperty('--accessibility-restore-focus', 'true');
    }
    if (focusManagement.skipLinks) {
      root.style.setProperty('--accessibility-skip-links', 'true');
    }

    // Add accessibility classes to document
    const accessibilityClasses = [];
    if (theme.config.highContrast) {
      accessibilityClasses.push('accessibility-high-contrast');
    }
    if (theme.config.reducedMotion) {
      accessibilityClasses.push('accessibility-reduced-motion');
    }
    if (focusManagement.trapFocus) {
      accessibilityClasses.push('accessibility-focus-trap');
    }

    // Remove existing accessibility classes
    root.className = root.className.replace(/accessibility-\w+/g, '');

    // Add new accessibility classes
    if (accessibilityClasses.length > 0) {
      root.classList.add(...accessibilityClasses);
    }
  }, [
    theme.config.highContrast,
    theme.config.reducedMotion,
    highContrastOverrides,
    reducedMotionOverrides,
    focusManagement,
  ]);

  // Skip links for keyboard navigation
  const renderSkipLinks = () => {
    if (!focusManagement.skipLinks) {
      return null;
    }

    return (
      <div className="accessibility-skip-links">
        <a
          href="#main-content"
          className={cn(
            'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4',
            'bg-white text-black px-4 py-2 rounded z-50 font-medium',
            'focus:ring-2 focus:ring-theme-primary'
          )}
        >
          Skip to main content
        </a>
        <a
          href="#navigation"
          className={cn(
            'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-32',
            'bg-white text-black px-4 py-2 rounded z-50 font-medium',
            'focus:ring-2 focus:ring-theme-primary'
          )}
        >
          Skip to navigation
        </a>
      </div>
    );
  };

  // Accessibility status indicators
  const renderAccessibilityIndicators = () => {
    if (!showIndicators) {
      return null;
    }

    const indicators = [];

    if (theme.config.highContrast) {
      indicators.push({
        id: 'high-contrast',
        label: 'High Contrast',
        icon: '🔆',
        active: true,
      });
    }

    if (theme.config.reducedMotion) {
      indicators.push({
        id: 'reduced-motion',
        label: 'Reduced Motion',
        icon: '⏸️',
        active: true,
      });
    }

    if (accessibility.systemPreferences?.prefersReducedMotion) {
      indicators.push({
        id: 'system-motion',
        label: 'System Prefers Reduced Motion',
        icon: '🖥️',
        active: true,
      });
    }

    if (accessibility.systemPreferences?.prefersHighContrast) {
      indicators.push({
        id: 'system-contrast',
        label: 'System Prefers High Contrast',
        icon: '🖥️',
        active: true,
      });
    }

    if (indicators.length === 0) {
      return null;
    }

    const positionClasses = {
      'top-left': 'top-4 left-4',
      'top-right': 'top-4 right-4',
      'bottom-left': 'bottom-4 left-4',
      'bottom-right': 'bottom-4 right-4',
    };

    return (
      <div
        className={cn(
          'fixed z-50 flex flex-col gap-1',
          positionClasses[indicatorPosition],
          indicatorClassName
        )}
        role="status"
        aria-live="polite"
        aria-label="Accessibility status indicators"
      >
        {indicators.map((indicator) => (
          <div
            key={indicator.id}
            className={cn(
              'bg-black/80 text-white px-2 py-1 rounded text-xs',
              'backdrop-blur-sm border border-white/20',
              'flex items-center gap-1.5 font-medium'
            )}
            title={indicator.label}
          >
            <span aria-hidden="true">{indicator.icon}</span>
            <span className="sr-only">{indicator.label} enabled</span>
            {indicator.label}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div
      className={cn(
        'accessibility-theme-wrapper',
        theme.config.highContrast && 'theme-high-contrast',
        theme.config.reducedMotion && 'theme-reduced-motion'
      )}
      data-accessibility-features={JSON.stringify({
        highContrast: theme.config.highContrast,
        reducedMotion: theme.config.reducedMotion,
        systemPreferences: accessibility.systemPreferences,
      })}
    >
      {renderSkipLinks()}
      {renderAccessibilityIndicators()}
      {children}
    </div>
  );
};

// ================================
// HIGH CONTRAST THEME COMPONENT
// ================================

export interface HighContrastThemeProps {
  /** Children to render */
  children: ReactNode;
  /** High contrast intensity (1-10) */
  intensity?: number;
  /** Color overrides for high contrast mode */
  colorOverrides?: {
    background?: string;
    foreground?: string;
    accent?: string;
    border?: string;
  };
  /** Enable automatic contrast detection */
  autoDetect?: boolean;
}

/**
 * High Contrast Theme Component
 * Specialized component for high contrast mode management
 */
const HighContrastTheme: React.FC<HighContrastThemeProps> = ({
  children,
  intensity = 5,
  colorOverrides,
  autoDetect = true,
}) => {
  const theme = useAccessibilityThemeContext();
  const _accessibility = useAccessibilityTheme({
    autoDetectPreferences: autoDetect,
  });

  useEffect(() => {
    if (!theme.config.highContrast) {
      return;
    }

    const root = document.documentElement;

    // Set high contrast intensity
    const contrastMultiplier = Math.max(1, Math.min(10, intensity)) / 5; // Normalize to 0.2-2.0
    root.style.setProperty(
      '--accessibility-contrast-intensity',
      contrastMultiplier.toString()
    );

    // Apply custom color overrides
    if (colorOverrides) {
      if (colorOverrides.background) {
        root.style.setProperty(
          '--accessibility-hc-bg-override',
          colorOverrides.background
        );
      }
      if (colorOverrides.foreground) {
        root.style.setProperty(
          '--accessibility-hc-text-override',
          colorOverrides.foreground
        );
      }
      if (colorOverrides.accent) {
        root.style.setProperty(
          '--accessibility-hc-accent-override',
          colorOverrides.accent
        );
      }
      if (colorOverrides.border) {
        root.style.setProperty(
          '--accessibility-hc-border-override',
          colorOverrides.border
        );
      }
    }

    return () => {
      // Cleanup custom properties
      root.style.removeProperty('--accessibility-contrast-intensity');
      if (colorOverrides) {
        root.style.removeProperty('--accessibility-hc-bg-override');
        root.style.removeProperty('--accessibility-hc-text-override');
        root.style.removeProperty('--accessibility-hc-accent-override');
        root.style.removeProperty('--accessibility-hc-border-override');
      }
    };
  }, [theme.config.highContrast, intensity, colorOverrides]);

  if (!theme.config.highContrast) {
    return <>{children}</>;
  }

  return (
    <div
      className={cn(
        'high-contrast-wrapper',
        `contrast-intensity-${Math.round(intensity)}`
      )}
      data-accessibility-high-contrast="true"
      data-contrast-intensity={intensity}
    >
      {children}
    </div>
  );
};

// ================================
// REDUCED MOTION THEME COMPONENT
// ================================

export interface ReducedMotionThemeProps {
  /** Children to render */
  children: ReactNode;
  /** Motion sensitivity level (1-5, 5 = most sensitive) */
  sensitivityLevel?: number;
  /** Specific motion preferences */
  motionPreferences?: {
    allowEssentialMotion?: boolean;
    allowHoverEffects?: boolean;
    allowFocusEffects?: boolean;
    allowScrollAnimations?: boolean;
  };
  /** Auto-detect system motion preferences */
  autoDetect?: boolean;
}

/**
 * Reduced Motion Theme Component
 * Specialized component for motion sensitivity management
 */
const ReducedMotionTheme: React.FC<ReducedMotionThemeProps> = ({
  children,
  sensitivityLevel = 3,
  motionPreferences = {
    allowEssentialMotion: true,
    allowHoverEffects: false,
    allowFocusEffects: true,
    allowScrollAnimations: false,
  },
  autoDetect = true,
}) => {
  const theme = useAccessibilityThemeContext();
  const _accessibility = useAccessibilityTheme({
    autoDetectPreferences: autoDetect,
  });

  useEffect(() => {
    if (!theme.config.reducedMotion) {
      return;
    }

    const root = document.documentElement;

    // Set motion sensitivity level
    const sensitivity = Math.max(1, Math.min(5, sensitivityLevel));
    root.style.setProperty(
      '--accessibility-motion-sensitivity',
      sensitivity.toString()
    );

    // Apply motion preferences
    if (motionPreferences.allowEssentialMotion) {
      root.style.setProperty('--accessibility-allow-essential-motion', 'true');
    }
    if (motionPreferences.allowHoverEffects) {
      root.style.setProperty('--accessibility-allow-hover-effects', 'true');
    }
    if (motionPreferences.allowFocusEffects) {
      root.style.setProperty('--accessibility-allow-focus-effects', 'true');
    }
    if (motionPreferences.allowScrollAnimations) {
      root.style.setProperty('--accessibility-allow-scroll-animations', 'true');
    }

    // Calculate motion reduction percentage based on sensitivity
    const motionReduction = (sensitivity / 5) * 100;
    root.style.setProperty(
      '--accessibility-motion-reduction',
      `${motionReduction}%`
    );

    return () => {
      // Cleanup motion preferences
      root.style.removeProperty('--accessibility-motion-sensitivity');
      root.style.removeProperty('--accessibility-allow-essential-motion');
      root.style.removeProperty('--accessibility-allow-hover-effects');
      root.style.removeProperty('--accessibility-allow-focus-effects');
      root.style.removeProperty('--accessibility-allow-scroll-animations');
      root.style.removeProperty('--accessibility-motion-reduction');
    };
  }, [theme.config.reducedMotion, sensitivityLevel, motionPreferences]);

  if (!theme.config.reducedMotion) {
    return <>{children}</>;
  }

  return (
    <div
      className={cn(
        'reduced-motion-wrapper',
        `motion-sensitivity-${sensitivityLevel}`,
        motionPreferences.allowEssentialMotion && 'allow-essential-motion',
        motionPreferences.allowHoverEffects && 'allow-hover-effects',
        motionPreferences.allowFocusEffects && 'allow-focus-effects',
        motionPreferences.allowScrollAnimations && 'allow-scroll-animations'
      )}
      data-accessibility-reduced-motion="true"
      data-motion-sensitivity={sensitivityLevel}
    >
      {children}
    </div>
  );
};

// ================================
// FOCUS MANAGEMENT COMPONENT
// ================================

export interface FocusManagementThemeProps {
  /** Children to render */
  children: ReactNode;
  /** Focus trap enabled */
  trapFocus?: boolean;
  /** Focus restore on unmount */
  restoreFocus?: boolean;
  /** Enhanced focus indicators */
  enhancedFocusIndicators?: boolean;
  /** Focus indicator style */
  focusIndicatorStyle?: 'ring' | 'outline' | 'glow' | 'border';
  /** Focus indicator color */
  focusIndicatorColor?: string;
  /** Focus indicator thickness */
  focusIndicatorThickness?: number;
}

/**
 * Focus Management Theme Component
 * Provides theme-aware focus management and enhanced focus indicators
 */
const FocusManagementTheme: React.FC<FocusManagementThemeProps> = ({
  children,
  trapFocus = false,
  restoreFocus = true,
  enhancedFocusIndicators = true,
  focusIndicatorStyle = 'ring',
  focusIndicatorColor,
  focusIndicatorThickness = 2,
}) => {
  useAccessibilityThemeContext();
  useAccessibilityTheme();

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const root = document.documentElement;

    // Enhanced focus indicators
    if (enhancedFocusIndicators) {
      root.style.setProperty('--accessibility-enhanced-focus', 'true');
      root.style.setProperty(
        '--accessibility-focus-style',
        focusIndicatorStyle
      );

      if (focusIndicatorColor) {
        root.style.setProperty(
          '--accessibility-focus-color',
          focusIndicatorColor
        );
      }

      root.style.setProperty(
        '--accessibility-focus-thickness',
        `${focusIndicatorThickness}px`
      );
    }

    // Focus management
    if (trapFocus) {
      root.style.setProperty('--accessibility-focus-trap', 'true');
    }
    if (restoreFocus) {
      root.style.setProperty('--accessibility-focus-restore', 'true');
    }

    return () => {
      root.style.removeProperty('--accessibility-enhanced-focus');
      root.style.removeProperty('--accessibility-focus-style');
      root.style.removeProperty('--accessibility-focus-color');
      root.style.removeProperty('--accessibility-focus-thickness');
      root.style.removeProperty('--accessibility-focus-trap');
      root.style.removeProperty('--accessibility-focus-restore');
    };
  }, [
    enhancedFocusIndicators,
    focusIndicatorStyle,
    focusIndicatorColor,
    focusIndicatorThickness,
    trapFocus,
    restoreFocus,
  ]);

  return (
    <div
      className={cn(
        'focus-management-wrapper',
        enhancedFocusIndicators && 'enhanced-focus-indicators',
        trapFocus && 'focus-trap-enabled',
        restoreFocus && 'focus-restore-enabled'
      )}
      data-accessibility-focus-management="true"
      data-focus-trap={trapFocus}
      data-focus-restore={restoreFocus}
    >
      {children}
    </div>
  );
};

// ================================
// ACCESSIBILITY CONTROLS COMPONENT
// ================================

export interface AccessibilityControlsProps {
  /** Show accessibility control panel */
  showControls?: boolean;
  /** Control panel position */
  position?: 'floating' | 'fixed' | 'inline';
  /** Control panel size */
  size?: 'compact' | 'comfortable' | 'expanded';
  /** Enable quick toggles */
  enableQuickToggles?: boolean;
  /** Custom control styles */
  controlClassName?: string;
}

/**
 * Accessibility Controls Component
 * Provides user controls for accessibility theme features
 */
const AccessibilityControls: React.FC<AccessibilityControlsProps> = ({
  showControls = true,
  position = 'floating',
  size = 'comfortable',
  enableQuickToggles = true,
  controlClassName,
}) => {
  const theme = useAccessibilityThemeContext();
  const accessibility = useAccessibilityTheme();

  if (!showControls) {
    return null;
  }

  const positionClasses = {
    floating: 'fixed bottom-4 right-4 z-40',
    fixed: 'sticky top-4 z-30',
    inline: 'relative',
  };

  const sizeClasses = {
    compact: 'p-2 space-y-1',
    comfortable: 'p-4 space-y-2',
    expanded: 'p-6 space-y-4',
  };

  return (
    <div
      className={cn(
        'accessibility-controls',
        positionClasses[position],
        sizeClasses[size],
        'bg-black/90 backdrop-blur-sm rounded-xl border border-white/20',
        'shadow-lg text-white',
        controlClassName
      )}
      role="region"
      aria-label="Accessibility Controls"
    >
      <div className="text-sm font-semibold mb-2 text-center">
        Accessibility
      </div>

      {enableQuickToggles && (
        <div className="space-y-2">
          <button
            onClick={accessibility.toggleHighContrast}
            className={cn(
              'w-full flex items-center justify-between px-3 py-2 rounded-lg',
              'text-sm font-medium transition-colors',
              theme.config.highContrast
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-700 hover:bg-gray-600 text-gray-100'
            )}
            aria-pressed={theme.config.highContrast}
          >
            <span>High Contrast</span>
            <span
              className={cn(
                'w-4 h-4 rounded-full transition-all',
                theme.config.highContrast ? 'bg-white' : 'bg-gray-400'
              )}
            />
          </button>

          <button
            onClick={accessibility.toggleReducedMotion}
            className={cn(
              'w-full flex items-center justify-between px-3 py-2 rounded-lg',
              'text-sm font-medium transition-colors',
              theme.config.reducedMotion
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 hover:bg-gray-600 text-gray-100'
            )}
            aria-pressed={theme.config.reducedMotion}
          >
            <span>Reduced Motion</span>
            <span
              className={cn(
                'w-4 h-4 rounded-full transition-all',
                theme.config.reducedMotion ? 'bg-white' : 'bg-gray-400'
              )}
            />
          </button>

          {accessibility.systemPreferences && (
            <div className="pt-2 border-t border-white/20">
              <div className="text-xs text-gray-300 mb-1">
                System Preferences:
              </div>
              {accessibility.systemPreferences.prefersHighContrast && (
                <div className="text-xs text-yellow-400">
                  • High Contrast Detected
                </div>
              )}
              {accessibility.systemPreferences.prefersReducedMotion && (
                <div className="text-xs text-blue-400">
                  • Reduced Motion Detected
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ================================
// EXPORTS
// ================================

export default AccessibilityTheme;

export {
  AccessibilityTheme,
  HighContrastTheme,
  ReducedMotionTheme,
  FocusManagementTheme,
  AccessibilityControls,
};
