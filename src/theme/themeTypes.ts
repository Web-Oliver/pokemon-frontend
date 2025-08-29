/**
 * CONSOLIDATED THEME TYPES
 * Single source of truth for all theme-related TypeScript interfaces
 * Replaces 5+ conflicting theme interfaces with one comprehensive system
 */

// Core theme modes
export type ThemeMode = 'light' | 'dark' | 'system';

// Color scheme for compatibility
export type ColorScheme = 'light' | 'dark';

// Visual themes for expanded compatibility
export type VisualTheme = 'light' | 'dark' | 'ocean' | 'forest' | 'sunset' | 'midnight';

// Theme names (consolidated from all systems)
export type ThemeName = 
  | 'pokemon'           // Main Pokemon theme
  | 'glass'             // Glass morphism theme  
  | 'cosmic'            // Cosmic theme
  | 'neural'            // Neural theme
  | 'minimal'           // Minimal theme
  | 'premium'           // Premium theme
  | 'liquid-glass'      // Liquid glass theme
  | 'holo-collection'   // Holographic theme
  | 'cosmic-aurora'     // Cosmic aurora theme
  | 'ethereal-dream'    // Ethereal dream theme
  | 'light' | 'dark'    // Basic themes for compatibility
  | 'custom';           // Custom theme support

// UI density options
export type DensityMode = 'compact' | 'comfortable' | 'spacious';
export type Density = DensityMode; // Alias for compatibility

// Animation levels
export type AnimationLevel = 'none' | 'reduced' | 'normal' | 'enhanced';
export type AnimationIntensity = AnimationLevel; // Alias for compatibility

// Glassmorphism intensity
export type GlassmorphismLevel = 'none' | 'subtle' | 'moderate' | 'intense';

// Component system types for atomic design
export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type ComponentVariant = 'default' | 'outline' | 'ghost' | 'link' | 'destructive';
export type ComponentState = 'idle' | 'hover' | 'active' | 'disabled' | 'loading';
export type IconPosition = 'start' | 'end';

/**
 * CONSOLIDATED THEME SETTINGS INTERFACE
 * Combines all valid properties from existing ThemeSettings interfaces
 */
export interface ThemeSettings {
  // Core theme selection
  mode: ThemeMode;
  name?: ThemeName;
  colorScheme: ColorScheme; // For backward compatibility
  visualTheme?: VisualTheme; // For expanded theme picker compatibility
  
  // UI configuration
  density: DensityMode;
  animationLevel: AnimationLevel;
  animationIntensity?: AnimationIntensity; // Alias for compatibility
  glassmorphismLevel: GlassmorphismLevel;
  glassmorphismIntensity?: number; // 0-100 for fine control
  
  // Accessibility preferences  
  reduceMotion: boolean;
  reducedMotion?: boolean; // Alias for compatibility
  highContrast: boolean;
  
  // Feature toggles
  glassmorphismEnabled?: boolean;
  animationsEnabled?: boolean;
  particleEffectsEnabled: boolean;
  particleEffects?: boolean; // Alias for compatibility
  soundEffects: boolean;
  
  // Color customization
  primaryColor?: string;
  customAccentColor?: string;
  borderRadius: 'none' | 'small' | 'medium' | 'large' | 'full';
  
  // Form theme compatibility
  formThemeColor: 'purple' | 'blue' | 'emerald' | 'amber' | 'rose' | 'dark';
  
  // Advanced customization
  customizations: Record<string, any>;
  customCSSProperties?: Record<string, string>;
}

/**
 * THEME CONFIGURATION INTERFACE
 * Defines the structure of theme definitions
 */
export interface ThemeConfig {
  // Color system
  colors: {
    // Core colors
    primary: string;
    secondary: string;
    accent: string;
    
    // Surface colors
    background: string;
    surface: string;
    surfaceSecondary: string;
    
    // Text colors  
    text: string;
    textSecondary: string;
    textMuted: string;
    
    // Status colors
    success: string;
    warning: string;
    error: string;
    info: string;
    
    // Border colors
    border: string;
    borderSecondary: string;
  };
  
  // Typography
  typography: {
    fontFamily: string;
    fontSizes: Record<string, string>;
    fontWeights: Record<string, string>;
    lineHeights: Record<string, string>;
  };
  
  // Spacing system
  spacing: Record<string, string>;
  
  // Border radius system
  borderRadius: Record<string, string>;
  
  // Shadow system
  shadows: Record<string, string>;
  
  // Theme-specific effects (optional)
  effects?: {
    glassmorphism?: Record<string, string>;
    gradients?: Record<string, string>;
    animations?: Record<string, string>;
  };
}

/**
 * THEME CONTEXT INTERFACE  
 * Defines the shape of the theme context
 */
export interface ThemeContextType {
  // Current state
  settings: ThemeSettings;
  resolvedTheme: ThemeName;
  systemColorScheme: 'light' | 'dark';
  
