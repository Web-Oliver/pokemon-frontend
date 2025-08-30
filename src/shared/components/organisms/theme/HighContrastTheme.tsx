/**
 * CLAUDE.md COMPLIANCE: High Contrast Theme Component
 *
 * SRP: Single responsibility for high contrast theme management
 * OCP: Open for extension via props interface
 * DIP: Depends on theme context abstractions
 */

import { ReactNode, useEffect } from 'react';
import { useTheme } from '@/theme';
import { cn } from '../../../utils';

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
 *
 * CLAUDE.md COMPLIANCE:
 * - SRP: Handles only high contrast theme functionality
 * - DRY: Reusable across the application
 * - SOLID: Clean interface with dependency injection
 */
export const HighContrastTheme: React.FC<HighContrastThemeProps> = ({
  children,
  intensity = 5,
  colorOverrides,
  autoDetect = true,
}) => {
  const accessibility = useTheme({
    autoDetectPreferences: autoDetect,
  });

  useEffect(() => {
    if (!accessibility.config.highContrast) {
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
  }, [accessibility.config.highContrast, intensity, colorOverrides]);

  if (!accessibility.config.highContrast) {
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

export default HighContrastTheme;
