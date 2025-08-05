/**
 * Pokemon Collection Design System - The Complete Component Library
 * Consolidates ALL UI patterns into solid, DRY, reusable components
 * 
 * Following CLAUDE.md layered architecture:
 * - Layer 3: Components (UI Building Blocks)
 * - Single source of truth for ALL UI components
 * - Eliminates 1000+ lines of duplicate styling across the codebase
 * - Promotes consistency and maintainability
 */

// Foundation Components - The Big 5 that replace everything
export { PokemonCard } from './PokemonCard';
export type { PokemonCardProps } from './PokemonCard';

export { PokemonButton } from './PokemonButton';
export type { PokemonButtonProps } from './PokemonButton';

export { PokemonInput } from './PokemonInput';
export type { PokemonInputProps } from './PokemonInput';

export { PokemonSelect } from './PokemonSelect';
export type { PokemonSelectProps, SelectOption } from './PokemonSelect';

export { PokemonModal, PokemonConfirmModal } from './PokemonModal';
export type { PokemonModalProps, PokemonConfirmModalProps } from './PokemonModal';

// Specialized Components
export { PokemonBadge } from './PokemonBadge';
export type { PokemonBadgeProps } from './PokemonBadge';

export { PokemonIcon } from './PokemonIcon';
export type { PokemonIconProps } from './PokemonIcon';

export { PokemonPageContainer } from './PokemonPageContainer';
export type { PokemonPageContainerProps } from './PokemonPageContainer';

// Component aliases for backward compatibility (removed to fix circular dependency)
// These aliases were causing module loading issues
// Import components directly by their full names instead