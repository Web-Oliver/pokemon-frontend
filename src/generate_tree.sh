#!/bin/bash

# Define the output file name
OUTPUT_FILE="file_tree.txt"

echo "Generating file tree for the current directory and its subdirectories..."
echo "Output will be saved to: $OUTPUT_FILE"
echo ""

# Check if the 'tree' command is available
if command -v tree &> /dev/null
then
    echo "Using 'tree' command for a formatted output."
    # Use 'tree' command, excluding node_modules and .git directories
    tree -a -I 'node_modules|.git' > "$OUTPUT_FILE"
else
    echo "The 'tree' command is not installed. Falling back to 'find' and 'sed'."
    echo "You can install 'tree' for a nicer output (e.g., sudo apt install tree on Debian/Ubuntu)."
    echo ""

    # Fallback using find and sed to create a tree-like structure
    # Exclude node_modules and .git directories
    find . -path "./node_modules" -prune -o -path "./.git" -prune -o -print | sed -e 's/[^-][^\/]*\//--/g' -e 's/^/|/' -e 's/--/|--/g' > "$OUTPUT_FILE"
fi

echo "File tree generation complete. Check '$OUTPUT_FILE' for the output."