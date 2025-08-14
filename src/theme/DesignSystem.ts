/**
 * DESIGN SYSTEM - UNIFIED THEME CONFIGURATION
 * Professional naming following Carbon Design System conventions
 * SINGLE SOURCE OF TRUTH FOR ALL THEMING
 * 
 * Consolidates:
 * - Theme colors and variants
 * - Form theming
 * - Component variants 
 * - Pokemon design tokens
 * - All other scattered theme configs
 */

export type ThemeName = 'white' | 'g10' | 'g90' | 'g100' | 'glass' | 'premium' | 'liquid-glass' | 'holo-collection' | 'cosmic-aurora' | 'ethereal-dream';
export type ColorScheme = 'light' | 'dark' | 'system';
export type Density = 'compact' | 'comfortable' | 'spacious';
export type AnimationLevel = 'reduced' | 'normal' | 'enhanced';

export interface ThemeConfig {
  primary: string;
  primaryHover: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  muted: string;
  mutedForeground: string;
  border: string;
  input: string;
  ring: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  destructive: string;
  destructiveForeground: string;
  // Glass effects for premium themes
  glass?: string;
  glassHover?: string;
  glow?: string;
  glowIntense?: string;
  backdrop?: string;
  shimmer?: string;
}

export interface ThemeSettings {
  theme: ThemeName;
  colorScheme: ColorScheme;
  density: Density;
  animationLevel: AnimationLevel;
  glassmorphismEnabled: boolean;
  animationsEnabled: boolean;
  particleEffectsEnabled: boolean;
  reduceMotion: boolean;
  // Form theme color for backwards compatibility
  formThemeColor: 'purple' | 'blue' | 'emerald' | 'amber' | 'rose' | 'dark';
}

// ===============================
// THEME DEFINITIONS - CARBON STYLE
// ===============================

