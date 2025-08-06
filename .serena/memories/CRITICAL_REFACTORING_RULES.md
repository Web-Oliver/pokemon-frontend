# CRITICAL REFACTORING RULES - NEVER VIOLATE

## GOLDEN RULE: ALWAYS FIX THE REAL FILES
- NEVER create "Refactored" or "Enhanced" files
- ALWAYS update the actual source files directly
- ALWAYS search for duplicate patterns across the entire codebase
- ALWAYS consolidate ALL instances of duplication, not just one file

## MANDATORY SEARCH PROCESS
1. **SEARCH FIRST**: Use search tools to find ALL instances of duplicate code patterns
2. **CATALOG ALL**: Document every file that contains the duplicate pattern
3. **FIX ALL**: Update every single instance, not just the first one found
4. **VERIFY**: Search again to ensure no duplicates remain

## REAL FILE UPDATES ONLY
- Edit actual components in their real locations
- Update existing files directly using Edit/MultiEdit tools
- Never create parallel "refactored" versions
- Fix the source of truth, not copies

## COMPREHENSIVE DEDUPLICATION
- Search for glassmorphism patterns across ALL components
- Search for repeated CSS classes and styling
- Search for duplicate JSX structures
- Search for repeated logic patterns
- Consolidate EVERYTHING into existing unified components

## EXISTING COMPONENT USAGE
- ALWAYS check what components already exist before creating new ones
- Use DashboardStatCard, ActivityListItem, UnifiedCard, UnifiedHeader, etc.
- Leverage the existing design system completely
- Never duplicate functionality that already exists

## VIOLATION CONSEQUENCES
Creating "Refactored" files or not searching for all duplicates is a CRITICAL FAILURE of DRY and SOLID principles.