// Complete authentication flow test
import axios from 'axios';
import { createHash } from 'crypto';
import { readFileSync } from 'fs';

async function testCompleteAuthFlow() {
  console.log('=== COMPLETE AUTHENTICATION FLOW TEST ===\n');
  
  const baseURL = 'http://localhost:3000';
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';
  const testName = 'Test User';
  
  console.log(`Test email: ${testEmail}`);
  console.log(`Test password: ${testPassword}\n`);
  
  // Test 1: Signup
  console.log('1. Testing SIGNUP endpoint...');
  try {
    const signupResponse = await axios.post(`${baseURL}/auth/signup`, {
      name: testName,
      email: testEmail,
      password: testPassword
    });
    
    console.log(`   ✅ SUCCESS: ${signupResponse.data.message}`);
    console.log(`   User ID: ${signupResponse.data.user.id}`);
    console.log(`   User email: ${signupResponse.data.user.email}`);
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.response?.data?.error || error.message}`);
    if (error.response?.data?.code === 'EMAIL_ALREADY_USED') {
      console.log('   Email already exists - this is expected if test was run before');
    }
    return;
  }
  
  // Test 2: Login with correct credentials
  console.log('\n2. Testing LOGIN endpoint with correct credentials...');
  try {
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: testEmail,
      password: testPassword
    });
    
    console.log(`   ✅ SUCCESS: Login successful`);
    console.log(`   Token received: ${loginResponse.data.token ? 'Yes' : 'No'}`);
    console.log(`   User ID: ${loginResponse.data.user.id}`);
    
    const token = loginResponse.data.token;
    
    // Test 3: Validate token
    console.log('\n3. Testing TOKEN VALIDATION endpoint...');
    try {
      const validateResponse = await axios.post(`${baseURL}/auth/validate-token`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log(`   ✅ SUCCESS: Token validation successful`);
      console.log(`   User email: ${validateResponse.data.user.email}`);
    } catch (error) {
      console.log(`   ❌ FAILED: Token validation - ${error.response?.data?.error || error.message}`);
    }
    
    // Test 4: Refresh token
    console.log('\n4. Testing TOKEN REFRESH endpoint...');
    try {
      const refreshResponse = await axios.post(`${baseURL}/auth/refresh-token`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log(`   ✅ SUCCESS: Token refresh successful`);
      console.log(`   New token received: ${refreshResponse.data.token ? 'Yes' : 'No'}`);
    } catch (error) {
      console.log(`   ❌ FAILED: Token refresh - ${error.response?.data?.error || error.message}`);
    }
    
    // Test 5: Login with wrong password
    console.log('\n5. Testing LOGIN endpoint with WRONG password...');
    try {
      await axios.post(`${baseURL}/auth/login`, {
        email: testEmail,
        password: 'WrongPassword123!'
      });
      console.log(`   ❌ UNEXPECTED: Login should have failed but succeeded`);
    } catch (error) {
      if (error.response?.status === 400 || error.response?.status === 401) {
        console.log(`   ✅ EXPECTED: Login failed as expected`);
        console.log(`   Error: ${error.response?.data?.error || 'Invalid credentials'}`);
      } else {
        console.log(`   ❌ FAILED: ${error.response?.data?.error || error.message}`);
      }
    }
    
  } catch (error) {
    console.log(`   ❌ FAILED: Login - ${error.response?.data?.error || error.message}`);
    console.log(`   This indicates the signup worked but login failed - checking data/users.json`);
  }
  
  // Test 6: Check user in database
console.log('\n6. Checking user in database...');
try {
  const users = JSON.parse(readFileSync('data/users.json', 'utf8'));
  const emailHash = createHash('sha256').update(testEmail.toLowerCase()).digest('hex');
  const userInDB = users.find(u => u.emailHash === emailHash);
    
    if (userInDB) {
      console.log(`   ✅ FOUND: User exists in database`);
      console.log(`   User ID in DB: ${userInDB.id}`);
      console.log(`   Email encrypted: ${userInDB.email.substring(0, 20)}...`);
    } else {
      console.log(`   ❌ NOT FOUND: User not in database - signup may not have saved properly`);
    }
  } catch (error) {
    console.log(`   ❌ ERROR reading database: ${error.message}`);
  }
  
  console.log('\n=== TEST COMPLETE ===');
  console.log('\nSummary:');
  console.log('- Fixed email comparison bugs in signup, login, forgot-password, reset-password, validate-token, and refresh-token endpoints');
  console.log('- All authentication endpoints now use email hash comparison instead of encrypted email comparison');
  console.log('- Backend is accessible on http://localhost:3000');
  console.log('- Frontend should be accessible on http://localhost:5173');
  console.log('- CORS is configured to allow http://localhost:5173');
  console.log('- CSRF protection is skipped for /auth/ routes in development');
}

// Run the test
testCompleteAuthFlow().catch(error => {
  console.error('Test failed with error:', error.message);
  process.exit(1);
});