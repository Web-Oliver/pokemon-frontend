# Pokemon Collection Theme Configuration

## 🎨 Complete Theme System Guide

This document outlines the comprehensive theme system implemented for the Pokemon Collection frontend, integrating shadcn/ui with custom Pokemon theming.

## 📁 Theme Configuration Files

### Core Theme Files
- `src/lib/theme.ts` - Central theme configuration and utilities
- `src/contexts/theme-context.tsx` - Theme provider and context
- `src/hooks/use-theme.ts` - Theme hook for components
- `src/index.css` - CSS variables and Tailwind integration

## 🎯 Theme Structure

### Theme Settings Interface
```typescript
interface ThemeSettings {
  mode: 'light' | 'dark' | 'system'
  density: 'compact' | 'comfortable' | 'spacious'
  animationIntensity: 'reduced' | 'normal' | 'enhanced'
  glassmorphismIntensity: 'subtle' | 'medium' | 'intense'
  reducedMotion: boolean
  highContrast: boolean
}
```

### CSS Variables System

#### shadcn/ui Core Variables
```css
/* Light Theme */
--background: 0 0% 100%
--foreground: 222.2 84% 4.9%
--primary: 222.2 47.4% 11.2%
--secondary: 210 40% 96%
--muted: 210 40% 98%
--accent: 210 40% 96%
--destructive: 0 84.2% 60.2%
--border: 214.3 31.8% 91.4%
--input: 214.3 31.8% 91.4%
--ring: 222.2 84% 4.9%

/* Dark Theme */
--background: 222.2 84% 4.9%
--foreground: 210 40% 98%
--primary: 210 40% 98%
--secondary: 217.2 32.6% 17.5%
--muted: 217.2 32.6% 17.5%
--accent: 217.2 32.6% 17.5%
--destructive: 0 62.8% 30.6%
--border: 217.2 32.6% 17.5%
--input: 217.2 32.6% 17.5%
--ring: 212.7 26.8% 83.9%
```

#### Pokemon Custom Variables
```css
/* Pokemon Brand Colors */
--pokemon-red: 255 0 0
--pokemon-blue: 0 117 190
--pokemon-yellow: 255 222 0
--pokemon-green: 0 163 80

/* Glassmorphism System */
--glass-bg: rgba(255, 255, 255, 0.1) /* Light */
--glass-bg: rgba(0, 0, 0, 0.2)       /* Dark */
--glass-border: rgba(255, 255, 255, 0.2)
--glass-blur: 10px /* Adjustable: 6px, 10px, 16px */

/* Animation Durations */
--duration-fast: 150ms
--duration-normal: 250ms  
--duration-slow: 400ms
```

## 🎮 Component Theming

### Button Variants
```typescript
// shadcn/ui Base Variants
'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'

// Pokemon Enhanced Variants
'pokemon'     // Blue to indigo gradient
'success'     // Emerald to teal gradient  
'warning'     // Amber to orange gradient
'cosmic'      // Emerald via teal to cyan with glow effects
'glassmorphism' // Glassmorphism styling
```

### Card Variants
```typescript
'default'  // Standard shadcn/ui card
'glass'    // Glassmorphism effect
'cosmic'   // Emerald/teal/cyan gradient with glow
'premium'  // Slate gradient with premium styling
'neural'   // Indigo/purple/pink gradient
```

### Input Variants
```typescript
'default' // Standard shadcn/ui input
'glass'   // Glassmorphism with white accents
'cosmic'  // Emerald theme with glow focus
'neural'  // Indigo/purple theme
```

### Badge Variants
```typescript
// Standard Variants
'default' | 'secondary' | 'destructive' | 'outline'

// Pokemon Variants  
'pokemon' | 'success' | 'warning' | 'danger' | 'glass' | 'cosmic' | 'neural'

// Pokemon Card Rarity System
'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic'
```

## 🔧 Theme Integration

### Using the Theme Hook
```tsx
import { useTheme } from '@/hooks/use-theme'

export function MyComponent() {
  const { 
    settings, 
    setTheme, 
    setDensity,
    setAnimationIntensity,
    toggleReducedMotion,
    isDark,
    isLight 
  } = useTheme()
  
  return (
    <div>
      <button onClick={() => setTheme('dark')}>
        Dark Mode
      </button>
      <button onClick={() => setDensity('compact')}>
        Compact Layout
      </button>
    </div>
  )
}
```

### Theme Provider Setup
```tsx
import { ThemeProvider } from '@/contexts/theme-context'

export function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="pokemon-theme">
      {/* Your app */}
    </ThemeProvider>
  )
}
```

## 🎨 Advanced Theming Features

### Density System
Adjusts spacing throughout the application:

