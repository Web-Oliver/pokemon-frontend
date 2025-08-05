/**
 * Cosmic Background Component
 * Layer 3: Components (CLAUDE.md Architecture)
 *
 * SOLID Principles:
 * - SRP: Single responsibility for cosmic background effects
 * - OCP: Open for extension via props and theme configuration
 * - DIP: Uses Layer 1 utilities for effect generation
 * - DRY: Consolidates DbaCosmicBackground and similar patterns
 *
 * Enhanced version of DbaCosmicBackground.tsx with shared utilities
 */

import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import {
  generateCosmicBackground,
  COSMIC_GRADIENTS,
  ParticleConfig,
} from '../../utils/cosmicEffects';

export interface CosmicBackgroundProps {
  /** Gradient pattern to use */
  gradientKey?: keyof typeof COSMIC_GRADIENTS;
  /** Particle system configuration */
  particleConfig?: ParticleConfig;
  /** Additional CSS classes */
  className?: string;
  /** Whether to respect theme particle settings */
  respectThemeSettings?: boolean;
}

const CosmicBackground: React.FC<CosmicBackgroundProps> = ({
  gradientKey = 'holographicBase',
  particleConfig = {},
  className = '',
  respectThemeSettings = true,
}) => {
  const { config } = useTheme();

  // Respect theme settings for particle effects
  if (respectThemeSettings && !config.particleEffectsEnabled) {
    return (
      <div className={`absolute inset-0 overflow-hidden ${className}`}>
        {/* Static gradient background only */}
        <div
          className="absolute inset-0 blur-3xl"
          style={{
            background: COSMIC_GRADIENTS[gradientKey].gradient,
            opacity: 0.6,
          }}
        />
      </div>
    );
  }

  const { particles, containerClassName, baseLayerClassName, baseLayerStyle } =
    generateCosmicBackground(gradientKey, particleConfig);

  return (
    <div className={`${containerClassName} ${className}`}>
      {/* Holographic base layer */}
      <div className={baseLayerClassName} style={baseLayerStyle} />

      {/* Conic gradient overlay for enhanced holographic effect */}
      {gradientKey === 'holographicBase' && (
        <div
          className="absolute inset-0 animate-spin"
          style={{
            background: COSMIC_GRADIENTS.conicHolographic.gradient,
            animationDuration: `${COSMIC_GRADIENTS.conicHolographic.animationDuration}s`,
          }}
        />
      )}

      {/* Floating particles */}
      {particles.map((particle) => (
        <div
          key={particle.key}
          className={particle.className}
          style={particle.style}
        />
      ))}
    </div>
  );
};

export default CosmicBackground;
