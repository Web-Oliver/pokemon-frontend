/**
 * CORE DESIGN TOKENS - Pokemon Collection Theme System
 * Phase 1.2 Implementation - Central token authority
 *
 * Following THEME_ARCHITECTURE_DESIGN.md specifications:
 * - Pokemon official brand colors with OKLCH color space
 * - Typography scale with Inter font family 
 * - Spacing system with 4px base unit
 * - Shadow and elevation system
 * - Border radius standards
 * - Animation timing functions
 */

// Pokemon Brand Colors (Static Reference)
export const colorTokens = {
  // Pokemon Official Brand Colors
  brand: {
    pokemon: {
      red: '#FF0000',      // Official Pokemon red
      blue: '#0075BE',     // Official Pokemon blue  
      yellow: '#FFDE00',   // Official Pokemon yellow
      green: '#00A350',    // Official Pokemon green
      gold: '#B3A125'      // Official Pokemon gold accent
    },
    secondary: {
      cerulean: '#3B4CCA', // Pokemon cerulean blue
      crimson: '#CC0000',  // Pokemon crimson red
    }
  },

  // Semantic Color System (OKLCH Color Space)
  semantic: {
    primary: {
      50: 'oklch(0.95 0.02 250)',
      100: 'oklch(0.9 0.04 250)', 
      500: 'oklch(0.55 0.2 250)',   // Maps to Pokemon blue
      600: 'oklch(0.5 0.22 250)',
      900: 'oklch(0.3 0.25 250)'
    },
    success: {
      50: 'oklch(0.95 0.02 145)',
      500: 'oklch(0.65 0.2 145)',   // Maps to Pokemon green
      900: 'oklch(0.3 0.25 145)'
    },
    warning: {
      50: 'oklch(0.95 0.02 85)',
      500: 'oklch(0.85 0.18 85)',   // Maps to Pokemon yellow
      900: 'oklch(0.3 0.25 85)'
    },
    danger: {
      50: 'oklch(0.95 0.02 25)',
      500: 'oklch(0.65 0.25 25)',   // Maps to Pokemon red
      900: 'oklch(0.3 0.28 25)'
    }
  },

  // Neutral System (Theme-Aware)
  neutral: {
    50: 'oklch(0.98 0.002 250)',   // Pure white
    100: 'oklch(0.95 0.004 250)',
    200: 'oklch(0.9 0.008 250)',
    500: 'oklch(0.65 0.02 250)',   // Mid gray
    700: 'oklch(0.4 0.03 250)',
    800: 'oklch(0.25 0.04 250)',
    900: 'oklch(0.15 0.05 250)',   // Near black
    950: 'oklch(0.09 0.06 250)'    // Pure black
  }
};

// Spacing System (4px base unit)
export const spacingTokens = {
  px: '1px',
  0: '0',
  1: '0.25rem',    // 4px
  2: '0.5rem',     // 8px  
  3: '0.75rem',    // 12px
  4: '1rem',       // 16px
  5: '1.25rem',    // 20px
  6: '1.5rem',     // 24px
  8: '2rem',       // 32px
  10: '2.5rem',    // 40px
  12: '3rem',      // 48px
  16: '4rem',      // 64px
  20: '5rem',      // 80px
  24: '6rem',      // 96px
  32: '8rem'       // 128px
};

// Typography Scale (Inter font family)
export const typographyTokens = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    pokemon: ['Pokemon', 'Inter', 'system-ui', 'sans-serif'], // Brand font if available
    mono: ['Fira Code', 'Consolas', 'monospace']
  },
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],
    sm: ['0.875rem', { lineHeight: '1.25rem' }],
    base: ['1rem', { lineHeight: '1.5rem' }],
    lg: ['1.125rem', { lineHeight: '1.75rem' }],
    xl: ['1.25rem', { lineHeight: '1.75rem' }],
    '2xl': ['1.5rem', { lineHeight: '2rem' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
    '5xl': ['3rem', { lineHeight: '1' }]
  },
  fontWeight: {
    normal: '400',
    medium: '500', 
    semibold: '600',
    bold: '700',
    black: '900'
  }
};

// Border Radius Standards
export const radiusTokens = {
  none: '0',
  sm: '0.375rem',    // 6px
  md: '0.5rem',      // 8px  
  lg: '0.75rem',     // 12px
  xl: '1rem',        // 16px
  '2xl': '1.5rem',   // 24px
  '3xl': '2rem',     // 32px
  full: '9999px'
};

// Shadow and Elevation System
export const shadowTokens = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  
  // Pokemon-specific shadows
  pokemon: '0 8px 25px rgb(0 117 190 / 0.3)',        // Blue glow
  success: '0 8px 25px rgb(0 163 80 / 0.3)',         // Green glow  
  warning: '0 8px 25px rgb(255 222 0 / 0.3)',        // Yellow glow
  danger: '0 8px 25px rgb(255 0 0 / 0.3)',           // Red glow
  
  // Glassmorphism shadows
  glass: '0 8px 32px rgb(31 38 135 / 0.37)',
  glassDark: '0 8px 32px rgb(0 0 0 / 0.5)'
};

// Animation Timing Functions
export const animationTokens = {
  duration: {
    fast: '150ms',
    normal: '250ms',
    slow: '400ms'
  },
  easing: {
    ease: 'ease',
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)'
  }
};