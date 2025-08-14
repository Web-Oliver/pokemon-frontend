#!/usr/bin/env node

/**
 * Bundle Size Monitor for Pokemon Collection Frontend
 * Monitors bundle size changes and enforces size limits
 * Part of the automated PR checks system
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  maxBundleSize: 500 * 1024, // 500KB
  maxCSSSize: 50 * 1024,     // 50KB
  maxIncrease: 0.05,         // 5% maximum increase
  baselinePath: './bundle-baseline.json',
  distPath: './dist/assets',
  reportPath: './bundle-size-report.json'
};

// ANSI color codes for console output
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
 * Get file size in bytes
 */
function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch (error) {
    return 0;
  }
}

/**
 * Format bytes to human readable format
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get all bundle files from dist directory
 */
function getBundleFiles() {
  const distPath = CONFIG.distPath;
  
  if (!fs.existsSync(distPath)) {
    console.error(`${colors.red}Error: Dist directory not found. Run 'npm run build' first.${colors.reset}`);
    process.exit(1);
  }

  const files = fs.readdirSync(distPath);
  const bundles = {
    js: [],
    css: []
  };

  files.forEach(file => {
    const filePath = path.join(distPath, file);
    
    if (file.endsWith('.js')) {
      bundles.js.push({
        name: file,
        path: filePath,
        size: getFileSize(filePath)
      });
    } else if (file.endsWith('.css')) {
      bundles.css.push({
        name: file,
        path: filePath,
        size: getFileSize(filePath)
      });
    }
  });

  return bundles;
}

/**
 * Calculate total bundle sizes
 */
function calculateTotalSizes(bundles) {
  const totalJS = bundles.js.reduce((sum, file) => sum + file.size, 0);
  const totalCSS = bundles.css.reduce((sum, file) => sum + file.size, 0);
  
  return { totalJS, totalCSS, total: totalJS + totalCSS };
}

/**
 * Load baseline bundle sizes
 */
function loadBaseline() {
  try {
    if (fs.existsSync(CONFIG.baselinePath)) {
      const baseline = JSON.parse(fs.readFileSync(CONFIG.baselinePath, 'utf8'));
      return baseline;
    }
  } catch (error) {
    console.warn(`${colors.yellow}Warning: Could not load baseline. Creating new baseline.${colors.reset}`);
  }
  
  return null;
}

/**
 * Save current bundle sizes as baseline
 */
function saveBaseline(bundles, sizes) {
  const baseline = {
    timestamp: new Date().toISOString(),
    bundles,
    sizes,
    git: {
      commit: getGitCommit(),
      branch: getGitBranch()
    }
  };

  fs.writeFileSync(CONFIG.baselinePath, JSON.stringify(baseline, null, 2));
  console.log(`${colors.green}✓ Baseline saved${colors.reset}`);
}

/**
 * Get current git commit hash
 */
function getGitCommit() {
  try {
    return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
  } catch (error) {
    return 'unknown';
  }
}

/**
 * Get current git branch
 */
function getGitBranch() {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
  } catch (error) {
    return 'unknown';
  }
}

/**
 * Analyze bundle size changes
 */
