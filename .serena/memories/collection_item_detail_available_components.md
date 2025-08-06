# CollectionItemDetail.tsx Available Components Analysis

## MAJOR SECTIONS TO EXTRACT FROM 1052-LINE FILE:

### 1. **HEADER COMPONENTS** (Lines 550-649):
✅ **USE**: `GlassmorphismHeader` - Perfect for the header section
✅ **USE**: `FormActionButtons` - For Edit/Mark Sold/Delete buttons (lines 607-642)
✅ **USE**: `DbaHeaderActions` - Alternative for action buttons

### 2. **IMAGE GALLERY SECTION** (Lines 743+):
✅ **USE**: `ImageProductView` - Already has showActions, supports item display
✅ **USE**: `ImageSlideshow` - For multiple images display
✅ **USE**: `OptimizedImageView` - For optimized image rendering

### 3. **DETAIL SECTIONS** (Already implemented):
✅ **USING**: `ItemDetailSection` - Generic detail section
✅ **USING**: `PsaCardDetailSection` - PSA card specifics
✅ **USING**: `RawCardDetailSection` - Raw card specifics  
✅ **USING**: `SealedProductDetailSection` - Sealed product specifics

### 4. **EXISTING DESIGN SYSTEM COMPONENTS**:
✅ **USE**: `PokemonButton` - Replace all inline buttons
✅ **USE**: `PokemonModal` - For mark sold modal
✅ **USE**: `PokemonCard` - For card-style sections
✅ **USE**: `PokemonPageContainer` - For entire page layout

## IMPLEMENTATION STRATEGY:

### Phase 1: Extract Header Section
- Replace lines 550-649 with `GlassmorphismHeader`
- Replace action buttons with `FormActionButtons`
- Estimated reduction: ~100 lines

### Phase 2: Extract Image Gallery 
- Replace massive image section with `ImageProductView`
- Use existing showActions prop for download button
- Estimated reduction: ~200 lines

### Phase 3: Extract Basic Info Sections
- Replace "Essential Details" section with `PokemonCard`
- Replace "Premium Basic Information" with `ItemDetailSection`
- Estimated reduction: ~150 lines

### Phase 4: Use Page Container
- Wrap entire component in `PokemonPageContainer`
- Remove custom background and layout code
- Estimated reduction: ~100 lines

## TOTAL ESTIMATED REDUCTION: ~550 lines (from 1052 to ~500 lines)

## COMPONENTS READY TO USE:
1. ✅ `GlassmorphismHeader` - src/components/common/GlassmorphismHeader.tsx
2. ✅ `FormActionButtons` - src/components/common/FormActionButtons.tsx  
3. ✅ `ImageProductView` - src/components/common/ImageProductView.tsx
4. ✅ `PokemonCard` - src/components/design-system/PokemonCard.tsx
5. ✅ `PokemonPageContainer` - src/components/design-system/PokemonPageContainer.tsx
6. ✅ `ItemDetailSection` - src/components/collection/ItemDetailSection.tsx (already used)