  // Theme setters
  setTheme: (theme: ThemeName) => void;
  setMode: (mode: ThemeMode) => void;
  setColorScheme: (scheme: ColorScheme) => void;
  setDensity: (density: DensityMode) => void;
  setAnimationLevel: (level: AnimationLevel) => void;
  setGlassmorphismLevel: (level: GlassmorphismLevel) => void;
  
  // Feature toggles
  setGlassmorphismEnabled: (enabled: boolean) => void;
  setAnimationsEnabled: (enabled: boolean) => void;
  setParticleEffectsEnabled: (enabled: boolean) => void;
  setReduceMotion: (enabled: boolean) => void;
  setHighContrast: (enabled: boolean) => void;
  setSoundEffects: (enabled: boolean) => void;
  
  // Bulk update
  updateSettings: (settings: Partial<ThemeSettings>) => void;
  
  // Utilities
  resetToDefaults: () => void;
  isSystemTheme: boolean;
  isGlassTheme: boolean;
  isLoaded: boolean;
  
  // Computed properties
  isDark: boolean;
  isLight: boolean;
  
  // Legacy compatibility
  density: DensityMode;
}

// Component-level theme interfaces for atomic design system
export interface BaseThemeProps {
  variant?: ComponentVariant;
  size?: ComponentSize;
  state?: ComponentState;
}

export interface ComponentAnimationConfig {
  duration: number;
  easing: string;
  delay?: number;
}

export interface ComponentStyleConfig {
  colors: Record<string, string>;
  spacing: Record<string, string>;
  borders: Record<string, string>;
  shadows: Record<string, string>;
}

export interface ThemeAwareComponentConfig {
  baseProps: BaseThemeProps;
  animations: ComponentAnimationConfig;
  styles: ComponentStyleConfig;
}

// Polymorphic component support
export interface PolymorphicProps<T = 'div'> {
  as?: T;
  className?: string;
  children?: React.ReactNode;
}

// Form integration props
export interface FormIntegrationProps {
  name?: string;
  label?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

// Loading state props
export interface LoadingProps {
  loading?: boolean;
  loadingText?: string;
  loadingIcon?: React.ReactNode;
}

// Compound component props combining all systems
export interface CompoundComponentProps extends 
  BaseThemeProps, 
  PolymorphicProps, 
  FormIntegrationProps, 
  LoadingProps {
  // Additional compound props can be added here
}

// Standard component props for atomic design system
export type StandardComponentProps<T = {}> = T & CompoundComponentProps;

// Specific standard props for common components
export interface StandardButtonProps extends StandardComponentProps {
  iconPosition?: IconPosition;
  fullWidth?: boolean;
}

export interface StandardInputProps extends StandardComponentProps {
  placeholder?: string;
  type?: string;
}

export interface StandardSelectProps extends StandardComponentProps {
  options: Array<{ value: string; label: string }>;
  multiple?: boolean;
}

export interface StandardCardProps extends StandardComponentProps {
  elevated?: boolean;
  interactive?: boolean;
}

export interface StandardModalProps extends StandardComponentProps {
  open: boolean;
  onClose: () => void;
  backdrop?: boolean;
}

export interface StandardBadgeProps extends StandardComponentProps {
  dot?: boolean;
  count?: number;
}

export interface StandardAlertProps extends StandardComponentProps {
  title?: string;
  dismissible?: boolean;
}

// Theme override and preset system
export interface ThemeOverride {
  target: string;
  properties: Partial<ThemeSettings>;
}

export interface ThemePreset {
  name: string;
  displayName: string;
  settings: ThemeSettings;
  overrides?: ThemeOverride[];
}

// Extended configuration interface
export interface ThemeConfiguration extends ThemeSettings {
  // Additional configuration-specific properties can go here
}

/**
 * DEFAULT THEME SETTINGS
 * Consolidated default values from all systems
 */
export const DEFAULT_THEME_SETTINGS: ThemeSettings = {
  mode: 'system',
  name: 'pokemon',
  colorScheme: 'light',
  
  density: 'comfortable',
  animationLevel: 'normal',
  glassmorphismLevel: 'moderate',
  
  reduceMotion: false,
  reducedMotion: false,
  highContrast: false,
  
  glassmorphismEnabled: true,
  animationsEnabled: true,
  particleEffectsEnabled: true,
  particleEffects: true,
  soundEffects: false,
  
  borderRadius: 'medium',
  formThemeColor: 'purple',
  
  customizations: {},
};

/**
 * STORAGE CONFIGURATION
 */
export const THEME_STORAGE_CONFIG = {
  key: 'pokemon-collection-theme-settings',
  version: '2.0.0',
  migrate: true,
  THEME_SETTINGS_KEY: 'pokemon-unified-theme-settings', // Legacy compatibility
  SYSTEM_PREFERENCE_KEY: 'pokemon-system-preference', // Legacy compatibility
} as const;