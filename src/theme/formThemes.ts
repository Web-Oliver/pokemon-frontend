/**
 * Centralized Form Theme Configuration System
 * Eliminates theme duplication across FormHeader, FormActionButtons, and other components
 *
 * Following CLAUDE.md DRY + SOLID principles:
 * - Single Responsibility: Manages only theme configuration
 * - Open/Closed: Extensible by adding new color schemes
 * - DRY: Single source of truth for all form theming
 * - Interface Segregation: Separate interfaces for different theme aspects
 */

export type ThemeColor =
  | 'purple'
  | 'blue'
  | 'emerald'
  | 'amber'
  | 'rose'
  | 'dark';

/**
 * Base theme interface for form headers
 */
export interface FormHeaderTheme {
  background: string;
  border: string;
  topBorder: string;
  overlay: string;
  iconBackground: string;
  titleText: string;
  descriptionText: string;
}

/**
 * Button theme interface for form actions
 */
export interface FormButtonTheme {
  primary: string;
  primaryHover: string;
}

/**
 * Premium form element theme interface
 */
export interface PremiumElementTheme {
  gradient: string;
  glow: string;
  focus: string;
  border: string;
}

/**
 * Complete theme configuration for a color scheme
 */
export interface FormThemeConfig {
  header: FormHeaderTheme;
  button: FormButtonTheme;
  element: PremiumElementTheme;
}

/**
 * Centralized theme configurations
 * Single source of truth for all form component theming
 */
export const formThemes: Record<ThemeColor, FormThemeConfig> = {
  purple: {
    header: {
      background: 'from-purple-50/80 to-violet-50/80',
      border: 'border-purple-200/50',
      topBorder: 'from-purple-500 to-violet-500',
      overlay: 'from-purple-500/5 to-violet-500/5',
      iconBackground: 'from-purple-500 to-violet-600',
      titleText: 'from-purple-800 to-violet-800',
      descriptionText: 'text-purple-700',
    },
    button: {
      primary: 'bg-gradient-to-r from-purple-600 to-violet-600',
      primaryHover: 'hover:from-purple-700 hover:to-violet-700',
    },
    element: {
      gradient: 'from-purple-500/10 via-violet-500/10 to-purple-500/10',
      glow: 'from-purple-500/20 via-violet-500/20 to-purple-500/20',
      focus: 'focus:ring-purple-500/50 focus:border-purple-300',
      border: 'border-purple-200/50',
    },
  },
  blue: {
    header: {
      background: 'from-blue-50/80 to-cyan-50/80',
      border: 'border-blue-200/50',
      topBorder: 'from-blue-500 to-cyan-500',
      overlay: 'from-blue-500/5 to-cyan-500/5',
      iconBackground: 'from-blue-500 to-cyan-600',
      titleText: 'from-blue-800 to-cyan-800',
      descriptionText: 'text-blue-700',
    },
    button: {
      primary: 'bg-gradient-to-r from-blue-600 to-cyan-600',
      primaryHover: 'hover:from-blue-700 hover:to-cyan-700',
    },
    element: {
      gradient: 'from-blue-500/10 via-cyan-500/10 to-blue-500/10',
      glow: 'from-blue-500/20 via-cyan-500/20 to-blue-500/20',
      focus: 'focus:ring-blue-500/50 focus:border-blue-300',
      border: 'border-blue-200/50',
    },
  },
  emerald: {
    header: {
      background: 'from-emerald-50/80 to-teal-50/80',
      border: 'border-emerald-200/50',
      topBorder: 'from-emerald-500 to-teal-500',
      overlay: 'from-emerald-500/5 to-teal-500/5',
      iconBackground: 'from-emerald-500 to-teal-600',
      titleText: 'from-emerald-800 to-teal-800',
      descriptionText: 'text-emerald-700',
    },
    button: {
      primary: 'bg-gradient-to-r from-emerald-600 to-teal-600',
      primaryHover: 'hover:from-emerald-700 hover:to-teal-700',
    },
    element: {
      gradient: 'from-emerald-500/10 via-teal-500/10 to-emerald-500/10',
      glow: 'from-emerald-500/20 via-teal-500/20 to-emerald-500/20',
      focus: 'focus:ring-emerald-500/50 focus:border-emerald-300',
      border: 'border-emerald-200/50',
    },
  },
  amber: {
    header: {
      background: 'from-amber-50/80 to-orange-50/80',
      border: 'border-amber-200/50',
      topBorder: 'from-amber-500 to-orange-500',
      overlay: 'from-amber-500/5 to-orange-500/5',
      iconBackground: 'from-amber-500 to-orange-600',
      titleText: 'from-amber-800 to-orange-800',
      descriptionText: 'text-amber-700',
    },
    button: {
      primary: 'bg-gradient-to-r from-amber-600 to-orange-600',
      primaryHover: 'hover:from-amber-700 hover:to-orange-700',
    },
    element: {
      gradient: 'from-amber-500/10 via-orange-500/10 to-amber-500/10',
      glow: 'from-amber-500/20 via-orange-500/20 to-amber-500/20',
      focus: 'focus:ring-amber-500/50 focus:border-amber-300',
      border: 'border-amber-200/50',
    },
  },
  rose: {
    header: {
      background: 'from-rose-50/80 to-pink-50/80',
      border: 'border-rose-200/50',
      topBorder: 'from-rose-500 to-pink-500',
      overlay: 'from-rose-500/5 to-pink-500/5',
      iconBackground: 'from-rose-500 to-pink-600',
      titleText: 'from-rose-800 to-pink-800',
      descriptionText: 'text-rose-700',
    },
    button: {
      primary: 'bg-gradient-to-r from-rose-600 to-pink-600',
      primaryHover: 'hover:from-rose-700 hover:to-pink-700',
    },
    element: {
      gradient: 'from-rose-500/10 via-pink-500/10 to-rose-500/10',
      glow: 'from-rose-500/20 via-pink-500/20 to-rose-500/20',
      focus: 'focus:ring-rose-500/50 focus:border-rose-300',
      border: 'border-rose-200/50',
    },
  },
  dark: {
    header: {
      background: 'from-zinc-900/80 to-zinc-800/80',
      border: 'border-zinc-700/50',
      topBorder: 'from-cyan-500 to-blue-500',
      overlay: 'from-cyan-500/5 to-blue-500/5',
      iconBackground: 'from-cyan-500 to-blue-600',
      titleText: 'from-cyan-400 to-blue-400',
      descriptionText: 'text-zinc-300',
    },
    button: {
      primary: 'bg-gradient-to-r from-cyan-600 to-blue-600',
      primaryHover: 'hover:from-cyan-700 hover:to-blue-700',
    },
    element: {
      gradient: 'from-cyan-500/10 via-blue-500/10 to-cyan-500/10',
      glow: 'from-cyan-500/20 via-blue-500/20 to-cyan-500/20',
      focus: 'focus:ring-cyan-500/50 focus:border-cyan-300',
      border: 'border-zinc-700/50',
    },
  },
} as const;

