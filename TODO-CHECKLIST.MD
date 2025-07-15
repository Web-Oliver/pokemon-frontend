Pokemon Collection Frontend - Comprehensive To-Do List

This is the comprehensive To-Do list for the Pokemon Collection Frontend project. The frontend is located at SAFESPACE/pokemon-collection-frontend, and it interfaces with the backend located at SAFESPACE/pokemon-collection-backend.

🚨 **IMPORTANT**: Backend Analysis Update - This TODO list has been updated to reflect the ACTUAL backend API structure based on the real backend documentation.

**Backend Configuration:**
- Backend URL: http://localhost:3000/api (Port 3000, NOT 3001)
- Express.js 5.1.0 with MongoDB/Mongoose 8.16.1
- Uses Decimal128 for prices (converted to numbers in frontend)
- Comprehensive search with Fuse.js + MongoDB text search + 5-minute caching
- Polymorphic auction system supporting PSA/Raw cards and sealed products

Phase 1: Foundational Setup & Core Utilities ✅

1.1. Project Initialization & Basic Setup ✅

[x] Action: Initialize a new React project.
[x] Sub-action: Open your terminal.
[x] Sub-action: Choose a project directory (e.g., cd SAFESPACE/).
[x] Sub-action: Run npm create vite@latest pokemon-collection-frontend -- --template react-ts.
[x] Sub-action: Navigate into the new project directory: cd pokemon-collection-frontend.
Verification:
[x] Run npm install to install initial dependencies.
[x] Run npm run dev (for Vite) or npm start (for CRA).
[x] Open your browser to http://localhost:5173 (or http://localhost:3000) and confirm the default React app is displayed.

1.2. Tailwind CSS Integration ✅

[x] Action: Integrate Tailwind CSS into the project.
[x] Sub-action: Install Tailwind CSS, PostCSS, and Autoprefixer as development dependencies: npm install -D tailwindcss postcss autoprefixer.
[x] Sub-action: Generate the tailwind.config.js and postcss.config.js configuration files: npx tailwindcss init -p.
[x] Sub-action: Configure tailwind.config.js to scan for Tailwind classes in all relevant HTML, JS, JSX, TS, and TSX files within the src/ directory.
[x] Sub-action: Add the Tailwind CSS directives (@tailwind base; @tailwind components; @tailwind utilities;) to src/index.css (or src/App.css).
[x] Sub-action: Apply a simple Tailwind class (e.g., text-3xl font-bold underline text-blue-500) to an existing element in src/App.tsx to visually confirm integration.
Verification:
[x] Run npm run dev and observe the styling in the browser.

1.3. Install Core Frontend Libraries ✅

[x] Action: Integrate the essential frontend libraries into the project.
[x] Sub-action: Install zustand for state management: npm install zustand.
[x] Sub-action: Install recharts for charting/visualization: npm install recharts.
[x] Sub-action: Install react-hook-form for form management: npm install react-hook-form.
[x] Sub-action: Install axios as the HTTP client: npm install axios.
[x] Sub-action: Install lucide-react for icons: npm install lucide-react.
Verification:
[x] Check package.json for correct entries.

1.4. Establish Initial Directory Structure ✅

[x] Action: Set up the foundational layered directory structure.
[x] Sub-action: Create src/api/.
[x] Sub-action: Create src/components/.
[x] src/components/common/
[x] src/components/forms/
[x] src/components/layouts/
[x] src/components/lists/
[x] Sub-action: Create src/hooks/.
[x] Sub-action: Create src/domain/.
[x] src/domain/models/
[x] src/domain/services/
[x] src/domain/validators/
[x] Sub-action: Create src/utils/.
[x] Sub-action: Create src/pages/.
[x] Sub-action: Add a .gitkeep file inside each newly created directory.
Verification:
[x] Use ls -R src/ in your terminal to visually confirm the directory structure.

1.5. Implement Global Utilities - Constants & Logger ✅

[x] Action: Develop the initial global utility modules for constants and logging.
[x] Sub-action: Create src/utils/constants.ts.
 [x] UPDATED: Changed API_BASE_URL to http://localhost:3000/api (backend runs on port 3000).
 [x] UPDATED: Corrected TypeScript enums to match exact backend schema values:
   - PaymentMethod: 'CASH' | 'Mobilepay' | 'BankTransfer' 
   - DeliveryMethod: 'Sent' | 'Local Meetup'
   - Source: 'Facebook' | 'DBA'
[x] Sub-action: Create src/utils/logger.ts.
 [x] Implement log and error functions that wrap console.log and console.error respectively.
 [x] Ensure log only outputs in non-production environments.
Verification:
[x] Import log into App.tsx and add a log('App loaded!');. Run npm run dev and check the browser console.

1.6. Implement Global Utilities - Error Handler & API Client ✅

[x] Action: Develop the global error handling utility and the central API client.
[x] Sub-action: Create src/utils/errorHandler.ts.
 [x] Implement handleApiError function that takes an error object and an optional message.
 [x] It should use the error function from src/utils/logger.ts to log the error.
 [x] For now, use a simple alert() to display a user-friendly message.
[x] Sub-action: Create src/api/apiClient.ts.
 [x] Import axios and API_BASE_URL from src/utils/constants.ts, and handleApiError from src/utils/errorHandler.ts.
 [x] Create an Axios instance with baseURL set to API_BASE_URL and Content-Type header set to application/json.
 [x] Add an Axios response interceptor that calls handleApiError for any failed requests and then Promise.reject(error).
