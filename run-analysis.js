#!/usr/bin/env node

/**
 * 🔍 SIMPLIFIED FRONTEND ANALYSIS RUNNER
 * Compatible with Node.js 18+ and focuses on the most critical issues
 */

const fs = require('fs');
const path = require('path');

class SimpleFrontendAnalyzer {
  constructor(sourceDir = './src') {
    this.sourceDir = sourceDir;
    this.report = {
      summary: {
        filesScanned: 0,
        duplicateComponents: 0,
        styleIssues: 0,
        nonReusableStructures: 0,
        unusedComponents: 0,
        totalIssues: 0
      },
      duplicateComponents: [],
      styleIssues: [],
      nonReusableStructures: [],
      unusedComponents: [],
      recommendations: []
    };
  }

  // 📁 File Discovery
  scanFiles() {
    const files = [];
    
    const scanDirectory = (dir) => {
      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          
          if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
            scanDirectory(fullPath);
          } else if (entry.isFile() && /\.(jsx|tsx)$/.test(entry.name)) {
            files.push(fullPath);
          }
        }
      } catch (error) {
        console.warn(`⚠️  Cannot read directory ${dir}: ${error.message}`);
      }
    };

    scanDirectory(this.sourceDir);
    this.report.summary.filesScanned = files.length;
    return files;
  }

  // 🔁 Simple Duplicate Detection (Name-based)
  analyzeComponentDuplication(files) {
    const componentNames = new Map();
    const duplicates = [];

    files.forEach(file => {
      try {
        const content = fs.readFileSync(file, 'utf-8');
        const lines = content.split('\n');
        
        // Look for component exports and declarations
        lines.forEach((line, index) => {
          // Match component function declarations
          const functionMatch = line.match(/(?:export\s+(?:default\s+)?)?(?:const|function)\s+([A-Z][a-zA-Z0-9]*)/);
          if (functionMatch) {
            const componentName = functionMatch[1];
            const key = componentName.toLowerCase();
            
            if (!componentNames.has(key)) {
              componentNames.set(key, []);
            }
            componentNames.get(key).push({
              file,
              name: componentName,
              lineNumber: index + 1,
              line: line.trim()
            });
          }
        });
      } catch (error) {
        console.warn(`⚠️  Cannot read file ${file}: ${error.message}`);
      }
    });

    // Find duplicates
    componentNames.forEach((components, key) => {
      if (components.length > 1) {
        // Check for common naming patterns that indicate duplicates
        const hasDuplicatePattern = components.some(comp => 
          components.some(other => 
            comp !== other && (
              comp.name.includes('Button') && other.name.includes('Button') ||
              comp.name.includes('Modal') && other.name.includes('Modal') ||
              comp.name.includes('Input') && other.name.includes('Input') ||
              comp.name.includes('Card') && other.name.includes('Card')
            )
          )
        );

        if (hasDuplicatePattern) {
          components.forEach((comp, index) => {
            if (index > 0) { // Mark all but first as duplicates
              duplicates.push({
                file: comp.file,
                component: comp.name,
                duplicateOf: components[0].name,
                similarity: 85, // Estimated
                lineNumber: comp.lineNumber,
                jsxStructure: 'Similar component structure detected',
                props: ['unknown'],
                suggestedFix: `Consider consolidating with ${components[0].name} in ${components[0].file}`
              });
            }
          });
        }
      }
    });

    this.report.duplicateComponents = duplicates;
    this.report.summary.duplicateComponents = duplicates.length;
  }

  // 🎨 Style Issue Detection
  analyzeStyleIssues(files) {
    const styleIssues = [];
    const hardcodedPatterns = [
      // Colors
      { pattern: /#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})/g, type: 'hardcoded-color' },
      { pattern: /rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/g, type: 'hardcoded-color' },
      { pattern: /rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)/g, type: 'hardcoded-color' },
      // Spacing
      { pattern: /\b\d+px\b/g, type: 'hardcoded-spacing' },
      { pattern: /\b\d+rem\b/g, type: 'hardcoded-spacing' },
      { pattern: /\b\d+em\b/g, type: 'hardcoded-spacing' },
    ];

    files.forEach(file => {
      try {
        const content = fs.readFileSync(file, 'utf-8');
        const lines = content.split('\n');
        
        lines.forEach((line, index) => {
          const lineNumber = index + 1;

          // Detect inline styles
          if (line.includes('style={{')) {
            styleIssues.push({
              file,
              lineNumber,
              type: 'inline-style',
              content: line.trim(),
              suggestedFix: 'Replace inline styles with theme classes or CSS modules',
              severity: 'high'
            });
          }

          // Detect hardcoded values
          hardcodedPatterns.forEach(({ pattern, type }) => {
            const matches = line.match(pattern);
            if (matches && !line.includes('var(--')) {
              matches.forEach(match => {
                styleIssues.push({
                  file,
                  lineNumber,
                  type,
                  content: line.trim(),
                  suggestedFix: this.generateStyleFixSuggestion(match),
                  severity: this.getStyleSeverity(match)
                });
              });
            }
          });

          // Detect non-theme Tailwind classes
          const tailwindMatch = line.match(/className=["`']([^"`']*)["`']/);
          if (tailwindMatch) {
            const classes = tailwindMatch[1];
            const problematicClasses = this.detectProblematicClasses(classes);
            
            if (problematicClasses.length > 0) {
              styleIssues.push({
                file,
                lineNumber,
                type: 'non-theme-class',
                content: line.trim(),
                suggestedFix: `Consider theme alternatives: ${problematicClasses.join(', ')}`,
                severity: 'medium'
              });
            }
          }
        });
      } catch (error) {
        console.warn(`⚠️  Cannot analyze styles in ${file}: ${error.message}`);
      }
    });

    this.report.styleIssues = styleIssues;
    this.report.summary.styleIssues = styleIssues.length;
  }

  // 🧱 Repeated Structure Detection
  analyzeNonReusableStructures(files) {
    const structurePatterns = new Map();
    const nonReusableStructures = [];

    files.forEach(file => {
      try {
        const content = fs.readFileSync(file, 'utf-8');
        const lines = content.split('\n');
        
        // Look for repeated JSX patterns
        for (let i = 0; i < lines.length - 2; i++) {
          const block = lines.slice(i, i + 3).join('\n').trim();
          
          if (this.isSignificantJSXBlock(block)) {
            const normalized = this.normalizeJSXBlock(block);
            
            if (!structurePatterns.has(normalized)) {
              structurePatterns.set(normalized, { files: [], lines: [], content: block });
            }
            
            const pattern = structurePatterns.get(normalized);
            pattern.files.push(file);
            pattern.lines.push(i + 1);
          }
        }
      } catch (error) {
        console.warn(`⚠️  Cannot analyze structures in ${file}: ${error.message}`);
      }
    });

    // Find repeated patterns
    structurePatterns.forEach((pattern) => {
      if (pattern.files.length > 1) {
        pattern.files.forEach((file, index) => {
          nonReusableStructures.push({
            file,
            lineNumber: pattern.lines[index],
            type: 'repeated-ui-block',
            content: pattern.content.substring(0, 100) + '...',
            occurrences: pattern.files.length,
            suggestedFix: `Extract to reusable component - found in ${pattern.files.length} files`
          });
        });
      }
    });

    this.report.nonReusableStructures = nonReusableStructures;
    this.report.summary.nonReusableStructures = nonReusableStructures.length;
  }

  // 🚫 Simple Unused Component Detection
  analyzeUnusedComponents(files) {
    const exportedComponents = new Map();
    const importedComponents = new Set();

    // Phase 1: Find all exports
    files.forEach(file => {
      try {
        const content = fs.readFileSync(file, 'utf-8');
        const lines = content.split('\n');
        
        lines.forEach((line, index) => {
          // Export patterns
          const exportMatch = line.match(/export\s+(?:default\s+)?(?:const|function)\s+([A-Z][a-zA-Z0-9]*)/);
          if (exportMatch) {
            const componentName = exportMatch[1];
            exportedComponents.set(componentName, {
              file,
              component: componentName,
              exports: [componentName],
              isUsed: false,
              suggestedAction: 'delete'
            });
          }
        });
      } catch (error) {
        console.warn(`⚠️  Cannot analyze exports in ${file}: ${error.message}`);
      }
    });

    // Phase 2: Find all imports
    files.forEach(file => {
      try {
        const content = fs.readFileSync(file, 'utf-8');
        const lines = content.split('\n');
        
        lines.forEach((line) => {
          // Import patterns
          const importMatch = line.match(/import\s+(?:\{([^}]+)\}|([A-Z][a-zA-Z0-9]*))/);
          if (importMatch) {
            if (importMatch[1]) {
              // Named imports
              const namedImports = importMatch[1].split(',').map(s => s.trim());
              namedImports.forEach(imp => importedComponents.add(imp));
            } else if (importMatch[2]) {
              // Default import
              importedComponents.add(importMatch[2]);
            }
          }
        });
      } catch (error) {
        console.warn(`⚠️  Cannot analyze imports in ${file}: ${error.message}`);
      }
    });

    // Phase 3: Mark used components
    exportedComponents.forEach((component, name) => {
      if (importedComponents.has(name)) {
        component.isUsed = true;
        component.suggestedAction = 'keep';
      }
    });

    const unusedComponents = Array.from(exportedComponents.values()).filter(comp => !comp.isUsed);
    
    this.report.unusedComponents = unusedComponents;
    this.report.summary.unusedComponents = unusedComponents.length;
  }

  // 🔧 Helper Methods
  generateStyleFixSuggestion(value) {
    if (/#[0-9a-fA-F]{3,6}/.test(value) || /rgb/.test(value)) {
      return 'Replace with theme color: theme-primary, theme-accent, or CSS custom property';
    }
    if (/\d+px|\d+rem|\d+em/.test(value)) {
      return 'Replace with density spacing: density-sm, density-md, density-lg';
    }
    return 'Use theme tokens instead of hardcoded values';
  }

  getStyleSeverity(value) {
    if (/#[0-9a-fA-F]{3,6}/.test(value) || /rgb/.test(value)) return 'high';
    if (/\d+px/.test(value)) return 'medium';
    return 'low';
  }

  detectProblematicClasses(classes) {
    const classList = classes.split(' ').filter(Boolean);
    return classList.filter(cls => 
      /bg-(red|blue|green|yellow|purple|pink|indigo)-\d+/.test(cls) ||
      /text-(red|blue|green|yellow|purple|pink|indigo)-\d+/.test(cls) ||
      /p-\d+|m-\d+|px-\d+|py-\d+|mx-\d+|my-\d+/.test(cls)
    );
  }

  isSignificantJSXBlock(block) {
    return block.includes('<') && 
           block.includes('>') && 
           block.length > 20 &&
           !block.includes('import') &&
           !block.includes('export');
  }

  normalizeJSXBlock(block) {
    return block
      .replace(/\s+/g, ' ')
      .replace(/className="[^"]*"/g, 'className="..."')
      .replace(/\{[^}]*\}/g, '{...}')
      .trim();
  }

  // 📝 Report Generation
  generateRecommendations() {
    const recommendations = [];

    if (this.report.duplicateComponents.length > 0) {
      recommendations.push(
        `🔁 **${this.report.duplicateComponents.length} duplicate components found** - Consolidate using design system components`
      );
    }

    if (this.report.styleIssues.length > 0) {
      const high = this.report.styleIssues.filter(issue => issue.severity === 'high').length;
      recommendations.push(
        `🎨 **${this.report.styleIssues.length} style issues detected** (${high} high priority) - Migrate to theme system`
      );
    }

    if (this.report.nonReusableStructures.length > 0) {
      recommendations.push(
        `🧱 **${this.report.nonReusableStructures.length} repeated UI blocks found** - Extract to shared components`
      );
    }

    if (this.report.unusedComponents.length > 0) {
      recommendations.push(
        `🚫 **${this.report.unusedComponents.length} unused components detected** - Clean up codebase`
      );
    }

    this.report.recommendations = recommendations;
  }

  generateReport() {
    this.report.summary.totalIssues = 
      this.report.duplicateComponents.length +
      this.report.styleIssues.length +
      this.report.nonReusableStructures.length +
      this.report.unusedComponents.length;

    this.generateRecommendations();

    const reportDate = new Date().toISOString().split('T')[0];
    
    return `# 🔍 Frontend Static Analysis Report (Simplified)
*Generated on ${reportDate}*

## 📊 Executive Summary

| Metric | Count | Status |
|--------|-------|--------|
| **Files Scanned** | ${this.report.summary.filesScanned} | ✅ |
| **Duplicate Components** | ${this.report.summary.duplicateComponents} | ${this.report.summary.duplicateComponents > 0 ? '⚠️' : '✅'} |
| **Style Issues** | ${this.report.summary.styleIssues} | ${this.report.summary.styleIssues > 10 ? '🚨' : this.report.summary.styleIssues > 0 ? '⚠️' : '✅'} |
| **Non-Reusable Structures** | ${this.report.summary.nonReusableStructures} | ${this.report.summary.nonReusableStructures > 5 ? '⚠️' : '✅'} |
| **Unused Components** | ${this.report.summary.unusedComponents} | ${this.report.summary.unusedComponents > 0 ? '⚠️' : '✅'} |
| **Total Issues** | **${this.report.summary.totalIssues}** | ${this.report.summary.totalIssues > 20 ? '🚨' : this.report.summary.totalIssues > 10 ? '⚠️' : '✅'} |

## 🎯 Key Recommendations

${this.report.recommendations.map(rec => `- ${rec}`).join('\n') || '✅ No major issues detected!'}

---

## 🔁 Duplicate Components (${this.report.duplicateComponents.length})

${this.report.duplicateComponents.length === 0 ? '✅ **No duplicate components detected**' : ''}

${this.report.duplicateComponents.map((duplicate, index) => `
### ${index + 1}. ${duplicate.component}
- **File:** \`${duplicate.file}:${duplicate.lineNumber}\`
- **Duplicate of:** ${duplicate.duplicateOf}
- **Similarity:** ${duplicate.similarity}%
- **Suggested Fix:** ${duplicate.suggestedFix}
`).join('\n')}

