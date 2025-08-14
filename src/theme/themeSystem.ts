/**
 * UNIFIED THEME SYSTEM - Pokemon Collection
 * Single source of truth for all theme configuration
 * 
 * Following CLAUDE.md principles:
 * - DRY: Single theme configuration eliminates duplication
 * - KISS: Simple theme system without over-abstraction  
 * - SRP: Handles only theme configuration and application
 * 
 * Replaces 12+ over-engineered theme files with one clean implementation
 */

export type ThemeName = 'light' | 'dark' | 'context7-premium' | 'context7-futuristic' | 'dba-cosmic' | 'minimal';
export type ColorScheme = 'light' | 'dark' | 'system';
export type Density = 'compact' | 'comfortable' | 'spacious';
export type AnimationLevel = 'reduced' | 'normal' | 'enhanced';

export interface ThemeConfig {
  // Color tokens
  primary: string;
  primaryHover: string;
  secondary: string;
  accent: string;
  
  // Background tokens
  bgPrimary: string;
  bgSecondary: string;
  bgAccent: string;
  
  // Border tokens
  borderPrimary: string;
  borderSecondary: string;
  
  // Glassmorphism tokens
  glassBackground: string;
  glassBorder: string;
  glassBlur: string;
  
  // Shadow tokens
  shadowPrimary: string;
  shadowHover: string;
}

export interface ThemeSettings {
  theme: ThemeName;
  colorScheme: ColorScheme;
  density: Density;
  animationLevel: AnimationLevel;
  glassmorphismEnabled: boolean;
}

// Theme configurations
export const themes: Record<ThemeName, ThemeConfig> = {
  light: {
    primary: '#0ea5e9',
    primaryHover: '#0284c7',
    secondary: '#6366f1',
    accent: '#8b5cf6',
    bgPrimary: '#ffffff',
    bgSecondary: '#f8fafc',
    bgAccent: '#f1f5f9',
    borderPrimary: '#e2e8f0',
    borderSecondary: '#cbd5e1',
    glassBackground: 'rgba(255, 255, 255, 0.8)',
    glassBorder: 'rgba(255, 255, 255, 0.2)',
    glassBlur: '12px',
    shadowPrimary: '0 4px 12px rgba(0, 0, 0, 0.1)',
    shadowHover: '0 8px 25px rgba(0, 0, 0, 0.15)',
  },
  dark: {
    primary: '#06b6d4',
    primaryHover: '#0891b2',
    secondary: '#6366f1',
    accent: '#8b5cf6',
    bgPrimary: '#0f172a',
    bgSecondary: '#1e293b',
    bgAccent: '#334155',
    borderPrimary: '#475569',
    borderSecondary: '#64748b',
    glassBackground: 'rgba(15, 23, 42, 0.8)',
    glassBorder: 'rgba(255, 255, 255, 0.1)',
    glassBlur: '12px',
    shadowPrimary: '0 4px 12px rgba(0, 0, 0, 0.4)',
    shadowHover: '0 8px 25px rgba(0, 0, 0, 0.6)',
  },
  'context7-premium': {
    primary: '#667eea',
    primaryHover: '#5a67d8',
    secondary: '#764ba2',
    accent: '#e94560',
    bgPrimary: '#1a1a2e',
    bgSecondary: '#16213e',
    bgAccent: '#0f3460',
    borderPrimary: '#2d3748',
    borderSecondary: '#4a5568',
    glassBackground: 'rgba(26, 26, 46, 0.8)',
    glassBorder: 'rgba(102, 126, 234, 0.2)',
    glassBlur: '16px',
    shadowPrimary: '0 4px 20px rgba(102, 126, 234, 0.3)',
    shadowHover: '0 8px 30px rgba(102, 126, 234, 0.5)',
  },
  'context7-futuristic': {
    primary: '#00c6ff',
    primaryHover: '#0072ff',
    secondary: '#72ffb6',
    accent: '#ff0080',
    bgPrimary: '#0f1419',
    bgSecondary: '#1a1f29',
    bgAccent: '#252a3a',
    borderPrimary: '#2d3748',
    borderSecondary: '#4a5568',
    glassBackground: 'rgba(15, 20, 25, 0.8)',
    glassBorder: 'rgba(0, 198, 255, 0.2)',
    glassBlur: '20px',
    shadowPrimary: '0 4px 20px rgba(0, 198, 255, 0.3)',
    shadowHover: '0 8px 30px rgba(0, 198, 255, 0.5)',
  },
  'dba-cosmic': {
    primary: '#a855f7',
    primaryHover: '#9333ea',
    secondary: '#ec4899',
    accent: '#f97316',
    bgPrimary: '#0c0a1d',
    bgSecondary: '#1a0933',
    bgAccent: '#2d1b4e',
    borderPrimary: '#3730a3',
    borderSecondary: '#5b21b6',
    glassBackground: 'rgba(12, 10, 29, 0.8)',
    glassBorder: 'rgba(168, 85, 247, 0.2)',
    glassBlur: '24px',
    shadowPrimary: '0 4px 20px rgba(168, 85, 247, 0.4)',
    shadowHover: '0 8px 30px rgba(168, 85, 247, 0.6)',
  },
  minimal: {
    primary: '#10b981',
    primaryHover: '#059669',
    secondary: '#06b6d4',
    accent: '#8b5cf6',
    bgPrimary: '#ffffff',
    bgSecondary: '#fafafa',
    bgAccent: '#f5f5f5',
    borderPrimary: '#e5e5e5',
    borderSecondary: '#d4d4d4',
    glassBackground: 'rgba(255, 255, 255, 0.6)',
    glassBorder: 'rgba(0, 0, 0, 0.1)',
    glassBlur: '8px',
    shadowPrimary: '0 2px 8px rgba(0, 0, 0, 0.08)',
    shadowHover: '0 4px 16px rgba(0, 0, 0, 0.12)',
  },
};

