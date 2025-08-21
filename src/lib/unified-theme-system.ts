/**
 * UNIFIED THEME SYSTEM - 2025 CENTRALIZED ARCHITECTURE
 * 
 * Single source of truth for all theming functionality
 * Integrates modern CSS features with React state management
 * 
 * Features:
 * - CSS Custom Properties with data-attribute switching
 * - CSS light-dark() function support
 * - Tailus Themer integration patterns
 * - Performance-optimized theme switching
 * - Full TypeScript support
 * - Accessibility compliance (WCAG 2.1 AA)
 */

// ==========================================
// CORE TYPE DEFINITIONS
// ==========================================

export type ThemeMode = 
  // Standard modes
  | 'light' | 'dark' | 'system'
  // Pokemon brand
  | 'pokemon'
  // Glass themes  
  | 'glass' | 'premium'
  // Premium collection
  | 'liquid-glass' | 'holo-collection'
  | 'cosmic-aurora' | 'ethereal-dream'
  // Carbon design
  | 'g10' | 'g90' | 'g100';

export type DensityMode = 'compact' | 'comfortable' | 'spacious';
export type AnimationLevel = 'reduced' | 'normal' | 'enhanced';
export type GlassmorphismLevel = 'off' | 'subtle' | 'medium' | 'intense';

export interface ThemeConfig {
  // Core colors (HSL values for CSS custom properties)
  background: string;
  foreground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  accent: string;
  accentForeground: string;
  muted: string;
  mutedForeground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  border: string;
  input: string;
  ring: string;
  destructive: string;
  destructiveForeground: string;
  
  // Chart colors
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;
  
  // Enhanced features
  glassmorphismSupport: boolean;
  particleEffects: boolean;
  premiumAnimations: boolean;
  
  // Shadows (CSS values)
  shadowPrimary: string;
  shadowHover: string;
  shadowGlass?: string;
  shadowNeon?: string;
}

export interface ThemeSettings {
  mode: ThemeMode;
  density: DensityMode;
  animationLevel: AnimationLevel;
  glassmorphismLevel: GlassmorphismLevel;
  
  // Accessibility preferences
  reduceMotion: boolean;
  highContrast: boolean;
  
  // Feature toggles
  particleEffects: boolean;
  soundEffects: boolean;
  
  // Advanced options
  customAccentColor?: string;
  borderRadius: 'none' | 'small' | 'medium' | 'large' | 'full';
}

// ==========================================
// THEME DEFINITIONS
// ==========================================

