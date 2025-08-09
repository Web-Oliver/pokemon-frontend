/**
 * Custom Hooks - Consolidated Entry Point
 *
 * Re-exports all consolidated hooks following refactoring plan
 * Provides clean entry point for hook imports after consolidation
 */

// =============================================================================
// CONSOLIDATED HOOKS (Post-Refactoring)
// =============================================================================

// CRUD Operations (consolidated from individual entity operations)
export {
  useGenericCrudOperations,
  useCollectionOperations,
  usePsaCardOperations,
  useRawCardOperations,
  useSealedProductOperations,
  createPsaCardConfig,
  createRawCardConfig,
  createSealedProductConfig,
  useEntityConfig,
} from './crud';

export type {
  CrudApiOperations,
  CrudMessages,
  GenericCrudOperationsReturn,
  CollectionEntityConfig,
  UseCollectionOperationsReturn,
} from './crud';

export type {
  UseDataFetchOptions,
  UseDataFetchReturn,
  UsePaginatedDataFetchReturn,
} from './common/useDataFetch';

export type {
  UseToggleReturn,
} from './common/useToggle';

export type {
  UseSelectionReturn,
  UseMultiSelectionReturn,
} from './common/useSelection';

export type {
  UseFormValidationOptions,
  UseFormValidationReturn,
} from './form/useFormValidation';

// Search functionality (consolidated from multiple search hooks)
export { useUnifiedSearch } from './useUnifiedSearch';

// Generic state management (replaces repetitive useState patterns)
export { useDataFetch, useArrayDataFetch, usePaginatedDataFetch } from './common/useDataFetch';
export { useToggle, useMultipleToggle, useConditionalToggle } from './common/useToggle';
export { useSelection, useMultiSelection } from './common/useSelection';
export { 
  useLoadingState, 
  useDataLoadingState, 
  useFormLoadingState,
  type UseLoadingStateOptions,
  type UseLoadingStateReturn,
} from './common/useLoadingState';

// Form state management (consolidated form handling)
export {
  useGenericFormState,
  useGenericFormStateAdapter,
} from './form/useGenericFormState';

export { useCardSelection, useCardSelectionState } from './form/useCardSelection';
export { useFormValidation } from './form/useFormValidation';

// Theme system (consolidated theme management)
export { useTheme } from './theme/useTheme';

// =============================================================================
// EXISTING HOOKS (Maintained)
// =============================================================================

// Modal management hooks
export { useModal, useConfirmModal, useMultiModal } from './useModal';

export type {
  UseModalReturn,
  UseConfirmModalReturn,
  UseMultiModalReturn,
} from './useModal';

// Item action hooks
export {
  useItemActions,
  usePsaItemActions,
  useRawItemActions,
  useSealedItemActions,
} from './useItemActions';

export type {
  UseItemActionsOptions,
  UseItemActionsReturn,
} from './useItemActions';

// Item display data hooks
export {
  useItemDisplayData,
  useAuctionItemDisplayData,
  useCollectionItemDisplayData,
  useMultipleItemDisplayData,
} from './useItemDisplayData';

export type {
  UseItemDisplayDataReturn,
  UseItemDisplayDataOptions,
} from './useItemDisplayData';

// =============================================================================
// UTILITY & SPECIALIZED HOOKS
// =============================================================================

// Collection-specific operations
export { useCollectionItem } from './collection/useCollectionItem';
export { useImageDownload } from './collection/useImageDownload';
export { usePriceManagement } from './collection/usePriceManagement';

// Page and layout hooks
export { usePageLayout } from './usePageLayout';
export { usePageNavigation } from './usePageNavigation';

// Common utilities
export { useDebounce } from './useDebounce';
export { useAsyncOperation } from './useAsyncOperation';

// Form utilities
export { useBaseForm } from './useBaseForm';
export { useFormSubmission } from './useFormSubmission';
export { useFormValidation } from './useFormValidation';

// =============================================================================
// DEPRECATED HOOKS (Remove in next major version)
// =============================================================================
// Note: Individual search hooks have been consolidated into useUnifiedSearch
// Note: Individual CRUD hooks are now thin wrappers around useGenericCrudOperations
