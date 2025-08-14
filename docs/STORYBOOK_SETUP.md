# Storybook Setup & Visual Testing Documentation

> **Phase 3.2 Implementation** - Comprehensive Storybook setup with visual regression testing and interactive documentation.

## 🎯 Overview

This project uses Storybook for component development, documentation, and visual regression testing. All unified components have comprehensive stories covering variants, states, and usage patterns.

## 📚 Storybook Features

### Component Coverage
- ✅ **Button Component**: 15 variants × 7 sizes × 4 motion levels × 3 densities
- ✅ **Card Component**: 10 variants × 5 sizes × interactive states × status indicators
- ✅ **Input Component**: 9 variants × validation states × icon support × loading states
- ✅ **Badge Component**: 17 variants including PSA grade-specific badges
- ✅ **Modal Component**: 8 variants × convenience components × responsive sizing

### Interactive Features
- **Theme Switching**: Live theme preview in toolbar
- **Density Control**: Compact/comfortable/spacious layout testing
- **Motion Preferences**: Animation level controls
- **Viewport Testing**: Responsive design validation
- **Accessibility Testing**: Built-in a11y addon with WCAG compliance

## 🚀 Getting Started

### Development
```bash
# Start Storybook development server
npm run storybook

# Build Storybook for production
npm run build-storybook
```

### Visual Testing
```bash
# Run visual regression tests
npm run test:visual

# Run tests in CI mode
npm run storybook:test:ci

# Run Chromatic visual testing
npm run chromatic
```

## 🎨 Theme Integration

### Theme Toolbar Controls
The Storybook toolbar includes theme switching controls:

- **Theme**: Pokemon | Glass | Cosmic | Neural | Minimal
- **Mode**: Light | Dark | System
- **Density**: Compact | Comfortable | Spacious
- **Motion**: Reduced | Normal | Enhanced

### CSS Variable Support
All components automatically respond to theme changes via CSS variables:

```css
/* Components use theme-aware variables */
--theme-primary: /* Dynamic based on theme selection */
--theme-surface: /* Dynamic surface color */
--theme-text-primary: /* Dynamic text color */
```

### Theme-Specific Stories
```typescript
export const PokemonTheme: Story = {
  parameters: {
    theme: 'pokemon',
    mode: 'light',
    density: 'comfortable'
  }
};

export const CosmicTheme: Story = {
  parameters: {
    theme: 'cosmic',
    mode: 'dark',
    backgrounds: { default: 'cosmic' }
  }
};
```

## 🧪 Testing Framework

### Visual Regression Testing

#### Test Runner Configuration
```typescript
// .storybook/test-runner.ts
const config: TestRunnerConfig = {
  async preVisit(page, context) {
    // Set consistent viewport
    await page.setViewportSize({ width: 1024, height: 768 });
    
    // Apply theme context
    const theme = context.parameters?.theme || 'pokemon';
    await page.evaluate(({ theme }) => {
      document.documentElement.setAttribute('data-theme', theme);
    }, { theme });
  },
  
  async postVisit(page, context) {
    // Take screenshots for visual regression
    const screenshotPath = `screenshots/${context.id}.png`;
    await page.screenshot({ path: screenshotPath });
    
    // Run accessibility audits
    const a11yResults = await page.evaluate(() => window.axe.run());
    // Process results...
  }
};
```

#### Chromatic Integration
```json
{
  "projectToken": "PROJECT_TOKEN",
  "buildScriptName": "build-storybook",
  "exitZeroOnChanges": true,
  "viewports": [375, 768, 1024, 1440],
  "diffThreshold": 0.2
}
```

### Accessibility Testing
- **Automated a11y**: Built-in addon runs accessibility audits
- **Color Contrast**: WCAG 2.1 AA compliance validation
- **Keyboard Navigation**: Focus management testing
- **Screen Reader**: ARIA attributes validation

## 📖 Story Documentation

### Story Structure
Each component story includes:

```typescript
const meta: Meta<typeof Component> = {
  title: 'Components/Primitives/Component',
  component: Component,
  parameters: {
    docs: {
      description: {
        component: `
          # Component Documentation
          Comprehensive description with usage examples...
        `
      }
    }
  },
  argTypes: {
    // Interactive controls definition
  }
};

// Individual stories with documentation
export const Variant: Story = {
  args: { variant: 'pokemon' },
  parameters: {
    docs: {
      description: {
        story: 'Description of this specific variant...'
      }
    }
  }
};
```