export const themes: Record<ThemeName, ThemeConfig> = {
  // Standard Carbon themes
  white: {
    primary: '#0ea5e9',
    primaryHover: '#0284c7',
    secondary: '#64748b',
    accent: '#f59e0b',
    background: '#ffffff',
    surface: '#f8fafc',
    muted: '#f1f5f9',
    mutedForeground: '#64748b',
    border: '#e2e8f0',
    input: '#ffffff',
    ring: '#0ea5e9',
    foreground: '#0f172a',
    card: '#ffffff',
    cardForeground: '#0f172a',
    popover: '#ffffff',
    popoverForeground: '#0f172a',
    destructive: '#ef4444',
    destructiveForeground: '#fef2f2',
  },

  g10: {
    primary: '#0ea5e9',
    primaryHover: '#0284c7',
    secondary: '#64748b',
    accent: '#f59e0b',
    background: '#f8fafc',
    surface: '#f1f5f9',
    muted: '#e2e8f0',
    mutedForeground: '#64748b',
    border: '#cbd5e1',
    input: '#f8fafc',
    ring: '#0ea5e9',
    foreground: '#1e293b',
    card: '#ffffff',
    cardForeground: '#1e293b',
    popover: '#ffffff',
    popoverForeground: '#1e293b',
    destructive: '#ef4444',
    destructiveForeground: '#fef2f2',
  },

  g90: {
    primary: '#06b6d4',
    primaryHover: '#0891b2',
    secondary: '#475569',
    accent: '#fbbf24',
    background: '#1e293b',
    surface: '#334155',
    muted: '#475569',
    mutedForeground: '#94a3b8',
    border: '#64748b',
    input: '#334155',
    ring: '#06b6d4',
    foreground: '#f1f5f9',
    card: '#334155',
    cardForeground: '#f1f5f9',
    popover: '#1e293b',
    popoverForeground: '#f1f5f9',
    destructive: '#ef4444',
    destructiveForeground: '#fef2f2',
  },

  g100: {
    primary: '#06b6d4',
    primaryHover: '#0891b2',
    secondary: '#475569',
    accent: '#fbbf24',
    background: '#020617',
    surface: '#0f172a',
    muted: '#1e293b',
    mutedForeground: '#94a3b8',
    border: '#334155',
    input: '#1e293b',
    ring: '#06b6d4',
    foreground: '#f8fafc',
    card: '#0f172a',
    cardForeground: '#f8fafc',
    popover: '#020617',
    popoverForeground: '#f8fafc',
    destructive: '#ef4444',
    destructiveForeground: '#fef2f2',
  },

  // Premium glassmorphism themes
  glass: {
    primary: 'rgba(102, 126, 234, 0.85)',
    primaryHover: 'rgba(90, 103, 216, 0.95)',
    secondary: 'rgba(59, 130, 246, 0.8)',
    accent: 'rgba(236, 72, 153, 0.75)',
    background: 'rgba(15, 23, 42, 0.95)',
    surface: 'rgba(30, 41, 59, 0.85)',
    muted: 'rgba(148, 163, 184, 0.6)',
    mutedForeground: 'rgba(203, 213, 225, 0.9)',
    border: 'rgba(148, 163, 184, 0.2)',
    input: 'rgba(30, 41, 59, 0.8)',
    ring: 'rgba(102, 126, 234, 0.85)',
    foreground: 'rgba(248, 250, 252, 0.95)',
    card: 'rgba(30, 41, 59, 0.85)',
    cardForeground: 'rgba(241, 245, 249, 0.92)',
    popover: 'rgba(15, 23, 42, 0.95)',
    popoverForeground: 'rgba(248, 250, 252, 0.95)',
    destructive: 'rgba(239, 68, 68, 0.9)',
    destructiveForeground: 'rgba(254, 242, 242, 0.95)',
    glass: 'rgba(255, 255, 255, 0.1)',
    glassHover: 'rgba(255, 255, 255, 0.15)',
    glow: 'rgba(102, 126, 234, 0.3)',
    glowIntense: 'rgba(102, 126, 234, 0.5)',
    backdrop: 'rgba(0, 0, 0, 0.4)',
    shimmer: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
  },

  premium: {
    primary: 'rgba(147, 51, 234, 0.9)',
    primaryHover: 'rgba(126, 34, 206, 1.0)',
    secondary: 'rgba(59, 130, 246, 0.85)',
    accent: 'rgba(251, 191, 36, 0.8)',
    background: 'rgba(17, 24, 39, 0.95)',
    surface: 'rgba(55, 65, 81, 0.9)',
    muted: 'rgba(156, 163, 175, 0.65)',
    mutedForeground: 'rgba(209, 213, 219, 0.92)',
    border: 'rgba(75, 85, 99, 0.3)',
    input: 'rgba(55, 65, 81, 0.85)',
    ring: 'rgba(147, 51, 234, 0.9)',
    foreground: 'rgba(249, 250, 251, 0.96)',
    card: 'rgba(55, 65, 81, 0.9)',
    cardForeground: 'rgba(243, 244, 246, 0.94)',
    popover: 'rgba(17, 24, 39, 0.96)',
    popoverForeground: 'rgba(249, 250, 251, 0.96)',
    destructive: 'rgba(248, 113, 113, 0.9)',
    destructiveForeground: 'rgba(254, 242, 242, 0.96)',
    glass: 'rgba(255, 255, 255, 0.15)',
    glassHover: 'rgba(255, 255, 255, 0.2)',
    glow: 'rgba(147, 51, 234, 0.4)',
    glowIntense: 'rgba(147, 51, 234, 0.6)',
    backdrop: 'rgba(0, 0, 0, 0.5)',
    shimmer: 'linear-gradient(45deg, transparent, rgba(251, 191, 36, 0.5), transparent)',
  },

  // STUNNING MODERN THEMES - 2025 Edition
  'liquid-glass': {
    primary: 'rgba(102, 126, 234, 0.85)',
    primaryHover: 'rgba(90, 103, 216, 0.95)',
    secondary: 'rgba(59, 130, 246, 0.8)',
    accent: 'rgba(236, 72, 153, 0.75)',
    background: 'rgba(15, 23, 42, 0.95)',
    surface: 'rgba(30, 41, 59, 0.85)',
    muted: 'rgba(148, 163, 184, 0.6)',
    mutedForeground: 'rgba(203, 213, 225, 0.9)',
    border: 'rgba(148, 163, 184, 0.2)',
    input: 'rgba(30, 41, 59, 0.8)',
    ring: 'rgba(102, 126, 234, 0.85)',
    foreground: 'rgba(248, 250, 252, 0.95)',
    card: 'rgba(30, 41, 59, 0.85)',
    cardForeground: 'rgba(241, 245, 249, 0.92)',
    popover: 'rgba(15, 23, 42, 0.95)',
    popoverForeground: 'rgba(248, 250, 252, 0.95)',
    destructive: 'rgba(239, 68, 68, 0.9)',
    destructiveForeground: 'rgba(254, 242, 242, 0.95)',
    glass: 'rgba(255, 255, 255, 0.12)',
    glassHover: 'rgba(255, 255, 255, 0.18)',
    glow: 'rgba(102, 126, 234, 0.35)',
    glowIntense: 'rgba(102, 126, 234, 0.55)',
    backdrop: 'rgba(0, 0, 0, 0.45)',
    shimmer: 'linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.5), transparent)',
  },

  'holo-collection': {
    primary: 'rgba(147, 51, 234, 0.9)',
    primaryHover: 'rgba(126, 34, 206, 1.0)',
    secondary: 'rgba(59, 130, 246, 0.85)',
    accent: 'rgba(251, 191, 36, 0.8)',
    background: 'rgba(17, 24, 39, 0.95)',
    surface: 'rgba(55, 65, 81, 0.9)',
    muted: 'rgba(156, 163, 175, 0.65)',
    mutedForeground: 'rgba(209, 213, 219, 0.92)',
    border: 'rgba(75, 85, 99, 0.3)',
    input: 'rgba(55, 65, 81, 0.85)',
    ring: 'rgba(147, 51, 234, 0.9)',
    foreground: 'rgba(249, 250, 251, 0.96)',
    card: 'rgba(55, 65, 81, 0.9)',
    cardForeground: 'rgba(243, 244, 246, 0.94)',
    popover: 'rgba(17, 24, 39, 0.96)',
    popoverForeground: 'rgba(249, 250, 251, 0.96)',
    destructive: 'rgba(248, 113, 113, 0.9)',
    destructiveForeground: 'rgba(254, 242, 242, 0.96)',
    glass: 'rgba(255, 255, 255, 0.15)',
    glassHover: 'rgba(255, 255, 255, 0.22)',
    glow: 'rgba(147, 51, 234, 0.4)',
    glowIntense: 'rgba(147, 51, 234, 0.6)',
    backdrop: 'rgba(0, 0, 0, 0.5)',
    shimmer: 'linear-gradient(90deg, transparent 20%, rgba(251, 191, 36, 0.6) 50%, transparent 80%)',
  },

  'cosmic-aurora': {
    primary: 'rgba(34, 197, 94, 0.85)',
    primaryHover: 'rgba(22, 163, 74, 0.95)',
    secondary: 'rgba(168, 85, 247, 0.8)',
    accent: 'rgba(14, 165, 233, 0.75)',
    background: 'rgba(3, 7, 18, 0.95)',
    surface: 'rgba(15, 23, 42, 0.9)',
    muted: 'rgba(100, 116, 139, 0.6)',
    mutedForeground: 'rgba(148, 163, 184, 0.9)',
    border: 'rgba(34, 197, 94, 0.25)',
    input: 'rgba(15, 23, 42, 0.85)',
    ring: 'rgba(34, 197, 94, 0.85)',
    foreground: 'rgba(240, 253, 244, 0.95)',
    card: 'rgba(15, 23, 42, 0.9)',
    cardForeground: 'rgba(220, 252, 231, 0.92)',
    popover: 'rgba(3, 7, 18, 0.95)',
    popoverForeground: 'rgba(240, 253, 244, 0.95)',
    destructive: 'rgba(248, 113, 113, 0.9)',
    destructiveForeground: 'rgba(254, 242, 242, 0.95)',
    glass: 'rgba(255, 255, 255, 0.1)',
    glassHover: 'rgba(255, 255, 255, 0.16)',
    glow: 'rgba(34, 197, 94, 0.3)',
    glowIntense: 'rgba(34, 197, 94, 0.5)',
    backdrop: 'rgba(0, 0, 0, 0.6)',
    shimmer: 'linear-gradient(120deg, rgba(34, 197, 94, 0.3), rgba(168, 85, 247, 0.3), rgba(14, 165, 233, 0.3))',
  },

  'ethereal-dream': {
    primary: 'rgba(236, 72, 153, 0.88)',
    primaryHover: 'rgba(219, 39, 119, 0.98)',
    secondary: 'rgba(139, 92, 246, 0.82)',
    accent: 'rgba(99, 102, 241, 0.78)',
    background: 'rgba(12, 10, 29, 0.96)',
    surface: 'rgba(31, 28, 49, 0.92)',
    muted: 'rgba(129, 140, 248, 0.4)',
    mutedForeground: 'rgba(196, 181, 253, 0.9)',
    border: 'rgba(236, 72, 153, 0.28)',
    input: 'rgba(31, 28, 49, 0.88)',
    ring: 'rgba(236, 72, 153, 0.88)',
    foreground: 'rgba(253, 244, 255, 0.96)',
    card: 'rgba(31, 28, 49, 0.92)',
    cardForeground: 'rgba(245, 208, 254, 0.94)',
    popover: 'rgba(12, 10, 29, 0.96)',
    popoverForeground: 'rgba(253, 244, 255, 0.96)',
    destructive: 'rgba(251, 113, 133, 0.9)',
    destructiveForeground: 'rgba(253, 242, 248, 0.96)',
    glass: 'rgba(255, 255, 255, 0.08)',
    glassHover: 'rgba(255, 255, 255, 0.14)',
    glow: 'rgba(236, 72, 153, 0.35)',
    glowIntense: 'rgba(236, 72, 153, 0.55)',
    backdrop: 'rgba(0, 0, 0, 0.7)',
    shimmer: 'linear-gradient(135deg, rgba(236, 72, 153, 0.4), rgba(139, 92, 246, 0.4), rgba(99, 102, 241, 0.4))',
  },
};

