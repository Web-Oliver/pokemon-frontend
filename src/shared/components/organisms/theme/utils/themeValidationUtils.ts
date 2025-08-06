/**
 * CLAUDE.md COMPLIANCE: Theme Validation Utilities
 *
 * SRP: Single responsibility for theme validation logic
 * DRY: Centralized validation rules
 * SOLID: Pure functions with no side effects
 */

export interface ValidationResult {
  type: 'error' | 'warning' | 'info';
  property: string;
  message: string;
  value?: any;
  suggestion?: string;
}

export interface ThemeValidationConfig {
  visualTheme: any;
  layoutTheme: any;
  animationTheme: any;
  accessibilityTheme: any;
  config: any;
}

/**
 * Validate color format and contrast
 * SRP: Handles only color validation
 */
export const validateColor = (
  color: string,
  property: string
): ValidationResult[] => {
  const results: ValidationResult[] = [];

  if (!color) {
    results.push({
      type: 'error',
      property,
      message: 'Color value is required',
      suggestion: 'Provide a valid hex, rgb, or hsl color value',
    });
    return results;
  }

  // Check hex color format
  const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  const rgbPattern = /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/;
  const hslPattern = /^hsl\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*\)$/;

  if (
    !hexPattern.test(color) &&
    !rgbPattern.test(color) &&
    !hslPattern.test(color)
  ) {
    results.push({
      type: 'error',
      property,
      message: 'Invalid color format',
      value: color,
      suggestion: 'Use hex (#ff0000), rgb(255,0,0), or hsl(0,100%,50%) format',
    });
  }

  return results;
};

/**
 * Validate spacing and sizing values
 * SRP: Handles only spacing validation
 */
export const validateSpacing = (
  value: string | number,
  property: string,
  min?: number,
  max?: number
): ValidationResult[] => {
  const results: ValidationResult[] = [];

  if (value === undefined || value === null) {
    results.push({
      type: 'warning',
      property,
      message: 'Spacing value not set, using default',
    });
    return results;
  }

  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(numValue)) {
    results.push({
      type: 'error',
      property,
      message: 'Invalid spacing value',
      value,
      suggestion: 'Use numeric values (px, rem, em) or valid CSS units',
    });
    return results;
  }

  if (min !== undefined && numValue < min) {
    results.push({
      type: 'warning',
      property,
      message: `Value below recommended minimum (${min})`,
      value: numValue,
      suggestion: `Consider using a value >= ${min}`,
    });
  }

  if (max !== undefined && numValue > max) {
    results.push({
      type: 'warning',
      property,
      message: `Value above recommended maximum (${max})`,
      value: numValue,
      suggestion: `Consider using a value <= ${max}`,
    });
  }

  return results;
};

/**
 * Validate animation timing and duration
 * SRP: Handles only animation validation
 */
export const validateAnimation = (config: any): ValidationResult[] => {
  const results: ValidationResult[] = [];

  if (config.duration !== undefined) {
    const duration = parseFloat(config.duration);
    if (isNaN(duration) || duration < 0) {
      results.push({
        type: 'error',
        property: 'animation.duration',
        message: 'Invalid animation duration',
        value: config.duration,
        suggestion: 'Use positive numeric values (e.g., 0.3, 1.5)',
      });
    } else if (duration > 5) {
      results.push({
        type: 'warning',
        property: 'animation.duration',
        message: 'Very long animation duration',
        value: duration,
        suggestion: 'Consider shorter durations (< 1s) for better UX',
      });
    }
  }

  if (config.easing && typeof config.easing === 'string') {
    const validEasings = [
      'ease',
      'ease-in',
      'ease-out',
      'ease-in-out',
      'linear',
    ];
    const isCubicBezier =
      /^cubic-bezier\(\s*[\d.-]+\s*,\s*[\d.-]+\s*,\s*[\d.-]+\s*,\s*[\d.-]+\s*\)$/.test(
        config.easing
      );

    if (!validEasings.includes(config.easing) && !isCubicBezier) {
      results.push({
        type: 'warning',
        property: 'animation.easing',
        message: 'Unknown easing function',
        value: config.easing,
        suggestion: 'Use standard easing functions or cubic-bezier()',
      });
    }
  }

  return results;
};

/**
 * Validate accessibility settings
 * SRP: Handles only accessibility validation
 */
export const validateAccessibility = (config: any): ValidationResult[] => {
  const results: ValidationResult[] = [];

  // Check for high contrast mode compatibility
  if (config.highContrast && config.accentPrimary && config.accentSecondary) {
    const primaryLuminance = getColorLuminance(config.accentPrimary);
    const secondaryLuminance = getColorLuminance(config.accentSecondary);

    if (Math.abs(primaryLuminance - secondaryLuminance) < 0.3) {
      results.push({
        type: 'warning',
        property: 'accessibility.colorContrast',
        message: 'Low contrast between primary and secondary colors',
        suggestion:
          'Choose colors with higher contrast for better accessibility',
      });
    }
  }

  // Check motion preferences
  if (
    config.reducedMotion === false &&
    config.animationIntensity === 'enhanced'
  ) {
    results.push({
      type: 'info',
      property: 'accessibility.motion',
      message: 'Enhanced animations enabled without motion reduction',
      suggestion: 'Consider respecting user motion preferences',
    });
  }

  return results;
};

/**
 * Calculate color luminance for contrast checking
 */
function getColorLuminance(color: string): number {
  // Simple luminance calculation for hex colors
  if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  return 0.5; // Default middle luminance for non-hex colors
}

/**
 * Main theme validation function
 * SRP: Orchestrates all validation checks
 */
export const validateThemeConfig = (
  themeConfig: ThemeValidationConfig
): ValidationResult[] => {
  const results: ValidationResult[] = [];

  // Validate colors
  if (themeConfig.config?.accentPrimary) {
    results.push(
      ...validateColor(themeConfig.config.accentPrimary, 'config.accentPrimary')
    );
  }

  if (themeConfig.config?.accentSecondary) {
    results.push(
      ...validateColor(
        themeConfig.config.accentSecondary,
        'config.accentSecondary'
      )
    );
  }

  // Validate spacing
  if (themeConfig.layoutTheme?.spacing) {
    Object.entries(themeConfig.layoutTheme.spacing).forEach(([key, value]) => {
      results.push(
        ...validateSpacing(
          value as string | number,
          `layoutTheme.spacing.${key}`
        )
      );
    });
  }

  // Validate animations
  if (themeConfig.animationTheme) {
    results.push(...validateAnimation(themeConfig.animationTheme));
  }

  // Validate accessibility
  if (themeConfig.accessibilityTheme || themeConfig.config) {
    results.push(
      ...validateAccessibility({
        ...themeConfig.accessibilityTheme,
        ...themeConfig.config,
      })
    );
  }

  return results;
};
