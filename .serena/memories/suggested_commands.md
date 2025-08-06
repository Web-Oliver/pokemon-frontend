# Suggested Development Commands

## Development Server

```bash
npm run dev              # Start development server
```

## Build & Analysis

```bash
npm run build           # Production build
npm run build:analyze   # Build with bundle analyzer
npm run preview         # Preview production build
```

## Code Quality

```bash
npm run lint            # ESLint checking
npm run lint:fix        # Fix ESLint issues
npm run format          # Format with Prettier
npm run format:check    # Check Prettier formatting
npm run type-check      # TypeScript type checking
```

## Testing

```bash
npm run test           # Run tests
npm run test:ui        # Run tests with UI
npm run test:run       # Run tests once
npm run test:coverage  # Run with coverage
npm run test:watch     # Watch mode
```

## Analysis Tools

```bash
madge --circular --extensions ts,tsx,js,jsx src/  # Check circular dependencies
npx depcheck --json                              # Check unused dependencies
npm run build:analyze                            # Bundle analysis
```

## Git Workflow

```bash
git status
git add .
git commit -m "message"
git push
```