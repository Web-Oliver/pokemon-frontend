/**
 * Theme Components Export Index
 * Consolidated Theme UI Components - All theme-related UI in one place
 *
 * Following CLAUDE.md principles:
 * - Single Responsibility: Theme component exports only
 * - DRY: Centralized export point for ALL theme components
 * - Reusability: Highly reusable and configurable theme UI components
 * - Integration: Complete theme management UI system
 */

// ================================
// MAIN THEME COMPONENTS
// ================================

// Theme Selection Components
export { default as ThemePicker } from './ThemePicker';
export type { ThemePickerProps } from './ThemePicker';

// Theme Toggle Component (moved from ui directory)
export { default as ThemeToggle } from './ThemeToggle';

// ================================
// ACCESSIBILITY THEME COMPONENTS
// ================================

// Accessibility Theme Controls
export {
  AccessibilityTheme,
  HighContrastTheme,
  ReducedMotionTheme,
  FocusManagementTheme,
  AccessibilityControls,
} from './AccessibilityTheme';

// ================================
// CONSOLIDATED THEME UI EXPORTS
// ================================

/**
 * Complete Theme UI Component Collection
 * All theme-related UI components grouped for convenience
 */
export const ThemeComponents = {
  // Main Components
  ThemePicker,
  ThemeToggle,

  // Accessibility Components
  AccessibilityTheme,
  HighContrastTheme,
  ReducedMotionTheme,
  FocusManagementTheme,
  AccessibilityControls,
} as const;

/**
 * Theme UI Component Types
 * Type definitions for all theme components
 */
export type ThemeUIComponents = typeof ThemeComponents;

// ================================
// DEFAULT EXPORT FOR CONVENIENCE
// ================================

export default ThemeComponents;
