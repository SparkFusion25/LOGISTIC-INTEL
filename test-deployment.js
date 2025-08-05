#!/usr/bin/env node

const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';
const TIMEOUT = 10000;

// Test results tracking
let totalTests = 0;
let passedTests = 0;
const results = [];

// Utility function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https');
    const lib = isHttps ? https : http;
    
    const requestOptions = {
      timeout: TIMEOUT,
      headers: {
        'User-Agent': 'Logistic Intel Test Runner',
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    const req = lib.get(url, requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

// Test function
async function runTest(name, testFn) {
  totalTests++;
  console.log(`🧪 Testing: ${name}`);
  
  try {
    const result = await testFn();
    if (result) {
      passedTests++;
      console.log(`✅ PASS: ${name}`);
      results.push({ name, status: 'PASS', message: 'Success' });
    } else {
      console.log(`❌ FAIL: ${name}`);
      results.push({ name, status: 'FAIL', message: 'Test returned false' });
    }
  } catch (error) {
    console.log(`❌ FAIL: ${name} - ${error.message}`);
    results.push({ name, status: 'FAIL', message: error.message });
  }
}

// Individual test functions
async function testHealthEndpoint() {
  const response = await makeRequest(`${BASE_URL}/api/health`);
  return response.statusCode === 200;
}

async function testLandingPage() {
  const response = await makeRequest(`${BASE_URL}/landing`);
  return response.statusCode === 200 && response.body.includes('Global Trade Intelligence');
}

async function testAdminLogin() {
  const response = await makeRequest(`${BASE_URL}/admin/login`);
  return response.statusCode === 200 && response.body.includes('Admin Portal');
}

async function testDashboardAPI() {
  const response = await makeRequest(`${BASE_URL}/api/dashboard/stats`);
  if (response.statusCode !== 200) return false;
  
  try {
    const data = JSON.parse(response.body);
    return data.total_users !== undefined && data.active_campaigns !== undefined;
  } catch {
    return false;
  }
}

async function testUsersAPI() {
  const response = await makeRequest(`${BASE_URL}/api/users`);
  if (response.statusCode !== 200) return false;
  
  try {
    const data = JSON.parse(response.body);
    return Array.isArray(data);
  } catch {
    return false;
  }
}

async function testCampaignsAPI() {
  const response = await makeRequest(`${BASE_URL}/api/campaigns`);
  return response.statusCode === 200;
}

async function testWidgetsAPI() {
  const response = await makeRequest(`${BASE_URL}/api/widgets`);
  return response.statusCode === 200;
}

async function testEmailsAPI() {
  const response = await makeRequest(`${BASE_URL}/api/emails`);
  return response.statusCode === 200;
}

async function testAPIStatusAPI() {
  const response = await makeRequest(`${BASE_URL}/api/api-status`);
  return response.statusCode === 200;
}

async function testFeedbackAPI() {
  const response = await makeRequest(`${BASE_URL}/api/feedback`);
  return response.statusCode === 200;
}

async function testRootRedirect() {
  const response = await makeRequest(`${BASE_URL}/`);
  // Root should either redirect (302/307) or show the fallback page (200)
  return response.statusCode === 200 || response.statusCode === 307 || response.statusCode === 302;
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Logistic Intel Deployment Tests\n');
  console.log(`Testing URL: ${BASE_URL}\n`);

  // Core functionality tests
  await runTest('Health Check API', testHealthEndpoint);
  await runTest('Landing Page Loading', testLandingPage);
  await runTest('Admin Login Page', testAdminLogin);
  await runTest('Root Redirect', testRootRedirect);
  
  // API endpoint tests
  await runTest('Dashboard Stats API', testDashboardAPI);
  await runTest('Users API', testUsersAPI);
  await runTest('Campaigns API', testCampaignsAPI);
  await runTest('Widgets API', testWidgetsAPI);
  await runTest('Emails API', testEmailsAPI);
  await runTest('API Status API', testAPIStatusAPI);
  await runTest('Feedback API', testFeedbackAPI);

  // Results summary
  console.log('\n📊 Test Results Summary');
  console.log('========================');
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${totalTests - passedTests}`);
  console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

  if (passedTests === totalTests) {
    console.log('\n🎉 All tests passed! Deployment is ready.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the issues above.');
    console.log('\nFailed Tests:');
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`  - ${r.name}: ${r.message}`);
    });
  }

  // User journey guide
  console.log('\n🗺️  User Journey Test Guide');
  console.log('============================');
  console.log('1. Visit the deployed URL');
  console.log('2. Should redirect to /landing page');
  console.log('3. Click "Get Started" → Goes to /admin/login');
  console.log('4. Use demo credentials:');
  console.log('   Email: admin@logisticintel.com');
  console.log('   Password: demo123');
  console.log('5. Successfully login → Redirects to /admin/dashboard');
  console.log('6. Navigate through all admin sections');
  console.log('7. Test responsive design on mobile/tablet');
  console.log('8. Verify all charts, tables, and features work');

  console.log('\n✅ Manual Testing Checklist');
  console.log('===========================');
  console.log('□ Landing page animations work');
  console.log('□ Mobile responsive design');
  console.log('□ Admin authentication flow');
  console.log('□ All admin pages load data');
  console.log('□ Charts render properly');
  console.log('□ Tables support search/filter');
  console.log('□ CSV exports function');
  console.log('□ Real-time updates work');
  console.log('□ No console errors');
  console.log('□ Cross-browser compatibility');

  process.exit(passedTests === totalTests ? 0 : 1);
}

// Handle command line arguments
if (process.argv.length > 2) {
  const testUrl = process.argv[2];
  if (testUrl.startsWith('http')) {
    process.env.TEST_URL = testUrl;
    console.log(`Testing URL: ${testUrl}`);
  }
}

// Run the tests
runAllTests().catch(error => {
  console.error('Test runner failed:', error);
  process.exit(1);
});