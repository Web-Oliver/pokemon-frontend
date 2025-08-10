#!/bin/bash

# Comprehensive Frontend Analysis Script
# Based on ChatGPT's restructure analysis plan
# Generates data-driven insights for frontend migration

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Starting Comprehensive Frontend Analysis${NC}"
echo "=================================================="

# Create audit reports directory
AUDIT_DIR="audit-reports"
rm -rf "$AUDIT_DIR"
mkdir -p "$AUDIT_DIR"
echo -e "${GREEN}📁 Created audit reports directory: $AUDIT_DIR${NC}"

# 1) FILE INVENTORY - Create CSV with file metrics
echo -e "${YELLOW}📊 Step 1: Creating file inventory...${NC}"
echo "file_path,lines,size_kb,last_commit,owner,extension" > "$AUDIT_DIR/src_inventory.csv"

find src -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" \) | while read f; do
  lines=$(wc -l < "$f" 2>/dev/null || echo "0")
  size_kb=$(du -k "$f" 2>/dev/null | cut -f1 || echo "0")
  last_commit=$(git log -1 --format="%cI" -- "$f" 2>/dev/null || echo "")
  owner=$(git log -1 --pretty=format:'%an' -- "$f" 2>/dev/null || echo "")
  extension="${f##*.}"
  printf '"%s",%d,%s,"%s","%s","%s"\n' "$f" "$lines" "$size_kb" "$last_commit" "$owner" "$extension"
done >> "$AUDIT_DIR/src_inventory.csv"

echo -e "${GREEN}✅ File inventory created: $AUDIT_DIR/src_inventory.csv${NC}"

# 2) DEPENDENCY ANALYSIS
echo -e "${YELLOW}🔗 Step 2: Analyzing dependencies...${NC}"

# Install analysis tools if needed
echo "Installing analysis tools..."
npm install --save-dev madge jscpd depcheck @typescript-eslint/parser ts-prune plato

# Check for unused dependencies
echo "Checking unused dependencies..."
npx depcheck > "$AUDIT_DIR/unused-dependencies.txt" 2>&1 || true

# Find circular dependencies
echo "Finding circular dependencies..."
npx madge --circular src/ > "$AUDIT_DIR/circular-dependencies.txt" 2>&1 || true

# Create dependency graph
echo "Creating dependency graph..."
npx madge --image "$AUDIT_DIR/dependency-graph.svg" src/ 2>/dev/null || true

# Create dependency tree JSON
npx madge --json src/ > "$AUDIT_DIR/dependency-tree.json" 2>/dev/null || true

echo -e "${GREEN}✅ Dependency analysis completed${NC}"

# 3) DUPLICATE DETECTION
echo -e "${YELLOW}🔄 Step 3: Detecting duplicates...${NC}"
npx jscpd --min-tokens 50 --reporters json,html --output "$AUDIT_DIR" src/ || true
echo -e "${GREEN}✅ Duplicate detection completed: $AUDIT_DIR/jscpd-report.json${NC}"

# 4) STATIC ANALYSIS & LINTING
echo -e "${YELLOW}🔍 Step 4: Running static analysis...${NC}"
npx eslint 'src/**/*.{js,jsx,ts,tsx}' -f json -o "$AUDIT_DIR/eslint-report.json" || true
echo -e "${GREEN}✅ ESLint analysis completed${NC}"

# 5) COMPLEXITY ANALYSIS
echo -e "${YELLOW}📈 Step 5: Analyzing complexity...${NC}"
# Using plato for complexity analysis
npx plato -r -d "$AUDIT_DIR/complexity-report" src/ || true
echo -e "${GREEN}✅ Complexity analysis completed${NC}"

# 6) UNUSED EXPORTS (TypeScript)
echo -e "${YELLOW}🗑️ Step 6: Finding unused exports...${NC}"
if [ -f "tsconfig.json" ]; then
    npx ts-prune > "$AUDIT_DIR/unused-exports.txt" 2>&1 || true
    echo -e "${GREEN}✅ Unused exports analysis completed${NC}"
else
    echo "No TypeScript config found, skipping unused exports analysis"
fi

# 7) BUNDLE ANALYSIS SETUP
echo -e "${YELLOW}📦 Step 7: Setting up bundle analysis...${NC}"
if [ -f "vite.config.ts" ] || [ -f "vite.config.js" ]; then
    # For Vite projects
    npm install --save-dev rollup-plugin-visualizer
    echo -e "${BLUE}📝 Add this to your vite.config.ts for bundle analysis:
import { visualizer } from 'rollup-plugin-visualizer';

