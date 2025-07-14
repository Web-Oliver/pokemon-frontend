Pokemon Collection Frontend - Comprehensive To-Do List

This is the comprehensive To-Do list for the Pokemon Collection Frontend project. The frontend is located at SAFESPACE/pokemon-collection-frontend, and it interfaces with the backend located at SAFESPACE/pokemon-collection-backend. Each item represents a completed step in the development process, derived from the detailed build blueprint.

Phase 1: Foundational Setup & Core Utilities

1.1. Project Initialization & Basic Setup

[x] Action: Initialize a new React project.
[x] Sub-action: Open your terminal.
[x] Sub-action: Choose a project directory (e.g., cd SAFESPACE/).
[x] Sub-action: Run npm create vite@latest pokemon-collection-frontend -- --template react-ts.
[x] Sub-action: Navigate into the new project directory: cd pokemon-collection-frontend.
Verification:
[x] Run npm install to install initial dependencies.
[x] Run npm run dev (for Vite) or npm start (for CRA).
[x] Open your browser to http://localhost:5173 (or http://localhost:3000) and confirm the default React app is displayed.
1.2. Tailwind CSS Integration

[x] Action: Integrate Tailwind CSS into the project.
[x] Sub-action: Install Tailwind CSS, PostCSS, and Autoprefixer as development dependencies: npm install -D tailwindcss postcss autoprefixer.
[x] Sub-action: Generate the tailwind.config.js and postcss.config.js configuration files: npx tailwindcss init -p.
[x] Sub-action: Configure tailwind.config.js to scan for Tailwind classes in all relevant HTML, JS, JSX, TS, and TSX files within the src/ directory.
[x] Sub-action: Add the Tailwind CSS directives (@tailwind base; @tailwind components; @tailwind utilities;) to src/index.css (or src/App.css).
[x] Sub-action: Apply a simple Tailwind class (e.g., text-3xl font-bold underline text-blue-500) to an existing element in src/App.tsx to visually confirm integration.
Verification:
[x] Run npm run dev and observe the styling in the browser.
1.3. Install Core Frontend Libraries

[x] Action: Integrate the essential frontend libraries into the project.
[x] Sub-action: Install zustand for state management: npm install zustand.
[x] Sub-action: Install recharts for charting/visualization: npm install recharts.
[x] Sub-action: Install react-hook-form for form management: npm install react-hook-form.
[x] Sub-action: Install axios as the HTTP client: npm install axios.
[x] Sub-action: Install lucide-react for icons: npm install lucide-react.
Verification:
[x] Check package.json for correct entries.
1.4. Establish Initial Directory Structure

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
1.5. Implement Global Utilities - Constants & Logger

[x] Action: Develop the initial global utility modules for constants and logging.
[x] Sub-action: Create src/utils/constants.ts.
 [x] Define API_BASE_URL as a string pointing to http://localhost:3001/api. Add a comment indicating the backend location: SAFESPACE/pokemon-collection-backend.
 [x] Define TypeScript enums for PaymentMethod, DeliveryMethod, and Source with their respective string values.
[x] Sub-action: Create src/utils/logger.ts.
 [x] Implement log and error functions that wrap console.log and console.error respectively.
 [x] Ensure log only outputs in non-production environments.
Verification:
[x] Import log into App.tsx and add a log('App loaded!');. Run npm run dev and check the browser console.
1.6. Implement Global Utilities - Error Handler & API Client

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
Phase 2: Data Models & Core API Clients

