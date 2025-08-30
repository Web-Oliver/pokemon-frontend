/**
 * SIMPLIFIED HOOKS INDEX - RADICAL CLEANUP
 * Following CLAUDE.md SOLID & DRY principles
 * 
 * BEFORE: 50+ hook exports, multiple search systems, duplications
 * AFTER: Essential hooks only, clean exports
 */

// ========== SEARCH HOOKS ==========
export { 
  useSearch, 
  useSetSearch, 
  useCardSearch, 
  useProductSearch, 
  useSetProductSearch,
  useHierarchicalSearch 
} from './useSearch';

// ========== BIDIRECTIONAL SEARCH HOOKS ==========
export { 
  useCardsInSet, 
  useCardWithContext, 
  useProductsInSetProduct, 
  useProductWithContext, 
  useSmartHierarchicalSearch,
  useBreadcrumbNavigation 
} from './useBidirectionalSearch';

// ========== CORE HOOKS ==========
export { useDebounce, useDebouncedValue } from './useDebounce';
// export { useModal } from './useModal'; // Removed - file no longer exists
export { useToggle } from './common/useToggle';
export { useDataFetch } from './common/useDataFetch';
export { useLoadingState } from './common/useLoadingState';
export { useAsyncOperation, useAsyncApiOperation, useAsyncFormOperation, useAsyncBackgroundOperation } from './common/useAsyncOperation';

// ========== ERROR HANDLING HOOKS ==========
export { useErrorHandler, useFormErrorHandler, useApiErrorHandler } from './error/useErrorHandler';

// ========== LOADING ORCHESTRATION HOOKS ==========
export { useLoadingOrchestrator, useFormLoadingOrchestrator, useApiLoadingOrchestrator } from './loading/useLoadingOrchestrator';

// ========== FORM HOOKS ==========
export { useGenericFormState, useFormState, useAuctionFormAdapter } from './form/useFormState';
export { useFormValidation } from './form/useFormValidation';

// ========== CRUD HOOKS ==========
export { useGenericCrudOperations } from './crud/useGenericCrudOperations';

// ========== THEME HOOKS ==========
export { useTheme } from '@/theme';

// ========== COLLECTION HOOKS (REFACTORED) ==========
// Focused entity hooks (SRP compliance)
export { 
  usePsaCardOperations,
  useRawCardOperations, 
  useSealedProductOperations,
  useCollectionOverview as useCollectionOperations // Drop-in replacement
} from './collection';

// Existing focused hooks
export { useCollectionItem } from './collection/useCollectionItem';
export { useItemOperations } from './collection/useItemOperations';
export { usePriceManagement } from './collection/usePriceManagement';