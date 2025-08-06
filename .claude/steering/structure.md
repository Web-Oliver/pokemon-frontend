# Project Structure - Pokemon Collection Frontend

## 📁 Directory Organization

```
src/
├── api/                    # Layer 1: Raw API client modules
│   ├── unifiedApiClient.ts # Base HTTP client configuration
│   ├── cardsApi.ts        # Card-specific API calls
│   ├── auctionsApi.ts     # Auction management APIs
│   └── salesApi.ts        # Sales and analytics APIs
├── utils/                  # Layer 1: Global utilities
│   ├── constants.ts       # Application-wide constants
│   ├── logger.ts          # Logging utilities
│   ├── errorHandler.ts    # Error handling utilities
│   └── formatting.ts      # Data formatting helpers
├── config/                 # Layer 1: Configuration
│   └── cacheConfig.ts     # Caching configuration
├── hooks/                  # Layer 2: Custom React hooks
│   ├── search/            # Search-related hooks
│   ├── useCollectionState.ts
│   └── useSalesAnalytics.ts
├── domain/                 # Layer 2: Business logic
│   ├── models/            # TypeScript data models
│   │   ├── card.ts
│   │   ├── auction.ts
│   │   └── sale.ts
│   └── services/          # Pure business logic
│       └── SalesAnalyticsService.ts
├── services/               # Layer 2: API service implementations
│   ├── CollectionApiService.ts
│   ├── SearchApiService.ts
│   └── ServiceRegistry.ts
├── interfaces/             # Layer 2: API contracts
│   └── api/
│       ├── ICollectionApiService.ts
│       └── ISearchApiService.ts
├── components/             # Layer 3: UI components
│   ├── common/            # Generic reusable components
│   │   ├── Button.tsx
│   │   ├── Modal.tsx
│   │   └── LoadingSpinner.tsx
│   ├── forms/             # Form-specific components
│   │   ├── AddEditPsaCardForm.tsx
│   │   └── fields/        # Form field components
│   ├── lists/             # Collection display components
│   │   ├── CollectionItemCard.tsx
│   │   └── VirtualizedItemGrid.tsx
│   ├── layouts/           # Layout components
│   │   └── MainLayout.tsx
│   └── search/            # Search UI components
│       └── EnhancedAutocomplete.tsx
└── pages/                  # Layer 4: Application screens
    ├── Dashboard.tsx
    ├── Collection.tsx
    ├── Auctions.tsx
    └── SalesAnalytics.tsx
```

## 🏗️ Architectural Patterns

### Layered Dependency Flow

```
Layer 4 (Pages)
    ↓ depends on
Layer 3 (Components)
    ↓ depends on
Layer 2 (Services/Hooks/Domain)
    ↓ depends on
Layer 1 (Core/API/Utils)
```

### Component Organization

- **Generic First**: Most reusable components in `components/common/`
- **Feature Grouping**: Related components grouped by functionality
- **Index Exports**: Clean imports through `index.ts` files
- **Single Purpose**: Each component file has one clear responsibility

## 📋 Naming Conventions

### Files & Directories

- **Components**: PascalCase (e.g., `CollectionItemCard.tsx`)
- **Hooks**: camelCase with "use" prefix (e.g., `useCollectionState.ts`)
- **Services**: PascalCase with "Service" suffix (e.g., `CollectionApiService.ts`)
- **Utilities**: camelCase (e.g., `errorHandler.ts`)
- **Types/Models**: PascalCase (e.g., `Card.ts`, `Auction.ts`)
- **Directories**: kebab-case or camelCase (e.g., `forms/`, `searchApi/`)

### Code Conventions

- **Interfaces**: PascalCase with "I" prefix (e.g., `ICollectionApiService`)
- **Types**: PascalCase (e.g., `CollectionItem`, `SearchResult`)
- **Constants**: SCREAMING_SNAKE_CASE (e.g., `API_BASE_URL`)
- **Functions**: camelCase (e.g., `fetchCollectionItems`)
- **Variables**: camelCase (e.g., `collectionItems`)

## 🔄 Feature Development Process

### Branch Strategy

- **main**: Production-ready code
- **develop**: Integration branch for features
- **feature/<name>**: New feature development (e.g., `feature/auction-export`)
- **bugfix/<description>**: Bug fixes (e.g., `bugfix/search-autocomplete`)

### Feature Implementation Flow

1. **Requirements**: Define user stories and acceptance criteria
2. **Design**: Create technical design following layered architecture
3. **Tasks**: Break down into atomic, layer-respecting tasks
4. **Implementation**: Build from Layer 1 → Layer 4
5. **Testing**: Real backend integration tests required
6. **Integration**: Merge through develop branch

### New Feature Structure

When adding new features, follow this organization:

```
# Example: Adding new "Price History" feature
src/
├── api/priceHistoryApi.ts          # Layer 1: API calls
├── hooks/usePriceHistory.ts        # Layer 2: Business logic
├── domain/models/priceHistory.ts   # Layer 2: Data models
├── components/PriceHistoryChart.tsx # Layer 3: UI component
└── pages/PriceHistoryPage.tsx      # Layer 4: Full page view
```

## 📦 Import/Export Standards

### Index Files

Every directory with multiple files should have an `index.ts`:

```typescript
// src/components/common/index.ts
export { default as Button } from './Button';
export { default as Modal } from './Modal';
export { default as LoadingSpinner } from './LoadingSpinner';
```

### Import Order

1. React and external libraries
2. Internal utilities and config (Layer 1)
3. Hooks and services (Layer 2)
4. Components (Layer 3)
5. Types and interfaces
6. Relative imports

### Barrel Exports

Use barrel exports for clean imports:

```typescript
// Good
import { Button, Modal } from 'components/common';

// Avoid
import Button from 'components/common/Button';
import Modal from 'components/common/Modal';
```

## 🧪 Testing Structure

### Test File Organization

```
src/
├── hooks/
│   ├── __tests__/
│   │   └── useSearch.test.ts
│   └── useSearch.ts
├── components/
│   ├── common/
│   │   ├── __tests__/
│   │   │   └── Button.test.tsx
│   │   └── Button.tsx
```

### Test Naming

- **Unit Tests**: `ComponentName.test.tsx`
- **Integration Tests**: `featureName.integration.test.ts`
- **Hook Tests**: `useHookName.test.ts`

## 🔧 Build & Configuration Files

### Root Level

- `package.json`: Dependencies and scripts
- `vite.config.ts`: Build configuration
- `tsconfig.json`: TypeScript configuration
- `tailwind.config.js`: Styling configuration
- `eslint.config.js`: Code quality rules

### Development Standards

- **No Nested Ternaries**: Use early returns or separate functions
- **Component Size**: Keep components under 200 lines
- **Hook Complexity**: Extract complex logic into separate services
- **File Size**: Keep individual files focused and under 300 lines

## 📋 Code Organization Principles

### SOLID Architecture Compliance

- **Single Responsibility**: Each file/component has one clear purpose
- **Open/Closed**: Extend functionality without modifying existing code
- **Liskov Substitution**: Interfaces and abstract components are replaceable
- **Interface Segregation**: Small, focused interfaces over large ones
- **Dependency Inversion**: Depend on abstractions, not concrete implementations

### DRY Implementation

- **Shared Utilities**: Common logic in `src/utils/`
- **Reusable Components**: Generic components in `components/common/`
- **Hook Extraction**: Reusable stateful logic in custom hooks
- **Constant Definitions**: Shared constants in `utils/constants.ts`

This structure ensures maintainable, scalable code that follows established patterns and makes future development
predictable and efficient.