export const THEME_REGISTRY: Record<ThemeMode, ThemeConfig> = {
  // STANDARD THEMES
  light: {
    background: '0 0% 100%',
    foreground: '222.2 84% 4.9%',
    primary: '222.2 47.4% 11.2%',
    primaryForeground: '210 40% 98%',
    secondary: '210 40% 96%',
    secondaryForeground: '222.2 47.4% 11.2%',
    accent: '210 40% 96%',
    accentForeground: '222.2 47.4% 11.2%',
    muted: '210 40% 98%',
    mutedForeground: '215.4 16.3% 46.9%',
    card: '0 0% 100%',
    cardForeground: '222.2 84% 4.9%',
    popover: '0 0% 100%',
    popoverForeground: '222.2 84% 4.9%',
    border: '214.3 31.8% 91.4%',
    input: '214.3 31.8% 91.4%',
    ring: '222.2 84% 4.9%',
    destructive: '0 84.2% 60.2%',
    destructiveForeground: '210 40% 98%',
    chart1: '12 76% 61%',
    chart2: '173 58% 39%',
    chart3: '197 37% 24%',
    chart4: '43 74% 66%',
    chart5: '27 87% 67%',
    glassmorphismSupport: false,
    particleEffects: false,
    premiumAnimations: false,
    shadowPrimary: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    shadowHover: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  },

  dark: {
    background: '222.2 84% 4.9%',
    foreground: '210 40% 98%',
    primary: '210 40% 98%',
    primaryForeground: '222.2 47.4% 11.2%',
    secondary: '217.2 32.6% 17.5%',
    secondaryForeground: '210 40% 98%',
    accent: '217.2 32.6% 17.5%',
    accentForeground: '210 40% 98%',
    muted: '217.2 32.6% 17.5%',
    mutedForeground: '215 20.2% 65.1%',
    card: '222.2 84% 4.9%',
    cardForeground: '210 40% 98%',
    popover: '222.2 84% 4.9%',
    popoverForeground: '210 40% 98%',
    border: '217.2 32.6% 17.5%',
    input: '217.2 32.6% 17.5%',
    ring: '212.7 26.8% 83.9%',
    destructive: '0 62.8% 30.6%',
    destructiveForeground: '210 40% 98%',
    chart1: '220 70% 50%',
    chart2: '160 60% 45%',
    chart3: '30 80% 55%',
    chart4: '280 65% 60%',
    chart5: '340 75% 55%',
    glassmorphismSupport: false,
    particleEffects: true,
    premiumAnimations: true,
    shadowPrimary: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
    shadowHover: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.25)',
  },

  system: {
    // Inherits from light/dark based on system preference
    // This is handled dynamically in the applyTheme function
    ...{} as ThemeConfig // Will be populated at runtime
  },

  // POKEMON BRAND THEME
  pokemon: {
    background: '222.2 84% 4.9%',
    foreground: '210 40% 98%',
    primary: '210 100% 37%', // Pokemon blue
    primaryForeground: '210 40% 98%',
    secondary: '45 100% 50%', // Pokemon yellow
    secondaryForeground: '222.2 47.4% 11.2%',
    accent: '0 100% 50%', // Pokemon red
    accentForeground: '210 40% 98%',
    muted: '217.2 32.6% 17.5%',
    mutedForeground: '215 20.2% 65.1%',
    card: '222.2 84% 4.9%',
    cardForeground: '210 40% 98%',
    popover: '222.2 84% 4.9%',
    popoverForeground: '210 40% 98%',
    border: '217.2 32.6% 17.5%',
    input: '217.2 32.6% 17.5%',
    ring: '210 100% 37%',
    destructive: '0 100% 50%',
    destructiveForeground: '210 40% 98%',
    chart1: '210 100% 37%',
    chart2: '45 100% 50%',
    chart3: '0 100% 50%',
    chart4: '142 100% 32%',
    chart5: '280 65% 60%',
    glassmorphismSupport: true,
    particleEffects: true,
    premiumAnimations: true,
    shadowPrimary: '0 4px 6px -1px rgba(6, 182, 212, 0.2), 0 2px 4px -1px rgba(6, 182, 212, 0.1)',
    shadowHover: '0 10px 15px -3px rgba(6, 182, 212, 0.3), 0 4px 6px -2px rgba(6, 182, 212, 0.15)',
    shadowNeon: '0 0 20px rgba(6, 182, 212, 0.5)',
  },

  // GLASSMORPHISM THEMES
  glass: {
    background: '222.2 84% 4.9%',
    foreground: '210 40% 98%',
    primary: '210 40% 98%',
    primaryForeground: '222.2 47.4% 11.2%',
    secondary: '217.2 32.6% 17.5%',
    secondaryForeground: '210 40% 98%',
    accent: '217.2 32.6% 17.5%',
    accentForeground: '210 40% 98%',
    muted: '217.2 32.6% 17.5%',
    mutedForeground: '215 20.2% 65.1%',
    card: '222.2 84% 4.9%',
    cardForeground: '210 40% 98%',
    popover: '222.2 84% 4.9%',
    popoverForeground: '210 40% 98%',
    border: '217.2 32.6% 17.5%',
    input: '217.2 32.6% 17.5%',
    ring: '212.7 26.8% 83.9%',
    destructive: '0 62.8% 30.6%',
    destructiveForeground: '210 40% 98%',
    chart1: '220 70% 50%',
    chart2: '160 60% 45%',
    chart3: '30 80% 55%',
    chart4: '280 65% 60%',
    chart5: '340 75% 55%',
    glassmorphismSupport: true,
    particleEffects: true,
    premiumAnimations: true,
    shadowPrimary: '0 8px 32px rgba(31, 38, 135, 0.37)',
    shadowHover: '0 12px 40px rgba(31, 38, 135, 0.45)',
    shadowGlass: '0 8px 32px rgba(31, 38, 135, 0.37)',
  },

  premium: {
    background: '222.2 84% 4.9%',
    foreground: '210 40% 98%',
    primary: '258 90% 66%', // Premium purple
    primaryForeground: '210 40% 98%',
    secondary: '217.2 32.6% 17.5%',
    secondaryForeground: '210 40% 98%',
    accent: '47 96% 53%', // Premium gold
    accentForeground: '222.2 47.4% 11.2%',
    muted: '217.2 32.6% 17.5%',
    mutedForeground: '215 20.2% 65.1%',
    card: '222.2 84% 4.9%',
    cardForeground: '210 40% 98%',
    popover: '222.2 84% 4.9%',
    popoverForeground: '210 40% 98%',
    border: '217.2 32.6% 17.5%',
    input: '217.2 32.6% 17.5%',
    ring: '258 90% 66%',
    destructive: '0 62.8% 30.6%',
    destructiveForeground: '210 40% 98%',
    chart1: '258 90% 66%',
    chart2: '47 96% 53%',
    chart3: '280 100% 70%',
    chart4: '339 90% 51%',
    chart5: '197 71% 73%',
    glassmorphismSupport: true,
    particleEffects: true,
    premiumAnimations: true,
    shadowPrimary: '0 12px 40px rgba(139, 92, 246, 0.4)',
    shadowHover: '0 20px 60px rgba(139, 92, 246, 0.5)',
    shadowGlass: '0 12px 40px rgba(139, 92, 246, 0.3)',
    shadowNeon: '0 0 40px rgba(139, 92, 246, 0.6)',
  },

  // PREMIUM COLLECTION THEMES
  'liquid-glass': {
    background: '222.2 84% 4.9%',
    foreground: '210 40% 98%',
    primary: '210 100% 56%', // Cyan
    primaryForeground: '210 40% 98%',
    secondary: '217.2 32.6% 17.5%',
    secondaryForeground: '210 40% 98%',
    accent: '326 78% 68%', // Pink
    accentForeground: '210 40% 98%',
    muted: '217.2 32.6% 17.5%',
    mutedForeground: '215 20.2% 65.1%',
    card: '222.2 84% 4.9%',
    cardForeground: '210 40% 98%',
    popover: '222.2 84% 4.9%',
    popoverForeground: '210 40% 98%',
    border: '217.2 32.6% 17.5%',
    input: '217.2 32.6% 17.5%',
    ring: '210 100% 56%',
    destructive: '0 62.8% 30.6%',
    destructiveForeground: '210 40% 98%',
    chart1: '210 100% 56%',
    chart2: '326 78% 68%',
    chart3: '280 100% 70%',
    chart4: '142 76% 36%',
    chart5: '47 96% 53%',
    glassmorphismSupport: true,
    particleEffects: true,
    premiumAnimations: true,
    shadowPrimary: '0 15px 50px rgba(6, 182, 212, 0.4)',
    shadowHover: '0 25px 70px rgba(6, 182, 212, 0.5)',
    shadowGlass: '0 15px 50px rgba(6, 182, 212, 0.3)',
    shadowNeon: '0 0 50px rgba(6, 182, 212, 0.7)',
  },

  'holo-collection': {
    background: '222.2 84% 4.9%',
    foreground: '210 40% 98%',
    primary: '280 100% 70%', // Violet
    primaryForeground: '210 40% 98%',
    secondary: '217.2 32.6% 17.5%',
    secondaryForeground: '210 40% 98%',
    accent: '47 96% 53%', // Gold
    accentForeground: '222.2 47.4% 11.2%',
    muted: '217.2 32.6% 17.5%',
    mutedForeground: '215 20.2% 65.1%',
    card: '222.2 84% 4.9%',
    cardForeground: '210 40% 98%',
    popover: '222.2 84% 4.9%',
    popoverForeground: '210 40% 98%',
    border: '217.2 32.6% 17.5%',
    input: '217.2 32.6% 17.5%',
    ring: '280 100% 70%',
    destructive: '0 62.8% 30.6%',
    destructiveForeground: '210 40% 98%',
    chart1: '280 100% 70%',
    chart2: '47 96% 53%',
    chart3: '326 78% 68%',
    chart4: '210 100% 56%',
    chart5: '142 76% 36%',
    glassmorphismSupport: true,
    particleEffects: true,
    premiumAnimations: true,
    shadowPrimary: '0 20px 60px rgba(168, 85, 247, 0.4)',
    shadowHover: '0 30px 80px rgba(168, 85, 247, 0.5)',
    shadowGlass: '0 20px 60px rgba(168, 85, 247, 0.3)',
    shadowNeon: '0 0 60px rgba(168, 85, 247, 0.8)',
  },

  'cosmic-aurora': {
    background: '222.2 84% 4.9%',
    foreground: '210 40% 98%',
    primary: '142 76% 36%', // Emerald
    primaryForeground: '210 40% 98%',
    secondary: '217.2 32.6% 17.5%',
    secondaryForeground: '210 40% 98%',
    accent: '210 100% 56%', // Cyan
    accentForeground: '210 40% 98%',
    muted: '217.2 32.6% 17.5%',
    mutedForeground: '215 20.2% 65.1%',
    card: '222.2 84% 4.9%',
    cardForeground: '210 40% 98%',
    popover: '222.2 84% 4.9%',
    popoverForeground: '210 40% 98%',
    border: '217.2 32.6% 17.5%',
    input: '217.2 32.6% 17.5%',
    ring: '142 76% 36%',
    destructive: '0 62.8% 30.6%',
    destructiveForeground: '210 40% 98%',
    chart1: '142 76% 36%',
    chart2: '210 100% 56%',
    chart3: '280 100% 70%',
    chart4: '47 96% 53%',
    chart5: '326 78% 68%',
    glassmorphismSupport: true,
    particleEffects: true,
    premiumAnimations: true,
    shadowPrimary: '0 25px 70px rgba(16, 185, 129, 0.4)',
    shadowHover: '0 35px 90px rgba(16, 185, 129, 0.5)',
    shadowGlass: '0 25px 70px rgba(16, 185, 129, 0.3)',
    shadowNeon: '0 0 70px rgba(16, 185, 129, 0.9)',
  },

  'ethereal-dream': {
    background: '222.2 84% 4.9%',
    foreground: '210 40% 98%',
    primary: '326 78% 68%', // Pink
    primaryForeground: '210 40% 98%',
    secondary: '217.2 32.6% 17.5%',
    secondaryForeground: '210 40% 98%',
    accent: '280 100% 70%', // Violet
    accentForeground: '210 40% 98%',
    muted: '217.2 32.6% 17.5%',
    mutedForeground: '215 20.2% 65.1%',
    card: '222.2 84% 4.9%',
    cardForeground: '210 40% 98%',
    popover: '222.2 84% 4.9%',
    popoverForeground: '210 40% 98%',
    border: '217.2 32.6% 17.5%',
    input: '217.2 32.6% 17.5%',
    ring: '326 78% 68%',
    destructive: '0 62.8% 30.6%',
    destructiveForeground: '210 40% 98%',
    chart1: '326 78% 68%',
    chart2: '280 100% 70%',
    chart3: '258 90% 66%',
    chart4: '210 100% 56%',
    chart5: '47 96% 53%',
    glassmorphismSupport: true,
    particleEffects: true,
    premiumAnimations: true,
    shadowPrimary: '0 30px 80px rgba(236, 72, 153, 0.4)',
    shadowHover: '0 40px 100px rgba(236, 72, 153, 0.5)',
    shadowGlass: '0 30px 80px rgba(236, 72, 153, 0.3)',
    shadowNeon: '0 0 80px rgba(236, 72, 153, 1.0)',
  },

  // CARBON DESIGN THEMES
  g10: {
    background: '210 40% 98%',
    foreground: '222.2 47.4% 11.2%',
    primary: '222.2 47.4% 11.2%',
    primaryForeground: '210 40% 98%',
    secondary: '210 40% 96%',
    secondaryForeground: '222.2 47.4% 11.2%',
    accent: '210 40% 94%',
    accentForeground: '222.2 47.4% 11.2%',
    muted: '210 40% 96%',
    mutedForeground: '215.4 16.3% 46.9%',
    card: '0 0% 100%',
    cardForeground: '222.2 47.4% 11.2%',
    popover: '0 0% 100%',
    popoverForeground: '222.2 47.4% 11.2%',
    border: '214.3 31.8% 91.4%',
    input: '214.3 31.8% 91.4%',
    ring: '222.2 84% 4.9%',
    destructive: '0 84.2% 60.2%',
    destructiveForeground: '210 40% 98%',
    chart1: '12 76% 61%',
    chart2: '173 58% 39%',
    chart3: '197 37% 24%',
    chart4: '43 74% 66%',
    chart5: '27 87% 67%',
    glassmorphismSupport: false,
    particleEffects: false,
    premiumAnimations: false,
    shadowPrimary: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    shadowHover: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  },

  g90: {
    background: '215 28% 17%',
    foreground: '210 40% 98%',
    primary: '210 40% 98%',
    primaryForeground: '215 28% 17%',
    secondary: '215 25% 27%',
    secondaryForeground: '210 40% 98%',
    accent: '215 25% 27%',
    accentForeground: '210 40% 98%',
    muted: '215 25% 27%',
    mutedForeground: '217.9 10.6% 64.9%',
    card: '215 28% 17%',
    cardForeground: '210 40% 98%',
    popover: '215 28% 17%',
    popoverForeground: '210 40% 98%',
    border: '215 25% 27%',
    input: '215 25% 27%',
    ring: '216 34% 17%',
    destructive: '0 62.8% 30.6%',
    destructiveForeground: '210 40% 98%',
    chart1: '220 70% 50%',
    chart2: '160 60% 45%',
    chart3: '30 80% 55%',
    chart4: '280 65% 60%',
    chart5: '340 75% 55%',
    glassmorphismSupport: false,
    particleEffects: true,
    premiumAnimations: false,
    shadowPrimary: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
    shadowHover: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.25)',
  },

  g100: {
    background: '224 71% 4%',
    foreground: '213 31% 91%',
    primary: '210 40% 98%',
    primaryForeground: '224 71% 4%',
    secondary: '215 25% 17%',
    secondaryForeground: '210 40% 98%',
    accent: '216 34% 17%',
    accentForeground: '210 40% 98%',
    muted: '223 47% 11%',
    mutedForeground: '215.4 16.3% 56.9%',
    card: '224 71% 4%',
    cardForeground: '213 31% 91%',
    popover: '224 71% 4%',
    popoverForeground: '213 31% 91%',
    border: '216 34% 17%',
    input: '216 34% 17%',
    ring: '216 34% 17%',
    destructive: '0 62.8% 30.6%',
    destructiveForeground: '210 40% 98%',
    chart1: '220 70% 50%',
    chart2: '160 60% 45%',
    chart3: '30 80% 55%',
    chart4: '280 65% 60%',
    chart5: '340 75% 55%',
    glassmorphismSupport: false,
    particleEffects: true,
    premiumAnimations: false,
    shadowPrimary: '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
    shadowHover: '0 10px 15px -3px rgba(0, 0, 0, 0.6), 0 4px 6px -2px rgba(0, 0, 0, 0.4)',
  },
};

