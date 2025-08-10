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

// ========== CORE HOOKS ==========
export { useDebouncedValue } from './useDebounce';
export { useModal } from './useModal';
export { useToggle } from './common/useToggle';
export { useDataFetch } from './common/useDataFetch';
export { useLoadingState } from './common/useLoadingState';

// ========== FORM HOOKS ==========
export { useGenericFormState } from './form/useGenericFormState';
export { useFormValidation } from './form/useFormValidation';

// ========== CRUD HOOKS ==========
export { useGenericCrudOperations } from './crud/useGenericCrudOperations';

// ========== THEME HOOKS ==========
export { useTheme } from './theme/useTheme';

// ========== COLLECTION HOOKS ==========
export { useCollectionItem } from './collection/useCollectionItem';
export { useItemOperations } from './collection/useItemOperations';
export { usePriceManagement } from './collection/usePriceManagement';