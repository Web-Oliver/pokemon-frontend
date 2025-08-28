# Pokemon Collection Frontend - Claude Code Configuration

React 18 + TypeScript application for Pokemon collection management with OCR, auctions, and analytics.

## Project Overview

**Tech Stack**: React 18.2, TypeScript 5.8, Vite 5.2, TailwindCSS 3.4, TanStack Query 5.84  
**Architecture**: Feature-based organization with atomic design system  
**Status**: Post-Phase 1 SOLID/DRY refactoring - significantly improved architecture  

## Commands

### Development
```bash
npm run dev              # Start Vite dev server (port 5173)
npm run build           # Production build with optimization
npm run preview         # Preview production build locally
npm run type-check      # TypeScript validation - MUST pass
```

### Code Quality (CRITICAL - Must pass before commit)
```bash
npm run lint            # ESLint with TypeScript rules
npm run lint:fix        # Auto-fix ESLint issues
npm run format          # Prettier code formatting
npm run format:check    # Check Prettier compliance
```

### Validation Scripts
```bash
npm run validate:theme     # Theme rule validation
npm run validate:bundle    # Bundle size monitoring  
npm run validate:a11y      # Accessibility checking
npm run validate:all       # Run all validation checks
```

### Development Tools
```bash
npm run build:analyze      # Bundle analysis with webpack-bundle-analyzer
npm run react-devtools     # Launch React DevTools (if available)
```

### Git Workflow Commands
```bash
npm run pre-commit         # Lint + type-check + theme validation
npm run pre-push          # All validations (tests minimal - needs rebuilding)
```

## Critical Implementation Rules

### MUST Requirements
- **TypeScript**: All code MUST pass `npm run type-check`
- **Linting**: MUST pass `npm run lint` before commit
- **Theme Validation**: MUST pass `npm run validate:theme`
- **Bundle Size**: MUST pass `npm run validate:bundle`

### Architecture Patterns

#### Service Layer (Post-SOLID Refactoring)
```typescript
// NEW: Use BaseCrudService for all domain services
export class MyDomainService extends BaseCrudService<MyEntity> {
  protected endpoint = '/api/my-domain';
  // Inherit: getAll, getById, create, update, delete, markSold
}

// NEW: Use centralized response handling
import { extractResponseData, extractSearchResponse } from '@/services/utils/responseUtils';
const data = extractResponseData<MyType>(response);
```

#### File Organization
```
features/[domain]/
├── components/     # Domain-specific components
├── hooks/         # Custom hooks
├── pages/         # Page components
├── services/      # Domain services (extend BaseCrudService)
└── types/         # TypeScript definitions
```

#### State Management
- **Server State**: TanStack Query v5.84 with proper invalidation patterns
- **Forms**: React Hook Form v7.62
- **Global State**: Zustand via shared services

#### Component Design System
```
shared/components/
├── atoms/          # Basic elements (Button, Input, Badge)
├── molecules/      # Simple combinations (Card, FormField)
├── organisms/      # Complex components (Header, DataTable)
└── layouts/        # Page layouts
```

## Current System Status

### Recent Improvements ✅
- **SOLID Compliance**: BaseCrudService created, domain services refactored
- **DRY Elimination**: 50+ duplicate response patterns centralized
- **Code Reduction**: CollectionService (-47%), SearchService (-53%)
- **Type Safety**: No compilation errors, comprehensive path mapping

### Critical Items Needing Attention ⚠️
1. **Testing**: Test suite needs rebuilding (previous tests removed during cleanup)
2. **Dependencies**: Security audit needed - some vulnerable packages
3. **Phase 2**: Query invalidation patterns need extraction (36+ duplicates)

## Development Guidelines

### Code Style
- **ES Modules**: Use import/export (not require/module.exports)
- **Destructuring**: Destructure imports when possible
- **Path Mapping**: Use @/ prefix for absolute imports
- **TypeScript**: Maintain strict mode compliance

### API Integration
- **Services**: Extend BaseCrudService for CRUD operations
- **Response Handling**: Use responseUtils functions (extractResponseData, etc.)
- **Error Handling**: Leverage BaseApiService validation patterns
- **Type Safety**: Use proper TypeScript generics for API responses

### Component Development
- **Atomic Design**: Follow atoms → molecules → organisms hierarchy
- **Props**: Use TypeScript interfaces for all component props
- **Styling**: Use TailwindCSS with unified theme system
- **Accessibility**: Ensure WCAG compliance with theme validation

### Performance
- **Bundle Size**: Monitor with `npm run validate:bundle`
- **Code Splitting**: Vite handles automatic splitting
- **Query Optimization**: Use TanStack Query best practices
- **Image Optimization**: Use optimized image components

## Workflow Requirements

### Before Committing
```bash
npm run pre-commit   # MUST pass: lint + type-check + theme validation
```

### Before Pushing
```bash
npm run pre-push     # MUST pass: all validations (tests currently minimal)
```

### Adding New Features
1. Create feature directory under `src/features/[domain]/`
2. Implement domain service extending BaseCrudService
3. Use centralized response handling patterns
4. Use useQueryInvalidation hook for cache management
5. Follow atomic design for components
6. Run validation scripts before commit

### Working with Forms
- Use React Hook Form for all forms
- Follow existing form patterns in `src/shared/components/forms/`
- Implement proper validation with FormValidationService
- Use unified form styling and error handling

### Working with Themes
- Use unified theme system variables
- Test both dark and light modes
- Ensure accessibility compliance
- Run `npm run validate:theme` before commit

## Environment Variables

```env
VITE_API_BASE_URL=http://localhost:3000/api  # Backend API endpoint
VITE_UPLOAD_URL=http://localhost:3000/uploads # File upload endpoint
```

## Testing Strategy (Needs Rebuilding)

**Current Status**: Test suite was removed during cleanup and needs recreation

### When Tests Are Rebuilt
```bash
npm test                 # Run all tests
npm run test:ui          # Vitest UI interface
npm run test:coverage    # Coverage reports
npm run test:watch       # Watch mode for development
```

### Test Requirements (Future)
- **Components**: Focus on user interactions
- **Hooks**: Test all custom hooks thoroughly
- **Services**: Test API integration and error handling
- **Integration**: Test complete user workflows

## Component Development

**Architecture**: Atomic design system (atoms → molecules → organisms)  
**Location**: `src/shared/components/` and `src/shared/ui/`  
**Styling**: TailwindCSS with unified theme system  

Follow existing component patterns and use proper TypeScript interfaces.

## Bundle Optimization

**Monitor**: `npm run validate:bundle`  
**Analysis**: `npm run build:analyze` (uses webpack-bundle-analyzer)  
**Target**: Keep bundle size warnings under 1MB  

Current optimizations include:
- Manual chunk splitting for vendor libraries
- Tree shaking enabled
- CSS code splitting
- Asset optimization by type

## Security

### Client-Side
- No secrets in client code
- Proper input sanitization
- HTTPS-only API communication
- Secure JWT token handling

### Dependencies
- Run `npm audit` regularly
- Update vulnerable packages promptly
- Use lock file for reproducible builds

## Phase 2 Status (In Progress)

**Completed**:
- ✅ Query invalidation patterns extracted to useQueryInvalidation hook
- ✅ UnifiedApiService refactored to orchestrator pattern

**Next Tasks**:
1. Refactor useCollectionOperations to use useQueryInvalidation hook  
2. Split large hooks into focused responsibilities
3. Rebuild essential test coverage
4. Remove duplicate utility functions

---

*Configuration based on SOLID/DRY Phase 1 completion - Architecture significantly improved*