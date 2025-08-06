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

// Core effect components
export { default as ParticleSystem } from './ParticleSystem';
export type { ParticleSystemProps } from './ParticleSystem';

export { default as NeuralNetworkBackground } from './NeuralNetworkBackground';
export type { NeuralNetworkBackgroundProps } from './NeuralNetworkBackground';

export { default as CosmicBackground } from './CosmicBackground';
export type { CosmicBackgroundProps } from './CosmicBackground';

export { default as Context7Background } from './Context7Background';
export type { Context7BackgroundProps } from './Context7Background';

// Unified system (recommended for new usage)
export { UnifiedEffectSystem } from './UnifiedEffectSystem';
export type { UnifiedEffectSystemProps } from './UnifiedEffectSystem';
