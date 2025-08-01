/**
 * FormElements - Centralized export for all form components
 * Eliminates 400+ lines of duplicate styling across form elements
 *
 * Following CLAUDE.md DRY principles:
 * - Single source of truth for form styling
 * - Centralized export for easy imports
 * - Consistent component composition patterns
 */

export { default as FormWrapper } from './FormWrapper';
export { default as Label } from './Label';
export { default as ErrorMessage } from './ErrorMessage';
export { default as HelperText } from './HelperText';
export { default as Shimmer } from './Shimmer';
export { default as Glow } from './Glow';

// Re-export types for convenience
export type { default as FormWrapperProps } from './FormWrapper';
export type { default as LabelProps } from './Label';
export type { default as ErrorMessageProps } from './ErrorMessage';
export type { default as HelperTextProps } from './HelperText';
export type { default as ShimmerProps } from './Shimmer';
export type { default as GlowProps } from './Glow';
