/**
 * CSS VARIABLE GENERATOR - Pokemon Collection Theme System
 * Phase 1.2 Implementation - CSS variable generation utility
 *
 * Following THEME_ARCHITECTURE_DESIGN.md specifications:
 * - Token-to-CSS conversion utility
 * - Theme switching functionality  
 * - Runtime CSS injection
 * - Performance optimization
 */

import { spacingTokens, typographyTokens, radiusTokens, shadowTokens, animationTokens } from './tokens';
import { ThemeConfig, ThemeSettings, DensityMode, MotionMode, themeDefinitions } from './themes';

interface CSSVariableMap {
  [key: string]: string;
}

/**
 * Generate CSS variables from theme configuration
 */
export function generateCSSVariables(
  theme: ThemeConfig,
  density: DensityMode = 'comfortable',
  motion: MotionMode = 'normal'
): CSSVariableMap {
  const variables: CSSVariableMap = {};

  // Generate color variables
  Object.entries(theme.colors).forEach(([key, value]) => {
    variables[`--${key}`] = value;
    
    // Convert to HSL for compatibility with shadcn/ui
    if (key === 'background') variables['--background'] = convertToHSL(value);
    if (key === 'foreground') variables['--foreground'] = convertToHSL(value);
    if (key === 'primary') variables['--primary'] = convertToHSL(value);
    if (key === 'secondary') variables['--secondary'] = convertToHSL(value);
    if (key === 'muted') variables['--muted'] = convertToHSL(value);
    if (key === 'accent') variables['--accent'] = convertToHSL(value);
    if (key === 'destructive') variables['--destructive'] = convertToHSL(value);
    if (key === 'border') variables['--border'] = convertToHSL(value);
    if (key === 'input') variables['--input'] = convertToHSL(value);
    if (key === 'ring') variables['--ring'] = convertToHSL(value);
    if (key === 'card') variables['--card'] = convertToHSL(value);
    if (key === 'cardForeground') variables['--card-foreground'] = convertToHSL(value);
  });

  // Generate spacing variables based on density
  const spacingMultiplier = {
    compact: 0.8,
    comfortable: 1.0,
    spacious: 1.2
  }[density];

  Object.entries(spacingTokens).forEach(([key, value]) => {
    if (typeof value === 'string' && value.includes('rem')) {
      const numValue = parseFloat(value.replace('rem', ''));
      variables[`--spacing-${key}`] = `${numValue * spacingMultiplier}rem`;
      variables[`--density-spacing-${key}`] = `${numValue * spacingMultiplier}rem`;
    } else {
      variables[`--spacing-${key}`] = value;
      variables[`--density-spacing-${key}`] = value;
    }
  });

  // Generate animation duration variables based on motion preference
  const durationMultiplier = {
    reduced: 0.1,
    normal: 1.0, 
    enhanced: 1.5
  }[motion];

  Object.entries(animationTokens.duration).forEach(([key, value]) => {
    const numValue = parseFloat(value.replace('ms', ''));
    variables[`--duration-${key}`] = `${Math.round(numValue * durationMultiplier)}ms`;
    variables[`--animation-duration-${key}`] = `${Math.round(numValue * durationMultiplier)}ms`;
  });

  // Generate effect variables
  if (theme.effects) {
    if (theme.effects.glassmorphism) {
      Object.entries(theme.effects.glassmorphism).forEach(([key, value]) => {
        variables[`--glass-${key}`] = value;
      });
    }

    if (theme.effects.shadows) {
      Object.entries(theme.effects.shadows).forEach(([key, value]) => {
        variables[`--shadow-${key}`] = value;
        variables[`--theme-shadow-${key}`] = value;
      });
    }

    if (theme.effects.gradients) {
      Object.entries(theme.effects.gradients).forEach(([key, value]) => {
        variables[`--gradient-${key}`] = value;
      });
    }
  }

  // Generate typography variables
  Object.entries(typographyTokens.fontSize).forEach(([key, [size, { lineHeight }]]) => {
    variables[`--font-size-${key}`] = size;
    variables[`--line-height-${key}`] = lineHeight;
  });

  // Generate radius variables
  Object.entries(radiusTokens).forEach(([key, value]) => {
    variables[`--radius-${key}`] = value;
    if (key === 'lg') variables['--radius'] = value; // Default radius for shadcn/ui
  });

  // Generate shadow variables
  Object.entries(shadowTokens).forEach(([key, value]) => {
    variables[`--shadow-${key}`] = value;
  });

  // Generate easing variables
  Object.entries(animationTokens.easing).forEach(([key, value]) => {
    variables[`--easing-${key}`] = value;
  });

  return variables;
}

