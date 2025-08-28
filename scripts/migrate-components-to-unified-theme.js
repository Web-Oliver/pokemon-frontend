#!/usr/bin/env node
/**
 * COMPONENT MIGRATION SCRIPT - UNIFIED THEME SYSTEM
 * 
 * Automatically updates components to use centralized theming
 * with minimal breaking changes and maximum compatibility
 * 
 * Usage: node scripts/migrate-components-to-unified-theme.js
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Color mapping from hardcoded values to semantic CSS classes
const COLOR_MAPPINGS = {
  // Background mappings
  'bg-white': 'bg-background',
  'bg-gray-50': 'bg-background',
  'bg-gray-100': 'bg-muted',
  'bg-gray-200': 'bg-secondary',
  'bg-gray-800': 'bg-card',
  'bg-gray-900': 'bg-background',
  'bg-slate-900': 'bg-background',
  'bg-zinc-900': 'bg-background',
  'bg-blue-600': 'bg-primary',
  'bg-blue-500': 'bg-primary',
  'bg-indigo-600': 'bg-primary',
  'bg-purple-600': 'bg-accent',
  
  // Text color mappings
  'text-white': 'text-foreground',
  'text-black': 'text-foreground',
  'text-gray-900': 'text-foreground',
  'text-gray-800': 'text-foreground',
  'text-gray-600': 'text-muted-foreground',
  'text-gray-500': 'text-muted-foreground',
  'text-gray-400': 'text-muted-foreground',
  'text-slate-600': 'text-muted-foreground',
  'text-blue-600': 'text-primary',
  'text-blue-500': 'text-primary',
  'text-indigo-600': 'text-primary',
  
  // Border mappings
  'border-gray-200': 'border-border',
  'border-gray-300': 'border-border',
  'border-gray-700': 'border-border',
  'border-gray-800': 'border-border',
  'border-slate-700': 'border-border',
  'border-blue-500': 'border-primary',
  'border-blue-600': 'border-primary',
  
  // Shadow mappings
  'shadow-lg': 'shadow-theme-primary',
  'shadow-xl': 'shadow-theme-hover',
  'shadow-2xl': 'shadow-theme-hover',
};

// Dark mode class patterns to remove
const DARK_MODE_PATTERNS = [
  /dark:bg-\w+-\d+/g,
  /dark:text-\w+-\d+/g,
  /dark:border-\w+-\d+/g,
  /dark:hover:bg-\w+-\d+/g,
  /dark:hover:text-\w+-\d+/g,
];

// Import patterns to add/update
const THEME_IMPORTS = [
  "import { useUnifiedTheme } from '../contexts/UnifiedThemeProvider';",
  "import { cn } from '../lib/utils';",
];

class ComponentMigrator {
  constructor() {
    this.migratedFiles = [];
    this.errors = [];
    this.stats = {
      filesProcessed: 0,
      classesReplaced: 0,
      darkModeClassesRemoved: 0,
      importsAdded: 0,
    };
  }

  async migrate() {
    console.log('🎨 Starting Component Migration to Unified Theme System...\n');

    // Find all component files
    const componentFiles = await this.findComponentFiles();
    console.log(`Found ${componentFiles.length} component files to process\n`);

    // Process each file
    for (const filePath of componentFiles) {
      try {
        await this.migrateFile(filePath);
      } catch (error) {
        this.errors.push({ file: filePath, error: error.message });
      }
    }

    // Generate migration report
    this.generateReport();
  }

  async findComponentFiles() {
    const extensions = ['.tsx', '.jsx', '.ts', '.js'];
    const searchPaths = [
      'src/components',
      'src/features',
      'src/shared/components',
      'src/pages',
    ];

    const files = [];
    
    for (const searchPath of searchPaths) {
      if (fs.existsSync(searchPath)) {
        const foundFiles = this.getFilesRecursive(searchPath, extensions);
        files.push(...foundFiles);
      }
    }

    return files;
  }

  getFilesRecursive(dir, extensions) {
    const files = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        files.push(...this.getFilesRecursive(fullPath, extensions));
      } else if (extensions.some(ext => entry.name.endsWith(ext))) {
        files.push(fullPath);
      }
    }

    return files;
  }

  async migrateFile(filePath) {
    console.log(`Processing: ${filePath}`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    let fileModified = false;

    // 1. Replace color classes with semantic classes
    const classReplacements = this.replaceColorClasses(content);
    if (classReplacements.content !== content) {
      content = classReplacements.content;
      fileModified = true;
      this.stats.classesReplaced += classReplacements.count;
    }

    // 2. Remove dark mode classes
    const darkModeRemovals = this.removeDarkModeClasses(content);
    if (darkModeRemovals.content !== content) {
      content = darkModeRemovals.content;
      fileModified = true;
      this.stats.darkModeClassesRemoved += darkModeRemovals.count;
    }

    // 3. Add theme imports if needed
    const importAdditions = this.addThemeImports(content, filePath);
    if (importAdditions.content !== content) {
      content = importAdditions.content;
      fileModified = true;
      if (importAdditions.added) this.stats.importsAdded++;
    }

    // 4. Update conditional theme logic
    content = this.updateConditionalThemeLogic(content);

    // Write file if modified
    if (fileModified && content !== originalContent) {
      // Create backup
      fs.writeFileSync(`${filePath}.backup`, originalContent);
      fs.writeFileSync(filePath, content);
      
      this.migratedFiles.push(filePath);
      console.log(`  ✅ Migrated (backup created)`);
    } else {
      console.log(`  ⏭️  No changes needed`);
    }

    this.stats.filesProcessed++;
  }

  replaceColorClasses(content) {
    let modifiedContent = content;
    let count = 0;

    for (const [oldClass, newClass] of Object.entries(COLOR_MAPPINGS)) {
      // Match class in className attributes
      const classRegex = new RegExp(`\\b${oldClass}\\b`, 'g');
      const matches = modifiedContent.match(classRegex);
      if (matches) {
        modifiedContent = modifiedContent.replace(classRegex, newClass);
        count += matches.length;
      }
    }

    return { content: modifiedContent, count };
  }

  removeDarkModeClasses(content) {
    let modifiedContent = content;
    let count = 0;

    for (const pattern of DARK_MODE_PATTERNS) {
      const matches = modifiedContent.match(pattern);
      if (matches) {
        modifiedContent = modifiedContent.replace(pattern, '');
        count += matches.length;
      }
    }

    // Clean up extra spaces
    modifiedContent = modifiedContent.replace(/\s{2,}/g, ' ');
    modifiedContent = modifiedContent.replace(/className="\s+/g, 'className="');
    modifiedContent = modifiedContent.replace(/\s+"/g, '"');

    return { content: modifiedContent, count };
  }

  addThemeImports(content, filePath) {
    let modifiedContent = content;
    let added = false;

    // Check if it's a React component file
    if (!content.includes('import React') && !content.includes('import {') && !content.includes('function ') && !content.includes('const ')) {
      return { content: modifiedContent, added: false };
    }

    // Check if useUnifiedTheme is already imported
    if (content.includes('useUnifiedTheme')) {
      return { content: modifiedContent, added: false };
    }

    // Check if file uses theme-related logic that would benefit from the hook
    const needsThemeHook = content.includes('isDark') || 
                          content.includes('isLight') || 
                          content.includes('theme') ||
                          content.includes('Theme');

    if (needsThemeHook) {
      // Find the last import statement
      const importLines = content.split('\n');
      let lastImportIndex = -1;

      for (let i = 0; i < importLines.length; i++) {
        if (importLines[i].trim().startsWith('import ')) {
          lastImportIndex = i;
        }
      }

      if (lastImportIndex !== -1) {
        // Add theme import after last import
        const relativePath = this.getRelativeImportPath(filePath);
        const themeImport = `import { useUnifiedTheme } from '${relativePath}/contexts/UnifiedThemeProvider';`;
        
        importLines.splice(lastImportIndex + 1, 0, themeImport);
        modifiedContent = importLines.join('\n');
        added = true;
      }
    }

    return { content: modifiedContent, added };
  }

  getRelativeImportPath(filePath) {
    const depth = filePath.split('/').length - 2; // Subtract src and filename
    return '../'.repeat(Math.max(0, depth - 1));
  }

  updateConditionalThemeLogic(content) {
    // Replace common theme conditional patterns
    let modifiedContent = content;

    // Replace isDark ternary with CSS classes
    modifiedContent = modifiedContent.replace(
      /\{isDark \? ['"]([^'"]+)['"] : ['"]([^'"]+)['"]\}/g,
      '"$2"' // Use light theme class as default, CSS will handle dark mode
    );

    // Replace theme-based conditional rendering with CSS classes
    modifiedContent = modifiedContent.replace(
      /className=\{.*?isDark.*?\}/g,
      'className="bg-background text-foreground"'
    );

    return modifiedContent;
  }

  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('🎨 UNIFIED THEME MIGRATION REPORT');
    console.log('='.repeat(60));
    
    console.log(`📊 STATISTICS:`);
    console.log(`  Files processed: ${this.stats.filesProcessed}`);
    console.log(`  Files migrated: ${this.migratedFiles.length}`);
    console.log(`  CSS classes replaced: ${this.stats.classesReplaced}`);
    console.log(`  Dark mode classes removed: ${this.stats.darkModeClassesRemoved}`);
    console.log(`  Theme imports added: ${this.stats.importsAdded}`);

    if (this.migratedFiles.length > 0) {
      console.log(`\n✅ SUCCESSFULLY MIGRATED FILES:`);
      this.migratedFiles.forEach(file => {
        console.log(`  • ${file}`);
      });
    }

    if (this.errors.length > 0) {
      console.log(`\n❌ ERRORS ENCOUNTERED:`);
      this.errors.forEach(error => {
        console.log(`  • ${error.file}: ${error.error}`);
      });
    }

    console.log(`\n📝 NEXT STEPS:`);
    console.log(`  1. Review migrated files and test functionality`);
    console.log(`  2. Update main App.tsx to use UnifiedThemeProvider`);
    console.log(`  3. Import unified-theme-variables.css in your main CSS file`);
    console.log(`  4. Remove old theme-related code and CSS files`);
    console.log(`  5. Delete backup files once satisfied: rm **/*.backup`);

    console.log(`\n🎯 INTEGRATION EXAMPLE:`);
    console.log(`
// In your main App.tsx
import { UnifiedThemeProvider } from './contexts/UnifiedThemeProvider';
import './styles/unified-theme-variables.css';

function App() {
  return (
    <UnifiedThemeProvider>
      {/* Your app content */}
    </UnifiedThemeProvider>
  );
}
    `);

    console.log('='.repeat(60));
    console.log('Migration complete! 🎉');
  }
}

// Run migration if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const migrator = new ComponentMigrator();
  migrator.migrate().catch(console.error);
}

export default ComponentMigrator;