Verification:
[x] In App.tsx, import apiClient and add a dummy apiClient.get('/non-existent-endpoint') call within a useEffect. Run npm run dev and confirm an alert appears for the error.
Phase 2: Data Models & Core API Clients 🔄

2.1. Define Core Data Models ✅

[x] Action: UPDATE existing TypeScript interfaces to match ACTUAL backend schemas. ✅

**COMPLETED**: Data models updated to match actual backend schemas:

[x] Sub-action: Update src/domain/models/common.ts.
 [x] CORRECTED IPriceHistoryEntry interface: { price: number, dateUpdated: string }
 [x] UPDATED ISaleDetails interface to match backend saleDetails schema:
   - paymentMethod: 'CASH' | 'Mobilepay' | 'BankTransfer'
   - actualSoldPrice: number (Decimal128 converted to number)
   - deliveryMethod: 'Sent' | 'Local Meetup'
   - source: 'Facebook' | 'DBA'
   - buyerFullName, buyerAddress: { streetName, postnr, city }
   - buyerPhoneNumber, buyerEmail, trackingNumber
   - dateSold: string (ISO date)

[x] Sub-action: Update src/domain/models/card.ts.
 [x] UPDATED ISet interface to match backend Sets schema (no changes needed - already correct)
 [x] UPDATED ICard interface to match backend Cards schema:
   - Updated psaGrades: { psa_1: number, psa_2: number, ..., psa_10: number }
 [x] UPDATED IPsaGradedCard interface to match backend PsaGradedCards schema:
   - grade: string (backend uses String type, not number)
   - Updated priceHistory structure to match backend
 [x] UPDATED IRawCard interface to match backend RawCards schema (already correct)

[x] Sub-action: Update src/domain/models/sealedProduct.ts.
 [x] CREATED ICardMarketReferenceProduct interface to match backend
 [x] UPDATED ISealedProduct interface to match backend SealedProducts schema:
   - Added SealedProductCategory enum with exact backend values
   - Fixed availability: number (not boolean)
   - Updated field names and structure to match backend
   - productId: ObjectId (required) - Reference to CardMarketReferenceProducts
   - category: String (enum) - Booster Box, ETB, etc.
   - setName: String (required)
   - name: String (required)
   - availability: Number (required)
   - cardMarketPrice: Decimal128 (required) -> convert to number
   - myPrice: Decimal128 (required) -> convert to number
   - priceHistory: [{ price: Decimal128, dateUpdated: Date }]
   - images: [String]
   - dateAdded: Date
   - sold: Boolean
   - saleDetails: ISaleDetails

[x] Sub-action: Create/Update src/domain/models/auction.ts.
 [x] UPDATE IAuctionItem interface to match backend schema (polymorphic):
   - itemId: ObjectId - Reference to any collection item
   - itemCategory: String - Type: "PsaGradedCard", "RawCard", "SealedProduct" 
   - sold: Boolean - Individual item sale status
   - salePrice: Decimal128 -> convert to number
 [x] UPDATE IAuction interface to match backend Auctions schema:
   - topText: String (required) - Auction description header
   - bottomText: String (required) - Auction description footer  
   - auctionDate: Date - Scheduled auction date
   - status: String (enum) - draft, active, sold, expired
   - generatedFacebookPost: String - Auto-generated marketing content
   - isActive: Boolean (legacy field)
   - items: [IAuctionItem] - Polymorphic item references
   - totalValue: Number - Calculated total value
   - soldValue: Number - Total sold value
   - createdAt: Date
   - updatedAt: Date

[x] Sub-action: Create src/domain/models/sale.ts.
 [x] CREATE ISalesSummary interface based on backend /api/sales/summary response:
   - totalRevenue: Number
   - totalProfit: Number  
   - averageMargin: Number
   - totalItems: Number
   - categoryBreakdown: { psaGradedCard: {count, revenue}, rawCard: {count, revenue}, sealedProduct: {count, revenue} }
 [x] CREATE ISalesGraphData interface based on backend /api/sales/graph-data:
   - date: String (ISO date)
   - revenue: Number 
   - profit: Number
 [x] CREATE ISale interface for individual sale records (aggregated from sold items):
   - id: String
   - itemCategory: String
   - itemName: String  
   - myPrice: Number
   - actualSoldPrice: Number
   - dateSold: String (ISO date)
   - source: String

Verification:
[x] Create dummy data objects that conform to the UPDATED interfaces
[x] Verify interfaces match the backend API response structure exactly
[x] Test with real backend data to ensure proper type safety
2.2. Implement CORRECTED API Clients (GET Operations) 

[x] Action: Implement API clients matching ACTUAL backend endpoints.

**BACKEND ENDPOINTS (Real API Structure):**

