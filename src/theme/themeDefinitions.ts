/**
 * CONSOLIDATED THEME DEFINITIONS
 * Single source of truth for all theme configurations
 * Merges definitions from multiple theme systems
 */

import { ThemeConfig, ThemeName, ColorScheme } from './themeTypes';

// Color tokens from the existing system
const colorTokens = {
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    400: '#a3a3a3',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0a0a0a'
  },
  brand: {
    pokemon: {
      blue: '#3b82f6',
      yellow: '#facc15',
      red: '#ef4444',
      green: '#22c55e',
      gold: '#fbbf24'
    },
    secondary: {
      cerulean: '#06b6d4'
    }
  }
} as const;

// Shared spacing, typography, and other design tokens
const sharedDesignTokens = {
  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem'
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem'
    },
    fontWeights: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700'
    },
    lineHeights: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75'
    }
  },
  borderRadius: {
    none: '0',
    small: '0.25rem',
    medium: '0.5rem',
    large: '1rem',
    full: '9999px'
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
  }
} as const;

/**
 * CONSOLIDATED THEME DEFINITIONS
 * All theme configurations for each theme name and color scheme
 */
export const themeDefinitions: Record<ThemeName, Record<ColorScheme, ThemeConfig>> = {
  // Pokemon theme - Main application theme
  pokemon: {
    light: {
      colors: {
        primary: colorTokens.brand.pokemon.blue,
        secondary: colorTokens.neutral[100],
        accent: colorTokens.brand.pokemon.yellow,
        
        background: colorTokens.neutral[50],
        surface: colorTokens.neutral[50],
        surfaceSecondary: colorTokens.neutral[100],
        
        text: colorTokens.neutral[900],
        textSecondary: colorTokens.neutral[700],
        textMuted: colorTokens.neutral[600],
        
        success: colorTokens.brand.pokemon.green,
        warning: colorTokens.brand.pokemon.yellow,
        error: colorTokens.brand.pokemon.red,
        info: colorTokens.brand.pokemon.blue,
        
        border: colorTokens.neutral[200],
        borderSecondary: colorTokens.neutral[100]
      },
      typography: sharedDesignTokens.typography,
      spacing: sharedDesignTokens.spacing,
      borderRadius: sharedDesignTokens.borderRadius,
      shadows: sharedDesignTokens.shadows
    },
    dark: {
      colors: {
        primary: colorTokens.brand.pokemon.blue,
        secondary: colorTokens.neutral[800],
        accent: colorTokens.brand.pokemon.yellow,
        
        background: colorTokens.neutral[950],
        surface: colorTokens.neutral[900],
        surfaceSecondary: colorTokens.neutral[800],
        
        text: colorTokens.neutral[50],
        textSecondary: colorTokens.neutral[200],
        textMuted: colorTokens.neutral[400],
        
        success: colorTokens.brand.pokemon.green,
        warning: colorTokens.brand.pokemon.yellow,
        error: colorTokens.brand.pokemon.red,
        info: colorTokens.brand.pokemon.blue,
        
        border: colorTokens.neutral[700],
        borderSecondary: colorTokens.neutral[800]
      },
      typography: sharedDesignTokens.typography,
      spacing: sharedDesignTokens.spacing,
      borderRadius: sharedDesignTokens.borderRadius,
      shadows: sharedDesignTokens.shadows
    }
  },

  // Glass theme - Glassmorphism effects
  glass: {
    light: {
      colors: {
        primary: colorTokens.brand.pokemon.blue,
        secondary: 'rgba(248, 250, 252, 0.8)',
        accent: colorTokens.brand.pokemon.yellow,
        
        background: 'rgba(255, 255, 255, 0.8)',
        surface: 'rgba(255, 255, 255, 0.6)',
        surfaceSecondary: 'rgba(241, 245, 249, 0.8)',
        
        text: colorTokens.neutral[900],
        textSecondary: colorTokens.neutral[700],
        textMuted: colorTokens.neutral[600],
        
        success: colorTokens.brand.pokemon.green,
        warning: colorTokens.brand.pokemon.yellow,
        error: colorTokens.brand.pokemon.red,
        info: colorTokens.brand.pokemon.blue,
        
        border: 'rgba(226, 232, 240, 0.5)',
        borderSecondary: 'rgba(241, 245, 249, 0.5)'
      },
      typography: sharedDesignTokens.typography,
      spacing: sharedDesignTokens.spacing,
      borderRadius: sharedDesignTokens.borderRadius,
      shadows: {
        sm: '0 8px 32px rgb(31 38 135 / 0.37)',
        md: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        lg: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        xl: '0 8px 25px rgb(0 117 190 / 0.3)'
      },
      effects: {
        glassmorphism: {
          subtle: 'rgba(255, 255, 255, 0.1)',
          moderate: 'rgba(255, 255, 255, 0.2)',
          intense: 'rgba(255, 255, 255, 0.3)'
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
        primary: colorTokens.brand.pokemon.blue,
        secondary: 'rgba(39, 39, 42, 0.8)',
        accent: colorTokens.brand.pokemon.yellow,
        
        background: 'rgba(9, 9, 11, 0.8)',
        surface: 'rgba(24, 24, 27, 0.6)',
        surfaceSecondary: 'rgba(63, 63, 70, 0.8)',
        
        text: colorTokens.neutral[50],
        textSecondary: colorTokens.neutral[200],
        textMuted: colorTokens.neutral[400],
        
        success: colorTokens.brand.pokemon.green,
        warning: colorTokens.brand.pokemon.yellow,
        error: colorTokens.brand.pokemon.red,
        info: colorTokens.brand.pokemon.blue,
        
        border: 'rgba(113, 113, 122, 0.5)',
        borderSecondary: 'rgba(63, 63, 70, 0.5)'
      },
      typography: sharedDesignTokens.typography,
      spacing: sharedDesignTokens.spacing,
      borderRadius: sharedDesignTokens.borderRadius,
      shadows: {
        sm: '0 8px 32px rgb(0 0 0 / 0.5)',
        md: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        lg: '0 35px 60px -12px rgb(0 0 0 / 0.4)',
        xl: '0 8px 25px rgb(0 117 190 / 0.3)'
      },
      effects: {
        glassmorphism: {
          subtle: 'rgba(0, 0, 0, 0.1)',
          moderate: 'rgba(255, 255, 255, 0.1)',
          intense: 'rgba(255, 255, 255, 0.15)'
        },
        gradients: {
          primary: `linear-gradient(135deg, ${colorTokens.brand.pokemon.blue}, ${colorTokens.brand.secondary.cerulean})`,
          secondary: `linear-gradient(135deg, ${colorTokens.brand.pokemon.green}, ${colorTokens.brand.pokemon.yellow})`,
          accent: `linear-gradient(135deg, ${colorTokens.brand.pokemon.yellow}, ${colorTokens.brand.pokemon.gold})`
        }
      }
    }
  },

  // Cosmic theme - Purple and pink gradients
  cosmic: {
    light: {
      colors: {
        primary: '#a855f7',
        secondary: '#f4f4f5',
        accent: '#ec4899',
        
        background: '#fafafa',
        surface: '#ffffff',
        surfaceSecondary: '#f4f4f5',
        
        text: '#09090b',
        textSecondary: '#52525b',
        textMuted: '#71717a',
        
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#a855f7',
        
        border: '#e4e4e7',
        borderSecondary: '#f4f4f5'
      },
      typography: sharedDesignTokens.typography,
      spacing: sharedDesignTokens.spacing,
      borderRadius: sharedDesignTokens.borderRadius,
      shadows: {
        sm: '0 4px 20px rgba(168, 85, 247, 0.3)',
        md: '0 8px 30px rgba(168, 85, 247, 0.4)',
        lg: '0 12px 40px rgba(168, 85, 247, 0.5)',
        xl: '0 0 0 2px rgba(168, 85, 247, 0.5)'
      },
      effects: {
        gradients: {
          primary: 'linear-gradient(135deg, #a855f7, #ec4899)',
          secondary: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
          accent: 'linear-gradient(135deg, #f97316, #ef4444)'
        }
      }
    },
    dark: {
      colors: {
        primary: '#a855f7',
        secondary: '#1a0933',
        accent: '#ec4899',
        
        background: '#0c0a1d',
        surface: '#1a0933',
        surfaceSecondary: '#2d1b4e',
        
        text: '#fafafa',
        textSecondary: '#d4d4d8',
        textMuted: '#a1a1aa',
        
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#a855f7',
        
        border: '#2d1b4e',
        borderSecondary: '#1a0933'
      },
      typography: sharedDesignTokens.typography,
      spacing: sharedDesignTokens.spacing,
      borderRadius: sharedDesignTokens.borderRadius,
      shadows: {
        sm: '0 4px 20px rgba(168, 85, 247, 0.4)',
        md: '0 8px 30px rgba(168, 85, 247, 0.6)',
        lg: '0 12px 40px rgba(168, 85, 247, 0.7)',
        xl: '0 0 0 2px rgba(168, 85, 247, 0.7)'
      },
      effects: {
        gradients: {
          primary: 'linear-gradient(135deg, #a855f7, #ec4899)',
          secondary: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
          accent: 'linear-gradient(135deg, #f97316, #ef4444)'
        }
      }
    }
  },

  // Neural theme - Blue and cyan tech theme
  neural: {
    light: {
      colors: {
        primary: '#3b82f6',
        secondary: '#f1f5f9',
        accent: '#06b6d4',
        
        background: '#ffffff',
        surface: '#ffffff',
        surfaceSecondary: '#f1f5f9',
        
        text: '#020817',
        textSecondary: '#475569',
        textMuted: '#64748b',
        
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
        
        border: '#e2e8f0',
        borderSecondary: '#f1f5f9'
      },
      typography: sharedDesignTokens.typography,
      spacing: sharedDesignTokens.spacing,
      borderRadius: sharedDesignTokens.borderRadius,
      shadows: sharedDesignTokens.shadows
    },
    dark: {
      colors: {
        primary: '#3b82f6',
        secondary: '#1e293b',
        accent: '#06b6d4',
        
        background: '#020817',
        surface: '#1e293b',
        surfaceSecondary: '#334155',
        
        text: '#f8fafc',
        textSecondary: '#cbd5e1',
        textMuted: '#94a3b8',
        
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
        
        border: '#334155',
        borderSecondary: '#1e293b'
      },
      typography: sharedDesignTokens.typography,
      spacing: sharedDesignTokens.spacing,
      borderRadius: sharedDesignTokens.borderRadius,
      shadows: sharedDesignTokens.shadows
    }
  },

  // Minimal theme - Clean black and white
  minimal: {
    light: {
      colors: {
        primary: '#171717',
        secondary: '#f5f5f5',
        accent: '#737373',
        
        background: '#ffffff',
        surface: '#ffffff',
        surfaceSecondary: '#f5f5f5',
        
        text: '#171717',
        textSecondary: '#525252',
        textMuted: '#737373',
        
        success: '#16a34a',
        warning: '#ca8a04',
        error: '#dc2626',
        info: '#171717',
        
        border: '#e5e5e5',
        borderSecondary: '#f5f5f5'
      },
      typography: sharedDesignTokens.typography,
      spacing: sharedDesignTokens.spacing,
      borderRadius: sharedDesignTokens.borderRadius,
      shadows: sharedDesignTokens.shadows
    },
    dark: {
      colors: {
        primary: '#fafafa',
        secondary: '#1a1a1a',
        accent: '#a3a3a3',
        
        background: '#0a0a0a',
        surface: '#1a1a1a',
        surfaceSecondary: '#262626',
        
        text: '#fafafa',
        textSecondary: '#d4d4d4',
        textMuted: '#a3a3a3',
        
        success: '#16a34a',
        warning: '#ca8a04',
        error: '#dc2626',
        info: '#fafafa',
        
        border: '#262626',
        borderSecondary: '#1a1a1a'
      },
      typography: sharedDesignTokens.typography,
      spacing: sharedDesignTokens.spacing,
      borderRadius: sharedDesignTokens.borderRadius,
      shadows: sharedDesignTokens.shadows
    }
  },

  // Premium theme - Elegant gold and dark theme
  premium: {
    light: {
      colors: {
        primary: '#d97706',
        secondary: '#fef3c7',
        accent: '#f59e0b',
        
        background: '#fffbeb',
        surface: '#ffffff',
        surfaceSecondary: '#fef3c7',
        
        text: '#78350f',
        textSecondary: '#92400e',
        textMuted: '#b45309',
        
        success: '#16a34a',
        warning: '#f59e0b',
        error: '#dc2626',
        info: '#d97706',
        
        border: '#fbbf24',
        borderSecondary: '#fcd34d'
      },
      typography: sharedDesignTokens.typography,
      spacing: sharedDesignTokens.spacing,
      borderRadius: sharedDesignTokens.borderRadius,
      shadows: {
        sm: '0 1px 2px 0 rgb(217 119 6 / 0.05)',
        md: '0 4px 6px -1px rgb(217 119 6 / 0.1), 0 2px 4px -2px rgb(217 119 6 / 0.1)',
        lg: '0 10px 15px -3px rgb(217 119 6 / 0.1), 0 4px 6px -4px rgb(217 119 6 / 0.1)',
        xl: '0 20px 25px -5px rgb(217 119 6 / 0.1), 0 8px 10px -6px rgb(217 119 6 / 0.1)'
      }
    },
    dark: {
      colors: {
        primary: '#f59e0b',
        secondary: '#451a03',
        accent: '#d97706',
        
        background: '#0c0a09',
        surface: '#1c1917',
        surfaceSecondary: '#292524',
        
        text: '#fbbf24',
        textSecondary: '#fed7aa',
        textMuted: '#fdba74',
        
        success: '#16a34a',
        warning: '#f59e0b',
        error: '#dc2626',
        info: '#f59e0b',
        
        border: '#78350f',
        borderSecondary: '#451a03'
      },
      typography: sharedDesignTokens.typography,
      spacing: sharedDesignTokens.spacing,
      borderRadius: sharedDesignTokens.borderRadius,
      shadows: {
        sm: '0 1px 2px 0 rgb(245 158 11 / 0.05)',
        md: '0 4px 6px -1px rgb(245 158 11 / 0.1), 0 2px 4px -2px rgb(245 158 11 / 0.1)',
        lg: '0 10px 15px -3px rgb(245 158 11 / 0.1), 0 4px 6px -4px rgb(245 158 11 / 0.1)',
        xl: '0 20px 25px -5px rgb(245 158 11 / 0.1), 0 8px 10px -6px rgb(245 158 11 / 0.1)'
      }
    }
  },

  // Liquid glass theme - enhanced transparency
  'liquid-glass': {
    light: {
      colors: {
        primary: colorTokens.brand.pokemon.blue,
        secondary: 'rgba(248, 250, 252, 0.9)',
        accent: colorTokens.brand.pokemon.yellow,
        
        background: 'rgba(255, 255, 255, 0.9)',
        surface: 'rgba(255, 255, 255, 0.7)',
        surfaceSecondary: 'rgba(241, 245, 249, 0.9)',
        
        text: colorTokens.neutral[900],
        textSecondary: colorTokens.neutral[700],
        textMuted: colorTokens.neutral[600],
        
        success: colorTokens.brand.pokemon.green,
        warning: colorTokens.brand.pokemon.yellow,
        error: colorTokens.brand.pokemon.red,
        info: colorTokens.brand.pokemon.blue,
        
        border: 'rgba(226, 232, 240, 0.6)',
        borderSecondary: 'rgba(241, 245, 249, 0.6)'
      },
      typography: sharedDesignTokens.typography,
      spacing: sharedDesignTokens.spacing,
      borderRadius: sharedDesignTokens.borderRadius,
      shadows: sharedDesignTokens.shadows,
      effects: {
        glassmorphism: {
          subtle: 'rgba(255, 255, 255, 0.15)',
          moderate: 'rgba(255, 255, 255, 0.25)',
          intense: 'rgba(255, 255, 255, 0.35)'
        }
      }
    },
    dark: {
      colors: {
        primary: colorTokens.brand.pokemon.blue,
        secondary: 'rgba(39, 39, 42, 0.9)',
        accent: colorTokens.brand.pokemon.yellow,
        
        background: 'rgba(9, 9, 11, 0.9)',
        surface: 'rgba(24, 24, 27, 0.7)',
        surfaceSecondary: 'rgba(63, 63, 70, 0.9)',
        
        text: colorTokens.neutral[50],
        textSecondary: colorTokens.neutral[200],
        textMuted: colorTokens.neutral[400],
        
        success: colorTokens.brand.pokemon.green,
        warning: colorTokens.brand.pokemon.yellow,
        error: colorTokens.brand.pokemon.red,
        info: colorTokens.brand.pokemon.blue,
        
        border: 'rgba(113, 113, 122, 0.6)',
        borderSecondary: 'rgba(63, 63, 70, 0.6)'
      },
      typography: sharedDesignTokens.typography,
      spacing: sharedDesignTokens.spacing,
      borderRadius: sharedDesignTokens.borderRadius,
      shadows: sharedDesignTokens.shadows,
      effects: {
        glassmorphism: {
          subtle: 'rgba(255, 255, 255, 0.05)',
          moderate: 'rgba(255, 255, 255, 0.1)',
          intense: 'rgba(255, 255, 255, 0.2)'
        }
      }
    }
  },

  // Holo collection theme - alias for pokemon theme
  'holo-collection': {
    light: {
      colors: {
        primary: colorTokens.brand.pokemon.blue,
        secondary: colorTokens.neutral[100],
        accent: colorTokens.brand.pokemon.yellow,
        
        background: colorTokens.neutral[50],
        surface: colorTokens.neutral[50],
        surfaceSecondary: colorTokens.neutral[100],
        
        text: colorTokens.neutral[900],
        textSecondary: colorTokens.neutral[700],
        textMuted: colorTokens.neutral[600],
        
        success: colorTokens.brand.pokemon.green,
        warning: colorTokens.brand.pokemon.yellow,
        error: colorTokens.brand.pokemon.red,
        info: colorTokens.brand.pokemon.blue,
        
        border: colorTokens.neutral[200],
        borderSecondary: colorTokens.neutral[100]
      },
      typography: sharedDesignTokens.typography,
      spacing: sharedDesignTokens.spacing,
      borderRadius: sharedDesignTokens.borderRadius,
      shadows: sharedDesignTokens.shadows
    },
    dark: {
      colors: {
        primary: colorTokens.brand.pokemon.blue,
        secondary: colorTokens.neutral[800],
        accent: colorTokens.brand.pokemon.yellow,
        
        background: colorTokens.neutral[950],
        surface: colorTokens.neutral[900],
        surfaceSecondary: colorTokens.neutral[800],
        
        text: colorTokens.neutral[50],
        textSecondary: colorTokens.neutral[200],
        textMuted: colorTokens.neutral[400],
        
        success: colorTokens.brand.pokemon.green,
        warning: colorTokens.brand.pokemon.yellow,
        error: colorTokens.brand.pokemon.red,
        info: colorTokens.brand.pokemon.blue,
        
        border: colorTokens.neutral[700],
        borderSecondary: colorTokens.neutral[800]
      },
      typography: sharedDesignTokens.typography,
      spacing: sharedDesignTokens.spacing,
      borderRadius: sharedDesignTokens.borderRadius,
      shadows: sharedDesignTokens.shadows
    }
  },

  // Cosmic aurora theme - alias for cosmic theme
  'cosmic-aurora': {
    light: {
      colors: {
        primary: '#a855f7',
        secondary: '#f4f4f5',
        accent: '#ec4899',
        
        background: '#fafafa',
        surface: '#ffffff',
        surfaceSecondary: '#f4f4f5',
        
        text: '#09090b',
        textSecondary: '#52525b',
        textMuted: '#71717a',
        
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#a855f7',
        
        border: '#e4e4e7',
        borderSecondary: '#f4f4f5'
      },
      typography: sharedDesignTokens.typography,
      spacing: sharedDesignTokens.spacing,
      borderRadius: sharedDesignTokens.borderRadius,
      shadows: sharedDesignTokens.shadows
    },
    dark: {
      colors: {
        primary: '#a855f7',
        secondary: '#1a0933',
        accent: '#ec4899',
        
        background: '#0c0a1d',
        surface: '#1a0933',
        surfaceSecondary: '#2d1b4e',
        
        text: '#fafafa',
        textSecondary: '#d4d4d8',
        textMuted: '#a1a1aa',
        
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#a855f7',
        
        border: '#2d1b4e',
        borderSecondary: '#1a0933'
      },
      typography: sharedDesignTokens.typography,
      spacing: sharedDesignTokens.spacing,
      borderRadius: sharedDesignTokens.borderRadius,
      shadows: sharedDesignTokens.shadows
    }
  },

  // Ethereal dream theme - alias for glass theme
  'ethereal-dream': {
    light: {
      colors: {
        primary: colorTokens.brand.pokemon.blue,
        secondary: 'rgba(248, 250, 252, 0.8)',
        accent: colorTokens.brand.pokemon.yellow,
        
        background: 'rgba(255, 255, 255, 0.8)',
        surface: 'rgba(255, 255, 255, 0.6)',
        surfaceSecondary: 'rgba(241, 245, 249, 0.8)',
        
        text: colorTokens.neutral[900],
        textSecondary: colorTokens.neutral[700],
        textMuted: colorTokens.neutral[600],
        
        success: colorTokens.brand.pokemon.green,
        warning: colorTokens.brand.pokemon.yellow,
        error: colorTokens.brand.pokemon.red,
        info: colorTokens.brand.pokemon.blue,
        
        border: 'rgba(226, 232, 240, 0.5)',
        borderSecondary: 'rgba(241, 245, 249, 0.5)'
      },
      typography: sharedDesignTokens.typography,
      spacing: sharedDesignTokens.spacing,
      borderRadius: sharedDesignTokens.borderRadius,
      shadows: sharedDesignTokens.shadows
    },
    dark: {
      colors: {
        primary: colorTokens.brand.pokemon.blue,
        secondary: 'rgba(39, 39, 42, 0.8)',
        accent: colorTokens.brand.pokemon.yellow,
        
        background: 'rgba(9, 9, 11, 0.8)',
        surface: 'rgba(24, 24, 27, 0.6)',
        surfaceSecondary: 'rgba(63, 63, 70, 0.8)',
        
        text: colorTokens.neutral[50],
        textSecondary: colorTokens.neutral[200],
        textMuted: colorTokens.neutral[400],
        
        success: colorTokens.brand.pokemon.green,
        warning: colorTokens.brand.pokemon.yellow,
        error: colorTokens.brand.pokemon.red,
        info: colorTokens.brand.pokemon.blue,
        
        border: 'rgba(113, 113, 122, 0.5)',
        borderSecondary: 'rgba(63, 63, 70, 0.5)'
      },
      typography: sharedDesignTokens.typography,
      spacing: sharedDesignTokens.spacing,
      borderRadius: sharedDesignTokens.borderRadius,
      shadows: sharedDesignTokens.shadows
    }
  },

  // Basic compatibility themes
  light: {
    light: {
      colors: {
        primary: colorTokens.brand.pokemon.blue,
        secondary: colorTokens.neutral[100],
        accent: colorTokens.brand.pokemon.yellow,
        
        background: colorTokens.neutral[50],
        surface: colorTokens.neutral[50],
        surfaceSecondary: colorTokens.neutral[100],
        
        text: colorTokens.neutral[900],
        textSecondary: colorTokens.neutral[700],
        textMuted: colorTokens.neutral[600],
        
        success: colorTokens.brand.pokemon.green,
        warning: colorTokens.brand.pokemon.yellow,
        error: colorTokens.brand.pokemon.red,
        info: colorTokens.brand.pokemon.blue,
        
        border: colorTokens.neutral[200],
        borderSecondary: colorTokens.neutral[100]
      },
      typography: sharedDesignTokens.typography,
      spacing: sharedDesignTokens.spacing,
      borderRadius: sharedDesignTokens.borderRadius,
      shadows: sharedDesignTokens.shadows
    },
    dark: {
      colors: {
        primary: colorTokens.brand.pokemon.blue,
        secondary: colorTokens.neutral[100],
        accent: colorTokens.brand.pokemon.yellow,
        
        background: colorTokens.neutral[50],
        surface: colorTokens.neutral[50],
        surfaceSecondary: colorTokens.neutral[100],
        
        text: colorTokens.neutral[900],
        textSecondary: colorTokens.neutral[700],
        textMuted: colorTokens.neutral[600],
        
        success: colorTokens.brand.pokemon.green,
        warning: colorTokens.brand.pokemon.yellow,
        error: colorTokens.brand.pokemon.red,
        info: colorTokens.brand.pokemon.blue,
        
        border: colorTokens.neutral[200],
        borderSecondary: colorTokens.neutral[100]
      },
      typography: sharedDesignTokens.typography,
      spacing: sharedDesignTokens.spacing,
      borderRadius: sharedDesignTokens.borderRadius,
      shadows: sharedDesignTokens.shadows
    }
  },

  dark: {
    light: {
      colors: {
        primary: colorTokens.brand.pokemon.blue,
        secondary: colorTokens.neutral[800],
        accent: colorTokens.brand.pokemon.yellow,
        
        background: colorTokens.neutral[950],
        surface: colorTokens.neutral[900],
        surfaceSecondary: colorTokens.neutral[800],
        
        text: colorTokens.neutral[50],
        textSecondary: colorTokens.neutral[200],
        textMuted: colorTokens.neutral[400],
        
        success: colorTokens.brand.pokemon.green,
        warning: colorTokens.brand.pokemon.yellow,
        error: colorTokens.brand.pokemon.red,
        info: colorTokens.brand.pokemon.blue,
        
        border: colorTokens.neutral[700],
        borderSecondary: colorTokens.neutral[800]
      },
      typography: sharedDesignTokens.typography,
      spacing: sharedDesignTokens.spacing,
      borderRadius: sharedDesignTokens.borderRadius,
      shadows: sharedDesignTokens.shadows
    },
    dark: {
      colors: {
        primary: colorTokens.brand.pokemon.blue,
        secondary: colorTokens.neutral[800],
        accent: colorTokens.brand.pokemon.yellow,
        
        background: colorTokens.neutral[950],
        surface: colorTokens.neutral[900],
        surfaceSecondary: colorTokens.neutral[800],
        
        text: colorTokens.neutral[50],
        textSecondary: colorTokens.neutral[200],
        textMuted: colorTokens.neutral[400],
        
        success: colorTokens.brand.pokemon.green,
        warning: colorTokens.brand.pokemon.yellow,
        error: colorTokens.brand.pokemon.red,
        info: colorTokens.brand.pokemon.blue,
        
        border: colorTokens.neutral[700],
        borderSecondary: colorTokens.neutral[800]
      },
      typography: sharedDesignTokens.typography,
      spacing: sharedDesignTokens.spacing,
      borderRadius: sharedDesignTokens.borderRadius,
      shadows: sharedDesignTokens.shadows
    }
  },

  // Custom theme placeholder
  custom: {
    light: {
      colors: {
        primary: colorTokens.brand.pokemon.blue,
        secondary: colorTokens.neutral[100],
        accent: colorTokens.brand.pokemon.yellow,
        
        background: colorTokens.neutral[50],
        surface: colorTokens.neutral[50],
        surfaceSecondary: colorTokens.neutral[100],
        
        text: colorTokens.neutral[900],
        textSecondary: colorTokens.neutral[700],
        textMuted: colorTokens.neutral[600],
        
        success: colorTokens.brand.pokemon.green,
        warning: colorTokens.brand.pokemon.yellow,
        error: colorTokens.brand.pokemon.red,
        info: colorTokens.brand.pokemon.blue,
        
        border: colorTokens.neutral[200],
        borderSecondary: colorTokens.neutral[100]
      },
      typography: sharedDesignTokens.typography,
      spacing: sharedDesignTokens.spacing,
      borderRadius: sharedDesignTokens.borderRadius,
      shadows: sharedDesignTokens.shadows
    },
    dark: {
      colors: {
        primary: colorTokens.brand.pokemon.blue,
        secondary: colorTokens.neutral[800],
        accent: colorTokens.brand.pokemon.yellow,
        
        background: colorTokens.neutral[950],
        surface: colorTokens.neutral[900],
        surfaceSecondary: colorTokens.neutral[800],
        
        text: colorTokens.neutral[50],
        textSecondary: colorTokens.neutral[200],
        textMuted: colorTokens.neutral[400],
        
        success: colorTokens.brand.pokemon.green,
        warning: colorTokens.brand.pokemon.yellow,
        error: colorTokens.brand.pokemon.red,
        info: colorTokens.brand.pokemon.blue,
        
        border: colorTokens.neutral[700],
        borderSecondary: colorTokens.neutral[800]
      },
      typography: sharedDesignTokens.typography,
      spacing: sharedDesignTokens.spacing,
      borderRadius: sharedDesignTokens.borderRadius,
      shadows: sharedDesignTokens.shadows
    }
  }
};

/**
 * THEME METADATA
 * Information about each theme for display and categorization
 */
export const themeMetadata: Record<ThemeName, { displayName: string; description: string; category: string }> = {
  pokemon: {
    displayName: 'Pokemon',
    description: 'Official Pokemon collection theme with blue and yellow accents',
    category: 'Brand'
  },
  glass: {
    displayName: 'Glass',
    description: 'Modern glassmorphism with blur effects and transparency',
    category: 'Modern'
  },
  cosmic: {
    displayName: 'Cosmic',
    description: 'Space-inspired theme with purple and pink gradients',
    category: 'Colorful'
  },
  neural: {
    displayName: 'Neural',
    description: 'Tech-focused theme with blue and cyan accents',
    category: 'Professional'
  },
  minimal: {
    displayName: 'Minimal',
    description: 'Clean and simple black and white design',
    category: 'Simple'
  },
  premium: {
    displayName: 'Premium',
    description: 'Elegant theme with gold accents and luxury feel',
    category: 'Elegant'
  },
  'liquid-glass': {
    displayName: 'Liquid Glass',
    description: 'Enhanced glass theme with more intense transparency',
    category: 'Modern'
  },
  'holo-collection': {
    displayName: 'Holo Collection',
    description: 'Holographic-inspired Pokemon collection theme',
    category: 'Brand'
  },
  'cosmic-aurora': {
    displayName: 'Cosmic Aurora',
    description: 'Aurora borealis inspired cosmic theme',
    category: 'Colorful'
  },
  'ethereal-dream': {
    displayName: 'Ethereal Dream',
    description: 'Dreamy glass theme with soft transparency',
    category: 'Modern'
  },
  light: {
    displayName: 'Light',
    description: 'Basic light theme for compatibility',
    category: 'Basic'
  },
  dark: {
    displayName: 'Dark',
    description: 'Basic dark theme for compatibility',
    category: 'Basic'
  },
  custom: {
    displayName: 'Custom',
    description: 'User-customized theme settings',
    category: 'Custom'
  }
};

/**
 * Get theme configuration for a specific theme and color scheme
 */
export function getThemeConfig(themeName: ThemeName, colorScheme: ColorScheme): ThemeConfig {
  return themeDefinitions[themeName]?.[colorScheme] || themeDefinitions.pokemon[colorScheme];
}

/**
 * Get all available theme names
 */
export function getAvailableThemes(): ThemeName[] {
  return Object.keys(themeDefinitions) as ThemeName[];
}

/**
 * Check if a theme has glassmorphism support
 */
export function hasGlassmorphismSupport(themeName: ThemeName): boolean {
  const glassThemes: ThemeName[] = ['glass', 'liquid-glass', 'ethereal-dream'];
  return glassThemes.includes(themeName);
}