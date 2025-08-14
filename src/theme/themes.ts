/**
 * THEME DEFINITIONS - Pokemon Collection Theme System
 * Phase 1.2 Implementation - Theme configuration authority
 *
 * Following THEME_ARCHITECTURE_DESIGN.md specifications:
 * - Light and dark theme mappings
 * - Pokemon theme variants
 * - Glass/neural theme options  
 * - Semantic color assignments
 */

import { colorTokens } from './tokens';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ThemeName = 'pokemon' | 'glass' | 'cosmic' | 'neural' | 'minimal';
export type DensityMode = 'compact' | 'comfortable' | 'spacious';
export type MotionMode = 'reduced' | 'normal' | 'enhanced';

export interface ThemeConfig {
  // Semantic color mappings
  colors: {
    background: string;
    foreground: string;  
    primary: string;
    secondary: string;
    muted: string;
    accent: string;
    destructive: string;
    success: string;
    warning: string;
    border: string;
    input: string;
    ring: string;
    // Card system
    card: string;
    cardForeground: string;
    // Overlay system  
    overlay: string;
    overlayForeground: string;
  };
  
  // Theme-specific effects
  effects?: {
    glassmorphism: {
      background: string;
      border: string;
      blur: string;
    };
    shadows: {
      primary: string;
      hover: string;
      focus: string;
    };
    gradients: {
      primary: string;
      secondary: string;
      accent: string;
    };
  };
}

export interface ThemeSettings {
  mode: ThemeMode;
  name: ThemeName;  
  density: DensityMode;
  motion: MotionMode;
  glassmorphismEnabled: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
  customizations: Record<string, any>;
}