[x] Sub-action: Create src/api/cardsApi.ts with CORRECT backend endpoints:
 [x] Implement getCards(params?: { setId?: string, cardName?: string, baseName?: string }): Promise<ICard[]> 
   - Endpoint: GET /api/cards
   - Backend supports: setId, cardName, baseName parameters
 [x] Implement searchCards(query: string, params?: { limit?: number, setName?: string }): Promise<ICard[]>
   - Endpoint: GET /api/cards/search?q={query}
   - Backend returns: Search results with scoring, cached responses
 [x] Implement getCardSuggestions(query: string, limit?: number): Promise<string[]>
   - Endpoint: GET /api/cards/suggestions?q={query}&limit={limit}
   - Backend returns: Suggestion array with 10-minute cache
 [x] Implement getBestMatchCard(query: string): Promise<ICard | null>
   - Endpoint: GET /api/cards/search-best-match?q={query}
   - Backend returns: Best match with relevance scoring
 [x] Implement getCardById(id: string): Promise<ICard>
   - Endpoint: GET /api/cards/{id}
   - Backend returns: Single card with population

[x] Sub-action: Create src/api/setsApi.ts with CORRECT backend endpoints:
 [x] Implement getSets(): Promise<ISet[]>
   - Endpoint: GET /api/sets
   - Backend returns: Complete sets array
 [x] Implement getPaginatedSets(params?: { page?: number, limit?: number, year?: number, search?: string }): Promise<{ sets: ISet[], total: number }>
   - Endpoint: GET /api/sets/paginated
   - Backend supports: page, limit, year, search parameters
 [x] Implement getSetById(id: string): Promise<ISet>
   - Endpoint: GET /api/sets/{id}
   - Backend returns: Single set

[x] Sub-action: Create src/api/cardMarketRefProductsApi.ts (NEW - based on backend):
 [x] This is the REFERENCE data for sealed products from CardMarket
 [x] Implement getCardMarketRefProducts(params?: any): Promise<ICardMarketReferenceProduct[]>
   - Endpoint: GET /api/cardmarket-ref-products (need to verify exact endpoint)
   - Backend stores reference data with pricing info

[x] Sub-action: Create src/api/sealedProductsApi.ts with CORRECT backend endpoints:
 [x] Implement getSealedProducts(params?: { category?: string, setName?: string, sold?: boolean }): Promise<ISealedProduct[]>
   - Endpoint: GET /api/sealed-products
   - Backend supports: category, setName, sold filters
 [x] Implement getSealedProductById(id: string): Promise<ISealedProduct>
   - Endpoint: GET /api/sealed-products/{id}
   - Backend returns: Single sealed product

[x] Sub-action: Create src/api/collectionApi.ts with COLLECTION management endpoints:
 **PSA Graded Cards Collection:**
 [x] Implement getPsaGradedCards(params?: { grade?: string, setName?: string, cardName?: string, sold?: boolean }): Promise<IPsaGradedCard[]>
   - Endpoint: GET /api/psa-graded-cards
 [x] Implement getPsaGradedCardById(id: string): Promise<IPsaGradedCard>
   - Endpoint: GET /api/psa-graded-cards/{id}
 [x] Implement createPsaGradedCard(data: Partial<IPsaGradedCard>): Promise<IPsaGradedCard>
   - Endpoint: POST /api/psa-graded-cards
 [x] Implement updatePsaGradedCard(id: string, data: Partial<IPsaGradedCard>): Promise<IPsaGradedCard>
   - Endpoint: PUT /api/psa-graded-cards/{id}
 [x] Implement deletePsaGradedCard(id: string): Promise<void>
   - Endpoint: DELETE /api/psa-graded-cards/{id}
 [x] Implement markPsaGradedCardSold(id: string, saleDetails: ISaleDetails): Promise<IPsaGradedCard>
   - Endpoint: PATCH /api/psa-graded-cards/{id}/mark-sold

 **Raw Cards Collection:**
 [x] Implement getRawCards(params?: { condition?: string, setName?: string, cardName?: string, sold?: boolean }): Promise<IRawCard[]>
   - Endpoint: GET /api/raw-cards
 [x] Implement similar CRUD operations for raw cards (POST, PUT, DELETE, PATCH mark-sold)

 **Sealed Products Collection:**
 [x] Implement getSealedProductCollection(params?: { category?: string, setName?: string, sold?: boolean }): Promise<ISealedProduct[]>
   - Endpoint: GET /api/sealed-products  
 [x] Implement similar CRUD operations for sealed products (POST, PUT, DELETE, PATCH mark-sold)

[x] Sub-action: Create src/api/auctionsApi.ts with CORRECT backend endpoints:
 [x] Implement getAuctions(params?: { status?: string }): Promise<IAuction[]>
   - Endpoint: GET /api/auctions
 [x] Implement getAuctionById(id: string): Promise<IAuction>
   - Endpoint: GET /api/auctions/{id} (with populated items)
 [x] Implement createAuction(data: Partial<IAuction>): Promise<IAuction>
   - Endpoint: POST /api/auctions
 [x] Implement updateAuction(id: string, data: Partial<IAuction>): Promise<IAuction>
   - Endpoint: PUT /api/auctions/{id}
 [x] Implement deleteAuction(id: string): Promise<void>
   - Endpoint: DELETE /api/auctions/{id}
 [x] Implement addItemToAuction(id: string, itemData: { itemId: string, itemCategory: string }): Promise<IAuction>
   - Endpoint: POST /api/auctions/{id}/items
 [x] Implement removeItemFromAuction(id: string, itemId: string): Promise<IAuction>
   - Endpoint: DELETE /api/auctions/{id}/items
 [x] Implement markAuctionItemSold(id: string, saleData: any): Promise<IAuction>
   - Endpoint: PATCH /api/auctions/{id}/items/sold