function analyzeBundleChanges(current, baseline) {
  const analysis = {
    passed: true,
    warnings: [],
    errors: [],
    changes: {
      totalJS: {
        current: current.sizes.totalJS,
        baseline: baseline.sizes.totalJS,
        diff: current.sizes.totalJS - baseline.sizes.totalJS,
        percentChange: ((current.sizes.totalJS - baseline.sizes.totalJS) / baseline.sizes.totalJS) * 100
      },
      totalCSS: {
        current: current.sizes.totalCSS,
        baseline: baseline.sizes.totalCSS,
        diff: current.sizes.totalCSS - baseline.sizes.totalCSS,
        percentChange: ((current.sizes.totalCSS - baseline.sizes.totalCSS) / baseline.sizes.totalCSS) * 100
      },
      total: {
        current: current.sizes.total,
        baseline: baseline.sizes.total,
        diff: current.sizes.total - baseline.sizes.total,
        percentChange: ((current.sizes.total - baseline.sizes.total) / baseline.sizes.total) * 100
      }
    }
  };

  // Check absolute size limits
  if (current.sizes.totalJS > CONFIG.maxBundleSize) {
    analysis.errors.push(`JavaScript bundle size (${formatBytes(current.sizes.totalJS)}) exceeds limit (${formatBytes(CONFIG.maxBundleSize)})`);
    analysis.passed = false;
  }

  if (current.sizes.totalCSS > CONFIG.maxCSSSize) {
    analysis.errors.push(`CSS bundle size (${formatBytes(current.sizes.totalCSS)}) exceeds limit (${formatBytes(CONFIG.maxCSSSize)})`);
    analysis.passed = false;
  }

  // Check percentage increase limits
  if (analysis.changes.total.percentChange > CONFIG.maxIncrease * 100) {
    analysis.errors.push(`Total bundle size increased by ${analysis.changes.total.percentChange.toFixed(2)}% (limit: ${CONFIG.maxIncrease * 100}%)`);
    analysis.passed = false;
  }

  // Add warnings for notable increases
  if (analysis.changes.total.percentChange > 2) {
    analysis.warnings.push(`Total bundle size increased by ${analysis.changes.total.percentChange.toFixed(2)}%`);
  }

  if (analysis.changes.totalJS.percentChange > 2) {
    analysis.warnings.push(`JavaScript bundle size increased by ${analysis.changes.totalJS.percentChange.toFixed(2)}%`);
  }

  if (analysis.changes.totalCSS.percentChange > 2) {
    analysis.warnings.push(`CSS bundle size increased by ${analysis.changes.totalCSS.percentChange.toFixed(2)}%`);
  }

  return analysis;
}

/**
 * Generate bundle size report
 */
function generateReport(current, baseline, analysis) {
  const report = {
    timestamp: new Date().toISOString(),
    git: {
      commit: getGitCommit(),
      branch: getGitBranch()
    },
    current,
    baseline,
    analysis,
    config: CONFIG
  };

  fs.writeFileSync(CONFIG.reportPath, JSON.stringify(report, null, 2));
  return report;
}

/**
 * Print bundle size summary
 */
function printSummary(analysis, current, baseline) {
  console.log(`\n${colors.bold}${colors.cyan}📦 Bundle Size Analysis${colors.reset}`);
  console.log(`${colors.cyan}================================${colors.reset}\n`);

  // Current sizes
  console.log(`${colors.bold}Current Bundle Sizes:${colors.reset}`);
  console.log(`  JavaScript: ${colors.blue}${formatBytes(current.sizes.totalJS)}${colors.reset}`);
  console.log(`  CSS:        ${colors.blue}${formatBytes(current.sizes.totalCSS)}${colors.reset}`);
  console.log(`  Total:      ${colors.blue}${formatBytes(current.sizes.total)}${colors.reset}\n`);

  if (baseline) {
    console.log(`${colors.bold}Changes from Baseline:${colors.reset}`);
    
    const jsChange = analysis.changes.totalJS;
    const cssChange = analysis.changes.totalCSS;
    const totalChange = analysis.changes.total;

    const jsColor = jsChange.diff > 0 ? colors.red : jsChange.diff < 0 ? colors.green : colors.blue;
    const cssColor = cssChange.diff > 0 ? colors.red : cssChange.diff < 0 ? colors.green : colors.blue;
    const totalColor = totalChange.diff > 0 ? colors.red : totalChange.diff < 0 ? colors.green : colors.blue;

    console.log(`  JavaScript: ${jsColor}${jsChange.diff > 0 ? '+' : ''}${formatBytes(jsChange.diff)} (${jsChange.percentChange > 0 ? '+' : ''}${jsChange.percentChange.toFixed(2)}%)${colors.reset}`);
    console.log(`  CSS:        ${cssColor}${cssChange.diff > 0 ? '+' : ''}${formatBytes(cssChange.diff)} (${cssChange.percentChange > 0 ? '+' : ''}${cssChange.percentChange.toFixed(2)}%)${colors.reset}`);
    console.log(`  Total:      ${totalColor}${totalChange.diff > 0 ? '+' : ''}${formatBytes(totalChange.diff)} (${totalChange.percentChange > 0 ? '+' : ''}${totalChange.percentChange.toFixed(2)}%)${colors.reset}\n`);
  }

  // Limits and thresholds
  console.log(`${colors.bold}Limits:${colors.reset}`);
  console.log(`  Max JavaScript: ${colors.magenta}${formatBytes(CONFIG.maxBundleSize)}${colors.reset}`);
  console.log(`  Max CSS:        ${colors.magenta}${formatBytes(CONFIG.maxCSSSize)}${colors.reset}`);
  console.log(`  Max Increase:   ${colors.magenta}${CONFIG.maxIncrease * 100}%${colors.reset}\n`);

  // Warnings
  if (analysis.warnings.length > 0) {
    console.log(`${colors.bold}${colors.yellow}⚠️  Warnings:${colors.reset}`);
    analysis.warnings.forEach(warning => {
      console.log(`  ${colors.yellow}• ${warning}${colors.reset}`);
    });
    console.log();
  }

  // Errors
  if (analysis.errors.length > 0) {
    console.log(`${colors.bold}${colors.red}❌ Errors:${colors.reset}`);
    analysis.errors.forEach(error => {
      console.log(`  ${colors.red}• ${error}${colors.reset}`);
    });
    console.log();
  }

  // Overall status
  if (analysis.passed) {
    console.log(`${colors.bold}${colors.green}✅ Bundle size check PASSED${colors.reset}\n`);
  } else {
    console.log(`${colors.bold}${colors.red}❌ Bundle size check FAILED${colors.reset}\n`);
  }
}

