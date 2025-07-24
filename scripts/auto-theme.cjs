#!/usr/bin/env node
/**
 * Auto-Theme Script - Intelligent Dark Mode Converter
 * Automatically adds dark: variants to existing Tailwind classes
 * WITHOUT breaking existing functionality
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// Smart color mappings for light -> dark conversion
const COLOR_MAPPINGS = {
  // Backgrounds
  'bg-white': 'dark:bg-zinc-900',
  'bg-gray-50': 'dark:bg-zinc-950',
  'bg-gray-100': 'dark:bg-zinc-900',
  'bg-gray-200': 'dark:bg-zinc-800',
  'bg-gray-300': 'dark:bg-zinc-700',
  'bg-slate-50': 'dark:bg-zinc-950',
  'bg-slate-100': 'dark:bg-zinc-900',
  'bg-slate-200': 'dark:bg-zinc-800',
  'bg-slate-300': 'dark:bg-zinc-700',
  
  // Text colors
  'text-black': 'dark:text-white',
  'text-gray-900': 'dark:text-white',
  'text-gray-800': 'dark:text-zinc-100',
  'text-gray-700': 'dark:text-zinc-200',
  'text-gray-600': 'dark:text-zinc-300',
  'text-gray-500': 'dark:text-zinc-400',
  'text-gray-400': 'dark:text-zinc-500',
  'text-slate-900': 'dark:text-white',
  'text-slate-800': 'dark:text-zinc-100',
  'text-slate-700': 'dark:text-zinc-200',
  'text-slate-600': 'dark:text-zinc-300',
  'text-slate-500': 'dark:text-zinc-400',
  
  // Borders
  'border-gray-200': 'dark:border-zinc-700',
  'border-gray-300': 'dark:border-zinc-600',
  'border-slate-200': 'dark:border-zinc-700',
  'border-slate-300': 'dark:border-zinc-600',
  'border-white': 'dark:border-zinc-800',
  
  // Opacity variants
  'bg-white/90': 'dark:bg-zinc-950/90',
  'bg-white/80': 'dark:bg-zinc-950/80',
  'bg-gray-50/50': 'dark:bg-zinc-950/50',
  'border-gray-200/50': 'dark:border-zinc-700/50',
  'border-slate-200/50': 'dark:border-zinc-700/50',
};

// Classes to NEVER modify (already have dark variants or are theme-agnostic)
const SKIP_CLASSES = [
  // Already have dark: variants
  /dark:/,
  // Gradients and special effects
  /bg-gradient/,
  /from-/,
  /to-/,
  /via-/,
  // Fixed colors that should stay the same
  /text-white/,
  /bg-zinc/,
  /text-zinc/,
  /border-zinc/,
  // Brand colors
  /text-cyan/,
  /text-blue/,
  /text-purple/,
  /bg-cyan/,
  /bg-blue/,
  /bg-purple/,
  // Shadows and effects
  /shadow-/,
  // Size and spacing
  /w-/,
  /h-/,
  /p-/,
  /m-/,
  /space-/,
  /gap-/,
];

function shouldSkipClass(className) {
  return SKIP_CLASSES.some(pattern => {
    if (pattern instanceof RegExp) {
      return pattern.test(className);
    }
    return className.includes(pattern);
  });
}

function processClassName(className) {
  // Skip if already has dark variant or should be skipped
  if (shouldSkipClass(className)) {
    return className;
  }
  
  // Check if we have a mapping for this class
  const darkVariant = COLOR_MAPPINGS[className];
  if (darkVariant) {
    return `${className} ${darkVariant}`;
  }
  
  return className;
}

function processFile(filePath) {
  console.log(`Processing: ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Find all className attributes (both single and double quotes)
  const classNameRegex = /className=['"`]([^'"`]+)['"`]/g;
  
  content = content.replace(classNameRegex, (match, classes) => {
    const classArray = classes.split(/\s+/).filter(c => c.length > 0);
    const processedClasses = [];
    
    classArray.forEach(className => {
      const processed = processClassName(className);
      if (processed !== className) {
        modified = true;
      }
      processedClasses.push(processed);
    });
    
    // Join classes and maintain original quote style
    const quote = match.includes('"') ? '"' : (match.includes('`') ? '`' : "'");
    return `className=${quote}${processedClasses.join(' ')}${quote}`;
  });
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Modified: ${filePath}`);
    return true;
  } else {
    console.log(`⏭️  No changes needed: ${filePath}`);
    return false;
  }
}

async function main() {
  console.log('🎨 Auto-Theme Script - Adding dark: variants intelligently...\n');
  
  // Find all React/TypeScript files
  const files = await glob('src/**/*.{tsx,jsx,ts,js}', {
    ignore: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/*.test.*',
      '**/*.spec.*'
    ]
  });
  
  console.log(`Found ${files.length} files to process\n`);
  
  let modifiedCount = 0;
  
  for (const file of files) {
    try {
      if (processFile(file)) {
        modifiedCount++;
      }
    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error.message);
    }
  }
  
  console.log(`\n🎉 Complete! Modified ${modifiedCount} files with dark: variants`);
  console.log('\n📝 Next steps:');
  console.log('1. Test your app to make sure nothing broke');
  console.log('2. Adjust any colors that don\'t look right');
  console.log('3. Run: git add . && git commit -m "feat: auto-add dark mode variants"');
}

// Run the script
main().catch(console.error);