// ==========================================
// THEME UTILITIES
// ==========================================

export const DEFAULT_THEME_SETTINGS: ThemeSettings = {
  mode: 'dark',
  density: 'comfortable',
  animationLevel: 'normal',
  glassmorphismLevel: 'medium',
  reduceMotion: false,
  highContrast: false,
  particleEffects: true,
  soundEffects: false,
  borderRadius: 'medium',
};

export const STORAGE_KEYS = {
  THEME_SETTINGS: 'pokemon-unified-theme-settings',
  USER_PREFERENCES: 'pokemon-user-preferences',
} as const;

// ==========================================
// THEME FUNCTIONS
// ==========================================

/**
 * Get system color scheme preference
 */
export const getSystemColorScheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

/**
 * Resolve theme mode based on settings
 */
export const resolveThemeMode = (settings: ThemeSettings): ThemeMode => {
  if (settings.mode === 'system') {
    const systemScheme = getSystemColorScheme();
    return systemScheme; // Returns 'light' or 'dark'
  }
  return settings.mode;
};

/**
 * Check if theme supports glassmorphism
 */
export const isGlassTheme = (mode: ThemeMode): boolean => {
  const config = THEME_REGISTRY[mode];
  return config?.glassmorphismSupport || false;
};

/**
 * Get theme display name for UI
 */
