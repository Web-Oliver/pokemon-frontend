#!/bin/bash

# tree_generation.sh - Generate a comprehensive tree view of the src folder
# Usage: ./tree_generation.sh

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}Generating tree structure of src folder...${NC}"

# Create timestamp for the output file
TIMESTAMP=$(date "+%Y%m%d_%H%M%S")
OUTPUT_FILE="src_tree_${TIMESTAMP}.txt"

# Check if src directory exists
if [ ! -d "src" ]; then
    echo "Error: src directory not found in current location"
    echo "Current directory: $(pwd)"
    exit 1
fi

# Generate the tree and save to file
{
    echo "================================================"
    echo "Pokemon Collection Frontend - Source Tree"
    echo "Generated on: $(date)"
    echo "================================================"
    echo ""
    
    # Generate tree with line counts for files
    echo "Generating detailed tree with line counts..."
    echo ""
    
    # Function to get line count for a file
    get_line_count() {
        local file="$1"
        if [ -f "$file" ]; then
            wc -l < "$file" 2>/dev/null || echo "0"
        else
            echo ""
        fi
    }
    
    # Function to generate tree structure with line counts
    generate_tree_with_lines() {
        local dir="$1"
        local prefix="$2"
        local is_last="$3"
        
        # Get all items in directory, sorted (directories first)
        local items=($(find "$dir" -maxdepth 1 -mindepth 1 \( \
            -name "node_modules" -prune -o \
            -name ".git" -prune -o \
            -name "*.log" -prune -o \
            -name ".DS_Store" -prune -o \
            -name "dist" -prune -o \
            -name "build" -prune -o \
            -name "coverage" -prune -o \
            -print \) | sort))
        
        local count=${#items[@]}
        local i=0
        
        for item in "${items[@]}"; do
            i=$((i + 1))
            local basename=$(basename "$item")
            local is_last_item=false
            
            if [ $i -eq $count ]; then
                is_last_item=true
            fi
            
            if [ -d "$item" ]; then
                # Directory
                if $is_last_item; then
                    echo "${prefix}└── $basename/"
                    generate_tree_with_lines "$item" "${prefix}    " true
                else
                    echo "${prefix}├── $basename/"
                    generate_tree_with_lines "$item" "${prefix}│   " false
                fi
            else
                # File - get line count
                local line_count=$(get_line_count "$item")
                if $is_last_item; then
                    echo "${prefix}└── $basename ($line_count lines)"
                else
                    echo "${prefix}├── $basename ($line_count lines)"
                fi
            fi
        done
    }
    
    # Start the tree generation
    echo "src/"
    generate_tree_with_lines "src" "" true
    
    echo ""
    echo "================================================"
    echo "File Count Summary:"
    echo "================================================"
    
    # Count different file types
    echo "TypeScript files (.ts/.tsx): $(find src/ -name "*.ts" -o -name "*.tsx" | wc -l)"
    echo "JavaScript files (.js/.jsx): $(find src/ -name "*.js" -o -name "*.jsx" | wc -l)"
    echo "CSS/Style files: $(find src/ -name "*.css" -o -name "*.scss" -o -name "*.sass" | wc -l)"
    echo "JSON files: $(find src/ -name "*.json" | wc -l)"
    echo "Image files: $(find src/ -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.gif" -o -name "*.svg" | wc -l)"
    echo "Total files: $(find src/ -type f | wc -l)"
    echo "Total directories: $(find src/ -type d | wc -l)"
    
} > "$OUTPUT_FILE"

echo -e "${BLUE}Tree structure saved to: ${OUTPUT_FILE}${NC}"
echo -e "${GREEN}Summary:${NC}"
echo "- Output file: $OUTPUT_FILE"
echo "- Location: $(pwd)/$OUTPUT_FILE"

# Optional: Display first few lines of the generated file
echo ""
echo -e "${BLUE}Preview (first 20 lines):${NC}"
head -20 "$OUTPUT_FILE"
echo "..."
echo -e "${BLUE}[Full tree saved to $OUTPUT_FILE]${NC}"