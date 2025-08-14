/**
 * Theme Context Provider for Pokemon Collection
 * Integrates shadcn/ui with custom theme system
 */

import React, { createContext, useEffect, useState, ReactNode } from 'react';
import { 
  ThemeMode, 
  ThemeSettings, 
  defaultThemeSettings,
  setThemeMode,
  type DensityMode,
  type AnimationIntensity,
  type GlassmorphismIntensity
} from '../lib/theme';

interface ThemeContextType {
  settings: ThemeSettings;
  setTheme: (mode: ThemeMode) => void;
  setDensity: (density: DensityMode) => void;
  setAnimationIntensity: (intensity: AnimationIntensity) => void;
  setGlassmorphismIntensity: (intensity: GlassmorphismIntensity) => void;
  toggleReducedMotion: () => void;
  toggleHighContrast: () => void;
  updateSettings: (newSettings: Partial<ThemeSettings>) => void;
  // Convenience getters
  isDark: boolean;
  isLight: boolean;
  isSystem: boolean;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: ThemeMode;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = 'dark',
  storageKey = 'pokemon-theme-settings',
}: ThemeProviderProps) {
  const [settings, setSettings] = useState<ThemeSettings>(() => {
    // Initialize from localStorage or defaults
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          return { ...defaultThemeSettings, ...parsed };
        }
      } catch {
        // Invalid stored data, use defaults
      }
    }
    return { ...defaultThemeSettings, mode: defaultTheme };
  });

  const updateSettings = (newSettings: Partial<ThemeSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    
    // Apply theme mode immediately
    if (newSettings.mode !== undefined) {
      setThemeMode(newSettings.mode);
    }
    
    // Store in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    }
    
    // Update CSS variables for other settings
    applyThemeSettings(updated);
  };

  const applyThemeSettings = (themeSettings: ThemeSettings) => {
    const root = document.documentElement;
    
    // Phase 1.3: Set data attribute for theme switching
    root.setAttribute('data-theme', themeSettings.mode === 'system' 
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : themeSettings.mode
    );
    
    // Apply density settings - density-aware spacing system
    const densityMap = {
      compact: { xs: '0.125rem', sm: '0.25rem', md: '0.5rem', lg: '0.75rem', xl: '1rem', '2xl': '1.5rem', '3xl': '2rem' },
      comfortable: { xs: '0.25rem', sm: '0.5rem', md: '1rem', lg: '1.5rem', xl: '2rem', '2xl': '3rem', '3xl': '4rem' },
      spacious: { xs: '0.5rem', sm: '0.75rem', md: '1.25rem', lg: '2rem', xl: '2.5rem', '2xl': '4rem', '3xl': '5rem' },
    };
    
    const densityValues = densityMap[themeSettings.density];
    Object.entries(densityValues).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, value);
      root.style.setProperty(`--density-spacing-${key}`, value);
    });
    
    // Apply animation intensity - performance optimized
    const animationMap = {
      reduced: { fast: '50ms', normal: '100ms', slow: '150ms' },
      normal: { fast: '150ms', normal: '250ms', slow: '400ms' },
      enhanced: { fast: '200ms', normal: '350ms', slow: '600ms' },
    };
    
    const animationValues = animationMap[themeSettings.animationIntensity];
    Object.entries(animationValues).forEach(([key, value]) => {
      root.style.setProperty(`--duration-${key}`, value);
      root.style.setProperty(`--animation-duration-${key}`, value);
    });
    
    // Apply glassmorphism intensity - theme-aware
    const glassMap = {
      subtle: { blur: '6px', bg: 'rgba(255, 255, 255, 0.05)', border: 'rgba(255, 255, 255, 0.1)' },
      medium: { blur: '10px', bg: 'rgba(255, 255, 255, 0.1)', border: 'rgba(255, 255, 255, 0.2)' },
      intense: { blur: '16px', bg: 'rgba(255, 255, 255, 0.15)', border: 'rgba(255, 255, 255, 0.3)' },
    };
    
    const glassValues = glassMap[themeSettings.glassmorphismIntensity];
    Object.entries(glassValues).forEach(([key, value]) => {
      root.style.setProperty(`--glass-${key}`, value);
    });
    
    // Apply accessibility settings - WCAG 2.1 AA compliance
    if (themeSettings.reducedMotion) {
      root.style.setProperty('--animation-duration-fast', '0ms');
      root.style.setProperty('--animation-duration-normal', '0ms');
      root.style.setProperty('--animation-duration-slow', '0ms');
      root.style.setProperty('--duration-fast', '0ms');
      root.style.setProperty('--duration-normal', '0ms');
      root.style.setProperty('--duration-slow', '0ms');
    }
    
    // Apply high contrast for accessibility
    root.classList.toggle('high-contrast', themeSettings.highContrast);
    
    // Set density class for component styling
    root.className = root.className.replace(/density-\w+/g, '');
    root.classList.add(`density-${themeSettings.density}`);
    
    // Set animation intensity class
    root.className = root.className.replace(/animation-\w+/g, '');  
    root.classList.add(`animation-${themeSettings.animationIntensity}`);
    
    // Set glass intensity class
    root.className = root.className.replace(/glass-\w+/g, '');
    root.classList.add(`glass-${themeSettings.glassmorphismIntensity}`);
  };

  // Initialize theme on mount
  useEffect(() => {
    setThemeMode(settings.mode);
    applyThemeSettings(settings);
  }, []);

  // Listen for system theme changes when in system mode
  useEffect(() => {
    if (settings.mode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => setThemeMode('system');
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [settings.mode]);

  // Computed values
  const isDark = settings.mode === 'dark' || 
    (settings.mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const isLight = settings.mode === 'light' || 
    (settings.mode === 'system' && !window.matchMedia('(prefers-color-scheme: dark)').matches);
  const isSystem = settings.mode === 'system';

  const contextValue: ThemeContextType = {
    settings,
    setTheme: (mode: ThemeMode) => updateSettings({ mode }),
    setDensity: (density: DensityMode) => updateSettings({ density }),
    setAnimationIntensity: (intensity: AnimationIntensity) => updateSettings({ animationIntensity: intensity }),
    setGlassmorphismIntensity: (intensity: GlassmorphismIntensity) => updateSettings({ glassmorphismIntensity: intensity }),
    toggleReducedMotion: () => updateSettings({ reducedMotion: !settings.reducedMotion }),
    toggleHighContrast: () => updateSettings({ highContrast: !settings.highContrast }),
    updateSettings,
    isDark,
    isLight,
    isSystem,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}