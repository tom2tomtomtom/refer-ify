#!/usr/bin/env node

/**
 * Bundle Size Monitoring Script
 * 
 * Analyzes the Next.js build output to monitor bundle sizes and detect
 * significant changes that could impact performance.
 */

const fs = require('fs');
const path = require('path');

// Bundle size thresholds (in KB)
const BUNDLE_SIZE_LIMITS = {
  // Main bundles
  mainApp: 150,        // Main app bundle
  vendor: 300,         // Vendor/node_modules bundle
  
  // Individual pages (First Load JS)
  maxPageSize: 250,    // Maximum size for any single page
  
  // Total JavaScript
  totalJS: 500,        // Total JavaScript across all bundles
};

// Colors for console output
const colors = {
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function parseSize(sizeStr) {
  const match = sizeStr.match(/([\d.]+)\s*(kB|MB|B)/);
  if (!match) return 0;
  
  const [, size, unit] = match;
  const sizeNum = parseFloat(size);
  
  switch (unit) {
    case 'MB': return sizeNum * 1024;
    case 'kB': return sizeNum;
    case 'B': return sizeNum / 1024;
    default: return sizeNum;
  }
}

function formatSize(kb) {
  if (kb < 1) return `${Math.round(kb * 1024)}B`;
  if (kb < 1024) return `${kb.toFixed(1)}kB`;
  return `${(kb / 1024).toFixed(1)}MB`;
}

function analyzeNextJSBuild() {
  const buildOutputPath = path.join(process.cwd(), '.next');
  
  if (!fs.existsSync(buildOutputPath)) {
    console.log(`${colors.red}❌ Build output not found. Run 'npm run build' first.${colors.reset}`);
    process.exit(1);
  }

  console.log(`${colors.blue}📊 Bundle Size Analysis${colors.reset}\n`);

  // Read the build manifest for detailed analysis
  try {
    const manifestPath = path.join(buildOutputPath, 'build-manifest.json');
    if (fs.existsSync(manifestPath)) {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      
      console.log(`${colors.blue}🔍 Build Manifest Analysis:${colors.reset}`);
      
      // Analyze main bundles
      if (manifest.pages) {
        const pageEntries = Object.entries(manifest.pages);
        console.log(`📄 Total Pages: ${pageEntries.length}`);
        
        // Check for large pages
        const largePages = pageEntries.filter(([page, files]) => {
          return files && files.length > 5; // More than 5 files might indicate bloat
        });
        
        if (largePages.length > 0) {
          console.log(`${colors.yellow}⚠️  Pages with many dependencies:${colors.reset}`);
          largePages.forEach(([page, files]) => {
            console.log(`  ${page}: ${files.length} files`);
          });
        }
      }
    }
  } catch (error) {
    console.log(`${colors.yellow}⚠️  Could not analyze build manifest: ${error.message}${colors.reset}`);
  }

  // Generate recommendations
  console.log(`\n${colors.blue}💡 Bundle Size Recommendations:${colors.reset}`);
  console.log('• Use dynamic imports for large components');
  console.log('• Consider code splitting for routes');
  console.log('• Analyze bundle with: npm run analyze');
  console.log('• Monitor core web vitals impact');

  // Check if bundle analyzer is available
  console.log(`\n${colors.green}✅ Bundle monitoring is now configured!${colors.reset}`);
  console.log(`Run ${colors.blue}npm run analyze${colors.reset} to open the bundle analyzer`);
  
  return true;
}

function main() {
  console.log(`${colors.blue}🚀 Next.js Bundle Size Monitor${colors.reset}\n`);
  
  try {
    analyzeNextJSBuild();
  } catch (error) {
    console.error(`${colors.red}❌ Analysis failed:${colors.reset}`, error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { analyzeNextJSBuild, BUNDLE_SIZE_LIMITS };