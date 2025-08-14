/**
 * Enhanced theme hook for Pokemon Collection
 * Integrates with shadcn/ui theme system
 */

import { useContext, useEffect, useState } from 'react';
import { ThemeContext } from '../contexts/theme-context';
import { 
  ThemeMode, 
  ThemeSettings, 
  defaultThemeSettings,
  setThemeMode,
  type DensityMode,
  type AnimationIntensity,
  type GlassmorphismIntensity
} from '../lib/theme';
import { getVisualTheme, type ThemeConfig } from '../lib/theme-utils';

export function useTheme() {
  const context = useContext(ThemeContext);
  
  if (!context) {
    // Fallback when used outside ThemeProvider
    const [settings, setSettings] = useState<ThemeSettings>(defaultThemeSettings);
    
    const updateTheme = (newSettings: Partial<ThemeSettings>) => {
      const updated = { ...settings, ...newSettings };
      setSettings(updated);
      
      if (newSettings.mode) {
        setThemeMode(newSettings.mode);
      }
      
      // Store in localStorage
      localStorage.setItem('pokemon-theme-settings', JSON.stringify(updated));
    };
    
    // Load settings from localStorage on mount
    useEffect(() => {
      const stored = localStorage.getItem('pokemon-theme-settings');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setSettings(parsed);
          setThemeMode(parsed.mode);
        } catch {
          // Invalid stored data, use defaults
        }
      }
    }, []);
    
    return {
      settings,
      setTheme: (mode: ThemeMode) => updateTheme({ mode }),
      setDensity: (density: DensityMode) => updateTheme({ density }),
      setAnimationIntensity: (intensity: AnimationIntensity) => updateTheme({ animationIntensity: intensity }),
      setGlassmorphismIntensity: (intensity: GlassmorphismIntensity) => updateTheme({ glassmorphismIntensity: intensity }),
      toggleReducedMotion: () => updateTheme({ reducedMotion: !settings.reducedMotion }),
      toggleHighContrast: () => updateTheme({ highContrast: !settings.highContrast }),
      updateSettings: updateTheme,
      // Visual theme integration
      visualTheme: getVisualTheme(),
      // Convenience getters
      isDark: settings.mode === 'dark' || (settings.mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches),
      isLight: settings.mode === 'light' || (settings.mode === 'system' && !window.matchMedia('(prefers-color-scheme: dark)').matches),
      isSystem: settings.mode === 'system',
    };
  }
  
  return context;
}

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
}

// System preference detection
export function useSystemTheme(): 'light' | 'dark' {
  const isDark = useMediaQuery('(prefers-color-scheme: dark)');
  return isDark ? 'dark' : 'light';
}

// Reduced motion detection
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

// High contrast detection
export function usePrefersHighContrast(): boolean {
  return useMediaQuery('(prefers-contrast: high)');
}