export const getThemeDisplayName = (mode: ThemeMode): string => {
  const names: Record<ThemeMode, string> = {
    light: 'Light',
    dark: 'Dark',
    system: 'System',
    pokemon: 'Pokemon',
    glass: 'Glass',
    premium: 'Premium',
    'liquid-glass': 'Liquid Glass',
    'holo-collection': 'Holographic',
    'cosmic-aurora': 'Cosmic Aurora',
    'ethereal-dream': 'Ethereal Dream',
    g10: 'Gray 10',
    g90: 'Gray 90',
    g100: 'Gray 100',
  };
  return names[mode];
};

/**
 * Apply theme to DOM with performance optimization
 */
export const applyTheme = (settings: ThemeSettings): void => {
  const mode = resolveThemeMode(settings);
  const config = THEME_REGISTRY[mode];
  
  if (!config) {
    console.warn(`Theme mode "${mode}" not found, falling back to dark`);
    applyTheme({ ...settings, mode: 'dark' });
    return;
  }

  const root = document.documentElement;
  
  // 1. PRIMARY DATA ATTRIBUTE (triggers CSS cascade)
  root.setAttribute('data-theme', mode);
  
  // 2. ADDITIONAL ATTRIBUTES for advanced features
  root.setAttribute('data-density', settings.density);
  root.setAttribute('data-animation-level', settings.animationLevel);
  root.setAttribute('data-glassmorphism-level', settings.glassmorphismLevel);
  root.setAttribute('data-border-radius', settings.borderRadius);
  
  // 3. ACCESSIBILITY ATTRIBUTES
  if (settings.reduceMotion) {
    root.setAttribute('data-reduce-motion', 'true');
  } else {
    root.removeAttribute('data-reduce-motion');
  }
  
  if (settings.highContrast) {
    root.setAttribute('data-high-contrast', 'true');
  } else {
    root.removeAttribute('data-high-contrast');
  }
  
  // 4. FEATURE FLAGS
  root.setAttribute('data-particle-effects', settings.particleEffects ? 'true' : 'false');
  root.setAttribute('data-glassmorphism-enabled', (settings.glassmorphismLevel !== 'off') ? 'true' : 'false');
  
  // 5. APPLY CSS CUSTOM PROPERTIES
  // Core theme colors
  Object.entries(config).forEach(([key, value]) => {
    if (typeof value === 'string' && key !== 'glassmorphismSupport' && key !== 'particleEffects' && key !== 'premiumAnimations') {
      const cssVar = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      root.style.setProperty(cssVar, value);
    }
  });
  
  // 6. DENSITY-AWARE SPACING
  const densitySpacing = getDensitySpacing(settings.density);
  Object.entries(densitySpacing).forEach(([key, value]) => {
    root.style.setProperty(`--density-spacing-${key}`, value);
  });
  
  // 7. ANIMATION DURATIONS
  const animationDurations = getAnimationDurations(settings.animationLevel);
  Object.entries(animationDurations).forEach(([key, value]) => {
    root.style.setProperty(`--animation-duration-${key}`, value);
  });
  
  // 8. GLASSMORPHISM VALUES
  const glassValues = getGlassmorphismValues(settings.glassmorphismLevel);
  Object.entries(glassValues).forEach(([key, value]) => {
    root.style.setProperty(`--glass-${key}`, value);
  });
  
  // 9. BORDER RADIUS VALUES
  const radiusValue = getBorderRadiusValue(settings.borderRadius);
  root.style.setProperty('--radius', radiusValue);
  
  console.log(`✅ Applied unified theme: ${mode} with settings:`, settings);
};

