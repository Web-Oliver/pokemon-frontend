#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Comprehensive import path fixing script
class ImportPathFixer {
  constructor() {
    this.srcPath = path.join(process.cwd(), 'src');
    this.changedFiles = [];
    this.errors = [];
    
    // Map relative paths to @/ paths based on common patterns
    this.pathMappings = {
      // From features to shared
      '../../../shared/': '@/shared/',
      '../../shared/': '@/shared/',
      '../shared/': '@/shared/',
      
      // From features to components
      '../../../components/': '@/components/',
      '../../components/': '@/components/',
      '../components/': '@/components/',
      
      // From features to app
      '../../../app/': '@/app/',
      '../../app/': '@/app/',
      '../app/': '@/app/',
      
      // From shared to app
      '../app/': '@/app/',
      '../../app/': '@/app/',
      
      // From shared to components
      '../components/': '@/components/',
      '../../components/': '@/components/',
      '../../../components/': '@/components/',
      
      // From components to shared
      '../shared/': '@/shared/',
      '../../shared/': '@/shared/',
      '../../../shared/': '@/shared/',
      
      // From components to app
      '../app/': '@/app/',
      '../../app/': '@/app/',
      '../../../app/': '@/app/',
      
      // From any level to lib
      '../lib/': '@/lib/',
      '../../lib/': '@/lib/',
      '../../../lib/': '@/lib/',
      '../../../../lib/': '@/lib/',
      
      // From any level to theme
      '../theme/': '@/theme/',
      '../../theme/': '@/theme/',
      '../../../theme/': '@/theme/',
      '../../../../theme/': '@/theme/',
      '../../../../../theme/': '@/theme/',
      
      // From any level to types
      '../types/': '@/types/',
      '../../types/': '@/types/',
      '../../../types/': '@/types/',
      '../../../../types/': '@/types/',
      
      // Single-level relative paths - context-sensitive
      '../utils/': '@/shared/utils/',
      '../hooks/': '@/shared/hooks/',
      '../api/': '@/shared/api/',
      '../services/': '@/shared/services/',
      '../components/': '@/shared/components/',
      '../domain/': '@/shared/domain/',
      '../interfaces/': '@/shared/interfaces/',
    };
  }