2.1. Define Core Data Models

 Action: Define the essential TypeScript interfaces for your application's data models.
 Sub-action: Create src/domain/models/common.ts.
 Define IPriceHistoryEntry interface (e.g., date: string; price: number;).
 Define ISaleDetails interface to match the backend schema (including nested buyerAddress).
 Sub-action: Create src/domain/models/card.ts.
 Define ICard interface (for reference cards, e.g., id, cardName, setName, pokemonNumber, baseName, variety, psaGrades?).
 Define ISet interface (e.g., id, setName, year).
 Define IPsaGradedCard interface (for collection items, including cardId referencing ICard, myPrice, grade, dateAdded, images: string[], priceHistory: IPriceHistoryEntry[], sold: boolean, saleDetails?: ISaleDetails).
 Define IRawCard interface (similar to IPsaGradedCard but with condition instead of grade).
 Sub-action: Create src/domain/models/sealedProduct.ts.
 Define ISealedProduct interface (for reference products, e.g., id, productName, category).
 Define ISealedProductCollectionItem interface (for collection items, including productId referencing ISealedProduct, myPrice, dateAdded, images: string[], priceHistory: IPriceHistoryEntry[], sold: boolean, saleDetails?: ISaleDetails).
 Sub-action: Create src/domain/models/auction.ts.
 Define IAuctionItem interface (polymorphic: itemId: string, itemCategory: 'psaGradedCard' | 'rawCard' | 'sealedProduct', salePrice?: number, sold?: boolean).
 Define IAuction interface (e.g., id, topText, bottomText, auctionDate, items: IAuctionItem[], totalValue, soldValue).
 Sub-action: Create src/domain/models/sale.ts.
 Define ISalesSummary interface (e.g., totalRevenue, calculatedTotalProfit, averageMargin, totalItemsSold).
 Define ISalesGraphData interface (e.g., date: string, revenue: number, profit: number).
 Define ISale interface (for individual sale records, including id, itemCategory, itemName, myPrice, actualSoldPrice, dateSold, source).
Verification:
Create dummy data objects that conform to these interfaces to ensure they are correctly typed.
2.2. Implement Basic API Clients (GET Operations)

 Action: Implement the initial GET operations for the core API clients.
 Sub-action: Open src/api/cardsApi.ts.
 Implement getCards(params?: any): Promise<ICard[]> to fetch all reference cards.
 Implement searchCards(query: string, params?: any): Promise<ICard[]> for general card search.
 Implement getCardSuggestions(query: string, limit?: number): Promise<string[]> for autocomplete.
 Implement getBestMatchCard(query: string): Promise<ICard | null> for auto-fill during item creation.
 Sub-action: Open src/api/setsApi.ts.
 Implement getSets(): Promise<ISet[]> to fetch all reference sets.
 Implement getPaginatedSets(params?: any): Promise<{ sets: ISet[], total: number }> for paginated set search.
 Sub-action: Open src/api/sealedProductsApi.ts.
 Implement getSealedProducts(params?: any): Promise<ISealedProduct[]> to fetch all reference sealed products.
 Implement searchSealedProductsByCategory(category: string, params?: any): Promise<ISealedProduct[]> for category-specific search.
 Sub-action: Ensure all API client functions use the apiClient instance from src/api/apiClient.ts.
Verification:
Ensure the backend (SAFESPACE/pokemon-collection-backend) is running.
Write integration tests for getCards, searchCards, getCardSuggestions, getBestMatchCard in src/api/cardsApi.test.ts.
Verify that these functions successfully fetch data from the real backend and return data conforming to the defined interfaces.
Phase 3: Core Domain Services & Basic Hooks

3.1. Implement Sales Analytics Domain Service

 Action: Implement the core business logic for sales analytics.
 Sub-action: Create src/domain/services/SalesAnalyticsService.ts.
 Sub-action: Implement calculateTotalProfit(sales: ISale[]): number.
 Sub-action: Implement calculateAverageMargin(sales: ISale[]): number.
 Sub-action: Implement processGraphData(rawData: any[]): ISalesGraphData[].
Verification:
Write unit tests for each function in src/domain/services/SalesAnalyticsService.test.ts.
3.2. Implement Basic Collection Hook (Fetch Only)

 Action: Implement the initial version of the useCollection hook for fetching collection data.
 Sub-action: Create src/hooks/useCollection.ts.
 Sub-action: Initialize useState for psaCards, rawCards, sealedProducts, soldItems, loading, and error.
 Sub-action: Implement a useEffect hook that, on component mount, fetches all PSA graded cards, raw cards, and sealed products using the respective collectionApi GET functions.
 Sub-action: Set loading state to true during fetches and false afterwards. Handle any errors by setting the error state.
Verification:
Ensure the backend (SAFESPACE/pokemon-collection-backend) is running.
Write integration tests for useCollection in src/hooks/useCollection.test.ts.
Verify that loading state changes correctly.
Verify that collection states are populated with data from the real backend.
Test error handling.
3.3. Implement Basic Search Hook (Term Management)

 Action: Implement the initial version of the useSearch hook for managing search terms and basic suggestions.
 Sub-action: Create src/hooks/useSearch.ts.
 Sub-action: Initialize useState for searchTerm, searchResults, suggestions, and loading.
 Sub-action: Implement a useCallback function handleSearch(query: string) that updates searchTerm and triggers a search.
 Sub-action: Implement a useCallback function handleSuggestionSelect(suggestion: string) that updates searchTerm and triggers a search.
 Sub-action: Implement a useEffect with a debounce mechanism that calls cardsApi.getCardSuggestions whenever searchTerm changes (after debounce delay). Update the suggestions state.