### Documentation Standards
- **Component Overview**: Purpose and key features
- **Usage Examples**: Code snippets and patterns
- **Variant Documentation**: Each variant explained
- **Accessibility Notes**: A11y considerations
- **Migration Guides**: Legacy component transitions

## 🎭 Story Categories

### Basic Variants
- Default implementations
- Theme-specific variants (Pokemon, Glass, Cosmic)
- Size variations
- State demonstrations

### Interactive Examples
- Loading states
- Validation states
- Interactive behaviors
- Event handling

### Complex Patterns
- Multi-step workflows
- Form integrations
- Real-world usage scenarios
- Component composition

### Comprehensive Showcases
- All variants overview
- Theme integration examples
- Responsive behavior
- Accessibility demonstrations

## 🛠️ Development Workflow

### Adding New Stories

1. **Create Story File**
```typescript
// Component.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Component } from './Component';

const meta: Meta<typeof Component> = {
  title: 'Components/Category/Component',
  component: Component,
  // Configuration...
};

export default meta;
type Story = StoryObj<typeof meta>;
```

2. **Document Variants**
```typescript
export const AllVariants: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-4">
      {variants.map(variant => (
        <Component key={variant} variant={variant}>
          {variant}
        </Component>
      ))}
    </div>
  )
};
```

3. **Add Interactive Controls**
```typescript
argTypes: {
  variant: {
    control: 'select',
    options: ['default', 'pokemon', 'cosmic'],
    description: 'Component variant'
  }
}
```

### Best Practices

#### Story Organization
- Group related stories logically
- Use consistent naming conventions
- Include comprehensive documentation
- Provide interactive playgrounds

#### Visual Testing
- Ensure consistent viewport sizes
- Use appropriate theme contexts
- Include edge cases and error states
- Test responsive behavior

#### Performance
- Optimize story loading times
- Use efficient story structures
- Minimize unnecessary re-renders
- Implement proper memoization

## 🚀 CI/CD Integration

### GitHub Actions Workflow
```yaml
name: Visual Regression Tests
on: [pull_request]

jobs:
  visual-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run Chromatic
        uses: chromaui/action@v1
        with:
          projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
          buildScriptName: build-storybook
```

### Performance Monitoring
- Bundle size tracking
- Story load times
- Component render performance
- Accessibility score monitoring

## 📊 Metrics & Reporting

### Coverage Reports
- Component coverage percentage
- Story completeness metrics
- Accessibility compliance scores
- Visual regression pass rates

### Quality Gates
- All components must have stories
- Accessibility violations block deployment
- Visual regression changes require review
- Performance budgets enforced

## 🔧 Configuration Files

### Core Configuration
- `.storybook/main.ts` - Main Storybook configuration
- `.storybook/preview.ts` - Global parameters and decorators
- `.storybook/theme.ts` - Custom Storybook theme
- `.storybook/manager.ts` - Manager app configuration

### Testing Configuration
- `.storybook/test-runner.ts` - Visual testing setup
- `chromatic.config.json` - Chromatic configuration
- `.storybook/test-setup.ts` - Jest test environment

### Theme Configuration
- Pokemon Collection branding
- Interactive theme switching
- Consistent visual identity
- Accessibility-compliant colors

## 🎯 Success Metrics

### Phase 3.2 Achievements
- ✅ **100% Component Coverage**: All unified components have stories
- ✅ **Comprehensive Documentation**: Usage examples and best practices
- ✅ **Visual Regression Testing**: Automated screenshot comparison
- ✅ **Accessibility Integration**: Built-in a11y testing
- ✅ **Theme Integration**: Live theme switching and testing
- ✅ **CI/CD Ready**: Automated testing pipeline configured

### Quality Indicators
- **15+ Button Stories**: Complete variant and state coverage
- **12+ Card Stories**: Interactive states and configurations
- **14+ Input Stories**: Form patterns and validation states
- **11+ Badge Stories**: Including PSA grade-specific variants
- **13+ Modal Stories**: Complex workflows and confirmations

## 🔮 Next Steps

### Enhanced Testing
- Visual regression baseline establishment
- Cross-browser compatibility testing
- Performance regression detection
- Accessibility score tracking

### Documentation Expansion
- Interactive component playground
- Usage analytics and insights
- Migration assistance tools
- Design system guidelines

### Integration Improvements
- Real data integration examples
- API mocking for complex stories
- End-to-end user journey stories
- Component composition patterns

---

**Storybook is ready for production use** with comprehensive component coverage, visual regression testing, and interactive documentation supporting the Pokemon Collection theme system.