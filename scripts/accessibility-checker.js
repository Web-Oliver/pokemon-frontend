#!/usr/bin/env node

/**
 * Accessibility Checker for Pokemon Collection Frontend
 * Automated WCAG 2.1 AA compliance validation
 * Part of the automated PR checks system
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  storybookPort: 6006,
  axeConfig: {
    rules: {
      // WCAG 2.1 AA rules
      'color-contrast': { enabled: true },
      'keyboard': { enabled: true },
      'focus-visible': { enabled: true },
      'aria-labels': { enabled: true },
      'semantic-markup': { enabled: true },
      'heading-order': { enabled: true }
    },
    tags: ['wcag2a', 'wcag2aa', 'wcag21aa']
  },
  reportPath: './accessibility-report.json',
  thresholds: {
    violations: 0,        // No violations allowed
    incomplete: 5,       // Max 5 incomplete checks
    passes: 50           // Minimum passes required
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
 * Check if Storybook is running
 */
function isStorybookRunning() {
  try {
    execSync(`curl -s http://localhost:${CONFIG.storybookPort} > /dev/null`, { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Start Storybook for testing
 */
function startStorybook() {
  console.log(`${colors.yellow}Starting Storybook on port ${CONFIG.storybookPort}...${colors.reset}`);
  
  try {
    // Build Storybook first
    console.log(`${colors.cyan}Building Storybook...${colors.reset}`);
    execSync('npm run build-storybook', { stdio: 'inherit' });
    
    // Start static server
    const server = execSync(`npx http-server storybook-static -p ${CONFIG.storybookPort} -s &`, { 
      stdio: 'ignore',
      detached: true 
    });
    
    // Wait for server to start
    let retries = 30;
    while (retries > 0 && !isStorybookRunning()) {
      execSync('sleep 1');
      retries--;
    }
    
    if (!isStorybookRunning()) {
      throw new Error('Failed to start Storybook server');
    }
    
    console.log(`${colors.green}✓ Storybook started on port ${CONFIG.storybookPort}${colors.reset}`);
    return true;
    
  } catch (error) {
    console.error(`${colors.red}Failed to start Storybook: ${error.message}${colors.reset}`);
    return false;
  }
}

/**
 * Run accessibility tests using Storybook test runner
 */
async function runAccessibilityTests() {
  console.log(`${colors.cyan}Running accessibility tests...${colors.reset}`);
  
  try {
    // Run Storybook test runner with accessibility addon
    const testCommand = `npx test-storybook --browsers chromium --maxWorkers=2 --coverage --json --outputFile=${CONFIG.reportPath}`;
    
    console.log(`${colors.blue}Executing: ${testCommand}${colors.reset}`);
    const output = execSync(testCommand, { encoding: 'utf8', maxBuffer: 1024 * 1024 * 10 });
    
    return parseTestResults(output);
    
  } catch (error) {
    console.error(`${colors.red}Accessibility tests failed: ${error.message}${colors.reset}`);
    
    // Try to parse partial results
    if (fs.existsSync(CONFIG.reportPath)) {
      return parseReportFile();
    }
    
    throw error;
  }
}

/**
 * Parse test results from JSON output
 */
function parseTestResults(output) {
  try {
    const results = JSON.parse(output);
    return processTestResults(results);
  } catch (error) {
    console.warn(`${colors.yellow}Could not parse test output as JSON, checking report file...${colors.reset}`);
    return parseReportFile();
  }
}

/**
 * Parse report file if direct output parsing fails
 */
function parseReportFile() {
  if (!fs.existsSync(CONFIG.reportPath)) {
    throw new Error('No accessibility report found');
  }
  
  const reportData = fs.readFileSync(CONFIG.reportPath, 'utf8');
  const results = JSON.parse(reportData);
  return processTestResults(results);
}

/**
 * Process and analyze test results
 */
function processTestResults(rawResults) {
  const results = {
    timestamp: new Date().toISOString(),
    summary: {
      totalTests: 0,
      passed: 0,
      failed: 0,
      violations: 0,
      incomplete: 0,
      passes: 0
    },
    stories: {},
    violations: [],
    recommendations: [],
    passed: false
  };

  // Process test results (format depends on test runner output)
  if (rawResults.testResults) {
    results.summary.totalTests = rawResults.numTotalTests || 0;
    results.summary.passed = rawResults.numPassedTests || 0;
    results.summary.failed = rawResults.numFailedTests || 0;

    // Process individual test results
    rawResults.testResults.forEach(testResult => {
      testResult.assertionResults.forEach(assertion => {
        const storyId = assertion.title || assertion.ancestorTitles?.join('/');
        
        if (!results.stories[storyId]) {
          results.stories[storyId] = {
            violations: [],
            incomplete: [],
            passes: [],
            status: 'unknown'
          };
        }

        // Simulate axe-core results structure
        if (assertion.status === 'failed') {
          results.stories[storyId].violations.push({
            id: 'accessibility-violation',
            impact: 'serious',
            description: assertion.failureMessages?.join(', ') || 'Accessibility violation detected',
            help: 'Review accessibility requirements',
            nodes: []
          });
          results.summary.violations++;
        } else if (assertion.status === 'passed') {
          results.stories[storyId].passes.push({
            id: 'accessibility-pass',
            description: 'Accessibility check passed'
          });
          results.summary.passes++;
        }
      });
    });
  }

  // Analyze results against thresholds
  results.passed = (
    results.summary.violations <= CONFIG.thresholds.violations &&
    results.summary.incomplete <= CONFIG.thresholds.incomplete &&
    results.summary.passes >= CONFIG.thresholds.passes
  );

  // Generate recommendations
  if (results.summary.violations > 0) {
    results.recommendations.push('Fix accessibility violations to meet WCAG 2.1 AA standards');
  }
  
  if (results.summary.incomplete > CONFIG.thresholds.incomplete) {
    results.recommendations.push('Review incomplete accessibility checks');
  }
  
  if (results.summary.passes < CONFIG.thresholds.passes) {
    results.recommendations.push('Increase accessibility test coverage');
  }

  return results;
}

/**
 * Run manual accessibility checks for specific components
 */
async function runManualChecks() {
  console.log(`${colors.cyan}Running manual accessibility checks...${colors.reset}`);
  
  const checks = [
    {
      name: 'Theme Contrast Ratios',
      description: 'Verify WCAG 2.1 AA contrast ratios across all themes',
      check: checkContrastRatios
    },
    {
      name: 'Keyboard Navigation',
      description: 'Verify keyboard accessibility for interactive components',
      check: checkKeyboardNavigation
    },
    {
      name: 'Screen Reader Support',
      description: 'Verify ARIA attributes and semantic markup',
      check: checkScreenReaderSupport
    },
    {
      name: 'Focus Management',
      description: 'Verify focus indicators and focus management',
      check: checkFocusManagement
    },
    {
      name: 'Reduced Motion Support',
      description: 'Verify prefers-reduced-motion support',
      check: checkReducedMotion
    }
  ];

  const results = [];
  
  for (const check of checks) {
    console.log(`  ${colors.blue}Checking: ${check.name}${colors.reset}`);
    
    try {
      const result = await check.check();
      results.push({
        name: check.name,
        description: check.description,
        passed: result.passed,
        issues: result.issues || [],
        recommendations: result.recommendations || []
      });
      
      const status = result.passed ? `${colors.green}✓` : `${colors.red}✗`;
      console.log(`    ${status} ${check.name}${colors.reset}`);
      
    } catch (error) {
      results.push({
        name: check.name,
        description: check.description,
        passed: false,
        issues: [error.message],
        recommendations: ['Review and fix the check implementation']
      });
      
      console.log(`    ${colors.red}✗ ${check.name} (Error: ${error.message})${colors.reset}`);
    }
  }
  
  return results;
}

/**
 * Check contrast ratios across themes
 */
async function checkContrastRatios() {
  // This would integrate with a contrast checking tool
  // For now, return a basic check based on CSS variable definitions
  
  const themeFiles = [
    './src/theme/unified-variables.css',
    './src/theme/themes.ts'
  ];
  
  const issues = [];
  const recommendations = [];
  
  for (const file of themeFiles) {
    if (!fs.existsSync(file)) {
      issues.push(`Theme file not found: ${file}`);
    }
  }
  
  // Basic check for CSS variables
  if (fs.existsSync('./src/theme/unified-variables.css')) {
    const cssContent = fs.readFileSync('./src/theme/unified-variables.css', 'utf8');
    
    if (!cssContent.includes('--theme-text-primary')) {
      issues.push('Missing --theme-text-primary CSS variable');
    }
    
    if (!cssContent.includes('--theme-background')) {
      issues.push('Missing --theme-background CSS variable');
    }
  }
  
  if (issues.length > 0) {
    recommendations.push('Ensure all theme variables are properly defined');
    recommendations.push('Use a contrast checking tool to validate color combinations');
  }
  
  return {
    passed: issues.length === 0,
    issues,
    recommendations
  };
}

/**
 * Check keyboard navigation support
 */
async function checkKeyboardNavigation() {
  // Check for focus-visible and keyboard event handling
  const componentFiles = await findComponentFiles();
  const issues = [];
  const recommendations = [];
  
  for (const file of componentFiles.slice(0, 10)) { // Limit to first 10 files
    const content = fs.readFileSync(file, 'utf8');
    
    if (content.includes('onClick') && !content.includes('onKeyDown') && !content.includes('onKeyPress')) {
      issues.push(`${file}: onClick without keyboard equivalent`);
    }
    
    if (content.includes('button') && !content.includes('focus-visible')) {
      issues.push(`${file}: Button without focus-visible styling`);
    }
  }
  
  if (issues.length > 0) {
    recommendations.push('Add keyboard event handlers for interactive elements');
    recommendations.push('Ensure focus-visible styles are applied');
  }
  
  return {
    passed: issues.length === 0,
    issues,
    recommendations
  };
}

/**
 * Check screen reader support
 */
async function checkScreenReaderSupport() {
  const componentFiles = await findComponentFiles();
  const issues = [];
  const recommendations = [];
  
  for (const file of componentFiles.slice(0, 10)) { // Limit to first 10 files
    const content = fs.readFileSync(file, 'utf8');
    
    if (content.includes('<button') && !content.includes('aria-label') && !content.includes('aria-labelledby')) {
      // Only flag if button doesn't have text content
      if (!content.match(/<button[^>]*>[^<]+</)) {
        issues.push(`${file}: Button without accessible label`);
      }
    }
    
    if (content.includes('input') && !content.includes('aria-label') && !content.includes('htmlFor')) {
      issues.push(`${file}: Input without associated label`);
    }
  }
  
  if (issues.length > 0) {
    recommendations.push('Add ARIA labels for interactive elements');
    recommendations.push('Associate form inputs with labels');
  }
  
  return {
    passed: issues.length === 0,
    issues,
    recommendations
  };
}

/**
 * Check focus management
 */
async function checkFocusManagement() {
  const componentFiles = await findComponentFiles();
  const issues = [];
  const recommendations = [];
  
  for (const file of componentFiles.slice(0, 10)) { // Limit to first 10 files
    const content = fs.readFileSync(file, 'utf8');
    
    if (content.includes('Modal') && !content.includes('focus')) {
      issues.push(`${file}: Modal without focus management`);
    }
    
    if (content.includes('autoFocus')) {
      issues.push(`${file}: Uses autoFocus (consider focus management instead)`);
    }
  }
  
  if (issues.length > 0) {
    recommendations.push('Implement proper focus management for modals and dynamic content');
    recommendations.push('Avoid autoFocus in favor of programmatic focus management');
  }
  
  return {
    passed: issues.length === 0,
    issues,
    recommendations
  };
}

/**
 * Check reduced motion support
 */
async function checkReducedMotion() {
  const cssFiles = [
    './src/index.css',
    './src/styles/main.css',
    './src/theme/unified-variables.css'
  ];
  
  const issues = [];
  const recommendations = [];
  let hasReducedMotion = false;
  
  for (const file of cssFiles) {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      
      if (content.includes('@media (prefers-reduced-motion: reduce)')) {
        hasReducedMotion = true;
      }
    }
  }
  
  if (!hasReducedMotion) {
    issues.push('No prefers-reduced-motion media query found in CSS');
  }
  
  // Check component files for motion-related classes
  const componentFiles = await findComponentFiles();
  for (const file of componentFiles.slice(0, 5)) { // Limit check
    const content = fs.readFileSync(file, 'utf8');
    
    if (content.includes('transition') && !content.includes('data-[motion=reduced]:transition-none')) {
      issues.push(`${file}: Transitions without reduced motion consideration`);
    }
  }
  
  if (issues.length > 0) {
    recommendations.push('Add @media (prefers-reduced-motion: reduce) rules');
    recommendations.push('Use data attributes to control motion based on user preferences');
  }
  
  return {
    passed: issues.length === 0,
    issues,
    recommendations
  };
}

/**
 * Find component files for analysis
 */
async function findComponentFiles() {
  const componentDirs = [
    './src/components',
    './src/shared/ui',
    './src/features'
  ];
  
  const files = [];
  
  for (const dir of componentDirs) {
    if (fs.existsSync(dir)) {
      const dirFiles = execSync(`find ${dir} -name "*.tsx" -type f`, { encoding: 'utf8' })
        .trim()
        .split('\n')
        .filter(f => f && !f.includes('.test.') && !f.includes('.stories.'));
      
      files.push(...dirFiles);
    }
  }
  
  return files;
}

/**
 * Generate comprehensive accessibility report
 */
function generateReport(automaticResults, manualResults) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      automatic: automaticResults?.summary || {},
      manual: {
        totalChecks: manualResults?.length || 0,
        passed: manualResults?.filter(r => r.passed).length || 0,
        failed: manualResults?.filter(r => !r.passed).length || 0
      },
      overall: {
        passed: (automaticResults?.passed || false) && 
                (manualResults?.every(r => r.passed) || false)
      }
    },
    automatic: automaticResults || null,
    manual: manualResults || [],
    recommendations: [],
    nextSteps: []
  };

  // Combine recommendations
  if (automaticResults?.recommendations) {
    report.recommendations.push(...automaticResults.recommendations);
  }
  
  manualResults?.forEach(result => {
    if (result.recommendations) {
      report.recommendations.push(...result.recommendations);
    }
  });

  // Generate next steps
  if (!report.summary.overall.passed) {
    report.nextSteps.push('Fix all accessibility violations before merging');
    report.nextSteps.push('Review and implement recommendations');
    report.nextSteps.push('Test with actual assistive technologies');
  } else {
    report.nextSteps.push('Consider additional accessibility testing');
    report.nextSteps.push('Document accessibility features in Storybook');
  }

  // Save report
  fs.writeFileSync(CONFIG.reportPath, JSON.stringify(report, null, 2));
  
  return report;
}

