#!/bin/bash

# enhanced_tree_analysis.sh - Comprehensive code analysis for surgical cleanup planning
# Generates: LOC, duplication, imports, usage, complexity, git churn, test coverage
# Following ShellCheck best practices and bash error handling patterns

set -euo pipefail  # Exit on error, undefined vars, pipe failures

# Colors for output
readonly GREEN='\033[0;32m'
readonly BLUE='\033[0;34m'
readonly YELLOW='\033[1;33m'
readonly RED='\033[0;31m'
readonly NC='\033[0m'

# Global variables
declare -g MAIN_REPORT
declare -g RAW_DATA_DIR
declare -g OUTPUT_DIR
declare -g QUICK_SUMMARY

# Error handling function
error_exit() {
    echo -e "${RED}ERROR: $1${NC}" >&2
    exit 1
}

# Cleanup function for temporary files
cleanup() {
    local exit_code=$?
    if [[ -n "${TEMP_FILES:-}" ]]; then
        # shellcheck disable=SC2086
        rm -f $TEMP_FILES 2>/dev/null || true
    fi
    exit $exit_code
}

# Set up trap for cleanup
trap cleanup EXIT INT TERM

echo -e "${GREEN}🔍 Starting comprehensive code analysis...${NC}"

# Validate requirements
if [[ ! -d "src" ]]; then
    error_exit "src directory not found in current location: $(pwd)"
fi

# Create timestamp for output files
readonly TIMESTAMP=$(date "+%Y%m%d_%H%M%S")
readonly OUTPUT_DIR="analysis_${TIMESTAMP}"

if ! mkdir -p "$OUTPUT_DIR"; then
    error_exit "Failed to create output directory: $OUTPUT_DIR"
fi

readonly MAIN_REPORT="$OUTPUT_DIR/comprehensive_analysis.txt"
readonly RAW_DATA_DIR="$OUTPUT_DIR/raw_data"
readonly QUICK_SUMMARY="$OUTPUT_DIR/ai_cleanup_plan.txt"

if ! mkdir -p "$RAW_DATA_DIR"; then
    error_exit "Failed to create raw data directory: $RAW_DATA_DIR"
fi

# Function to safely get line count
get_line_count() {
    local file="$1"
    if [[ -f "$file" && -r "$file" ]]; then
        wc -l < "$file" 2>/dev/null || echo "0"
    else
        echo "0"
    fi
}

# Function to count imports with better pattern matching
count_imports() {
    local file="$1"
    if [[ -f "$file" && -r "$file" ]]; then
        # Count various import patterns: import, require, from...import
        grep -cE "^[[:space:]]*(import|const.*require|from.*import)" "$file" 2>/dev/null || echo "0"
    else
        echo "0"
    fi
}

# Function to find files that import a given file (comprehensive TypeScript/JavaScript analysis)
count_usages() {
    local target_file="$1"
    local count=0
    local basename filename_no_ext relative_path
    
    basename=$(basename "$target_file")
    filename_no_ext="${basename%.*}"
    relative_path="${target_file#src/}"
    relative_path="${relative_path%.*}"  # Remove extension for import matching
    
    # Create comprehensive regex patterns based on ast-grep research
    local patterns=(
        # Standard ES6 imports: import { X } from './path'
        "from ['\"][^'\"]*${filename_no_ext}['\"]"
        # Dynamic imports: import('./path')
        "import\\(['\"][^'\"]*${filename_no_ext}['\"]\\)"
        # Require: const X = require('./path')
        "require\\(['\"][^'\"]*${filename_no_ext}['\"]\\)"
        # Relative path imports: from '../components/X'
        "from ['\"][^'\"]*/${filename_no_ext}['\"]"
        # Exact relative path match
        "from ['\"]\\.\\.?/${relative_path}['\"]"
        # Import with extension variations
        "from ['\"][^'\"]*${filename_no_ext}\\.(ts|tsx|js|jsx)?['\"]"
        # Barrel imports via index
        "from ['\"][^'\"]*$(dirname "${relative_path}")['\"]"
    )
    
    # Search all TypeScript/JavaScript files
    while IFS= read -r -d '' file; do
        if [[ "$file" != "$target_file" && -f "$file" && -r "$file" ]]; then
            # Check each pattern
            for pattern in "${patterns[@]}"; do
                if grep -qE "$pattern" "$file" 2>/dev/null; then
                    ((count++))
                    break  # Found match, no need to check other patterns for this file
                fi
            done
        fi
    done < <(find src/ -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) -print0 2>/dev/null)
    
    echo "$count"
}

# Function to calculate cyclomatic complexity (enhanced)
calculate_complexity() {
    local file="$1"
    if [[ -f "$file" && -r "$file" ]]; then
        # Count decision points: if, while, for, case, catch, &&, ||, ?, switch
        local complexity
        complexity=$(grep -cE "(\\bif\\b|\\bwhile\\b|\\bfor\\b|\\bcase\\b|\\bcatch\\b|\\bswitch\\b|&&|\\|\\||\\?|\\btry\\b)" "$file" 2>/dev/null || echo "0")
        echo "$complexity"
    else
        echo "0"
    fi
}

