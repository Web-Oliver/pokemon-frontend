/**
 * Theme Property Manager
 * Layer 1: Core/Foundation (CLAUDE.md Architecture)
 *
 * SOLID Principles:
 * - SRP: Single responsibility for managing CSS custom properties
 * - OCP: Open for extension via configuration objects
 * - DRY: Eliminates theme context duplication (64+ lines)
 * - DIP: Depends on abstractions via interfaces
 */

export interface AnimationConfig {
  animationIntensity: 'subtle' | 'normal' | 'enhanced' | 'disabled';
}

export interface VisualConfig {
  glassmorphismIntensity: number;
}

export interface ThemeConfig {
  animation: AnimationConfig;
  visual: VisualConfig;
}

export interface FormTheme {
  button: {
    primary: string;
    primaryHover: string;
  };
  header: {
    background: string;
  };
  element: {
    border: string;
    focus: string;
  };
}

/**
 * Consolidated theme property management utility
 * Eliminates duplication between ThemeContext and ComposedThemeProvider
 */
export class ThemePropertyManager {
  /**
   * Apply core theme tokens to CSS custom properties
   * Consolidates the duplicated CSS property setting logic
   */
  static applyThemeTokens(
    root: HTMLElement,
    formTheme: FormTheme,
    densityMultiplier: number = 1
  ): void {
    // Apply theme tokens
    root.style.setProperty(
      '--theme-primary-gradient',
      formTheme.button.primary
    );
    root.style.setProperty(
      '--theme-primary-hover',
      formTheme.button.primaryHover
    );
    root.style.setProperty(
      '--theme-header-background',
      formTheme.header.background
    );
    root.style.setProperty('--theme-border-color', formTheme.element.border);
    root.style.setProperty('--theme-focus-ring', formTheme.element.focus);

    // Density spacing
    root.style.setProperty(
      '--density-spacing-xs',
      `${0.25 * densityMultiplier}rem`
    );
    root.style.setProperty(
      '--density-spacing-sm',
      `${0.5 * densityMultiplier}rem`
    );
    root.style.setProperty(
      '--density-spacing-md',
      `${1 * densityMultiplier}rem`
    );
    root.style.setProperty(
      '--density-spacing-lg',
      `${1.5 * densityMultiplier}rem`
    );
    root.style.setProperty(
      '--density-spacing-xl',
      `${2 * densityMultiplier}rem`
    );
  }

  /**
   * Apply animation properties to CSS custom properties
   * Consolidates animation duration mapping logic
   */
  static applyAnimationProperties(
    root: HTMLElement,
    themeConfig: ThemeConfig
  ): void {
    const animationDurations = this.getAnimationDurations(
      themeConfig.animation.animationIntensity
    );

    // Animation durations
    root.style.setProperty(
      '--animation-duration-fast',
      animationDurations.fast
    );
    root.style.setProperty(
      '--animation-duration-normal',
      animationDurations.normal
    );
    root.style.setProperty(
      '--animation-duration-slow',
      animationDurations.slow
    );

    // Animation delays for orchestrated effects
    root.style.setProperty('--animation-delay-short', '0.2s');
    root.style.setProperty('--animation-delay-medium', '0.5s');
    root.style.setProperty('--animation-delay-long', '0.9s');

    // Complex animation durations for special effects
    root.style.setProperty('--animation-duration-orbit', '15s');
    root.style.setProperty('--animation-duration-particle', '20s');
  }

  /**
   * Apply glassmorphism properties to CSS custom properties
   * Consolidates visual effect calculations
   */
  static applyGlassmorphismProperties(
    root: HTMLElement,
    themeConfig: ThemeConfig
  ): void {
    const glassAlpha = themeConfig.visual.glassmorphismIntensity / 100;
    root.style.setProperty('--glass-alpha', glassAlpha.toString());
    root.style.setProperty(
      '--glass-blur',
      `${themeConfig.visual.glassmorphismIntensity / 5}px`
    );
  }

  /**
   * Complete theme property application
   * Single entry point for all theme-related CSS custom property management
   */
  static applyAllThemeProperties(
    root: HTMLElement,
    formTheme: FormTheme,
    themeConfig: ThemeConfig,
    densityMultiplier: number = 1
  ): void {
    this.applyThemeTokens(root, formTheme, densityMultiplier);
    this.applyAnimationProperties(root, themeConfig);
    this.applyGlassmorphismProperties(root, themeConfig);
  }

  /**
   * Legacy compatibility method for old ThemeContext usage
   * Maintains backward compatibility while using new consolidated logic
   */
  static applyLegacyThemeProperties(
    root: HTMLElement,
    formTheme: FormTheme,
    themeConfig: { animationIntensity: string },
    densityMultiplier: number = 1
  ): void {
    // Convert legacy config to new format
    const modernConfig: ThemeConfig = {
      animation: { animationIntensity: themeConfig.animationIntensity as any },
      visual: { glassmorphismIntensity: 50 }, // Default fallback
    };

    this.applyThemeTokens(root, formTheme, densityMultiplier);
    this.applyAnimationProperties(root, modernConfig);
  }

  private static getAnimationDurations(animationIntensity: string) {
    return (
      {
        subtle: { fast: '0.1s', normal: '0.2s', slow: '0.3s' },
        normal: { fast: '0.15s', normal: '0.3s', slow: '0.5s' },
        enhanced: { fast: '0.2s', normal: '0.4s', slow: '0.7s' },
        disabled: { fast: '0s', normal: '0s', slow: '0s' },
      }[animationIntensity] || { fast: '0.15s', normal: '0.3s', slow: '0.5s' }
    );
  }
}
