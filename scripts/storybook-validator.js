#!/usr/bin/env node

/**
 * Storybook Story Validator for Pokemon Collection Frontend
 * Ensures all shared UI components have proper Storybook documentation
 * Part of the automated PR checks system
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  sharedUIPath: './src/shared/ui',
  storiesPattern: '**/*.stories.@(js|jsx|ts|tsx)',
  componentsPattern: '**/*.@(tsx)',
  requiredStories: [
    'Default',
    'AllVariants',
    'DarkMode',
    'Playground'
  ],
  reportPath: './storybook-validation-report.json',
  thresholds: {
    coverage: 0.9,  // 90% of components must have stories
    storyCompleteness: 0.8  // 80% of required stories per component
  }
};

// ANSI color codes
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

/**
 * Find all component files in shared UI directory
 */
function findComponents() {
  if (!fs.existsSync(CONFIG.sharedUIPath)) {
    return [];
  }

  try {
    const findCommand = `find ${CONFIG.sharedUIPath} -name "*.tsx" -not -name "*.stories.tsx" -not -name "*.test.tsx" -not -name "index.ts*"`;
    const output = execSync(findCommand, { encoding: 'utf8' });
    
    return output
      .trim()
      .split('\n')
      .filter(file => file.length > 0)
      .map(file => {
        const relativePath = path.relative(process.cwd(), file);
        const componentName = path.basename(file, '.tsx');
        const dir = path.dirname(file);
        
        return {
          name: componentName,
          path: relativePath,
          directory: dir,
          expectedStoryPath: path.join(dir, `${componentName}.stories.tsx`)
        };
      });
  } catch (error) {
    console.warn(`${colors.yellow}Warning: Could not find components: ${error.message}${colors.reset}`);
    return [];
  }
}

/**
 * Find all story files
 */
function findStories() {
  if (!fs.existsSync(CONFIG.sharedUIPath)) {
    return [];
  }

  try {
    const findCommand = `find ${CONFIG.sharedUIPath} -name "*.stories.tsx"`;
    const output = execSync(findCommand, { encoding: 'utf8' });
    
    return output
      .trim()
      .split('\n')
      .filter(file => file.length > 0)
      .map(file => {
        const relativePath = path.relative(process.cwd(), file);
        const baseName = path.basename(file, '.stories.tsx');
        
        return {
          componentName: baseName,
          path: relativePath,
          content: fs.readFileSync(file, 'utf8')
        };
      });
  } catch (error) {
    console.warn(`${colors.yellow}Warning: Could not find stories: ${error.message}${colors.reset}`);
    return [];
  }
}

/**
 * Analyze story content to extract available stories
 */
function analyzeStoryContent(storyContent) {
  const stories = [];
  const exportRegex = /export const (\w+) = /g;
  let match;
  
  while ((match = exportRegex.exec(storyContent)) !== null) {
    const storyName = match[1];
    if (storyName !== 'default' && storyName !== 'Default') {
      stories.push(storyName);
    }
  }

  // Check for specific story patterns
  const analysis = {
    stories,
    hasDefault: /export const Default\s*=/.test(storyContent),
    hasPlayground: /export const Playground\s*=/.test(storyContent),
    hasAllVariants: /export const (AllVariants|Variants)\s*=/.test(storyContent),
    hasDarkMode: /export const DarkMode\s*=/.test(storyContent),
    hasInteractive: /argTypes\s*:|controls\s*:/.test(storyContent),
    hasDocumentation: /@storybook\/addon-docs|description\s*:/.test(storyContent),
    hasA11yAddon: /@storybook\/addon-a11y/.test(storyContent),
    themeVariants: extractThemeVariants(storyContent),
    parameters: extractParameters(storyContent)
  };

  return analysis;
}

/**
 * Extract theme variants from story content
 */
function extractThemeVariants(content) {
  const variants = [];
  const themeRegex = /(pokemon|glass|cosmic|neural|minimal)/gi;
  let match;
  
  while ((match = themeRegex.exec(content)) !== null) {
    const variant = match[1].toLowerCase();
    if (!variants.includes(variant)) {
      variants.push(variant);
    }
  }
  
  return variants;
}

/**
 * Extract story parameters
 */
function extractParameters(content) {
  const parameters = {
    hasDocumentation: /parameters\s*:[\s\S]*docs\s*:/.test(content),
    hasA11y: /parameters\s*:[\s\S]*a11y\s*:/.test(content),
    hasViewport: /parameters\s*:[\s\S]*viewport\s*:/.test(content),
    hasBackground: /parameters\s*:[\s\S]*backgrounds\s*:/.test(content)
  };
  
  return parameters;
}

