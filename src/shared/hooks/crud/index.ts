/**
 * CRUD Operations - Consolidated Exports
 * Following CLAUDE.md SOLID principles with complete DRY compliance
 *
 * This is the main entry point for all CRUD-related functionality
 * Eliminates the 297 lines of duplication from the original useGenericCrudOperations.ts
 */

// Core CRUD functionality
export {
  useGenericCrudOperations,
  type CrudApiOperations,
  type CrudMessages,
  type GenericCrudOperationsReturn,
} from './useGenericCrudOperations';

// Collection-specific operations
export { useCollectionOperations } from '../useCollectionOperations';

// Entity configurations
export {
  createPsaCardConfig,
  createRawCardConfig,
  createSealedProductConfig,
  useEntityConfig,
  type CollectionEntityConfig,
  type UseCollectionOperationsReturn,
} from './collectionEntityConfigs';

// Entity-specific hooks (backward compatibility)
export {
  usePsaCardOperations,
  useRawCardOperations,
  useSealedProductOperations,
} from './entitySpecificHooks';