// ===============================
// THEME UTILITIES
// ===============================

export const defaultThemeSettings: ThemeSettings = {
  theme: 'g100',
  colorScheme: 'system',
  density: 'comfortable',
  animationLevel: 'normal',
  glassmorphismEnabled: true,
  animationsEnabled: true,
  particleEffectsEnabled: true,
  reduceMotion: false,
  formThemeColor: 'dark',
};

export const isGlassTheme = (theme: ThemeName): boolean => {
  return ['glass', 'premium', 'liquid-glass', 'holo-collection', 'cosmic-aurora', 'ethereal-dream'].includes(theme);
};

export const getThemeDisplayName = (theme: ThemeName): string => {
  const names: Record<ThemeName, string> = {
    white: 'White',
    g10: 'Gray 10',
    g90: 'Gray 90', 
    g100: 'Gray 100',
    glass: 'Glass',
    premium: 'Premium',
    'liquid-glass': 'Liquid Glass',
    'holo-collection': 'Holographic',
    'cosmic-aurora': 'Cosmic Aurora',
    'ethereal-dream': 'Ethereal Dream',
  };
  return names[theme];
};

/**
 * Apply theme following unified theme system patterns
 * PHASE 2.1: Enhanced to work with data-theme attribute switching
 */
export const applyTheme = (theme: ThemeName): void => {
  const config = themes[theme];
  if (!config) return;

  const root = document.documentElement;
  
  // UNIFIED DATA ATTRIBUTE SWITCHING
  // Set primary theme attribute for CSS variable switching
  root.setAttribute('data-theme', theme);
  
  // Legacy compatibility attributes
  root.setAttribute('data-carbon-theme', theme);
  
  // Apply CSS custom properties for additional theme-specific variables
  Object.entries(config).forEach(([key, value]) => {
    if (typeof value === 'string') {
      // Unified CSS variable naming convention
      const cssVar = `--theme-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      root.style.setProperty(cssVar, value);
      
      // Carbon compatibility variables
      const carbonVar = `--cds-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      root.style.setProperty(carbonVar, value);
    }
  });
  
  // GLASSMORPHISM SYSTEM INTEGRATION
  if (isGlassTheme(theme)) {
    root.setAttribute('data-glassmorphism', 'enabled');
    root.style.setProperty('--glass-enabled', '1');
  } else {
    root.removeAttribute('data-glassmorphism');
    root.style.setProperty('--glass-enabled', '0');
  }
  
  // DENSITY AWARENESS - will be enhanced by ThemeProvider
  root.setAttribute('data-theme-applied', Date.now().toString());

  console.log(`✅ Applied unified theme: ${theme} with data-theme attribute`);
};

/**
 * Get theme configuration
 */
export const getTheme = (theme: ThemeName): ThemeConfig => {
  return themes[theme] || themes.g100;
};

/**
 * Get system color scheme
 */
export const getSystemColorScheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

/**
 * Resolve actual theme based on settings
 */
export const resolveTheme = (settings: ThemeSettings): ThemeName => {
  if (settings.colorScheme === 'system') {
    const systemScheme = getSystemColorScheme();
    // If user selected a glass theme, keep it regardless of system preference
    if (isGlassTheme(settings.theme)) {
      return settings.theme;
    }
    // For standard themes, follow system preference
    return systemScheme === 'dark' ? 'g100' : 'white';
  }
  return settings.theme;
};

// ===============================
// THEME STORAGE
// ===============================

const THEME_STORAGE_KEY = 'design-system-theme';

export const saveThemeSettings = (settings: ThemeSettings): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.warn('Failed to save theme settings:', error);
  }
};

export const loadThemeSettings = (): ThemeSettings => {
  if (typeof window === 'undefined') return defaultThemeSettings;
  
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...defaultThemeSettings, ...parsed };
    }
  } catch (error) {
    console.warn('Failed to load theme settings:', error);
  }
  
  return defaultThemeSettings;
};