# Function to get git churn with better error handling
get_git_churn() {
    local file="$1"
    if [[ -f "$file" ]] && git rev-parse --git-dir >/dev/null 2>&1; then
        git log --since="6 months ago" --oneline -- "$file" 2>/dev/null | wc -l || echo "0"
    else
        echo "0"
    fi
}

# Function to check if file has tests (improved detection)
has_tests() {
    local file="$1"
    local basename dir
    
    basename=$(basename "$file")
    basename="${basename%.*}"
    dir=$(dirname "$file")
    
    # Look for various test patterns
    if find "$dir" -name "*${basename}*.test.*" -o -name "*${basename}*.spec.*" -o -name "${basename}.test.*" -o -name "${basename}.spec.*" 2>/dev/null | grep -q .; then
        echo "✅"
    elif find . \( -path "*/test*" -o -path "*/__tests__/*" \) -name "*${basename}*" 2>/dev/null | grep -q .; then
        echo "✅"
    else
        echo "❌"
    fi
}

# Initialize main report with error handling
{
    cat << 'EOF'
=========================================================
🚀 COMPREHENSIVE CODE ANALYSIS FOR SURGICAL CLEANUP
=========================================================
EOF
    echo "Generated: $(date)"
    echo "Location: $(pwd)"
    echo ""
} > "$MAIN_REPORT" || error_exit "Failed to write to main report"

echo -e "${BLUE}📊 Step 1: Generating file structure with line counts...${NC}"

echo -e "${BLUE}📊 Step 2: Analyzing duplication with jscpd...${NC}"

# Run duplication analysis with error handling
if command -v jscpd >/dev/null 2>&1; then
    jscpd src/ --output "$RAW_DATA_DIR/duplication.json" --format json --min-lines 5 --min-tokens 50 2>/dev/null || {
        echo -e "${YELLOW}Warning: jscpd analysis failed${NC}" >&2
    }
else
    echo -e "${YELLOW}jscpd not available - skipping duplication analysis${NC}" >&2
fi

echo -e "${BLUE}📊 Step 3: Analyzing import dependencies with madge...${NC}"

# Run dependency analysis with error handling
if command -v madge >/dev/null 2>&1; then
    madge src/ --json > "$RAW_DATA_DIR/dependencies.json" 2>/dev/null || {
        echo -e "${YELLOW}Warning: madge analysis failed${NC}" >&2
    }
    madge src/ --circular --json > "$RAW_DATA_DIR/circular.json" 2>/dev/null || {
        echo -e "${YELLOW}Warning: circular dependency check failed${NC}" >&2
    }
else
    echo -e "${YELLOW}madge not available - skipping dependency analysis${NC}" >&2
fi

echo -e "${BLUE}📊 Step 4: Generating comprehensive report...${NC}"

# Create temporary files for data collection
readonly TEMP_FILES=$(mktemp -t analysis.XXXXXX) || error_exit "Failed to create temporary file"
readonly TEMP_PRIORITY=$(mktemp -t priority.XXXXXX) || error_exit "Failed to create temporary file"

