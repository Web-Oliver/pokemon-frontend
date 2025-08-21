/**
 * UNIFIED THEME PROVIDER - 2025 CENTRALIZED SYSTEM
 * 
 * ZERO COMPONENT UPDATES REQUIRED!
 * 
 * This provider makes theme switching completely automatic:
 * - Components use CSS classes (bg-background, text-foreground, etc.)
 * - CSS custom properties handle all the theme switching
 * - No need to update any component when adding new themes
 * 
 * Benefits:
 * - Add new themes without touching React components
 * - Instant theme switching with no re-renders
 * - CSS handles all color changes automatically
 * - Components stay theme-agnostic
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  ThemeMode,
  ThemeSettings,
  DEFAULT_THEME_SETTINGS,
  applyTheme,
  saveThemeSettings,
  loadThemeSettings,
  initializeThemeSystem,
  getSystemColorScheme,
  resolveThemeMode,
  getThemeDisplayName,
  getThemeCategories,
  isGlassTheme,
  type DensityMode,
  type AnimationLevel,
  type GlassmorphismLevel,
} from '../lib/unified-theme-system';

// ==========================================
// CONTEXT TYPE DEFINITIONS
// ==========================================

interface UnifiedThemeContextType {
  // Current theme state
  settings: ThemeSettings;
  currentTheme: ThemeMode;
  
  // Theme switching functions (zero component updates needed!)
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  
  // Advanced settings
  setDensity: (density: DensityMode) => void;
  setAnimationLevel: (level: AnimationLevel) => void;
  setGlassmorphismLevel: (level: GlassmorphismLevel) => void;
  
  // Accessibility controls
  toggleReduceMotion: () => void;
  toggleHighContrast: () => void;
  
  // Feature toggles
  toggleParticleEffects: () => void;
  toggleSoundEffects: () => void;
  
  // Advanced customization
  setBorderRadius: (radius: ThemeSettings['borderRadius']) => void;
  setCustomAccentColor: (color: string | undefined) => void;
  
  // Bulk settings update
  updateSettings: (newSettings: Partial<ThemeSettings>) => void;
  resetToDefaults: () => void;
  
  // Computed values (for UI components)
  isDark: boolean;
  isLight: boolean;
  isSystemMode: boolean;
  isGlassEnabled: boolean;
  supportsGlass: boolean;
  
  // Theme metadata (for theme picker UI)
  availableThemes: ReturnType<typeof getThemeCategories>;
  getDisplayName: (theme: ThemeMode) => string;
  
  // System state
  systemPreference: 'light' | 'dark';
}

// ==========================================
// CONTEXT CREATION
// ==========================================

const UnifiedThemeContext = createContext<UnifiedThemeContextType | undefined>(undefined);

// ==========================================
// PROVIDER COMPONENT
// ==========================================

interface UnifiedThemeProviderProps {
  children: ReactNode;
  storageKey?: string;
  enableSystemSync?: boolean;
  enableSounds?: boolean;
}

export function UnifiedThemeProvider({
  children,
  storageKey = 'pokemon-unified-theme-settings',
  enableSystemSync = true,
  enableSounds = false,
}: UnifiedThemeProviderProps) {
  // ==========================================
  // STATE MANAGEMENT
  // ==========================================
  
  const [settings, setSettings] = useState<ThemeSettings>(() => {
    // Initialize with saved settings or defaults
    return loadThemeSettings();
  });
  
  const [systemPreference, setSystemPreference] = useState<'light' | 'dark'>(() => 
    getSystemColorScheme()
  );
  
  const [isInitialized, setIsInitialized] = useState(false);

  // ==========================================
  // COMPUTED VALUES
  // ==========================================
  
  const currentTheme = resolveThemeMode(settings);
  const isDark = currentTheme === 'dark' || 
                 (settings.mode === 'system' && systemPreference === 'dark') ||
                 !['light', 'g10'].includes(currentTheme);
  const isLight = !isDark;
  const isSystemMode = settings.mode === 'system';
  const isGlassEnabled = settings.glassmorphismLevel !== 'off';
  const supportsGlass = isGlassTheme(currentTheme);

  // ==========================================
  // CORE THEME FUNCTIONS
  // ==========================================
  
  const updateSettings = (newSettings: Partial<ThemeSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    
    // Apply theme immediately (CSS handles everything!)
    applyTheme(updated);
    
    // Save to localStorage
    saveThemeSettings(updated);
    
    // Optional: Play sound effect
    if (enableSounds && updated.soundEffects && newSettings.mode) {
      playThemeChangeSound();
    }
  };

  const setTheme = (theme: ThemeMode) => {
    updateSettings({ mode: theme });
  };

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    setTheme(newTheme);
  };

  const setDensity = (density: DensityMode) => {
    updateSettings({ density });
  };

  const setAnimationLevel = (animationLevel: AnimationLevel) => {
    updateSettings({ animationLevel });
  };

  const setGlassmorphismLevel = (glassmorphismLevel: GlassmorphismLevel) => {
    updateSettings({ glassmorphismLevel });
  };

  const toggleReduceMotion = () => {
    const reduceMotion = !settings.reduceMotion;
    updateSettings({ 
      reduceMotion,
      // Auto-adjust animation level when reducing motion
      animationLevel: reduceMotion ? 'reduced' : 'normal'
    });
  };

  const toggleHighContrast = () => {
    updateSettings({ highContrast: !settings.highContrast });
  };

  const toggleParticleEffects = () => {
    updateSettings({ particleEffects: !settings.particleEffects });
  };

  const toggleSoundEffects = () => {
    updateSettings({ soundEffects: !settings.soundEffects });
  };

  const setBorderRadius = (borderRadius: ThemeSettings['borderRadius']) => {
    updateSettings({ borderRadius });
  };

  const setCustomAccentColor = (customAccentColor: string | undefined) => {
    updateSettings({ customAccentColor });
  };

  const resetToDefaults = () => {
    const defaultSettings = { ...DEFAULT_THEME_SETTINGS };
    setSettings(defaultSettings);
    applyTheme(defaultSettings);
    saveThemeSettings(defaultSettings);
  };

  // ==========================================
  // SYSTEM PREFERENCE MONITORING
  // ==========================================
  
  useEffect(() => {
    if (!enableSystemSync) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemChange = (e: MediaQueryListEvent) => {
      const newPreference = e.matches ? 'dark' : 'light';
      setSystemPreference(newPreference);
      
      // If user is using system mode, update theme immediately
      if (settings.mode === 'system') {
        applyTheme(settings);
      }
    };

    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, [settings.mode, enableSystemSync]);

  // ==========================================
  // ACCESSIBILITY MONITORING
  // ==========================================
  
  useEffect(() => {
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
    
    const handleAccessibilityChange = () => {
      const systemReducedMotion = reducedMotionQuery.matches;
      const systemHighContrast = highContrastQuery.matches;
      
      let needsUpdate = false;
      const updates: Partial<ThemeSettings> = {};
      
      if (systemReducedMotion && !settings.reduceMotion) {
        updates.reduceMotion = true;
        updates.animationLevel = 'reduced';
        needsUpdate = true;
      }
      
      if (systemHighContrast && !settings.highContrast) {
        updates.highContrast = true;
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        updateSettings(updates);
      }
    };

    reducedMotionQuery.addEventListener('change', handleAccessibilityChange);
    highContrastQuery.addEventListener('change', handleAccessibilityChange);
    
    return () => {
      reducedMotionQuery.removeEventListener('change', handleAccessibilityChange);
      highContrastQuery.removeEventListener('change', handleAccessibilityChange);
    };
  }, [settings.reduceMotion, settings.highContrast]);

  // ==========================================
  // INITIALIZATION
  // ==========================================
  
  useEffect(() => {
    if (!isInitialized) {
      const initializedSettings = initializeThemeSystem();
      setSettings(initializedSettings);
      setIsInitialized(true);
    }
  }, [isInitialized]);

  // ==========================================
  // SOUND EFFECTS
  // ==========================================
  
  const playThemeChangeSound = () => {
    try {
      // Create a subtle audio feedback for theme changes
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = isDark ? 200 : 400; // Different pitch for dark/light
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      // Ignore audio errors - not critical
    }
  };

  // ==========================================
  // CONTEXT VALUE
  // ==========================================
  
  const contextValue: UnifiedThemeContextType = {
    // State
    settings,
    currentTheme,
    
    // Theme switching (automatic for all components!)
    setTheme,
    toggleTheme,
    
    // Advanced settings
    setDensity,
    setAnimationLevel,
    setGlassmorphismLevel,
    
    // Accessibility
    toggleReduceMotion,
    toggleHighContrast,
    
    // Features
    toggleParticleEffects,
    toggleSoundEffects,
    
    // Customization
    setBorderRadius,
    setCustomAccentColor,
    
    // Bulk operations
    updateSettings,
    resetToDefaults,
    
    // Computed values
    isDark,
    isLight,
    isSystemMode,
    isGlassEnabled,
    supportsGlass,
    
    // Metadata
    availableThemes: getThemeCategories(),
    getDisplayName: getThemeDisplayName,
    
    // System
    systemPreference,
  };

  return (
    <UnifiedThemeContext.Provider value={contextValue}>
      {children}
    </UnifiedThemeContext.Provider>
  );
}

// ==========================================
// THEME HOOK - THE MAGIC SAUCE!
// ==========================================

/**
 * useUnifiedTheme Hook
 * 
 * THE KEY TO ZERO COMPONENT UPDATES!
 * 
 * Components only need to use CSS classes like:
 * - bg-background
 * - text-foreground
 * - border-border
 * - shadow-theme-primary
 * 
 * The CSS variables handle all theme switching automatically!
 */
