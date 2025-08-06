# Refactor Todo List

> **🔍 Always read the [refactoring-plan.md](./refactoring-plan.md) before working on any tasks**

## 📋 Refactoring Strategies

### Core Principles
- **Work Incrementally**: Tackle one consolidation area at a time
- **Test Coverage**: Ensure tests exist before and after refactoring
- **Version Control**: Commit frequently with clear messages
- **Follow SOLID & DRY**: Single Responsibility, Don't Repeat Yourself
- **Maintain Functionality**: Preserve all existing features

### Strategy Approach
1. **Context Gathering**: Understand existing architecture and dependencies
2. **Component Identification**: Extract reusable patterns 
3. **Pre-Integration Review**: Check existing files before adding new ones
4. **Module-by-Module**: Implement incrementally with proper testing
5. **Documentation**: Update docs for architectural decisions

---

## 🚀 I. API Layer Consolidation

### Core HTTP Client
- [x] Review and enhance `shared/services/base/UnifiedHttpClient.ts` as the single HTTP client
- [x] Ensure all fetch/axios calls go through UnifiedHttpClient only
- [x] Implement common concerns: base URL, headers, error parsing, response transformation

### Unified API Service
- [x] Create/enhance `shared/services/UnifiedApiService.ts` as single API facade
- [x] Structure as domain-based service (e.g., `unifiedApiService.auctions.getById()`)
- [x] Replace direct imports of individual API files (setsApi, collectionApi, etc.)

### API Files Cleanup
- [x] Deprecate individual `shared/api/*.ts` files
- [x] Move logic to UnifiedApiService or feature-specific services
- [x] Remove: `shared/api/setsApi.ts`
- [x] Remove: `shared/api/searchApi.ts` 
- [x] Remove: `shared/api/collectionApi.ts`
- [x] Remove: `shared/api/productsApi.ts`

### Generic Operations Integration
- [x] Integrate `shared/api/genericApiOperations.ts` patterns into `useGenericCrudOperations` hook
- [x] Create factory function for collection API logging/fetching
- [x] Implement `createLoggedCollectionOperation<T>` factory
- [x] Refactor repetitive patterns in collectionApi.ts using factory

### Feature Services Update
- [x] Update `features/*/services` to use UnifiedApiService
- [x] Ensure feature services are thin layers for UI-specific data mapping
- [x] Remove duplicate HTTP logic from feature services

---

## 🎨 II. UI Components & Design System

### Header Component Consolidation
- [ ] Create unified `shared/components/molecules/common/UnifiedHeader.tsx`
- [ ] Consolidate: FormHeader.tsx → UnifiedHeader
- [ ] Consolidate: GlassmorphismHeader.tsx → UnifiedHeader  
- [ ] Consolidate: AnalyticsHeader.tsx → UnifiedHeader
- [ ] Consolidate: DbaHeaderGalaxy.tsx → UnifiedHeader
- [ ] Consolidate: DbaHeaderGalaxyCosmic.tsx → UnifiedHeader
- [ ] Support props for title, actions, background effects

### Empty State Consolidation
- [ ] Create unified `shared/components/molecules/common/EmptyState.tsx`
- [ ] Consolidate: EmptyState.tsx → Unified version
- [ ] Consolidate: DbaEmptyState.tsx → Unified version
- [ ] Consolidate: DbaEmptyStateCosmic.tsx → Unified version
- [ ] Consolidate: UnifiedDbaEmptyState.tsx → Unified version
- [ ] Support different messages, icons, and actions

### Loading State Standardization
- [ ] Create `shared/components/molecules/common/GenericLoadingState.tsx`
- [ ] Support variants: spinner, skeleton, shimmer
- [ ] Support sizes: sm, md, lg
- [ ] Replace direct LoadingSpinner imports with GenericLoadingState
- [ ] Consolidate LoadingStates.tsx usage

### Form Error Display
- [ ] Create `shared/components/molecules/common/FormElements/FormErrorMessage.tsx`
- [ ] Support variants: inline, toast, summary
- [ ] Support field-specific errors
- [ ] Replace custom error display patterns

### Layout Consistency
- [ ] Enforce `shared/components/layout/layouts/PageLayout.tsx` usage in all pages
- [ ] Update all `features/*/pages` to use consistent layout
- [ ] Remove custom layout implementations

### Effect Components
- [ ] Ensure `shared/components/organisms/effects/CosmicBackground.tsx` is used consistently
- [ ] Refactor `features/dashboard/components/dba/DbaCosmicBackground.tsx` to re-export
- [ ] Remove duplicate background effect implementations

