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
import { cn } from '../../../utils/unifiedUtilities';

// CLAUDE.md COMPLIANCE: Following SRP by separating large components into focused modules
// This file now contains only the main AccessibilityTheme component and small helper components

// Import separated accessibility components
export { HighContrastTheme } from './HighContrastTheme';
export { ReducedMotionTheme } from './ReducedMotionTheme';
export { FocusManagementTheme } from './FocusManagementTheme';
export { AccessibilityControls } from './AccessibilityControls';

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
// ACCESSIBILITY SKIP LINKS COMPONENT
// ================================

interface AccessibilitySkipLinksProps {
  focusManagement: {
    trapFocus?: boolean;
    restoreFocus?: boolean;
    skipLinks?: boolean;
  };
}

/**
 * AccessibilitySkipLinks Component
 * SRP: Handles skip links for keyboard navigation only
 */
const AccessibilitySkipLinks: React.FC<AccessibilitySkipLinksProps> = ({
  focusManagement,
}) => {
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

// ================================
// ACCESSIBILITY INDICATORS COMPONENT
// ================================

interface AccessibilityIndicatorsProps {
  showIndicators?: boolean;
  indicatorPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  indicatorClassName?: string;
  theme: any;
  accessibility: any;
}

/**
 * AccessibilityIndicators Component
 * SRP: Handles accessibility status indicators only
 */
const AccessibilityIndicators: React.FC<AccessibilityIndicatorsProps> = ({
  showIndicators,
  indicatorPosition = 'top-right',
  indicatorClassName,
  theme,
  accessibility,
}) => {
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
      <AccessibilitySkipLinks focusManagement={focusManagement} />
      <AccessibilityIndicators
        showIndicators={showIndicators}
        indicatorPosition={indicatorPosition}
        indicatorClassName={indicatorClassName}
        theme={theme}
        accessibility={accessibility}
      />
      {children}
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
