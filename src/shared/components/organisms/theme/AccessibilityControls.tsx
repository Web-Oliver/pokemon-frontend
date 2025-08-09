/**
 * CLAUDE.md COMPLIANCE: Accessibility Controls Component
 *
 * SRP: Single responsibility for accessibility user controls
 * OCP: Open for extension via props interface
 * DIP: Depends on theme context abstractions
 */

import { useAccessibilityTheme as useAccessibilityThemeContext } from '../../contexts/theme';
import { useAccessibilityTheme } from '../../hooks/useAccessibilityTheme';
import { cn } from '../../../utils/ui/classNameUtils';

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
 *
 * CLAUDE.md COMPLIANCE:
 * - SRP: Handles only accessibility control UI
 * - DRY: Reusable control panel across the application
 * - SOLID: Clean interface with dependency injection
 */
export const AccessibilityControls: React.FC<AccessibilityControlsProps> = ({
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

export default AccessibilityControls;
