/**
 * PremiumFormElements - Centralized export for all premium form components
 * Eliminates 400+ lines of duplicate styling across form elements
 * 
 * Following CLAUDE.md DRY principles:
 * - Single source of truth for premium form styling
 * - Centralized export for easy imports
 * - Consistent component composition patterns
 */

export { default as PremiumWrapper } from './PremiumWrapper';
export { default as PremiumLabel } from './PremiumLabel';
export { default as PremiumErrorMessage } from './PremiumErrorMessage';
export { default as PremiumHelperText } from './PremiumHelperText';
export { default as PremiumShimmer } from './PremiumShimmer';
export { default as PremiumGlow } from './PremiumGlow';

// Re-export types for convenience
export type { default as PremiumWrapperProps } from './PremiumWrapper';
export type { default as PremiumLabelProps } from './PremiumLabel';
export type { default as PremiumErrorMessageProps } from './PremiumErrorMessage';
export type { default as PremiumHelperTextProps } from './PremiumHelperText';
export type { default as PremiumShimmerProps } from './PremiumShimmer';
export type { default as PremiumGlowProps } from './PremiumGlow';