# Code Style and Conventions

## Naming Conventions
- **Files**: PascalCase for components (e.g., `UnifiedHeader.tsx`), camelCase for utilities (e.g., `themeUtils.ts`)
- **Components**: PascalCase (e.g., `UnifiedCard`, `PokemonButton`)
- **Hooks**: camelCase starting with "use" (e.g., `useCollectionOperations`)
- **Types/Interfaces**: PascalCase, prefix interfaces with "I" when needed (e.g., `CardVariant`, `IPriceHistoryEntry`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `DEFAULT_PRESET_OPTIONS`)

## Component Design Patterns
- **Unified Component System**: Use `UnifiedHeader`, `UnifiedCard`, `UnifiedGradeDisplay` for consistent design
- **Design System**: Pokemon-themed components in `src/components/design-system/` (PokemonButton, PokemonInput, etc.)
- **Glassmorphism Theme**: Premium glass effects with backdrop-blur-xl and gradient overlays
- **Context7 Premium**: Award-winning design patterns with micro-interactions

## Code Organization
- **Exports**: Centralized exports via `index.ts` files following DRY principles
- **Props**: Well-typed interfaces with optional parameters and defaults
- **Variants**: Extensive variant systems for flexible component usage
- **Error Handling**: Graceful error handling with fallbacks and user feedback

## TypeScript Usage
- Strict typing with proper interfaces and type exports
- Generic types for reusable components and hooks
- Optional chaining and nullish coalescing for safety
- Type guards in `src/utils/typeGuards/`

## Styling Approach
- **Tailwind CSS**: Utility-first with custom CSS variables for themes
- **Responsive Design**: Mobile-first approach with sm:, md:, lg: breakpoints
- **Dark Mode**: Built-in dark mode support with `dark:` prefixes
- **Animations**: Framer Motion for complex animations, CSS transitions for simple ones