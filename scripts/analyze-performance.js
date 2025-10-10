#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

function formatBytes(bytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

function getDirectorySize(dir) {
  if (!fs.existsSync(dir)) return 0;
  
  let size = 0;
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      size += getDirectorySize(filePath);
    } else {
      size += stats.size;
    }
  }
  
  return size;
}

function analyzeNextJsBuild() {
  console.log(`\n${colors.cyan}${colors.bright}📊 Next.js Build Analysis${colors.reset}`);
  console.log('=' .repeat(50));

  const buildDir = path.join(__dirname, '../frontend/.next');
  
  if (!fs.existsSync(buildDir)) {
    console.log(`${colors.red}❌ Build directory not found. Run 'pnpm build' first.${colors.reset}`);
    return;
  }

  // Analyze .next directory
  const staticDir = path.join(buildDir, 'static');
  const serverDir = path.join(buildDir, 'server');
  const cacheDir = path.join(buildDir, 'cache');
  
  const staticSize = getDirectorySize(staticDir);
  const serverSize = getDirectorySize(serverDir);
  const cacheSize = getDirectorySize(cacheDir);
  const totalSize = getDirectorySize(buildDir);

  console.log(`\n${colors.bright}📁 Build Directory Sizes:${colors.reset}`);
  console.log(`  Total:     ${colors.yellow}${formatBytes(totalSize)}${colors.reset}`);
  console.log(`  Static:    ${colors.green}${formatBytes(staticSize)}${colors.reset}`);
  console.log(`  Server:    ${colors.blue}${formatBytes(serverSize)}${colors.reset}`);
  console.log(`  Cache:     ${colors.dim}${formatBytes(cacheSize)}${colors.reset}`);

  // Analyze build-manifest.json
  const buildManifestPath = path.join(buildDir, 'build-manifest.json');
  if (fs.existsSync(buildManifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(buildManifestPath, 'utf-8'));
    const pageCount = Object.keys(manifest.pages || {}).length;
    console.log(`\n${colors.bright}📄 Pages:${colors.reset} ${pageCount}`);
  }

  // Check for large chunks
  const chunksDir = path.join(staticDir, 'chunks');
  if (fs.existsSync(chunksDir)) {
    const chunks = fs.readdirSync(chunksDir)
      .filter(file => file.endsWith('.js'))
      .map(file => {
        const filePath = path.join(chunksDir, file);
        return {
          name: file,
          size: fs.statSync(filePath).size
        };
      })
      .sort((a, b) => b.size - a.size);

    console.log(`\n${colors.bright}📦 Largest Chunks:${colors.reset}`);
    chunks.slice(0, 5).forEach(chunk => {
      const sizeStr = formatBytes(chunk.size);
      const color = chunk.size > 500000 ? colors.red : 
                    chunk.size > 200000 ? colors.yellow : 
                    colors.green;
      console.log(`  ${chunk.name.substring(0, 30).padEnd(30)} ${color}${sizeStr}${colors.reset}`);
    });
  }
}

function analyzeBackendBuild() {
  console.log(`\n${colors.cyan}${colors.bright}🔧 Backend Build Analysis${colors.reset}`);
  console.log('=' .repeat(50));

  const distDir = path.join(__dirname, '../backend/dist');
  
  if (!fs.existsSync(distDir)) {
    console.log(`${colors.red}❌ Backend dist directory not found. Run 'pnpm build' first.${colors.reset}`);
    return;
  }

  const distSize = getDirectorySize(distDir);
  console.log(`\n${colors.bright}📁 Backend Build Size:${colors.reset} ${colors.yellow}${formatBytes(distSize)}${colors.reset}`);

  // Count compiled files
  let fileCount = 0;
  function countFiles(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);
      if (stats.isDirectory()) {
        countFiles(filePath);
      } else if (file.endsWith('.js')) {
        fileCount++;
      }
    }
  }
  countFiles(distDir);
  console.log(`${colors.bright}📄 Compiled Files:${colors.reset} ${fileCount}`);
}

function checkCacheHeaders() {
  console.log(`\n${colors.cyan}${colors.bright}🚀 Performance Optimizations${colors.reset}`);
  console.log('=' .repeat(50));

  const checks = [
    { 
      name: 'Compression (gzip/brotli)', 
      file: 'frontend/next.config.js',
      search: 'compress: true',
      found: false
    },
    {
      name: 'Image Optimization',
      file: 'frontend/next.config.js',
      search: 'images:',
      found: false
    },
    {
      name: 'Bundle Splitting',
      file: 'frontend/next.config.js',
      search: 'splitChunks',
      found: false
    },
    {
      name: 'Cache Headers',
      file: 'frontend/middleware.ts',
      search: 'Cache-Control',
      found: false
    },
    {
      name: 'Backend Compression',
      file: 'backend/src/main.ts',
      search: 'compression',
      found: false
    },
    {
      name: 'Backend Caching',
      file: 'backend/src/common/interceptors/cache.interceptor.ts',
      search: 'CacheInterceptor',
      found: false
    }
  ];

  checks.forEach(check => {
    const filePath = path.join(__dirname, '..', check.file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      check.found = content.includes(check.search);
    }
    
    const status = check.found ? 
      `${colors.green}✓ Enabled${colors.reset}` : 
      `${colors.red}✗ Not found${colors.reset}`;
    console.log(`  ${check.name.padEnd(25)} ${status}`);
  });
}

function showPerformanceTips() {
  console.log(`\n${colors.cyan}${colors.bright}💡 Performance Tips${colors.reset}`);
  console.log('=' .repeat(50));
  
  const tips = [
    'Use dynamic imports for heavy components',
    'Enable ISR (Incremental Static Regeneration) for dynamic content',
    'Optimize images with next/image component',
    'Use production builds for testing performance',
    'Enable CDN for static assets',
    'Monitor Core Web Vitals with Lighthouse',
    'Use React.memo() for expensive components',
    'Implement virtual scrolling for long lists'
  ];

  tips.forEach((tip, i) => {
    console.log(`  ${i + 1}. ${tip}`);
  });
}

function runLighthouseCheck() {
  console.log(`\n${colors.cyan}${colors.bright}🔍 Quick Performance Check${colors.reset}`);
  console.log('=' .repeat(50));
  
  try {
    // Check if server is running
    execSync('curl -I http://localhost:3000 2>/dev/null', { encoding: 'utf-8' });
    console.log(`${colors.green}✓ Frontend server is running${colors.reset}`);
    console.log('\nTo run a full Lighthouse audit:');
    console.log(`  ${colors.dim}npx lighthouse http://localhost:3000 --view${colors.reset}`);
  } catch (error) {
    console.log(`${colors.yellow}⚠ Frontend server not running${colors.reset}`);
    console.log('Start the server with: pnpm dev:frontend');
  }
}

// Main execution
console.log(`${colors.bright}${colors.cyan}\n╔════════════════════════════════════════════════╗`);
console.log(`║     🚀 PERFORMANCE ANALYSIS REPORT 🚀         ║`);
console.log(`╚════════════════════════════════════════════════╝${colors.reset}`);

analyzeNextJsBuild();
analyzeBackendBuild();
checkCacheHeaders();
showPerformanceTips();
runLighthouseCheck();

console.log(`\n${colors.bright}${colors.green}✨ Analysis complete!${colors.reset}\n`);