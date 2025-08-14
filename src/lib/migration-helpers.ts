/**
 * Migration Helpers for Pokemon Collection shadcn/ui Integration
 * Provides utility functions and wrappers for smooth migration
 */

import { cn } from "./utils"

// Convert old Pokemon button variants to new shadcn/ui variants
export function migratePokemonButtonVariant(oldVariant: string): string {
  const variantMap: Record<string, string> = {
    'primary': 'pokemon',
    'secondary': 'secondary', 
    'success': 'success',
    'danger': 'destructive',
    'warning': 'warning',
    'outline': 'outline',
    'ghost': 'ghost',
    'link': 'link',
    'cosmic': 'cosmic',
  }
  
  return variantMap[oldVariant] || 'default'
}

// Convert old Pokemon card variants to new shadcn/ui variants
export function migratePokemonCardVariant(oldVariant: string): string {
  const variantMap: Record<string, string> = {
    'glass': 'glass',
    'premium': 'premium',
    'cosmic': 'cosmic',
    'neural': 'neural',
    'default': 'default',
  }
  
  return variantMap[oldVariant] || 'default'
}

// Convert old size props to new size props
export function migrateSizeProps(oldSize: string): string {
  const sizeMap: Record<string, string> = {
    'xs': 'sm',
    'sm': 'sm', 
    'md': 'default',
    'lg': 'lg',
    'xl': 'xl',
  }
  
  return sizeMap[oldSize] || 'default'
}

// Convert old theme classes to new shadcn/ui compatible classes
export function migrateThemeClasses(oldClasses: string): string {
  // Replace old custom CSS variables with new shadcn/ui variables
  return oldClasses
    .replace(/var\(--theme-primary\)/g, 'hsl(var(--primary))')
    .replace(/var\(--theme-secondary\)/g, 'hsl(var(--secondary))')
    .replace(/var\(--theme-accent\)/g, 'hsl(var(--accent))')
    .replace(/var\(--theme-bg-primary\)/g, 'hsl(var(--background))')
    .replace(/var\(--theme-bg-secondary\)/g, 'hsl(var(--muted))')
    .replace(/var\(--theme-border\)/g, 'hsl(var(--border))')
}

// Legacy component prop conversion
export interface LegacyButtonProps {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'outline' | 'ghost' | 'link' | 'cosmic'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  theme?: string
  _colorScheme?: string
  density?: 'compact' | 'normal' | 'spacious'
  animationIntensity?: 'none' | 'reduced' | 'normal' | 'enhanced'
  actionType?: 'submit' | 'cancel' | 'save' | 'delete' | 'create' | 'update'
}

export interface NewButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'pokemon' | 'success' | 'warning' | 'cosmic' | 'glassmorphism'
  size?: 'default' | 'sm' | 'lg' | 'xl' | 'icon' | 'icon-sm' | 'icon-lg'
  animation?: 'none' | 'subtle' | 'normal' | 'enhanced'
  rounded?: 'default' | 'sm' | 'lg' | 'xl' | '2xl' | 'full'
  actionType?: 'submit' | 'cancel' | 'save' | 'delete' | 'create' | 'update'
}

// Convert legacy props to new props
export function migrateLegacyButtonProps(legacyProps: LegacyButtonProps): NewButtonProps {
  return {
    variant: migratePokemonButtonVariant(legacyProps.variant || 'primary') as NewButtonProps['variant'],
    size: migrateSizeProps(legacyProps.size || 'md') as NewButtonProps['size'],
    animation: legacyProps.animationIntensity === 'none' ? 'none' :
               legacyProps.animationIntensity === 'reduced' ? 'subtle' :
               legacyProps.animationIntensity === 'enhanced' ? 'enhanced' :
               'normal',
    actionType: legacyProps.actionType,
  }
}

// Utility to combine old custom classes with new shadcn/ui classes
export function combineClasses(...classes: (string | undefined)[]): string {
  return cn(
    classes
      .filter(Boolean)
      .map(cls => cls ? migrateThemeClasses(cls) : '')
      .filter(Boolean)
  )
}

// Theme-aware class generator for backward compatibility
export function generateLegacyThemeClasses(component: string, options: { theme?: string; colorScheme?: string }): string {
  if (!options.theme && !options.colorScheme) return ''
  
  // Basic theme mapping for compatibility
  const themeClasses: Record<string, string> = {
    'dark': 'dark:bg-background dark:text-foreground',
    'light': 'bg-background text-foreground',
    'cosmic': 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600',
    'neural': 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600',
  }
  
  return themeClasses[options.theme || options.colorScheme || ''] || ''
}