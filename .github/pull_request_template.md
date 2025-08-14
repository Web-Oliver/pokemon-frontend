# Pull Request

## 📋 Description
<!-- Brief description of what this PR does -->

## 🔄 Type of Change
<!-- Check all that apply -->
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Theme/design system update
- [ ] Performance improvement
- [ ] Refactoring (no functional changes)

## 🎨 UI and Theming Guidelines
<!-- MANDATORY: All boxes must be checked -->
- [ ] **I have followed the UI and Theming guidelines**
- [ ] **Components use unified design system**
- [ ] **No hardcoded styles introduced** (no `#colors`, `rgb()`, `blue-500`, etc.)
- [ ] **All colors/spacing use CSS variables or design tokens**
- [ ] **Component supports all theme variants** (pokemon/glass/cosmic/neural/minimal)
- [ ] **Density modes tested** (compact/comfortable/spacious)
- [ ] **Motion preferences respected** (reduced/normal/enhanced)

## 🧩 Component Standards
<!-- MANDATORY: All applicable boxes must be checked -->
- [ ] **Storybook stories updated for new/modified components**
- [ ] **Components placed in correct directory structure** (`src/shared/ui/`)
- [ ] **Reusable patterns converted to shared components** (>2 usage rule)
- [ ] **Legacy components updated to unified system** (where applicable)
- [ ] **Component variants documented** (all size/color/state combinations)
- [ ] **TypeScript interfaces exported** (proper VariantProps usage)

## ✅ Quality Assurance
<!-- MANDATORY: All boxes must be checked -->
- [ ] **Accessibility standards maintained** (WCAG 2.1 AA compliance)
- [ ] **TypeScript strict mode passes** (no `any` types, proper interfaces)
- [ ] **ESLint passes without errors** (theme compliance rules included)
- [ ] **All tests pass with >80% coverage**
- [ ] **Visual regression tests updated** (Storybook screenshots)
- [ ] **Accessibility tests pass** (axe-core validation)

## ⚡ Performance Impact Assessment
<!-- MANDATORY: Complete performance analysis -->
- [ ] **Bundle size impact assessed** (<5% increase from baseline)
- [ ] **Performance benchmarks maintained** (Core Web Vitals)
- [ ] **Code splitting implemented** (where appropriate for large components)
- [ ] **Lazy loading used** (for heavy/non-critical components)
- [ ] **Memory leaks prevented** (proper cleanup in useEffect)
- [ ] **React optimizations applied** (memo, useMemo, useCallback where needed)

**Bundle Size Impact**: +/- X KB (must be <5% increase)
**Loading Time Impact**: [None/Minimal/Significant] - explain if significant

## 📖 Documentation Standards
<!-- MANDATORY: Documentation must be complete -->
- [ ] **README updated** (if functionality/setup changes)
- [ ] **THEMING.md updated** (for theme system changes)
- [ ] **Component documentation complete** (JSDoc comments)
- [ ] **Migration guide updated** (if breaking changes)
- [ ] **Storybook documentation complete** (usage examples, props table)
- [ ] **Accessibility documentation** (keyboard navigation, screen readers)

## 🧪 Testing Coverage
<!-- Specify test types completed -->

### Unit Tests
- [ ] Component rendering tests
- [ ] Props validation tests  
- [ ] Event handling tests
- [ ] Edge case tests

### Integration Tests
- [ ] Component interaction tests
- [ ] Theme switching tests
- [ ] State management tests
- [ ] API integration tests (if applicable)

### Accessibility Tests
- [ ] Axe-core automated testing
- [ ] Keyboard navigation testing
- [ ] Screen reader testing
- [ ] High contrast mode testing
- [ ] Reduced motion testing

### Visual Regression Tests
- [ ] Storybook snapshot testing
- [ ] Cross-browser compatibility
- [ ] Mobile responsiveness
- [ ] Theme variant screenshots

**Test Coverage**: X% (must be >80%)

## 📱 Component Changes
<!-- List all component modifications -->

### New Components Created
- `ComponentName` - Brief description and location

### Existing Components Modified  
- `ComponentName` - What changed and why

### Breaking Changes
<!-- If any breaking changes, describe migration path -->
- None / List breaking changes with migration instructions

## 🎨 Theme Impact Analysis
<!-- MANDATORY: Test all theme combinations -->

### Theme Variants Tested
- [ ] **Pokemon** (official brand theme)
- [ ] **Glass** (glassmorphism effects)
- [ ] **Cosmic** (premium gradients)  
- [ ] **Neural** (tech-focused clean)
- [ ] **Minimal** (clean aesthetic)

### Density Modes Tested
- [ ] **Compact** (tight spacing)
- [ ] **Comfortable** (balanced spacing)
- [ ] **Spacious** (loose spacing)