[x] Sub-action: Create src/api/salesApi.ts with ANALYTICS endpoints:
 [x] Implement getSalesData(params?: { startDate?: string, endDate?: string, category?: string }): Promise<ISale[]>
   - Endpoint: GET /api/sales
 [x] Implement getSalesSummary(params?: { startDate?: string, endDate?: string }): Promise<ISalesSummary>
   - Endpoint: GET /api/sales/summary
 [x] Implement getSalesGraphData(params?: { startDate?: string, endDate?: string }): Promise<ISalesGraphData[]>
   - Endpoint: GET /api/sales/graph-data

[x] Sub-action: Create src/api/uploadApi.ts with IMAGE upload endpoints:
 [x] Implement uploadSingleImage(image: File): Promise<string>
   - Endpoint: POST /api/upload/image
 [x] Implement uploadMultipleImages(images: File[]): Promise<string[]>
   - Endpoint: POST /api/upload/images
 [x] Implement cleanupImages(imageUrls: string[]): Promise<void>
   - Endpoint: DELETE /api/upload/cleanup
 [x] Implement cleanupAllOrphanedImages(): Promise<void>
   - Endpoint: DELETE /api/upload/cleanup-all

[x] Sub-action: Ensure all API client functions use the apiClient instance from src/api/apiClient.ts.

**Response Structure (Backend Standard):**
```typescript
// Success response
{
  "success": true,
  "data": [...],
  "meta": {
    "cached"?: boolean,
    "cacheKey"?: string,
    "hitRate"?: number,
    "pagination"?: {
      "currentPage": number,
      "totalPages": number,
      "hasNextPage": boolean,
      "hasPrevPage": boolean
    }
  }
}

// Error response  
{
  "success": false,
  "status": "error",
  "message": "Human-readable error description",
  "details"?: "Additional technical details",
  "stack"?: "Stack trace (development only)"
}
```

Phase 3: Core Domain Services & Basic Hooks ✅

3.1. Implement Sales Analytics Domain Service ✅

[x] Action: Implement the core business logic for sales analytics.
[x] Sub-action: Create src/domain/services/SalesAnalyticsService.ts.
 [x] Implement calculateTotalProfit(sales: ISale[]): number.
 [x] Implement calculateAverageMargin(sales: ISale[]): number.
 [x] Implement processGraphData(rawData: any[]): ISalesGraphData[].
 [x] Add aggregation functions for category breakdown analysis.
 [x] Add time-series data processing for trend analysis.
Verification:
[x] Write unit tests for each function in src/domain/services/SalesAnalyticsService.test.ts.
[x] Test with sample data matching backend /api/sales response format.

3.2. Implement Collection Management Hook ✅

[x] Action: Implement the useCollection hook for comprehensive collection management.
[x] Sub-action: Create src/hooks/useCollection.ts.
 [x] Initialize useState for psaCards, rawCards, sealedProducts, soldItems, loading, and error.
 [x] Implement useEffect hook that fetches ALL collection data using CORRECTED collectionApi functions.
 [x] Add CRUD operations: addPsaCard, updatePsaCard, deletePsaCard, markPsaCardSold.
 [x] Add similar CRUD operations for rawCards and sealedProducts.
 [x] Implement optimistic updates for better UX.
 [x] Handle find-or-create logic for Sets/Cards (backend auto-creates references).
[x] Sub-action: Set loading state during fetches and handle errors properly.
Verification:
[x] Ensure the backend (SAFESPACE/pokemon-collection-backend) is running on PORT 3000.
[x] Write integration tests for useCollection in src/hooks/useCollection.test.ts.
[x] Verify loading state changes correctly.
[x] Verify collection states are populated with REAL backend data.
[x] Test CRUD operations against real backend.
[x] Test error handling and optimistic updates.

3.3. Implement Enhanced Search Hook (BACKEND-ALIGNED) ✅

[x] Action: Implement the useSearch hook with ACTUAL backend search capabilities.
[x] Sub-action: Create src/hooks/useSearch.ts.
 [x] Initialize useState for searchTerm, searchResults, suggestions, loading, searchMeta.
 [x] Implement handleSearch(query: string) that calls cardsApi.searchCards with caching.
 [x] Implement handleSuggestionSelect(suggestion: string) with hierarchical logic.
 [x] Implement useEffect with debounce for cardsApi.getCardSuggestions.
 [x] Add support for search metadata (cached, hitRate, queryTime from backend).
 [x] Add support for search filters (setName, category, year).
 [x] Implement getBestMatch for auto-fill functionality.
[x] Sub-action: Implement hierarchical search logic:
 [x] Set search filters Card/Product search based on selected set.
 [x] Product/Card selection auto-fills set information.
 [x] No simultaneous suggestions (single field focus).

Phase 4: Collection Management - View & Add (Initial UI) ✅

4.1. Develop Common UI Components ✅

[x] Action: Develop foundational, reusable UI components using Tailwind CSS.
[x] Sub-action: Create src/components/common/Button.tsx.
[x] Sub-action: Create src/components/common/Input.tsx.
[x] Sub-action: Create src/components/common/Select.tsx.
[x] Sub-action: Create src/components/common/LoadingSpinner.tsx.
Verification:
[x] Write unit tests for each component (e.g., src/components/common/Button.test.tsx).
[x] Create a temporary TestPage.tsx in src/pages/ and visually inspect them.
4.2. Implement Main Layout & Basic Routing ✅

