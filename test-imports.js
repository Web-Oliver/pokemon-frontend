#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Test the import fixing logic on a few files first
function testImportFixes() {
  const testCases = [
    {
      input: "import { something } from '../../../shared/components/atoms/Button';",
      expected: "import { something } from '@/shared/components/atoms/Button';"
    },
    {
      input: "import { api } from '../../app/lib/queryClient';",
      expected: "import { api } from '@/app/lib/queryClient';"
    },
    {
      input: "import { utils } from '../utils/helpers/common';",
      expected: "import { utils } from '@/shared/utils/helpers/common';" // This might need adjustment
    },
    {
      input: "export * from '../../../shared/domain/models/card';",
      expected: "export * from '@/shared/domain/models/card';"
    }
  ];

  console.log('🧪 Testing import transformation logic...');
  
  const pathMappings = {
    '../../../shared/': '@/shared/',
    '../../shared/': '@/shared/',
    '../shared/': '@/shared/',
    '../../../components/': '@/components/',
    '../../components/': '@/components/',
    '../components/': '@/components/',
    '../../../app/': '@/app/',
    '../../app/': '@/app/',
    '../app/': '@/app/',
    '../lib/': '@/lib/',
    '../../lib/': '@/lib/',
    '../../../lib/': '@/lib/',
    '../../../../lib/': '@/lib/',
    '../theme/': '@/theme/',
    '../../theme/': '@/theme/',
    '../../../theme/': '@/theme/',
    '../../../../theme/': '@/theme/',
    '../../../../../theme/': '@/theme/',
  };

  testCases.forEach((testCase, index) => {
    let result = testCase.input;
    
    // Apply the same regex logic as the main script
    const importRegex = /(import|export)([^'"]*from\s+['"])(\.\.\/[^'"]*)(['"])/g;
    const matches = [...testCase.input.matchAll(importRegex)];
    
    for (const match of matches) {
      const fullMatch = match[0];
      const importType = match[1];
      const beforePath = match[2];
      const relativePath = match[3];
      const afterPath = match[4];
      
      let newPath = null;
      
      // Try direct mapping
      for (const [pattern, replacement] of Object.entries(pathMappings)) {
        if (relativePath.startsWith(pattern)) {
          newPath = relativePath.replace(pattern, replacement);
          break;
        }
      }
      
      // Fallback logic for complex cases
      if (!newPath) {
        if (relativePath.includes('/shared/')) {
          const sharedPart = relativePath.substring(relativePath.indexOf('/shared/') + 1);
          newPath = '@/' + sharedPart;
        }
      }
      
      if (newPath) {
        const newImportStatement = importType + beforePath + newPath + afterPath;
        result = result.replace(fullMatch, newImportStatement);
      }
    }
    
    console.log(`Test ${index + 1}:`);
    console.log(`  Input:    ${testCase.input}`);
    console.log(`  Output:   ${result}`);
    console.log(`  Expected: ${testCase.expected}`);
    console.log(`  ✅ ${result === testCase.expected ? 'PASS' : '❌ FAIL'}\n`);
  });
}

// Test on a few real files
function testRealFiles() {
  console.log('📁 Testing on real files...');
  
  const testFiles = [
    'src/features/auction/pages/AuctionDetail.tsx',
    'src/shared/services/UnifiedApiService.ts',
    'src/components/ImageUploader.tsx'
  ].filter(file => fs.existsSync(file));
  
  testFiles.forEach(filePath => {
    console.log(`\n📄 Testing ${filePath}`);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      
      // Find lines with relative imports
      const importLines = lines.filter(line => 
        (line.includes('import') || line.includes('export')) && line.includes('../')
      );
      
      if (importLines.length > 0) {
        console.log(`  Found ${importLines.length} relative import lines:`);
        importLines.slice(0, 3).forEach(line => {
          console.log(`    ${line.trim()}`);
        });
      } else {
        console.log(`  No relative imports found`);
      }
    } else {
      console.log(`  File not found: ${filePath}`);
    }
  });
}

testImportFixes();
testRealFiles();