export function useUnifiedTheme() {
  const context = useContext(UnifiedThemeContext);
  
  if (!context) {
    console.warn(
      'useUnifiedTheme must be used within UnifiedThemeProvider. ' +
      'Falling back to default behavior.'
    );
    
    // Fallback behavior - still works, just no context features
    return {
      settings: DEFAULT_THEME_SETTINGS,
      currentTheme: 'dark' as ThemeMode,
      setTheme: (theme: ThemeMode) => {
        applyTheme({ ...DEFAULT_THEME_SETTINGS, mode: theme });
      },
      toggleTheme: () => {},
      setDensity: () => {},
      setAnimationLevel: () => {},
      setGlassmorphismLevel: () => {},
      toggleReduceMotion: () => {},
      toggleHighContrast: () => {},
      toggleParticleEffects: () => {},
      toggleSoundEffects: () => {},
      setBorderRadius: () => {},
      setCustomAccentColor: () => {},
      updateSettings: () => {},
      resetToDefaults: () => {},
      isDark: true,
      isLight: false,
      isSystemMode: false,
      isGlassEnabled: false,
      supportsGlass: false,
      availableThemes: getThemeCategories(),
      getDisplayName: getThemeDisplayName,
      systemPreference: getSystemColorScheme(),
    } as UnifiedThemeContextType;
  }
  
  return context;
}