[x] Action: Set up the main application layout and basic routing.
[x] Sub-action: Create src/components/layouts/MainLayout.tsx.
[x] Include a simple header and a main content area.
[x] Apply basic Tailwind styling.
[x] Sub-action: Open src/App.tsx.
[x] Wrap the main application content with MainLayout.
[x] Implement a simple routing mechanism using window.location.pathname and a switch statement.
[x] Define routes for /dashboard and /collection (initially rendering placeholder components).
Verification:
[x] Write unit tests for MainLayout in src/components/layouts/MainLayout.test.tsx.
[x] Run npm run dev, navigate to /dashboard and /collection, and confirm the layout and placeholder content.

4.3. Develop Collection Page Layout with Tabs ✅

[x] Action: Develop the Collection page layout, including tabbed navigation.
[x] Sub-action: Create src/pages/Collection.tsx.
[x] Sub-action: Implement tabbed navigation for "PSA Graded Cards", "Raw Cards", "Sealed Products", and "Sold Items".
[x] Use React state to manage the active tab.
[x] Apply Tailwind CSS for tab styling.
[x] Sub-action: Below the tabs, add placeholder div elements that will conditionally render content based on the active tab.
[x] Sub-action: Integrate the useCollection hook to manage the collection data and display loading/error states (using LoadingSpinner).
Verification:
[x] Write unit tests for Collection page in src/pages/Collection.test.tsx.
[x] Navigate to /collection and interact with the tabs.
4.4. Implement Initial Add/Edit Item Page Structure ✅

[x] Action: Create the initial page structure for adding/editing collection items.
[x] Sub-action: Create src/pages/AddEditItem.tsx.
[x] Sub-action: This page should conditionally render different forms (e.g., AddEditPsaCardForm, AddEditRawCardForm, AddEditSealedProductForm) based on a selected item type.
[x] Sub-action: Include a "Save" and "Cancel" button, using the Button common component.
[x] Sub-action: Add a route for /collection/add in src/App.tsx that renders AddEditItem.tsx.
Verification:
[x] Write unit tests for AddEditItem page in src/pages/AddEditItem.test.tsx.
[x] Navigate to /collection/add and visually inspect the page.
4.5. Develop Basic Image Uploader Component ✅

[x] Action: Develop the basic ImageUploader component.
[x] Sub-action: Create src/components/ImageUploader.tsx.
[x] Sub-action: Implement a file input (<input type="file" multiple>) and a drag-and-drop area.
[x] Sub-action: When files are selected or dropped, display local previews of the images using URL.createObjectURL.
[x] Sub-action: Allow users to remove individual image previews using a small "X" button on each preview.
[x] Sub-action: The component should accept an onImagesChange prop (callback with an array of File objects) and existingImageUrls: string[] prop.
Verification:
[x] Write unit tests for ImageUploader in src/components/ImageUploader.test.tsx.
[x] Integrate ImageUploader into src/pages/AddEditItem.tsx (temporarily) and test its functionality.
4.6. Implement Initial Add Card Form & API Integration

 Action: Implement the initial AddEditPsaCardForm and integrate it with the useCollection hook for adding new PSA graded cards.
 Sub-action: Create src/components/forms/AddEditPsaCardForm.tsx.
 Sub-action: Use react-hook-form to manage the form state for myPrice, grade, dateAdded, and integrate the ImageUploader component.
 Sub-action: Implement the form submission handler. On submit, call useCollection.addPsaCard with the form data and the uploaded image files.
 Sub-action: After successful submission, navigate the user back to the /collection page.
 Sub-action: Update src/pages/AddEditItem.tsx to render AddEditPsaCardForm when the item type is "PSA Graded Card".
Verification:
Ensure the backend (SAFESPACE/pokemon-collection-backend) is running.
Write integration tests for AddEditPsaCardForm in src/components/forms/AddEditPsaCardForm.test.tsx.
Verify successful card creation and redirection.
Phase 5: Collection Management - Smart Search & Auto-fill

5.1. Integrate Smart Search into Add/Edit Card Forms

 Action: Integrate the smart search functionality for Set Name and Card Name into AddEditPsaCardForm and AddEditRawCardForm.
 Sub-action: Open src/components/forms/AddEditPsaCardForm.tsx (and AddEditRawCardForm.tsx).
 Sub-action: Integrate useSearch hook.
 Sub-action: Add input fields for "Set Name" and "Card Name".
 Sub-action: Implement onChange handlers for these inputs to update searchTerm in useSearch.
 Sub-action: Display auto-completion suggestions from useSearch.suggestions in a dropdown/autocomplete list.
 Sub-action: On selecting a suggestion for "Set Name", filter subsequent "Card Name" searches to only show cards within that set.
 Sub-action: On selecting a suggestion for "Card Name", automatically call cardsApi.getBestMatchCard to fetch full card details.
