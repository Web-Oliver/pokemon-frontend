# CRITICAL: Unified Component Usage Rules - NEVER VIOLATE

## UnifiedHeader vs UnifiedCard - FUNDAMENTAL DIFFERENCE

### UnifiedHeader
- **Purpose**: PAGE-LEVEL headers only
- **Usage**: Big titles, subtitles, stats, actions at the TOP of entire pages
- **Location**: Page header sections, main navigation areas
- **NOT for**: Content sections within pages, card headers, duplicate titles

### UnifiedCard  
- **Purpose**: CONTENT SECTIONS within pages
- **Usage**: Containers for specific content blocks with optional titles
- **Location**: Individual content sections, data displays, form sections
- **NOT for**: Page headers, duplicating existing headers

## CRITICAL VIOLATIONS TO AVOID

### ❌ WRONG: Mixing Headers and Cards
```tsx
// DON'T DO THIS - Creates duplicate headers
<PageLayout title="Auction Detail">  {/* Already has header */}
  <UnifiedCard title="Auction Detail">  {/* DUPLICATE! */}
```

### ✅ CORRECT: Proper Separation
```tsx
// Page header handled by PageLayout or UnifiedHeader
<PageLayout title="Auction Detail" actions={...}>
  <UnifiedCard title="Items Section">  {/* Distinct content section */}
  <UnifiedCard title="Stats Section">   {/* Another distinct section */}
```

## DRY Violation Fixing Strategy

### For Glassmorphism Containers:
1. **Has existing header structure?** → Just clean up styling, don't add UnifiedCard titles
2. **Needs to be a content section?** → Use UnifiedCard with appropriate title
3. **Is page-level header?** → Use UnifiedHeader or PageLayout

### For Empty States:
- **Always use EmptyState component** for `w-20 h-20 bg-gradient-to-br` patterns
- **Don't recreate** hardcoded icon containers

### For Icon Containers:
- **Remove hardcoded** `w-16 h-16 bg-gradient-to-br` patterns
- **Use clean icons** or proper component patterns

## Architecture Understanding
- **PageLayout**: Handles page-level structure and headers
- **UnifiedHeader**: For custom page headers with complex layouts  
- **UnifiedCard**: For content sections within the page
- **EmptyState**: For consistent empty state displays
- **Clean containers**: For components with existing header structures

## Memory Update Reason
Fixed critical misunderstanding where I was incorrectly turning every glassmorphism container into UnifiedCard with duplicate titles, creating redundant UI structures instead of properly separating page headers from content sections.