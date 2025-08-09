# Type Duplication Audit Report

## Executive Summary
Completed audit of all `features/*/types` directories and identified type duplications across the codebase. Found several instances where feature-specific types duplicate or overlap with shared types in `shared/domain/models` and root-level `types/` directories.

## Audit Findings

### 1. Features Types Directories Status
- ✅ `features/analytics/types/` - Empty (no types)
- ✅ `features/auction/types/` - Empty (no types)  
- ✅ `features/collection/types/` - Empty (no types)
- ✅ `features/dashboard/types/` - Empty (no types)

### 2. Feature Service Files Analysis

#### AuctionDataService.ts
**Location**: `src/features/auction/services/AuctionDataService.ts`

**Type Definitions Found**:
```typescript
export interface UnifiedCollectionItem {
  id: string;
  itemType: 'PsaGradedCard' | 'RawCard' | 'SealedProduct';
  displayName: string;
  displayPrice: number;
  displayImage?: string;
  images?: string[];
  setName?: string;
  grade?: string;
  condition?: string;
  category?: string;
  originalItem: IPsaGradedCard | IRawCard | ISealedProduct;
}
```

**DUPLICATION IDENTIFIED**: This interface overlaps with:
- `CollectionTypes.ts` → `CollectionItem` discriminated union
- Type mapping logic could be moved to shared utilities

#### CollectionItemService.ts  
**Location**: `src/features/collection/services/CollectionItemService.ts`

**Type Definitions Found**:
```typescript
export type CollectionItem = IPsaGradedCard | IRawCard | ISealedProduct;
export type ItemType = 'psa-graded' | 'raw-card' | 'sealed-product';

export interface ItemEditData {
  item: CollectionItem;
  itemType: ItemType;
}
```

**DUPLICATION IDENTIFIED**: These types overlap with:
- `CollectionTypes.ts` → `CollectionItem` discriminated union (different naming convention)
- `CollectionTypes.ts` → `ItemType` ('psa' vs 'psa-graded' inconsistency)

### 3. Shared Types Analysis

#### Existing Shared Types Structure
- ✅ `src/shared/domain/models/` - Contains core business entities (Card, Auction, Product, etc.)
- ✅ `src/shared/types/` - Contains utility types (themeTypes.ts, searchTypes.ts)
- ✅ `src/types/` - Contains API and collection types (ApiResponse.ts, CollectionTypes.ts, etc.)

#### Root Level Types (as mentioned in refactoring plan)
- ✅ `src/types/api/ApiResponse.ts` - Comprehensive API response types
- ✅ `src/types/collection/CollectionTypes.ts` - Collection-specific discriminated unions  
- ✅ `src/types/form/FormTypes.ts` - (Need to audit)
- ✅ `src/components/routing/types/RouterTypes.ts` - (Need to audit)

## Duplication Summary

### Critical Duplications
1. **Collection Item Types**: 
   - `CollectionTypes.ts` has complete discriminated unions
   - `CollectionItemService.ts` has simpler union type with different naming
   - `AuctionDataService.ts` has display-specific interface that duplicates concepts

2. **Item Type Enums**:
   - Inconsistent naming: 'psa' vs 'psa-graded'
   - Multiple definitions across files

### Recommendations

#### Immediate Actions Required
1. **Consolidate Collection Types**: 
   - Use `CollectionTypes.ts` as single source of truth
   - Remove duplicate types from feature services
   - Standardize naming conventions

2. **Create Display/Transform Types**:
   - Move `UnifiedCollectionItem` to shared utilities
   - Create proper transformation utilities
   - Keep feature services thin

3. **Standardize Item Type Names**:
   - Choose consistent naming: 'psa' | 'raw' | 'sealed' 
   - Update all references across codebase

#### Files to Refactor
- ✅ `src/features/auction/services/AuctionDataService.ts` - Remove `UnifiedCollectionItem`, use shared types
- ✅ `src/features/collection/services/CollectionItemService.ts` - Remove duplicate types, import from shared
- 🔄 Ensure all features import from `src/types/collection/CollectionTypes.ts`

## Conclusion

The audit reveals that the feature types directories are currently empty, but feature service files contain type duplications that should be consolidated into shared types. The main issue is inconsistent type definitions across feature services rather than in dedicated feature type files.

**Next Steps**: Move to consolidation phase as outlined in refactoring plan.