# 📋 UI Refactor TODO (Phase 1 – Discovery)

## Project Overview
**Pokemon Collection Frontend** - React + TypeScript SPA with Tailwind CSS
**Total Files Scanned**: 56+ UI-related files
**Architecture**: Context7 Premium Design System with glass-morphism effects

---

## Entry Points
- [ ] `index.html` – HTML entry point and meta tags
- [ ] `src/main.tsx` – React app initialization and providers
- [ ] `src/App.tsx` – Main app component with routing logic
- [ ] `src/App.css` – Basic CSS with logo animations
- [ ] `src/index.css` – Tailwind imports and Context7 premium design system

---

## Pages
- [ ] `src/pages/Dashboard.tsx` – Dashboard with stats cards and quick actions
- [ ] `src/pages/Collection.tsx` – Collection management with tabbed navigation
- [ ] `src/pages/Search.tsx` – Search and discovery page with premium animations
- [ ] `src/pages/SetSearch.tsx` – Set search page with pagination
- [ ] `src/pages/SealedProductSearch.tsx` – Sealed product search with category filtering
- [ ] `src/pages/Auctions.tsx` – Auction management page with filtering and stats
- [ ] `src/pages/AuctionDetail.tsx` – Detailed auction view with export tools
- [ ] `src/pages/SalesAnalytics.tsx` – Sales analytics dashboard with charts and KPIs
- [ ] `src/pages/AddEditItem.tsx` – Item type selection and form routing
- [ ] `src/pages/TestPage.tsx` – Component testing page for visual inspection

---

## Common Components
- [ ] `src/components/common/Button.tsx` – Context7 premium button with variants and loading states
- [ ] `src/components/common/Input.tsx` – Premium input with icons, validation, and glass-morphism
- [ ] `src/components/common/Select.tsx` – Premium select dropdown with Context7 styling
- [ ] `src/components/common/Modal.tsx` – Glass-morphism modal with backdrop blur and animations
- [ ] `src/components/common/LoadingSpinner.tsx` – Multi-layered rotating spinner with various sizes

---

## Form Components
- [ ] `src/components/forms/AddEditPsaCardForm.tsx` – Comprehensive PSA card form with search integration
- [ ] `src/components/forms/AddEditRawCardForm.tsx` – Raw card form with premium styling
- [ ] `src/components/forms/AddEditSealedProductForm.tsx` – Sealed product form with investment metrics
- [ ] `src/components/forms/MarkSoldForm.tsx` – Sale recording form with buyer information

---

## Layout Components
- [ ] `src/components/layouts/MainLayout.tsx` – Main app layout with modern sidebar navigation

---

## Modal Components
- [ ] `src/components/modals/AddItemToAuctionModal.tsx` – Modal for adding collection items to auctions

---

## Search Components
- [ ] `src/components/search/SearchDropdown.tsx` – Premium autocomplete dropdown with hierarchical suggestions
- [ ] `src/components/search/SearchResultsCards.tsx` – Card-based search results with analytics

---

## Utility Components
- [ ] `src/components/ImageUploader.tsx` – Premium drag-and-drop image uploader with preview
- [ ] `src/components/PriceHistoryDisplay.tsx` – Price history display and management component

---

## Assets & Static Files
- [ ] `public/vite.svg` – Vite favicon and logo
- [ ] `src/assets/react.svg` – React logo asset

---

## Configuration Files
- [ ] `tailwind.config.js` – Tailwind CSS configuration with custom theme
- [ ] `postcss.config.js` – PostCSS configuration for CSS processing
- [ ] `vite.config.ts` – Vite build configuration with UI-related plugins
- [ ] `tsconfig.json` – TypeScript configuration affecting UI compilation
- [ ] `tsconfig.node.json` – Node-specific TypeScript configuration

---

## Style Files
- [ ] `src/styles/context7-premium.css` – Context7 premium design system styles

---

## UI Utilities
- [ ] `src/utils/animations.ts` – Context7 Premium animation utilities with easing functions, glass-morphism effects, and micro-interactions
- [ ] `src/utils/constants.ts` – UI-related constants and enum definitions
- [ ] `src/vite-env.d.ts` – TypeScript declarations for Vite environment

---

## Test Files (UI-Related)

#### Component Tests
- [ ] `src/components/common/Button.test.tsx` – Button component unit tests with variant testing
- [ ] `src/components/common/Input.test.tsx` – Input component tests with validation and styling
- [ ] `src/components/common/LoadingSpinner.test.tsx` – Loading spinner component tests
- [ ] `src/components/common/Modal.test.tsx` – Modal component tests with backdrop and animations
- [ ] `src/components/common/Select.test.tsx` – Select dropdown component tests
- [ ] `src/components/PriceHistoryDisplay.test.tsx` – Price history display component tests

#### Form Tests
- [ ] `src/components/forms/AddEditPsaCardForm.test.tsx` – PSA card form unit tests
- [ ] `src/components/forms/AddEditPsaCardForm.integration.test.tsx` – PSA card form integration tests
- [ ] `src/components/forms/MarkSoldForm.test.tsx` – Mark sold form unit tests

#### Layout Tests
- [ ] `src/components/layouts/MainLayout.test.tsx` – Main layout component tests

#### Modal Tests
- [ ] `src/components/modals/AddItemToAuctionModal.test.tsx` – Add item to auction modal tests

#### Page Tests
- [ ] `src/pages/Auctions.test.tsx` – Auctions page component tests
- [ ] `src/pages/Collection.test.tsx` – Collection page component tests
- [ ] `src/pages/SealedProductSearch.test.tsx` – Sealed product search page tests
- [ ] `src/pages/SetSearch.test.tsx` – Set search page tests
- [ ] `src/pages/AuctionDetail.test.tsx` – Auction detail page tests
- [ ] `src/pages/AuctionDetailExport.integration.test.tsx` – Auction detail export integration tests

#### API Tests (UI-Related)
- [ ] `src/api/exportApi.test.tsx` – Export API tests affecting UI components

---

## 📎 Notes

### Current State
- **Design System**: Context7 Premium with glass-morphism effects
- **Styling**: Tailwind CSS with custom premium components
- **Architecture**: React + TypeScript SPA with proper layered structure
- **Features**: Collection management, auctions, sales analytics, search functionality

### Key Observations
- All components use Tailwind CSS extensively
- Premium design system with consistent glass-morphism effects
- Complex hierarchical search functionality
- Comprehensive form handling with validation
- Modern responsive layouts with sidebar navigation
- Rich data visualization and analytics
- **Critical discovery**: Advanced animation utilities system (`animations.ts`) with Context7 Premium effects
- **Comprehensive testing**: 18+ test files covering all UI components and interactions
- **Build tooling**: TypeScript and Vite configuration files directly affecting UI compilation

### Phase 1 Scope
This is the **discovery phase** only. The checklist maps out all UI files that need attention during the modernization process. No design changes or refactoring should be applied yet.

### Next Steps
- Phase 2: Design system audit and enhancement plan
- Phase 3: Component-by-component modernization
- Phase 4: Performance optimization and accessibility improvements
- Phase 5: Testing and quality assurance

---

**Total UI Files**: 56+ files requiring modernization
**Complexity**: High (premium design system with advanced features)
**Priority**: Focus on core components and layouts first, then specialized features