/**
 * ThemePicker Component - Visual Theme Selection Interface
 * Phase 3.1.1: Core theme picker functionality
 *
 * Following CLAUDE.md principles:
 * - Single Responsibility: Handles visual theme selection only
 * - DRY: Reuses existing PokemonCard and PokemonButton components
 * - Integration: Uses existing ThemeContext hooks and theme presets
 * - Reusability: Self-contained theme picker interface
 *
 * Features:
 * - Visual preview cards for each theme preset
 * - Interactive theme switching with live preview
 * - Responsive grid layout
 * - Theme-aware styling and animations
 */

import React from 'react';
import { themePresets, VisualTheme } from '../../contexts/ThemeContext';
import { useTheme } from '../../hooks/use-theme';
import { PokemonCard } from '../design-system/PokemonCard';
import { PokemonButton } from '../design-system/PokemonButton';
import { cn } from '../../../utils';

export interface ThemePickerProps {
  className?: string;
  showTitle?: boolean;
  onThemeChange?: (theme: VisualTheme) => void;
}

/**
 * Visual theme selection interface with preview cards
 * Allows users to see and select from available theme presets
 */
export const ThemePicker: React.FC<ThemePickerProps> = ({
  className = '',
  showTitle = true,
  onThemeChange,
}) => {
  // Theme context integration via centralized useTheme hook
  const { config, setVisualTheme, applyPreset } = useTheme();
  const { , density } = config;
  // Use theme presets from context (imported above)
  const presets = themePresets;

  const handleThemeSelect = (themeId: VisualTheme) => {
    // Apply the full preset configuration
    applyPreset(themeId);

    // Also set just the visual theme for immediate effect
    setVisualTheme(themeId);

    // Notify parent component if callback provided
    onThemeChange?.(themeId);
  };

  const renderThemePreview = (preset: (typeof themePresets)[0]) => {
    const isSelected = 

    return (
      <PokemonCard
        key={preset.id}
        variant={isSelected ? 'cosmic' : 'glass'}
        size="md"
        interactive={true}
        className={cn(
          'transition-all duration-500 cursor-pointer',
          'hover:shadow-2xl hover:scale-105',
          isSelected && [
            'ring-2 ring-cyan-400/60',
            'shadow-[0_0_30px_rgba(6,182,212,0.4)]',
            'scale-105',
          ]
        )}
        onClick={() => handleThemeSelect(preset.id)}
      >
        {/* Theme Preview Header */}
        <div className="mb-4">
          <h3
            className={cn(
              'text-lg font-bold mb-1 transition-colors duration-300',
              isSelected ? 'text-cyan-300' : 'text-white'
            )}
          >
            {preset.name}
          </h3>
          <p className="text-zinc-400 text-sm line-clamp-2">
            {preset.description}
          </p>
        </div>

        {/* Visual Preview Area */}
        <div className="mb-4 relative">
          {/* Preview Background */}
          <div
            className={cn(
              'h-24 rounded-xl relative overflow-hidden',
              preset.preview.backgroundColor === 'backdrop-blur-xl' &&
                'backdrop-blur-xl',
              preset.preview.backgroundColor === 'neural-network' &&
                'bg-gradient-to-br from-blue-900/20 to-cyan-900/20',
              preset.preview.backgroundColor === 'cosmic-gradient' &&
                'bg-gradient-to-br from-purple-900/20 to-pink-900/20',
              preset.preview.backgroundColor === 'clean-white' &&
                'bg-gradient-to-br from-gray-50 to-white',
              `bg-gradient-to-br ${preset.preview.gradient}`
            )}
          >
            {/* Animated overlay for visual interest */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

            {/* Sample UI elements */}
            <div className="absolute inset-4 flex items-center justify-between">
              {/* Sample button */}
              <div
                className={cn(
                  'px-3 py-1 rounded-lg text-xs font-medium',
                  preset.id === 'minimal'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-white/20 text-white backdrop-blur-sm'
                )}
              >
                Sample
              </div>

              {/* Sample text */}
              <div
                className={cn('text-xs font-medium', preset.preview.textColor)}
              >
                Preview
              </div>
            </div>

            {/* Theme-specific effects */}
            {preset.id === 'context7-futuristic' && (
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-cyan-500/20 to-blue-500/10 animate-pulse" />
            )}
            {preset.id === 'dba-cosmic' && (
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/20 to-purple-500/10 animate-pulse" />
            )}
          </div>
        </div>

        {/* Theme Features */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400">Glassmorphism:</span>
            <span className="text-zinc-300">
              {preset.config.glassmorphismIntensity}%
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400">Animation:</span>
            <span className="text-zinc-300 capitalize">
              {preset.config.animationIntensity}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400">Effects:</span>
            <span className="text-zinc-300">
              {preset.config.particleEffectsEnabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>

        {/* Selection Button */}
        <PokemonButton
          variant={isSelected ? 'cosmic' : 'outline'}
          size="sm"
          fullWidth
          className="transition-all duration-300"
          onClick={(e) => {
            e.stopPropagation();
            handleThemeSelect(preset.id);
          }}
        >
          {isSelected ? 'Current Theme' : 'Select Theme'}
        </PokemonButton>
      </PokemonCard>
    );
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Title Section */}
      {showTitle && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            Theme Selection
          </h2>
          <p className="text-zinc-400">
            Choose your visual theme. Each theme includes unique styling,
            effects, and animations.
          </p>
        </div>
      )}

      {/* Current Theme Info */}
      <PokemonCard variant="outline" size="sm" className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm text-zinc-400">Current Theme:</span>
            <h3 className="text-lg font-semibold text-white">
              {presets.find((p) => p.id === }
            </h3>
          </div>
          <div className="text-right">
            <span className="text-sm text-zinc-400">Density:</span>
            <p className="text-cyan-300 font-medium capitalize">{density}</p>
          </div>
        </div>
      </PokemonCard>

      {/* Theme Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
        {presets.map(renderThemePreview)}
      </div>

      {/* Additional Settings Hint */}
      <PokemonCard variant="ghost" size="sm" className="mt-6">
        <div className="text-center">
          <p className="text-zinc-400 text-sm">
            Looking for more customization options? Additional theme settings
            like density, animation intensity, and accessibility features are
            available in the full theme settings.
          </p>
        </div>
      </PokemonCard>
    </div>
  );
};

export default ThemePicker;
