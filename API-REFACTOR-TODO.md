# API CONSOLIDATION VERIFICATION TODO

**CRITICAL: 100% VERIFY BEFORE DELETE**

Each file must be:
1. ☑️ READ and analyzed for functionality
2. ☑️ VERIFY functionality exists in UnifiedApiService 
3. ☑️ CHECK for active imports/usage in codebase
4. ☑️ MARK SAFE TO DELETE or KEEP

## SECTION 1: API CLIENT FILES (src/shared/api/)

### Core API Files
- [x] **src/shared/api/TypeSafeApiClient.ts** - READ ✅ VERIFY ✅ CHECK IMPORTS ✅ DECISION ✅ **SAFE TO DELETE** (Type-safe wrapper not used, UnifiedApiService handles HTTP differently)
- [x] **src/shared/api/activityApi.ts** - READ ✅ VERIFY ❌ CHECK IMPORTS ✅ DECISION ✅ **NEEDS MIGRATION** (12+ activity functions missing from UnifiedApiService, used by useActivity.ts)
- [ ] **src/shared/api/auctionsApi.ts** - READ ❌ VERIFY ❌ CHECK IMPORTS ❌ DECISION ❌
- [ ] **src/shared/api/cardsApi.ts** - READ ❌ VERIFY ❌ CHECK IMPORTS ❌ DECISION ❌
- [ ] **src/shared/api/dbaSelectionApi.ts** - READ ❌ VERIFY ❌ CHECK IMPORTS ❌ DECISION ❌
- [ ] **src/shared/api/exportApi.ts** - READ ❌ VERIFY ❌ CHECK IMPORTS ❌ DECISION ❌
- [ ] **src/shared/api/genericApiOperations.ts** - READ ❌ VERIFY ❌ CHECK IMPORTS ❌ DECISION ❌
- [ ] **src/shared/api/salesApi.ts** - READ ❌ VERIFY ❌ CHECK IMPORTS ❌ DECISION ❌
- [ ] **src/shared/api/setProductsApi.ts** - READ ❌ VERIFY ❌ CHECK IMPORTS ❌ DECISION ❌
- [ ] **src/shared/api/statusApi.ts** - READ ❌ VERIFY ❌ CHECK IMPORTS ❌ DECISION ❌
- [ ] **src/shared/api/unifiedApiClient.ts** - READ ❌ VERIFY ❌ CHECK IMPORTS ❌ DECISION ❌
- [ ] **src/shared/api/uploadApi.ts** - READ ❌ VERIFY ❌ CHECK IMPORTS ❌ DECISION ❌

### Specialized API Files
- [ ] **src/shared/api/cardMarket/cardMarketApi.ts** - READ ❌ VERIFY ❌ CHECK IMPORTS ❌ DECISION ❌

## SECTION 2: INTERFACE FILES (src/shared/interfaces/api/)

- [ ] **src/shared/interfaces/api/ICollectionApiService.ts** - READ ❌ VERIFY ❌ CHECK IMPORTS ❌ DECISION ❌
- [ ] **src/shared/interfaces/api/IExportApiService.ts** - READ ❌ VERIFY ❌ CHECK IMPORTS ❌ DECISION ❌
- [ ] **src/shared/interfaces/api/ISearchApiService.ts** - READ ❌ VERIFY ❌ CHECK IMPORTS ❌ DECISION ❌
- [ ] **src/shared/interfaces/api/ISetProductApiService.ts** - READ ❌ VERIFY ❌ CHECK IMPORTS ❌ DECISION ❌
- [ ] **src/shared/interfaces/api/IUploadApiService.ts** - READ ❌ VERIFY ❌ CHECK IMPORTS ❌ DECISION ❌

## SECTION 3: SERVICE FILES (src/shared/services/)

### Main Service Files
- [ ] **src/shared/services/CollectionApiService.ts** - READ ❌ VERIFY ❌ CHECK IMPORTS ❌ DECISION ❌
- [ ] **src/shared/services/CompositeCollectionApiService.ts** - READ ❌ VERIFY ❌ CHECK IMPORTS ❌ DECISION ❌
- [ ] **src/shared/services/ExportApiService.ts** - READ ❌ VERIFY ❌ CHECK IMPORTS ❌ DECISION ❌
- [ ] **src/shared/services/SearchApiService.ts** - READ ❌ VERIFY ❌ CHECK IMPORTS ❌ DECISION ❌
- [ ] **src/shared/services/SetProductApiService.ts** - READ ❌ VERIFY ❌ CHECK IMPORTS ❌ DECISION ❌
- [ ] **src/shared/services/UploadApiService.ts** - READ ❌ VERIFY ❌ CHECK IMPORTS ❌ DECISION ❌

### Base Service Files
- [ ] **src/shared/services/base/BaseApiService.ts** - READ ❌ VERIFY ❌ CHECK IMPORTS ❌ DECISION ❌

### Collection Service Files
- [ ] **src/shared/services/collection/PsaCardApiService.ts** - READ ❌ VERIFY ❌ CHECK IMPORTS ❌ DECISION ❌
- [ ] **src/shared/services/collection/RawCardApiService.ts** - READ ❌ VERIFY ❌ CHECK IMPORTS ❌ DECISION ❌
- [ ] **src/shared/services/collection/SealedProductApiService.ts** - READ ❌ VERIFY ❌ CHECK IMPORTS ❌ DECISION ❌

## SECTION 4: TYPE FILES (src/types/api/)

- [ ] **src/types/api/ApiResponse.ts** - READ ❌ VERIFY ❌ CHECK IMPORTS ❌ DECISION ❌

## SECTION 5: TEST FILES (KEEP ALL)

- [x] **src/shared/services/__tests__/UnifiedApiService.test.ts** - KEEP ✅ (Test files are always kept)

## REFERENCE FILES (DO NOT DELETE)

- [x] **src/shared/services/UnifiedApiService.ts** - KEEP ✅ (This is the consolidated service)

## VERIFICATION PROCESS FOR EACH FILE:

### Step 1: READ
```bash
Read the file and analyze:
- What functions/methods does it export?
- What interfaces does it define?
- What is its purpose and functionality?
```

### Step 2: VERIFY 
```bash
Check if UnifiedApiService has equivalent functionality:
- Search for similar method names
- Check if interfaces are included
- Verify same behavior exists
```

### Step 3: CHECK IMPORTS
```bash
grep -r "from.*filename" src/
grep -r "import.*filename" src/
Find all places this file is imported/used
```

### Step 4: DECISION
- **SAFE TO DELETE**: Functionality is 100% in UnifiedApiService + no active imports
- **KEEP**: Still needed OR functionality missing from UnifiedApiService
- **NEEDS MIGRATION**: Active imports that need to be updated to UnifiedApiService

## PROGRESS TRACKER

**Total Files**: 30
**Files Checked**: 0/30 (0%)
**Safe to Delete**: 0
**Need Migration**: 0  
**Must Keep**: 1 (UnifiedApiService.ts)

## CURRENT STATUS

**READY TO START**: Begin with Section 1, File 1 (TypeSafeApiClient.ts)