/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'selector',
  theme: {
    extend: {
      // Context7 Premium Animation Extensions
      animation: {
        shimmer: 'shimmer 2s linear infinite',
        float: 'float 3s ease-in-out infinite',
        glow: 'glow 2s ease-in-out infinite alternate',
        'slide-up': 'slide-up 0.5s ease-out',
        'slide-down': 'slide-down 0.5s ease-out',
        'scale-in': 'scale-in 0.3s ease-out',
        'fade-in': 'fade-in 0.5s ease-out',
        'gradient-x': 'gradient-x 3s ease infinite',
        'gradient-y': 'gradient-y 3s ease infinite',
        'bounce-gentle': 'bounce-gentle 2s infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)' },
          '100%': { boxShadow: '0 0 30px rgba(99, 102, 241, 0.8)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center',
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center',
          },
        },
        'gradient-y': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'center top',
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'center bottom',
          },
        },
        'bounce-gentle': {
          '0%, 100%': {
            transform: 'translateY(-5%)',
            'animation-timing-function': 'cubic-bezier(0.8, 0, 1, 1)',
          },
          '50%': {
            transform: 'translateY(0)',
            'animation-timing-function': 'cubic-bezier(0, 0, 0.2, 1)',
          },
        },
      },
      // THEME-AWARE COLORS
      // Integrates with ThemeContext and pokemon-design-system.css
      colors: {
        // Theme-aware dynamic colors
        'theme-primary': 'var(--theme-primary)',
        'theme-primary-hover': 'var(--theme-primary-hover)',
        'theme-secondary': 'var(--theme-secondary)',
        'theme-accent': 'var(--theme-accent)',
        'theme-bg-primary': 'var(--theme-bg-primary)',
        'theme-bg-secondary': 'var(--theme-bg-secondary)',
        'theme-bg-accent': 'var(--theme-bg-accent)',
        'theme-border-primary': 'var(--theme-border-primary)',
        'theme-border-secondary': 'var(--theme-border-secondary)',
        'theme-border-accent': 'var(--theme-border-accent)',

        // Legacy premium colors (maintained for compatibility)
        premium: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },

        // Enhanced glassmorphism colors (intensity-aware)
        glass: {
          primary: 'var(--bg-glass-primary)',
          secondary: 'var(--bg-glass-secondary)',
          accent: 'var(--bg-glass-accent)',
          overlay: 'var(--bg-glass-overlay)',
          border: {
            light: 'var(--border-glass-light)',
            medium: 'var(--border-glass-medium)',
            subtle: 'var(--border-glass-subtle)',
          },
        },

        // Pokemon brand colors (static)
        pokemon: {
          red: 'var(--color-pokemon-red)',
          blue: 'var(--color-pokemon-blue)',
          yellow: 'var(--color-pokemon-yellow)',
          green: 'var(--color-pokemon-green)',
        },

        // Context7 futuristic colors (static)
        cyber: {
          cyan: 'var(--color-cyber-cyan)',
          purple: 'var(--color-neural-purple)',
          pink: 'var(--color-quantum-pink)',
          emerald: 'var(--color-plasma-emerald)',
        },
      },
      // DENSITY-AWARE SPACING
      // Integrates with ThemeContext density settings
      spacing: {
        // Theme-aware density spacing
        'density-xs': 'var(--density-spacing-xs)',
        'density-sm': 'var(--density-spacing-sm)',
        'density-md': 'var(--density-spacing-md)',
        'density-lg': 'var(--density-spacing-lg)',
        'density-xl': 'var(--density-spacing-xl)',
        'density-2xl': 'var(--density-spacing-2xl)',
        'density-3xl': 'var(--density-spacing-3xl)',

        // Legacy spacing (maintained for compatibility)
        18: '4.5rem',
        88: '22rem',
        128: '32rem',
      },
      // Context7 Premium Border Radius
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
        '6xl': '3rem',
      },
      // THEME-AWARE SHADOWS
      // Integrates with glassmorphism intensity and visual themes
      boxShadow: {
        // Theme-aware dynamic shadows
        'theme-primary': 'var(--theme-shadow-primary)',
        'theme-hover': 'var(--theme-shadow-hover)',
        'glass-main': 'var(--shadow-glass)',
        'glass-hover': 'var(--shadow-glass-hover)',
        neural: 'var(--shadow-neural)',
        quantum: 'var(--shadow-quantum)',
        cosmic: 'var(--shadow-cosmic)',
        minimal: 'var(--shadow-minimal)',

        // Legacy shadows (maintained for compatibility)
        glow: '0 0 20px rgba(99, 102, 241, 0.4)',
        'glow-lg': '0 0 30px rgba(99, 102, 241, 0.6)',
        premium:
          '0 20px 40px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.1)',
        glass: '0 8px 32px rgba(31, 38, 135, 0.37)',
        float: '0 10px 30px rgba(0, 0, 0, 0.1), 0 1px 8px rgba(0, 0, 0, 0.2)',
      },
      // THEME-AWARE BACKDROP BLUR
      // Integrates with glassmorphism intensity settings
      backdropBlur: {
        theme: 'var(--glass-blur)',
        xs: '2px',
        '4xl': '72px',
      },

      // ANIMATION INTENSITY SUPPORT
      // Integrates with ThemeContext animationIntensity settings
      transitionDuration: {
        'theme-fast': 'var(--animation-duration-fast)',
        'theme-normal': 'var(--animation-duration-normal)',
        'theme-slow': 'var(--animation-duration-slow)',
      },
      // Context7 Premium Font Families
      fontFamily: {
        premium: ['Inter', 'system-ui', 'sans-serif'],
      },
      // Context7 Premium Transforms
      scale: {
        102: '1.02',
        103: '1.03',
        98: '0.98',
      },
      // Context7 Premium Z-Index
      zIndex: {
        60: '60',
        70: '70',
        80: '80',
        90: '90',
        100: '100',
      },
    },
  },
  plugins: [
    // THEME-AWARE UTILITIES PLUGIN
    // Phase 1.1.3: Enhanced plugin with CSS custom properties integration
    function ({ addUtilities, addComponents }) {
      // Theme-aware utilities
      const themeUtilities = {
        // Dynamic glassmorphism utilities
        '.glass-morphism': {
          background: 'var(--bg-glass-primary)',
          'backdrop-filter': 'blur(var(--glass-blur))',
          border: '1px solid var(--border-glass-light)',
        },
        '.glass-morphism-secondary': {
          background: 'var(--bg-glass-secondary)',
          'backdrop-filter': 'blur(var(--glass-blur))',
          border: '1px solid var(--border-glass-medium)',
        },
        '.glass-morphism-accent': {
          background: 'var(--bg-glass-accent)',
          'backdrop-filter': 'blur(var(--glass-blur))',
          border: '1px solid var(--border-glass-subtle)',
        },

        // Theme-aware shadows
        '.theme-shadow': {
          'box-shadow': 'var(--theme-shadow-primary)',
        },
        '.theme-shadow-hover': {
          'box-shadow': 'var(--theme-shadow-hover)',
        },

        // Animation utilities with theme support
        '.shimmer': {
          background:
            'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
          animation: 'shimmer 2s infinite',
        },
        '.shimmer-theme': {
          background:
            'linear-gradient(90deg, transparent, var(--border-glass-light), transparent)',
          animation: 'shimmer var(--animation-duration-slow) infinite',
        },

        // Theme-aware gradient border
        '.gradient-border-theme': {
          background:
            'linear-gradient(var(--theme-bg-primary), var(--theme-bg-primary)) padding-box, var(--theme-signature-gradient) border-box',
          border: '2px solid transparent',
        },

        // Legacy utilities (maintained for compatibility)
        '.glass-morphism-dark': {
          background: 'rgba(0, 0, 0, 0.8)',
          'backdrop-filter': 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
        '.gradient-border': {
          background:
            'linear-gradient(white, white) padding-box, linear-gradient(45deg, #6366f1, #8b5cf6, #3b82f6) border-box',
          border: '2px solid transparent',
        },
        '.premium-shadow': {
          'box-shadow':
            '0 20px 40px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.1)',
        },
        '.premium-glow': {
          'box-shadow':
            '0 0 20px rgba(99, 102, 241, 0.4), 0 8px 32px rgba(31, 38, 135, 0.37)',
        },
      };
      addUtilities(themeUtilities);

      // Theme-aware component classes
      const themeComponents = {
        '.card-theme': {
          background: 'var(--theme-card-background)',
          'backdrop-filter': 'blur(var(--glass-blur))',
          border: '1px solid var(--theme-card-border)',
          'border-radius': 'var(--radius-3xl)',
          'box-shadow': 'var(--theme-shadow-primary)',
          transition: 'all var(--animation-duration-normal) var(--ease-out)',
        },
        '.card-theme:hover': {
          'box-shadow': 'var(--theme-shadow-hover)',
          transform: 'scale(1.02) translateY(-4px)',
        },
        '.btn-theme': {
          background: 'var(--theme-primary)',
          color: 'white',
          padding: 'var(--density-spacing-sm) var(--density-spacing-lg)',
          'border-radius': 'var(--radius-2xl)',
          'box-shadow': 'var(--theme-shadow-primary)',
          transition: 'all var(--animation-duration-normal) var(--ease-out)',
        },
        '.btn-theme:hover': {
          background: 'var(--theme-primary-hover)',
          'box-shadow': 'var(--theme-shadow-hover)',
          transform: 'scale(1.05) translateY(-2px)',
        },
      };
      addComponents(themeComponents);
    },
  ],
};