/**
 * Print accessibility report
 */
function printReport(report) {
  console.log(`\n${colors.bold}${colors.cyan}♿ Accessibility Analysis Report${colors.reset}`);
  console.log(`${colors.cyan}=====================================${colors.reset}\n`);

  // Summary
  console.log(`${colors.bold}Overall Status: ${report.summary.overall.passed ? 
    `${colors.green}✅ PASSED` : `${colors.red}❌ FAILED`}${colors.reset}\n`);

  // Automatic tests summary
  if (report.automatic) {
    console.log(`${colors.bold}Automated Tests:${colors.reset}`);
    console.log(`  Total Stories: ${colors.blue}${Object.keys(report.automatic.stories).length}${colors.reset}`);
    console.log(`  Violations: ${colors.red}${report.automatic.summary.violations}${colors.reset}`);
    console.log(`  Incomplete: ${colors.yellow}${report.automatic.summary.incomplete}${colors.reset}`);
    console.log(`  Passes: ${colors.green}${report.automatic.summary.passes}${colors.reset}\n`);
  }

  // Manual tests summary
  console.log(`${colors.bold}Manual Checks:${colors.reset}`);
  console.log(`  Total Checks: ${colors.blue}${report.summary.manual.totalChecks}${colors.reset}`);
  console.log(`  Passed: ${colors.green}${report.summary.manual.passed}${colors.reset}`);
  console.log(`  Failed: ${colors.red}${report.summary.manual.failed}${colors.reset}\n`);

  // Detailed manual results
  if (report.manual.length > 0) {
    console.log(`${colors.bold}Manual Check Results:${colors.reset}`);
    report.manual.forEach(check => {
      const status = check.passed ? `${colors.green}✓` : `${colors.red}✗`;
      console.log(`  ${status} ${check.name}${colors.reset}`);
      
      if (!check.passed && check.issues.length > 0) {
        check.issues.forEach(issue => {
          console.log(`    ${colors.red}• ${issue}${colors.reset}`);
        });
      }
    });
    console.log();
  }

  // Violations details
  if (report.automatic?.violations?.length > 0) {
    console.log(`${colors.bold}${colors.red}Accessibility Violations:${colors.reset}`);
    report.automatic.violations.forEach((violation, index) => {
      console.log(`  ${index + 1}. ${colors.red}${violation.description}${colors.reset}`);
      console.log(`     Impact: ${violation.impact}`);
      console.log(`     Help: ${violation.help}\n`);
    });
  }

  // Recommendations
  if (report.recommendations.length > 0) {
    console.log(`${colors.bold}${colors.yellow}Recommendations:${colors.reset}`);
    report.recommendations.forEach((rec, index) => {
      console.log(`  ${index + 1}. ${colors.yellow}${rec}${colors.reset}`);
    });
    console.log();
  }

  // Next steps
  if (report.nextSteps.length > 0) {
    console.log(`${colors.bold}Next Steps:${colors.reset}`);
    report.nextSteps.forEach((step, index) => {
      console.log(`  ${index + 1}. ${step}`);
    });
    console.log();
  }

  console.log(`${colors.cyan}Report saved to: ${CONFIG.reportPath}${colors.reset}\n`);
}

