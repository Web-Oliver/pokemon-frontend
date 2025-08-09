#!/bin/bash

# install_analysis_tools.sh - Install required tools for code analysis

echo "🔧 Installing code analysis tools..."

# Function to check if running in Node.js project
check_npm_project() {
    if [ ! -f "package.json" ]; then
        echo "Warning: No package.json found. Some tools may not install correctly."
        return 1
    fi
    return 0
}

# Install jscpd for duplication detection
echo "📦 Installing jscpd (JavaScript Copy/Paste Detector)..."
if command -v npm &> /dev/null; then
    npm install -g jscpd
else
    echo "❌ npm not found - cannot install jscpd"
fi

# Install madge for dependency analysis
echo "📦 Installing madge (Module Dependency Graph)..."
if command -v npm &> /dev/null; then
    npm install -g madge
else
    echo "❌ npm not found - cannot install madge"
fi

# Install depcheck for unused dependencies
echo "📦 Installing depcheck (Unused Dependency Checker)..."
if command -v npm &> /dev/null; then
    npm install -g depcheck
else
    echo "❌ npm not found - cannot install depcheck"
fi

# Install complexity-report for complexity metrics
echo "📦 Installing complexity-report..."
if command -v npm &> /dev/null; then
    npm install -g complexity-report
else
    echo "❌ npm not found - cannot install complexity-report"
fi

echo ""
echo "✅ Installation complete!"
echo ""
echo "Installed tools:"
echo "• jscpd - Detects copy-paste code duplication"
echo "• madge - Analyzes module dependencies and circular deps"
echo "• depcheck - Finds unused dependencies"
echo "• complexity-report - Calculates cyclomatic complexity"
echo ""
echo "Now run: ./enhanced_tree_analysis.sh"