/**
 * UNIFIED THEME SWITCHER - 2025 CENTRALIZED SYSTEM
 * 
 * This component demonstrates how easy theme switching becomes
 * with the unified system. Components automatically adapt to
 * theme changes without any updates needed!
 */

import { useTheme } from '@/theme';
import { getAvailableThemes, themeMetadata, hasGlassmorphismSupport } from '@/theme';
import { cn } from '@/lib/utils';
import type { ThemeName } from '@/theme';

export function UnifiedThemeSwitcher() {
  const {
    settings,
    setTheme,
    setDensity,
    setAnimationLevel,
    setGlassmorphismLevel,
    isDark,
  } = useTheme();

  // Helper functions
  const getDisplayName = (theme: ThemeName) => themeMetadata[theme]?.displayName || theme;
  const currentTheme = settings.name || 'pokemon'; // Provide fallback
  
  // Group themes by category
  const availableThemes = getAvailableThemes().reduce((acc, theme) => {
    const category = themeMetadata[theme]?.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(theme);
    return acc;
  }, {} as Record<string, ThemeName[]>);
  
  const supportsGlass = hasGlassmorphismSupport(currentTheme);
  const isGlassEnabled = settings.glassmorphismLevel && settings.glassmorphismLevel !== 'none';
  
  // Toggle functions
  const toggleReduceMotion = () => {
    // Implementation would need to be added to the hook
  };
  
  const toggleParticleEffects = () => {
    // Implementation would need to be added to the hook  
  };

  return (
    <div className="space-y-6 p-6 bg-card text-card-foreground rounded-lg border shadow-theme-primary">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-foreground">Theme Settings</h2>
        <p className="text-sm text-muted-foreground">
          Current theme: <span className="font-medium text-primary">{getDisplayName(currentTheme)}</span>
        </p>
      </div>

      {/* Theme Categories */}
      <div className="space-y-4">
        {Object.entries(availableThemes).map(([category, themes]) => (
          <div key={category} className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              {category}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {themes.map(theme => (
                <button
                  key={theme}
                  onClick={() => setTheme(theme)}
                  className={cn(
                    "p-3 rounded-lg border text-sm font-medium transition-all duration-200",
                    "bg-secondary text-secondary-foreground",
                    "hover:bg-accent hover:text-accent-foreground hover:shadow-hover",
                    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    currentTheme === theme && "ring-2 ring-primary bg-primary text-primary-foreground"
                  )}
                >
                  {getDisplayName(theme)}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Density Settings */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-foreground">Density</h3>
        <div className="flex gap-2">
          {(['compact', 'comfortable', 'spacious'] as const).map(density => (
            <button
              key={density}
              onClick={() => setDensity(density)}
              className={cn(
                "px-3 py-2 text-xs font-medium rounded-md border transition-all",
                "bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground",
                settings.density === density && "bg-primary text-primary-foreground"
              )}
            >
              {density.charAt(0).toUpperCase() + density.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Animation Level */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-foreground">Animations</h3>
        <div className="flex gap-2">
          {(['reduced', 'normal', 'enhanced'] as const).map(level => (
            <button
              key={level}
              onClick={() => setAnimationLevel(level)}
              className={cn(
                "px-3 py-2 text-xs font-medium rounded-md border transition-all",
                "bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground",
                settings.animationLevel === level && "bg-primary text-primary-foreground"
              )}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Glassmorphism Level - only show if theme supports it */}
      {supportsGlass && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-foreground">Glassmorphism</h3>
          <div className="flex gap-2">
            {(['none', 'subtle', 'moderate', 'intense'] as const).map(level => (
              <button
                key={level}
                onClick={() => setGlassmorphismLevel(level)}
                className={cn(
                  "px-3 py-2 text-xs font-medium rounded-md border transition-all",
                  "bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground",
                  settings.glassmorphismLevel === level && "bg-primary text-primary-foreground"
                )}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Border Radius */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-foreground">Border Radius</h3>
        <div className="flex gap-2">
          {(['none', 'small', 'medium', 'large', 'full'] as const).map(radius => (
            <button
              key={radius}
              onClick={() => {/* setBorderRadius would need to be implemented */}}
              className={cn(
                "px-3 py-2 text-xs font-medium border transition-all",
                "bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground",
                settings.borderRadius === radius && "bg-primary text-primary-foreground",
                // Demonstrate border radius changes
                radius === 'none' && "rounded-none",
                radius === 'small' && "rounded-sm",
                radius === 'medium' && "rounded-md",
                radius === 'large' && "rounded-lg",
                radius === 'full' && "rounded-full"
              )}
            >
              {radius.charAt(0).toUpperCase() + radius.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Feature Toggles */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground">Features</h3>
        
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.reduceMotion}
            onChange={toggleReduceMotion}
            className="sr-only"
          />
          <div className={cn(
            "w-4 h-4 border rounded transition-all",
            "bg-background border-border",
            settings.reduceMotion && "bg-primary border-primary"
          )}>
            {settings.reduceMotion && (
              <svg className="w-3 h-3 text-primary-foreground m-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <span className="text-sm text-foreground">Reduce Motion</span>
        </label>

        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.particleEffects}
            onChange={toggleParticleEffects}
            className="sr-only"
          />
          <div className={cn(
            "w-4 h-4 border rounded transition-all",
            "bg-background border-border",
            settings.particleEffects && "bg-primary border-primary"
          )}>
            {settings.particleEffects && (
              <svg className="w-3 h-3 text-primary-foreground m-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <span className="text-sm text-foreground">Particle Effects</span>
        </label>
      </div>

      {/* Preview Section */}
      <div className="space-y-3 pt-4 border-t border-border">
        <h3 className="text-sm font-medium text-foreground">Preview</h3>
        <div className="space-y-3">
          {/* Card Preview */}
          <div className="p-4 bg-card border border-border rounded-lg shadow-theme-primary">
            <h4 className="font-medium text-card-foreground mb-2">Sample Card</h4>
            <p className="text-sm text-muted-foreground mb-3">
              This card automatically adapts to theme changes using CSS variables.
            </p>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 bg-primary text-primary-foreground text-xs rounded-md hover:bg-primary/90 transition-colors">
                Primary Button
              </button>
              <button className="px-3 py-1.5 bg-secondary text-secondary-foreground text-xs rounded-md hover:bg-secondary/80 transition-colors">
                Secondary Button
              </button>
            </div>
          </div>

          {/* Glassmorphism Preview */}
          {isGlassEnabled && supportsGlass && (
            <div 
              className="p-4 rounded-lg backdrop-blur-[var(--glass-blur)] border"
              style={{
                background: 'var(--glass-bg)',
                borderColor: 'var(--glass-border)',
              }}
            >
              <h4 className="font-medium text-foreground mb-2">Glass Effect</h4>
              <p className="text-sm text-muted-foreground">
                Glassmorphism effect automatically adjusts based on your settings.
              </p>
            </div>
          )}

          {/* Chart Colors Preview */}
          <div className="flex gap-2 h-8">
            <div className="flex-1 rounded" style={{ backgroundColor: 'hsl(var(--chart-1))' }} />
            <div className="flex-1 rounded" style={{ backgroundColor: 'hsl(var(--chart-2))' }} />
            <div className="flex-1 rounded" style={{ backgroundColor: 'hsl(var(--chart-3))' }} />
            <div className="flex-1 rounded" style={{ backgroundColor: 'hsl(var(--chart-4))' }} />
            <div className="flex-1 rounded" style={{ backgroundColor: 'hsl(var(--chart-5))' }} />
          </div>
        </div>
      </div>

      {/* Current Theme Info */}
      <div className="text-xs text-muted-foreground space-y-1 pt-4 border-t border-border">
        <p>Theme: {currentTheme} ({isDark ? 'Dark' : 'Light'})</p>
        <p>Density: {settings.density} | Animation: {settings.animationLevel}</p>
        {supportsGlass && <p>Glass: {settings.glassmorphismLevel}</p>}
      </div>
    </div>
  );
}

export default UnifiedThemeSwitcher;