/**
 * Helper function to get theme configuration
 * Provides type safety and default fallback
 */
export const getFormTheme = (color: ThemeColor = 'dark'): FormThemeConfig => {
  return formThemes[color];
};

/**
 * Helper function to get header theme only
 * For components that only need header styling
 */
export const getHeaderTheme = (color: ThemeColor = 'dark'): FormHeaderTheme => {
  return formThemes[color].header;
};

/**
 * Helper function to get button theme only
 * For components that only need button styling
 */
export const getButtontheme = (color: ThemeColor = 'dark'): FormButtonTheme => {
  return formThemes[color].button;
};

/**
 * Helper function to get element theme only
 * For premium form elements that need gradient/glow effects
 */
export const getElementTheme = (
  color: ThemeColor = 'dark'
): PremiumElementTheme => {
  return formThemes[color].element;
};

/**
 * Helper function to build complete theme class strings
 * Combines multiple theme aspects into ready-to-use className strings
 */
export const buildThemeClasses = {
  headerBackground: (color: ThemeColor) =>
    `bg-gradient-to-br ${getHeaderTheme(color).background}`,
  headerBorder: (color: ThemeColor) => `border ${getHeaderTheme(color).border}`,
  buttonPrimary: (color: ThemeColor) => {
    const theme = getButtontheme(color);
    return `${theme.primary} ${theme.primaryHover}`;
  },
  elementGradient: (color: ThemeColor) =>
    `bg-gradient-to-r ${getElementTheme(color).gradient}`,
  elementGlow: (color: ThemeColor) =>
    `bg-gradient-to-r ${getElementTheme(color).glow}`,
} as const;

export default formThemes;