  // Get all TypeScript files
  getAllTsFiles() {
    const getAllFiles = (dir) => {
      let results = [];
      const list = fs.readdirSync(dir);
      
      list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat && stat.isDirectory()) {
          results = results.concat(getAllFiles(filePath));
        } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
          results.push(filePath);
        }
      });
      
      return results;
    };
    
    return getAllFiles(this.srcPath);
  }

  // Advanced path resolution based on file location
  resolveAdvancedPath(filePath, importPath) {
    const fileDir = path.dirname(filePath);
    const srcDir = this.srcPath;
    const relativePath = path.relative(srcDir, fileDir);
    
    // Determine the context based on file location
    const isInFeatures = relativePath.startsWith('features/');
    const isInShared = relativePath.startsWith('shared/');
    const isInComponents = relativePath.startsWith('components/');
    
    // Handle single-level relative paths based on context
    if (importPath.startsWith('../') && !importPath.startsWith('../../')) {
      const remainingPath = importPath.substring(3);
      
      if (isInFeatures) {
        // From features, single ../ typically goes to same feature or to shared
        if (remainingPath.startsWith('components/') || remainingPath.startsWith('hooks/') ||
            remainingPath.startsWith('services/') || remainingPath.startsWith('types/')) {
          // Within same feature
          const featureName = relativePath.split('/')[1];
          return `@/features/${featureName}/${remainingPath}`;
        }
      }
      
      // Default single-level mappings
      if (remainingPath.startsWith('utils/')) return '@/shared/utils/' + remainingPath.substring(6);
      if (remainingPath.startsWith('hooks/')) return '@/shared/hooks/' + remainingPath.substring(6);
      if (remainingPath.startsWith('api/')) return '@/shared/api/' + remainingPath.substring(4);
      if (remainingPath.startsWith('services/')) return '@/shared/services/' + remainingPath.substring(9);
      if (remainingPath.startsWith('components/')) return '@/shared/components/' + remainingPath.substring(11);
      if (remainingPath.startsWith('domain/')) return '@/shared/domain/' + remainingPath.substring(7);
      if (remainingPath.startsWith('interfaces/')) return '@/shared/interfaces/' + remainingPath.substring(11);
    }
    
    // Handle complex relative paths
    if (importPath.includes('../../')) {
      const remainingPath = importPath.replace(/\.\.\//g, '');
      
      // Check if it's going to a known root directory
      if (remainingPath.startsWith('shared/')) {
        return '@/shared/' + remainingPath.substring(7);
      } else if (remainingPath.startsWith('components/')) {
        return '@/components/' + remainingPath.substring(11);
      } else if (remainingPath.startsWith('app/')) {
        return '@/app/' + remainingPath.substring(4);
      } else if (remainingPath.startsWith('lib/')) {
        return '@/lib/' + remainingPath.substring(4);
      } else if (remainingPath.startsWith('theme')) {
        return '@/theme' + remainingPath.substring(5);
      } else if (remainingPath.startsWith('types/')) {
        return '@/types/' + remainingPath.substring(6);
      } else if (remainingPath.startsWith('features/')) {
        return '@/features/' + remainingPath.substring(9);
      }
    }
    
    return null;
  }

  // Fix imports in a single file
  fixFileImports(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      let newContent = content;
      let hasChanges = false;

      // Match import/export statements with relative paths
      const importRegex = /(import|export)([^'"]*from\s+['"])(\.\.\/[^'"]*)(['"])/g;
      const matches = [...content.matchAll(importRegex)];

      for (const match of matches) {
        const fullMatch = match[0];
        const importType = match[1]; // import or export
        const beforePath = match[2]; // everything before the path
        const relativePath = match[3]; // the relative path
        const afterPath = match[4]; // closing quote

        let newPath = null;

        // Try direct mapping first
        for (const [pattern, replacement] of Object.entries(this.pathMappings)) {
          if (relativePath.startsWith(pattern)) {
            newPath = relativePath.replace(pattern, replacement);
            break;
          }
        }

        // If no direct mapping, try advanced resolution
        if (!newPath) {
          newPath = this.resolveAdvancedPath(filePath, relativePath);
        }

        // If still no mapping, try to infer from common patterns
        if (!newPath) {
          // Handle specific patterns we see in the codebase
          if (relativePath.includes('/shared/')) {
            const sharedPart = relativePath.substring(relativePath.indexOf('/shared/') + 1);
            newPath = '@/' + sharedPart;
          } else if (relativePath.includes('/components/')) {
            const compPart = relativePath.substring(relativePath.indexOf('/components/') + 1);
            newPath = '@/' + compPart;
          } else if (relativePath.includes('/app/')) {
            const appPart = relativePath.substring(relativePath.indexOf('/app/') + 1);
            newPath = '@/' + appPart;
          } else if (relativePath.includes('/theme')) {
            const themePart = relativePath.substring(relativePath.indexOf('/theme'));
            newPath = '@' + themePart;
          } else if (relativePath.includes('/lib/')) {
            const libPart = relativePath.substring(relativePath.indexOf('/lib/') + 1);
            newPath = '@/' + libPart;
          } else if (relativePath.includes('/features/')) {
            const featPart = relativePath.substring(relativePath.indexOf('/features/') + 1);
            newPath = '@/' + featPart;
          }
        }

        if (newPath) {
          const newImportStatement = importType + beforePath + newPath + afterPath;
          newContent = newContent.replace(fullMatch, newImportStatement);
          hasChanges = true;
          
          console.log(`${path.relative(process.cwd(), filePath)}: ${relativePath} → ${newPath}`);
        } else {
          console.warn(`Could not resolve: ${path.relative(process.cwd(), filePath)}: ${relativePath}`);
          this.errors.push({ file: filePath, path: relativePath, reason: 'Could not resolve' });
        }
      }

      if (hasChanges) {
        fs.writeFileSync(filePath, newContent);
        this.changedFiles.push(filePath);
      }

    } catch (error) {
      console.error(`Error processing ${filePath}:`, error.message);
      this.errors.push({ file: filePath, error: error.message });
    }
  }

  // Run the complete fix process
  run() {
    console.log('🚀 Starting import path fixing...');
    console.log(`Working directory: ${process.cwd()}`);
    
    const files = this.getAllTsFiles();
    console.log(`Found ${files.length} TypeScript files`);

    let processedCount = 0;
    for (const file of files) {
      this.fixFileImports(file);
      processedCount++;
      
      if (processedCount % 50 === 0) {
        console.log(`Processed ${processedCount}/${files.length} files...`);
      }
    }

    console.log('\n📊 Summary:');
    console.log(`Files processed: ${files.length}`);
    console.log(`Files changed: ${this.changedFiles.length}`);
    console.log(`Errors: ${this.errors.length}`);

    if (this.errors.length > 0) {
      console.log('\n❌ Errors:');
      this.errors.slice(0, 10).forEach(error => {
        console.log(`  ${path.relative(process.cwd(), error.file)}: ${error.path || error.error}`);
      });
      if (this.errors.length > 10) {
        console.log(`  ... and ${this.errors.length - 10} more errors`);
      }
    }

    console.log('\n🎉 Import fixing complete!');
    
    if (this.changedFiles.length > 0) {
      console.log('\n⚠️  Remember to run type-check to verify all imports are working correctly.');
    }
  }
}

// Run the fixer
const fixer = new ImportPathFixer();
fixer.run();