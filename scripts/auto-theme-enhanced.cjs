#!/usr/bin/env node
/**
 * Enhanced Auto-Theme Script - Comprehensive Dark Mode Converter
 * Analyzes and adds dark: variants to ALL theme-able Tailwind classes
 * Based on comprehensive component analysis
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// COMPREHENSIVE COLOR MAPPINGS - Based on component analysis
const COLOR_MAPPINGS = {
  // === BACKGROUNDS ===
  // White backgrounds
  'bg-white': 'dark:bg-zinc-900',
  'bg-white/95': 'dark:bg-zinc-900/95',
  'bg-white/90': 'dark:bg-zinc-950/90',
  'bg-white/80': 'dark:bg-zinc-950/80',
  'bg-white/50': 'dark:bg-zinc-950/50',
  
  // Gray backgrounds
  'bg-gray-50': 'dark:bg-zinc-950',
  'bg-gray-100': 'dark:bg-zinc-900',
  'bg-gray-200': 'dark:bg-zinc-800',
  'bg-gray-300': 'dark:bg-zinc-700',
  'bg-gray-400': 'dark:bg-zinc-600',
  'bg-gray-500': 'dark:bg-zinc-500',
  'bg-gray-600': 'dark:bg-zinc-400',
  'bg-gray-700': 'dark:bg-zinc-300',
  'bg-gray-800': 'dark:bg-zinc-200',
  'bg-gray-900': 'dark:bg-zinc-100',
  
  // Gray with opacity
  'bg-gray-50/50': 'dark:bg-zinc-950/50',
  'bg-gray-100/80': 'dark:bg-zinc-900/80',
  'bg-gray-200/50': 'dark:bg-zinc-800/50',
  'bg-gray-300/50': 'dark:bg-zinc-700/50',
  
  // Slate backgrounds
  'bg-slate-50': 'dark:bg-zinc-950',
  'bg-slate-100': 'dark:bg-zinc-900',
  'bg-slate-200': 'dark:bg-zinc-800',
  'bg-slate-300': 'dark:bg-zinc-700',
  'bg-slate-400': 'dark:bg-zinc-600',
  'bg-slate-500': 'dark:bg-zinc-500',
  'bg-slate-600': 'dark:bg-zinc-400',
  'bg-slate-700': 'dark:bg-zinc-300',
  'bg-slate-800': 'dark:bg-zinc-200',
  'bg-slate-900': 'dark:bg-zinc-100',
  
  // Slate with opacity
  'bg-slate-50/50': 'dark:bg-zinc-950/50',
  'bg-slate-100/80': 'dark:bg-zinc-900/80',
  'bg-slate-200/50': 'dark:bg-zinc-800/50',
  
  // === TEXT COLORS ===
  // Black/dark text
  'text-black': 'dark:text-white',
  'text-gray-900': 'dark:text-zinc-100',
  'text-gray-800': 'dark:text-zinc-200',
  'text-gray-700': 'dark:text-zinc-300',
  'text-gray-600': 'dark:text-zinc-400',
  'text-gray-500': 'dark:text-zinc-500',
  'text-gray-400': 'dark:text-zinc-600',
  'text-gray-300': 'dark:text-zinc-700',
  
  // Slate text
  'text-slate-900': 'dark:text-zinc-100',
  'text-slate-800': 'dark:text-zinc-200',
  'text-slate-700': 'dark:text-zinc-300',
  'text-slate-600': 'dark:text-zinc-400',
  'text-slate-500': 'dark:text-zinc-500',
  'text-slate-400': 'dark:text-zinc-600',
  'text-slate-300': 'dark:text-zinc-700',
  
  // === BORDERS ===
  // White borders
  'border-white': 'dark:border-zinc-700',
  'border-white/50': 'dark:border-zinc-700/50',
  'border-white/20': 'dark:border-zinc-700/20',
  
  // Gray borders
  'border-gray-200': 'dark:border-zinc-700',
  'border-gray-300': 'dark:border-zinc-600',
  'border-gray-400': 'dark:border-zinc-500',
  'border-gray-500': 'dark:border-zinc-400',
  
  // Gray borders with opacity
  'border-gray-200/50': 'dark:border-zinc-700/50',
  'border-gray-300/50': 'dark:border-zinc-600/50',
  'border-gray-200/20': 'dark:border-zinc-700/20',
  
  // Slate borders
  'border-slate-200': 'dark:border-zinc-700',
  'border-slate-300': 'dark:border-zinc-600',
  'border-slate-400': 'dark:border-zinc-500',
  'border-slate-500': 'dark:border-zinc-400',
  
  // Slate borders with opacity
  'border-slate-200/50': 'dark:border-zinc-700/50',
  'border-slate-300/50': 'dark:border-zinc-600/50',
  
  // === RINGS ===
  'ring-gray-200': 'dark:ring-zinc-700',
  'ring-gray-300': 'dark:ring-zinc-600',
  'ring-slate-200': 'dark:ring-zinc-700',
  'ring-slate-300': 'dark:ring-zinc-600',
  
  // === PLACEHOLDER COLORS ===
  'placeholder-gray-400': 'dark:placeholder-zinc-500',
  'placeholder-gray-500': 'dark:placeholder-zinc-400',
  'placeholder-slate-400': 'dark:placeholder-zinc-500',
  'placeholder-slate-500': 'dark:placeholder-zinc-400',
  
  // === DIVIDE COLORS ===
  'divide-gray-200': 'dark:divide-zinc-700',
  'divide-gray-300': 'dark:divide-zinc-600',
  'divide-slate-200': 'dark:divide-zinc-700',
  'divide-slate-300': 'dark:divide-zinc-600',
  
  // === BACKDROP COLORS ===
  'backdrop-blur-sm': 'dark:backdrop-blur-sm',
  'backdrop-blur-md': 'dark:backdrop-blur-md',
  'backdrop-blur-lg': 'dark:backdrop-blur-lg',
  
  // === SPECIAL COMPONENT-SPECIFIC MAPPINGS ===
  // Form inputs and selects
  'bg-gray-50': 'dark:bg-zinc-800',
  'focus:bg-white': 'dark:focus:bg-zinc-900',
  'focus:border-gray-300': 'dark:focus:border-zinc-600',
  
  // Hover states
  'hover:bg-gray-50': 'dark:hover:bg-zinc-800',
  'hover:bg-gray-100': 'dark:hover:bg-zinc-700',
  'hover:text-gray-900': 'dark:hover:text-zinc-100',
  
  // Active states
  'active:bg-gray-100': 'dark:active:bg-zinc-800',
  
  // Modal and overlay backgrounds
  'bg-black/50': 'dark:bg-black/70',
  'bg-white/90': 'dark:bg-zinc-900/90',
  
  // Card and panel backgrounds
  'bg-gray-50': 'dark:bg-zinc-900/50',
  'bg-slate-50': 'dark:bg-zinc-900/50',
};

// Enhanced skip patterns - more comprehensive
const SKIP_CLASSES = [
  // Already have dark: variants
  /dark:/,
  // Gradients and special effects (keep as-is)
  /bg-gradient/,
  /from-/,
  /to-/,
  /via-/,
  // Brand/accent colors (keep consistent)
  /text-cyan|text-blue|text-purple|text-emerald|text-amber|text-orange|text-red|text-green|text-pink|text-yellow|text-indigo|text-violet|text-teal/,
  /bg-cyan|bg-blue|bg-purple|bg-emerald|bg-amber|bg-orange|bg-red|bg-green|bg-pink|bg-yellow|bg-indigo|bg-violet|bg-teal/,
  /border-cyan|border-blue|border-purple|border-emerald|border-amber|border-orange|border-red|border-green|border-pink|border-yellow|border-indigo|border-violet|border-teal/,
  // Already theme-appropriate colors
  /text-white|bg-zinc|text-zinc|border-zinc/,
  // Shadows (context-dependent)
  /shadow-/,
  // Layout classes
  /w-|h-|p-|m-|space-|gap-|flex|grid|absolute|relative|fixed|sticky|top-|bottom-|left-|right-|z-/,
  // Animation and transform
  /animate-|transition|transform|scale|rotate|translate|duration|ease/,
  // Typography
  /font-|text-xs|text-sm|text-base|text-lg|text-xl|text-2xl|text-3xl|text-4xl|text-5xl|text-6xl/,
  // Opacity (usually contextual)
  /opacity-/,
  // Rounded corners
  /rounded/,
];

// Enhanced class detection - handles complex selectors
function shouldSkipClass(className) {
  // Skip empty or single character classes
  if (!className || className.length < 2) return true;
  
  // Skip if matches any skip pattern
  return SKIP_CLASSES.some(pattern => {
    if (pattern instanceof RegExp) {
      return pattern.test(className);
    }
    return className.includes(pattern);
  });
}

// Enhanced processing with state variants
function processClassName(className) {
  // Skip if already has dark variant or should be skipped
  if (shouldSkipClass(className)) {
    return className;
  }
  
  // Handle state variants (hover:, focus:, active:, etc.)
  const stateMatch = className.match(/^(hover|focus|active|disabled|group-hover|group-focus):(.+)$/);
  if (stateMatch) {
    const [, state, baseClass] = stateMatch;
    const darkVariant = COLOR_MAPPINGS[baseClass];
    if (darkVariant) {
      const darkState = darkVariant.replace('dark:', `dark:${state}:`);
      return `${className} ${darkState}`;
    }
  }
  
  // Handle regular classes
  const darkVariant = COLOR_MAPPINGS[className];
  if (darkVariant) {
    return `${className} ${darkVariant}`;
  }
  
  return className;
}

// Enhanced file processing with better regex
function processFile(filePath) {
  console.log(`Processing: ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Enhanced regex to handle all className patterns including template literals
  const patterns = [
    // Standard className with quotes
    /className=['"`]([^'"`]+)['"`]/g,
    // Template literal className
    /className=\{`([^`]+)`\}/g,
    // Conditional className
    /className=\{[^}]*['"`]([^'"`]+)['"`][^}]*\}/g
  ];
  
  patterns.forEach(regex => {
    content = content.replace(regex, (match, classes) => {
      if (!classes) return match;
      
      const classArray = classes.split(/\s+/).filter(c => c.length > 0);
      const processedClasses = [];
      
      classArray.forEach(className => {
        const processed = processClassName(className);
        if (processed !== className) {
          modified = true;
        }
        processedClasses.push(processed);
      });
      
      // Reconstruct the match with processed classes
      return match.replace(classes, processedClasses.join(' '));
    });
  });
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Enhanced: ${filePath}`);
    return true;
  } else {
    console.log(`⏭️  No changes needed: ${filePath}`);
    return false;
  }
}

async function main() {
  console.log('🎨 Enhanced Auto-Theme Script - Comprehensive Dark Mode Implementation...\n');
  
  // Find all React/TypeScript files
  const files = await glob('src/**/*.{tsx,jsx,ts,js}', {
    ignore: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/*.test.*',
      '**/*.spec.*',
      '**/auto-theme*.cjs'
    ]
  });
  
  console.log(`Found ${files.length} files to process`);
  console.log(`Using ${Object.keys(COLOR_MAPPINGS).length} color mappings\n`);
  
  let modifiedCount = 0;
  const modifiedFiles = [];
  
  for (const file of files) {
    try {
      if (processFile(file)) {
        modifiedCount++;
        modifiedFiles.push(file);
      }
    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error.message);
    }
  }
  
  console.log(`\n🎉 Enhanced Complete! Modified ${modifiedCount} files with comprehensive dark: variants`);
  
  if (modifiedFiles.length > 0) {
    console.log('\n📄 Modified files:');
    modifiedFiles.forEach(file => console.log(`  - ${file}`));
  }
  
  console.log('\n📝 Next steps:');
  console.log('1. Test your app thoroughly in both light and dark modes');
  console.log('2. Check theme toggle functionality');
  console.log('3. Adjust any colors that need fine-tuning');
  console.log('4. Commit changes: git add . && git commit -m "feat: comprehensive dark mode support"');
  
  console.log(`\n📊 Stats:`);
  console.log(`  - Total files scanned: ${files.length}`);
  console.log(`  - Files modified: ${modifiedCount}`);
  console.log(`  - Color mappings applied: ${Object.keys(COLOR_MAPPINGS).length}`);
}

// Run the enhanced script
main().catch(console.error);