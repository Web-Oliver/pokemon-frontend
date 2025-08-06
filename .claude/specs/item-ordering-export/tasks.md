# Implementation Tasks: Item Ordering for Collection Export

## Task Breakdown

- [x] 
    1. Create core ordering interfaces and types

    - Define ItemOrderingState interface in domain models
    - Create OrderedCollectionItem type extending existing CollectionItem
    - Add OrderedExportRequest interface extending ExportRequest
    - _Leverage: src/domain/models/card.ts, src/interfaces/api/IExportApiService.ts_
    - _Requirements: Data model interfaces from design_

- [x] 
    2. Extend export utilities with ordering functions

    - Add price sorting algorithm to exportUtils.ts
    - Implement order validation functions
    - Create ordering error handling utilities
    - Add category-based item grouping helpers
    - _Leverage: src/utils/exportUtils.ts existing export functions_
    - _Requirements: Price sorting and order validation_

- [x] 
    3. Enhance useCollectionExport hook with ordering capabilities

    - Add ordering state management (itemOrder, orderedItems)
    - Implement reorderItems, moveItemUp, moveItemDown functions
    - Add autoSortByPrice and sortCategoryByPrice methods
    - Integrate ordering with existing export operations
    - _Leverage: src/hooks/useCollectionExport.ts existing hook structure_
    - _Requirements: Enhanced export hook interface_

- [x] 
    4. Create OrderableItemCard component

    - Design item card with drag handle and move buttons
    - Implement up/down button interactions
    - Add visual feedback for dragging state
    - Follow existing item card patterns for consistency
    - _Leverage: src/components/lists/CollectionItemCard.tsx, CreateAuction.tsx drag patterns_
    - _Requirements: Manual item reordering controls_

- [x] 
    5. Build CategoryOrderingList component

    - Create category-specific item lists with ordering
    - Implement category-based price sorting
    - Add drag & drop functionality within categories
    - Group items by PSA_CARD, RAW_CARD, SEALED_PRODUCT
    - _Leverage: existing category grouping patterns, CreateAuction.tsx drag & drop_
    - _Requirements: Category-aware ordering_

- [x] 
    6. Create ItemOrderingSection component

    - Build main ordering interface container
    - Add global auto-sort by price controls
    - Implement order reset functionality
    - Integrate with CategoryOrderingList components
    - _Leverage: existing section component patterns_
    - _Requirements: Main ordering interface_

- [x] 
    7. Integrate ordering UI into CollectionExportModal

    - Add ItemOrderingSection to export modal
    - Update modal props to include ordering handlers
    - Implement ordering state in modal component
    - Preserve existing export format selection
    - _Leverage: src/components/lists/CollectionExportModal.tsx existing modal structure_
    - _Requirements: Modal integration with ordering_

- [x] 
    8. Update ExportApiService to handle ordered exports

    - Modify export request to include item ordering
    - Apply ordering before export generation
    - Maintain category grouping in ordered output
    - Preserve existing Facebook text formatting
    - _Leverage: src/services/ExportApiService.ts existing export methods_
    - _Requirements: Ordered export generation_

- [x] 
    9. Add drag & drop dependency and implementation

    - Install react-beautiful-dnd or @dnd-kit/sortable
    - Implement drag & drop context providers
    - Add drag constraints for category boundaries
    - Provide visual feedback during drag operations
    - _Leverage: existing drag patterns from CreateAuction.tsx_
    - _Requirements: Drag & drop functionality_

- [x] 
    10. Implement ordering state persistence

    - Add localStorage integration for order preferences
    - Save/restore ordering per export session
    - Clear state after successful export
    - Handle ordering state errors gracefully
    - _Leverage: existing localStorage patterns in codebase_
    - _Requirements: Order persistence_

- [x] 
    11. Add comprehensive unit tests

    - Test ordering utilities (price sort, validation)
    - Test enhanced export hook ordering functions
    - Test component interactions and state updates
    - Test error handling and recovery scenarios
    - _Leverage: existing test utilities and patterns_
    - _Requirements: Testing strategy_

- [x] 
    12. Add integration tests for ordering workflow

    - Test full export workflow with ordering
    - Test drag & drop interactions
    - Test mixed manual and auto-sort operations
    - Test ordering with large item collections
    - _Leverage: existing integration test patterns_
    - _Requirements: End-to-end ordering validation_

## Success Criteria

Each task should result in:

- ✅ Working code that integrates with existing architecture
- ✅ Consistent UI/UX following project patterns
- ✅ Proper error handling and edge case coverage
- ✅ Unit tests with good coverage
- ✅ TypeScript types and interfaces
- ✅ Documentation of new functions and components

## Task Dependencies

- Tasks 1-3: Foundation layer (can be done in parallel)
- Tasks 4-6: Component layer (depends on 1-3)
- Task 7: Integration layer (depends on 4-6)
- Task 8: Service layer (depends on 1-3, 7)
- Tasks 9-10: Enhancement layer (depends on 4-8)
- Tasks 11-12: Testing layer (depends on all previous)

This implementation plan prioritizes code reuse and follows the existing codebase patterns while delivering the item
ordering functionality in manageable, incremental steps.
