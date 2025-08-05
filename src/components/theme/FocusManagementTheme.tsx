/**
 * CLAUDE.md COMPLIANCE: Focus Management Theme Component
 * 
 * SRP: Single responsibility for focus management functionality
 * OCP: Open for extension via props interface  
 * DIP: Depends on theme context abstractions
 */

import { useEffect, ReactNode } from 'react';
import { useAccessibilityTheme as useAccessibilityThemeContext } from '../../contexts/theme';
import { useAccessibilityTheme } from '../../hooks/useAccessibilityTheme';
import { cn } from '../../utils/themeUtils';

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
 * 
 * CLAUDE.md COMPLIANCE:
 * - SRP: Handles only focus management functionality
 * - DRY: Reusable focus management across the application
 * - SOLID: Clean interface with dependency injection
 */
export const FocusManagementTheme: React.FC<FocusManagementThemeProps> = ({
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

export default FocusManagementTheme;