// Default theme settings
export const defaultThemeSettings: ThemeSettings = {
  theme: 'dark',
  colorScheme: 'system',
  density: 'comfortable',
  animationLevel: 'normal',
  glassmorphismEnabled: true,
};

// Storage keys
const STORAGE_KEY = 'pokemon-theme-settings';

/**
 * Apply theme to document root
 */
export const applyTheme = (themeName: ThemeName, settings: Partial<ThemeSettings> = {}): void => {
  const theme = themes[themeName];
  const root = document.documentElement;
  
  // Apply theme color tokens
  Object.entries(theme).forEach(([key, value]) => {
    root.style.setProperty(`--theme-${key}`, value);
  });
  
  // Apply density multiplier
  const densityMultiplier = {
    compact: 0.8,
    comfortable: 1.0,
    spacious: 1.2,
  }[settings.density || 'comfortable'];
  
  root.style.setProperty('--density-multiplier', densityMultiplier.toString());
  
  // Apply spacing tokens based on density
  const baseSpacing = [0.25, 0.5, 0.75, 1, 1.5, 2, 3];
  baseSpacing.forEach((space, index) => {
    const size = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'][index];
    root.style.setProperty(`--spacing-${size}`, `${space * densityMultiplier}rem`);
  });
  
  // Apply animation durations based on level
  const animationDurations = {
    reduced: { fast: '0s', normal: '0s', slow: '0s' },
    normal: { fast: '0.15s', normal: '0.3s', slow: '0.5s' },
    enhanced: { fast: '0.2s', normal: '0.4s', slow: '0.7s' },
  }[settings.animationLevel || 'normal'];
  
  Object.entries(animationDurations).forEach(([speed, duration]) => {
    root.style.setProperty(`--animation-${speed}`, duration);
  });
  
  // Apply glassmorphism toggle
  root.style.setProperty(
    '--glass-opacity',
    settings.glassmorphismEnabled !== false ? '1' : '0'
  );
  
  // Apply theme class for CSS targeting
  root.className = root.className.replace(/theme-\w+/g, '');
  root.classList.add(`theme-${themeName}`);
};

/**
 * Save theme settings to localStorage
 */
export const saveThemeSettings = (settings: ThemeSettings): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.warn('Failed to save theme settings:', error);
  }
};

/**
 * Load theme settings from localStorage
 */
export const loadThemeSettings = (): ThemeSettings => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...defaultThemeSettings, ...parsed };
    }
  } catch (error) {
    console.warn('Failed to load theme settings:', error);
  }
  return defaultThemeSettings;
};

/**
 * Get system color scheme preference
 */
export const getSystemColorScheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

/**
 * Resolve theme name based on color scheme setting
 */
export const resolveThemeName = (settings: ThemeSettings): ThemeName => {
  if (settings.colorScheme === 'system') {
    const systemScheme = getSystemColorScheme();
    return systemScheme === 'light' ? 'light' : settings.theme;
  }
  return settings.colorScheme === 'light' ? 'light' : settings.theme;
};