# Generate comprehensive analysis with improved error handling
{
    cat << 'EOF'
=========================================================
📋 DETAILED FILE ANALYSIS
=========================================================

EOF
    printf "%-50s %6s %6s %6s %6s %6s %5s %6s\n" "FILE" "LINES" "IMPTS" "USAGE" "CMPLX" "CHURN" "TESTS" "SCORE"
    printf "%-50s %6s %6s %6s %6s %6s %5s %6s\n" "$(printf '%50s' | tr ' ' '-')" "------" "------" "------" "------" "------" "-----" "------"
    
    # Process all TypeScript/JavaScript files with null delimiter for safety
    while IFS= read -r -d '' file; do
        # Skip problematic paths
        case "$file" in
            *node_modules*|*/.git/*|*/dist/*|*/build/*|*/coverage/*)
                continue
                ;;
        esac
        
        # Get metrics with error handling
        local lines imports usage complexity churn tests score display_path
        
        lines=$(get_line_count "$file")
        imports=$(count_imports "$file")
        usage=$(count_usages "$file")
        complexity=$(calculate_complexity "$file")
        churn=$(get_git_churn "$file")
        tests=$(has_tests "$file")
        
        # Calculate priority score with safe arithmetic
        if [[ "$lines" -gt 0 && "$usage" -gt 0 && "$complexity" -gt 0 ]]; then
            score=$(( (lines * usage * complexity / 10) + (churn * 10) ))
        else
            score=$((churn * 10))
        fi
        
        # Format file path safely
        display_path="${file#src/}"
        if [[ ${#display_path} -gt 49 ]]; then
            display_path="...${display_path: -46}"
        fi
        
        printf "%-50s %6s %6s %6s %6s %6s %5s %6s\n" "$display_path" "$lines" "$imports" "$usage" "$complexity" "$churn" "$tests" "$score"
        
        # Store data for summary
        echo "$lines" >> "$TEMP_FILES"
        
        # Track high-priority files
        if [[ "$score" -gt 100 ]]; then
            echo "$display_path:$score:$lines:$usage" >> "$TEMP_PRIORITY"
        fi
    done < <(find src/ -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) -print0 2>/dev/null)
    
    # Calculate totals safely
    local total_files total_lines
    total_files=$(wc -l < "$TEMP_FILES" 2>/dev/null || echo "0")
    total_lines=$(awk '{sum += $1} END {print sum+0}' "$TEMP_FILES" 2>/dev/null || echo "0")
    
    echo ""
    echo "========================================================="
    echo "🎯 HIGH-PRIORITY CLEANUP CANDIDATES"
    echo "========================================================="
    echo ""
    
    if [[ -s "$TEMP_PRIORITY" ]]; then
        echo "Files ranked by cleanup impact (Score = Lines × Usage × Complexity + Git Churn):"
        echo ""
        printf "%-50s %8s %8s %8s\n" "FILE" "SCORE" "LINES" "USAGE"
        printf "%-50s %8s %8s %8s\n" "$(printf '%50s' | tr ' ' '-')" "--------" "--------" "--------"
        
        # Sort high-priority files safely
        sort -t: -k2 -nr "$TEMP_PRIORITY" | head -20 | while IFS=: read -r file score lines usage; do
            printf "%-50s %8s %8s %8s\n" "$file" "$score" "$lines" "$usage"
        done
    else
        echo "No high-priority files found (all scores < 100)"
    fi
    
    echo ""
    echo "========================================================="
    echo "📊 SUMMARY STATISTICS"
    echo "========================================================="
    echo ""
    echo "Total files analyzed: $total_files"
    echo "Total lines of code: $total_lines"
    if [[ "$total_files" -gt 0 ]]; then
        echo "Average file size: $(( total_lines / total_files )) lines"
    else
        echo "Average file size: 0 lines"
    fi
    
    local priority_count
    priority_count=$(wc -l < "$TEMP_PRIORITY" 2>/dev/null || echo "0")
    echo "High-priority files: $priority_count"
    
    echo ""
    echo "🔥 TOP RECOMMENDATIONS:"
    echo "1. Focus on files with Score > 100 (high lines × usage × complexity)"
    echo "2. Look for similar file names in high-usage files"
    echo "3. Files with high churn (>5) but no tests need attention"
    echo "4. Large files (>200 lines) with low usage (<3) might be over-engineered"
    
    echo ""
    echo "========================================================="
    echo "🛠️ NEXT STEPS FOR SURGICAL CLEANUP"
    echo "========================================================="
    echo ""
    echo "1. Review high-priority files for duplication opportunities"
    echo "2. Check circular dependencies in: $RAW_DATA_DIR/circular.json"
    echo "3. Analyze detailed duplication report in: $RAW_DATA_DIR/"
    echo "4. Use this data to create targeted merge/refactor plan"
    
} >> "$MAIN_REPORT" || error_exit "Failed to append to main report"

echo -e "${GREEN}✅ Analysis complete!${NC}"
echo -e "${BLUE}📁 Main report: $MAIN_REPORT${NC}"
echo -e "${BLUE}📁 Raw data: $RAW_DATA_DIR/${NC}"
echo ""

# Show preview
echo -e "${YELLOW}📋 Preview (first 30 lines):${NC}"
head -30 "$MAIN_REPORT"
echo "..."
echo -e "${BLUE}[Full report saved to $MAIN_REPORT]${NC}"

# Generate quick summary for AI with error handling
{
    echo "🤖 AI CLEANUP PLAN - QUICK REFERENCE"
    echo "===================================="
    echo ""
    echo "HIGH-PRIORITY TARGETS:"
    
    if [[ -s "$TEMP_PRIORITY" ]]; then
        sort -t: -k2 -nr "$TEMP_PRIORITY" | head -10 | while IFS=: read -r file score lines usage; do
            echo "• $file (Score: $score, Lines: $lines, Used in: $usage files)"
        done
    else
        echo "• No high-priority files found (all scores < 100)"
    fi
    
    echo ""
    echo "FOCUS AREAS:"
    echo "1. Files with highest Score = Lines × Usage × Complexity"
    echo "2. Look for duplicate patterns in high-usage files"
    echo "3. Merge opportunities in similar file names"
    echo "4. Extract common logic from high-complexity files"
} > "$QUICK_SUMMARY" || error_exit "Failed to write quick summary"

echo -e "${GREEN}🚀 Quick AI summary: $QUICK_SUMMARY${NC}"