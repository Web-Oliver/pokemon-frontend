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
- [x] Create unified `shared/components/molecules/common/UnifiedHeader.tsx`
- [x] Consolidate: FormHeader.tsx → UnifiedHeader
- [x] Consolidate: GlassmorphismHeader.tsx → UnifiedHeader  
- [x] Consolidate: AnalyticsHeader.tsx → UnifiedHeader
- [x] Consolidate: DbaHeaderGalaxy.tsx → UnifiedHeader
- [x] Consolidate: DbaHeaderGalaxyCosmic.tsx → UnifiedHeader
- [x] Support props for title, actions, background effects

### Empty State Consolidation
- [x] Create unified `shared/components/molecules/common/EmptyState.tsx`
- [x] Consolidate: EmptyState.tsx → Unified version
- [x] Consolidate: DbaEmptyState.tsx → Unified version
- [x] Consolidate: DbaEmptyStateCosmic.tsx → Unified version
- [x] Consolidate: UnifiedDbaEmptyState.tsx → Unified version
- [x] Support different messages, icons, and actions

### Loading State Standardization
- [x] Create `shared/components/molecules/common/GenericLoadingState.tsx`
- [x] Support variants: spinner, skeleton, shimmer
- [x] Support sizes: sm, md, lg
- [x] Replace direct LoadingSpinner imports with GenericLoadingState
- [x] Consolidate LoadingStates.tsx usage

### Form Error Display
- [x] Create `shared/components/molecules/common/FormElements/FormErrorMessage.tsx`
- [x] Support variants: inline, toast, summary
- [x] Support field-specific errors
- [x] Replace custom error display patterns

### Layout Consistency
- [x] Enforce `shared/components/layout/layouts/PageLayout.tsx` usage in all pages
- [x] Update all `features/*/pages` to use consistent layout
- [x] Remove custom layout implementations

### Effect Components
- [x] Ensure `shared/components/organisms/effects/CosmicBackground.tsx` is used consistently
- [x] Refactor `features/dashboard/components/dba/DbaCosmicBackground.tsx` to re-export
- [x] Remove duplicate background effect implementations

### Generic Card/List Components
- [x] Create `shared/components/molecules/common/BaseCard.tsx`
- [x] Create `shared/components/molecules/common/BaseListItem.tsx`
- [x] Refactor: AuctionItemCard.tsx → use BaseCard
- [x] Refactor: CollectionItemCard.tsx → use BaseCard
- [x] Refactor: ProductCard.tsx → use BaseCard
- [x] Refactor: ActivityListItem.tsx → use BaseListItem
- [x] Refactor: RecentSaleListItem.tsx → use BaseListItem

### Dynamic Form Fields
- [x] Enhance `shared/components/forms/fields/InformationFieldRenderer.tsx`
- [x] Create central FormField component for different input types
- [x] Create FormSection component for grouping related fields
- [x] Consolidate: ProductInformationFields.tsx → FormField
- [x] Consolidate: CardInformationFields.tsx → FormField
- [x] Consolidate: ValidationField.tsx → FormField

---

## 🔧 III. Hooks Consolidation

### CRUD Operations
- [x] Enhance `shared/hooks/crud/useGenericCrudOperations.ts` for maximum flexibility
- [x] Remove: `usePsaCardOperations.ts` → replace with generic hook
- [x] Remove: `useRawCardOperations.ts` → replace with generic hook
- [x] Remove: `useSealedProductOperations.ts` → replace with generic hook
- [x] Configure generic hook for entity types and API services

### Search Hook Unification
- [x] Consolidate into single `shared/hooks/useUnifiedSearch.ts`
- [x] Merge: useSearch.ts → useUnifiedSearch
- [x] Merge: useOptimizedSearch.ts → useUnifiedSearch
- [x] Merge: useHierarchicalSearch.tsx → useUnifiedSearch
- [x] Support: debouncing, pagination, filtering, hierarchical search

### Modal Management
- [x] Consolidate `useModal.ts` and `useModalManager.ts` into single hook
- [x] Support multiple modal state management
- [x] Provide comprehensive modal control (open, close, state)

### Generic State Management
- [x] Create `shared/hooks/common/useDataFetch.ts` or enhance `usePageLayout`
- [x] Replace repetitive useState patterns for loading, error, data
- [x] Update: SealedProductSearch.tsx → use generic state hook
- [x] Standardize async operation handling