Verification:
Ensure the backend (SAFESPACE/pokemon-collection-backend) is running.
Write integration tests for AddEditPsaCardForm to verify smart search behavior.
5.2. Implement Auto-fill Logic for Card Information

 Action: Implement the auto-fill logic for card information in AddEditPsaCardForm and AddEditRawCardForm.
 Sub-action: Open src/components/forms/AddEditPsaCardForm.tsx (and AddEditRawCardForm.tsx).
 Sub-action: When cardsApi.getBestMatchCard returns a card object, automatically populate form fields like pokemonNumber, baseName, variety, and relevant psaGrades.
 Sub-action: Ensure myPrice and grade/condition fields remain user-editable and are not auto-filled.
 Sub-action: Update the form's internal state (using react-hook-form's setValue) with the auto-filled data.
Verification:
Ensure the backend (SAFESPACE/pokemon-collection-backend) is running.
Write integration tests for AddEditPsaCardForm to verify auto-fill behavior.
Phase 6: Collection Management - Update, Delete, Price History

6.1. Implement Collection Item Update & Delete API Calls

 Action: Implement the API calls for updating and deleting collection items.
 Sub-action: Open src/api/collectionApi.ts.
 Implement updatePsaGradedCard(id: string, data: Partial<IPsaGradedCard>): Promise<IPsaGradedCard>.
 Implement deletePsaGradedCard(id: string): Promise<void>.
 Implement similar update and delete functions for IRawCard and ISealedProductCollectionItem.
 Sub-action: Open src/hooks/useCollection.ts.
 Add updatePsaCard(id: string, data: Partial<IPsaGradedCard>) function that calls collectionApi.updatePsaGradedCard and updates the local state.
 Add deletePsaCard(id: string) function that calls collectionApi.deletePsaGradedCard and removes the item from local state.
 Add similar update and delete functions for raw cards and sealed products.
Verification:
Ensure the backend (SAFESPACE/pokemon-collection-backend) is running.
Write integration tests for useCollection to verify update and delete operations.
6.2. Develop Price History Display & Update Component

 Action: Develop the PriceHistoryDisplay component and integrate its update functionality.
 Sub-action: Create src/components/PriceHistoryDisplay.tsx.
 Sub-action: This component should accept priceHistory: IPriceHistoryEntry[] as a prop and display it as a list.
 Sub-action: Include an input field and a "Update Price" button.
 Sub-action: The component should accept an onPriceUpdate prop (callback with the new price and current date).
Verification:
Write unit tests for PriceHistoryDisplay in src/components/PriceHistoryDisplay.test.tsx.
6.3. Integrate Price History into Add/Edit Item Forms

 Action: Integrate the PriceHistoryDisplay component into the AddEditPsaCardForm (and other item forms).
 Sub-action: Open src/components/forms/AddEditPsaCardForm.tsx (and AddEditRawCardForm.tsx, AddEditSealedProductForm.tsx).
 Sub-action: Integrate the PriceHistoryDisplay component, passing the item's priceHistory prop.
 Sub-action: Implement the onPriceUpdate callback for PriceHistoryDisplay. This callback should update the myPrice field in the form's state and, when the form is saved, ensure this new price (and the corresponding priceHistory entry) is sent to the backend.
Verification:
Ensure the backend (SAFESPACE/pokemon-collection-backend) is running.
Write integration tests for AddEditPsaCardForm to verify price history updates.
Phase 7: Collection Management - Mark as Sold

7.1. Develop Mark as Sold Form Component

 Action: Develop the MarkSoldForm component.
 Sub-action: Create src/components/forms/MarkSoldForm.tsx.
 Sub-action: Use react-hook-form to manage the form state for saleDetails.
 Sub-action: Implement dropdowns/radio buttons for enum fields using Select and constants.ts enums.
 Sub-action: Implement a DatePicker component for dateSold.
 Sub-action: Implement conditional rendering for buyer information and tracking number fields based on deliveryMethod being 'Sent'.
 Sub-action: The component should accept an onSubmit prop and onCancel prop.
Verification:
Write unit tests for MarkSoldForm in src/components/forms/MarkSoldForm.test.tsx.
7.2. Integrate Mark as Sold Functionality

 Action: Integrate the MarkSoldForm and the markPsaGradedCardSold functionality into the collection management flow.
 Sub-action: Open src/hooks/useCollection.ts.
 Implement markPsaGradedCardSold(id: string, saleDetails: ISaleDetails) that calls collectionApi.markPsaGradedCardSold and updates the local state to move the item to the soldItems array.
 Implement similar functions for raw cards and sealed products.
 Sub-action: Open src/pages/Collection.tsx.
 Add a "Mark as Sold" button to each item in the collection list.
 When clicked, open a Modal component that renders the MarkSoldForm.
 Pass the onSubmit and onCancel callbacks to MarkSoldForm.
 Ensure the "Sold Items" tab in Collection.tsx correctly displays items where sold: true.
Verification:
Ensure the backend (SAFESPACE/pokemon-collection-backend) is running.
Write integration tests for Collection page to verify mark as sold functionality.
Phase 8: Search & Discovery

8.1. Implement Global Search Bar & Results Page

 Action: Implement the global search bar and its corresponding results page.
 Sub-action: Open src/components/layouts/MainLayout.tsx.
 Add a global search input field.
 Integrate useSearch hook's searchTerm and handleSearch.
 Display useSearch.suggestions in an autocomplete dropdown.
 Sub-action: Create src/pages/Search.tsx.
 Parse the search query from the URL (e.g., ?q=charizard).
 Call useSearch.searchCards with the query and any other parameters.
 Display useSearch.searchResults in a paginated list, including score, psaPopularity, and exactMatch.
 Add basic UI for refinement filters and sorting options.
 Sub-action: Update src/App.tsx to include a route for /search.