// ==========================================
// CONVENIENCE HOOKS
// ==========================================

/**
 * useThemeMode - Simple theme switching
 */
export function useThemeMode() {
  const { currentTheme, setTheme, toggleTheme, isDark, isLight } = useUnifiedTheme();
  return { currentTheme, setTheme, toggleTheme, isDark, isLight };
}

/**
 * useThemeSettings - Advanced theme configuration
 */
export function useThemeSettings() {
  const {
    settings,
    updateSettings,
    setDensity,
    setAnimationLevel,
    setGlassmorphismLevel,
    setBorderRadius,
    resetToDefaults,
  } = useUnifiedTheme();
  
  return {
    settings,
    updateSettings,
    setDensity,
    setAnimationLevel,
    setGlassmorphismLevel,
    setBorderRadius,
    resetToDefaults,
  };
}

/**
 * useAccessibility - Accessibility controls
 */
export function useAccessibility() {
  const {
    settings,
    toggleReduceMotion,
    toggleHighContrast,
  } = useUnifiedTheme();
  
  return {
    reduceMotion: settings.reduceMotion,
    highContrast: settings.highContrast,
    toggleReduceMotion,
    toggleHighContrast,
  };
}

/**
 * useThemeMetadata - Theme information for UI
 */
export function useThemeMetadata() {
  const {
    availableThemes,
    getDisplayName,
    currentTheme,
    supportsGlass,
    isGlassEnabled,
  } = useUnifiedTheme();
  
  return {
    availableThemes,
    getDisplayName,
    currentTheme,
    supportsGlass,
    isGlassEnabled,
  };
}

// ==========================================
// COMPONENT USAGE EXAMPLES
// ==========================================

/**
 * EXAMPLE: How components use the unified system
 * 
 * NO UPDATES NEEDED WHEN ADDING NEW THEMES!
 * 
 * ```tsx
 * // ✅ CORRECT - Uses CSS classes, automatically theme-aware
 * const MyComponent = () => {
 *   return (
 *     <div className="bg-background text-foreground border border-border rounded-lg shadow-theme-primary">
 *       <h2 className="text-primary">Title</h2>
 *       <p className="text-muted-foreground">Description</p>
 *       <button className="bg-primary text-primary-foreground hover:bg-primary/90">
 *         Action
 *       </button>
 *     </div>
 *   );
 * };
 * 
 * // ❌ WRONG - Manual theme handling (don't do this!)
 * const BadComponent = () => {
 *   const { isDark } = useUnifiedTheme();
 *   return (
 *     <div className={isDark ? 'bg-gray-900 text-white' : 'bg-white text-black'}>
 *       {/* This breaks when adding new themes! */}
 *     </div>
 *   );
 * };
 * 
 * // ✅ CORRECT - Theme picker component
 * const ThemePicker = () => {
 *   const { availableThemes, setTheme, currentTheme, getDisplayName } = useUnifiedTheme();
 *   
 *   return (
 *     <div className="space-y-4">
 *       {Object.entries(availableThemes).map(([category, themes]) => (
 *         <div key={category}>
 *           <h3 className="text-sm font-medium text-muted-foreground capitalize">
 *             {category}
 *           </h3>
 *           <div className="grid grid-cols-3 gap-2 mt-2">
 *             {themes.map(theme => (
 *               <button
 *                 key={theme}
 *                 onClick={() => setTheme(theme)}
 *                 className={cn(
 *                   "p-3 rounded-lg border text-sm font-medium transition-all",
 *                   "bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground",
 *                   currentTheme === theme && "ring-2 ring-primary"
 *                 )}
 *               >
 *                 {getDisplayName(theme)}
 *               </button>
 *             ))}
 *           </div>
 *         </div>
 *       ))}
 *     </div>
 *   );
 * };
 * ```
 */

export default UnifiedThemeProvider;