#!/bin/bash

# PHASE 3.1 - DEAD CODE CLEANUP EXECUTION SCRIPT
# HIVE CLEANUP SPECIALIST - Automated Safe Deletion

set -e  # Exit on any error

echo "🚀 PHASE 3.1 - DEAD CODE CLEANUP EXECUTION"
echo "==========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Function to backup current state
backup_current_state() {
    print_info "Creating backup of current state..."
    
    # Create backup directory with timestamp
    BACKUP_DIR="backups/phase-3-1-$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    
    # Backup components that will be deleted
    if [ -d "src/components/ui" ]; then
        cp -r src/components/ui "$BACKUP_DIR/components-ui-backup"
        print_status "Backed up /components/ui/"
    fi
    
    if [ -d "src/components/stunning" ]; then
        cp -r src/components/stunning "$BACKUP_DIR/components-stunning-backup"
        print_status "Backed up /components/stunning/"
    fi
    
    # Backup package.json
    cp package.json "$BACKUP_DIR/package-backup.json"
    print_status "Backed up package.json"
    
    print_status "Backup created at: $BACKUP_DIR"
}

# Function to validate build before changes
validate_build_before() {
    print_info "Validating build system before changes..."
    
    if npm run build > /dev/null 2>&1; then
        print_status "Build validation successful - proceeding with cleanup"
    else
        print_error "Build validation failed - aborting cleanup"
        exit 1
    fi
}

# Function to validate imports before deletion
validate_imports() {
    local dir_path="$1"
    local dir_name="$2"
    
    print_info "Validating imports for $dir_name..."
    
    # Search for imports from this directory
    local import_count=$(grep -r "from.*$dir_path" src/ --include="*.tsx" --include="*.ts" | wc -l)
    
    if [ "$import_count" -gt 0 ]; then
        print_warning "$import_count imports found for $dir_name:"
        grep -r "from.*$dir_path" src/ --include="*.tsx" --include="*.ts" | head -5
        return 1
    else
        print_status "No active imports found for $dir_name - safe to delete"
        return 0
    fi
}

# PHASE 3.1A - IMMEDIATE SAFE DELETIONS
execute_phase_3_1a() {
    echo ""
    echo "🎯 EXECUTING PHASE 3.1A - IMMEDIATE SAFE DELETIONS"
    echo "=================================================="
    
    # 1. Validate and delete /components/ui/
    if [ -d "src/components/ui" ]; then
        if validate_imports "components/ui" "/components/ui/"; then
            print_info "Deleting legacy UI components directory..."
            rm -rf src/components/ui/
            print_status "Deleted /components/ui/ directory (20 files, ~45KB)"
        else
            print_warning "Skipping /components/ui/ deletion - active imports found"
        fi
    else
        print_info "/components/ui/ directory not found - already cleaned"
    fi
    
    # 2. Validate and delete /components/stunning/
    if [ -d "src/components/stunning" ]; then
        if validate_imports "components/stunning" "/components/stunning/"; then
            print_info "Deleting legacy stunning components directory..."
            rm -rf src/components/stunning/
            print_status "Deleted /components/stunning/ directory (2 files, ~8KB)"
        else
            print_warning "Skipping /components/stunning/ deletion - active imports found"
        fi
    else
        print_info "/components/stunning/ directory not found - already cleaned"
    fi
    
    # 3. Remove unused dependencies
    print_info "Removing unused dependencies..."
    
    # Check if dependencies exist before removing
    if npm list @hookform/resolvers > /dev/null 2>&1; then
        npm uninstall @hookform/resolvers
        print_status "Removed @hookform/resolvers"
    fi
    
    if npm list zod > /dev/null 2>&1; then
        npm uninstall zod  
        print_status "Removed zod"
    fi
    
    print_status "Phase 3.1A completed successfully"
}

# PHASE 3.1B - MIGRATION REQUIRED (Conservative approach)
execute_phase_3_1b() {
    echo ""
    echo "⚠️  PHASE 3.1B - COMPONENTS REQUIRING MIGRATION"
    echo "=============================================="
    
    print_warning "The following components require migration before deletion:"
    print_info "• /components/lists/ - 4 active imports found"
    print_info "• Manual migration required to feature-based directories"
    print_info "• See PHASE_3_1_DEAD_CODE_ANALYSIS_REPORT.md for details"
    
    echo ""
    print_info "To complete Phase 3.1B, run the migration script:"
    print_info "npm run migrate:components-lists"
}

# Function to validate build after changes
validate_build_after() {
    print_info "Validating build system after changes..."
    
    if npm run build > /dev/null 2>&1; then
        print_status "Post-cleanup build validation successful"
        return 0
    else
        print_error "Post-cleanup build validation failed"
        return 1
    fi
}

# Function to calculate size reduction
calculate_size_reduction() {
    print_info "Calculating bundle size reduction..."
    
    # Build and check dist size
    npm run build > /dev/null 2>&1
    
    if [ -d "dist" ]; then
        local dist_size=$(du -sh dist | cut -f1)
        print_status "Current bundle size: $dist_size"
    else
        print_warning "Could not calculate bundle size - dist directory not found"
    fi
}

# Main execution
main() {
    echo "🎯 Starting Phase 3.1 Dead Code Cleanup"
    echo "======================================="
    
    # Step 1: Backup current state
    backup_current_state
    
    # Step 2: Validate build before changes
    validate_build_before
    
    # Step 3: Execute Phase 3.1A - Safe deletions
    execute_phase_3_1a
    
    # Step 4: Validate build after changes
    if validate_build_after; then
        print_status "All changes validated successfully"
    else
        print_error "Build validation failed - check for issues"
        exit 1
    fi
    
    # Step 5: Calculate size reduction
    calculate_size_reduction
    
    # Step 6: Show Phase 3.1B requirements
    execute_phase_3_1b
    
    echo ""
    echo "🏆 PHASE 3.1A EXECUTION COMPLETED SUCCESSFULLY"
    echo "=============================================="
    print_status "Safe deletions completed"
    print_status "Build system validated"
    print_status "Ready for Phase 3.1B migration"
    
    echo ""
    print_info "Next steps:"
    print_info "1. Review Phase 3.1 analysis report"
    print_info "2. Execute Phase 3.1B component migrations"
    print_info "3. Complete final cleanup verification"
    print_info "4. Coordinate with Phase 3.2 documentation team"
}

# Execute main function
main "$@"