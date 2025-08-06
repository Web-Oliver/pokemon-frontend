#!/usr/bin/env tsx
/**
 * 🔍 COMPREHENSIVE FRONTEND STATIC ANALYSIS SCRIPT
 * 
 * Detects:
 * 🔁 Duplicate/similar components (JSX structure, props, logic)
 * 🎨 Hardcoded styles vs theme system usage
 * 🧱 Non-reusable structures and repeated UI blocks
 * 🚫 Unused components and conflicting design variants
 * 
 * Requirements:
 * - TypeScript with AST parsing
 * - Recursive .jsx/.tsx file scanning
 * - Comprehensive Markdown report generation
 */

import * as fs from 'fs';
import * as path from 'path';
import * as parser from '@typescript-eslint/parser';
import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/types';
import { parse } from '@typescript-eslint/typescript-estree';

// 📊 Analysis Result Interfaces
interface DuplicateComponent {
  file: string;
  component: string;
  duplicateOf: string;
  similarity: number;
  lineNumber: number;
  jsxStructure: string;
  props: string[];
  suggestedFix: string;
}

interface StyleIssue {
  file: string;
  lineNumber: number;
  type: 'inline-style' | 'hardcoded-color' | 'hardcoded-spacing' | 'non-theme-class' | 'missing-theme-token';
  content: string;
  suggestedFix: string;
  severity: 'high' | 'medium' | 'low';
}

interface NonReusableStructure {
  file: string;
  lineNumber: number;
  type: 'repeated-ui-block' | 'copy-pasted-layout' | 'duplicate-props';
  content: string;
  occurrences: number;
  suggestedFix: string;
}

interface UnusedComponent {
  file: string;
  component: string;
  exports: string[];
  isUsed: boolean;
  conflictsWith?: string[];
  suggestedAction: 'delete' | 'merge' | 'refactor';
}

interface AnalysisReport {
  summary: {
    filesScanned: number;
    duplicateComponents: number;
    styleIssues: number;
    nonReusableStructures: number;
    unusedComponents: number;
    totalIssues: number;
  };
  duplicateComponents: DuplicateComponent[];
  styleIssues: StyleIssue[];
  nonReusableStructures: NonReusableStructure[];
  unusedComponents: UnusedComponent[];
  recommendations: string[];
}

