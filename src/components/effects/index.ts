/**
 * Effects Components Index
 * Layer 3: Components (CLAUDE.md Architecture)
 *
 * Centralized exports for all effect components
 * Following CLAUDE.md principles:
 * - Single source of truth for effects imports
 * - Consistent API across effect components
 * - Theme-compatible effect system
 */

export { default as ParticleSystem } from './ParticleSystem';
export type { ParticleSystemProps } from './ParticleSystem';

export { default as NeuralNetworkBackground } from './NeuralNetworkBackground';
export type { NeuralNetworkBackgroundProps } from './NeuralNetworkBackground';

export { default as FloatingGeometry } from './FloatingGeometry';
export type {
  FloatingGeometryProps,
  GeometricElement,
} from './FloatingGeometry';

export { default as CosmicBackground } from './CosmicBackground';
export type { CosmicBackgroundProps } from './CosmicBackground';

export { default as HolographicBorder } from './HolographicBorder';
export type { HolographicBorderProps } from './HolographicBorder';