/**
 * Get density-aware spacing values
 */
const getDensitySpacing = (density: DensityMode) => {
  const spacing = {
    compact: {
      xs: '0.125rem', sm: '0.25rem', md: '0.5rem', 
      lg: '0.75rem', xl: '1rem', '2xl': '1.5rem', '3xl': '2rem'
    },
    comfortable: {
      xs: '0.25rem', sm: '0.5rem', md: '1rem', 
      lg: '1.5rem', xl: '2rem', '2xl': '3rem', '3xl': '4rem'
    },
    spacious: {
      xs: '0.5rem', sm: '0.75rem', md: '1.25rem', 
      lg: '2rem', xl: '2.5rem', '2xl': '4rem', '3xl': '5rem'
    }
  };
  return spacing[density];
};

/**
 * Get animation duration values
 */
const getAnimationDurations = (level: AnimationLevel) => {
  const durations = {
    reduced: { fast: '50ms', normal: '100ms', slow: '150ms' },
    normal: { fast: '150ms', normal: '250ms', slow: '400ms' },
    enhanced: { fast: '200ms', normal: '350ms', slow: '600ms' }
  };
  return durations[level];
};

/**
 * Get glassmorphism values
 */
const getGlassmorphismValues = (level: GlassmorphismLevel) => {
  const values = {
    off: { bg: 'rgba(0, 0, 0, 0)', border: 'rgba(0, 0, 0, 0)', blur: '0px' },
    subtle: { bg: 'rgba(255, 255, 255, 0.05)', border: 'rgba(255, 255, 255, 0.1)', blur: '4px' },
    medium: { bg: 'rgba(255, 255, 255, 0.1)', border: 'rgba(255, 255, 255, 0.2)', blur: '12px' },
    intense: { bg: 'rgba(255, 255, 255, 0.15)', border: 'rgba(255, 255, 255, 0.3)', blur: '20px' }
  };
  return values[level];
};

