/**
 * Theme Storage Hook
 * CONSOLIDATED: Now part of UnifiedThemeProvider
 *
 * @deprecated Use saveTheme, loadTheme, resetTheme from useUnifiedTheme instead
 * Provides type-safe access to theme persistence management
 */

import { useUnifiedTheme } from '../../contexts/theme/UnifiedThemeProvider';

export function useThemeStorage() {
  const { saveTheme, loadTheme, resetTheme, exportTheme, importTheme } =
    useUnifiedTheme();

  return {
    saveTheme,
    loadTheme,
    resetTheme,
    exportTheme,
    importTheme,
  };
}
