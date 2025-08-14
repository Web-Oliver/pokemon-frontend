# Contributing to Pokemon Collection Frontend

Welcome to the Pokemon Collection Frontend project! This guide provides comprehensive guidelines for contributing to our React-based frontend application with a focus on UI consistency, theming, and code quality.

## 📋 Table of Contents

- [Getting Started](#-getting-started)
- [Development Setup](#-development-setup)
- [Frontend & UI Development](#-frontend--ui-development)
- [Code Standards](#-code-standards)
- [Component Guidelines](#-component-guidelines)
- [Testing Requirements](#-testing-requirements)
- [Pull Request Process](#-pull-request-process)
- [Documentation Standards](#-documentation-standards)
- [Performance Guidelines](#-performance-guidelines)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm 9+
- Git knowledge and GitHub account
- Basic understanding of React, TypeScript, and Tailwind CSS
- Familiarity with our unified design system

### Development Setup

```bash
# Clone the repository
git clone https://github.com/your-org/pokemon-collection-frontend.git
cd pokemon-collection-frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Start Storybook
npm run storybook
```

## 🎨 Frontend & UI Development

### **MANDATORY RULE: NO HARDCODED STYLES**

**All colors, spacing, and design tokens MUST come from the theme system.**

#### ✅ Correct: Using Theme Variables
```typescript
// ✅ Good - Uses CSS variables from theme system
const buttonStyles = cva([
  "bg-[var(--theme-primary)]",
  "text-[var(--theme-text-on-primary)]",
  "p-[var(--density-spacing-md)]",
  "border-[var(--theme-border-primary)]"
]);

// ✅ Good - Using design tokens
import { colorTokens, spacingTokens } from '@/theme/tokens';
const primaryColor = colorTokens.brand.pokemon.blue;
```

#### ❌ Incorrect: Hardcoded Values
```typescript
// ❌ Bad - Hardcoded colors
const buttonStyles = cva([
  "bg-blue-500",
  "text-white",
  "p-4",
  "border-gray-300"
]);

// ❌ Bad - Direct hex values
const primaryColor = '#0075BE';
```

### **MANDATORY RULE: REUSABLE COMPONENTS**

**UI patterns used more than twice MUST be shared components.**

#### Component Creation Process

1. **Identify Reuse**: If a UI pattern appears >2 times, create a shared component
2. **Location**: Place in `src/shared/ui/` directory
3. **Variants**: Support all theme variants (pokemon, glass, cosmic, etc.)
4. **Documentation**: Create comprehensive Storybook stories
5. **Testing**: Write unit tests and accessibility tests

#### Shared Component Structure
```typescript
// src/shared/ui/primitives/NewComponent.tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const newComponentVariants = cva([
  // Base styles using CSS variables only
  "rounded-md transition-colors",
  "bg-[var(--theme-surface)]",
  "text-[var(--theme-text-primary)]"
], {
  variants: {
    variant: {
      default: "border-[var(--theme-border-primary)]",
      pokemon: "border-[var(--pokemon-blue)] shadow-[var(--shadow-pokemon)]",
      glass: "backdrop-blur-md bg-[var(--glass-bg)]",
      cosmic: "border-[var(--color-cosmic)] shadow-[var(--shadow-cosmic)]"
    },
    size: {
      sm: "text-sm p-[var(--density-spacing-sm)]",
      default: "p-[var(--density-spacing-md)]",
      lg: "text-lg p-[var(--density-spacing-lg)]"
    }
  },
  defaultVariants: {
    variant: 'default',
    size: 'default'
  }
});

export interface NewComponentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof newComponentVariants> {
  // Component-specific props
}

const NewComponent = React.forwardRef<HTMLDivElement, NewComponentProps>(
  ({ variant, size, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(newComponentVariants({ variant, size }), className)}
      {...props}
    />
  )
);

NewComponent.displayName = 'NewComponent';

export { NewComponent, newComponentVariants };
```

### **MANDATORY RULE: ESTABLISHED FILE STRUCTURE**

**Follow the unified directory structure:**

```
src/
├── shared/ui/              # Unified component library
│   ├── primitives/         # Base components (Button, Card, Input)
│   ├── composite/          # Complex components
│   ├── index.ts           # Central export hub
│   └── migration-helpers.ts
├── theme/                  # Theme system
│   ├── tokens.ts          # Design tokens
│   ├── themes.ts          # Theme definitions
│   ├── variants/          # Component variants
│   └── unified-variables.css
└── components/            # Legacy/feature-specific components
```

### Theme System Usage Guidelines

#### 1. Always Use Theme Context
```typescript
import { useTheme } from '@/theme';

function MyComponent() {
  const { settings, setTheme, isDark } = useTheme();
  
  return (
    <div data-theme={settings.name} data-mode={settings.mode}>
      Component content
    </div>
  );
}
```

#### 2. Density-Aware Spacing
```typescript
// ✅ Good - Density responsive
className="gap-[var(--density-spacing-sm)] p-[var(--density-spacing-md)]"

// ❌ Bad - Fixed spacing
className="gap-2 p-4"
```

#### 3. Motion Preferences
```typescript
// ✅ Good - Respects motion settings
className="transition-all data-[motion=reduced]:transition-none"
```

### Component Approval Workflow

1. **Design Review**: Ensure component fits design system
2. **Code Review**: Check theme compliance and reusability
3. **Storybook Review**: Verify all variants documented
4. **Accessibility Review**: WCAG 2.1 AA compliance check
5. **Performance Review**: Bundle size impact assessment

## 📏 Code Standards

### TypeScript Standards
- **Strict Mode**: All TypeScript must pass strict type checking
- **No `any` Types**: Use proper typing or `unknown` with type guards
- **Interface Over Type**: Prefer interfaces for object definitions
- **Generic Constraints**: Use proper generic constraints

```typescript
// ✅ Good - Proper typing
interface ComponentProps extends React.ComponentProps<'div'> {
  variant?: 'pokemon' | 'glass' | 'cosmic';
  children: React.ReactNode;
}

// ❌ Bad - Using any
interface ComponentProps {
  data: any;
}
```

### ESLint Configuration
Our ESLint includes these mandatory rules:

```javascript
// Custom rules for theme compliance
rules: {
  // Prevents hardcoded colors in className
  'no-hardcoded-colors': 'error',
  
  // Requires CSS variables for styling
  'prefer-css-variables': 'error',
  
  // Enforces component reusability
  'enforce-shared-components': 'warn'
}
```

### Import Organization
```typescript
// 1. React and external libraries
import React from 'react';
import { cva } from 'class-variance-authority';

// 2. Internal utilities
import { cn } from '@/lib/utils';

// 3. Theme system
import { useTheme } from '@/theme';

// 4. Shared components
import { Button, Card } from '@/shared/ui';

// 5. Feature-specific components
import { PokemonCard } from '@/components/pokemon';
```

## 🧩 Component Guidelines

### Unified Component Requirements

All components MUST:

1. **Support All Themes**: Pokemon, glass, cosmic, neural, minimal
2. **Density Awareness**: Compact, comfortable, spacious modes
3. **Motion Respect**: Handle reduced-motion preferences
4. **Accessibility**: WCAG 2.1 AA compliance
5. **TypeScript Strict**: Full type safety
6. **Storybook Coverage**: Document all variants
7. **Test Coverage**: >80% test coverage

### Component Checklist

Before submitting a component:

- [ ] Uses only CSS variables, no hardcoded styles
- [ ] Supports all theme variants
- [ ] Density-responsive spacing and sizing
- [ ] Respects motion preferences
- [ ] Passes accessibility audit
- [ ] Includes comprehensive Storybook stories
- [ ] Has >80% test coverage
- [ ] TypeScript strict mode compliant
- [ ] Documented with JSDoc comments
- [ ] Performance optimized (memo, useMemo where needed)

### Component Testing Requirements

```typescript
// Required test coverage
describe('ComponentName', () => {
  // Theme coverage
  test('renders with all theme variants', () => {});
  test('responds to theme changes', () => {});
  
  // Accessibility
  test('meets WCAG 2.1 AA standards', async () => {
    const { container } = render(<Component />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  // Functionality
  test('handles all prop combinations', () => {});
  test('forwards refs correctly', () => {});
});
```

## 🧪 Testing Requirements

### Test Categories

1. **Unit Tests**: Component logic and rendering
2. **Integration Tests**: Component interactions
3. **Accessibility Tests**: WCAG 2.1 AA compliance
4. **Visual Regression Tests**: Storybook screenshots
5. **Performance Tests**: Bundle size and runtime performance

### Testing Commands
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run accessibility tests
npm run test:a11y

# Run visual regression tests
npm run test:visual

# Run Storybook tests
npm run storybook:test
```

### Coverage Requirements
- **Minimum**: 80% overall code coverage
- **Components**: 90% coverage for shared UI components
- **Critical Paths**: 100% coverage for core functionality

## 📝 Pull Request Process

### PR Template Checklist

When creating a PR, you MUST check ALL boxes:

#### UI and Theming Guidelines
- [ ] **I have followed the UI and Theming guidelines**
- [ ] **Components use unified design system**
- [ ] **No hardcoded styles introduced**
- [ ] **All colors/spacing use CSS variables or design tokens**
- [ ] **Component supports all theme variants (pokemon/glass/cosmic/etc.)**

#### Component Standards  
- [ ] **Storybook stories updated for new/modified components**
- [ ] **Component placed in correct directory structure**
- [ ] **Reusable patterns converted to shared components**
- [ ] **Legacy components updated to unified system where applicable**

#### Quality Assurance
- [ ] **Accessibility standards maintained (WCAG 2.1 AA)**
- [ ] **TypeScript strict mode passes without errors**
- [ ] **ESLint passes without errors**
- [ ] **All tests pass with >80% coverage**
- [ ] **Visual regression tests updated**

#### Performance Impact
- [ ] **Bundle size impact assessed (<5% increase)**
- [ ] **Performance benchmarks maintained**
- [ ] **Code splitting implemented where appropriate**
- [ ] **Lazy loading used for heavy components**

#### Documentation
- [ ] **README updated if needed**
- [ ] **THEMING.md updated for theme changes**
- [ ] **Component documentation complete**
- [ ] **Migration guide updated if breaking changes**

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix (non-breaking change fixing an issue)
- [ ] New feature (non-breaking change adding functionality)  
- [ ] Breaking change (fix/feature causing existing functionality to not work)
- [ ] Documentation update
- [ ] Theme/design system update

## Component Changes
- List new components created
- List existing components modified
- Note any breaking changes

## Theme Impact
- Theme variants tested: [ ] pokemon [ ] glass [ ] cosmic [ ] neural [ ] minimal
- Density modes tested: [ ] compact [ ] comfortable [ ] spacious
- Motion settings tested: [ ] reduced [ ] normal [ ] enhanced

## Performance Impact
- Bundle size change: +/- X KB
- Performance benchmarks: [Pass/Fail]
- Loading time impact: [None/Minimal/Significant]

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated  
- [ ] Accessibility tests pass
- [ ] Visual regression tests updated
- [ ] Manual testing completed

## Storybook
- [ ] Stories added for new components
- [ ] Stories updated for modified components
- [ ] All variants documented
- [ ] Interactive examples included

## Screenshots
[Include before/after screenshots for UI changes]

## Migration Notes
[If breaking changes, include migration instructions]
```

### Review Process

1. **Automated Checks**: ESLint, TypeScript, tests must pass
2. **Theme Validation**: All theme variants tested
3. **Accessibility Review**: WCAG 2.1 AA compliance verified
4. **Performance Review**: Bundle size impact assessed
5. **Code Review**: At least 2 approvals required
6. **Storybook Review**: Documentation completeness check

## 📖 Documentation Standards

### Component Documentation Requirements

1. **JSDoc Comments**: All components must have comprehensive JSDoc
2. **Props Documentation**: All props documented with types and examples
3. **Usage Examples**: Multiple usage scenarios shown
4. **Theme Integration**: Theme system usage documented
5. **Accessibility Notes**: ARIA attributes and keyboard navigation

### JSDoc Template
```typescript
/**
 * PokemonCard component for displaying Pokemon collection items
 * Supports all theme variants and density modes
 * 
 * @example
 * ```tsx
 * <PokemonCard 
 *   variant="pokemon"
 *   size="lg"
 *   pokemon={pokemonData}
 *   onSelect={handleSelect}
 * />
 * ```
 * 
 * @param variant - Theme variant (pokemon | glass | cosmic)
 * @param size - Component size (sm | default | lg)  
 * @param pokemon - Pokemon data object
 * @param onSelect - Callback when card is selected
 */
```

### Storybook Story Requirements

```typescript
// ComponentName.stories.tsx
export default {
  title: 'Components/ComponentName',
  component: ComponentName,
  parameters: {
    docs: {
      description: {
        component: 'Component description and usage guidelines'
      }
    }
  }
} as Meta;

// Required stories
export const Default = {};
export const Pokemon = { args: { variant: 'pokemon' } };
export const Glass = { args: { variant: 'glass' } };
export const Cosmic = { args: { variant: 'cosmic' } };
export const AllSizes = {}; // Show all sizes
export const DarkMode = { parameters: { theme: 'dark' } };
export const Playground = { args: {}, argTypes: {} }; // Interactive playground
```

## ⚡ Performance Guidelines

### Bundle Size Management

- **Component Limit**: Individual components <10KB minified
- **Total Increase**: PR bundle size increase <5%
- **Lazy Loading**: Use React.lazy for heavy components
- **Code Splitting**: Split by routes and features

### Performance Monitoring
```bash
# Analyze bundle size
npm run build:analyze

# Performance benchmarks
npm run test:performance

# Bundle size monitoring
npm run bundlewatch
```

### CSS Performance

- **CSS Variables**: Use CSS variables for theme values
- **Avoid Duplication**: Share common styles through variants
- **Optimized Selectors**: Use efficient CSS selectors
- **Critical CSS**: Inline critical above-the-fold CSS

## 🛡️ Quality Gates

### Automated PR Checks

The following automated checks must pass:

1. **ESLint**: No errors, warnings reviewed
2. **TypeScript**: Strict mode compilation
3. **Tests**: >80% coverage, all tests passing
4. **Bundle Size**: <5% increase from baseline
5. **Accessibility**: WCAG 2.1 AA compliance
6. **Visual Regression**: Storybook screenshot comparison
7. **Performance**: Core Web Vitals maintained

### Custom ESLint Rules

```javascript
// .eslintrc.js additions for theme compliance
rules: {
  // Prevent hardcoded colors in className
  'pokemon-ui/no-hardcoded-colors': [
    'error',
    {
      'forbiddenColors': [
        'blue-500', 'red-500', 'green-500', 'yellow-500',
        'gray-900', 'black', 'white'
      ]
    }
  ],
  
  // Require CSS variables for theming
  'pokemon-ui/prefer-css-variables': 'error',
  
  // Enforce component reusability
  'pokemon-ui/enforce-shared-components': [
    'warn',
    { 'threshold': 2 } // Patterns used >2 times
  ]
}
```

### Bundle Size Limits
```json
{
  "bundlewatch": {
    "files": [
      {
        "path": "./dist/assets/*.js",
        "maxSize": "500kb"
      },
      {
        "path": "./dist/assets/*.css", 
        "maxSize": "50kb"
      }
    ]
  }
}
```

## 🎯 Design System Governance

### Design Token Modifications

Changes to design tokens require:

1. **Design Review**: UX/UI team approval
2. **Impact Assessment**: Component usage analysis  
3. **Migration Plan**: Update strategy for existing components
4. **Documentation**: Token usage guidelines update
5. **Visual Testing**: All theme variants tested

### Theme Variant Addition

New theme variants must include:

1. **Complete Token Set**: All required design tokens
2. **Component Coverage**: All components support new variant
3. **Accessibility Compliance**: WCAG 2.1 AA contrast ratios
4. **Storybook Documentation**: All components documented
5. **Migration Guide**: Usage instructions and examples

## 🔄 Migration from Legacy Components

When migrating legacy components:

1. **Identify Usage**: Find all instances of legacy component
2. **Create Migration Map**: Old props → new props mapping
3. **Update Gradually**: Migrate incrementally, not all at once
4. **Test Thoroughly**: Ensure no regression in functionality
5. **Update Documentation**: Reflect changes in docs
6. **Remove Legacy**: Clean up old code after successful migration

### Migration Helper Example
```typescript
// migration-helpers.ts
export function mapLegacyButtonProps(
  legacyProps: LegacyButtonProps
): ButtonProps {
  return {
    variant: legacyProps.pokemon ? 'pokemon' : 'default',
    size: legacyProps.large ? 'lg' : 'default',
    // ... other mappings
  };
}
```

## 🚨 Common Pitfalls to Avoid

### Theming Mistakes
- Using hardcoded colors instead of CSS variables
- Not testing all theme variants
- Forgetting density and motion preferences
- Missing dark mode support

### Component Mistakes  
- Creating one-off components instead of reusable ones
- Not following established file structure
- Missing TypeScript types or using `any`
- Insufficient Storybook documentation

### Performance Mistakes
- Large bundle size increases
- Not using React.memo for expensive components
- Missing lazy loading for heavy components
- Inefficient CSS selectors

## 📞 Getting Help

### Resources
- [Design System Documentation](./docs/THEMING.md)
- [Component Library Storybook](http://localhost:6006)
- [Migration Guide](./docs/MIGRATION_GUIDE.md)
- [Performance Guidelines](./docs/PERFORMANCE.md)

### Communication Channels
- GitHub Issues: Bug reports and feature requests
- GitHub Discussions: Questions and community support
- PR Comments: Code review discussions

### Code Review Guidelines
- Be constructive and respectful
- Focus on code quality and standards compliance
- Suggest improvements with examples
- Acknowledge good practices and innovations

---

## ✅ Quick Checklist for Contributors

Before submitting your contribution:

- [ ] **No hardcoded styles** - All colors/spacing use theme system
- [ ] **Reusable components** - Patterns used >2x are shared components  
- [ ] **File structure** - Components in correct directories
- [ ] **Theme compliance** - Supports all theme variants
- [ ] **TypeScript strict** - No type errors
- [ ] **Tests passing** - >80% coverage
- [ ] **Storybook updated** - New/modified components documented
- [ ] **Accessibility tested** - WCAG 2.1 AA compliant
- [ ] **Performance checked** - Bundle size impact <5%
- [ ] **PR template complete** - All boxes checked

Thank you for contributing to the Pokemon Collection Frontend! Your efforts help maintain our high standards of code quality, design consistency, and user experience.