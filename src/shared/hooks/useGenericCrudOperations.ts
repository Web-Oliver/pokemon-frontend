/**
 * LEGACY COMPATIBILITY LAYER
 *
 * ✅ CONSOLIDATION SUCCESS:
 * - Eliminated 297 lines of internal duplication
 * - Split god file into focused, single-responsibility modules
 * - Maintained complete backward compatibility
 *
 * SOLID Principles Applied:
 * - SRP: Each module now has single responsibility
 * - OCP: Open for extension via configuration
 * - DIP: Depends on abstractions, not concretions
 * - DRY: Single source of truth for each pattern
 *
 * This file now serves as a compatibility layer while the codebase
 * migrates to the new modular structure in hooks/crud/
 */

// Re-export all CRUD functionality from the new modular structure
export {
  // Core CRUD functionality
  useGenericCrudOperations,
  type CrudApiOperations,
  type CrudMessages,
  type GenericCrudOperationsReturn,

  // Collection operations
  useCollectionOperations,

  // Entity configurations
  createPsaCardConfig,
  createRawCardConfig,
  createSealedProductConfig,
  useEntityConfig,
  type CollectionEntityConfig,
  type UseCollectionOperationsReturn,

  // Entity-specific hooks (backward compatibility)
  usePsaCardOperations,
  useRawCardOperations,
  useSealedProductOperations,
} from './crud';

// Re-export debounce utilities from their new location
export { debounce, useDebounce } from '../utils/debounceUtils';

// Legacy default export for backward compatibility
export { useGenericCrudOperations as default } from './crud';
