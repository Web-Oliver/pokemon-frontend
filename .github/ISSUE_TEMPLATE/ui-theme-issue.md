---
name: 🎨 UI/Theme System Issue
about: Report issues related to theming, components, or design system
title: '[UI/THEME] '
labels: ['ui', 'theme', 'design-system']
assignees: []
---

## 🎨 UI/Theme Issue Description
<!-- Brief description of the UI or theming issue -->

## 🔍 Issue Type
<!-- Check all that apply -->
- [ ] Hardcoded styles found (colors, spacing)
- [ ] Theme variant not working
- [ ] Component missing from unified system  
- [ ] Accessibility compliance issue
- [ ] Performance/bundle size issue
- [ ] Storybook documentation missing
- [ ] Design token inconsistency
- [ ] Cross-theme compatibility issue

## 🌍 Affected Components/Areas
<!-- List the components or areas affected -->
- Component: 
- Location: `src/path/to/component`
- Theme variants affected: 

## 🎭 Theme Information
**Current Theme Settings:**
- Theme: [ ] pokemon [ ] glass [ ] cosmic [ ] neural [ ] minimal
- Mode: [ ] light [ ] dark [ ] system
- Density: [ ] compact [ ] comfortable [ ] spacious
- Motion: [ ] reduced [ ] normal [ ] enhanced

## 📱 Browser/Environment
- Browser: [e.g., Chrome 120, Firefox 118, Safari 17]
- OS: [e.g., macOS 14, Windows 11, Ubuntu 22.04]
- Viewport: [e.g., Desktop 1920x1080, Mobile 375x667]
- Device: [e.g., Desktop, iPhone 15, Samsung Galaxy S23]

## 🔄 Steps to Reproduce
1. 
2. 
3. 

## ✅ Expected Behavior
<!-- What should happen -->

## ❌ Actual Behavior
<!-- What actually happens -->

## 📸 Screenshots/Videos
<!-- If applicable, add screenshots or videos to help explain the problem -->
| Expected | Actual |
|----------|---------|
| [Screenshot] | [Screenshot] |

### Theme Comparison
<!-- If theme-related, show the issue across different themes -->
| Pokemon | Glass | Cosmic |
|---------|-------|---------|
| [Screenshot] | [Screenshot] | [Screenshot] |

## 🧪 Code Samples
<!-- Include relevant code snippets -->

### Current Implementation (Problematic)
```tsx
// Current code that has issues
```

### Suggested Fix
```tsx
// Proposed solution using theme system
```

### CSS Variables Used
```css
/* List any CSS variables that should be used */
--theme-primary: value;
--density-spacing-md: value;
```

## 🔧 Design System Context
<!-- Check all that apply -->
- [ ] Issue affects multiple components
- [ ] Breaks theme consistency
- [ ] Missing from design tokens
- [ ] Not documented in Storybook
- [ ] Accessibility impact
- [ ] Performance impact

## 📋 Acceptance Criteria
<!-- What needs to be done to resolve this issue -->
- [ ] Fix hardcoded styles (use CSS variables)
- [ ] Support all theme variants
- [ ] Maintain accessibility compliance
- [ ] Update Storybook documentation
- [ ] Add/update tests
- [ ] Verify cross-theme compatibility
- [ ] Performance impact minimal (<5% bundle increase)

## 🔗 Related Issues/PRs
<!-- Link related issues or pull requests -->
- Related to #
- Blocks #
- Duplicate of #

## 📚 Additional Context
<!-- Any other context, design decisions, or considerations -->

## 🏷️ Labels
<!-- Maintainers will add appropriate labels -->
- Severity: [ ] low [ ] medium [ ] high [ ] critical
- Priority: [ ] p0 [ ] p1 [ ] p2 [ ] p3
- Effort: [ ] small [ ] medium [ ] large [ ] extra-large

---

### 🤝 Contribution Guidelines
Before reporting UI/Theme issues:
1. Check [THEMING.md](../docs/THEMING.md) for theme system documentation
2. Review [CONTRIBUTING.md](../CONTRIBUTING.md) for UI development guidelines
3. Search existing issues to avoid duplicates
4. Test across multiple theme variants when possible
5. Include browser developer tools screenshots if helpful

### 🎯 Quick Fixes
For common issues:
- **Hardcoded colors**: Replace with `var(--theme-primary)` or similar CSS variables
- **Fixed spacing**: Use `var(--density-spacing-md)` for responsive spacing
- **Missing variants**: Add support for all theme variants (pokemon, glass, cosmic, etc.)
- **Accessibility**: Ensure WCAG 2.1 AA compliance with proper contrast ratios