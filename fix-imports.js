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
    
    // Calculate depth from src
    const depth = relativePath === '' ? 0 : relativePath.split(path.sep).length;
    
    // Handle complex relative paths
    if (importPath.includes('../../')) {
      // Count how many levels up
      const upLevels = (importPath.match(/\.\.\//g) || []).length;
      const remainingPath = importPath.replace(/\.\.\//g, '');
      
      // Determine target directory
      const pathParts = relativePath.split(path.sep);
      const targetParts = pathParts.slice(0, Math.max(0, pathParts.length - upLevels));
      
      // Check if it's going to a known root directory
      if (remainingPath.startsWith('shared/')) {
        return '@/shared/' + remainingPath.substring(7);
      } else if (remainingPath.startsWith('components/')) {
        return '@/components/' + remainingPath.substring(11);
      } else if (remainingPath.startsWith('app/')) {
        return '@/app/' + remainingPath.substring(4);
      } else if (remainingPath.startsWith('lib/')) {
        return '@/lib/' + remainingPath.substring(4);
      } else if (remainingPath.startsWith('theme/')) {
        return '@/theme/' + remainingPath.substring(6);
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
          }
        }

        if (newPath) {
          const newImportStatement = importType + beforePath + newPath + afterPath;
          newContent = newContent.replace(fullMatch, newImportStatement);
          hasChanges = true;
          
          console.log(`${filePath}: ${relativePath} → ${newPath}`);
        } else {
          console.warn(`Could not resolve: ${filePath}: ${relativePath}`);
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

  // Validate that paths exist and are correct
  validatePath(aliasPath) {
    const actualPath = aliasPath.replace('@/', 'src/');
    const fullPath = path.join(process.cwd(), actualPath);
    
    // Check if it's a file
    if (fs.existsSync(fullPath + '.ts') || fs.existsSync(fullPath + '.tsx')) {
      return true;
    }
    
    // Check if it's an index file
    if (fs.existsSync(path.join(fullPath, 'index.ts')) || 
        fs.existsSync(path.join(fullPath, 'index.tsx'))) {
      return true;
    }
    
    // Check if it's a directory with exports
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
      return true;
    }
    
    return false;
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
      this.errors.forEach(error => {
        console.log(`  ${error.file}: ${error.path || error.error}`);
      });
    }

    if (this.changedFiles.length > 0) {
      console.log('\n✅ Changed files:');
      this.changedFiles.forEach(file => {
        console.log(`  ${file}`);
      });
    }

    console.log('\n🎉 Import fixing complete!');
  }
}

// Run the fixer
const fixer = new ImportPathFixer();
fixer.run();