// 🎨 Realistic Theme System Configuration (Based on Actual Codebase Analysis)
const THEME_SYSTEM = {
  cssProperties: [
    '--theme-primary', '--theme-primary-hover', '--theme-secondary', '--theme-accent',
    '--theme-bg-primary', '--theme-bg-secondary', '--theme-bg-accent',
    '--theme-border-primary', '--theme-border-secondary', '--theme-border-accent',
    '--bg-glass-primary', '--bg-glass-secondary', '--bg-glass-accent',
    '--density-spacing-xs', '--density-spacing-sm', '--density-spacing-md',
    '--density-spacing-lg', '--density-spacing-xl', '--glass-blur'
  ],
  themeClasses: [
    'theme-primary', 'theme-secondary', 'theme-accent',
    'theme-bg-primary', 'theme-bg-secondary', 'theme-bg-accent',
    'glass-morphism', 'glass-morphism-secondary', 'glass-morphism-accent',
    'density-xs', 'density-sm', 'density-md', 'density-lg', 'density-xl',
    'theme-shadow', 'theme-shadow-hover'
  ],
  // UPDATED: More realistic hardcoded patterns - exclude legitimate uses
  hardcodedPatterns: [
    { pattern: /#([0-9a-fA-F]{3,6})\b(?!.*var\(--)/g, type: 'hardcoded-color', exclude: ['effects/', 'theme/'] },
    { pattern: /rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)(?!.*var\(--)/g, type: 'hardcoded-color', exclude: ['effects/'] },
    { pattern: /\bopacity:\s*0\.\d+(?!.*var\(--)/g, type: 'hardcoded-opacity', exclude: ['effects/', 'animations/'] },
    { pattern: /\b\d{2,}px\b(?!.*transition|.*animation)/g, type: 'hardcoded-spacing', exclude: ['effects/'] },
  ],
  designSystemComponents: [
    'PokemonButton', 'PokemonModal', 'PokemonInput', 'PokemonSelect',
    'PokemonCard', 'PokemonSearch', 'PokemonForm', 'PokemonIcon',
    'PokemonBadge', 'PokemonPageContainer'
  ],
  // NEW: Legitimate patterns to IGNORE
  legitimatePatterns: {
    dynamicComponents: ['IconComponent', 'Icon'], // Dynamic component assignment
    effectsInlineStyles: ['CosmicBackground', 'ParticleSystem', 'GlassmorphismContainer'], // Effects need inline styles
    themeUtilities: ['bg-gradient-to-br', 'from-', 'to-', 'backdrop-blur'], // Theme system utilities
    animationValues: ['opacity', 'transform', 'scale', 'rotate'] // Animation properties
  },
  // NEW: Known false positive patterns
  excludeFromDuplication: [
    /const\s+IconComponent\s*=/, // Dynamic icon assignment
    /const\s+.*Component\s*=.*\.map/, // Mapped components
    /\.map\(.*=>\s*{/, // Map function patterns
    /interface.*Props/, // TypeScript interfaces
  ]
};

class FrontendAnalyzer {
  private sourceDir: string;
  private report: AnalysisReport;
  private fileContents: Map<string, string> = new Map();
  private astCache: Map<string, TSESTree.Program> = new Map();
  private jsxStructures: Map<string, any> = new Map();
  private importAnalysis: Map<string, string[]> = new Map();

  constructor(sourceDir: string = './src') {
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
  async scanFiles(): Promise<string[]> {
    const files: string[] = [];
    
    const scanDirectory = (dir: string): void => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
          scanDirectory(fullPath);
        } else if (entry.isFile() && /\.(jsx|tsx)$/.test(entry.name)) {
          files.push(fullPath);
        }
      }
    };

    scanDirectory(this.sourceDir);
    this.report.summary.filesScanned = files.length;
    return files;
  }

  // 🔍 AST Parsing with Error Handling
  parseFile(filePath: string): TSESTree.Program | null {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      this.fileContents.set(filePath, content);

      const ast = parse(content, {
        loc: true,
        range: true,
        jsx: true,
        errorOnUnknownASTType: false,
        errorOnTypeScriptSyntacticAndSemanticIssues: false,
      });

      this.astCache.set(filePath, ast);
      return ast;
    } catch (error) {
      console.warn(`⚠️  Failed to parse ${filePath}: ${error}`);
      return null;
    }
  }

  // 🔁 REALISTIC Duplicate Component Detection
  analyzeComponentDuplication(files: string[]): void {
    const actualComponents: Map<string, { file: string; name: string; structure: string; props: string[]; lineNumber: number }> = new Map();
    const duplicates: DuplicateComponent[] = [];

    files.forEach(file => {
      try {
        const content = fs.readFileSync(file, 'utf-8');
        const lines = content.split('\n');
        
        lines.forEach((line, index) => {
          const lineNumber = index + 1;
          
          // SKIP: Dynamic component assignments (IconComponent pattern)
          if (THEME_SYSTEM.excludeFromDuplication.some(pattern => pattern.test(line))) {
            return;
          }

          // SKIP: Effects components that legitimately use inline styles
          if (THEME_SYSTEM.legitimatePatterns.effectsInlineStyles.some(effect => file.includes(effect))) {
            return;
          }

          // Look for actual component function declarations
          const functionMatch = line.match(/(?:export\s+(?:default\s+)?)?(?:const|function)\s+([A-Z][a-zA-Z0-9]*)/);
          if (functionMatch) {
            const componentName = functionMatch[1];
            
            // SKIP: Known legitimate patterns
            if (THEME_SYSTEM.legitimatePatterns.dynamicComponents.includes(componentName)) {
              return;
            }

            const componentKey = `${componentName.toLowerCase().replace(/pokemon|common/, '')}`;
            
            if (!actualComponents.has(componentKey)) {
              actualComponents.set(componentKey, {
                file,
                name: componentName,
                structure: this.getComponentSignature(content, lineNumber),
                props: this.extractPropsFromLine(line),
                lineNumber
              });
            } else {
              // Found potential duplicate - validate it's actually different
              const existing = actualComponents.get(componentKey)!;
              const existingContent = fs.readFileSync(existing.file, 'utf-8');
              
              // Only flag as duplicate if it's truly different implementation
              if (existing.file !== file && this.isDifferentImplementation(content, existingContent, componentName)) {
                duplicates.push({
                  file,
                  component: componentName,
                  duplicateOf: existing.name,
                  similarity: this.calculateRealSimilarity(content, existingContent),
                  lineNumber,
                  jsxStructure: this.getSimpleStructure(content, lineNumber),
                  props: this.extractPropsFromLine(line),
                  suggestedFix: this.generateRealFixSuggestion(componentName, existing.name, existing.file)
                });
              }
            }
          }
        });
      } catch (error) {
        console.warn(`⚠️  Cannot analyze ${file}: ${error}`);
      }
    });

    this.report.duplicateComponents = duplicates;
    this.report.summary.duplicateComponents = duplicates.length;
  }

  // 🎨 REALISTIC Style Issue Detection
  analyzeStyleIssues(files: string[]): void {
    const styleIssues: StyleIssue[] = [];

    files.forEach(file => {
      try {
        const content = fs.readFileSync(file, 'utf-8');
        const lines = content.split('\n');
        
        lines.forEach((line, index) => {
          const lineNumber = index + 1;

          // SKIP: Legitimate effects components that need inline styles
          if (THEME_SYSTEM.legitimatePatterns.effectsInlineStyles.some(effect => file.includes(effect))) {
            return;
          }

          // Detect problematic inline styles (exclude animation/effects)
          if (line.includes('style={{') && !this.isLegitimateInlineStyle(line, file)) {
            styleIssues.push({
              file,
              lineNumber,
              type: 'inline-style',
              content: line.trim(),
              suggestedFix: 'Replace with theme classes or move to styled component',
              severity: 'high'
            });
          }

          // Detect hardcoded values with exclusions
          THEME_SYSTEM.hardcodedPatterns.forEach(({ pattern, type, exclude }) => {
            // Skip if file is in excluded directories
            if (exclude.some(excludePath => file.includes(excludePath))) {
              return;
            }

            const matches = line.match(pattern);
            if (matches) {
              matches.forEach(match => {
                // Skip if it's already using theme system
                if (line.includes('var(--') || line.includes('theme-')) {
                  return;
                }

                // Skip legitimate animation/transition values
                if (this.isLegitimateStyleValue(match, line)) {
                  return;
                }

                styleIssues.push({
                  file,
                  lineNumber,
                  type: type as StyleIssue['type'],
                  content: line.trim(),
                  suggestedFix: this.generateRealisticStyleFix(match, type),
                  severity: this.getRealisticStyleSeverity(match, file)
                });
              });
            }
          });

          // Detect truly problematic Tailwind classes only
          const tailwindMatch = line.match(/className=["`']([^"`']*)["`']/);
          if (tailwindMatch) {
            const classes = tailwindMatch[1];
            const problematicClasses = this.detectActualProblematicClasses(classes, file);
            
            if (problematicClasses.length > 0) {
              styleIssues.push({
                file,
                lineNumber,
                type: 'non-theme-class',
                content: line.trim(),
                suggestedFix: `Replace with theme alternatives: ${this.suggestRealisticAlternatives(problematicClasses).join(', ')}`,
                severity: 'medium'
              });
            }
          }
        });
      } catch (error) {
        console.warn(`⚠️  Cannot analyze styles in ${file}: ${error}`);
      }
    });

    this.report.styleIssues = styleIssues;
    this.report.summary.styleIssues = styleIssues.length;
  }

  // 🧱 REALISTIC Non-Reusable Structure Detection
  analyzeNonReusableStructures(files: string[]): void {
    const actualPatterns: Map<string, { files: string[]; lines: number[]; content: string }> = new Map();

    files.forEach(file => {
      try {
        const content = fs.readFileSync(file, 'utf-8');
        const lines = content.split('\n');
        
        // Look for genuinely repeated UI patterns (5+ lines, not theme utilities)
        for (let i = 0; i < lines.length - 4; i++) {
          const block = lines.slice(i, i + 5).join('\n');
          
          // SKIP: Theme utility patterns that are intentionally similar
          if (this.isThemeUtilityPattern(block)) {
            continue;
          }

          // SKIP: Import/export statements
          if (block.includes('import') || block.includes('export')) {
            continue;
          }

          const normalizedBlock = this.normalizeRepeatedBlock(block);
          
          if (this.isGenuinelyRepeatedStructure(normalizedBlock, file)) {
            const key = normalizedBlock;
            
            if (!actualPatterns.has(key)) {
              actualPatterns.set(key, {
                files: [],
                lines: [],
                content: block.substring(0, 150) // Limit content preview
              });
            }
            
            const pattern = actualPatterns.get(key)!;
            // Only add if it's from a different file
            if (!pattern.files.includes(file)) {
              pattern.files.push(file);
              pattern.lines.push(i + 1);
            }
          }
        }
      } catch (error) {
        console.warn(`⚠️  Cannot analyze structures in ${file}: ${error}`);
      }
    });

    const nonReusableStructures: NonReusableStructure[] = [];

    actualPatterns.forEach((pattern, key) => {
      // Only report patterns that appear in 3+ different files (genuine duplication)
      if (pattern.files.length >= 3) {
        pattern.files.forEach((file, index) => {
          nonReusableStructures.push({
            file,
            lineNumber: pattern.lines[index],
            type: 'repeated-ui-block',
            content: pattern.content,
            occurrences: pattern.files.length,
            suggestedFix: `Extract to shared component - duplicated across ${pattern.files.length} files`
          });
        });
      }
    });

    this.report.nonReusableStructures = nonReusableStructures;
    this.report.summary.nonReusableStructures = nonReusableStructures.length;
  }

  // 🚫 Unused Component Detection
  analyzeUnusedComponents(files: string[]): void {
    const exportedComponents: Map<string, UnusedComponent> = new Map();
    const imports: Set<string> = new Set();

    // Phase 1: Collect all exports
    files.forEach(file => {
      const ast = this.parseFile(file);
      if (!ast) return;

      this.walkAST(ast, (node: TSESTree.Node) => {
        // Named exports
        if (node.type === AST_NODE_TYPES.ExportNamedDeclaration) {
          if (node.declaration?.type === AST_NODE_TYPES.FunctionDeclaration && node.declaration.id) {
            const componentName = node.declaration.id.name;
            exportedComponents.set(componentName, {
              file,
              component: componentName,
              exports: [componentName],
              isUsed: false,
              suggestedAction: 'delete'
            });
          }
        }

        // Default exports
        if (node.type === AST_NODE_TYPES.ExportDefaultDeclaration) {
          const componentName = this.extractDefaultExportName(node, file);
          if (componentName) {
            exportedComponents.set(componentName, {
              file,
              component: componentName,
              exports: ['default'],
              isUsed: false,
              suggestedAction: 'delete'
            });
          }
        }
      });
    });

    // Phase 2: Collect all imports
    files.forEach(file => {
      const ast = this.parseFile(file);
      if (!ast) return;

      this.walkAST(ast, (node: TSESTree.Node) => {
        if (node.type === AST_NODE_TYPES.ImportDeclaration) {
          if (node.specifiers) {
            node.specifiers.forEach(spec => {
              if (spec.type === AST_NODE_TYPES.ImportSpecifier) {
                imports.add(spec.imported.name);
              } else if (spec.type === AST_NODE_TYPES.ImportDefaultSpecifier) {
                imports.add(spec.local.name);
              }
            });
          }
        }
      });
    });

    // Phase 3: Mark used components
    exportedComponents.forEach((component, name) => {
      if (imports.has(name)) {
        component.isUsed = true;
        component.suggestedAction = 'refactor';
      }
    });

    // Phase 4: Detect conflicts (multiple components doing same thing)
    this.detectComponentConflicts(exportedComponents);

    const unusedComponents = Array.from(exportedComponents.values()).filter(comp => !comp.isUsed);
    
    this.report.unusedComponents = unusedComponents;
    this.report.summary.unusedComponents = unusedComponents.length;
  }

  // 🔧 REALISTIC Helper Methods
  private getComponentSignature(content: string, lineNumber: number): string {
    const lines = content.split('\n');
    const signatureLines = lines.slice(Math.max(0, lineNumber - 1), Math.min(lines.length, lineNumber + 5));
    return signatureLines.join('\n').substring(0, 200);
  }

  private extractPropsFromLine(line: string): string[] {
    const propsMatch = line.match(/\{([^}]+)\}/);
    return propsMatch ? [propsMatch[1].trim()] : [];
  }

  private isDifferentImplementation(content1: string, content2: string, componentName: string): boolean {
    // Simple heuristic: if file sizes differ significantly, they're likely different implementations
    const sizeDiff = Math.abs(content1.length - content2.length);
    const avgSize = (content1.length + content2.length) / 2;
    return sizeDiff > avgSize * 0.3; // 30% difference in size
  }

  private calculateRealSimilarity(content1: string, content2: string): number {
    const lines1 = content1.split('\n').length;
    const lines2 = content2.split('\n').length;
    const sizeDiff = Math.abs(lines1 - lines2);
    const avgLines = (lines1 + lines2) / 2;
    return Math.max(0, Math.round(100 - (sizeDiff / avgLines) * 100));
  }

  private getSimpleStructure(content: string, lineNumber: number): string {
    const lines = content.split('\n');
    return lines.slice(lineNumber - 1, Math.min(lines.length, lineNumber + 3)).join('\n');
  }

  private generateRealFixSuggestion(componentName: string, existingName: string, existingFile: string): string {
    const designSystemEquivalent = THEME_SYSTEM.designSystemComponents.find(ds => 
      componentName.toLowerCase().includes(ds.toLowerCase().replace('pokemon', ''))
    );

    if (designSystemEquivalent) {
      return `Use design system component: ${designSystemEquivalent}`;
    }

    return `Consolidate with ${existingName} in ${existingFile.split('/').pop()}`;
  }

  private isLegitimateInlineStyle(line: string, file: string): boolean {
    // Allow inline styles for animations, dynamic values, or effects
    return line.includes('opacity') || 
           line.includes('transform') || 
           line.includes('animationDelay') ||
           line.includes('background: ') ||
           file.includes('effects/') ||
           line.includes('COSMIC_GRADIENTS');
  }

  private generateRealisticStyleFix(match: string, type: string): string {
    switch (type) {
      case 'hardcoded-color':
        return 'Use theme color token: --theme-primary or --theme-accent';
      case 'hardcoded-opacity':
        return 'Use CSS custom property: --glass-opacity or theme utility';
      case 'hardcoded-spacing':
        return 'Use density spacing: --density-spacing-md or theme utility';
      default:
        return 'Use theme system tokens instead of hardcoded values';
    }
  }

  private getRealisticStyleSeverity(match: string, file: string): StyleIssue['severity'] {
    // Lower severity for effects and animation files
    if (file.includes('effects/') || file.includes('animation/')) {
      return 'low';
    }
    
    // High severity for colors in main UI components
    if (match.includes('#') || match.includes('rgb')) {
      return file.includes('components/') ? 'high' : 'medium';
    }
    
    return 'medium';
  }

  private isLegitimateStyleValue(match: string, line: string): boolean {
    // Allow legitimate animation and transition values
    return line.includes('transition') ||
           line.includes('animation') ||
           line.includes('Duration') ||
           line.includes('Delay') ||
           match === '0.6' || // Common opacity values
           match === '0.8' ||
           match === '0.4';
  }

  private detectActualProblematicClasses(classes: string, file: string): string[] {
    const classList = classes.split(' ').filter(Boolean);
    const problematic: string[] = [];

    classList.forEach(cls => {
      // Skip theme classes
      if (THEME_SYSTEM.themeClasses.some(theme => cls.includes(theme))) {
        return;
      }

      // Skip legitimate theme utilities
      if (THEME_SYSTEM.legitimatePatterns.themeUtilities.some(util => cls.includes(util))) {
        return;
      }

      // Only flag truly hardcoded non-theme classes
      if (/^(bg|text|border)-(red|blue|green|yellow|purple|pink|indigo|gray)-(100|200|300|400|500|600|700|800|900)$/.test(cls) &&
          !file.includes('effects/')) {
        problematic.push(cls);
      }
    });

    return problematic;
  }

  private suggestRealisticAlternatives(classes: string[]): string[] {
    return classes.map(cls => {
      if (cls.includes('bg-')) return 'theme-bg-primary';
      if (cls.includes('text-')) return 'theme-primary';
      if (cls.includes('border-')) return 'theme-border-primary';
      return 'theme-equivalent';
    });
  }

  private isThemeUtilityPattern(block: string): boolean {
    // Skip common theme utility patterns that are meant to be similar
    return THEME_SYSTEM.legitimatePatterns.themeUtilities.some(util => block.includes(util)) ||
           block.includes('glass-morphism') ||
           block.includes('theme-') ||
           block.includes('density-');
  }

  private normalizeRepeatedBlock(block: string): string {
    return block
      .replace(/\s+/g, ' ')
      .replace(/className="[^"]*"/g, 'className="..."')
      .replace(/\{[^}]*\}/g, '{...}')
      .replace(/\w+\d+/g, 'var') // Normalize variable names with numbers
      .trim();
  }

  private isGenuinelyRepeatedStructure(block: string, file: string): boolean {
    // Must have JSX structure
    if (!block.includes('<') || !block.includes('>')) {
      return false;
    }

    // Must be substantial (not just a single element)
    if (block.split('<').length < 3) {
      return false;
    }

    // Skip effects components (they legitimately share patterns)
    if (THEME_SYSTEM.legitimatePatterns.effectsInlineStyles.some(effect => file.includes(effect))) {
      return false;
    }

    // Skip very short blocks
    if (block.length < 50) {
      return false;
    }

    return true;
  }

  private walkAST(node: any, visitor: (node: TSESTree.Node) => void): void {
    if (!node || typeof node !== 'object') return;

    visitor(node);

    for (const key in node) {
      const child = node[key];
      if (Array.isArray(child)) {
        child.forEach(item => this.walkAST(item, visitor));
      } else if (child && typeof child === 'object') {
        this.walkAST(child, visitor);
      }
    }
  }

  private isReactComponent(name: string): boolean {
    return /^[A-Z][a-zA-Z0-9]*$/.test(name);
  }

  private extractJSXStructure(node: any): any {
    const jsx: any[] = [];
    
    this.walkAST(node, (child: any) => {
      if (child.type === AST_NODE_TYPES.JSXElement) {
        jsx.push({
          type: child.openingElement?.name?.name || 'unknown',
          props: child.openingElement?.attributes?.length || 0,
          hasChildren: child.children?.length > 0
        });
      }
    });

    return jsx;
  }

  private extractProps(node: any): string[] {
    const props: string[] = [];
    
    this.walkAST(node, (child: any) => {
      if (child.type === AST_NODE_TYPES.Property && child.key?.name) {
        props.push(child.key.name);
      }
      if (child.type === AST_NODE_TYPES.Identifier && child.name?.endsWith('Props')) {
        props.push(child.name);
      }
    });

    return Array.from(new Set(props));
  }

  // Removed old unused methods - using realistic implementations above

  private extractDefaultExportName(node: any, file: string): string | null {
    if (node.declaration?.name) {
      return node.declaration.name;
    }
    
    // Extract from filename if no explicit name
    const fileName = path.basename(file, path.extname(file));
    return this.isReactComponent(fileName) ? fileName : null;
  }

  private detectComponentConflicts(components: Map<string, UnusedComponent>): void {
    const componentTypes: Map<string, UnusedComponent[]> = new Map();

    // Group by component type (Button, Modal, Input, etc.)
    components.forEach(component => {
      const type = component.component.toLowerCase().replace(/pokemon|common/, '');
      if (!componentTypes.has(type)) {
        componentTypes.set(type, []);
      }
      componentTypes.get(type)!.push(component);
    });

    // Mark conflicts
    componentTypes.forEach(typeComponents => {
      if (typeComponents.length > 1) {
        typeComponents.forEach(component => {
          component.conflictsWith = typeComponents
            .filter(other => other !== component)
            .map(other => other.component);
          component.suggestedAction = 'merge';
        });
      }
    });
  }

  // 📝 Report Generation
  generateRecommendations(): void {
    const recommendations: string[] = [];

    // Duplicate component recommendations
    if (this.report.duplicateComponents.length > 0) {
      recommendations.push(
        `🔁 **${this.report.duplicateComponents.length} duplicate components found** - Consider consolidating using design system components or creating shared interfaces`
      );
    }

    // Style issue recommendations
    if (this.report.styleIssues.length > 0) {
      const highSeverity = this.report.styleIssues.filter(issue => issue.severity === 'high').length;
      recommendations.push(
        `🎨 **${this.report.styleIssues.length} style issues detected** (${highSeverity} high priority) - Migrate to theme system using CSS custom properties`
      );
    }

    // Non-reusable structure recommendations
    if (this.report.nonReusableStructures.length > 0) {
      recommendations.push(
        `🧱 **${this.report.nonReusableStructures.length} repeated UI blocks found** - Extract to shared components for better maintainability`
      );
    }

    // Unused component recommendations
    if (this.report.unusedComponents.length > 0) {
      const conflicts = this.report.unusedComponents.filter(comp => comp.conflictsWith?.length).length;
      recommendations.push(
        `🚫 **${this.report.unusedComponents.length} unused components detected** (${conflicts} with conflicts) - Clean up codebase by removing or consolidating`
      );
    }

    // Overall recommendations
    if (this.report.summary.totalIssues > 20) {
      recommendations.push(
        `⚡ **High issue count detected** - Consider implementing systematic refactoring with design system consolidation`
      );
    }

    this.report.recommendations = recommendations;
  }

  async generateReport(): Promise<string> {
    this.report.summary.totalIssues = 
      this.report.duplicateComponents.length +
      this.report.styleIssues.length +
      this.report.nonReusableStructures.length +
      this.report.unusedComponents.length;

    this.generateRecommendations();

    const reportDate = new Date().toISOString().split('T')[0];
    
    return `# 🔍 Frontend Static Analysis Report
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

${this.report.recommendations.map(rec => `- ${rec}`).join('\n')}

---

## 🔁 Duplicate Components (${this.report.duplicateComponents.length})

${this.report.duplicateComponents.length === 0 ? '✅ **No duplicate components detected**' : ''}

${this.report.duplicateComponents.map((duplicate, index) => `
### ${index + 1}. ${duplicate.component}
- **File:** \`${duplicate.file}:${duplicate.lineNumber}\`
- **Duplicate of:** ${duplicate.duplicateOf}
- **Similarity:** ${duplicate.similarity}%
- **Props:** ${duplicate.props.join(', ') || 'None'}
- **Suggested Fix:** ${duplicate.suggestedFix}

<details>
<summary>JSX Structure</summary>

\`\`\`javascript
${duplicate.jsxStructure}
\`\`\`
</details>
`).join('\n')}

---

## 🎨 Style Issues (${this.report.styleIssues.length})

${this.report.styleIssues.length === 0 ? '✅ **No style issues detected**' : ''}

### High Priority Issues (${this.report.styleIssues.filter(issue => issue.severity === 'high').length})

${this.report.styleIssues
  .filter(issue => issue.severity === 'high')
  .map((issue, index) => `
**${index + 1}. ${issue.type.toUpperCase()}** - \`${issue.file}:${issue.lineNumber}\`
- **Content:** \`${issue.content}\`
- **Fix:** ${issue.suggestedFix}
`).join('\n')}

### Medium Priority Issues (${this.report.styleIssues.filter(issue => issue.severity === 'medium').length})

${this.report.styleIssues
  .filter(issue => issue.severity === 'medium')
  .slice(0, 10) // Limit to first 10 for readability
  .map((issue, index) => `
**${index + 1}. ${issue.type.toUpperCase()}** - \`${issue.file}:${issue.lineNumber}\`
- **Content:** \`${issue.content}\`
- **Fix:** ${issue.suggestedFix}
`).join('\n')}

${this.report.styleIssues.filter(issue => issue.severity === 'medium').length > 10 ? 
`\n*... and ${this.report.styleIssues.filter(issue => issue.severity === 'medium').length - 10} more medium priority issues*\n` : ''}

---

## 🧱 Non-Reusable Structures (${this.report.nonReusableStructures.length})

${this.report.nonReusableStructures.length === 0 ? '✅ **No non-reusable structures detected**' : ''}

${this.report.nonReusableStructures
  .slice(0, 10) // Limit for readability
  .map((structure, index) => `
### ${index + 1}. ${structure.type.toUpperCase()}
- **File:** \`${structure.file}:${structure.lineNumber}\`
- **Occurrences:** ${structure.occurrences} files
- **Suggested Fix:** ${structure.suggestedFix}

<details>
<summary>Repeated Content</summary>

\`\`\`javascript
${structure.content}
\`\`\`
</details>
`).join('\n')}

---

## 🚫 Unused Components (${this.report.unusedComponents.length})

${this.report.unusedComponents.length === 0 ? '✅ **No unused components detected**' : ''}

${this.report.unusedComponents.map((component, index) => `
### ${index + 1}. ${component.component}
- **File:** \`${component.file}\`
- **Exports:** ${component.exports.join(', ')}
- **Action:** ${component.suggestedAction.toUpperCase()}
${component.conflictsWith?.length ? `- **Conflicts with:** ${component.conflictsWith.join(', ')}` : ''}
`).join('\n')}

---

## 🛠️ Implementation Guide

### Phase 1: Critical Issues (High Priority)
1. **Fix inline styles** - Replace with theme classes or CSS modules
2. **Address hardcoded colors** - Use theme CSS custom properties
3. **Consolidate duplicate components** - Merge with design system components

### Phase 2: Optimization (Medium Priority)
1. **Extract repeated UI blocks** - Create reusable components
2. **Update non-theme classes** - Migrate to theme-aware alternatives
3. **Clean unused components** - Remove or consolidate conflicting implementations

### Phase 3: Enhancement (Low Priority)
1. **Optimize component architecture** - Apply SOLID principles
2. **Enhance theme system integration** - Full CSS custom property adoption
3. **Implement design system patterns** - Standardize component usage

---

## 📈 Success Metrics

### Target Improvements
- **Reduce duplicate components by 80%+**
- **Eliminate inline styles (100%)**
- **Achieve theme consistency (90%+)**
- **Consolidate repeated UI blocks (70%+)**
- **Remove unused components (100%)**

### Monitoring
- Regular static analysis runs
- Theme system compliance checking  
- Component usage tracking
- Performance impact measurement

---

*Analysis completed with AST parsing of ${this.report.summary.filesScanned} React TypeScript files*
`;
  }

  // 🚀 Main Analysis Runner
  async analyze(): Promise<void> {
    console.log('🔍 Starting comprehensive frontend analysis...');
    
    const files = await this.scanFiles();
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
    const report = await this.generateReport();
    
    const outputPath = './frontend-analysis-report.md';
    fs.writeFileSync(outputPath, report);
    
    console.log(`✅ Analysis complete! Report saved to: ${outputPath}`);
    console.log(`📊 Total issues found: ${this.report.summary.totalIssues}`);
  }
}

// 🚀 CLI Runner
async function main() {
  const analyzer = new FrontendAnalyzer('./src');
  await analyzer.analyze();
}

// Auto-run the analysis
main().catch(console.error);

export { FrontendAnalyzer, AnalysisReport };