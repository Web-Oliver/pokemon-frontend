/**
 * Theme Context Entry Point
 * Exports focused theme hooks following SOLID principles
 */

export { ComposedThemeProvider } from './ComposedThemeProvider';

// Export focused hooks - no backward compatibility
export { useVisualTheme } from '../../hooks/theme/useVisualTheme';
export { useLayoutTheme } from '../../hooks/theme/useLayoutTheme';
export { useAnimationTheme } from '../../hooks/theme/useAnimationTheme';
export { useAccessibilityTheme } from '../../hooks/theme/useAccessibilityTheme';
export { useThemeStorage } from '../../hooks/theme/useThemeStorage';