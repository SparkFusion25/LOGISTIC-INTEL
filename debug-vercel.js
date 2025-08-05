#!/usr/bin/env node

const https = require('https');
const http = require('http');

// Configuration - USER MUST PROVIDE URL
const VERCEL_URL = process.argv[2];
const TIMEOUT = 10000;

if (!VERCEL_URL) {
  console.log('🚨 ERROR: Please provide your Vercel URL');
  console.log('');
  console.log('Usage:');
  console.log('  node debug-vercel.js https://your-new-deployment.vercel.app');
  console.log('');
  console.log('Example:');
  console.log('  node debug-vercel.js https://logistic-intel-abc123.vercel.app');
  console.log('');
  process.exit(1);
}

console.log('🔍 Vercel Deployment Debug Tool');
console.log('================================');
console.log(`Testing URL: ${VERCEL_URL}\n`);

// Utility function to make HTTP requests with detailed logging
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https');
    const lib = isHttps ? https : http;
    
    const requestOptions = {
      timeout: TIMEOUT,
      headers: {
        'User-Agent': 'Vercel Debug Tool',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        ...options.headers
      },
      ...options
    };

    console.log(`📡 Making request to: ${url}`);

    const req = lib.get(url, requestOptions, (res) => {
      let data = '';
      
      console.log(`📥 Response status: ${res.statusCode}`);
      console.log(`   Response headers:`, res.headers);
      
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`📦 Response body length: ${data.length} bytes`);
        if (data.length < 1000) {
          console.log(`   Body preview: ${data.substring(0, 500)}...`);
        }
        console.log('');
        
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
          url: url
        });
      });
    });

    req.on('error', (error) => {
      console.log(`❌ Request error for ${url}:`, error.message);
      reject(error);
    });
    
    req.on('timeout', () => {
      req.destroy();
      console.log(`⏰ Request timeout for ${url}`);
      reject(new Error('Request timeout'));
    });
  });
}

// Test functions
async function testRootPage() {
  console.log('🏠 Testing Root Page');
  console.log('==================');
  try {
    const response = await makeRequest(VERCEL_URL);
    
    if (response.statusCode === 404) {
      console.log('❌ 404 Error detected on root page');
      if (response.headers['x-vercel-error']) {
        console.log(`   Vercel Error: ${response.headers['x-vercel-error']}`);
      }
      console.log('   This indicates a deployment or configuration issue');
    } else if (response.statusCode >= 300 && response.statusCode < 400) {
      console.log('✅ Redirect detected');
      console.log(`   Redirecting to: ${response.headers.location}`);
    } else if (response.statusCode === 200) {
      console.log('✅ Root page loads successfully');
      if (response.body.includes('Global Trade Intelligence') || response.body.includes('Logistic Intel')) {
        console.log('✅ Contains expected content');
      }
    } else {
      console.log(`⚠️  Unexpected status code: ${response.statusCode}`);
    }
    
    return response;
  } catch (error) {
    console.log('❌ Error testing root page:', error.message);
    return null;
  }
}

async function testLandingPage() {
  console.log('🎯 Testing Landing Page');
  console.log('=======================');
  try {
    const response = await makeRequest(`${VERCEL_URL}/landing`);
    
    if (response.statusCode === 200) {
      console.log('✅ Landing page loads successfully');
      
      // Check for specific content
      if (response.body.includes('Global Trade Intelligence')) {
        console.log('✅ Landing page contains expected content');
      } else {
        console.log('⚠️  Landing page missing expected content');
      }
    } else if (response.statusCode === 404) {
      console.log(`❌ Landing page not found: ${response.statusCode}`);
      if (response.headers['x-vercel-error']) {
        console.log(`   Vercel Error: ${response.headers['x-vercel-error']}`);
      }
    } else {
      console.log(`❌ Landing page error: ${response.statusCode}`);
    }
    
    return response;
  } catch (error) {
    console.log('❌ Error testing landing page:', error.message);
    return null;
  }
}

async function testAPIEndpoints() {
  console.log('🔌 Testing API Endpoints');
  console.log('========================');
  
  const endpoints = [
    '/api/health',
    '/api/dashboard/stats',
    '/api/users',
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`Testing: ${endpoint}`);
      const response = await makeRequest(`${VERCEL_URL}${endpoint}`);
      
      if (response.statusCode === 200) {
        console.log(`✅ ${endpoint} works`);
        try {
          const json = JSON.parse(response.body);
          console.log(`   Returns valid JSON`);
        } catch {
          console.log(`   Returns non-JSON response`);
        }
      } else {
        console.log(`❌ ${endpoint} failed: ${response.statusCode}`);
        if (response.headers['x-vercel-error']) {
          console.log(`   Vercel Error: ${response.headers['x-vercel-error']}`);
        }
      }
    } catch (error) {
      console.log(`❌ ${endpoint} error:`, error.message);
    }
  }
}

async function analyzeDeployment() {
  console.log('📋 Deployment Analysis');
  console.log('======================');
  
  try {
    const response = await makeRequest(VERCEL_URL);
    
    console.log('Deployment information:');
    console.log(`  Server: ${response.headers.server || 'Not specified'}`);
    console.log(`  X-Vercel-Cache: ${response.headers['x-vercel-cache'] || 'Not present'}`);
    console.log(`  X-Vercel-Id: ${response.headers['x-vercel-id'] || 'Not present'}`);
    console.log(`  Content-Type: ${response.headers['content-type'] || 'Not specified'}`);
    
    if (response.headers['x-vercel-error']) {
      console.log(`❌ Vercel Error: ${response.headers['x-vercel-error']}`);
      console.log('   This indicates a deployment configuration issue');
    } else if (response.statusCode === 200 || (response.statusCode >= 300 && response.statusCode < 400)) {
      console.log('✅ Deployment appears to be working');
    }
    
  } catch (error) {
    console.log('❌ Error analyzing deployment:', error.message);
  }
}

// Main execution
async function runDiagnostics() {
  console.log('Starting comprehensive Vercel deployment diagnostics...\n');
  
  // Test all aspects
  await testRootPage();
  await testLandingPage();
  await testAPIEndpoints();
  await analyzeDeployment();
  
  console.log('🎯 Diagnosis Complete');
  console.log('====================');
  console.log('');
  console.log('📋 Interpretation Guide:');
  console.log('• DEPLOYMENT_NOT_FOUND: Project not properly configured');
  console.log('• 404 without Vercel error: App Router routing issue');
  console.log('• 401 errors: Deployment protection enabled');
  console.log('• 200/302 responses: Working correctly');
  console.log('');
  console.log('🔧 Next Steps Based on Results:');
  console.log('1. If DEPLOYMENT_NOT_FOUND: Check project settings and redeploy');
  console.log('2. If 404s: Verify file structure and Next.js configuration');
  console.log('3. If 401s: Disable deployment protection');
  console.log('4. If working: Test user flow manually');
}

// Run diagnostics
runDiagnostics().catch(error => {
  console.error('❌ Diagnostic tool failed:', error);
  process.exit(1);
});