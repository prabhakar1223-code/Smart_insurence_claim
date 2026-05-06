// Test authentication flow
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

async function testAuthFlow() {
  console.log('=== Testing Authentication Flow ===\n');
  
  // Generate unique email for testing
  const timestamp = Date.now();
  const testEmail = `test${timestamp}@example.com`;
  const testPassword = 'password123';
  const testName = 'Test User';
  
  console.log(`Test email: ${testEmail}`);
  console.log(`Test password: ${testPassword}`);
  console.log(`Test name: ${testName}\n`);
  
  // Test 1: Signup
  console.log('1. Testing SIGNUP...');
  try {
    const signupResponse = await fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: testName,
        email: testEmail,
        password: testPassword
      })
    });
    
    const signupData = await signupResponse.json();
    console.log(`   Status: ${signupResponse.status}`);
    console.log(`   Success: ${signupData.success}`);
    console.log(`   Message: ${signupData.message}`);
    
    if (!signupData.success) {
      console.log(`   Error: ${signupData.error}`);
      return;
    }
    
    console.log('   ✓ Signup successful\n');
    
    // Wait a moment for data to be saved
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Test 2: Login with same credentials
    console.log('2. Testing LOGIN with same credentials...');
    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword
      })
    });
    
    const loginData = await loginResponse.json();
    console.log(`   Status: ${loginResponse.status}`);
    console.log(`   Success: ${loginData.success}`);
    console.log(`   Token received: ${!!loginData.token}`);
    
    if (loginData.success) {
      console.log('   ✓ Login successful');
      console.log(`   User: ${loginData.user.name} (${loginData.user.email})`);
    } else {
      console.log(`   ✗ Login failed: ${loginData.error}`);
      console.log(`   Message: ${loginData.message}`);
    }
    
    // Test 3: Try duplicate signup
    console.log('\n3. Testing DUPLICATE SIGNUP (same email)...');
    const duplicateResponse = await fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Another User',
        email: testEmail,
        password: 'differentpassword'
      })
    });
    
    const duplicateData = await duplicateResponse.json();
    console.log(`   Status: ${duplicateResponse.status}`);
    console.log(`   Should be blocked: ${duplicateResponse.status === 400}`);
    console.log(`   Message: ${duplicateData.message || duplicateData.error}`);
    
    if (duplicateResponse.status === 400) {
      console.log('   ✓ Duplicate signup correctly blocked');
    } else {
      console.log('   ✗ Duplicate signup should have been blocked');
    }
    
    // Test 4: Login with wrong password
    console.log('\n4. Testing LOGIN with wrong password...');
    const wrongPassResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'wrongpassword'
      })
    });
    
    const wrongPassData = await wrongPassResponse.json();
    console.log(`   Status: ${wrongPassResponse.status}`);
    console.log(`   Should fail: ${wrongPassResponse.status === 400}`);
    console.log(`   Message: ${wrongPassData.message || wrongPassData.error}`);
    
    if (wrongPassResponse.status === 400) {
      console.log('   ✓ Wrong password correctly rejected');
    } else {
      console.log('   ✗ Wrong password should have been rejected');
    }
    
  } catch (error) {
    console.log(`   ✗ Error: ${error.message}`);
    console.log('   Make sure server is running on port 3000');
  }
  
  console.log('\n=== Test Complete ===');
}

testAuthFlow();