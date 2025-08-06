#!/bin/bash

# Define the output file name
OUTPUT_FILE="duplication_analysis.txt"

echo "Generating code duplication and refactoring analysis..."
echo "Output will be saved to: $OUTPUT_FILE"

# Initialize output file
echo "CODE DUPLICATION ANALYSIS - $(date)" > "$OUTPUT_FILE"
echo "=== REFACTORING OPPORTUNITIES ===" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# 1. Find similar function names (potential duplication)
echo "SIMILAR FUNCTION PATTERNS:" >> "$OUTPUT_FILE"
find . -name "*.ts*" -not -path "./node_modules/*" -exec grep -H "^export.*function\|^const.*=.*=>" {} \; 2>/dev/null | \
    sed 's/.*\/\([^/]*\):/\1: /' | \
    grep -E "(handle|use|get|set|create|update|delete|fetch|submit)" | \
    sort | head -20 >> "$OUTPUT_FILE"

echo "" >> "$OUTPUT_FILE"

# 2. API call patterns
echo "API CALL PATTERNS (potential consolidation):" >> "$OUTPUT_FILE"
find . -name "*.ts*" -not -path "./node_modules/*" -exec grep -H -n "\.get\|\.post\|\.put\|\.delete\|fetch(" {} \; 2>/dev/null | \
    head -15 | sed 's|^\./||' >> "$OUTPUT_FILE"

echo "" >> "$OUTPUT_FILE"

# 3. Form handling patterns
echo "FORM HANDLING PATTERNS:" >> "$OUTPUT_FILE"
find . -name "*.ts*" -not -path "./node_modules/*" -exec grep -H -n "useState.*Form\|handleSubmit\|onSubmit\|formData" {} \; 2>/dev/null | \
    head -10 | sed 's|^\./||' >> "$OUTPUT_FILE"

echo "" >> "$OUTPUT_FILE"

# 4. Similar component structures
echo "COMPONENT PATTERNS (similar structures):" >> "$OUTPUT_FILE"
find . -name "*.tsx" -not -path "./node_modules/*" | while read file; do
    comp_name=$(basename "$file" .tsx)
    props_count=$(grep -c "interface.*Props\|type.*Props" "$file" 2>/dev/null)
    state_count=$(grep -c "useState\|useEffect" "$file" 2>/dev/null)
    if [ "$props_count" -gt 0 ] || [ "$state_count" -gt 2 ]; then
        echo "$file: Props=$props_count, Hooks=$state_count" >> "$OUTPUT_FILE"
    fi
done | head -15

echo "" >> "$OUTPUT_FILE"

# 5. Repeated imports (common dependencies)
echo "MOST COMMON IMPORTS (consolidation candidates):" >> "$OUTPUT_FILE"
find . -name "*.ts*" -not -path "./node_modules/*" -exec grep -h "^import.*from" {} \; 2>/dev/null | \
    sort | uniq -c | sort -nr | head -10 | \
    sed 's/^[[:space:]]*[0-9]*[[:space:]]*//' >> "$OUTPUT_FILE"

echo "" >> "$OUTPUT_FILE"

# 6. Error handling patterns
echo "ERROR HANDLING PATTERNS:" >> "$OUTPUT_FILE"
find . -name "*.ts*" -not -path "./node_modules/*" -exec grep -H -n "try.*catch\|\.catch(\|throw.*Error" {} \; 2>/dev/null | \
    head -8 | sed 's|^\./||' >> "$OUTPUT_FILE"

echo "" >> "$OUTPUT_FILE"

# 7. State management patterns
echo "STATE MANAGEMENT PATTERNS:" >> "$OUTPUT_FILE"
find . -name "*.ts*" -not -path "./node_modules/*" -exec grep -H -n "useState.*\[\]\|useState.*{}\|useState.*null\|useState.*false\|useState.*true" {} \; 2>/dev/null | \
    head -10 | sed 's|^\./||' >> "$OUTPUT_FILE"

echo "" >> "$OUTPUT_FILE"

# 8. Validation patterns
echo "VALIDATION PATTERNS:" >> "$OUTPUT_FILE"
find . -name "*.ts*" -not -path "./node_modules/*" -exec grep -H -n "validate\|isValid\|error.*required\|\.trim()\|\.length" {} \; 2>/dev/null | \
    head -8 | sed 's|^\./||' >> "$OUTPUT_FILE"

echo "" >> "$OUTPUT_FILE"

# 9. Loading/Loading states
echo "LOADING STATE PATTERNS:" >> "$OUTPUT_FILE"
find . -name "*.ts*" -not -path "./node_modules/*" -exec grep -H -n "loading\|isLoading\|pending" {} \; 2>/dev/null | \
    head -8 | sed 's|^\./||' >> "$OUTPUT_FILE"

echo "" >> "$OUTPUT_FILE"

# 10. File statistics for context
echo "CONTEXT STATS:" >> "$OUTPUT_FILE"
echo "Total TS/TSX files: $(find . -name "*.ts*" -not -path "./node_modules/*" | wc -l)" >> "$OUTPUT_FILE"
echo "Components (.tsx): $(find . -name "*.tsx" -not -path "./node_modules/*" | wc -l)" >> "$OUTPUT_FILE"
echo "Hooks (use*): $(find . -name "use*.ts*" -not -path "./node_modules/*" | wc -l)" >> "$OUTPUT_FILE"
echo "APIs (*api*): $(find . -name "*api*.ts*" -o -name "*Api*.ts*" -not -path "./node_modules/*" | wc -l)" >> "$OUTPUT_FILE"

echo "" >> "$OUTPUT_FILE"

# 11. Specific code snippets for common patterns
echo "CODE SNIPPETS FOR REVIEW:" >> "$OUTPUT_FILE"
echo "--- useState patterns ---" >> "$OUTPUT_FILE"
find . -name "*.ts*" -not -path "./node_modules/*" -exec grep -A 1 -B 1 "useState.*\[\]" {} \; 2>/dev/null | head -6 >> "$OUTPUT_FILE"

echo "" >> "$OUTPUT_FILE"
echo "--- API call patterns ---" >> "$OUTPUT_FILE"
find . -name "*.ts*" -not -path "./node_modules/*" -exec grep -A 2 -B 1 "\.get\|\.post" {} \; 2>/dev/null | head -8 >> "$OUTPUT_FILE"

echo "" >> "$OUTPUT_FILE"
echo "=== REFACTORING RECOMMENDATIONS ===" >> "$OUTPUT_FILE"
echo "1. Extract common API patterns into generic hooks" >> "$OUTPUT_FILE"
echo "2. Create shared form validation utilities" >> "$OUTPUT_FILE"
echo "3. Consolidate loading state management" >> "$OUTPUT_FILE"
echo "4. Create generic error handling service" >> "$OUTPUT_FILE"
echo "5. Extract common component patterns into base components" >> "$OUTPUT_FILE"

echo "" >> "$OUTPUT_FILE"
echo "ANALYSIS COMPLETE" >> "$OUTPUT_FILE"

echo "Duplication analysis complete! Check '$OUTPUT_FILE' for concrete refactoring opportunities."