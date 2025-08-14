/**
 * UNIFIED UI EXPORTS - Phase 1.4
 * Central export hub for all unified components
 * 
 * ORGANIZATION:
 * - Primitives: Base components (Button, Card, Input, Badge, Modal)
 * - Atomic: Basic styled building blocks
 * - Composite: Complex multi-component patterns
 * 
 * BACKWARDS COMPATIBILITY:
 * All components exported with both new and legacy names
 */

// =================================
// PRIMITIVES - Core UI Components
// =================================

// Button exports
export {
  Button,
  UnifiedButton,
  buttonVariants,
  unifiedButtonVariants
} from "./primitives/Button";
export type { ButtonProps, UnifiedButtonProps } from "./primitives/Button";

// Card exports  
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription, 
  CardContent,
  CardFooter,
  UnifiedCard,
  UnifiedCardHeader,
  UnifiedCardTitle,
  UnifiedCardDescription,
  UnifiedCardContent,
  UnifiedCardFooter,
  cardVariants,
  unifiedCardVariants
} from "./primitives/Card";
export type { CardProps, UnifiedCardProps } from "./primitives/Card";

// Input exports
export {
  Input,
  UnifiedInput,
  inputVariants,
  unifiedInputVariants
} from "./primitives/Input";
export type { InputProps, UnifiedInputProps } from "./primitives/Input";

// Badge exports
export {
  Badge,
  StatusBadge,
  GradeBadge,
  PokemonBadge,
  UnifiedBadge,
  badgeVariants,
  unifiedBadgeVariants
} from "./primitives/Badge";
export type { BadgeProps, UnifiedBadgeProps } from "./primitives/Badge";

// Modal exports
export {
  Modal,
  ConfirmModal,
  AlertModal,
  PromptModal,
  ModalTrigger,
  UnifiedModal,
  modalVariants,
  unifiedModalVariants
} from "./primitives/Modal";
export type { ModalProps, UnifiedModalProps } from "./primitives/Modal";

// =================================
// COMPONENT COLLECTIONS
// =================================

// All primitives in one object for easier imports
export const Primitives = {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Input,
  Badge,
  Modal,
  ConfirmModal,
  AlertModal,
  PromptModal
};

// All variants in one object
export const ComponentVariants = {
  button: unifiedButtonVariants,
  card: unifiedCardVariants,
  input: unifiedInputVariants,
  badge: unifiedBadgeVariants,
  modal: unifiedModalVariants
};

// =================================
// THEME CONSTANTS
// =================================

// Export theme-related constants for component consumption
export const THEME_VARIANTS = {
  // Variants that support all themes
  UNIVERSAL: ['default', 'glass', 'pokemon', 'cosmic'],
  
  // Pokemon-specific variants
  POKEMON: ['pokemon', 'pokemonOutline', 'pokemonGradient'],
  
  // Glass variants
  GLASS: ['glass', 'glassSubtle', 'glassHeavy', 'glassShimmer'],
  
  // Context7 premium variants
  PREMIUM: ['cosmic', 'quantum', 'neural'],
  
  // Status variants
  STATUS: ['success', 'warning', 'error', 'info'],
  
  // State variants
  STATES: ['default', 'success', 'warning', 'error']
} as const;

export const COMPONENT_SIZES = {
  // Standard sizes
  STANDARD: ['sm', 'default', 'lg', 'xl'],
  
  // Extended sizes (includes xs and 2xl)
  EXTENDED: ['xs', 'sm', 'default', 'lg', 'xl', '2xl'],
  
  // Modal-specific sizes
  MODAL: ['sm', 'default', 'lg', 'xl', '2xl', 'full', 'fullscreen'],
  
  // Icon sizes
  ICON: ['iconSm', 'icon', 'iconLg']
} as const;

export const DENSITY_LEVELS = ['compact', 'comfortable', 'spacious'] as const;

export const MOTION_LEVELS = ['none', 'reduced', 'normal', 'enhanced'] as const;

// =================================
// MIGRATION HELPERS
// =================================

/**
 * Mapping of old component names to new unified components
 * Helps with gradual migration in Phase 2.2
 */
export const MIGRATION_MAP = {
  // Legacy Pokemon components -> Unified components
  'PokemonButton': 'Button',
  'PokemonCard': 'Card', 
  'PokemonInput': 'Input',
  'PokemonBadge': 'Badge',
  'PokemonModal': 'Modal',
  
  // Legacy shadcn components -> Unified components
  'ShadcnButton': 'Button',
  'ShadcnCard': 'Card',
  'ShadcnInput': 'Input',
  'ShadcnBadge': 'Badge',
  'ShadcnDialog': 'Modal',
  
  // Legacy UI components -> Unified components
  'UIButton': 'Button',
  'UICard': 'Card',
  'UIInput': 'Input', 
  'UIBadge': 'Badge',
  'UIModal': 'Modal'
} as const;

/**
 * Default configurations for different use cases
 */
export const COMPONENT_DEFAULTS = {
  // Pokemon Collection specific defaults
  pokemon: {
    button: { variant: 'pokemon' as const, motion: 'enhanced' as const },
    card: { variant: 'pokemon' as const, interactive: true },
    input: { variant: 'pokemon' as const },
    badge: { variant: 'pokemon' as const },
    modal: { variant: 'pokemon' as const }
  },
  
  // Glass theme defaults
  glass: {
    button: { variant: 'glass' as const },
    card: { variant: 'glass' as const },
    input: { variant: 'glass' as const },
    badge: { variant: 'glass' as const },
    modal: { variant: 'glass' as const }
  },
  
  // Cosmic theme defaults  
  cosmic: {
    button: { variant: 'cosmic' as const, motion: 'enhanced' as const },
    card: { variant: 'cosmic' as const, interactive: true },
    input: { variant: 'default' as const },
    badge: { variant: 'cosmic' as const },
    modal: { variant: 'cosmic' as const }
  },
  
  // Compact density defaults
  compact: {
    density: 'compact' as const,
    size: 'sm' as const
  },
  
  // Spacious density defaults
  spacious: {
    density: 'spacious' as const,
    size: 'lg' as const  
  }
} as const;

// =================================
// VERSION INFO
// =================================

export const UNIFIED_UI_VERSION = "1.4.0";
export const PHASE = "1.4";
export const COMPATIBILITY_LEVEL = "FULL"; // FULL backwards compatibility maintained

/**
 * Feature flags for gradual rollout
 */
export const FEATURE_FLAGS = {
  // Enable new unified components (Phase 1.4)
  UNIFIED_COMPONENTS: true,
  
  // Enable backwards compatibility (Phase 1.4)
  LEGACY_SUPPORT: true,
  
  // Enable migration helpers (Phase 2.2)
  MIGRATION_HELPERS: true,
  
  // Enable advanced theming (Phase 2.x)
  ADVANCED_THEMING: false
} as const;