```css
/* Compact */
--spacing-xs: 0.125rem
--spacing-sm: 0.25rem
--spacing-md: 0.5rem

/* Comfortable (default) */
--spacing-xs: 0.25rem
--spacing-sm: 0.5rem  
--spacing-md: 1rem

/* Spacious */
--spacing-xs: 0.5rem
--spacing-sm: 0.75rem
--spacing-md: 1.25rem
```

### Animation Intensity
Controls animation speed and complexity:

```css
/* Reduced */
--duration-fast: 50ms
--duration-normal: 100ms
--duration-slow: 150ms

/* Enhanced */
--duration-fast: 200ms
--duration-normal: 350ms
--duration-slow: 600ms
```

### Glassmorphism Intensity
Adjusts backdrop blur and transparency:

```css
/* Subtle */
--glass-blur: 6px
--glass-bg: rgba(255, 255, 255, 0.05)

/* Intense */
--glass-blur: 16px
--glass-bg: rgba(255, 255, 255, 0.15)
```

## 🌈 Color System Integration

### Tailwind CSS Integration
```javascript
// tailwind.config.js
colors: {
  // shadcn/ui variables
  background: 'hsl(var(--background))',
  foreground: 'hsl(var(--foreground))',
  primary: {
    DEFAULT: 'hsl(var(--primary))',
    foreground: 'hsl(var(--primary-foreground))',
  },
  
  // Pokemon brand colors
  pokemon: {
    red: 'hsl(var(--pokemon-red))',
    blue: 'hsl(var(--pokemon-blue))',
    yellow: 'hsl(var(--pokemon-yellow))',
    green: 'hsl(var(--pokemon-green))',
  },
}
```

### Component Usage
```tsx
// Using shadcn/ui colors
<div className="bg-background text-foreground border-border">
  shadcn/ui styling
</div>

// Using Pokemon colors  
<div className="bg-pokemon-blue text-white">
  Pokemon themed styling
</div>

// Using glassmorphism
<div className="bg-white/10 backdrop-blur-md border-white/20">
  Glassmorphism effect
</div>
```

## 🔄 Migration Utilities

### Theme Class Migration
```typescript
import { migrateThemeClasses } from '@/lib/migration-helpers'

// Converts old custom properties to shadcn/ui variables
const newClasses = migrateThemeClasses(
  'var(--theme-primary) var(--theme-bg-primary)'
)
// Result: 'hsl(var(--primary)) hsl(var(--background))'
```

### Component Prop Migration
```typescript
import { migrateLegacyButtonProps } from '@/lib/migration-helpers'

const legacyProps = {
  variant: 'primary',
  size: 'md',
  animationIntensity: 'enhanced'
}

const newProps = migrateLegacyButtonProps(legacyProps)
// Result: { variant: 'pokemon', size: 'default', animation: 'enhanced' }
```

## 🎯 Best Practices

### 1. Use Theme Variables
```tsx
// ✅ Good - Uses theme variables
<div className="bg-background text-foreground">

// ❌ Avoid - Hardcoded colors  
<div className="bg-white text-black">
```

### 2. Respect User Preferences
```tsx
// ✅ Good - Checks user preferences
const { settings } = useTheme()
const animationClass = settings.reducedMotion ? '' : 'animate-bounce'

// ❌ Avoid - Ignores accessibility
<div className="animate-bounce">
```

### 3. Use Semantic Variants
```tsx
// ✅ Good - Semantic meaning
<PokemonButton variant="success" actionType="save">
  Save Changes
</PokemonButton>

// ❌ Avoid - Generic styling
<PokemonButton className="bg-green-500">
  Save Changes  
</PokemonButton>
```

## 📱 Responsive Theming

The theme system automatically adapts to different screen sizes and device capabilities:

- **Mobile**: Compact density by default
- **Desktop**: Comfortable density  
- **High-DPI**: Enhanced visual effects
- **Reduced Motion**: Respects user preferences
- **High Contrast**: Accessibility support

## 🔍 Debugging Themes

### Theme Inspector Hook
```tsx
import { useTheme } from '@/hooks/use-theme'

export function ThemeDebugger() {
  const { settings } = useTheme()
  
  return (
    <pre>{JSON.stringify(settings, null, 2)}</pre>
  )
}
```

### CSS Variable Inspector
```javascript
// Browser console
const root = document.documentElement
const styles = getComputedStyle(root)
console.log({
  background: styles.getPropertyValue('--background'),
  primary: styles.getPropertyValue('--primary'),
  glassBg: styles.getPropertyValue('--glass-bg')
})
```

This comprehensive theme system provides the foundation for a consistent, accessible, and highly customizable user interface that maintains the unique Pokemon Collection aesthetic while leveraging modern design system principles.