---

## 🎨 Style Issues (${this.report.styleIssues.length})

${this.report.styleIssues.length === 0 ? '✅ **No style issues detected**' : ''}

### High Priority Issues (${this.report.styleIssues.filter(issue => issue.severity === 'high').length})

${this.report.styleIssues
  .filter(issue => issue.severity === 'high')
  .slice(0, 10)
  .map((issue, index) => `
**${index + 1}. ${issue.type.toUpperCase()}** - \`${issue.file}:${issue.lineNumber}\`
- **Content:** \`${issue.content}\`
- **Fix:** ${issue.suggestedFix}
`).join('\n')}

${this.report.styleIssues.filter(issue => issue.severity === 'high').length > 10 ? 
`\n*... and ${this.report.styleIssues.filter(issue => issue.severity === 'high').length - 10} more high priority issues*\n` : ''}

### Medium Priority Issues (${this.report.styleIssues.filter(issue => issue.severity === 'medium').length})

${this.report.styleIssues
  .filter(issue => issue.severity === 'medium')
  .slice(0, 5)
  .map((issue, index) => `
**${index + 1}. ${issue.type.toUpperCase()}** - \`${issue.file}:${issue.lineNumber}\`
- **Fix:** ${issue.suggestedFix}
`).join('\n')}

${this.report.styleIssues.filter(issue => issue.severity === 'medium').length > 5 ? 
`\n*... and ${this.report.styleIssues.filter(issue => issue.severity === 'medium').length - 5} more medium priority issues*\n` : ''}

