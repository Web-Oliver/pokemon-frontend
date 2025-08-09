/**
 * Entity-Specific Hook Factories
 * Following CLAUDE.md SOLID principles with complete DRY compliance
 *
 * SOLID Principles Applied:
 * - SRP: Each hook has single responsibility for one entity type
 * - OCP: Open for extension by adding new entity-specific hooks
 * - DIP: Depends on abstractions (useCollectionOperations)
 * - DRY: All use same underlying consolidated operations
 */

import { getCollectionApiService } from '../../services/ServiceRegistry';
import { useCollectionOperations } from '../useCollectionOperations';
import {
  createPsaCardConfig,
  createRawCardConfig,
  createSealedProductConfig,
  useEntityConfig,
} from './collectionEntityConfigs';

// ============================================================================
// ENTITY-SPECIFIC HOOKS - FOLLOWING ENTITY CONFIGURATION PATTERN
// ============================================================================

/**
 * PSA Card operations hook - uses consolidated useCollectionOperations
 * Maintains backward compatibility with existing interface
 */
export const usePsaCardOperations = () => {
  const collectionApi = getCollectionApiService();
  const entityConfig = useEntityConfig(createPsaCardConfig, collectionApi);
  const operations = useCollectionOperations(entityConfig);

  // Return interface-compatible methods for backward compatibility
  return {
    loading: operations.loading,
    error: operations.error,
    addPsaCard: operations.add,
    updatePsaCard: operations.update,
    deletePsaCard: operations.delete,
    markPsaCardSold: operations.markSold,
    clearError: operations.clearError,
  };
};

/**
 * Raw Card operations hook - uses consolidated useCollectionOperations
 * Maintains backward compatibility with existing interface
 */
export const useRawCardOperations = () => {
  const collectionApi = getCollectionApiService();
  const entityConfig = useEntityConfig(createRawCardConfig, collectionApi);
  const operations = useCollectionOperations(entityConfig);

  // Return interface-compatible methods for backward compatibility
  return {
    loading: operations.loading,
    error: operations.error,
    addRawCard: operations.add,
    updateRawCard: operations.update,
    deleteRawCard: operations.delete,
    markRawCardSold: operations.markSold,
    clearError: operations.clearError,
  };
};

/**
 * Sealed Product operations hook - uses consolidated useCollectionOperations
 * Maintains backward compatibility with existing interface
 */
export const useSealedProductOperations = () => {
  const collectionApi = getCollectionApiService();
  const entityConfig = useEntityConfig(
    createSealedProductConfig,
    collectionApi
  );
  const operations = useCollectionOperations(entityConfig);

  // Return interface-compatible methods for backward compatibility
  return {
    loading: operations.loading,
    error: operations.error,
    addSealedProduct: operations.add,
    updateSealedProduct: operations.update,
    deleteSealedProduct: operations.delete,
    markSealedProductSold: operations.markSold,
    clearError: operations.clearError,
  };
};
