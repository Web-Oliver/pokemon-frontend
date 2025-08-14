/**
 * Proper Theme Utilities - Working Implementation
 * Provides actual theme functionality that integrates with shadcn/ui
 */

export interface ThemeConfig {
  isDark: boolean;
  color: 'blue' | 'purple' | 'green' | 'red' | 'orange';
  variant: 'default' | 'glass' | 'cosmic' | 'neural';
}

export interface ElementTheme {
  background: string;
  border: string;
  text: string;
  gradient: string;
  glow: string;
}

export function getElementTheme(color: string = 'blue', variant: string = 'default'): ElementTheme {
  const themes = {
    blue: {
      background: 'bg-blue-50 dark:bg-blue-950',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-900 dark:text-blue-100',
      gradient: 'from-blue-500 to-blue-600',
      glow: 'from-blue-400 to-blue-500'
    },
    purple: {
      background: 'bg-purple-50 dark:bg-purple-950',
      border: 'border-purple-200 dark:border-purple-800',
      text: 'text-purple-900 dark:text-purple-100',
      gradient: 'from-purple-500 to-purple-600',
      glow: 'from-purple-400 to-purple-500'
    },
    green: {
      background: 'bg-green-50 dark:bg-green-950',
      border: 'border-green-200 dark:border-green-800',
      text: 'text-green-900 dark:text-green-100',
      gradient: 'from-green-500 to-green-600',
      glow: 'from-green-400 to-green-500'
    },
    red: {
      background: 'bg-red-50 dark:bg-red-950',
      border: 'border-red-200 dark:border-red-800',
      text: 'text-red-900 dark:text-red-100',
      gradient: 'from-red-500 to-red-600',
      glow: 'from-red-400 to-red-500'
    },
    dark: {
      background: 'bg-background',
      border: 'border-border',
      text: 'text-foreground',
      gradient: 'from-primary to-primary/80',
      glow: 'from-primary/50 to-primary/70'
    }
  };

  return themes[color as keyof typeof themes] || themes.dark;
}

export function getVisualTheme(): ThemeConfig {
  return {
    isDark: document.documentElement.classList.contains('dark'),
    color: 'blue',
    variant: 'default'
  };
}

export type ThemeColor = 'blue' | 'purple' | 'green' | 'red' | 'orange' | 'dark';