### Generic Card/List Components
- [ ] Create `shared/components/molecules/common/BaseCard.tsx`
- [ ] Create `shared/components/molecules/common/BaseListItem.tsx`
- [ ] Refactor: AuctionItemCard.tsx → use BaseCard
- [ ] Refactor: CollectionItemCard.tsx → use BaseCard
- [ ] Refactor: ProductCard.tsx → use BaseCard
- [ ] Refactor: ActivityListItem.tsx → use BaseListItem
- [ ] Refactor: RecentSaleListItem.tsx → use BaseListItem

### Dynamic Form Fields
- [ ] Enhance `shared/components/forms/fields/InformationFieldRenderer.tsx`
- [ ] Create central FormField component for different input types
- [ ] Create FormSection component for grouping related fields
- [ ] Consolidate: ProductInformationFields.tsx → FormField
- [ ] Consolidate: CardInformationFields.tsx → FormField
- [ ] Consolidate: ValidationField.tsx → FormField

---

## 🔧 III. Hooks Consolidation

### CRUD Operations
- [ ] Enhance `shared/hooks/crud/useGenericCrudOperations.ts` for maximum flexibility
- [ ] Remove: `usePsaCardOperations.ts` → replace with generic hook
- [ ] Remove: `useRawCardOperations.ts` → replace with generic hook
- [ ] Remove: `useSealedProductOperations.ts` → replace with generic hook
- [ ] Configure generic hook for entity types and API services

### Search Hook Unification
- [ ] Consolidate into single `shared/hooks/useUnifiedSearch.ts`
- [ ] Merge: useSearch.ts → useUnifiedSearch
- [ ] Merge: useOptimizedSearch.ts → useUnifiedSearch
- [ ] Merge: useHierarchicalSearch.tsx → useUnifiedSearch
- [ ] Support: debouncing, pagination, filtering, hierarchical search

### Modal Management
- [ ] Consolidate `useModal.ts` and `useModalManager.ts` into single hook
- [ ] Support multiple modal state management
- [ ] Provide comprehensive modal control (open, close, state)

### Generic State Management
- [ ] Create `shared/hooks/common/useDataFetch.ts` or enhance `usePageLayout`
- [ ] Replace repetitive useState patterns for loading, error, data
- [ ] Update: SealedProductSearch.tsx → use generic state hook
- [ ] Standardize async operation handling

### Form State Management
- [ ] Create `shared/hooks/form/useGenericFormState.ts`
- [ ] Support: data, loading, errors, isDirty, updateField, reset
- [ ] Refactor: AuctionEdit.tsx → use useGenericFormState
- [ ] Refactor: CreateAuction.tsx → use useGenericFormState
- [ ] Replace repetitive form state patterns

### Collection Operations Cleanup
- [ ] Resolve duplicate `useCollectionOperations.ts` files
- [ ] Keep single version in appropriate location
- [ ] Update imports throughout codebase

### Hooks Index File
- [ ] Update `shared/hooks/index.ts` to re-export consolidated hooks
- [ ] Provide clean entry point for hook imports
- [ ] Remove exports for deprecated hooks

---

## 🛠️ IV. Utility Functions

### Image Utilities
- [ ] Move `getImageUrl` and `getThumbnailUrl` from ImageSlideshow.tsx
- [ ] Create/enhance `shared/utils/ui/imageUtils.ts`
- [ ] Consolidate all image-related utility functions

### Validation Utilities
- [ ] Create `shared/utils/validation/index.ts`
- [ ] Consolidate: RuntimeValidator.ts → validation/index
- [ ] Consolidate: TypeGuards.ts → validation/index  
- [ ] Consolidate: formValidation.ts → validation/index
- [ ] Merge: createStrictValidator, createArrayGuard, createObjectGuard

### API Caching Utilities
- [ ] Ensure `apiOptimization.ts` is sole source for API caching
- [ ] Integrate with UnifiedApiService
- [ ] Consolidate: setCacheData, getCacheStats, getCachedData

### Generic Resource Utilities
- [ ] Integrate `genericApiOperations.ts` functions into useGenericCrudOperations
- [ ] Move resource functions to UnifiedApiService if appropriate
- [ ] Consolidate: createIdMapper, createResourceConfig, createResourceOperations

### Navigation Utilities
- [ ] Consolidate navigation functions into `shared/utils/navigation/index.ts`
- [ ] Centralize: getAuctionIdFromUrl, getCollectionItemParams
- [ ] Remove scattered navigation helper implementations

### Storage Utilities
- [ ] Create/enhance `shared/utils/storage/index.ts`
- [ ] Wrap sessionStorage and localStorage for consistent access
- [ ] Replace direct sessionStorage.getItem calls

### Class Name Utilities
- [ ] Ensure single `cn` utility implementation
- [ ] Consolidate from: unifiedUtilities.ts and helpers/common.ts
- [ ] Import consistently from `shared/utils/ui/classNameUtils.ts`

---

## 🎨 V. Theming System