plugins: [
  // ... other plugins
  visualizer({ filename: 'audit-reports/bundle-analysis.html', open: false })
]${NC}"
fi

# 8) GENERATE SUMMARY REPORT
echo -e "${YELLOW}📋 Step 8: Generating summary report...${NC}"

cat > "$AUDIT_DIR/analysis-summary.md" << 'EOF'
# Frontend Analysis Summary

This report provides a comprehensive analysis of the current frontend structure.

## Key Files Generated

- `src_inventory.csv` - Complete file inventory with metrics
- `dependency-graph.svg` - Visual dependency graph
- `circular-dependencies.txt` - Circular dependency issues
- `unused-dependencies.txt` - Unused npm dependencies
- `jscpd-report.json/html` - Code duplication analysis
- `eslint-report.json` - Code quality issues
- `complexity-report/` - Complexity analysis (HTML reports)
- `unused-exports.txt` - Unused TypeScript exports

## Next Steps

1. Open `src_inventory.csv` in Excel/Google Sheets
2. Add these columns for decision making:
   - `component_name` - Human readable name
   - `used_by` - Which pages/features use this
   - `duplication_found` - Link to jscpd findings
   - `deps_count` - How many files import this
   - `risk` - (low/medium/high) based on complexity + dependencies
   - `suggested_action` - (keep/merge/rewrite/delete)
   - `priority` - (1-5) for migration order

3. Review dependency graph to understand code relationships
4. Check circular dependencies for refactoring priorities
5. Use duplicate analysis to merge similar components
6. Plan migration starting with low-risk, high-benefit items

## Risk Assessment Criteria

**Low Risk**: Small files, few dependencies, good test coverage, recent commits
**Medium Risk**: Moderate complexity, some dependencies, mixed test coverage
**High Risk**: Large files, many dependencies, high complexity, low test coverage

Start migration with low-risk items first!
EOF

# Count files and generate statistics
TOTAL_FILES=$(find src -name "*.{js,jsx,ts,tsx}" | wc -l)
TOTAL_LINES=$(find src -name "*.{js,jsx,ts,tsx}" -exec wc -l {} + 2>/dev/null | tail -1 | awk '{print $1}' || echo "0")

cat >> "$AUDIT_DIR/analysis-summary.md" << EOF

## Project Statistics

- **Total Files**: $TOTAL_FILES
- **Total Lines of Code**: $TOTAL_LINES
- **Analysis Date**: $(date)

## Quick Wins to Look For

1. **Duplicate Components** - Check jscpd-report.html for merge candidates
2. **Unused Files** - Files with 0 imports (check dependency analysis)
3. **Large Files** - Files >200 lines (check src_inventory.csv)
4. **Complex Files** - High cyclomatic complexity (check complexity-report/)
5. **Circular Dependencies** - Break these first for cleaner architecture

EOF

echo -e "${GREEN}✅ Summary report generated: $AUDIT_DIR/analysis-summary.md${NC}"

# 9) CREATE MIGRATION TEMPLATE
echo -e "${YELLOW}📝 Step 9: Creating migration planning template...${NC}"

cat > "$AUDIT_DIR/migration-planning-template.csv" << 'EOF'
file_path,component_name,current_purpose,used_by,duplication_found,deps_in,deps_out,complexity_score,test_coverage,risk_level,suggested_action,new_location,migration_priority,migration_phase,notes
EOF

echo -e "${GREEN}✅ Migration template created: $AUDIT_DIR/migration-planning-template.csv${NC}"

# 10) FINAL SUMMARY
echo
echo -e "${BLUE}🎉 ANALYSIS COMPLETE!${NC}"
echo "=================================================="
echo -e "${GREEN}All reports generated in: $AUDIT_DIR/${NC}"
echo
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Open $AUDIT_DIR/analysis-summary.md for overview"
echo "2. Review $AUDIT_DIR/dependency-graph.svg for architecture understanding"
echo "3. Fill out $AUDIT_DIR/migration-planning-template.csv with decisions"
echo "4. Start migration with low-risk, high-impact components"
echo
echo -e "${BLUE}Key Files to Review First:${NC}"
echo "📊 $AUDIT_DIR/src_inventory.csv - File metrics"
echo "🔄 $AUDIT_DIR/jscpd-report.html - Duplicates (open in browser)"
echo "🔗 $AUDIT_DIR/dependency-graph.svg - Architecture visualization"
echo "📈 $AUDIT_DIR/complexity-report/index.html - Complexity analysis"
echo
echo -e "${GREEN}Happy refactoring! 🚀${NC}"