/**
 * Apply CSS variables to document root
 */
export function applyCSSVariables(variables: CSSVariableMap): void {
  const root = document.documentElement;
  
  Object.entries(variables).forEach(([property, value]) => {
    root.style.setProperty(property, value);
  });
}

/**
 * Generate complete CSS string from theme settings
 */
export function generateThemeCSS(settings: ThemeSettings): string {
  const resolvedMode = resolveThemeMode(settings.mode);
  const themeConfig = themeDefinitions[settings.name][resolvedMode];
  const variables = generateCSSVariables(themeConfig, settings.density, settings.motion);

  let css = ':root {\n';
  Object.entries(variables).forEach(([property, value]) => {
    css += `  ${property}: ${value};\n`;
  });
  css += '}';

  // Add reduced motion support
  if (settings.reducedMotion || settings.motion === 'reduced') {
    css += `\n\n@media (prefers-reduced-motion: reduce) {\n`;
    css += `  :root {\n`;
    css += `    --duration-fast: 0ms;\n`;
    css += `    --duration-normal: 0ms;\n`;
    css += `    --duration-slow: 0ms;\n`;
    css += `    --animation-duration-fast: 0ms;\n`;
    css += `    --animation-duration-normal: 0ms;\n`;
    css += `    --animation-duration-slow: 0ms;\n`;
    css += `  }\n`;
    css += `}`;
  }

  // Add high contrast mode support
  if (settings.highContrast) {
    css += `\n\n@media (prefers-contrast: high) {\n`;
    css += `  :root {\n`;
    css += `    --primary: oklch(0.4 0.3 250);\n`;
    css += `    --background: oklch(1 0 0);\n`;
    css += `    --foreground: oklch(0 0 0);\n`;
    css += `  }\n`;
    css += `}`;
  }

  return css;
}

/**
 * Resolve theme mode to light or dark
 */
function resolveThemeMode(mode: 'light' | 'dark' | 'system'): 'light' | 'dark' {
  if (mode === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return mode;
}

/**
 * Convert color value to HSL format for shadcn/ui compatibility
 */
function convertToHSL(color: string): string {
  // For now, return the color as-is since we're using OKLCH values
  // In a full implementation, we'd convert OKLCH to HSL
  // This is a placeholder for the conversion logic
  return color.replace(/oklch\(([^)]+)\)/, '$1');
}

/**
 * Create style element and inject CSS
 */
export function injectThemeCSS(css: string): void {
  const existingStyle = document.getElementById('theme-variables');
  if (existingStyle) {
    existingStyle.textContent = css;
  } else {
    const style = document.createElement('style');
    style.id = 'theme-variables';
    style.textContent = css;
    document.head.appendChild(style);
  }
}

/**
 * Apply complete theme with CSS injection
 */
export function applyCompleteTheme(settings: ThemeSettings): void {
  const css = generateThemeCSS(settings);
  injectThemeCSS(css);
  
  // Update document attributes for CSS targeting
  const root = document.documentElement;
  root.setAttribute('data-theme', settings.name);
  root.setAttribute('data-mode', settings.mode);
  root.setAttribute('data-density', settings.density);
  root.setAttribute('data-motion', settings.motion);
  root.setAttribute('data-reduced-motion', String(settings.reducedMotion));
  root.setAttribute('data-high-contrast', String(settings.highContrast));
  root.setAttribute('data-glassmorphism', String(settings.glassmorphismEnabled));
}