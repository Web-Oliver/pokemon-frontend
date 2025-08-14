/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: ['class'],
  theme: {
    extend: {
      // shadcn/ui color system
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        // Pokemon brand colors
        pokemon: {
          red: 'hsl(var(--pokemon-red))',
          blue: 'hsl(var(--pokemon-blue))',
          yellow: 'hsl(var(--pokemon-yellow))',
          green: 'hsl(var(--pokemon-green))',
        },
      },
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
      // shadcn/ui border radius + extensions
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
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
  plugins: [],
}
