/**
 * Shared Particle System Component
 * Layer 3: Components (CLAUDE.md Architecture)
 *
 * Extracted from CreateAuction.tsx Context7 2025 futuristic system
 * Following CLAUDE.md principles:
 * - SRP: Single responsibility for particle effects
 * - OCP: Open for extension via configurable props
 * - DIP: Abstracts particle implementation details
 * - DRY: Reusable particle system across components
 *
 * Theme-compatible: Respects particle effects enabled setting
 */

import React from 'react';
import { themeUtils, useCentralizedTheme } from '../../../utils/ui/themeConfig';

export interface ParticleSystemProps {
  /** Number of particles to render */
  particleCount?: number;
  /** Array of colors for particles */
  colors?: string[];
  /** Size range for particles [min, max] in pixels */
  sizeRange?: [number, number];
  /** Animation duration range [min, max] in seconds */
  durationRange?: [number, number];
  /** Base opacity for particles */
  opacity?: number;
  /** Animation type */
  animationType?: 'pulse' | 'bounce' | 'fade';
  /** Additional CSS classes */
  className?: string;
}

const ParticleSystem: React.FC<ParticleSystemProps> = ({
  particleCount = 12,
  colors = ['#06b6d4', '#a855f7', '#ec4899', '#10b981'],
  sizeRange = [2, 8],
  durationRange = [3, 7],
  opacity = 0.2,
  animationType = 'pulse',
  className = '',
}) => {
  const themeConfig = useCentralizedTheme();

  // Respect theme settings for particle effects
  if (!themeUtils.shouldShowParticles(themeConfig)) {
    return null;
  }

  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      {[...Array(particleCount)].map((_, i) => {
        const size =
          Math.random() * (sizeRange[1] - sizeRange[0]) + sizeRange[0];
        const duration =
          Math.random() * (durationRange[1] - durationRange[0]) +
          durationRange[0];
        const color = colors[Math.floor(Math.random() * colors.length)];

        return (
          <div
            key={i}
            className={`absolute rounded-full animate-${animationType}`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${size}px`,
              height: `${size}px`,
              background: `radial-gradient(circle, ${color}, transparent)`,
              opacity,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${duration}s`,
            }}
          />
        );
      })}
    </div>
  );
};

export default ParticleSystem;