/**
 * Validate component has proper story coverage
 */
function validateComponent(component, stories) {
  const story = stories.find(s => s.componentName === component.name);
  
  const validation = {
    component: component.name,
    path: component.path,
    hasStory: !!story,
    storyPath: story?.path,
    issues: [],
    recommendations: [],
    score: 0,
    analysis: null
  };

  if (!story) {
    validation.issues.push('No Storybook story found');
    validation.recommendations.push(`Create ${component.expectedStoryPath}`);
    return validation;
  }

  // Analyze story content
  validation.analysis = analyzeStoryContent(story.content);
  
  let score = 0;
  const maxScore = 10;

  // Check required stories
  if (validation.analysis.hasDefault) {
    score += 2;
  } else {
    validation.issues.push('Missing Default story');
    validation.recommendations.push('Add Default story export');
  }

  if (validation.analysis.hasPlayground) {
    score += 1;
  } else {
    validation.recommendations.push('Consider adding Playground story with interactive controls');
  }

  if (validation.analysis.hasAllVariants) {
    score += 2;
  } else {
    validation.issues.push('Missing AllVariants story');
    validation.recommendations.push('Add story showcasing all component variants');
  }

  if (validation.analysis.hasDarkMode) {
    score += 1;
  } else {
    validation.recommendations.push('Add DarkMode story to test dark theme');
  }

  // Check documentation
  if (validation.analysis.hasDocumentation) {
    score += 1;
  } else {
    validation.issues.push('Missing component documentation');
    validation.recommendations.push('Add component description and usage examples');
  }

  // Check interactivity
  if (validation.analysis.hasInteractive) {
    score += 1;
  } else {
    validation.recommendations.push('Add argTypes or controls for interactive testing');
  }

  // Check theme coverage
  const expectedThemes = ['pokemon', 'glass', 'cosmic'];
  const coveredThemes = validation.analysis.themeVariants.filter(v => expectedThemes.includes(v));
  
  if (coveredThemes.length >= 2) {
    score += 1;
  } else {
    validation.recommendations.push('Add stories for multiple theme variants');
  }

  // Check accessibility
  if (validation.analysis.parameters.hasA11y) {
    score += 1;
  } else {
    validation.recommendations.push('Add accessibility parameters and testing');
  }

  validation.score = (score / maxScore) * 100;

  // Categorize issues
  if (validation.score < 50) {
    validation.issues.push('Story coverage is insufficient');
  } else if (validation.score < 80) {
    validation.issues.push('Story coverage could be improved');
  }

  return validation;
}

/**
 * Generate validation report
 */
function generateReport(components, stories, validations) {
  const totalComponents = components.length;
  const componentsWithStories = validations.filter(v => v.hasStory).length;
  const averageScore = validations.reduce((sum, v) => sum + v.score, 0) / totalComponents;
  
  const coverage = totalComponents > 0 ? componentsWithStories / totalComponents : 0;
  
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalComponents,
      componentsWithStories,
      coverage: coverage * 100,
      averageScore,
      passed: coverage >= CONFIG.thresholds.coverage && averageScore >= CONFIG.thresholds.storyCompleteness * 100
    },
    thresholds: {
      coverage: CONFIG.thresholds.coverage * 100,
      storyCompleteness: CONFIG.thresholds.storyCompleteness * 100
    },
    components: validations,
    stories: stories.map(s => ({
      path: s.path,
      componentName: s.componentName,
      analysis: analyzeStoryContent(s.content)
    })),
    recommendations: generateGlobalRecommendations(validations),
    missingStories: validations.filter(v => !v.hasStory).map(v => ({
      component: v.component,
      expectedPath: v.component.replace(/\.tsx$/, '.stories.tsx')
    }))
  };

  // Save report
  fs.writeFileSync(CONFIG.reportPath, JSON.stringify(report, null, 2));
  
  return report;
}

/**
 * Generate global recommendations
 */
function generateGlobalRecommendations(validations) {
  const recommendations = [];
  
  const lowScoreComponents = validations.filter(v => v.score < 50);
  if (lowScoreComponents.length > 0) {
    recommendations.push(`${lowScoreComponents.length} components have insufficient story coverage`);
  }

  const missingStories = validations.filter(v => !v.hasStory);
  if (missingStories.length > 0) {
    recommendations.push(`${missingStories.length} shared UI components are missing Storybook stories`);
  }

  const missingDefaults = validations.filter(v => v.analysis && !v.analysis.hasDefault);
  if (missingDefaults.length > 0) {
    recommendations.push(`${missingDefaults.length} stories are missing Default exports`);
  }

  const missingPlaygrounds = validations.filter(v => v.analysis && !v.analysis.hasPlayground);
  if (missingPlaygrounds.length > 0) {
    recommendations.push(`Consider adding Playground stories to ${missingPlaygrounds.length} components for better testing`);
  }

  const missingDocs = validations.filter(v => v.analysis && !v.analysis.hasDocumentation);
  if (missingDocs.length > 0) {
    recommendations.push(`${missingDocs.length} stories need better documentation`);
  }

  return recommendations;
}

