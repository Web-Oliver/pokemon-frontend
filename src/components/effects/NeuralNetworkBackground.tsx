/**
 * Neural Network Background Component
 * Layer 3: Components (CLAUDE.md Architecture)
 *
 * Extracted from CreateAuction.tsx Context7 2025 futuristic system
 * Following CLAUDE.md principles:
 * - SRP: Single responsibility for neural network visual effects
 * - OCP: Open for extension via configurable props
 * - DIP: Abstracts neural network implementation details
 * - DRY: Reusable neural network patterns across components
 *
 * Theme-compatible: Uses theme tokens for colors and opacity
 */

import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export interface NeuralNetworkBackgroundProps {
  /** Primary neural network color */
  primaryColor?: string;
  /** Secondary quantum particles color */
  secondaryColor?: string;
  /** Grid overlay color */
  gridColor?: string;
  /** Overall opacity */
  opacity?: number;
  /** Enable quantum particles animation */
  enableQuantumParticles?: boolean;
  /** Enable holographic grid overlay */
  enableGrid?: boolean;
  /** Animation speed multiplier */
  animationSpeed?: number;
  /** Additional CSS classes */
  className?: string;
}

const NeuralNetworkBackground: React.FC<NeuralNetworkBackgroundProps> = ({
  primaryColor = '#06b6d4',
  secondaryColor = '#a855f7',
  gridColor = '#06b6d4',
  opacity = 0.2,
  enableQuantumParticles = true,
  enableGrid = true,
  animationSpeed = 1,
  className = '',
}) => {
  const { config } = useTheme();

  // Respect theme settings
  const shouldShowParticles =
    config.particleEffectsEnabled && enableQuantumParticles;
  const adjustedOpacity = opacity * (config.glassmorphismIntensity / 100);

  // Create SVG background patterns
  const neuralNetworkPattern = `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cfilter id='glow'%3E%3CfeGaussianBlur stdDeviation='3' result='coloredBlur'/%3E%3CfeMerge%3E%3CfeMergeNode in='coloredBlur'/%3E%3CfeMergeNode in='SourceGraphic'/%3E%3C/feMerge%3E%3C/filter%3E%3C/defs%3E%3Cg fill='none' stroke='${encodeURIComponent(primaryColor)}' stroke-width='0.5' filter='url(%23glow)'%3E%3Ccircle cx='60' cy='60' r='2'/%3E%3Cline x1='60' y1='30' x2='60' y2='90'/%3E%3Cline x1='30' y1='60' x2='90' y2='60'/%3E%3Cline x1='40' y1='40' x2='80' y2='80'/%3E%3Cline x1='80' y1='40' x2='40' y2='80'/%3E%3C/g%3E%3C/svg%3E")`;

  const quantumParticlesPattern = `url("data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='${encodeURIComponent(secondaryColor)}' fill-opacity='0.05'%3E%3Ccircle cx='100' cy='50' r='1.5'/%3E%3Ccircle cx='50' cy='100' r='1'/%3E%3Ccircle cx='150' cy='100' r='1.5'/%3E%3Ccircle cx='100' cy='150' r='1'/%3E%3C/g%3E%3C/svg%3E")`;

  const gridPattern = `linear-gradient(90deg, transparent 98%, rgba(${hexToRgb(gridColor)}, 0.1) 100%), linear-gradient(transparent 98%, rgba(${hexToRgb(secondaryColor)}, 0.1) 100%)`;

  return (
    <div
      className={`absolute inset-0 ${className}`}
      style={{ opacity: adjustedOpacity }}
    >
      {/* Primary Neural Network Pattern */}
      <div
        className="absolute inset-0 animate-pulse"
        style={{
          backgroundImage: neuralNetworkPattern,
          animationDuration: `${6 / animationSpeed}s`,
        }}
      />

      {/* Secondary Quantum Particles */}
      {shouldShowParticles && (
        <div
          className="absolute inset-0 animate-bounce"
          style={{
            animationDuration: `${6 / animationSpeed}s`,
            backgroundImage: quantumParticlesPattern,
          }}
        />
      )}

      {/* Holographic Grid Overlay */}
      {enableGrid && (
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: gridPattern,
            backgroundSize: '40px 40px',
          }}
        />
      )}
    </div>
  );
};

// Utility function to convert hex to RGB values
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
  }
  return '6, 182, 212'; // Default cyan color
}

export default NeuralNetworkBackground;