/**
 * Get border radius value
 */
const getBorderRadiusValue = (radius: ThemeSettings['borderRadius']) => {
  const values = {
    none: '0',
    small: '0.25rem',
    medium: '0.5rem',
    large: '0.75rem',
    full: '9999px'
  };
  return values[radius];
};

/**
 * Save theme settings to localStorage
 */
export const saveThemeSettings = (settings: ThemeSettings): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.THEME_SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.warn('Failed to save theme settings:', error);
  }
};

/**
 * Load theme settings from localStorage
 */
export const loadThemeSettings = (): ThemeSettings => {
  if (typeof window === 'undefined') return DEFAULT_THEME_SETTINGS;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.THEME_SETTINGS);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_THEME_SETTINGS, ...parsed };
    }
  } catch (error) {
    console.warn('Failed to load theme settings:', error);
  }
  
  return DEFAULT_THEME_SETTINGS;
};

/**
 * Get available themes grouped by category
 */
export const getThemeCategories = () => {
  return {
    standard: ['light', 'dark', 'system'] as ThemeMode[],
    brand: ['pokemon'] as ThemeMode[],
    glass: ['glass', 'premium'] as ThemeMode[],
    premium: ['liquid-glass', 'holo-collection', 'cosmic-aurora', 'ethereal-dream'] as ThemeMode[],
    professional: ['g10', 'g90', 'g100'] as ThemeMode[],
  };
};

/**
 * Initialize theme system with user preferences
 */
export const initializeThemeSystem = (): ThemeSettings => {
  const settings = loadThemeSettings();
  
  // Apply system preferences if not overridden
  if (typeof window !== 'undefined') {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
    
    if (prefersReducedMotion && !settings.reduceMotion) {
      settings.reduceMotion = true;
      settings.animationLevel = 'reduced';
    }
    
    if (prefersHighContrast && !settings.highContrast) {
      settings.highContrast = true;
    }
  }
  
  applyTheme(settings);
  saveThemeSettings(settings);
  
  return settings;
};