Verification:
Write unit tests for useSearch in src/hooks/useSearch.test.ts.
Verify searchTerm updates correctly.
Test the debounce logic.
Phase 4: Collection Management - View & Add (Initial UI)

4.1. Develop Common UI Components

 Action: Develop foundational, reusable UI components using Tailwind CSS.
 Sub-action: Create src/components/common/Button.tsx.
 Sub-action: Create src/components/common/Input.tsx.
 Sub-action: Create src/components/common/Select.tsx.
 Sub-action: Create src/components/common/LoadingSpinner.tsx.
Verification:
Write unit tests for each component (e.g., src/components/common/Button.test.tsx).
Create a temporary TestPage.tsx in src/pages/ and visually inspect them.
4.2. Implement Main Layout & Basic Routing

 Action: Set up the main application layout and basic routing.
 Sub-action: Create src/components/layouts/MainLayout.tsx.
 Include a simple header and a main content area.
 Apply basic Tailwind styling.
 Sub-action: Open src/App.tsx.
 Wrap the main application content with MainLayout.
 Implement a simple routing mechanism using window.location.pathname and a switch statement.
 Define routes for /dashboard and /collection (initially rendering placeholder components).
Verification:
Write unit tests for MainLayout in src/components/layouts/MainLayout.test.tsx.
Run npm run dev, navigate to /dashboard and /collection, and confirm the layout and placeholder content.
4.3. Develop Collection Page Layout with Tabs

 Action: Develop the Collection page layout, including tabbed navigation.
 Sub-action: Create src/pages/Collection.tsx.
 Sub-action: Implement tabbed navigation for "PSA Graded Cards", "Raw Cards", "Sealed Products", and "Sold Items".
 Use React state to manage the active tab.
 Apply Tailwind CSS for tab styling.
 Sub-action: Below the tabs, add placeholder div elements that will conditionally render content based on the active tab.
 Sub-action: Integrate the useCollection hook to manage the collection data and display loading/error states (using LoadingSpinner).
Verification:
Write unit tests for Collection page in src/pages/Collection.test.tsx.
Navigate to /collection and interact with the tabs.
4.4. Implement Initial Add/Edit Item Page Structure

 Action: Create the initial page structure for adding/editing collection items.
 Sub-action: Create src/pages/AddEditItem.tsx.
 Sub-action: This page should conditionally render different forms (e.g., AddEditPsaCardForm, AddEditRawCardForm, AddEditSealedProductForm) based on a selected item type.
 Sub-action: Include a "Save" and "Cancel" button, using the Button common component.
 Sub-action: Add a route for /collection/add in src/App.tsx that renders AddEditItem.tsx.
Verification:
Write unit tests for AddEditItem page in src/pages/AddEditItem.test.tsx.
Navigate to /collection/add and visually inspect the page.
4.5. Develop Basic Image Uploader Component

 Action: Develop the basic ImageUploader component.
 Sub-action: Create src/components/ImageUploader.tsx.
 Sub-action: Implement a file input (<input type="file" multiple>) and a drag-and-drop area.
 Sub-action: When files are selected or dropped, display local previews of the images using URL.createObjectURL.
 Sub-action: Allow users to remove individual image previews using a small "X" button on each preview.
 Sub-action: The component should accept an onImagesChange prop (callback with an array of File objects) and existingImageUrls: string[] prop.
Verification:
Write unit tests for ImageUploader in src/components/ImageUploader.test.tsx.
Integrate ImageUploader into src/pages/AddEditItem.tsx (temporarily) and test its functionality.
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

 Action: Finalize the README.md file for the project.
 Sub-action: Open README.md at the project root.
 Sub-action: Add a clear project title and a brief description.
 Sub-action: Include a "Setup" section with detailed instructions for:
 Cloning the repository.
 Installing dependencies (npm install).
 Starting the development server (npm run dev).
 Crucially, mention that the backend (SAFESPACE/pokemon-collection-backend) must be running for the frontend to function correctly. Provide instructions on how to start the backend.
 Sub-action: Add a "Testing" section outlining how to run unit, integration, and E2E tests.
 Sub-action: Include a "Git Workflow" section summarizing the branching strategy and commit guidelines.
Verification:
Read through the README.md to ensure clarity, accuracy, and completeness.
