/**
 * Formatting Utilities - Layer 2 Domain
 * Following CLAUDE.md SOLID principles
 * 
 * SRP: Single export point for all formatting utilities
 * DRY: Consolidates card, price, and display formatting
 * Depends on Layer 1 core utilities and time utilities
 */

// Re-export all formatting utilities
export * from './prices';
export * from './cards';

// Re-export time formatting from time layer
export * from '../time/formatting';

// Re-export number formatting from math layer  
export * from '../math/numbers';