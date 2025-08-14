# FORMATTING UTILITIES ANALYSIS

## Executive Summary
Analysis of 4 formatting utility files reveals generally well-structured code following CLAUDE.md principles. Some areas for optimization identified, particularly around duplication and over-specificity.

---

## File-by-File Analysis

### 1. `src/shared/utils/formatting/facebookPostFormatter.ts`

**Purpose & Size**: 212 lines - Facebook post generation from auction data
**Layer Classification**: Layer 1 (Core/Foundation) - correctly positioned

#### SOLID/DRY Analysis:
✅ **SRP**: Single responsibility for Facebook post formatting
✅ **OCP**: Extensible for new item types via switch statement
✅ **DIP**: No dependencies on higher-level modules
❌ **DRY Violations**: 

**Code Example of DRY Violation**:
```typescript
// DUPLICATION: formatPrice function exists in both files
// facebookPostFormatter.ts line 72-74:
function formatPrice(price?: number): string {
  return price ? `${Math.round(Number(price))} Kr.` : 'N/A';
}

// prices.ts line 15-34 has more comprehensive formatPrice function
export const formatPrice = (price: any): string | null => {
  // 20 lines of robust price handling
}
```

**Additional Issues**:
- Hardcoded Norwegian currency formatting
- Duplicate set name shortening logic that could be extracted
- Magic strings for emoji categories

**Verdict**: **REFACTOR**
- Remove duplicate `formatPrice` function, use from `prices.ts`
- Extract hardcoded values to constants
- Consider internationalizing currency formatting

---

### 2. `src/shared/utils/formatting/prices.ts`

**Purpose & Size**: 77 lines - Price formatting and calculations
**Layer Classification**: Layer 2 (Domain) - correctly positioned

#### SOLID/DRY Analysis:
✅ **SRP**: Single responsibility for price formatting
✅ **OCP**: Extensible currency and formatting options
✅ **DIP**: Depends on Layer 1 math utilities
❌ **DRY Violations**:

**Code Example of Over-Engineering**:
```typescript
// OVER-COMPLEX: Price parsing could be simplified
export const formatPrice = (price: any): string | null => {
  if (!price && price !== 0) return null;

  let numericPrice: number;

  if (typeof price === 'number') {
    numericPrice = price;
  } else if (price.$numberDecimal) {
    numericPrice = parseFloat(price.$numberDecimal);
  } else if (price.toString && typeof price.toString === 'function') {
    numericPrice = parseFloat(price.toString());
  } else if (typeof price === 'string') {
    numericPrice = parseFloat(price);
  } else {
    console.warn('[PRICE UTILS] Unknown price format:', price);
    return null;
  }

  return isNaN(numericPrice) ? null : numericPrice.toString();
};
```

**Issues**:
- Overly complex price type handling could be simplified with a type guard
- Default currency hardcoded to 'kr.'

**Verdict**: **KEEP** (with minor refactoring)
- Simplify price parsing logic
- Extract currency constants

---

### 3. `src/shared/utils/formatting/cards.ts`

**Purpose & Size**: 126 lines - Pokemon card formatting utilities
**Layer Classification**: Layer 2 (Domain) - correctly positioned

#### SOLID/DRY Analysis:
✅ **SRP**: Single responsibility for card formatting
✅ **OCP**: Extensible for new card types
✅ **DIP**: Depends only on Layer 1 string utilities
❌ **DRY Violations**:

**Code Example of Duplication**:
```typescript
// DUPLICATION: formatCardName exists in both files
// cards.ts line 15-23:
export const formatCardName = (cardName: string): string => {
  if (!cardName) return cardName;
  return cardName
    .replace(/-/g, ' ')
    .replace(/\(#(\d+)\)$/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
};

// facebookPostFormatter.ts line 26-32 has similar logic:
function formatCardName(cardName?: string, cardNumber?: string, variety?: string): string {
  let formatted = cardName || 'Unknown Card';
  if (variety && variety.toLowerCase() !== 'none' && variety.toLowerCase() !== '') {
    formatted += ` ${variety}`;
  }
  return formatted;
}
```

**Issues**:
- `getItemTitle` function has repetitive type checking
- Magic string patterns in regex could be constants
- Some functions have overly generic `item: any` typing

**Verdict**: **REFACTOR**
- Consolidate `formatCardName` functions
- Improve type safety with proper interfaces
- Extract regex patterns to constants

---

### 4. `src/shared/utils/formatting/index.ts`

**Purpose & Size**: 18 lines - Export aggregation
**Layer Classification**: Layer 2 (Domain) - correctly positioned

#### SOLID/DRY Analysis:
✅ **SRP**: Single export point for formatting utilities
✅ **ISP**: Segregated exports by domain
✅ **DIP**: Properly depends on lower layers
⚠️ **Potential Issue**: Re-exports time and math utilities

**Analysis**:
```typescript
// POTENTIAL LAYERING ISSUE:
// Re-export time formatting from time layer
export * from '../time/formatting';

// Re-export number formatting from math layer  
export * from '../math/numbers';
```

**Issues**:
- Re-exporting Layer 1 utilities through Layer 2 index might violate layer separation
- Creates potential for circular dependencies

**Verdict**: **REFACTOR**
- Consider removing Layer 1 re-exports
- Keep only Layer 2 formatting utilities

---

## Cross-File Issues

### Major DRY Violations:
1. **formatCardName** - Two different implementations with different signatures
2. **formatPrice** - Facebook formatter duplicates price utility logic
3. **Set name handling** - Pattern scattered across multiple files

### Over-Engineering Indicators:
1. **Price parsing** - Overly complex type checking in `prices.ts`
2. **Generic typing** - Excessive use of `any` instead of proper interfaces
3. **Magic strings** - Hardcoded patterns and currencies throughout

### SOLID Violations:
1. **SRP**: `facebookPostFormatter.ts` has price formatting concerns
2. **DRY**: Multiple implementations of similar functionality
3. **OCP**: Some functions hardcode Norwegian currency

---

## Recommendations

### High Priority:
1. **Consolidate formatCardName functions** - Create single implementation in `cards.ts`
2. **Remove duplicate formatPrice** - Use centralized price utility
3. **Extract constants** - Currency codes, regex patterns, emoji mappings

### Medium Priority:
1. **Improve type safety** - Replace `any` types with proper interfaces
2. **Simplify price parsing** - Use type guards instead of complex conditional logic
3. **Layer separation** - Review index.ts re-exports

### Low Priority:
1. **Internationalization** - Abstract currency formatting
2. **Configuration** - Make hardcoded values configurable
3. **Testing** - Add unit tests for formatting functions

---

## Final Verdicts:

| File | Verdict | Reason | Priority |
|------|---------|--------|----------|
| `facebookPostFormatter.ts` | **REFACTOR** | DRY violations, duplicate utilities | HIGH |
| `prices.ts` | **KEEP** | Well-structured, minor improvements needed | MEDIUM |
| `cards.ts` | **REFACTOR** | DRY violations, type safety issues | MEDIUM |
| `index.ts` | **REFACTOR** | Layer separation concerns | LOW |

**Overall Assessment**: The formatting utilities follow CLAUDE.md principles reasonably well but suffer from code duplication and some over-engineering. Consolidating duplicate functions and improving type safety would significantly improve maintainability.