/**
 * Print validation report
 */
function printReport(report) {
  console.log(`\n${colors.bold}${colors.cyan}📚 Storybook Validation Report${colors.reset}`);
  console.log(`${colors.cyan}=================================${colors.reset}\n`);

  // Summary
  const statusColor = report.summary.passed ? colors.green : colors.red;
  const statusIcon = report.summary.passed ? '✅' : '❌';
  
  console.log(`${colors.bold}Overall Status: ${statusColor}${statusIcon} ${report.summary.passed ? 'PASSED' : 'FAILED'}${colors.reset}\n`);

  // Coverage metrics
  console.log(`${colors.bold}Coverage Metrics:${colors.reset}`);
  console.log(`  Total Components: ${colors.blue}${report.summary.totalComponents}${colors.reset}`);
  console.log(`  With Stories: ${colors.green}${report.summary.componentsWithStories}${colors.reset}`);
  console.log(`  Coverage: ${colors.cyan}${report.summary.coverage.toFixed(1)}%${colors.reset} (threshold: ${CONFIG.thresholds.coverage * 100}%)`);
  console.log(`  Average Score: ${colors.cyan}${report.summary.averageScore.toFixed(1)}%${colors.reset} (threshold: ${CONFIG.thresholds.storyCompleteness * 100}%)\n`);

  // Missing stories
  if (report.missingStories.length > 0) {
    console.log(`${colors.bold}${colors.red}Missing Stories:${colors.reset}`);
    report.missingStories.forEach(missing => {
      console.log(`  ${colors.red}• ${missing.component}${colors.reset}`);
      console.log(`    Expected: ${missing.expectedPath}`);
    });
    console.log();
  }

  // Component details
  console.log(`${colors.bold}Component Analysis:${colors.reset}`);
  report.components.forEach(component => {
    const scoreColor = component.score >= 80 ? colors.green : 
                      component.score >= 50 ? colors.yellow : colors.red;
    const icon = component.hasStory ? (component.score >= 80 ? '✅' : '⚠️ ') : '❌';
    
    console.log(`  ${icon} ${component.component} ${scoreColor}(${component.score.toFixed(0)}%)${colors.reset}`);
    
    if (component.issues.length > 0) {
      component.issues.forEach(issue => {
        console.log(`    ${colors.red}• ${issue}${colors.reset}`);
      });
    }
    
    if (component.recommendations.length > 0 && component.recommendations.length <= 3) {
      component.recommendations.slice(0, 2).forEach(rec => {
        console.log(`    ${colors.yellow}→ ${rec}${colors.reset}`);
      });
    }
  });
  console.log();

  // Global recommendations
  if (report.recommendations.length > 0) {
    console.log(`${colors.bold}${colors.yellow}Recommendations:${colors.reset}`);
    report.recommendations.forEach((rec, index) => {
      console.log(`  ${index + 1}. ${colors.yellow}${rec}${colors.reset}`);
    });
    console.log();
  }

  // Story quality insights
  const storiesWithGoodCoverage = report.components.filter(c => c.analysis?.themeVariants.length >= 2).length;
  const storiesWithDocs = report.components.filter(c => c.analysis?.hasDocumentation).length;
  const storiesWithA11y = report.components.filter(c => c.analysis?.parameters.hasA11y).length;

  console.log(`${colors.bold}Story Quality Insights:${colors.reset}`);
  console.log(`  Theme Coverage: ${colors.cyan}${storiesWithGoodCoverage}/${report.summary.componentsWithStories}${colors.reset} stories cover multiple themes`);
  console.log(`  Documentation: ${colors.cyan}${storiesWithDocs}/${report.summary.componentsWithStories}${colors.reset} stories have documentation`);
  console.log(`  Accessibility: ${colors.cyan}${storiesWithA11y}/${report.summary.componentsWithStories}${colors.reset} stories have a11y setup\n`);

  console.log(`${colors.cyan}Report saved to: ${CONFIG.reportPath}${colors.reset}\n`);
}

/**
 * Generate story template for missing components
 */
