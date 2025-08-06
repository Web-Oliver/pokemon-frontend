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
export { default as FormErrorMessage } from './FormErrorMessage';
export { default as HelperText } from './HelperText';
export { default as Shimmer } from './Shimmer';
export { default as Glow } from './Glow';

// Type re-exports removed - not used by any components
