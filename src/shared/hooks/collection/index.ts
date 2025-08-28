/**
 * Collection Hooks Index
 * Exports focused, SRP-compliant collection hooks
 * 
 * Migration Guide:
 * - useCollectionOperations -> useCollectionOverview (drop-in replacement)
 * - For focused usage -> use specific entity hooks (usePsaCardOperations, etc.)
 */

// Focused entity hooks (SRP compliance)
export { usePsaCardOperations } from './usePsaCardOperations';
export { useRawCardOperations } from './useRawCardOperations';
export { useSealedProductOperations } from './useSealedProductOperations';

// Composite hook (drop-in replacement for useCollectionOperations)
export { useCollectionOverview } from './useCollectionOverview';

// Existing hooks (already focused)
export { usePriceManagement } from './usePriceManagement';
export { useCollectionItem } from './useCollectionItem';
export { useItemOperations } from './useItemOperations';
export { useImageDownload } from './useImageDownload';

// Type exports
export type { UsePsaCardOperationsReturn } from './usePsaCardOperations';
export type { UseRawCardOperationsReturn } from './useRawCardOperations';
export type { UseSealedProductOperationsReturn } from './useSealedProductOperations';
export type { UseCollectionOverviewReturn } from './useCollectionOverview';