### Theme Provider Consolidation
- [ ] Ensure `shared/contexts/theme/UnifiedThemeProvider.tsx` is single entry point
- [ ] Internal composition of AccessibilityThemeProvider, AnimationThemeProvider, etc.
- [ ] External components should only use UnifiedThemeProvider

### Theme Hook Consolidation  
- [ ] Make `shared/hooks/theme/useTheme.ts` the only exposed theme hook
- [ ] Internalize: useAccessibilityTheme, useAnimationTheme, useLayoutTheme
- [ ] Abstract away specific context details in useTheme
- [ ] Remove direct usage of individual theme hooks

### Theme Configuration & Utilities
- [ ] Centralize theme constants in `shared/utils/theme/index.ts`
- [ ] Consolidate theme default values and configurations
- [ ] Merge ThemePropertyManager.ts into central theme utilities

### Theme UI Components
- [ ] Consolidate theme management UI into `shared/components/organisms/theme`
- [ ] Group: theme pickers, accessibility controls
- [ ] Make components highly reusable and configurable

---

## 📊 VI. Data Models and Types

### Type Organization Review
- [ ] Audit all `features/*/types` for duplications
- [ ] Move shared types to `shared/domain/models` or `shared/types`
- [ ] Ensure feature types are truly feature-specific

### Type Consolidation
- [ ] Review: types/api/ApiResponse.ts → consolidate if duplicate
- [ ] Review: types/collection/CollectionTypes.ts → consolidate if duplicate
- [ ] Review: types/form/FormTypes.ts → consolidate if duplicate
- [ ] Review: components/routing/types/RouterTypes.ts → consolidate if duplicate

### Type Guards Consolidation
- [ ] Move TypeGuards.ts to `shared/utils/validation/index.ts`
- [ ] Integrate with runtime validation utilities
- [ ] Remove duplicate type guard implementations

### Domain Models Reinforcement
- [ ] Ensure `shared/domain/models` contains core business entities only
- [ ] Move utility types to `shared/types`
- [ ] Clear distinction between business entities and utility types

---

## 🔧 VII. General Code Patterns

### Error Handling Standardization
- [ ] Enhance `shared/utils/errorHandler.ts` as central error handler
- [ ] Replace direct `throw new Error()` calls with centralized handler
- [ ] Integrate with global ErrorBoundary.tsx
- [ ] Provide user-friendly error messages and logging

### State Management Patterns
- [ ] Create `useToggle` hook for boolean state patterns
- [ ] Create `useDataFetch` hook for loading/error/data patterns  
- [ ] Replace repetitive useState declarations
- [ ] Standardize: selectedItems, showPreview, isModalOpen patterns

### Validation Patterns
- [ ] Enhance central validation utility for complex validation
- [ ] Create `useFormValidation.ts` hook
- [ ] Replace simple trim() validations with centralized logic
- [ ] Standardize input validation across forms

### Loading State Patterns
- [ ] Standardize loading state management with single hook
- [ ] Replace inconsistent usePageLayout vs useState patterns
- [ ] Simplify conditional rendering with {loading && ...}
- [ ] Create `useLoadingState` if needed

### Form Handling Patterns
- [ ] Enhance `useFormSubmission.ts` and `useBaseForm.ts`
- [ ] Provide unified form submission handling
- [ ] Include data transformation (trim()) and validation
- [ ] Replace repetitive onSubmit and handleSubmit patterns

---

## 📝 Documentation & Testing

### Update Documentation
- [ ] Update CLAUDE.md with new architectural decisions
- [ ] Document new consolidated components and hooks
- [ ] Update import paths in documentation examples

### Testing Strategy
- [ ] Write tests for new consolidated components
- [ ] Ensure test coverage before refactoring existing code
- [ ] Test hooks consolidation thoroughly
- [ ] Validate API layer changes with integration tests

### Migration Guide
- [ ] Create migration guide for developers
- [ ] Document breaking changes and new import paths
- [ ] Provide examples of old vs new patterns

---

## ✅ Progress Tracking

### Completed Sections
- [ ] I. API Layer Consolidation (0/15 tasks)
- [ ] II. UI Components & Design System (0/20 tasks) 
- [ ] III. Hooks Consolidation (0/12 tasks)
- [ ] IV. Utility Functions (0/12 tasks)
- [ ] V. Theming System (0/8 tasks)
- [ ] VI. Data Models and Types (0/8 tasks)
- [ ] VII. General Code Patterns (0/10 tasks)
- [ ] Documentation & Testing (0/6 tasks)

### Overall Progress
**Total Tasks: 91**
- [ ] **Completed: 18/91 (20%)**
- [ ] **In Progress: 0/91 (0%)**  
- [ ] **Remaining: 73/91 (80%)**

---

*Last Updated: 2025-01-08*
*Total Estimated Effort: ~2-3 weeks of focused development*
*Remember: Work incrementally, test thoroughly, commit frequently*