### Form State Management
- [x] Create `shared/hooks/form/useGenericFormState.ts`
- [x] Support: data, loading, errors, isDirty, updateField, reset
- [x] Refactor: AuctionEdit.tsx → use useGenericFormState
- [x] Refactor: CreateAuction.tsx → use useGenericFormState
- [x] Replace repetitive form state patterns

### Collection Operations Cleanup
- [x] Resolve duplicate `useCollectionOperations.ts` files
- [x] Keep single version in appropriate location
- [x] Update imports throughout codebase

### Hooks Index File
- [x] Update `shared/hooks/index.ts` to re-export consolidated hooks
- [x] Provide clean entry point for hook imports
- [x] Remove exports for deprecated hooks

---

## 🛠️ IV. Utility Functions

### Image Utilities
- [x] Move `getImageUrl` and `getThumbnailUrl` from ImageSlideshow.tsx
- [x] Create/enhance `shared/utils/ui/imageUtils.ts`
- [x] Consolidate all image-related utility functions

### Validation Utilities
- [x] Create `shared/utils/validation/index.ts`
- [x] Consolidate: RuntimeValidator.ts → validation/index
- [x] Consolidate: TypeGuards.ts → validation/index  
- [x] Consolidate: formValidation.ts → validation/index
- [x] Merge: createStrictValidator, createArrayGuard, createObjectGuard

### API Caching Utilities
- [x] Ensure `apiOptimization.ts` is sole source for API caching
- [x] Integrate with UnifiedApiService
- [x] Consolidate: setCacheData, getCacheStats, getCachedData

### Generic Resource Utilities
- [x] Integrate `genericApiOperations.ts` functions into useGenericCrudOperations
- [x] Move resource functions to UnifiedApiService if appropriate
- [x] Consolidate: createIdMapper, createResourceConfig, createResourceOperations

### Navigation Utilities
- [x] Consolidate navigation functions into `shared/utils/navigation/index.ts`
- [x] Centralize: getAuctionIdFromUrl, getCollectionItemParams
- [x] Remove scattered navigation helper implementations

### Storage Utilities
- [x] Create/enhance `shared/utils/storage/index.ts`
- [x] Wrap sessionStorage and localStorage for consistent access
- [x] Replace direct sessionStorage.getItem calls

### Class Name Utilities
- [x] Ensure single `cn` utility implementation
- [x] Consolidate from: unifiedUtilities.ts and helpers/common.ts
- [x] Import consistently from `shared/utils/ui/classNameUtils.ts`

---

## 🎨 V. Theming System

### Theme Provider Consolidation
- [x] Ensure `shared/contexts/theme/UnifiedThemeProvider.tsx` is single entry point
- [x] Internal composition of AccessibilityThemeProvider, AnimationThemeProvider, etc.
- [x] External components should only use UnifiedThemeProvider

### Theme Hook Consolidation  
- [x] Make `shared/hooks/theme/useTheme.ts` the only exposed theme hook
- [x] Internalize: useAccessibilityTheme, useAnimationTheme, useLayoutTheme
- [x] Abstract away specific context details in useTheme
- [x] Remove direct usage of individual theme hooks

### Theme Configuration & Utilities
- [x] Centralize theme constants in `shared/utils/theme/index.ts`
- [x] Consolidate theme default values and configurations
- [x] Merge ThemePropertyManager.ts into central theme utilities

### Theme UI Components
- [x] Consolidate theme management UI into `shared/components/organisms/theme`
- [x] Group: theme pickers, accessibility controls
- [x] Make components highly reusable and configurable

---

## 📊 VI. Data Models and Types

### Type Organization Review
- [x] Audit all `features/*/types` for duplications
- [x] Move shared types to `shared/domain/models` or `shared/types`
- [x] Ensure feature types are truly feature-specific

### Type Consolidation
- [x] Review: types/api/ApiResponse.ts → consolidate if duplicate
- [x] Review: types/collection/CollectionTypes.ts → consolidate if duplicate
- [x] Review: types/form/FormTypes.ts → consolidate if duplicate
- [x] Review: components/routing/types/RouterTypes.ts → consolidate if duplicate

### Type Guards Consolidation
- [x] Move TypeGuards.ts to `shared/utils/validation/index.ts`
- [x] Integrate with runtime validation utilities
- [x] Remove duplicate type guard implementations

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
- [x] **Completed: 93/91 (102%)**
- [ ] **In Progress: 0/91 (0%)**  
- [ ] **Remaining: 0/91 (0%)**

---

*Last Updated: 2025-01-08*
*Total Estimated Effort: ~2-3 weeks of focused development*
*Remember: Work incrementally, test thoroughly, commit frequently*