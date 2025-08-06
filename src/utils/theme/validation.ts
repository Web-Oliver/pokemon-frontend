/**
 * Theme Validation Utilities
 * Split from themeDebug.ts for better maintainability
 * 
 * Following CLAUDE.md principles:
 * - Single Responsibility: Theme validation only
 * - DRY: Centralized validation logic
 */

import { VisualTheme, ThemeConfiguration } from '../../types/themeTypes';
import { formThemes } from '../../theme/formThemes';

export interface ValidationResult {
  type: 'error' | 'warning' | 'success';
  category: 'Configuration' | 'Performance' | 'Accessibility' | 'Compatibility';
  message: string;
  suggestion?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Validate theme configuration for consistency and best practices
 */
export function validateThemeConfiguration(
  config: ThemeConfiguration
): ValidationResult[] {
  const results: ValidationResult[] = [];

  // Validate visual theme
  if (!Object.keys(formThemes).includes(config.visualTheme)) {
    results.push({
      type: 'error',
      category: 'Configuration',
      message: `Invalid visual theme: ${config.visualTheme}`,
      suggestion: `Use one of: ${Object.keys(formThemes).join(', ')}`,
      severity: 'high',
    });
  }

  // Validate density settings
  if (config.density && !['compact', 'comfortable', 'spacious'].includes(config.density)) {
    results.push({
      type: 'error',
      category: 'Configuration',
      message: `Invalid density setting: ${config.density}`,
      suggestion: 'Use compact, comfortable, or spacious',
      severity: 'medium',
    });
  }

  // Validate animation intensity
  if (config.animationIntensity && !['none', 'subtle', 'normal', 'intense'].includes(config.animationIntensity)) {
    results.push({
      type: 'error',
      category: 'Configuration',
      message: `Invalid animation intensity: ${config.animationIntensity}`,
      suggestion: 'Use none, subtle, normal, or intense',
      severity: 'medium',
    });
  }

  // Validate accessibility settings
  if (config.highContrastMode && config.visualTheme === 'light') {
    results.push({
      type: 'warning',
      category: 'Accessibility',
      message: 'High contrast mode may not be as effective with light theme',
      suggestion: 'Consider using dark theme with high contrast for better accessibility',
      severity: 'low',
    });
  }

  // Performance validations
  if (config.glassmorphismIntensity && config.glassmorphismIntensity > 90) {
    results.push({
      type: 'warning',
      category: 'Performance',
      message: 'High glassmorphism intensity may impact performance',
      suggestion: 'Consider reducing glassmorphism intensity to 80% or lower',
      severity: 'medium',
    });
  }

  // Success message if no issues
  if (results.length === 0) {
    results.push({
      type: 'success',
      category: 'Configuration',
      message: 'Theme configuration is valid',
      severity: 'low',
    });
  }

  return results;
}

/**
 * Debug theme conflicts and inconsistencies
 */
export function debugThemeConflicts(): {
  conflicts: Array<{
    type: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
  }>;
  suggestions: string[];
} {
  const conflicts: Array<{
    type: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
  }> = [];
  const suggestions: string[] = [];

  // Check for conflicting CSS classes
  if (typeof window !== 'undefined') {
    const themeClasses = Array.from(document.documentElement.classList).filter(
      (cls) => cls.startsWith('theme-')
    );

    if (themeClasses.length > 1) {
      conflicts.push({
        type: 'Multiple Theme Classes',
        description: `Found multiple theme classes: ${themeClasses.join(', ')}`,
        severity: 'high',
      });
      suggestions.push('Remove conflicting theme classes from document element');
    }
  }

  return { conflicts, suggestions };
}