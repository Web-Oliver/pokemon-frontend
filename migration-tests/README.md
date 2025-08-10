# Pokemon Frontend Migration Test Suite

**Insurance Policy for Safe Frontend Migration**

This test suite ensures 100% functional parity between old and new frontends during the migration process.

## Quick Start

```bash
# Install dependencies
npm install
npx playwright install

# Test old frontend (baseline)
npm run test:old

# Test new frontend (comparison) 
npm run test:new

# Run full comparison
npm run test:compare

# View reports
npm run show:report:old
npm run show:report:new
```

## Test Categories

### 🎯 Critical Journey Tests
**Location**: `e2e/critical-journeys/`

Business-critical user flows that must work identically:
- Collection CRUD operations
- Auction workflow
- Search functionality  
- User authentication
- Analytics reporting

### 🔍 API Contract Tests
**Location**: `api-contracts/`

Ensures frontend-backend communication stays identical:
- Request/response schemas
- Error handling
- Authentication flows
- Data transformation

### 👀 Visual Regression Tests  
**Location**: `e2e/visual-regression/`

Pixel-perfect UI comparison:
- Page screenshots
- Component snapshots
- Responsive layouts
- Theme variations

## Usage Patterns

### During Migration Development

```bash
# 1. Record baseline (old frontend)
TEST_TARGET=old npm run test:critical

# 2. Test your new implementation  
TEST_TARGET=new npm run test:critical

# 3. Compare results
npm run test:compare
```

### Continuous Integration

```bash
# Run full regression suite
npm run test:compare

# Quick smoke test
npm run test:critical
```

### Debugging Failed Tests

```bash
# Run specific test file
TEST_TARGET=old npx playwright test collection-crud.spec.ts --debug

# View failed test recordings
npm run show:report:old
```

## Environment Configuration

Tests automatically detect which environment to target:

```typescript
// Configured via TEST_TARGET environment variable
const environments = {
  old: 'http://localhost:3000',  // Current frontend
  new: 'http://localhost:3001',  // New frontend
};
```

## Key Features

### ✅ Same Tests, Different Targets
- Identical test logic runs against both frontends
- Automatic environment switching
- Consistent test data and scenarios

### ✅ Comprehensive Reporting
- HTML reports with screenshots
- JSON results for CI/CD integration  
- Video recordings of failures
- Test comparison summaries

### ✅ Multiple Browser Coverage
- Chromium, Firefox, WebKit
- Mobile device simulation
- Cross-browser consistency validation

### ✅ Robust Test Design
- Retry logic for flaky tests
- Proper wait strategies
- Test isolation and cleanup
- Performance monitoring

## Test Data Strategy

All tests use consistent data via `TestDataFactory`:

```typescript
const testCard = TestDataFactory.createTestPsaCard({
  cardName: 'Charizard',
  grade: 10,
  price: 500.00,
});
```

This ensures both frontends are tested with identical inputs.

## Migration Workflow Integration

### Phase 0: Establish Baseline
```bash
npm run test:old  # Must pass 100%
```

### Phase 1-4: Feature Migration
```bash
# After each feature migration
npm run test:new
npm run test:compare
```

### Phase 5: Final Validation
```bash
npm run test:compare  # Both should pass identically
```

## Success Criteria

- ✅ **100% test pass rate** on old frontend (baseline)
- ✅ **Identical results** between old and new frontend
- ✅ **Zero functional regressions** detected
- ✅ **Visual consistency** maintained (with approved exceptions)

## Troubleshooting

### Tests Failing on Old Frontend
```bash
# Check if services are running
curl http://localhost:3000
curl http://localhost:5000/api/health

# Review test data setup
npm run test:old --debug
```

### Tests Failing on New Frontend Only
```bash  
# Compare specific test
TEST_TARGET=new npx playwright test collection-crud.spec.ts --headed

# Check implementation differences
npm run show:report:new
```

### Visual Regression Failures
```bash
# Review visual diffs
npm run show:report:old
# Look for screenshot comparisons

# Update baselines if changes are intentional
npm run test:visual -- --update-snapshots
```

## Contributing

### Adding New Tests
1. Create test file in appropriate category
2. Use `TestDataFactory` for consistent data  
3. Include proper test isolation
4. Add to both old and new test runs

### Test Naming Convention
- `*.spec.ts` - Test files
- `data-testid` - HTML test selectors
- Descriptive test names explaining business value

This test suite is your safety net - run it early and often during migration!