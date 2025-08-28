/**
 * Pokemon Design System - Centralized Component Exports
 * 
 * This is the SINGLE source of truth for all Pokemon components.
 * All components use shadcn/ui as their foundation with Pokemon theming.
 * Fully integrated with existing theme system.
 * 
 * Import pattern: import { PokemonButton, PokemonInput } from '@/shared/components/atoms/design-system'
 */

// === CORE COMPONENTS (Built on shadcn foundation) ===
export { PokemonButton } from './PokemonButton';
export type { PokemonButtonProps } from './PokemonButton';

export { PokemonInput } from './PokemonInput';
export type { PokemonInputProps } from './PokemonInput';

export { 
  PokemonModal, 
  PokemonConfirmModal, 
  PokemonItemSelectorModal 
} from './PokemonModal';
export type { PokemonModalProps } from './PokemonModal';

export { 
  PokemonForm,
  PokemonCardForm,
  PokemonProductForm,
  PokemonAuctionForm,
  PokemonSaleForm,
  PokemonSearchForm,
  PokemonFilterForm
} from './PokemonForm';
export type { PokemonFormProps, PokemonFormField, PokemonFormSection } from './PokemonForm';

// === ADDITIONAL COMPONENTS ===
export { PokemonBadge } from './PokemonBadge';
export { PokemonCard } from './PokemonCard';
export { PokemonSelect } from './PokemonSelect';
export { PokemonIcon } from './PokemonIcon';
export { DashboardIcon } from './DashboardIcon';
export { SearchInput } from './SearchInput';
export { PokemonPageContainer } from './PokemonPageContainer';

// === DESIGN SYSTEM INFO ===
export const POKEMON_DESIGN_SYSTEM_VERSION = '2.0.0';
export const POKEMON_DESIGN_SYSTEM_INFO = {
  name: 'Pokemon Design System',
  version: POKEMON_DESIGN_SYSTEM_VERSION,
  foundation: 'shadcn/ui',
  description: 'Pokemon-themed components built on shadcn/ui foundation',
  components: [
    'PokemonButton',
    'PokemonInput', 
    'PokemonModal',
    'PokemonForm',
    'PokemonBadge',
    'PokemonCard',
    'PokemonSelect'
  ],
  features: [
    'Consistent Pokemon theming',
    'shadcn/ui accessibility',
    'TypeScript support',
    'Responsive design',
    'Dark mode support'
  ]
};

// === DESIGN SYSTEM CORE ===
// Uses EXISTING theme system from /theme/DesignSystem.ts
export * from './unifiedVariants';

// === SHADCN COMPONENTS ===
// Import shadcn components directly: import { Button } from '@/components/ui/button'
// Note: shadcn components are not re-exported to avoid build issues

/**
 * USAGE EXAMPLES:
 * 
 * // Basic button
 * <PokemonButton variant="primary">Click me</PokemonButton>
 * 
 * // Form with validation
 * <PokemonForm 
 *   onSubmit={handleSubmit}
 *   fields={[
 *     { type: 'input', name: 'name', label: 'Name', required: true }
 *   ]}
 * />
 * 
 * // Confirmation modal
 * <PokemonModal 
 *   open={isOpen} 
 *   onClose={onClose}
 *   confirmVariant="danger"
 *   onConfirm={handleConfirm}
 * />
 */