### Motion Settings Tested
- [ ] **Reduced** (minimal animations)
- [ ] **Normal** (standard animations)
- [ ] **Enhanced** (rich interactions)

### Dark/Light Mode Testing
- [ ] Light mode tested across all themes
- [ ] Dark mode tested across all themes
- [ ] System preference detection tested
- [ ] Theme switching tested

## 📊 Storybook Documentation
<!-- MANDATORY: Complete Storybook coverage -->
- [ ] **Stories added for new components**
- [ ] **Stories updated for modified components**
- [ ] **All variants documented** (every size/color/state combination)
- [ ] **Interactive examples included** (playground story)
- [ ] **Usage guidelines documented** (do's and don'ts)
- [ ] **Props table auto-generated** (from TypeScript interfaces)
- [ ] **Accessibility notes included** (keyboard shortcuts, ARIA attributes)

### Storybook Stories Created/Updated
<!-- List specific stories -->
- `ComponentName.stories.tsx` - New/Updated with X stories

## 🖼️ Screenshots
<!-- Include visual evidence of changes -->

### Before/After Comparison
<!-- For UI changes, show before and after -->

### Theme Variants
<!-- Show component in different themes -->
| Pokemon | Glass | Cosmic |
|---------|--------|--------|
| [Screenshot] | [Screenshot] | [Screenshot] |

### Density Variations
<!-- Show component in different density modes -->
| Compact | Comfortable | Spacious |
|---------|-------------|----------|
| [Screenshot] | [Screenshot] | [Screenshot] |

### Mobile Responsiveness
<!-- Show mobile and desktop views -->
| Mobile | Desktop |
|--------|---------|
| [Screenshot] | [Screenshot] |

## 🔧 Migration Notes
<!-- If breaking changes, provide migration instructions -->

### Breaking Changes
<!-- List any breaking changes -->
- None / Detailed list with migration steps

### Migration Steps
<!-- For breaking changes, provide step-by-step migration -->
```typescript
// Before
<OldComponent prop="value" />

// After  
<NewComponent newProp="value" />
```

### Automated Migration
<!-- If migration helpers provided -->
- [ ] Migration helper functions provided
- [ ] Codemod scripts available
- [ ] Documentation updated with migration guide

## 🔍 Code Review Checklist
<!-- For reviewers -->

### Architecture Review
- [ ] Follows established patterns and conventions
- [ ] Proper separation of concerns
- [ ] Appropriate abstractions and interfaces
- [ ] No over-engineering or premature optimization

### Theme System Review
- [ ] Uses CSS variables exclusively for theming
- [ ] Supports all required theme variants
- [ ] Follows design token hierarchy
- [ ] Respects user preferences (motion, contrast)

### Performance Review
- [ ] Bundle size impact acceptable
- [ ] No memory leaks or performance regressions
- [ ] Proper React optimizations applied
- [ ] Loading states handled appropriately

### Accessibility Review
- [ ] Semantic HTML structure
- [ ] Proper ARIA attributes
- [ ] Keyboard navigation support
- [ ] Screen reader compatibility
- [ ] Sufficient color contrast ratios

## ⚠️ Known Issues
<!-- List any known limitations or issues -->
- None / List issues with tracking numbers

## 📚 Related Issues/PRs
<!-- Link related issues and pull requests -->
- Closes #XXX
- Related to #XXX
- Depends on #XXX
- Blocked by #XXX

## 🏷️ Labels
<!-- Add appropriate labels -->
<!-- Examples: enhancement, bug, documentation, breaking-change, performance -->

---

## 🔒 Pre-merge Checklist
<!-- Final verification before merge -->

### Automated Checks Status
- [ ] All CI/CD checks passing
- [ ] ESLint validation passed
- [ ] TypeScript compilation successful
- [ ] Unit tests passed (>80% coverage)
- [ ] Integration tests passed
- [ ] Visual regression tests passed
- [ ] Bundle size check passed (<5% increase)
- [ ] Accessibility audit passed (axe-core)

### Manual Verification
- [ ] Code reviewed by at least 2 team members
- [ ] Design review completed (if UI changes)
- [ ] Accessibility review completed
- [ ] Performance review completed
- [ ] Documentation review completed
- [ ] Migration guide reviewed (if breaking changes)

### Deployment Readiness
- [ ] Production build tested locally
- [ ] Staging deployment tested
- [ ] Database migrations ready (if applicable)
- [ ] Feature flags configured (if applicable)
- [ ] Monitoring/alerting configured (if applicable)

---

**📝 Additional Notes**
<!-- Any additional context, concerns, or celebration-worthy achievements -->

**🙏 Reviewer Instructions**
<!-- Specific instructions for reviewers -->
- Focus areas for review
- Specific scenarios to test
- Performance considerations
- Accessibility considerations

---

*Thank you for contributing to Pokemon Collection Frontend! This PR template ensures we maintain our high standards for code quality, accessibility, and user experience.*