/**
 * Print detailed file breakdown
 */
function printDetailedBreakdown(bundles) {
  console.log(`${colors.bold}Detailed File Breakdown:${colors.reset}`);
  
  if (bundles.js.length > 0) {
    console.log(`\n  ${colors.bold}JavaScript Files:${colors.reset}`);
    bundles.js
      .sort((a, b) => b.size - a.size)
      .forEach(file => {
        console.log(`    ${file.name}: ${colors.blue}${formatBytes(file.size)}${colors.reset}`);
      });
  }

  if (bundles.css.length > 0) {
    console.log(`\n  ${colors.bold}CSS Files:${colors.reset}`);
    bundles.css
      .sort((a, b) => b.size - a.size)
      .forEach(file => {
        console.log(`    ${file.name}: ${colors.blue}${formatBytes(file.size)}${colors.reset}`);
      });
  }
  
  console.log();
}

/**
 * Main execution function
 */
function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    // Build the project if not already built
    if (!fs.existsSync(CONFIG.distPath)) {
      console.log(`${colors.yellow}Building project...${colors.reset}`);
      execSync('npm run build', { stdio: 'inherit' });
    }

    const bundles = getBundleFiles();
    const sizes = calculateTotalSizes(bundles);
    const current = { bundles, sizes };

    if (command === 'baseline') {
      // Save current as baseline
      saveBaseline(bundles, sizes);
      printDetailedBreakdown(bundles);
      return;
    }

    if (command === 'details') {
      // Show detailed breakdown only
      printDetailedBreakdown(bundles);
      return;
    }

    // Load baseline and analyze changes
    const baseline = loadBaseline();
    
    if (!baseline) {
      console.log(`${colors.yellow}No baseline found. Creating baseline from current build.${colors.reset}`);
      saveBaseline(bundles, sizes);
      printDetailedBreakdown(bundles);
      return;
    }

    const analysis = analyzeBundleChanges(current, baseline);
    const report = generateReport(current, baseline, analysis);

    printSummary(analysis, current, baseline);
    
    if (command === 'verbose') {
      printDetailedBreakdown(bundles);
    }

    console.log(`${colors.cyan}Report saved to: ${CONFIG.reportPath}${colors.reset}\n`);

    // Exit with error code if checks failed
    if (!analysis.passed) {
      process.exit(1);
    }

  } catch (error) {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  getBundleFiles,
  calculateTotalSizes,
  analyzeBundleChanges,
  generateReport,
  formatBytes
};