function generateStoryTemplate(componentName) {
  return `import type { Meta, StoryObj } from '@storybook/react';
import { ${componentName} } from './${componentName}';

const meta: Meta<typeof ${componentName}> = {
  title: 'Components/${componentName}',
  component: ${componentName},
  parameters: {
    docs: {
      description: {
        component: 'Add component description here'
      }
    },
    a11y: {
      // Accessibility configuration
      config: {
        rules: [
          {
            id: 'color-contrast',
            enabled: true
          }
        ]
      }
    }
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'pokemon', 'glass', 'cosmic']
    }
  }
};

export default meta;
type Story = StoryObj<typeof meta>;

// Required: Default story
export const Default: Story = {
  args: {}
};

// Required: All variants showcase
export const AllVariants: Story = {
  render: () => (
    <div className="space-y-4">
      <${componentName} variant="default">Default</${componentName}>
      <${componentName} variant="pokemon">Pokemon</${componentName}>
      <${componentName} variant="glass">Glass</${componentName}>
      <${componentName} variant="cosmic">Cosmic</${componentName}>
    </div>
  )
};

// Required: Dark mode testing
export const DarkMode: Story = {
  parameters: {
    backgrounds: { default: 'dark' }
  },
  args: {
    variant: 'pokemon'
  }
};

// Interactive playground
export const Playground: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Interactive playground to test all component props'
      }
    }
  }
};

// Density variations
export const DensityModes: Story = {
  render: () => (
    <div className="space-y-4">
      <div data-density="compact">
        <${componentName} variant="pokemon">Compact</${componentName}>
      </div>
      <div data-density="comfortable">
        <${componentName} variant="pokemon">Comfortable</${componentName}>
      </div>
      <div data-density="spacious">
        <${componentName} variant="pokemon">Spacious</${componentName}>
      </div>
    </div>
  )
};

// Accessibility demonstration
export const AccessibilityDemo: Story = {
  render: () => (
    <div className="space-y-2">
      <${componentName} 
        variant="pokemon"
        aria-label="Accessible component example"
      >
        With ARIA label
      </${componentName}>
      <${componentName} 
        variant="pokemon"
        role="button"
        tabIndex={0}
      >
        Focusable component
      </${componentName}>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates accessibility features and keyboard navigation'
      }
    }
  }
};
`;
}

/**
 * Create missing story files
 */
function createMissingStories(report, createFiles = false) {
  console.log(`${colors.cyan}Generating story templates...${colors.reset}\n`);

  report.missingStories.forEach(missing => {
    const template = generateStoryTemplate(missing.component);
    
    if (createFiles) {
      const storyPath = missing.expectedPath;
      const storyDir = path.dirname(storyPath);
      
      // Create directory if it doesn't exist
      if (!fs.existsSync(storyDir)) {
        fs.mkdirSync(storyDir, { recursive: true });
      }
      
      fs.writeFileSync(storyPath, template);
      console.log(`${colors.green}✓ Created: ${storyPath}${colors.reset}`);
    } else {
      console.log(`${colors.yellow}Template for ${missing.component}:${colors.reset}`);
      console.log(`${colors.blue}File: ${missing.expectedPath}${colors.reset}`);
      console.log(template);
      console.log(`${colors.cyan}${'='.repeat(50)}${colors.reset}\n`);
    }
  });
}

/**
 * Main execution function
 */
function main() {
  const args = process.argv.slice(2);
  const generateTemplates = args.includes('--generate-templates');
  const createFiles = args.includes('--create-files');
  const verbose = args.includes('--verbose');

  try {
    console.log(`${colors.bold}${colors.cyan}🔍 Validating Storybook Stories${colors.reset}\n`);

    // Find components and stories
    const components = findComponents();
    const stories = findStories();

    console.log(`Found ${colors.blue}${components.length}${colors.reset} components and ${colors.green}${stories.length}${colors.reset} stories\n`);

    // Validate each component
    const validations = components.map(component => 
      validateComponent(component, stories)
    );

    // Generate report
    const report = generateReport(components, stories, validations);
    
    // Print report
    if (verbose) {
      console.log('\n' + JSON.stringify(report, null, 2));
    } else {
      printReport(report);
    }

    // Generate templates if requested
    if (generateTemplates || createFiles) {
      createMissingStories(report, createFiles);
    }

    // Exit with appropriate code
    if (!report.summary.passed) {
      console.log(`${colors.red}Storybook validation failed. Please address the issues above.${colors.reset}`);
      process.exit(1);
    } else {
      console.log(`${colors.green}All Storybook validation checks passed!${colors.reset}`);
      process.exit(0);
    }

  } catch (error) {
    console.error(`${colors.red}Storybook validation failed: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  findComponents,
  findStories,
  validateComponent,
  generateReport,
  generateStoryTemplate,
  CONFIG
};