Verification:
Ensure the backend (SAFESPACE/pokemon-collection-backend) is running.
Write integration tests for Search page to verify global search functionality.
8.2. Implement Dedicated Set Search Page

 Action: Implement the dedicated Set Search page.
 Sub-action: Create src/pages/SetSearch.tsx.
 Sub-action: Implement a search input for set names and a filter/input for year.
 Sub-action: Use setsApi.getPaginatedSets to fetch and display paginated set results.
 Sub-action: Add a route for /sets in src/App.tsx.
Verification:
Ensure the backend (SAFESPACE/pokemon-collection-backend) is running.
Write integration tests for SetSearch page.
8.3. Implement Sealed Products Subcategory Search

 Action: Implement the dedicated Sealed Products Subcategory Search functionality.
 Sub-action: Create src/pages/SealedProductSearch.tsx.
 Sub-action: Implement a dropdown or filter options for category.
 Sub-action: Use sealedProductsApi.searchSealedProductsByCategory to fetch and display filtered sealed product results.
 Sub-action: Add a route for /sealed-products-search in src/App.tsx.
Verification:
Ensure the backend (SAFESPACE/pokemon-collection-backend) is running.
Write integration tests for SealedProductSearch page.
Phase 9: Auction Management

9.1. Implement Auction List & Detail Pages

 Action: Implement the Auction List and Auction Detail pages.
 Sub-action: Create src/pages/Auctions.tsx.
 Display a list of auctions using useAuction hook's auctions state.
 Implement filters by status.
 Each list item should link to an AuctionDetail page.
 Sub-action: Create src/pages/AuctionDetail.tsx.
 Fetch a single auction by ID using useAuction.fetchAuctionById.
 Display auction details: topText, bottomText, auctionDate.
 List items included in the auction, showing itemCategory, salePrice, sold status.
 Display totalValue and soldValue.
 Sub-action: Update src/App.tsx to include routes for /auctions and /auctions/:id.
Verification:
Ensure the backend (SAFESPACE/pokemon-collection-backend) is running.
Write integration tests for Auctions and AuctionDetail pages.
9.2. Implement Add Item to Auction Modal

 Action: Implement the "Add Item to Auction" modal functionality.
 Sub-action: In src/pages/AuctionDetail.tsx, add a "Add Item to Auction" button.
 Sub-action: When clicked, open a Modal component.
 Sub-action: Inside the modal, implement a search/filter interface that allows users to browse their existing collection items.
 Sub-action: Allow users to select one or more items.
 Sub-action: On confirmation, call useAuction.addItemToAuction with the auctionId and the selected item's itemId and itemCategory.
Verification:
Ensure the backend (SAFESPACE/pokemon-collection-backend) is running.
Write integration tests for AuctionDetail page to verify adding items to auction.
Phase 10: Auction Management - Export Features

10.1. Implement Facebook Post Generation for Auctions

 Action: Implement the "Generate Facebook Post" functionality for auctions.
 Sub-action: In src/pages/AuctionDetail.tsx, add a "Generate Facebook Post" button.
 Sub-action: When clicked, call useAuction.generateFacebookPost(auctionId).
 Sub-action: Display the returned text in a read-only textarea element.
 Sub-action: Add a prominent "Copy to Clipboard" button next to the textarea.
 Sub-action: Implement the "Copy to Clipboard" functionality using document.execCommand('copy').
Verification:
Ensure the backend (SAFESPACE/pokemon-collection-backend) is running.
Write integration tests for AuctionDetail page to verify Facebook post generation.
10.2. Implement Auction-Specific Image Zip & Text File Exports

 Action: Implement the auction-specific image zipping and text file export functionalities.
 Sub-action: In src/pages/AuctionDetail.tsx, add two new buttons: "Zip All Images for Auction" and "Generate Auction Text File".
 Sub-action: For "Zip All Images for Auction":
 On click, call exportApi.zipAuctionImages(auctionId).
 Initiate a file download of the returned Blob.
 Sub-action: For "Generate Auction Text File":
 On click, call exportApi.getAuctionFacebookTextFile(auctionId).
 Initiate a file download of the returned Blob as a .txt file.
Verification:
Ensure the backend (SAFESPACE/pokemon-collection-backend) is running.
Write integration tests for AuctionDetail page to verify image zip and text file exports.
Phase 11: Sales Analytics & Financial Tracking

11.1. Implement Sales Analytics Page & Summary Display

 Action: Implement the Sales Analytics page and display summary metrics.
 Sub-action: Create src/pages/SalesAnalytics.tsx.
 Sub-action: Integrate useSalesAnalytics hook.
 Sub-action: Display summary metrics: totalRevenue, calculatedTotalProfit, averageMargin, totalItems sold.
 Sub-action: Add a DatePicker component (or range picker) for a "Date Range Selector".
 Sub-action: Add a route for /sales-analytics in src/App.tsx.
Verification:
Ensure the backend (SAFESPACE/pokemon-collection-backend) is running.
Write integration tests for SalesAnalytics page.
11.2. Integrate Charts for Sales Analytics

 Action: Integrate charting components into the Sales Analytics page.
 Sub-action: Open src/pages/SalesAnalytics.tsx.
 Sub-action: Configure Recharts components to display:
 "Category Breakdown Chart" (Pie or Bar chart).
 "Time-Series Graph" (Line chart).
 Sub-action: Ensure charts dynamically update based on the selected date range.
