/**
 * CLAUDE.md COMPLIANCE: Reduced Motion Theme Component
 *
 * SRP: Single responsibility for reduced motion theme management
 * OCP: Open for extension via props interface
 * DIP: Depends on theme context abstractions
 */

import { useEffect, ReactNode } from 'react';
import { useAccessibilityTheme as useAccessibilityThemeContext } from '../../contexts/theme';
import { useAccessibilityTheme } from '../../hooks/useAccessibilityTheme';
import { cn } from '../../../utils/ui/classNameUtils';

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
 *
 * CLAUDE.md COMPLIANCE:
 * - SRP: Handles only reduced motion functionality
 * - DRY: Reusable motion preferences across the application
 * - SOLID: Clean interface with dependency injection
 */
export const ReducedMotionTheme: React.FC<ReducedMotionThemeProps> = ({
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

export default ReducedMotionTheme;
