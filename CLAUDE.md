# Pokemon Collection Frontend - Claude Configuration

This is a React 18 + TypeScript application for Pokemon collection management with OCR capabilities, auction systems, and analytics.

## Project Overview

**Tech Stack**: React 18.2, TypeScript 5.8, Vite 5.2, TailwindCSS 3.4, React Query 5.84, Vitest 3.0  
**Architecture**: Feature-based organization with atomic design system  
**Key Features**: OCR card matching, collection management, auction system, analytics dashboard

## Available Commands

Based on your actual package.json scripts:

```bash
# Development
npm run dev              # Start Vite dev server
npm run preview          # Preview production build

# Build & Deploy  
npm run build            # Production build
npm run build:with-typecheck  # Build with TypeScript validation
npm run build:analyze    # Build with webpack bundle analyzer

# Code Quality
npm run lint             # ESLint checking
npm run lint:fix         # Auto-fix ESLint issues  
npm run format           # Prettier formatting
npm run format:check     # Check Prettier formatting
npm run type-check       # TypeScript validation

# Testing
npm test                 # Run Vitest
npm run test:ui          # Vitest UI interface
npm run test:run         # Run tests once
npm run test:coverage    # Coverage reports
npm run test:watch       # Watch mode

# Storybook (Available)
npm run storybook        # Start Storybook dev server
npm run build-storybook  # Build static Storybook
npm run storybook:test   # Test Storybook stories
npm run test:visual      # Visual regression tests

# Validation Scripts (Custom)
npm run validate:bundle     # Bundle size monitoring
npm run validate:a11y       # Accessibility checking
npm run validate:storybook  # Storybook validation
npm run validate:theme      # Theme rule validation
npm run validate:all        # Run all validations

# Git Hooks (Available)
npm run pre-commit       # Lint + type-check + theme validation
npm run pre-push         # Tests + all validations
npm run ci:checks        # Full CI pipeline checks

# Development Tools
npm run react-devtools   # Launch React DevTools
npm run dev:full         # Dev server + React DevTools
npm run chromatic        # Chromatic visual testing
```

## Critical Implementation Rules

### MUST Rules (Based on your actual CI checks)
- **TypeScript**: All code must pass `npm run type-check`
- **Linting**: Must pass `npm run lint` (ESLint with SonarJS rules)
- **Testing**: Components must pass `npm run test:run`
- **Theme Validation**: Must pass `npm run validate:theme`
- **Bundle Size**: Must pass `npm run validate:bundle`

### Architecture Patterns (Based on your codebase)

#### File Organization
```
features/[domain]/
├── components/     # Feature-specific components
├── hooks/         # Custom hooks  
├── pages/         # Page components
├── services/      # API services
├── types/         # TypeScript definitions
└── __tests__/     # Tests
```

#### State Management (Your actual setup)
1. **Server State**: @tanstack/react-query (v5.84)
2. **Global State**: Zustand (v5.0.8)  
3. **Local State**: React hooks + react-hook-form

#### UI Components (Your actual dependencies)
- **Design System**: Radix UI components + class-variance-authority
- **Styling**: TailwindCSS + clsx + tailwind-merge
- **Icons**: lucide-react
- **Animations**: framer-motion
- **Theming**: next-themes

## Current Critical Issues

### 🔴 IMMEDIATE (Fix these first)
1. **Test Failures**: 267/381 tests failing - run `npm run test:coverage` to see details
2. **TypeScript Errors**: 
   - ImageUploader.tsx:199 - type comparison error
   - AddItemToAuctionModal.tsx:68 - grade property type mismatch
3. **Security**: Vulnerable dependencies found in package.json

### 🟡 HIGH PRIORITY  
1. **Bundle Optimization**: Remove unused Radix components
2. **Cleanup**: 172 backup files need removal
3. **Storybook**: Missing stories for many components

## Development Workflow

### Before committing:
```bash
npm run pre-commit   # Runs lint + type-check + theme validation
```

### Before pushing:
```bash
npm run pre-push     # Runs tests + all validations
```

### Full CI check locally:
```bash
npm run ci:checks    # Same as CI pipeline
```

## Testing Strategy (Your actual setup)

```bash
# Unit tests with Vitest
npm run test:coverage    # Check current coverage

# Visual testing with Storybook
npm run storybook:test   # Test existing stories
npm run test:visual      # Visual regression with Chromatic

# Accessibility testing
npm run validate:a11y    # Custom accessibility checker
```

## Performance Monitoring (Your actual tools)

```bash
# Bundle analysis
npm run build:analyze           # Webpack bundle analyzer
npm run validate:bundle         # Custom bundle size monitor
npm run validate:bundle:baseline # Set baseline for bundle size

# Storybook validation
npm run validate:storybook      # Validate story completeness
```

## Security & Dependencies

Current vulnerable dependencies that need updating:
- lodash ≤4.17.20 (7 vulnerabilities)
- shelljs ≤0.8.4 (2 vulnerabilities)  
- electron ≤28.3.1 (buffer overflow)

```bash
npm audit              # Check vulnerabilities
npm audit fix          # Auto-fix what's possible
```

## OCR System (Core Feature)

Your OCR implementation uses:
- **tesseract.js**: Text extraction from images
- **Custom preprocessing**: Context7OcrPreprocessor
- **Enhanced service**: EnhancedOcrService with confidence scoring

## Environment Variables

Based on your codebase structure:
```bash
VITE_API_BASE_URL=     # Backend API endpoint
VITE_CONTEXT7_API_KEY= # OCR service key
VITE_ENVIRONMENT=      # Environment identifier
```

## Maintenance Notes

**Current Status**: 
- Architecture: Solid React + TypeScript setup
- Testing: Needs immediate attention (70% failure rate)
- Dependencies: Modern but some security issues
- Performance: Bundle size monitoring in place

**Immediate Actions**:
1. Fix the 267 failing tests
2. Resolve TypeScript compilation errors  
3. Update vulnerable dependencies
4. Clean up 172 backup files

---

*Based on actual package.json and codebase analysis - Last updated: 2025-08-25*