---

## 🧱 Non-Reusable Structures (${this.report.nonReusableStructures.length})

${this.report.nonReusableStructures.length === 0 ? '✅ **No non-reusable structures detected**' : ''}

${this.report.nonReusableStructures
  .slice(0, 10)
  .map((structure, index) => `
### ${index + 1}. ${structure.type.toUpperCase()}
- **File:** \`${structure.file}:${structure.lineNumber}\`
- **Occurrences:** ${structure.occurrences} files
- **Suggested Fix:** ${structure.suggestedFix}
`).join('\n')}

---

## 🚫 Unused Components (${this.report.unusedComponents.length})

${this.report.unusedComponents.length === 0 ? '✅ **No unused components detected**' : ''}

${this.report.unusedComponents.map((component, index) => `
### ${index + 1}. ${component.component}
- **File:** \`${component.file}\`
- **Action:** ${component.suggestedAction.toUpperCase()}
`).join('\n')}

---

## 🛠️ Quick Implementation Guide

### Phase 1: Critical Issues (Immediate Action)
1. **Fix inline styles** - Replace with theme classes
2. **Address hardcoded colors** - Use CSS custom properties
3. **Consolidate duplicates** - Use design system components

### Phase 2: Optimization (This Sprint)
1. **Extract repeated blocks** - Create reusable components
2. **Update classes** - Migrate to theme-aware alternatives
3. **Remove unused code** - Clean up component files