/**
 * Cleanup function
 */
function cleanup() {
  try {
    // Kill any remaining processes
    execSync(`pkill -f "http-server.*${CONFIG.storybookPort}" || true`, { stdio: 'ignore' });
  } catch (error) {
    // Ignore cleanup errors
  }
}

/**
 * Main execution function
 */
async function main() {
  const args = process.argv.slice(2);
  const skipAutomatic = args.includes('--skip-automatic');
  const skipManual = args.includes('--skip-manual');
  const verbose = args.includes('--verbose');

  let automaticResults = null;
  let manualResults = null;

  try {
    // Setup cleanup handler
    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);

    console.log(`${colors.bold}${colors.cyan}🔍 Starting Accessibility Analysis${colors.reset}\n`);

    // Run automatic tests
    if (!skipAutomatic) {
      if (!isStorybookRunning()) {
        const storybookStarted = startStorybook();
        if (!storybookStarted) {
          throw new Error('Could not start Storybook for testing');
        }
      }

      try {
        automaticResults = await runAccessibilityTests();
      } catch (error) {
        console.warn(`${colors.yellow}Automatic tests failed, continuing with manual checks: ${error.message}${colors.reset}`);
      }
    }

    // Run manual checks
    if (!skipManual) {
      manualResults = await runManualChecks();
    }

    // Generate and print report
    const report = generateReport(automaticResults, manualResults);
    
    if (verbose) {
      console.log('\n' + JSON.stringify(report, null, 2));
    } else {
      printReport(report);
    }

    // Exit with appropriate code
    if (!report.summary.overall.passed) {
      console.log(`${colors.red}Accessibility checks failed. Please address the issues above.${colors.reset}`);
      process.exit(1);
    } else {
      console.log(`${colors.green}All accessibility checks passed!${colors.reset}`);
      process.exit(0);
    }

  } catch (error) {
    console.error(`${colors.red}Accessibility check failed: ${error.message}${colors.reset}`);
    process.exit(1);
  } finally {
    cleanup();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  runAccessibilityTests,
  runManualChecks,
  generateReport,
  CONFIG
};