export const themeDefinitions: Record<ThemeName, Record<'light' | 'dark', ThemeConfig>> = {
  pokemon: {
    light: {
      colors: {
        background: colorTokens.neutral[50],
        foreground: colorTokens.neutral[900],
        primary: colorTokens.brand.pokemon.blue,
        secondary: colorTokens.neutral[100],
        muted: colorTokens.neutral[100],
        accent: colorTokens.brand.pokemon.yellow,
        destructive: colorTokens.brand.pokemon.red,
        success: colorTokens.brand.pokemon.green,
        warning: colorTokens.brand.pokemon.yellow,
        border: colorTokens.neutral[200],
        input: colorTokens.neutral[50],
        ring: colorTokens.brand.pokemon.blue,
        card: colorTokens.neutral[50],
        cardForeground: colorTokens.neutral[900],
        overlay: 'rgba(255, 255, 255, 0.8)',
        overlayForeground: colorTokens.neutral[900]
      }
    },
    dark: {
      colors: {
        background: colorTokens.neutral[950],
        foreground: colorTokens.neutral[50],
        primary: colorTokens.brand.pokemon.blue,
        secondary: colorTokens.neutral[800],
        muted: colorTokens.neutral[800],
        accent: colorTokens.brand.pokemon.yellow,
        destructive: colorTokens.brand.pokemon.red,
        success: colorTokens.brand.pokemon.green,
        warning: colorTokens.brand.pokemon.yellow,
        border: colorTokens.neutral[700],
        input: colorTokens.neutral[800],
        ring: colorTokens.brand.pokemon.blue,
        card: colorTokens.neutral[900],
        cardForeground: colorTokens.neutral[50],
        overlay: 'rgba(0, 0, 0, 0.8)',
        overlayForeground: colorTokens.neutral[50]
      }
    }
  },
  
  glass: {
    light: {
      colors: {
        background: 'rgba(255, 255, 255, 0.8)',
        foreground: colorTokens.neutral[900],
        primary: colorTokens.brand.pokemon.blue,
        secondary: 'rgba(248, 250, 252, 0.8)',
        muted: 'rgba(241, 245, 249, 0.8)',
        accent: colorTokens.brand.pokemon.yellow,
        destructive: colorTokens.brand.pokemon.red,
        success: colorTokens.brand.pokemon.green,
        warning: colorTokens.brand.pokemon.yellow,
        border: 'rgba(226, 232, 240, 0.5)',
        input: 'rgba(255, 255, 255, 0.6)',
        ring: colorTokens.brand.pokemon.blue,
        card: 'rgba(255, 255, 255, 0.6)',
        cardForeground: colorTokens.neutral[900],
        overlay: 'rgba(255, 255, 255, 0.9)',
        overlayForeground: colorTokens.neutral[900]
      },
      effects: {
        glassmorphism: {
          background: 'rgba(255, 255, 255, 0.1)',
          border: 'rgba(255, 255, 255, 0.2)',
          blur: '12px'
        },
        shadows: {
          primary: '0 8px 32px rgb(31 38 135 / 0.37)',
          hover: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
          focus: '0 8px 25px rgb(0 117 190 / 0.3)'
        },
        gradients: {
          primary: `linear-gradient(135deg, ${colorTokens.brand.pokemon.blue}, ${colorTokens.brand.secondary.cerulean})`,
          secondary: `linear-gradient(135deg, ${colorTokens.brand.pokemon.green}, ${colorTokens.brand.pokemon.yellow})`,
          accent: `linear-gradient(135deg, ${colorTokens.brand.pokemon.yellow}, ${colorTokens.brand.pokemon.gold})`
        }
      }
    },
    dark: {
      colors: {
        background: 'rgba(9, 9, 11, 0.8)',
        foreground: colorTokens.neutral[50],
        primary: colorTokens.brand.pokemon.blue,
        secondary: 'rgba(39, 39, 42, 0.8)',
        muted: 'rgba(63, 63, 70, 0.8)',
        accent: colorTokens.brand.pokemon.yellow,
        destructive: colorTokens.brand.pokemon.red,
        success: colorTokens.brand.pokemon.green,
        warning: colorTokens.brand.pokemon.yellow,
        border: 'rgba(113, 113, 122, 0.5)',
        input: 'rgba(39, 39, 42, 0.6)',
        ring: colorTokens.brand.pokemon.blue,
        card: 'rgba(24, 24, 27, 0.6)',
        cardForeground: colorTokens.neutral[50],
        overlay: 'rgba(0, 0, 0, 0.9)',
        overlayForeground: colorTokens.neutral[50]
      },
      effects: {
        glassmorphism: {
          background: 'rgba(0, 0, 0, 0.1)',
          border: 'rgba(255, 255, 255, 0.1)',
          blur: '16px'
        },
        shadows: {
          primary: '0 8px 32px rgb(0 0 0 / 0.5)',
          hover: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
          focus: '0 8px 25px rgb(0 117 190 / 0.3)'
        },
        gradients: {
          primary: `linear-gradient(135deg, ${colorTokens.brand.pokemon.blue}, ${colorTokens.brand.secondary.cerulean})`,
          secondary: `linear-gradient(135deg, ${colorTokens.brand.pokemon.green}, ${colorTokens.brand.pokemon.yellow})`,
          accent: `linear-gradient(135deg, ${colorTokens.brand.pokemon.yellow}, ${colorTokens.brand.pokemon.gold})`
        }
      }
    }
  },

  cosmic: {
    light: {
      colors: {
        background: '#fafafa',
        foreground: '#09090b',
        primary: '#a855f7',
        secondary: '#f4f4f5',
        muted: '#f4f4f5',
        accent: '#ec4899',
        destructive: '#ef4444',
        success: '#10b981',
        warning: '#f59e0b',
        border: '#e4e4e7',
        input: '#ffffff',
        ring: '#a855f7',
        card: '#ffffff',
        cardForeground: '#09090b',
        overlay: 'rgba(250, 250, 250, 0.8)',
        overlayForeground: '#09090b'
      },
      effects: {
        glassmorphism: {
          background: 'rgba(250, 250, 250, 0.6)',
          border: 'rgba(168, 85, 247, 0.2)',
          blur: '20px'
        },
        shadows: {
          primary: '0 4px 20px rgba(168, 85, 247, 0.3)',
          hover: '0 8px 30px rgba(168, 85, 247, 0.4)',
          focus: '0 0 0 2px rgba(168, 85, 247, 0.5)'
        },
        gradients: {
          primary: 'linear-gradient(135deg, #a855f7, #ec4899)',
          secondary: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
          accent: 'linear-gradient(135deg, #f97316, #ef4444)'
        }
      }
    },
    dark: {
      colors: {
        background: '#0c0a1d',
        foreground: '#fafafa',
        primary: '#a855f7',
        secondary: '#1a0933',
        muted: '#1a0933',
        accent: '#ec4899',
        destructive: '#ef4444',
        success: '#10b981',
        warning: '#f59e0b',
        border: '#2d1b4e',
        input: '#1a0933',
        ring: '#a855f7',
        card: '#1a0933',
        cardForeground: '#fafafa',
        overlay: 'rgba(12, 10, 29, 0.9)',
        overlayForeground: '#fafafa'
      },
      effects: {
        glassmorphism: {
          background: 'rgba(12, 10, 29, 0.8)',
          border: 'rgba(168, 85, 247, 0.2)',
          blur: '24px'
        },
        shadows: {
          primary: '0 4px 20px rgba(168, 85, 247, 0.4)',
          hover: '0 8px 30px rgba(168, 85, 247, 0.6)',
          focus: '0 0 0 2px rgba(168, 85, 247, 0.7)'
        },
        gradients: {
          primary: 'linear-gradient(135deg, #a855f7, #ec4899)',
          secondary: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
          accent: 'linear-gradient(135deg, #f97316, #ef4444)'
        }
      }
    }
  },

  neural: {
    light: {
      colors: {
        background: '#ffffff',
        foreground: '#020817',
        primary: '#3b82f6',
        secondary: '#f1f5f9',
        muted: '#f1f5f9',
        accent: '#06b6d4',
        destructive: '#ef4444',
        success: '#10b981',
        warning: '#f59e0b',
        border: '#e2e8f0',
        input: '#ffffff',
        ring: '#3b82f6',
        card: '#ffffff',
        cardForeground: '#020817',
        overlay: 'rgba(255, 255, 255, 0.8)',
        overlayForeground: '#020817'
      }
    },
    dark: {
      colors: {
        background: '#020817',
        foreground: '#f8fafc',
        primary: '#3b82f6',
        secondary: '#1e293b',
        muted: '#1e293b',
        accent: '#06b6d4',
        destructive: '#ef4444',
        success: '#10b981',
        warning: '#f59e0b',
        border: '#334155',
        input: '#1e293b',
        ring: '#3b82f6',
        card: '#1e293b',
        cardForeground: '#f8fafc',
        overlay: 'rgba(2, 8, 23, 0.9)',
        overlayForeground: '#f8fafc'
      }
    }
  },

  minimal: {
    light: {
      colors: {
        background: '#ffffff',
        foreground: '#171717',
        primary: '#171717',
        secondary: '#f5f5f5',
        muted: '#f5f5f5',
        accent: '#737373',
        destructive: '#dc2626',
        success: '#16a34a',
        warning: '#ca8a04',
        border: '#e5e5e5',
        input: '#ffffff',
        ring: '#171717',
        card: '#ffffff',
        cardForeground: '#171717',
        overlay: 'rgba(255, 255, 255, 0.8)',
        overlayForeground: '#171717'
      }
    },
    dark: {
      colors: {
        background: '#0a0a0a',
        foreground: '#fafafa',
        primary: '#fafafa',
        secondary: '#1a1a1a',
        muted: '#1a1a1a',
        accent: '#a3a3a3',
        destructive: '#dc2626',
        success: '#16a34a',
        warning: '#ca8a04',
        border: '#262626',
        input: '#1a1a1a',
        ring: '#fafafa',
        card: '#1a1a1a',
        cardForeground: '#fafafa',
        overlay: 'rgba(10, 10, 10, 0.9)',
        overlayForeground: '#fafafa'
      }
    }
  }
};

// Default theme settings
export const defaultThemeSettings: ThemeSettings = {
  mode: 'system',
  name: 'pokemon',
  density: 'comfortable',
  motion: 'normal',
  glassmorphismEnabled: false,
  reducedMotion: false,
  highContrast: false,
  customizations: {}
};