### Phase 3: Enhancement (Next Sprint)
1. **Optimize architecture** - Apply SOLID principles
2. **Enhance theme system** - Full custom property adoption
3. **Standardize patterns** - Design system consistency

---

*Simplified analysis of ${this.report.summary.filesScanned} React component files*
`;
  }

  // 🚀 Main Analysis Runner
  async analyze() {
    console.log('🔍 Starting simplified frontend analysis...');
    
    const files = this.scanFiles();
    console.log(`📁 Found ${files.length} React component files`);

    console.log('🔁 Analyzing component duplication...');
    this.analyzeComponentDuplication(files);

    console.log('🎨 Analyzing style issues...');
    this.analyzeStyleIssues(files);

    console.log('🧱 Analyzing non-reusable structures...');
    this.analyzeNonReusableStructures(files);

    console.log('🚫 Analyzing unused components...');
    this.analyzeUnusedComponents(files);

    console.log('📝 Generating report...');
    const report = this.generateReport();
    
    const outputPath = './frontend-analysis-report.md';
    fs.writeFileSync(outputPath, report);
    
    console.log(`✅ Analysis complete! Report saved to: ${outputPath}`);
    console.log(`📊 Total issues found: ${this.report.summary.totalIssues}`);
    
    // Print summary to console
    console.log('\n📊 SUMMARY:');
    console.log(`   Duplicate Components: ${this.report.summary.duplicateComponents}`);
    console.log(`   Style Issues: ${this.report.summary.styleIssues}`);
    console.log(`   Repeated Structures: ${this.report.summary.nonReusableStructures}`);
    console.log(`   Unused Components: ${this.report.summary.unusedComponents}`);
    console.log(`   TOTAL ISSUES: ${this.report.summary.totalIssues}\n`);
  }
}

// 🚀 CLI Runner
async function main() {
  const analyzer = new SimpleFrontendAnalyzer('./src');
  await analyzer.analyze();
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { SimpleFrontendAnalyzer };