Verification:
Ensure the backend (SAFESPACE/pokemon-collection-backend) is running.
Write integration tests for SalesAnalytics page to verify chart rendering.
11.3. Implement Detailed Sales List

 Action: Implement the detailed sales list on the Sales Analytics page.
 Sub-action: Open src/pages/SalesAnalytics.tsx.
 Sub-action: Render a SalesTable component that displays individual sales transactions.
 Sub-action: Include columns like itemName, itemCategory, myPrice, actualSoldPrice, calculatedProfit, dateSold, source.
 Sub-action: Ensure the table also updates based on the selected date range and any category filters.
Verification:
Ensure the backend (SAFESPACE/pokemon-collection-backend) is running.
Write integration tests for SalesAnalytics page to verify sales table rendering.
Phase 12: General Refinements & Exports

12.1. Refine Global Error Handling & Toast Notifications

 Action: Refine the global error handling and integrate a toast notification system.
 Sub-action: Install a toast notification library (e.g., npm install react-hot-toast).
 Sub-action: Open src/utils/errorHandler.ts.
 Replace the alert() call with a toast notification.
 Sub-action: Ensure the ToastNotification component is rendered at the root of your application.
 Sub-action: Implement success toasts for successful API operations.
Verification:
Ensure the backend (SAFESPACE/pokemon-collection-backend) is running.
Write integration tests to verify toast notifications for errors and successes.
12.2. Implement Collection-Specific Facebook Text File Export

 Action: Implement the "Generate Facebook Text File for Collection Items" functionality.
 Sub-action: In src/pages/Collection.tsx (or an "Export" sub-menu), add a button "Generate Facebook Text File for Collection Items".
 Sub-action: When clicked, present a modal or selection interface allowing the user to select specific collection items, or confirm to generate for all.
 Sub-action: Call exportApi.getCollectionFacebookTextFile(selectedItemIds).
 Sub-action: Initiate a file download of the returned Blob as a .txt file.
Verification:
Ensure the backend (SAFESPACE/pokemon-collection-backend) is running.
Write integration tests for Collection page to verify text file export.
12.3. Finalize README.md

[ ] Action: Finalize the README.md file for the project.
[ ] Sub-action: Open README.md at the project root.
[ ] Sub-action: Add a clear project title and a brief description.
[ ] Sub-action: Include a "Setup" section with detailed instructions for:
 [ ] Cloning the repository.
 [ ] Installing dependencies (npm install).
 [ ] Starting the development server (npm run dev).
 [ ] **CRITICAL**: Backend (SAFESPACE/pokemon-collection-backend) must be running on PORT 3000.
 [ ] Provide instructions on how to start the backend: cd ../pokemon-collection-backend && npm run dev.
[ ] Sub-action: Add a "Testing" section outlining how to run unit, integration, and E2E tests.
[ ] Sub-action: Include a "Git Workflow" section summarizing the branching strategy and commit guidelines.
Verification:
[ ] Read through the README.md to ensure clarity, accuracy, and completeness.

---

## 🚨 CRITICAL NEXT STEPS SUMMARY

**IMMEDIATE PRIORITY TASKS (Required before continuing):**

1. **FIX DATA MODELS** (Phase 2.1):
   - Update all interfaces in `src/domain/models/` to match ACTUAL backend schemas
   - Fix ISaleDetails structure to match backend saleDetails schema
   - Add missing ICardMarketReferenceProduct interface
   - Correct PSA grades structure (psa_1, psa_2, etc.)

2. **IMPLEMENT CORRECTED API CLIENTS** (Phase 2.2):
   - Create all missing API client files with CORRECT endpoints
   - Implement proper response handling for backend's success/error format
   - Add collectionApi.ts for CRUD operations on collection items
   - Test ALL API functions against REAL backend on PORT 3000

3. **UPDATE CONSTANTS & ENUMS**:
   - ✅ API_BASE_URL already corrected to localhost:3000
   - Verify PaymentMethod, DeliveryMethod, Source enums match backend validation

**ARCHITECTURE ALIGNMENT:**
- Backend uses Express.js 5.1.0 + MongoDB/Mongoose 8.16.1
- Decimal128 prices converted to numbers in frontend
- Advanced search with Fuse.js + MongoDB text search + 5-minute caching
- Polymorphic auction system supporting PSA/Raw cards and sealed products
- Comprehensive error handling with structured responses

**DEVELOPMENT WORKFLOW:**
1. Start backend: `cd ../pokemon-collection-backend && npm run dev` (PORT 3000)
2. Start frontend: `npm run dev` (PORT 5173)
3. Run integration tests against REAL backend (no mocking allowed)
4. Use actual backend responses to verify interface accuracy

**TESTING STRATEGY:**
- Unit tests: Domain services, pure components, utility functions
- Integration tests: Hooks with API clients, components with hooks (REAL API calls)
- E2E tests: Full user flows with real backend interaction
- NO MOCKING for API interactions per project requirements

This TODO list has been updated to reflect the ACTUAL backend structure. Proceed with Phase 2.1 (data model corrections) before advancing to subsequent phases.
