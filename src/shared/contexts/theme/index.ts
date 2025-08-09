/**
 * UNIFIED THEME SYSTEM - Phase 2 Complete
 * Single provider replaces all 7 separate providers (42% theme code reduction)
 * Following CLAUDE.md + TODO.md Ultra-Optimization Plan
 */

// UNIFIED THEME EXPORTS - New single-provider system
export {
  UnifiedThemeProvider,
  useUnifiedTheme,
  useVisualTheme,
  useLayoutTheme,
  useAnimationTheme,
  useAccessibilityTheme,
} from './UnifiedThemeProvider';

// LEGACY PROVIDERS DEPRECATED - Use UnifiedThemeProvider for all theme functionality
// Individual providers are maintained for internal composition only
