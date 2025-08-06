# Task Completion Workflow

## Pre-Development Checks

1. **Read existing files** - Always use Read tool before making changes
2. **Check for duplicates** - Search for similar components/functionality
3. **Follow layered architecture** - Ensure proper dependency flow
4. **Review CLAUDE.md principles** - Maintain DRY and SOLID compliance

## Development Process

1. **Component Reuse First** - Check `src/components/common/` for existing unified components
2. **Use Design System** - Leverage Pokemon-themed components in `design-system/`
3. **Follow Naming Conventions** - PascalCase components, camelCase utilities
4. **Type Safety** - Create proper TypeScript interfaces and types

## Code Quality Gates

1. **Lint Check**: `npm run lint` - Must pass with 0 warnings
2. **Type Check**: `npm run type-check` - Must pass TypeScript validation
3. **Format Check**: `npm run format:check` - Code must be properly formatted
4. **Build Test**: `npm run build` - Must build successfully

## Testing Requirements

1. **Run Tests**: `npm run test:run` - All tests must pass
2. **Coverage Check**: `npm run test:coverage` - Maintain coverage levels
3. **Manual Testing**: Test in browser with `npm run dev`

## Post-Development Actions

1. **Format Code**: `npm run format` - Auto-format all changes
2. **Fix Linting**: `npm run lint:fix` - Auto-fix linting issues
3. **Verify Build**: `npm run build` - Ensure production build works
4. **Update Documentation** - Update relevant README or docs if needed

## Required Commands Before Task Completion

```bash
npm run lint && npm run type-check && npm run format && npm run build
```

## Git Workflow (if committing)

1. `git add .` - Stage all changes
2. `git commit -m "descriptive message"` - Commit with clear message
3. `git push` - Push to remote (only if requested)

## Architecture Compliance

- **No Circular Dependencies** - Maintain proper layer separation
- **DRY Principle** - Avoid code duplication, create reusable components
- **SOLID Principles** - Single responsibility, proper abstractions
- **Component Extraction** - Extract common patterns into unified components